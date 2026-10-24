import type { ReactNode, RefObject } from "react";
import type { UpdateNotice, UpdateState } from "../shared/types";
import { Icon, type IconName } from "./Icon";
import appMark from "../../assets/icon.svg";

const systemNav: Array<{ label: string; icon: IconName }> = [
  { label: "Resumen", icon: "grid" },
  { label: "Hardware", icon: "chip" },
  { label: "Salud del sistema", icon: "pulse" },
  { label: "Unidades", icon: "disk" },
];

const maintenanceNav: Array<{ label: string; icon: IconName }> = [
  { label: "Limpieza", icon: "sparkles" },
  { label: "Actualizaciones", icon: "refresh" },
];

interface AppShellProps {
  rootRef: RefObject<HTMLElement | null>;
  section: string;
  sidebarCollapsed: boolean;
  historyIndex: number;
  sectionHistory: string[];
  theme: "light" | "dark";
  optionsRef: RefObject<HTMLDivElement | null>;
  optionsOpen: boolean;
  optionsFeedback: string;
  isExporting: boolean;
  update?: UpdateNotice;
  updateState: UpdateState;
  updatePromptOpen: boolean;
  onNavigateHistory: (direction: -1 | 1) => void;
  onToggleSidebar: () => void;
  onThemeChange: () => void;
  onNavigate: (target: string) => void;
  onOpenCleanup: () => void;
  onToggleOptions: () => void;
  onExport: (format: "txt" | "csv") => void;
  onRunViewAction: () => void;
  contextualAction: string;
  onDismissUpdate: () => void;
  onDownloadUpdate: () => void;
  children: ReactNode;
}

