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
import type { CategoryFilter } from "./hardware/HardwareSectionTypes";
import { CleanupView } from "./CleanupView";
import { Dashboard, meter, snapshotFromReport } from "./Dashboard";
import { AppShell } from "./AppShell";
import {
  getInitialLanguage,
  translateDom,
  translateText,
  type Language,
} from "./localization";
import {
  DrivesView,
  SettingsView,
  SystemHealthView,
  UpdatesView,
} from "./SystemViews";

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
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [hardware, setHardware] = useState<HardwareReport>();
  const [section, setSection] = useState("Resumen");
  const [hardwareCategory, setHardwareCategory] = useState<CategoryFilter>("all");
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

  useEffect(() => {
    const usage = snapshot?.cpu.usagePercent;
    if (usage !== undefined) {
      setCpuHistory((history) => [...history, meter(usage)].slice(-40));
    }
  }, [snapshot]);

  const navigateTo = (target: string) => {
    if (target === "Hardware") setHardwareCategory("all");
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
    const refreshInterval = navigator.hardwareConcurrency <= 4 ? 30_000 : 15_000;
    const scheduleRefresh = () => {
      if (!active || document.visibilityState !== "visible") return;
      timer = window.setTimeout(() => void refresh(), refreshInterval);
    };
    const refresh = async () => {
      if (!active || document.visibilityState !== "visible") return;
      await loadData();
      scheduleRefresh();
    };
    const handleVisibilityChange = () => {
      window.clearTimeout(timer);
      if (document.visibilityState === "visible") void refresh();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    void refresh();
    return () => {
      active = false;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    setUpdateState({
      status: "downloading",
      version: update?.version,
      progress: 0,
    });
    void window.nexo.downloadUpdate().catch((error: unknown) => {
      setUpdateState({
        status: "error",
        version: update?.version,
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

  const page =
    section === "Hardware" ? (
      <HardwareMonitor report={hardware} onRefresh={loadData} initialCategory={hardwareCategory} />
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
        cpuHistory={cpuHistory}
        snapshot={snapshot}
        hardware={hardware}
        dataError={dataError}
        language={language}
        memoryPercent={memoryPercent}
        updateState={updateState}
        onOpenHardware={(category = "all") => {
          navigateTo("Hardware");
          setHardwareCategory(category);
        }}
      />
    );

  return (
    <AppShell
      rootRef={appRootRef}
      section={section}
      sidebarCollapsed={sidebarCollapsed}
      historyIndex={historyIndex}
      sectionHistory={sectionHistory}
      theme={theme}
      optionsRef={optionsRef}
      optionsOpen={optionsOpen}
      optionsFeedback={optionsFeedback}
      isExporting={isExporting}
      update={update}
      updateState={updateState}
      updatePromptOpen={updatePromptOpen}
      onNavigateHistory={navigateHistory}
      onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)}
      onThemeChange={() =>
        setTheme((current) => (current === "light" ? "dark" : "light"))
      }
      onNavigate={navigateTo}
      onOpenCleanup={openCleanup}
      onToggleOptions={() => {
        setOptionsFeedback("");
        setOptionsOpen((open) => !open);
      }}
      onExport={(format) => void exportCurrentView(format)}
      onRunViewAction={() => void runViewAction()}
      contextualAction={contextualAction}
      onDismissUpdate={dismissUpdatePrompt}
      onDownloadUpdate={downloadUpdate}
    >
      {page}
    </AppShell>
  );
}
