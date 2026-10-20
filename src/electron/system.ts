import { execFile } from "node:child_process";
import os from "node:os";
import { promisify } from "node:util";
import type {
  DiskSummary,
  GpuStats,
  HardwareReport,
  LogicalDiskInfo,
  PhysicalDiskInfo,
  RamModule,
  SystemSnapshot
} from "../shared/types";

const execFileAsync = promisify(execFile);

export function isSupportedWindowsVersion(release: string): boolean {
  const match = /^10\.0\.(\d+)$/.exec(release);
  if (!match) return false;

  const build = Number(match[1]);
  return (build >= 17763 && build <= 19045) || build >= 22000;
}

export function normalizePowerShellArray<T>(
  value: T | T[] | null | undefined,
): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

export function normalizeCpuUsage(
  value: unknown,
  fallback?: number,
): number | undefined {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;
  const usage = Number.isFinite(parsed) ? parsed : fallback;
  if (usage === undefined) return undefined;
  return Math.max(0, Math.min(100, usage));
}

async function powershellJson<T>(command: string): Promise<T> {
  const { stdout } = await execFileAsync("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    command
  ], { windowsHide: true, maxBuffer: 10 * 1024 * 1024, timeout: 20_000 });
  return JSON.parse(stdout) as T;
}

const toGb = (bytes: number) => Math.round((bytes / 1024 ** 3) * 10) / 10;

interface StaticHardwareCache {
  computerName: string;
  motherboard: {
    manufacturer: string;
    product: string;
    biosVersion: string;
    biosDate: string;
  };
  cpu: {
    name: string;
    cores?: number;
    logicalProcessors?: number;
    maxClockGhz?: number;
    socket: string;
  };
  ramModules: RamModule[];
  gpuStatic: {
    name: string;
    driverVersion: string;
    refreshRate?: number;
    resolution: string;
  };
  physicalDisks: PhysicalDiskInfo[];
  cachedAt: number;
}

let staticCache: StaticHardwareCache | null = null;

async function queryNvidiaSmi(): Promise<Partial<GpuStats> | null> {
  try {
    const { stdout } = await execFileAsync("nvidia-smi", [
      "--query-gpu=temperature.gpu,utilization.gpu,utilization.memory,memory.total,memory.used,power.draw,fan.speed",
      "--format=csv,noheader,nounits"
    ], { windowsHide: true, timeout: 2000 });

    const parts = stdout.trim().split(",").map((s) => s.trim());
    if (parts.length >= 7) {
      return {
        temperatureC: Number.parseFloat(parts[0]) || undefined,
        utilizationPercent: Number.parseFloat(parts[1]) || 0,
        memoryUtilizationPercent: Number.parseFloat(parts[2]) || 0,
        memoryTotalMb: Math.round(Number.parseFloat(parts[3])) || 0,
        memoryUsedMb: Math.round(Number.parseFloat(parts[4])) || 0,
        powerDrawWatts: Number.parseFloat(parts[5]) || undefined,
        fanSpeedPercent: Number.parseFloat(parts[6]) || undefined
      };
    }
  } catch {
    // nvidia-smi not available or non-nvidia system
  }
  return null;
}