export function AppShell({
  rootRef,
  section,
  sidebarCollapsed,
  historyIndex,
  sectionHistory,
  theme,
  optionsRef,
  optionsOpen,
  optionsFeedback,
  isExporting,
  update,
  updateState,
  updatePromptOpen,
  onNavigateHistory,
  onToggleSidebar,
  onThemeChange,
  onNavigate,
  onOpenCleanup,
  onToggleOptions,
  onExport,
  onRunViewAction,
  contextualAction,
  onDismissUpdate,
  onDownloadUpdate,
  children,
}: AppShellProps) {
  return (
    <main
      ref={rootRef}
      className={`app-shell${sidebarCollapsed ? " sidebar-collapsed" : ""}`}
    >
      <header className="app-titlebar">
        <div className="titlebar-navigation">
          <button
            className="titlebar-button"
            onClick={() => onNavigateHistory(-1)}
            disabled={historyIndex === 0}
            title="Volver"
            aria-label="Volver"
          >
            <Icon name="back" size={17} />
          </button>
          <button
            className="titlebar-button"
            onClick={() => onNavigateHistory(1)}
            disabled={historyIndex >= sectionHistory.length - 1}
            title="Avanzar"
            aria-label="Avanzar"
          >
            <Icon name="forward" size={17} />
          </button>
          <span className="titlebar-divider" />
          <button
            className={`titlebar-button sidebar-toggle${sidebarCollapsed ? " selected" : ""}`}
            onClick={onToggleSidebar}
            title={
              sidebarCollapsed
                ? "Mostrar barra lateral"
                : "Ocultar barra lateral"
            }
            aria-label={
              sidebarCollapsed
                ? "Mostrar barra lateral"
                : "Ocultar barra lateral"
            }
          >
            <Icon name="sidebar" size={17} />
          </button>
        </div>
        <div className="titlebar-title">
          <span>Nexo PC</span>
          <span className="titlebar-separator">/</span>
          <strong>{section}</strong>
        </div>
        <button
          className="theme-switch"
          role="switch"
          aria-checked={theme === "dark"}
          aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
          title={`Modo ${theme === "dark" ? "oscuro" : "claro"}`}
          onClick={onThemeChange}
        >
          <Icon name="sun" size={14} />
          <span className="theme-switch-track">
            <i />
          </span>
          <Icon name="moon" size={14} />
        </button>
      </header>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <img className="brand-monogram" src={appMark} alt="" />
            <div className="brand-text">
              <span className="brand-name">nexo<span> / PC</span></span>
            </div>
          </div>
        </div>

        <div
          className="sidebar-scroll"
          onWheel={(event) => {
            const menu = event.currentTarget;
            if (menu.scrollWidth <= menu.clientWidth || event.deltaY === 0)
              return;
            menu.scrollLeft += event.deltaY;
            event.preventDefault();
          }}
        >
          <p className="sidebar-label">SISTEMA</p>
          <nav>
            {systemNav.map((item) => (
              <button
                className={section === item.label ? "nav active" : "nav"}
                onClick={() => onNavigate(item.label)}
                key={item.label}
                aria-current={section === item.label ? "page" : undefined}
                title={item.label}
              >
                <span className={`nav-icon-badge nav-icon-${item.icon}`}>
                  <Icon name={item.icon} size={15} />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <p className="sidebar-label" style={{ marginTop: "18px" }}>
            MANTENIMIENTO
          </p>
          <nav>
            {maintenanceNav.map((item) => (
              <button
                className={section === item.label ? "nav active" : "nav"}
                onClick={() =>
                  item.label === "Limpieza"
                    ? onOpenCleanup()
                    : onNavigate(item.label)
                }
                key={item.label}
                aria-current={section === item.label ? "page" : undefined}
                title={item.label}
              >
                <span className={`nav-icon-badge nav-icon-${item.icon}`}>
                  <Icon name={item.icon} size={15} />
                </span>
                <span>{item.label}</span>
                {item.label === "Actualizaciones" && update && !update.downloaded && <i className="nav-dot" />}
              </button>
            ))}
          </nav>
          <div className="sidebar-spacer" />
          <button
            className={
              section === "Ajustes" ? "nav active settings" : "nav settings"
            }
            onClick={() => onNavigate("Ajustes")}
            aria-current={section === "Ajustes" ? "page" : undefined}
            title="Ajustes"
          >
            <span className="nav-icon-badge nav-icon-settings">
              <Icon name="settings" size={15} />
            </span>
            <span>Ajustes</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="device-card">
            <span className="device-icon">
              <Icon name="chip" size={15} />
            </span>
            <div>
              <strong>Diagnóstico local</strong>
              <small>Datos en este equipo</small>
            </div>
          </div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Mi equipo</span>
            <b>/</b>
            <strong>{section}</strong>
          </div>
          <div className="topbar-actions">
            <span className="live-indicator">
              <i />
              Actualización automática
            </span>
            <div className="view-options" ref={optionsRef}>
              <button
                className={`quiet-button${optionsOpen ? " options-active" : ""}`}
                aria-label={`Opciones de ${section}`}
                aria-haspopup="menu"
                aria-expanded={optionsOpen}
                onClick={onToggleOptions}
              >
                <Icon name="more" />
              </button>
              {optionsOpen && (
                <div
                  className="view-options-menu"
                  role="menu"
                  aria-label={`Opciones de ${section}`}
                >
                  <span className="view-options-heading">{section}</span>
                  <button
                    role="menuitem"
                    onClick={() => void onExport("txt")}
                    disabled={isExporting}
                  >
                    <Icon name="file" size={16} />
                    <span>Exportar como TXT</span>
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => void onExport("csv")}
                    disabled={isExporting}
                  >
                    <Icon name="export" size={16} />
                    <span>Exportar como CSV</span>
                  </button>
                  <span className="view-options-divider" />
                  <button role="menuitem" onClick={onRunViewAction}>
                    <Icon
                      name={
                        section === "Actualizaciones"
                          ? "refresh"
                          : section === "Ajustes"
                            ? theme === "light"
                              ? "moon"
                              : "sun"
                            : "refresh"
                      }
                      size={16}
                    />
                    <span>{contextualAction}</span>
                  </button>
                  {optionsFeedback && (
                    <span className="view-options-feedback" role="status">
                      {optionsFeedback}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {update && updatePromptOpen && !update.downloaded && (
          <div className="update-dialog-backdrop">
            <section
              className="update-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="update-dialog-title"
            >
              <span className="update-dialog-icon">
                <Icon name="download" size={22} />
              </span>
              <p className="section-kicker">ACTUALIZACIÓN DISPONIBLE</p>
              <h2 id="update-dialog-title">Hay una nueva versión de Nexo PC</h2>
              <p>
                Versión disponible: <strong>{update.version}</strong>
              </p>
              {updateState.status === "downloading" && (
                <div className="update-download-progress" role="status">
                  <p>Descargando actualización…</p>
                  <progress
                    aria-label="Progreso de descarga"
                    max={100}
                    value={updateState.progress}
                  />
                </div>
              )}
              {updateState.status === "error" && (
                <p className="update-download-error" role="alert">
                  {updateState.message || "No se pudo descargar la actualización."}
                </p>
              )}
              <div className="update-dialog-actions">
                <button
                  className="secondary-button"
                  onClick={onDismissUpdate}
                >
                  Ahora no
                </button>
                <button
                  className="primary-button"
                  onClick={onDownloadUpdate}
                  disabled={updateState.status === "downloading"}
                >
                  {updateState.status === "downloading"
                    ? "Descargando…"
                    : updateState.status === "error"
                      ? "Reintentar descarga"
                      : "Descargar y actualizar"}
                </button>
              </div>
            </section>
          </div>
        )}

        {children}
      </section>
    </main>
  );
}
