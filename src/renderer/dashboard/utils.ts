import type {
  HardwareReport,
  SystemSnapshot,
} from "../../shared/types";
import type { Language } from "../localization";

export const meter = (value: number) => Math.max(0, Math.min(100, value));

export const displayTime = (
  snapshot?: SystemSnapshot,
  language: Language = "es",
) =>
  snapshot
    ? new Intl.DateTimeFormat(language === "en" ? "en-US" : "es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(snapshot.collectedAt))
    : "—";

export function snapshotFromReport(report: HardwareReport): SystemSnapshot {
  const disks = report.logicalDisks.map((disk) => ({
    name: disk.deviceId,
    sizeGb: disk.sizeGb,
    freeGb: disk.freeGb,
    health: disk.usagePercent > 92 ? ("warning" as const) : ("good" as const),
  }));

  return {
    computerName: report.computerName,
    cpu: {
      name: report.cpu.name,
      usagePercent: report.cpu.usagePercent,
    },
    memory: {
      totalGb: report.memory.totalGb,
      usedGb: report.memory.usedGb,
    },
    gpu: report.gpu.name,
    disks,
    collectedAt: report.collectedAt,
  };
}
