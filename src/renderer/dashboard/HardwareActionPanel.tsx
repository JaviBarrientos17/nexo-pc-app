import { Icon } from "../Icon";

export function HardwareActionPanel({
  onOpenHardware,
}: {
  onOpenHardware: () => void;
}) {
  return (
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
        Monitorea frecuencias, temperaturas, voltajes y consumos en tiempo real.
      </p>
      <button className="primary-button" onClick={onOpenHardware}>
        Ver Sensores de Hardware <Icon name="arrow" size={16} />
      </button>
    </article>
  );
}
