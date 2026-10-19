import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  CleanupItem,
  HardwareReport,
  SystemSnapshot,
  UpdateNotice,
  UpdateState,
} from "../shared/types";
import { HardwareMonitor } from "./HardwareMonitor";
import appIcon from "../../assets/icon.png";
import { getInitialLanguage, translateDom, translateText, type Language } from "./localization";
import {
  DrivesView,
  SettingsView,
  SystemHealthView,
  UpdatesView,
} from "./SystemViews";

type IconName =
  | "grid"
  | "chip"
  | "disk"
  | "pulse"
  | "sparkles"
  | "refresh"
  | "settings"
  | "shield"
  | "arrow"
  | "more"
  | "download"
  | "clock"
  | "back"
  | "forward"
  | "sidebar"
  | "sun"
  | "moon"
  | "file"
  | "export";
const navigation: Array<{ label: string; icon: IconName }> = [
  { label: "Resumen", icon: "grid" },
  { label: "Hardware", icon: "chip" },
  { label: "Salud del sistema", icon: "pulse" },
  { label: "Unidades", icon: "disk" },
  { label: "Limpieza", icon: "sparkles" },
  { label: "Actualizaciones", icon: "refresh" },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    chip: (
      <>
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <path d="M9 1v5M15 1v5M9 18v5M15 18v5M1 9h5M1 15h5M18 9h5M18 15h5" />
      </>
    ),
    disk: (
      <>
        <path d="M4 4h16v16H4z" />
        <path d="M7 16h10M8 7h.01M12 7h.01" />
      </>
    ),
    pulse: <path d="M3 12h4l2.2-6 4.4 12 2.2-6H21" />,
    sparkles: (
      <>
        <path d="m12 3-1.4 5.6L5 10l5.6 1.4L12 17l1.4-5.6L19 10l-5.6-1.4L12 3Z" />
        <path d="m5 17-.7 2.3L2 20l2.3.7L5 23l.7-2.3L8 20l-2.3-.7L5 17Z" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
        <path d="M3 4v6h6M4 13a8 8 0 0 0 14.8 4L21 14" />
        <path d="M21 20v-6h-6" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.1 2.1-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56v.1h-3v-.1a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.1-2.1.06-.06A1.7 1.7 0 0 0 7.06 15 1.7 1.7 0 0 0 5.5 14H5.4v-3h.1a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.1-2.1.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56v-.1h3v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.1 2.1-.06.06A1.7 1.7 0 0 0 19.4 11c.16.4.55.66.98.66h.1v3h-.1c-.43 0-.82.26-.98.66Z" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3Z" />
        <path d="m8.7 12 2.1 2.1 4.6-4.6" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="19" cy="12" r="1" fill="currentColor" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M4 21h16" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    back: (
      <>
        <path d="m15 18-6-6 6-6" />
        <path d="M20 12H9" />
      </>
    ),
    forward: (
      <>
        <path d="m9 18 6-6-6-6" />
        <path d="M4 12h11" />
      </>
    ),
    sidebar: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </>
    ),
    moon: <path d="M20.8 13A8.5 8.5 0 0 1 11 3.2 8.5 8.5 0 1 0 20.8 13Z" />,
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8m-8 4h8" />
      </>
    ),
    export: (
      <>
        <path d="M12 15V3m-5 5 5-5 5 5" />
        <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      </>
    ),
  };
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

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

