import { useEffect, useState } from "react";
import type {
  HardwareReport,
  SystemSnapshot,
  UpdateState,
} from "../shared/types";
import type { Language } from "./localization";
import { Icon, type IconName } from "./Icon";

function makeLinePath(
  values: number[],
  width: number,
  height: number,
  padding = 2,
  offsetY = 0,
) {
  if (values.length === 0) return "";
  const plotHeight = height - padding * 2;
  const points = values.map((value, index) => ({
    x: values.length === 1 ? 0 : (index / (values.length - 1)) * width,
    y: offsetY + padding + (1 - meter(value) / 100) * plotHeight,
  }));
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const middleX = (previous.x + current.x) / 2;
    path += ` Q ${middleX} ${previous.y} ${middleX} ${(previous.y + current.y) / 2}`;
    path += ` T ${current.x} ${current.y}`;
  }
  return path;
}

function Sparkline({
  values,
  tone,
}: {
  values: number[];
  tone: "blue" | "violet" | "mint" | "orange";
}) {
  const line = makeLinePath(values, 120, 28, 2);
  if (!line) return null;
  const area = `${line} L 120 28 L 0 28 Z`;

  return (
    <svg
      className={`sparkline ${tone}`}
      viewBox="0 0 120 28"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="sparkline-area" d={area} />
      <path className="sparkline-line" d={line} />
    </svg>
  );
}

export const meter = (value: number) => Math.max(0, Math.min(100, value));
export const displayTime = (snapshot?: SystemSnapshot, language: Language = "es") =>
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
    if (!snapshot) return;
    if (snapshot.cpu.usagePercent === undefined) return;
    const usage = snapshot.cpu.usagePercent;
    setCpuHistory((history) =>
      [...history, meter(usage)].slice(-40),
    );
  }, [snapshot?.collectedAt]);
  useEffect(() => {
    if (gpuLoad === undefined) return;
    setGpuHistory((history) => [...history, meter(gpuLoad)].slice(-40));
  }, [hardware?.collectedAt, gpuLoad]);
  const disk = snapshot?.disks[0];
  const diskPercent =
    disk && disk.sizeGb > 0
      ? meter(((disk.sizeGb - disk.freeGb) / disk.sizeGb) * 100)
      : 0;
  const gpuTemp = hardware?.gpu.temperatureC;
  const requiresAttention =
    (cpu !== undefined && cpu >= 95) ||
    memoryPercent >= 90 ||
    hardware?.physicalDisks.some(
      (physicalDisk) => physicalDisk.health === "warning",
    ) === true ||
    snapshot?.disks.some((logicalDisk) => logicalDisk.health === "warning") === true;
  const softwareStatus: Record<UpdateState["status"], string> = {
    idle: "Sin comprobar",
    checking: "Comprobando",
    "up-to-date": "Al día",
    available: "Actualización disponible",
    downloaded: "Instalando",
    error: "Error al comprobar",
    unsupported: "No disponible",
  };

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">VISIÓN GENERAL</p>
          <h1>
            {snapshot
              ? requiresAttention
                ? "Hay métricas que revisar"
                : "Resumen del equipo"
              : "Preparando tu primer resumen"}
            <span className="title-dot">.</span>
          </h1>
          <p className="hero-copy">
            {snapshot
              ? "Consulta las métricas disponibles y el estado de los componentes detectados."
              : "Recopilando los datos iniciales del equipo para mostrar el resumen."}
          </p>
        </div>
        <div
          className="scan-status"
          style={{ cursor: "pointer" }}
          onClick={onOpenHardware}
          title="Abrir detalles del hardware"
        >
          <span className="scan-ring">
            <Icon name="shield" size={21} />
          </span>
          <div>
            <strong>
              {dataError
                ? "Datos no disponibles"
                : snapshot
                  ? requiresAttention
                    ? "Revisar métricas"
                    : "Lecturas actualizadas"
                  : "Analizando equipo…"}
            </strong>
            <small>
              {dataError ||
                (snapshot
                  ? `Analizado a las ${displayTime(snapshot, language)} · Clic para Telemetría`
                  : "La primera lectura puede tardar unos segundos.")}
            </small>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <div
          style={{ cursor: "pointer" }}
          onClick={onOpenHardware}
          title="Ver detalles del procesador"
        >
          <Metric
            icon="chip"
            label="Procesador"
            value={cpu === undefined ? "—" : `${cpu}%`}
            caption={snapshot?.cpu.name ?? "Leyendo información"}
            percent={cpu ?? 0}
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

      <section className="dashboard-grid">
        <article className="surface performance-panel">
          <div className="surface-heading">
            <div>
              <p className="section-kicker">RENDIMIENTO</p>
              <h2>Actividad del procesador</h2>
            </div>
            <div className="surface-value">
              <strong>{cpu === undefined ? "—" : `${cpu}%`}</strong>
              <span>uso actual</span>
            </div>
          </div>
          <CpuHistoryChart values={cpuHistory} current={cpu ?? 0} />
        </article>

        <article className="surface health-panel">
          <div className="surface-heading">
            <div>
              <p className="section-kicker">SALUD</p>
              <h2>Puntos de control</h2>
            </div>
            <button
              className="icon-button"
              onClick={onOpenHardware}
              title="Ver Sensores de Hardware"
            >
              <Icon name="arrow" size={18} />
            </button>
          </div>
          <HealthRow
            icon="chip"
            name="Placa & BIOS"
            detail={
              hardware?.motherboard
                ? `${hardware.motherboard.product} · BIOS ${hardware.motherboard.biosVersion}`
                : "No hay datos de la placa base"
            }
            status={hardware ? "Datos disponibles" : "Esperando datos"}
            tone={hardware ? "good" : "unknown"}
          />
          <HealthRow
            icon="disk"
            name="Unidades Físicas"
            detail={
              hardware?.physicalDisks.length
                ? `${hardware.physicalDisks.length} discos (NVMe/SSD/HDD)`
                : snapshot
                  ? "No se detectaron unidades físicas"
                  : "Comprobando unidades"
            }
            status={
              !hardware
                ? "Esperando datos"
                : hardware.physicalDisks.some((physicalDisk) => physicalDisk.health === "warning")
                  ? "Revisar"
                  : hardware.physicalDisks.length > 0 &&
                      hardware.physicalDisks.every((physicalDisk) => physicalDisk.health === "good")
                    ? "Correcto"
                    : "Sin datos"
            }
            tone={
              !hardware
                ? "unknown"
                : hardware.physicalDisks.some((physicalDisk) => physicalDisk.health === "warning")
                  ? "warning"
                  : hardware.physicalDisks.length > 0 &&
                      hardware.physicalDisks.every((physicalDisk) => physicalDisk.health === "good")
                    ? "good"
                    : "unknown"
            }
          />
          <HealthRow
            icon="refresh"
            name="Software"
            detail="Estado de actualizaciones"
            status={softwareStatus[updateState.status]}
            tone={
              updateState.status === "error" || updateState.status === "available"
                ? "warning"
                : updateState.status === "up-to-date"
                  ? "good"
                  : "unknown"
            }
          />
        </article>

        <article className="surface action-panel">
          <div className="action-orb">
            <Icon name="sparkles" size={26} />
          </div>
          <p className="section-kicker">MANTENIMIENTO & HARDWARE</p>
          <h2>
            Telemetría avanzada
            <br />
            de hardware y sensores.
          </h2>
          <p className="muted">
            Monitorea frecuencias, temperaturas, voltajes y consumos en tiempo
            real.
          </p>
          <button className="primary-button" onClick={onOpenHardware}>
            Ver Sensores de Hardware <Icon name="arrow" size={16} />
          </button>
        </article>
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

