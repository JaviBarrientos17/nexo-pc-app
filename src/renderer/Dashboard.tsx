import { useEffect, useState } from "react";
import type {
  HardwareReport,
  SystemSnapshot,
  UpdateState,
} from "../shared/types";
import type { Language } from "./localization";
import { DashboardHero } from "./dashboard/DashboardHero";
import { HardwareActionPanel } from "./dashboard/HardwareActionPanel";
import { HealthPanel } from "./dashboard/HealthPanel";
import { MetricsGrid } from "./dashboard/MetricsGrid";
import { PerformancePanel } from "./dashboard/PerformancePanel";
import { Icon } from "./Icon";
import { meter } from "./dashboard/utils";

export { meter, snapshotFromReport } from "./dashboard/utils";

export function Dashboard({
  snapshot,
  hardware,
  dataError,
  language,
  memoryPercent,
  updateState,
  onOpenHardware,
}: {
  snapshot?: SystemSnapshot;
  hardware?: HardwareReport;
  dataError: string;
  language: Language;
  memoryPercent: number;
  updateState: UpdateState;
  onOpenHardware: () => void;
}) {
  const cpu = snapshot?.cpu.usagePercent;
  const gpuLoad = hardware?.gpu.utilizationPercent;
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [gpuHistory, setGpuHistory] = useState<number[]>([]);

  useEffect(() => {
    if (!snapshot || snapshot.cpu.usagePercent === undefined) return;
    const usage = snapshot.cpu.usagePercent;
    setCpuHistory((history) =>
      [...history, meter(usage)].slice(-40),
    );
  }, [snapshot?.collectedAt]);

  useEffect(() => {
    if (gpuLoad === undefined) return;
    setGpuHistory((history) => [...history, meter(gpuLoad)].slice(-40));
  }, [hardware?.collectedAt, gpuLoad]);

  const requiresAttention =
    (cpu !== undefined && cpu >= 95) ||
    memoryPercent >= 90 ||
    hardware?.physicalDisks.some(
      (physicalDisk) => physicalDisk.health === "warning",
    ) === true ||
    snapshot?.disks.some(
      (logicalDisk) => logicalDisk.health === "warning",
    ) === true;

  return (
    <>
      <DashboardHero
        snapshot={snapshot}
        dataError={dataError}
        language={language}
        requiresAttention={requiresAttention}
        onOpenHardware={onOpenHardware}
      />
      <MetricsGrid
        snapshot={snapshot}
        memoryPercent={memoryPercent}
        gpuLoad={gpuLoad}
        gpuTemp={hardware?.gpu.temperatureC}
        cpuHistory={cpuHistory}
        gpuHistory={gpuHistory}
        onOpenHardware={onOpenHardware}
      />
      <section className="dashboard-grid">
        <PerformancePanel cpu={cpu} cpuHistory={cpuHistory} />
        <HealthPanel
          hardware={hardware}
          snapshot={snapshot}
          updateState={updateState}
          onOpenHardware={onOpenHardware}
        />
        <HardwareActionPanel onOpenHardware={onOpenHardware} />
      </section>
      <footer className="app-footer">
        <span>
          <Icon name="clock" size={14} /> Datos actualizados automáticamente
        </span>
        <span>Los datos se procesan solo en este equipo</span>
      </footer>
    </>
  );
}