async function getStaticHardware(): Promise<StaticHardwareCache> {
  if (staticCache && Date.now() - staticCache.cachedAt < 5 * 60 * 1000) {
    return staticCache;
  }

  const hostname = os.hostname();
  const cpus = os.cpus();
  const fallback: StaticHardwareCache = {
    computerName: hostname,
    motherboard: {
      manufacturer: "Desconocido",
      product: "Placa base del sistema",
      biosVersion: "N/A",
      biosDate: "N/A"
    },
    cpu: {
      name: cpus[0]?.model ?? "CPU no identificada",
      logicalProcessors: cpus.length || undefined,
      socket: "N/A"
    },
    ramModules: [],
    gpuStatic: {
      name: "Adaptador gráfico estándar",
      driverVersion: "N/A",
      resolution: "N/A"
    },
    physicalDisks: [],
    cachedAt: Date.now()
  };

  if (process.platform !== "win32") {
    staticCache = fallback;
    return staticCache;
  }

  try {
    const script = `
$ErrorActionPreference = 'SilentlyContinue';
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1 Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed,SocketDesignation;
$board = Get-CimInstance Win32_BaseBoard | Select-Object -First 1 Manufacturer,Product;
$bios = Get-CimInstance Win32_BIOS | Select-Object -First 1 SMBIOSBIOSVersion,ReleaseDate;
$ram = @(Get-CimInstance Win32_PhysicalMemory | Select-Object BankLabel,Capacity,Speed,Manufacturer,PartNumber);
$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1 Name,DriverVersion,CurrentRefreshRate,VideoModeDescription;
$pdisks = @(Get-PhysicalDisk | Select-Object DeviceId,FriendlyName,MediaType,BusType,Size,OperationalStatus,HealthStatus);
[PSCustomObject]@{
  cpu = $cpu;
  board = $board;
  bios = $bios;
  ram = $ram;
  gpu = $gpu;
  pdisks = $pdisks;
} | ConvertTo-Json -Depth 4 -Compress
`;

    const data = await powershellJson<{
      cpu?: { Name?: string; NumberOfCores?: number; NumberOfLogicalProcessors?: number; MaxClockSpeed?: number; SocketDesignation?: string };
      board?: { Manufacturer?: string; Product?: string };
      bios?: { SMBIOSBIOSVersion?: string; ReleaseDate?: string };
      ram?: { BankLabel?: string; Capacity?: number; Speed?: number; Manufacturer?: string; PartNumber?: string } | Array<{ BankLabel?: string; Capacity?: number; Speed?: number; Manufacturer?: string; PartNumber?: string }>;
      gpu?: { Name?: string; DriverVersion?: string; CurrentRefreshRate?: number; VideoModeDescription?: string };
      pdisks?: { DeviceId?: string; FriendlyName?: string; MediaType?: string; BusType?: string; Size?: number; OperationalStatus?: string; HealthStatus?: string } | Array<{ DeviceId?: string; FriendlyName?: string; MediaType?: string; BusType?: string; Size?: number; OperationalStatus?: string; HealthStatus?: string }>;
    }>(script);

    let biosDateClean = "N/A";
    if (data.bios?.ReleaseDate) {
      const match = data.bios.ReleaseDate.match(/\/Date\((\d+)\)\//);
      if (match) {
        biosDateClean = new Date(Number(match[1])).toLocaleDateString("es-ES");
      } else {
        biosDateClean = String(data.bios.ReleaseDate);
      }
    }

    const ramModules: RamModule[] = normalizePowerShellArray(data.ram).map((m) => ({
      bankLabel: m.BankLabel?.trim() || "Slot",
      capacityGb: m.Capacity ? Math.round((Number(m.Capacity) / 1024 ** 3) * 10) / 10 : 0,
      speedMhz: Number(m.Speed) || 0,
      manufacturer: m.Manufacturer?.trim() || "Desconocido",
      partNumber: m.PartNumber?.trim() || ""
    }));

    const physicalDisks: PhysicalDiskInfo[] = normalizePowerShellArray(data.pdisks).map((d) => ({
      deviceId: String(d.DeviceId ?? ""),
      name: d.FriendlyName?.trim() || "Unidad de almacenamiento",
      mediaType: d.MediaType?.trim() || "Desconocido",
      busType: d.BusType?.trim() || "Desconocido",
      sizeGb: d.Size ? toGb(Number(d.Size)) : 0,
      health:
        d.HealthStatus?.toLowerCase() === "healthy"
          ? "good"
          : ["warning", "unhealthy", "lost communication"].includes(
                d.HealthStatus?.toLowerCase() ?? "",
              )
            ? "warning"
            : "unknown",
      operationalStatus: d.OperationalStatus?.trim() || "Desconocido"
    }));

    staticCache = {
      computerName: hostname,
      motherboard: {
        manufacturer: data.board?.Manufacturer?.trim() || fallback.motherboard.manufacturer,
        product: data.board?.Product?.trim() || fallback.motherboard.product,
        biosVersion: data.bios?.SMBIOSBIOSVersion?.trim() || "N/A",
        biosDate: biosDateClean
      },
      cpu: {
        name: data.cpu?.Name?.trim() || fallback.cpu.name,
        cores: Number(data.cpu?.NumberOfCores) || fallback.cpu.cores,
        logicalProcessors: Number(data.cpu?.NumberOfLogicalProcessors) || fallback.cpu.logicalProcessors,
        maxClockGhz: data.cpu?.MaxClockSpeed
          ? Math.round((Number(data.cpu.MaxClockSpeed) / 1000) * 10) / 10
          : undefined,
        socket: data.cpu?.SocketDesignation?.trim() || "N/A"
      },
      ramModules,
      gpuStatic: {
        name: data.gpu?.Name?.trim() || fallback.gpuStatic.name,
        driverVersion: data.gpu?.DriverVersion?.trim() || "N/A",
        refreshRate: Number(data.gpu?.CurrentRefreshRate) || undefined,
        resolution: data.gpu?.VideoModeDescription?.trim() || "N/A"
      },
      physicalDisks,
      cachedAt: Date.now()
    };
  } catch (error) {
    console.error("Failed to collect static hardware data:", error);
    staticCache = fallback;
  }

  return staticCache;
}

let lastCpuMeasure = { idle: 0, total: 0 };
function getCpuUsageQuick(): number | undefined {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      total += (cpu.times as Record<string, number>)[type];
    }
    idle += cpu.times.idle;
  }
  if (lastCpuMeasure.total === 0) {
    lastCpuMeasure = { idle, total };
    return undefined;
  }
  const diffIdle = idle - lastCpuMeasure.idle;
  const diffTotal = total - lastCpuMeasure.total;
  lastCpuMeasure = { idle, total };
  if (diffTotal <= 0) return undefined;
  const usage = Math.round((1 - diffIdle / diffTotal) * 100);
  return normalizeCpuUsage(usage);
}

