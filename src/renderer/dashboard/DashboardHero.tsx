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
  );
}
