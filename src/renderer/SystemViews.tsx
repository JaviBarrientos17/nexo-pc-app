import type {
  HardwareReport,
  Health,
  SystemSnapshot,
  UpdateState,
} from "../shared/types";
import type { Language } from "./localization";
import appMark from "../../assets/icon.svg";

export function UpdatesView({
  state,
  onCheck,
  onDownload,
  onInstall,
}: {
  state: UpdateState;
  onCheck: () => void;
  onDownload: () => void;
  onInstall: () => void;
}) {
  const copy: Record<UpdateState["status"], { title: string; detail: string }> =
    {
      idle: {
        title: "Mantén Nexo PC al día",
        detail: "Comprueba si hay una nueva versión disponible.",
      },
      checking: {
        title: "Buscando actualizaciones…",
        detail: "Estamos consultando si hay una versión más reciente.",
      },
      downloading: {
        title: "Descargando actualización…",
        detail:
          "La actualización se está descargando. La aplicación se reiniciará automáticamente al finalizar.",
      },
      "up-to-date": {
        title: "Ya tienes la última versión",
        detail: "No se encontraron actualizaciones disponibles.",
      },
      available: {
        title: "Hay una actualización disponible",
        detail: "Descárgala para obtener las últimas mejoras.",
      },
      downloaded: {
        title: "Actualización lista para instalar",
        detail:
          "La aplicación se reiniciará automáticamente para completar la instalación.",
      },
      error: {
        title: "No se pudo completar la actualización",
        detail: state.message || "Comprueba tu conexión e inténtalo de nuevo.",
      },
      unsupported: {
        title: "Comprobación no disponible",
        detail:
          state.message ||
          "Esta opción requiere la versión instalada de la aplicación.",
      },
    };
  const action =
    state.status === "available"
      ? { label: "Descargar actualización", onClick: onDownload }
      : state.status === "downloaded"
        ? { label: "Reiniciar e instalar", onClick: onInstall }
        : { label: "Buscar actualizaciones", onClick: onCheck };
  const isBusy =
    state.status === "checking" || state.status === "downloading";
  const isPositive =
    state.status === "up-to-date" || state.status === "downloaded";
  const isProblem = state.status === "error" || state.status === "unsupported";

  return (
    <div className="system-view updates-view">
      <section className="hero system-view-hero">
        <div>
          <p className="eyebrow">SOFTWARE</p>
          <h1>
            Actualizaciones<span className="title-dot">.</span>
          </h1>
          <p className="hero-copy">
            Comprueba y aplica las actualizaciones de Nexo PC desde esta
            pantalla.
          </p>
        </div>
      </section>
      <article
        className={`surface update-state-card${isProblem ? " problem" : ""}${isPositive ? " positive" : ""}`}
      >
        <div
          className={`update-state-symbol${isBusy ? " busy" : ""}${isPositive ? " positive" : ""}`}
          aria-hidden="true"
        >
          {isProblem ? "!" : isPositive ? "✓" : "↻"}
        </div>
        <p className="section-kicker">ESTADO DE LA APLICACIÓN</p>
        <h2>{copy[state.status].title}</h2>
        <p className="update-state-detail">{copy[state.status].detail}</p>
        {state.status === "downloading" && (
          <progress
            className="update-progress"
            aria-label="Progreso de descarga"
            max={100}
            value={state.progress}
          />
        )}
        {state.version && (
          <p className="update-version">
            {state.status === "downloaded"
              ? "Versión preparada"
              : "Nueva versión"}
            : <strong>{state.version}</strong>
          </p>
        )}
        <div className="update-state-actions">
          <button
            className="primary-button update-action-button"
            onClick={action.onClick}
            disabled={isBusy}
          >
            {isBusy
              ? state.status === "downloading"
                ? "Descargando…"
                : "Buscando…"
              : action.label}
          </button>
          {(state.status === "available" || state.status === "downloaded") && (
            <button
              className="secondary-button"
              onClick={onCheck}
              disabled={isBusy}
            >
              Buscar otra vez
            </button>
          )}
        </div>
      </article>
      <article className="surface update-info-card">
        <span className="update-info-icon">i</span>
        <div>
          <strong>Instalación controlada</strong>
          <p>
            La descarga se inicia cuando la solicitas. Al finalizar, la
            actualización se instala y la aplicación se reinicia
            automáticamente.
          </p>
        </div>
      </article>
    </div>
  );
}