export async function getHardwareReport(): Promise<HardwareReport> {
  const staticDataPromise = getStaticHardware();
  const nvidiaStatsPromise = queryNvidiaSmi();
  const collectedAt = new Date().toISOString();

  // Dynamic values
  const totalMemBytes = os.totalmem();
  const freeMemBytes = os.freemem();
  const usedMemBytes = totalMemBytes - freeMemBytes;
  const memUsagePercent = Math.round((usedMemBytes / totalMemBytes) * 100);

  let cpuUsage = getCpuUsageQuick();
  let currentClockGhz: number | undefined;
  let virtualTotalGb: number | undefined;
  let virtualUsedGb: number | undefined;
  let logicalDisks: LogicalDiskInfo[] = [];

  try {
    const dynamicScript = `
$ErrorActionPreference = 'SilentlyContinue';
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1 LoadPercentage,CurrentClockSpeed;
$os = Get-CimInstance Win32_OperatingSystem | Select-Object TotalVirtualMemorySize,FreeVirtualMemory;
$ldisks = @(Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | Select-Object DeviceID,VolumeName,FileSystem,Size,FreeSpace);
[PSCustomObject]@{
  cpu = $cpu;
  os = $os;
  ldisks = $ldisks;
} | ConvertTo-Json -Depth 3 -Compress
`;
    const dyn = await powershellJson<{
      cpu?: { LoadPercentage?: number; CurrentClockSpeed?: number };
      os?: { TotalVirtualMemorySize?: number; FreeVirtualMemory?: number };
      ldisks?: { DeviceID?: string; VolumeName?: string; FileSystem?: string; Size?: number; FreeSpace?: number } | Array<{ DeviceID?: string; VolumeName?: string; FileSystem?: string; Size?: number; FreeSpace?: number }>;
    }>(dynamicScript);

    if (dyn.cpu?.LoadPercentage !== undefined && dyn.cpu.LoadPercentage !== null) {
      cpuUsage = normalizeCpuUsage(dyn.cpu.LoadPercentage, cpuUsage);
    }
    if (dyn.cpu?.CurrentClockSpeed && Number(dyn.cpu.CurrentClockSpeed) > 0) {
      currentClockGhz = Math.round((Number(dyn.cpu.CurrentClockSpeed) / 1000) * 10) / 10;
    }
    const totalVirtualMemoryKb = Number(dyn.os?.TotalVirtualMemorySize);
    const freeVirtualMemoryKb = Number(dyn.os?.FreeVirtualMemory);
    if (
      Number.isFinite(totalVirtualMemoryKb) &&
      totalVirtualMemoryKb > 0 &&
      Number.isFinite(freeVirtualMemoryKb) &&
      freeVirtualMemoryKb >= 0
    ) {
      virtualTotalGb = Math.round((totalVirtualMemoryKb / 1024 / 1024) * 10) / 10;
      virtualUsedGb = Math.round(((totalVirtualMemoryKb - freeVirtualMemoryKb) / 1024 / 1024) * 10) / 10;
    }
    if (dyn.ldisks) {
      logicalDisks = normalizePowerShellArray(dyn.ldisks).map((ld) => {
        const sizeGb = ld.Size ? toGb(Number(ld.Size)) : 0;
        const freeGb = ld.FreeSpace ? toGb(Number(ld.FreeSpace)) : 0;
        const usedGb = Math.round((sizeGb - freeGb) * 10) / 10;
        const usagePercent = sizeGb > 0 ? Math.round((usedGb / sizeGb) * 100) : 0;
        return {
          deviceId: ld.DeviceID || "",
          volumeName: ld.VolumeName?.trim() || "",
          fileSystem: ld.FileSystem?.trim() || "NTFS",
          sizeGb,
          freeGb,
          usedGb,
          usagePercent
        };
      });
    }
  } catch (error) {
    console.error("Failed to collect dynamic hardware data:", error);
  }

  const staticData = await staticDataPromise;

  // GPU dynamic stats
  const nvidia = await nvidiaStatsPromise;
  const gpu: GpuStats = {
    name: staticData.gpuStatic.name,
    driverVersion: staticData.gpuStatic.driverVersion,
    refreshRate: staticData.gpuStatic.refreshRate,
    resolution: staticData.gpuStatic.resolution,
    ...(nvidia || {})
  };

  return {
    computerName: staticData.computerName,
    motherboard: staticData.motherboard,
    cpu: {
      name: staticData.cpu.name,
      cores: staticData.cpu.cores,
      logicalProcessors: staticData.cpu.logicalProcessors,
      maxClockGhz: staticData.cpu.maxClockGhz,
      currentClockGhz,
      socket: staticData.cpu.socket,
      usagePercent: cpuUsage,
    },
    memory: {
      totalGb: toGb(totalMemBytes),
      usedGb: toGb(usedMemBytes),
      freeGb: toGb(freeMemBytes),
      usagePercent: memUsagePercent,
      ...(virtualTotalGb !== undefined ? { virtualTotalGb } : {}),
      ...(virtualUsedGb !== undefined ? { virtualUsedGb } : {}),
      modules: staticData.ramModules
    },
    gpu,
    physicalDisks: staticData.physicalDisks,
    logicalDisks,
    collectedAt
  };
}

export async function getSystemSnapshot(): Promise<SystemSnapshot> {
  const report = await getHardwareReport();
  const disksSummary: DiskSummary[] = report.logicalDisks.map((d) => ({
    name: d.deviceId,
    sizeGb: d.sizeGb,
    freeGb: d.freeGb,
    health: d.usagePercent > 92 ? "warning" : "good"
  }));

  return {
    computerName: report.computerName,
    cpu: {
      name: report.cpu.name,
      usagePercent: report.cpu.usagePercent
    },
    memory: {
      totalGb: report.memory.totalGb,
      usedGb: report.memory.usedGb
    },
    gpu: report.gpu.name,
    disks: disksSummary,
    collectedAt: report.collectedAt
  };
}
