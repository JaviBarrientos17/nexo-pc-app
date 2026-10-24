import type {
  HardwareReport,
  SystemSnapshot,
  UpdateState,
} from "../../shared/types";
import { Icon, type IconName } from "../Icon";

const softwareStatus: Record<UpdateState["status"], string> = {
  idle: "Sin comprobar",
  checking: "Comprobando",
  downloading: "Descargando actualización",
  "up-to-date": "Al día",
  available: "Actualización disponible",
  downloaded: "Instalando",
  error: "Error de actualización",
  unsupported: "No disponible",
};

export function HealthPanel({
  hardware,
  snapshot,
  updateState,
  onOpenHardware,
}: {
  hardware?: HardwareReport;
  snapshot?: SystemSnapshot;
  updateState: UpdateState;
  onOpenHardware: () => void;
}) {
  const physicalDisksNeedAttention =
    hardware?.physicalDisks.some(
      (physicalDisk) => physicalDisk.health === "warning",
    ) === true;
  const physicalDisksAreHealthy =
    hardware !== undefined &&
    hardware.physicalDisks.length > 0 &&
    hardware.physicalDisks.every(
      (physicalDisk) => physicalDisk.health === "good",
    );
  const physicalDiskStatus = !hardware
    ? "Esperando datos"
    : physicalDisksNeedAttention
      ? "Revisar"
      : physicalDisksAreHealthy
        ? "Correcto"
        : "Sin datos";
  const physicalDiskTone = !hardware
    ? "unknown"
    : physicalDisksNeedAttention
      ? "warning"
      : physicalDisksAreHealthy
        ? "good"
        : "unknown";
  const updateTone =
    updateState.status === "error" || updateState.status === "available"
      ? "warning"
      : updateState.status === "up-to-date"
        ? "good"
        : "unknown";

  return (
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
          aria-label="Ver sensores de hardware"
        >
          <Icon name="arrow" size={18} />
        </button>
      </div>
      <HealthRow
        icon="chip"
        name="Placa & BIOS"
        detail={
          hardware
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
        status={physicalDiskStatus}
        tone={physicalDiskTone}
      />
      <HealthRow
        icon="refresh"
        name="Software"
        detail="Estado de actualizaciones"
        status={softwareStatus[updateState.status]}
        tone={updateTone}
      />
    </article>
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