function CpuHistoryChart({
  values,
  current,
}: {
  values: number[];
  current: number;
}) {
  const plotTop = 12;
  const plotBottom = 158;
  const line = makeLinePath(values, 620, plotBottom - plotTop, 0, plotTop);
  const area = line ? `${line} L 620 ${plotBottom} L 0 ${plotBottom} Z` : "";
  const horizontalLevels = [100, 75, 50, 25, 0];

  return (
    <div className="chart">
      <div className="chart-labels">
        {horizontalLevels.map((level) => (
          <span key={level}>{level}%</span>
        ))}
      </div>
      <svg
        viewBox={`0 0 620 ${plotBottom + 12}`}
        preserveAspectRatio="none"
        aria-label={`Historial de uso de CPU durante los últimos 60 segundos. Uso actual ${Math.round(current)} por ciento.`}
        role="img"
      >
        <defs>
          <linearGradient id="cpu-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#258df2" stopOpacity=".42" />
            <stop offset="100%" stopColor="#258df2" stopOpacity=".02" />
          </linearGradient>
        </defs>
        <path
          className="chart-grid"
          d={horizontalLevels
            .map((level) => {
              const y = plotTop + (1 - level / 100) * (plotBottom - plotTop);
              return `M0 ${y}H620`;
            })
            .join("")}
        />
        <path
          className="chart-grid chart-grid-vertical"
          d="M0 12V158M103 12V158M206 12V158M310 12V158M413 12V158M516 12V158M620 12V158"
        />
        {area && <path className="chart-area" d={area} />}
        {line && <path className="chart-line" d={line} />}
      </svg>
      <div className="chart-times">
        <span>60 s</span>
        <span>50 s</span>
        <span>40 s</span>
        <span>30 s</span>
        <span>20 s</span>
        <span>10 s</span>
        <span>ahora</span>
      </div>
    </div>
  );
}

function HealthRow({
  icon,
  name,
  detail,
  status,
  tone,
}: {
  icon: IconName;
  name: string;
  detail: string;
  status: string;
  tone: "good" | "warning" | "unknown";
}) {
  return (
    <div className="health-row">
      <span className="health-icon">
        <Icon name={icon} size={16} />
      </span>
      <div>
        <strong>{name}</strong>
        <small>{detail}</small>
      </div>
      <span className={`health-status ${tone}`}>
        <i />
        {status}
      </span>
    </div>
  );
}