export function SettingsView({
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  updateState,
  onCheckUpdates,
  onDownloadUpdate,
  onInstallUpdate,
}: {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
  updateState: UpdateState;
  onCheckUpdates: () => void;
  onDownloadUpdate: () => void;
  onInstallUpdate: () => void;
}) {
  const updateDetail: Record<UpdateState["status"], string> = {
    idle: "Busca aquí una versión nueva de Nexo PC.",
    checking: "Buscando actualizaciones…",
    downloading: "Descargando actualización…",
    "up-to-date": "No se encontraron actualizaciones disponibles.",
    available: "Hay una actualización disponible.",
    downloaded:
      "La actualización se está instalando y la aplicación se reiniciará.",
    error:
      updateState.message ||
      "No se pudo completar la actualización. Comprueba tu conexión e inténtalo de nuevo.",
    unsupported:
      updateState.message || "La búsqueda requiere la aplicación instalada.",
  };
  const updateAction =
    updateState.status === "available"
      ? { label: "Descargar actualización", onClick: onDownloadUpdate }
      : updateState.status === "downloaded"
        ? { label: "Reiniciar e instalar", onClick: onInstallUpdate }
        : updateState.status === "downloading"
          ? { label: "Descargando…", onClick: onDownloadUpdate }
          : { label: "Buscar actualizaciones", onClick: onCheckUpdates };

  return (
    <div className="system-view settings-view">
      <section className="hero system-view-hero">
        <div>
          <p className="eyebrow">PREFERENCIAS</p>
          <h1>
            Ajustes<span className="title-dot">.</span>
          </h1>
          <p className="hero-copy">
            Personaliza la apariencia y consulta cómo se gestionan tus datos.
          </p>
        </div>
      </section>
      <section className="settings-section">
        <p className="section-kicker">IDIOMA</p>
        <article className="surface settings-card">
          <div className="settings-card-heading">
            <span className="settings-icon language">文</span>
            <div>
              <strong>Idioma de la aplicación</strong>
              <small>Elige el idioma de todos los menús y pantallas.</small>
            </div>
          </div>
          <select
            className="language-select"
            aria-label="Idioma de la aplicación"
            value={language}
            onChange={(event) =>
              onLanguageChange(event.target.value === "en" ? "en" : "es")
            }
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </article>
      </section>
      <section className="settings-section">
        <p className="section-kicker">APARIENCIA</p>
        <article className="surface settings-card">
          <div className="settings-card-heading">
            <span className="settings-icon appearance">◐</span>
            <div>
              <strong>Modo de color</strong>
              <small>Elige la apariencia de Nexo PC.</small>
            </div>
          </div>
          <div
            className="appearance-options"
            role="group"
            aria-label="Modo de color"
          >
            <button
              className={`appearance-option${theme === "light" ? " selected" : ""}`}
              aria-pressed={theme === "light"}
              onClick={() => onThemeChange("light")}
            >
              <span className="appearance-preview light-preview">
                <i />
              </span>
              <span>Claro</span>
            </button>
            <button
              className={`appearance-option${theme === "dark" ? " selected" : ""}`}
              aria-pressed={theme === "dark"}
              onClick={() => onThemeChange("dark")}
            >
              <span className="appearance-preview dark-preview">
                <i />
              </span>
              <span>Oscuro</span>
            </button>
          </div>
        </article>
      </section>
      <section className="settings-section">
        <p className="section-kicker">ACTUALIZACIONES</p>
        <article className="surface settings-card settings-update-card">
          <div className="settings-card-heading">
            <span className="settings-icon updates">↻</span>
            <div>
              <strong>Actualizaciones de Nexo PC</strong>
              <small>{updateDetail[updateState.status]}</small>
              {updateState.version && (
                <small>Nueva versión: {updateState.version}</small>
              )}
              {updateState.status === "downloading" && (
                <progress
                  className="update-progress"
                  aria-label="Progreso de descarga"
                  max={100}
                  value={updateState.progress}
                />
              )}
            </div>
          </div>
          <div className="settings-update-actions">
            <button
              className="primary-button"
              onClick={updateAction.onClick}
              disabled={
                updateState.status === "checking" ||
                updateState.status === "downloading" ||
                updateState.status === "downloaded"
              }
            >
              {updateAction.label}
            </button>
            {updateState.status === "available" && (
              <button className="secondary-button" onClick={onCheckUpdates}>
                Buscar otra vez
              </button>
            )}
          </div>
        </article>
      </section>
      <section className="settings-section">
        <p className="section-kicker">PRIVACIDAD</p>
        <article className="surface settings-card settings-info-row">
          <span className="settings-icon privacy">⌂</span>
          <div>
            <strong>Procesamiento local</strong>
            <small>
              Los datos del sistema se recopilan y muestran en este equipo.
            </small>
          </div>
          <span className="settings-local-badge">
            <i /> Solo en este equipo
          </span>
        </article>
      </section>
      <section className="settings-section">
        <p className="section-kicker">APLICACIÓN</p>
        <article className="surface settings-card settings-info-row">
          <img className="settings-brand-mark" src={appMark} alt="" />
          <div>
            <strong>Nexo PC</strong>
            <small>Diagnóstico y mantenimiento local</small>
          </div>
          <span className="settings-about-copy">
            La versión instalada se gestiona desde Actualizaciones.
          </span>
        </article>
      </section>
    </div>
  );
}

