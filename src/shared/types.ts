export type Health = "good" | "warning" | "unknown";

export interface DiskSummary {
  name: string;
  sizeGb: number;
  freeGb: number;
  health: Health;
}

export interface SystemSnapshot {
  computerName: string;
  cpu: { name: string; usagePercent?: number };
  memory: { totalGb: number; usedGb: number };
  gpu: string;
  disks: DiskSummary[];
  collectedAt: string;
}

export interface RamModule {
  bankLabel: string;
  capacityGb: number;
  speedMhz: number;
  manufacturer: string;
  partNumber: string;
}

export interface GpuStats {
  name: string;
  driverVersion?: string;
  refreshRate?: number;
  resolution?: string;
  temperatureC?: number;
  utilizationPercent?: number;
  memoryUtilizationPercent?: number;
  memoryTotalMb?: number;
  memoryUsedMb?: number;
  powerDrawWatts?: number;
  fanSpeedPercent?: number;
}

export interface PhysicalDiskInfo {
  deviceId: string;
  name: string;
  mediaType: string;
  busType: string;
  sizeGb: number;
  health: Health;
  operationalStatus: string;
}

export interface LogicalDiskInfo {
  deviceId: string;
  volumeName: string;
  fileSystem: string;
  sizeGb: number;
  freeGb: number;
  usedGb: number;
  usagePercent: number;
}

export interface HardwareReport {
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
    currentClockGhz?: number;
    socket: string;
    usagePercent?: number;
    temperatureC?: number;
  };
  memory: {
    totalGb: number;
    usedGb: number;
    freeGb: number;
    usagePercent: number;
    virtualTotalGb?: number;
    virtualUsedGb?: number;
    modules: RamModule[];
  };
  gpu: GpuStats;
  physicalDisks: PhysicalDiskInfo[];
  logicalDisks: LogicalDiskInfo[];
  collectedAt: string;
}

export interface CleanupItem {
  label: string;
  path: string;
  sizeMb: number;
  selected: boolean;
}

export interface UpdateNotice {
  version: string;
  downloaded: boolean;
}

export interface UpdateSnapshot {
  notice?: UpdateNotice;
  state: UpdateState;
}

export type UpdateStatus =
  | "idle"
  | "checking"
  | "downloading"
  | "up-to-date"
  | "available"
  | "downloaded"
  | "error"
  | "unsupported";

export interface UpdateState {
  status: UpdateStatus;
  version?: string;
  progress?: number;
  message?: string;
}

export interface ExportFileRequest {
  fileName: string;
  format: "txt" | "csv";
  content: string;
  language: "es" | "en";
}

export type ExportFileResult =
  | { status: "saved" }
  | { status: "cancelled" };
