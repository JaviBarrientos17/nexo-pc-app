import type { SystemSnapshot } from "../../shared/types";
import type { Language } from "../localization";
import { Icon } from "../Icon";
import { displayTime } from "./utils";

export function DashboardHero({
  snapshot,
  dataError,
  language,
  requiresAttention,
  onOpenHardware,
}: {
  snapshot?: SystemSnapshot;
  dataError: string;
  language: Language;
  requiresAttention: boolean;
  onOpenHardware: () => void;
}) {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">{snapshot?.computerName ?? "MI EQUIPO"}</p>
        <h1>
          {snapshot
            ? requiresAttention
              ? "Hay métricas que revisar"
              : "Tu equipo, de un vistazo"
            : "Leyendo tu equipo"}
        </h1>
        <p className="hero-copy">
          {snapshot
            ? "Rendimiento, componentes y estado del sistema."
            : "Recopilando los datos iniciales del equipo para mostrar el resumen."}
        </p>
      </div>
      <button
        className={`scan-status${dataError ? " has-error" : requiresAttention ? " needs-attention" : ""}`}
        onClick={onOpenHardware}
        title="Abrir detalles del hardware"
      >
        <span className="scan-ring">
          <Icon name={dataError || requiresAttention ? "pulse" : "clock"} size={18} />
        </span>
        <span>
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
                ? `Última lectura · ${displayTime(snapshot, language)}`
                : "La primera lectura puede tardar unos segundos.")}
          </small>
        </span>
        <Icon name="arrow" size={15} />
      </button>
    </section>
  );
}