function formatGb(value: number) {
  const locale = document.documentElement.lang === "en" ? "en-US" : "es-ES";
  return `${value.toLocaleString(locale, { maximumFractionDigits: 1 })} GB`;
}

function StatusPill({ status }: { status: Health }) {
  const labels: Record<Health, string> = {
    good: "Correcto",
    warning: "Revisar",
    unknown: "Sin datos",
  };

  return (
    <span className={`system-status ${status}`}>
      <i />
      {labels[status]}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  status,
}: {
  label: string;
  value: string;
  detail: string;
  status: Health;
}) {
  return (
    <article className="system-summary-card">
      <div className="system-summary-top">
        <span>{label}</span>
        <StatusPill status={status} />
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export function SystemHealthView({
  report,
  snapshot,
}: {
  report?: HardwareReport;
  snapshot?: SystemSnapshot;
}) {
  const cpuLoad = report?.cpu.usagePercent ?? snapshot?.cpu.usagePercent;
  const memoryLoad = report?.memory.usagePercent;
  const cpuTemp = report?.cpu.temperatureC;
  const cpuStatus: Health =
    cpuLoad === undefined
      ? "unknown"
      : cpuTemp !== undefined && cpuTemp >= 90
        ? "warning"
        : cpuLoad >= 95
          ? "warning"
          : "good";
  const memoryStatus: Health =
    memoryLoad === undefined
      ? "unknown"
      : memoryLoad >= 90
        ? "warning"
        : "good";
  const driveStatuses = report?.physicalDisks.map((disk) => disk.health) ?? [];
  const diskStatus: Health = !report
    ? "unknown"
    : driveStatuses.includes("warning")
      ? "warning"
      : driveStatuses.length > 0 &&
          driveStatuses.every((status) => status === "good")
        ? "good"
        : "unknown";
  const statuses = [cpuStatus, memoryStatus, diskStatus];
  const warningCount = statuses.filter((status) => status === "warning").length;
  const knownCount = statuses.filter((status) => status !== "unknown").length;
  const overallStatus: Health =
    warningCount > 0
      ? "warning"
      : knownCount === statuses.length
        ? "good"
        : "unknown";
  const overallTitle: Record<Health, string> = {
    good: "Todo funciona correctamente",
    warning: "Hay elementos que requieren atención",
    unknown: "Diagnóstico parcial",
  };
  const storageDetail = report
    ? `${report.physicalDisks.length} unidades físicas detectadas`
    : "Esperando lectura de hardware";

  return (
    <div className="system-view">
      <section className="hero system-view-hero">
        <div>
          <p className="eyebrow">DIAGNÓSTICO</p>
          <h1>
            Salud del sistema<span className="title-dot">.</span>
          </h1>
          <p className="hero-copy">
            Un resumen de las métricas disponibles para ayudarte a detectar
            posibles problemas.
          </p>
        </div>
        <div className={`system-overall ${overallStatus}`}>
          <span className="system-overall-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3 20 6v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3Z" />
              <path d="m8.7 12 2.1 2.1 4.6-4.6" />
            </svg>
          </span>
          <span>
            <strong>{overallTitle[overallStatus]}</strong>
            <small>
              {knownCount} de {statuses.length} comprobaciones disponibles
            </small>
          </span>
        </div>
      </section>

      <section className="system-summary-grid" aria-label="Resumen de estado">
        <SummaryCard
          label="Procesador"
          value={cpuLoad === undefined ? "—" : `${Math.round(cpuLoad)}%`}
          detail={
            cpuTemp === undefined
              ? "Temperatura no disponible"
              : `Temperatura actual: ${cpuTemp} °C`
          }
          status={cpuStatus}
        />
        <SummaryCard
          label="Memoria"
          value={memoryLoad === undefined ? "—" : `${Math.round(memoryLoad)}%`}
          detail={
            report
              ? `${formatGb(report.memory.usedGb)} de ${formatGb(report.memory.totalGb)} en uso`
              : "Esperando lectura de hardware"
          }
          status={memoryStatus}
        />
        <SummaryCard
          label="Almacenamiento"
          value={report ? String(report.physicalDisks.length) : "—"}
          detail={storageDetail}
          status={diskStatus}
        />
      </section>

      <article className="surface system-checks">
        <div className="surface-heading">
          <div>
            <p className="section-kicker">ESTADO ACTUAL</p>
            <h2>Comprobaciones del equipo</h2>
          </div>
          <span className="system-last-read">
            {report?.collectedAt
              ? `Actualizado a las ${new Date(report.collectedAt).toLocaleTimeString(document.documentElement.lang === "en" ? "en-US" : "es-ES", { hour: "2-digit", minute: "2-digit" })}`
              : "Esperando datos"}
          </span>
        </div>
        <div className="system-check-row">
          <span className="system-check-icon cpu">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
              <path d="M9 1v5m6-5v5m-6 12v5m6-5v5M1 9h5m-5 6h5m12-6h5m-5 6h5" />
            </svg>
          </span>
          <span className="system-check-copy">
            <strong>Procesador</strong>
            <small>
              {report?.cpu.name ??
                snapshot?.cpu.name ??
                "Esperando identificación"}
            </small>
          </span>
          <span className="system-check-reading">
            {cpuLoad === undefined ? "—" : `${Math.round(cpuLoad)}% de uso`}
            {cpuTemp !== undefined && ` · ${cpuTemp} °C`}
          </span>
          <StatusPill status={cpuStatus} />
        </div>
        <div className="system-check-row">
          <span className="system-check-icon memory">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 12h4l2.2-6 4.4 12 2.2-6H21" />
            </svg>
          </span>
          <span className="system-check-copy">
            <strong>Memoria del sistema</strong>
            <small>
              {report?.memory.modules.length ?? 0} módulos detectados
            </small>
          </span>
          <span className="system-check-reading">
            {memoryLoad === undefined
              ? "—"
              : `${Math.round(memoryLoad)}% en uso`}
          </span>
          <StatusPill status={memoryStatus} />
        </div>
        <div className="system-check-row">
          <span className="system-check-icon storage">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 4h16v16H4z" />
              <path d="M7 16h10M8 7h.01M12 7h.01" />
            </svg>
          </span>
          <span className="system-check-copy">
            <strong>Unidades físicas</strong>
            <small>{storageDetail}</small>
          </span>
          <span className="system-check-reading">
            {report?.physicalDisks
              .map((disk) => disk.operationalStatus)
              .join(", ") || "—"}
          </span>
          <StatusPill status={diskStatus} />
        </div>
        <div className="system-check-row">
          <span className="system-check-icon board">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8 8h3v3H8zm6 0h2m-2 4h2m-8 2h8" />
            </svg>
          </span>
          <span className="system-check-copy">
            <strong>Placa base y BIOS</strong>
            <small>
              {report?.motherboard.product ?? "Esperando identificación"}
            </small>
          </span>
          <span className="system-check-reading">
            {report?.motherboard.biosVersion
              ? `BIOS ${report.motherboard.biosVersion}`
              : "—"}
          </span>
          <span
            className={`system-detected ${report?.motherboard.product ? "available" : ""}`}
          >
            {report?.motherboard.product ? "Identificada" : "Sin datos"}
          </span>
        </div>
        <p className="system-disclaimer">
          El estado se calcula solo con los datos que el equipo puede
          proporcionar. Algunas temperaturas o estados SMART pueden no estar
          disponibles.
        </p>
      </article>
    </div>
  );
}

function UsageBar({ percent }: { percent: number }) {
  const bounded = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="drive-usage-track"
      role="progressbar"
      aria-label="Espacio utilizado"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(bounded)}
    >
      <i style={{ width: `${bounded}%` }} />
    </div>
  );
}

