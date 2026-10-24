import type { SystemSnapshot } from "../../shared/types";
import type { CategoryFilter } from "../hardware/HardwareSectionTypes";
import { Icon, type IconName } from "../Icon";
import { meter } from "./utils";

export function MetricsGrid({
  snapshot, memoryPercent, gpuLoad, gpuTemp, onOpenHardware,
}: {
  snapshot?: SystemSnapshot;
  memoryPercent: number;
  gpuLoad?: number;
  gpuTemp?: number;
  onOpenHardware: (category?: CategoryFilter) => void;
}) {
  const disk = snapshot?.disks[0];
  const diskPercent = disk && disk.sizeGb > 0
    ? meter(((disk.sizeGb - disk.freeGb) / disk.sizeGb) * 100)
    : undefined;
  const metrics: Array<{
    category: CategoryFilter; icon: IconName; label: string;
    value: string; unit: string; caption: string; percent?: number;
  }> = [
    {
      category: "cpu", icon: "chip", label: "Procesador",
      value: snapshot?.cpu.usagePercent === undefined ? "—" : String(Math.round(snapshot.cpu.usagePercent)),
      unit: "%", caption: snapshot?.cpu.name ?? "Esperando lectura",
      percent: snapshot?.cpu.usagePercent,
    },
    {
      category: "ram", icon: "pulse", label: "Memoria",
      value: snapshot ? String(snapshot.memory.usedGb) : "—", unit: "GB",
      caption: snapshot ? `de ${snapshot.memory.totalGb} GB · ${Math.round(memoryPercent)}% en uso` : "Esperando lectura",
      percent: snapshot ? memoryPercent : undefined,
    },
    {
      category: "storage", icon: "disk", label: "Almacenamiento",
      value: diskPercent === undefined ? "—" : String(Math.round(diskPercent)), unit: "%",
      caption: disk ? `${disk.name} · ${disk.freeGb} GB disponibles` : "Esperando lectura",
      percent: diskPercent,
    },
    {
      category: "gpu", icon: "grid", label: "Gráficos",
      value: gpuLoad === undefined ? "—" : String(Math.round(gpuLoad)), unit: "%",
      caption: gpuLoad === undefined ? "Uso no disponible" : `${gpuTemp === undefined ? "" : `${gpuTemp} °C · `}${snapshot?.gpu ?? "GPU"}`,
      percent: gpuLoad,
    },
  ];

  return (
    <section className="metrics-grid" aria-label="Métricas del equipo">
      {metrics.map((metric) => (
        <button className="metric-card" key={metric.category}
          onClick={() => onOpenHardware(metric.category)}
          title={`Ver detalles: ${metric.label}`}>
          <span className="metric-heading">
            <span><Icon name={metric.icon} size={16} />{metric.label}</span>
            <Icon name="arrow" size={14} />
          </span>
          <span className="metric-value">{metric.value}<span>{metric.value === "—" ? "" : metric.unit}</span></span>
          <span className="metric-caption" title={metric.caption}>{metric.caption}</span>
          <span className="progress" aria-hidden="true">
            {metric.percent !== undefined && <i style={{ width: `${meter(metric.percent)}%` }} />}
          </span>
          <span className="metric-link">Ver detalles <Icon name="arrow" size={12} /></span>
        </button>
      ))}
    </section>
  );
}
