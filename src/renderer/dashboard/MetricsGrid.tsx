import type { SystemSnapshot } from "../../shared/types";
import { Icon, type IconName } from "../Icon";
import { Sparkline } from "./Charts";
import { meter } from "./utils";

export function MetricsGrid({
  snapshot,
  memoryPercent,
  gpuLoad,
  gpuTemp,
  cpuHistory,
  gpuHistory,
  onOpenHardware,
}: {
  snapshot?: SystemSnapshot;
  memoryPercent: number;
  gpuLoad?: number;
  gpuTemp?: number;
  cpuHistory: number[];
  gpuHistory: number[];
  onOpenHardware: () => void;
}) {
  const disk = snapshot?.disks[0];
  const diskPercent =
    disk && disk.sizeGb > 0
      ? meter(((disk.sizeGb - disk.freeGb) / disk.sizeGb) * 100)
      : 0;

  return (
    <section className="metrics-grid">
      <div
        style={{ cursor: "pointer" }}
        onClick={onOpenHardware}
        title="Ver detalles del procesador"
      >
        <Metric
          icon="chip"
          label="Procesador"
          value={
            snapshot?.cpu.usagePercent === undefined
              ? "—"
              : `${snapshot.cpu.usagePercent}%`
          }
          caption={snapshot?.cpu.name ?? "Leyendo información"}
          percent={snapshot?.cpu.usagePercent ?? 0}
          tone="blue"
          trend={cpuHistory}
        />
      </div>

      <div
        style={{ cursor: "pointer" }}
        onClick={onOpenHardware}
        title="Ver detalles de memoria"
      >
        <Metric
          icon="pulse"
          label="Memoria"
          value={snapshot ? `${snapshot.memory.usedGb} GB` : "—"}
          caption={
            snapshot
              ? `de ${snapshot.memory.totalGb} GB en total`
              : "Leyendo información"
          }
          percent={memoryPercent}
          tone="violet"
        />
      </div>

      <div
        style={{ cursor: "pointer" }}
        onClick={onOpenHardware}
        title="Ver detalles del almacenamiento"
      >
        <Metric
          icon="disk"
          label="Almacenamiento"
          value={disk ? `${diskPercent.toFixed(0)}%` : "—"}
          caption={
            disk ? `${disk.freeGb} GB disponibles` : "Buscando unidades"
          }
          percent={diskPercent}
          tone="mint"
        />
      </div>

      <article
        className="metric-card gpu-card"
        style={{ cursor: "pointer" }}
        onClick={onOpenHardware}
        title="Ver detalles de gráficos"
      >
        <div className="metric-heading">
          <span className="metric-icon orange">
            <span className="gpu-glyph">✦</span>
          </span>
          <span className="metric-menu">
            <Icon name="more" size={17} />
          </span>
        </div>
        <p>Gráficos</p>
        <strong>
          {gpuLoad !== undefined ? `${Math.round(gpuLoad)}%` : "—"}
        </strong>
        <small title={snapshot?.gpu}>
          {gpuTemp !== undefined ? `${gpuTemp} °C · ` : ""}
          {snapshot?.gpu ?? "Leyendo información"}
        </small>
        {gpuHistory.length > 0 ? (
          <Sparkline values={gpuHistory} tone="orange" />
        ) : (
          <small className="metric-unavailable">
            Uso de GPU no disponible
          </small>
        )}
      </article>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
  caption,
  percent,
  tone,
  trend,
}: {
  icon: IconName;
  label: string;
  value: string;
  caption: string;
  percent: number;
  tone: "blue" | "violet" | "mint";
  trend?: number[];
}) {
  return (
    <article className="metric-card">
      <div className="metric-heading">
        <span className={`metric-icon ${tone}`}>
          <Icon name={icon} size={19} />
        </span>
        <span className="metric-menu">
          <Icon name="more" size={17} />
        </span>
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      <small title={caption}>{caption}</small>
      <div className="progress">
        <i className={tone} style={{ width: `${meter(percent)}%` }} />
      </div>
      {trend && <Sparkline values={trend} tone={tone} />}
    </article>
  );
}