export function DrivesView({ report }: { report?: HardwareReport }) {
  const logicalDisks = report?.logicalDisks ?? [];
  const totalSize = logicalDisks.reduce((sum, disk) => sum + disk.sizeGb, 0);
  const totalFree = logicalDisks.reduce((sum, disk) => sum + disk.freeGb, 0);
  const usedPercent =
    totalSize > 0 ? ((totalSize - totalFree) / totalSize) * 100 : 0;
  return (
    <div className="system-view drives-view">
      <section className="hero system-view-hero">
        <div>
          <p className="eyebrow">ALMACENAMIENTO</p>
          <h1>
            Unidades<span className="title-dot">.</span>
          </h1>
          <p className="hero-copy">
            Consulta tus discos, volúmenes y el espacio disponible en este
            equipo.
          </p>
        </div>
        <div className="drive-total-card">
          <span>Espacio disponible</span>
          <strong>{report ? formatGb(totalFree) : "—"}</strong>
          <small>
            {report
              ? `${formatGb(totalSize)} de capacidad total`
              : "Esperando lectura"}
          </small>
        </div>
      </section>

      {report && logicalDisks.length > 0 && (
        <article className="surface drive-overview">
          <div className="drive-overview-heading">
            <div>
              <p className="section-kicker">USO TOTAL</p>
              <h2>Espacio de almacenamiento</h2>
            </div>
            <strong>{Math.round(usedPercent)}% usado</strong>
          </div>
          <UsageBar percent={usedPercent} />
          <div className="drive-overview-legend">
            <span>
              <i className="legend-used" />{" "}
              {formatGb(Math.max(0, totalSize - totalFree))} usados
            </span>
            <span>
              <i className="legend-free" /> {formatGb(totalFree)} disponibles
            </span>
          </div>
        </article>
      )}

      <section className="drive-section">
        <div className="drive-section-heading">
          <div>
            <p className="section-kicker">DISCOS FÍSICOS</p>
            <h2>Hardware de almacenamiento</h2>
          </div>
          <span>
            {report ? `${report.physicalDisks.length} unidades` : "Leyendo…"}
          </span>
        </div>
        {!report ? (
          <div className="surface drive-empty">
            Recopilando información de las unidades…
          </div>
        ) : report.physicalDisks.length === 0 ? (
          <div className="surface drive-empty">
            No se detectaron unidades físicas.
          </div>
        ) : (
          <div className="physical-drives-grid">
            {report.physicalDisks.map((disk) => (
              <article
                className="surface physical-drive-card"
                key={disk.deviceId}
              >
                <div className="physical-drive-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="3" />
                    <path d="M7 15h10m-8-7h.01M12 8h.01" />
                  </svg>
                </div>
                <div className="physical-drive-heading">
                  <span className="physical-drive-bus">
                    {disk.busType || "Disco"}
                  </span>
                  <StatusPill status={disk.health} />
                </div>
                <h3>{disk.name}</h3>
                <p>
                  {disk.mediaType} · {formatGb(disk.sizeGb)}
                </p>
                <small>
                  {disk.operationalStatus || "Estado no disponible"}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="drive-section logical-drive-section">
        <div className="drive-section-heading">
          <div>
            <p className="section-kicker">VOLÚMENES</p>
            <h2>Unidades y particiones</h2>
          </div>
          <span>
            {report ? `${logicalDisks.length} volúmenes` : "Leyendo…"}
          </span>
        </div>
        {!report ? (
          <div className="surface drive-empty">
            Recopilando información de los volúmenes…
          </div>
        ) : logicalDisks.length === 0 ? (
          <div className="surface drive-empty">
            No se detectaron volúmenes montados.
          </div>
        ) : (
          <div className="logical-drives-list">
            {logicalDisks.map((disk) => (
              <article
                className="surface logical-drive-card"
                key={disk.deviceId}
              >
                <div className="logical-drive-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 4h16v16H4z" />
                    <path d="M7 16h10M8 7h.01M12 7h.01" />
                  </svg>
                </div>
                <div className="logical-drive-main">
                  <div className="logical-drive-heading">
                    <strong>{disk.deviceId}</strong>
                    <span>{disk.volumeName || "Volumen local"}</span>
                    {disk.fileSystem && (
                      <span className="drive-filesystem">
                        {disk.fileSystem}
                      </span>
                    )}
                  </div>
                  <UsageBar percent={disk.usagePercent} />
                  <div className="logical-drive-details">
                    <span>{formatGb(disk.freeGb)} disponibles</span>
                    <span>
                      {formatGb(disk.usedGb)} usados de {formatGb(disk.sizeGb)}
                    </span>
                  </div>
                </div>
                <strong className="logical-drive-percent">
                  {Math.round(disk.usagePercent)}%
                </strong>
              </article>
            ))}
          </div>
        )}
      </section>
      <footer className="app-footer drives-footer">
        <span>Los datos de almacenamiento se actualizan automáticamente.</span>
        <span>
          {report?.collectedAt
            ? `Última lectura: ${new Date(report.collectedAt).toLocaleTimeString(document.documentElement.lang === "en" ? "en-US" : "es-ES")}`
            : "Sin lectura disponible"}
        </span>
      </footer>
    </div>
  );
}
