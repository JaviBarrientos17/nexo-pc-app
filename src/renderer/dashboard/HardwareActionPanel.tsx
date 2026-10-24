import { Icon } from "../Icon";

export function HardwareActionPanel({
  onOpenHardware,
}: {
  onOpenHardware: () => void;
}) {
  return (
    <article className="surface action-panel">
      <div className="action-orb">
        <Icon name="chip" size={22} />
      </div>
      <p className="section-kicker">EXPLORAR EL EQUIPO</p>
      <h2>
        Más allá del resumen
      </h2>
      <p className="muted">
        Consulta los sensores disponibles, compara lecturas y sigue sus mínimos y máximos.
      </p>
      <button className="primary-button" onClick={onOpenHardware}>
        Explorar hardware <Icon name="arrow" size={16} />
      </button>
    </article>
  );
}