const meter = (value: number) => Math.max(0, Math.min(100, value));
const displayTime = (snapshot?: SystemSnapshot, language: Language = "es") =>
  snapshot
    ? new Intl.DateTimeFormat(language === "en" ? "en-US" : "es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(snapshot.collectedAt))
    : "—";

function snapshotFromReport(report: HardwareReport): SystemSnapshot {
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

function flattenExportData(
  value: unknown,
  prefix = "",
  rows: Array<[string, string]> = [],
): Array<[string, string]> {
  if (Array.isArray(value)) {
    if (value.length === 0) rows.push([prefix, "[]"]);
    value.forEach((item, index) =>
      flattenExportData(item, `${prefix}[${index + 1}]`, rows),
    );
    return rows;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) rows.push([prefix, "{}"]);
    entries.forEach(([key, item]) =>
      flattenExportData(item, prefix ? `${prefix}.${key}` : key, rows),
    );
    return rows;
  }
  rows.push([
    prefix,
    value === undefined || value === null ? "" : String(value),
  ]);
  return rows;
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function App() {
  const [snapshot, setSnapshot] = useState<SystemSnapshot>();
  const [hardware, setHardware] = useState<HardwareReport>();
  const [section, setSection] = useState("Resumen");
  const [sectionHistory, setSectionHistory] = useState(["Resumen"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState<Language>(() =>
    getInitialLanguage(
      localStorage.getItem("nexo-language-preference"),
      navigator.languages.length > 0 ? navigator.languages : [navigator.language],
    ),
  );
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    localStorage.getItem("nexo-theme") === "dark" ? "dark" : "light",
  );
  const [dataError, setDataError] = useState("");
  const [update, setUpdate] = useState<UpdateNotice>();
  const [updatePromptOpen, setUpdatePromptOpen] = useState(false);
  const [updateState, setUpdateState] = useState<UpdateState>({
    status: "idle",
  });
  const [cleanup, setCleanup] = useState<CleanupItem[]>();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsFeedback, setOptionsFeedback] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const historyRef = useRef(["Resumen"]);
  const historyIndexRef = useRef(0);
  const optionsRef = useRef<HTMLDivElement>(null);
  const appRootRef = useRef<HTMLElement>(null);
  const dataRequestRef = useRef<Promise<HardwareReport | undefined>>(undefined);
  const dismissedUpdateVersionRef = useRef<string | undefined>(undefined);

  const navigateTo = (target: string) => {
    if (target === section) return;
    const nextHistory = historyRef.current.slice(
      0,
      historyIndexRef.current + 1,
    );
    nextHistory.push(target);
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setSectionHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setSection(target);
  };

  const navigateHistory = (direction: -1 | 1) => {
    const nextIndex = historyIndexRef.current + direction;
    const target = historyRef.current[nextIndex];
    if (!target) return;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    setSection(target);
  };

  const changeLanguage = (nextLanguage: Language) => {
    document.documentElement.lang = nextLanguage;
    localStorage.setItem("nexo-language-preference", nextLanguage);
    setLanguage(nextLanguage);
  };

  const loadData = useCallback(async () => {
    if (dataRequestRef.current) return dataRequestRef.current;
    const request = window.nexo
      .getHardwareReport()
      .then((report) => {
        setHardware(report);
        setSnapshot(snapshotFromReport(report));
        setDataError("");
        return report;
      })
      .catch((error: unknown) => {
        setDataError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los datos del sistema.",
        );
        return undefined;
      })
      .finally(() => {
        dataRequestRef.current = undefined;
      });
    dataRequestRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    let active = true;
    let timer = 0;
    const refresh = async () => {
      await loadData();
      if (active) timer = window.setTimeout(() => void refresh(), 5000);
    };
    void refresh();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [loadData]);

  useEffect(() => {
    let active = true;
    const unsubscribeNotice = window.nexo.onUpdateNotice((notice) => {
      setUpdate(notice);
      setUpdateState({
        status: notice.downloaded ? "downloaded" : "available",
        version: notice.version,
      });
      if (
        !notice.downloaded &&
        dismissedUpdateVersionRef.current !== notice.version
      ) {
        setUpdatePromptOpen(true);
      }
    });
    const unsubscribeState = window.nexo.onUpdateState(setUpdateState);
    void window.nexo
      .getUpdateSnapshot()
      .then(({ notice, state }) => {
        if (!active) return;
        setUpdateState(state);
        if (notice) {
          setUpdate(notice);
          if (
            !notice.downloaded &&
            dismissedUpdateVersionRef.current !== notice.version
          ) {
            setUpdatePromptOpen(true);
          }
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setUpdateState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "No se pudo consultar el estado de las actualizaciones.",
          });
        }
      });
    return () => {
      active = false;
      unsubscribeNotice();
      unsubscribeState();
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("nexo-theme", theme);
    void window.nexo.setWindowTheme(theme);
  }, [theme]);

  useLayoutEffect(() => {
    const root = appRootRef.current;
    if (!root) return;

    document.documentElement.lang = language;
    translateDom(root, language);
    const observer = new MutationObserver(() => translateDom(root, language));
    observer.observe(root, {
      attributes: true,
      attributeFilter: [
        "title",
        "aria-label",
        "aria-description",
        "aria-valuetext",
        "placeholder",
        "alt",
      ],
      characterData: true,
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [language]);

  useEffect(() => {
    if (!optionsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!optionsRef.current?.contains(event.target as Node)) {
        setOptionsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOptionsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [optionsOpen]);

  const memoryPercent = useMemo(
    () =>
      snapshot && snapshot.memory.totalGb > 0
        ? meter((snapshot.memory.usedGb / snapshot.memory.totalGb) * 100)
        : 0,
    [snapshot],
  );

  const openCleanup = async () => {
    navigateTo("Limpieza");
    setCleanup(await window.nexo.getCleanupPreview());
  };

  const exportData: Record<string, unknown> = {
    Resumen: { snapshot, hardware },
    Hardware: hardware,
    "Salud del sistema": { snapshot, hardware },
    Unidades: hardware
      ? {
          collectedAt: hardware.collectedAt,
          physicalDisks: hardware.physicalDisks,
          logicalDisks: hardware.logicalDisks,
        }
      : undefined,
    Limpieza: { preview: cleanup },
    Actualizaciones: { status: updateState, applicationVersion: "Nexo PC" },
    Ajustes: {
      theme,
      privacy: "Los datos del sistema se procesan localmente en este equipo.",
    },
  };

  const exportCurrentView = async (format: "txt" | "csv") => {
    const data = exportData[section];
    if (data === undefined) {
      setOptionsFeedback("No hay datos disponibles para exportar todavía.");
      return;
    }

    const rows = flattenExportData(data);
    const localizedSection = translateText(section, language);
    const localizedLocale = language === "en" ? "en-US" : "es-ES";
    const content =
      format === "csv"
        ? [
            language === "en" ? "Field,Value" : "Campo,Valor",
            ...rows.map(
              ([key, value]) => `${csvEscape(key)},${csvEscape(value)}`,
            ),
          ].join("\r\n")
        : `${localizedSection} — Nexo PC\r\n${language === "en" ? "Exported" : "Exportado"}: ${new Date().toLocaleString(localizedLocale)}\r\n\r\n${rows.map(([key, value]) => `${key}: ${value}`).join("\r\n")}`;
    const fileName = `nexo-${localizedSection
      .toLocaleLowerCase(localizedLocale)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;

    setIsExporting(true);
    setOptionsFeedback("");
    try {
      const result = await window.nexo.exportFile({
        fileName,
        format,
        content,
        language,
      });
      setOptionsFeedback(
        result.status === "saved"
          ? "Archivo exportado correctamente."
          : "Exportación cancelada.",
      );
    } catch (error) {
      setOptionsFeedback(
        error instanceof Error
          ? `No se pudo exportar: ${error.message}`
          : "No se pudo exportar el archivo.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const runViewAction = async () => {
    setOptionsFeedback("");
    try {
      if (section === "Actualizaciones") {
        setUpdateState({ status: "checking" });
        await window.nexo.checkForUpdates();
        setOptionsFeedback("Comprobación de actualizaciones iniciada.");
      } else if (section === "Ajustes") {
        const nextTheme = theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        setOptionsFeedback(
          `Modo ${nextTheme === "dark" ? "oscuro" : "claro"} activado.`,
        );
      } else if (section === "Limpieza") {
        setCleanup(await window.nexo.getCleanupPreview());
        setOptionsFeedback("Previsualización actualizada.");
      } else {
        const nextHardware = await loadData();
        if (!nextHardware) {
          setOptionsFeedback(
            dataError || "No se pudieron cargar los datos del sistema.",
          );
          return;
        }
        setOptionsFeedback("Datos del sistema actualizados.");
      }
    } catch (error) {
      setOptionsFeedback(
        error instanceof Error
          ? `No se pudo completar la acción: ${error.message}`
          : "No se pudo completar la acción.",
      );
    }
  };

  const contextualAction =
    section === "Actualizaciones"
      ? "Buscar actualizaciones"
      : section === "Ajustes"
        ? `Activar modo ${theme === "light" ? "oscuro" : "claro"}`
        : section === "Limpieza"
          ? "Actualizar previsualización"
          : "Actualizar datos";

  const checkForUpdates = () => {
    setUpdateState({ status: "checking" });
    void window.nexo.checkForUpdates().catch((error: unknown) => {
      setUpdateState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo comprobar si hay actualizaciones.",
      });
    });
  };

  const downloadUpdate = () => {
    if (update) dismissedUpdateVersionRef.current = update.version;
    setUpdatePromptOpen(false);
    void window.nexo.downloadUpdate().catch((error: unknown) => {
      setUpdateState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo descargar la actualización.",
      });
    });
  };

  const installUpdate = () => {
    void window.nexo.installUpdate().catch((error: unknown) => {
      setUpdateState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo instalar la actualización.",
      });
    });
  };

  const dismissUpdatePrompt = () => {
    if (update) dismissedUpdateVersionRef.current = update.version;
    setUpdatePromptOpen(false);
  };

  return (
    <main
      ref={appRootRef}
      className={`app-shell${sidebarCollapsed ? " sidebar-collapsed" : ""}`}
    >
      <header className="app-titlebar">
        <div className="titlebar-navigation">
          <button
            className="titlebar-button"
            onClick={() => navigateHistory(-1)}
            disabled={historyIndex === 0}
            title="Volver"
            aria-label="Volver"
          >
            <Icon name="back" size={17} />
          </button>
          <button
            className="titlebar-button"
            onClick={() => navigateHistory(1)}
            disabled={historyIndex >= sectionHistory.length - 1}
            title="Avanzar"
            aria-label="Avanzar"
          >
            <Icon name="forward" size={17} />
          </button>
          <span className="titlebar-divider" />
          <button
            className={`titlebar-button sidebar-toggle${sidebarCollapsed ? " selected" : ""}`}
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
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
          <img className="titlebar-app-mark" src={appIcon} alt="" />
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
          onClick={() =>
            setTheme((current) => (current === "light" ? "dark" : "light"))
          }
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
            <img className="brand-symbol" src={appIcon} alt="" />
            <div className="brand-text">
              <span className="brand-name">Nexo PC</span>
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
                onClick={() => navigateTo(item.label)}
                key={item.label}
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
                    ? openCleanup()
                    : navigateTo(item.label)
                }
                key={item.label}
              >
                <span className={`nav-icon-badge nav-icon-${item.icon}`}>
                  <Icon name={item.icon} size={15} />
                </span>
                <span>{item.label}</span>
                {item.label === "Actualizaciones" && <i className="nav-dot" />}
              </button>
            ))}
          </nav>
          <div className="sidebar-spacer" />
          <button
            className={
              section === "Ajustes" ? "nav active settings" : "nav settings"
            }
            onClick={() => navigateTo("Ajustes")}
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
              <Icon name="shield" size={15} />
            </span>
            <div>
              <strong>Diagnóstico Local</strong>
              <small>Protección activa</small>
            </div>
            <span className="status-indicator-dot" />
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
              En directo
            </span>
            <div className="view-options" ref={optionsRef}>
              <button
                className={`quiet-button${optionsOpen ? " options-active" : ""}`}
                aria-label={`Opciones de ${section}`}
                aria-haspopup="menu"
                aria-expanded={optionsOpen}
                onClick={() => {
                  setOptionsFeedback("");
                  setOptionsOpen((open) => !open);
                }}
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
                    onClick={() => void exportCurrentView("txt")}
                    disabled={isExporting}
                  >
                    <Icon name="file" size={16} />
                    <span>Exportar como TXT</span>
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => void exportCurrentView("csv")}
                    disabled={isExporting}
                  >
                    <Icon name="export" size={16} />
                    <span>Exportar como CSV</span>
                  </button>
                  <span className="view-options-divider" />
                  <button role="menuitem" onClick={() => void runViewAction()}>
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
              <div className="update-dialog-actions">
                <button
                  className="secondary-button"
                  onClick={dismissUpdatePrompt}
                >
                  Ahora no
                </button>
                <button className="primary-button" onClick={downloadUpdate}>
                  Descargar y actualizar
                </button>
              </div>
            </section>
          </div>
        )}

        {section === "Hardware" ? (
          <HardwareMonitor report={hardware} onRefresh={loadData} />
        ) : section === "Unidades" ? (
          <DrivesView report={hardware} />
        ) : section === "Salud del sistema" ? (
          <SystemHealthView report={hardware} snapshot={snapshot} />
        ) : section === "Actualizaciones" ? (
          <UpdatesView
            state={updateState}
            onCheck={checkForUpdates}
            onDownload={downloadUpdate}
            onInstall={installUpdate}
          />
        ) : section === "Ajustes" ? (
          <SettingsView
            theme={theme}
            onThemeChange={setTheme}
            language={language}
            onLanguageChange={changeLanguage}
            updateState={updateState}
            onCheckUpdates={checkForUpdates}
            onDownloadUpdate={downloadUpdate}
            onInstallUpdate={installUpdate}
          />
        ) : section === "Limpieza" ? (
          <CleanupView
            items={cleanup}
            onPreview={() => window.nexo.getCleanupPreview().then(setCleanup)}
          />
        ) : (
          <Dashboard
            snapshot={snapshot}
            hardware={hardware}
            dataError={dataError}
            language={language}
            memoryPercent={memoryPercent}
            updateState={updateState}
            onCleanup={openCleanup}
            onOpenHardware={() => navigateTo("Hardware")}
          />
        )}
      </section>
    </main>
  );
}

function Dashboard({
  snapshot,
  hardware,
  dataError,
  language,
  memoryPercent,
  updateState,
  onCleanup,
  onOpenHardware,
}: {
  snapshot?: SystemSnapshot;
  hardware?: HardwareReport;
  dataError: string;
  language: Language;
  memoryPercent: number;
  updateState: UpdateState;
  onCleanup: () => void;
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
    hardware?.physicalDisks.some((physicalDisk) => physicalDisk.health === "warning") === true ||
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

function CleanupView({
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
          <h1>
            Haz espacio
            <br />
            con tranquilidad<span className="title-dot">.</span>
          </h1>
          <p className="hero-copy">
            Primero revisas exactamente qué se analizará. Nada se elimina sin tu
            confirmación.
          </p>
        </div>
        <div className="scan-status">
          <span className="scan-ring amber">
            <Icon name="sparkles" size={21} />
          </span>
          <div>
            <strong>Limpieza protegida</strong>
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
              <input type="checkbox" defaultChecked={item.selected} />
              <span className="cleanup-icon">
                <Icon name="sparkles" size={16} />
              </span>
              <div>
                <strong>{item.label}</strong>
                <small>{item.path}</small>
              </div>
              <span>
                {item.sizeMb ? `${item.sizeMb} MB` : "Pendiente de análisis"}
              </span>
              <Icon name="arrow" size={16} />
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
