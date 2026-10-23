import type { CleanupItem } from "../shared/types";
import { Icon } from "./Icon";

export function CleanupView({
  items,
  onPreview,
}: {
  items?: CleanupItem[];
  onPreview: () => void;
}) {
  return (
    <>
      <section className="hero cleanup-hero">
        <div>
          <p className="eyebrow">MANTENIMIENTO SEGURO</p>
          <h1>Revisión de limpieza</h1>
          <p className="hero-copy">
            Consulta las ubicaciones previstas para limpieza. Esta versión no elimina archivos.
          </p>
        </div>
        <div className="scan-status">
          <span className="scan-ring amber">
            <Icon name="file" size={18} />
          </span>
          <div>
            <strong>Solo previsualización</strong>
            <small>Sin cambios en el sistema</small>
          </div>
        </div>
      </section>
      <article className="surface cleanup-surface">
        <div className="surface-heading">
          <div>
            <p className="section-kicker">PREVISUALIZACIÓN</p>
            <h2>Elementos que puedes revisar</h2>
          </div>
          <button className="secondary-button" onClick={onPreview}>
            <Icon name="refresh" size={15} />
            Actualizar
          </button>
        </div>
        {items ? (
          items.map((item) => (
            <div className="cleanup-row" key={item.label}>
              <span className="cleanup-icon">
                <Icon name="file" size={16} />
              </span>
              <div>
                <strong>{item.label}</strong>
                <small>{item.path}</small>
              </div>
              <span>
                {item.sizeMb ? `${item.sizeMb} MB` : "Pendiente de análisis"}
              </span>
            </div>
          ))
        ) : (
          <p className="empty-state">
            Pulsa «Actualizar» para consultar ubicaciones seguras.
          </p>
        )}
        <div className="safety-note">
          <Icon name="shield" size={18} />
          <span>
            <strong>Tu control es lo primero.</strong> Esta versión solo muestra
            una previsualización; no borra archivos.
          </span>
        </div>
      </article>
    </>
  );
}
