import { useState, useMemo, useEffect } from "react";
import type { HardwareReport } from "../shared/types";
import type {
  CategoryFilter,
  HardwareSectionProps,
} from "./hardware/HardwareSectionTypes";
import { CpuSection } from "./hardware/CpuSection";
import { GpuSection } from "./hardware/GpuSection";
import { MemorySection } from "./hardware/MemorySection";
import { MotherboardSection } from "./hardware/MotherboardSection";
import { StorageSection } from "./hardware/StorageSection";

interface MinMaxTrack {
  min: number;
  max: number;
}

interface HardwareMonitorProps {
  report?: HardwareReport;
  onRefresh?: () => void;
  initialCategory?: CategoryFilter;
}

export function HardwareMonitor({ report, onRefresh, initialCategory = "all" }: HardwareMonitorProps) {
  const [history, setHistory] = useState<Record<string, MinMaxTrack>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!report || isPaused) return;

    setHistory((prev) => {
      const next = { ...prev };
      const updateVal = (key: string, val: number | undefined) => {
        if (val === undefined || Number.isNaN(val)) return;
        const current = next[key];
        if (!current) {
          next[key] = { min: val, max: val };
        } else {
          next[key] = {
            min: Math.min(current.min, val),
            max: Math.max(current.max, val),
          };
        }
      };

      updateVal("cpu_load", report.cpu.usagePercent);
      updateVal("cpu_clock", report.cpu.currentClockGhz);
      if (report.cpu.temperatureC !== undefined) {
        updateVal("cpu_temp", report.cpu.temperatureC);
      }

      updateVal("ram_usage_pct", report.memory.usagePercent);
      updateVal("ram_used_gb", report.memory.usedGb);
      updateVal("ram_free_gb", report.memory.freeGb);
      updateVal("vram_sys_used_gb", report.memory.virtualUsedGb);

      if (report.gpu.temperatureC !== undefined) {
        updateVal("gpu_temp", report.gpu.temperatureC);
      }
      if (report.gpu.utilizationPercent !== undefined) {
        updateVal("gpu_load", report.gpu.utilizationPercent);
      }
      if (report.gpu.memoryUtilizationPercent !== undefined) {
        updateVal("gpu_mem_pct", report.gpu.memoryUtilizationPercent);
      }
      if (report.gpu.memoryUsedMb !== undefined) {
        updateVal("gpu_mem_used", report.gpu.memoryUsedMb);
      }
      if (report.gpu.powerDrawWatts !== undefined) {
        updateVal("gpu_power", report.gpu.powerDrawWatts);
      }
      if (report.gpu.fanSpeedPercent !== undefined) {
        updateVal("gpu_fan", report.gpu.fanSpeedPercent);
      }

      report.logicalDisks.forEach((disk) => {
        updateVal(`disk_${disk.deviceId}_pct`, disk.usagePercent);
      });

      return next;
    });
  }, [report, isPaused]);

  const resetMinMax = () => {
    if (!report) {
      setHistory({});
      return;
    }
    const fresh: Record<string, MinMaxTrack> = {};
    const setFresh = (key: string, val: number | undefined) => {
      if (val !== undefined && !Number.isNaN(val)) {
        fresh[key] = { min: val, max: val };
      }
    };

    setFresh("cpu_load", report.cpu.usagePercent);
    setFresh("cpu_clock", report.cpu.currentClockGhz);
    if (report.cpu.temperatureC !== undefined)
      setFresh("cpu_temp", report.cpu.temperatureC);
    setFresh("ram_usage_pct", report.memory.usagePercent);
    setFresh("ram_used_gb", report.memory.usedGb);
    setFresh("ram_free_gb", report.memory.freeGb);
    setFresh("vram_sys_used_gb", report.memory.virtualUsedGb);

    if (report.gpu.temperatureC !== undefined)
      setFresh("gpu_temp", report.gpu.temperatureC);
    if (report.gpu.utilizationPercent !== undefined)
      setFresh("gpu_load", report.gpu.utilizationPercent);
    if (report.gpu.memoryUtilizationPercent !== undefined)
      setFresh("gpu_mem_pct", report.gpu.memoryUtilizationPercent);
    if (report.gpu.memoryUsedMb !== undefined)
      setFresh("gpu_mem_used", report.gpu.memoryUsedMb);
    if (report.gpu.powerDrawWatts !== undefined)
      setFresh("gpu_power", report.gpu.powerDrawWatts);
    if (report.gpu.fanSpeedPercent !== undefined)
      setFresh("gpu_fan", report.gpu.fanSpeedPercent);

    report.logicalDisks.forEach((disk) => {
      setFresh(`disk_${disk.deviceId}_pct`, disk.usagePercent);
    });

    setHistory(fresh);
  };

  const toggleSection = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => setCollapsed({});
  const collapseAll = () =>
    setCollapsed({
      motherboard: true,
      cpu: true,
      ram: true,
      gpu: true,
      storage: true,
    });

  const getMin = (key: string, current: number | undefined) => {
    if (current === undefined) return "—";
    return history[key]?.min !== undefined ? history[key].min : current;
  };

  const getMax = (key: string, current: number | undefined) => {
    if (current === undefined) return "—";
    return history[key]?.max !== undefined ? history[key].max : current;
  };

  const matchesSearch = (text: string) => {
    if (!search.trim()) return true;
    return text.toLowerCase().includes(search.toLowerCase());
  };

  const tempTone = (temp?: number) => {
    if (temp === undefined) return "blue";
    if (temp >= 80) return "red";
    if (temp >= 65) return "amber";
    return "mint";
  };

  const loadTone = (pct: number) => {
    if (pct >= 85) return "red";
    if (pct >= 60) return "amber";
    return "blue";
  };



  const sectionProps: HardwareSectionProps = {
    report,
    category,
    collapsed,
    matchesSearch,
    toggleSection,
    getMin,
    getMax,
    tempTone,
    loadTone,
  };

  return (
    <div className="hw-monitor-container">      <section className="hero hw-hero">
        <div>
          <p className="eyebrow">SENSORES DEL SISTEMA</p>
          <h1>
            Hardware y sensores<span className="title-dot">.</span>
          </h1>
          <p className="hero-copy">
            Telemetría avanzada y sensores en tiempo real: frecuencias,
            temperaturas, voltajes y consumos con registro de mínimos y máximos.
          </p>
        </div>

        <div className="hw-quick-chips">
          <div className="hw-chip">
            <span className="hw-chip-label">Placa</span>
            <strong>{report?.motherboard.product || "Detectando..."}</strong>
            <small>BIOS {report?.motherboard.biosVersion || "—"}</small>
          </div>
          <div className="hw-chip">
            <span className="hw-chip-label">CPU</span>
            <strong>
              {report?.cpu.name.split("@")[0].trim() || "Detectando..."}
            </strong>
            <small>
              {report?.cpu.cores ?? "—"}C / {report?.cpu.logicalProcessors ?? "—"}T ·{" "}
              {report?.cpu.currentClockGhz ?? "—"} GHz
            </small>
          </div>
          <div className="hw-chip">
            <span className="hw-chip-label">GPU</span>
            <strong>{report?.gpu.name || "Detectando..."}</strong>
            <small>
              {report?.gpu.temperatureC
                ? `${report.gpu.temperatureC} °C`
                : "En espera"}
            </small>
          </div>
        </div>
      </section>      <div className="hw-controls-bar">
        <div className="hw-filter-tabs">
          <button
            className={category === "all" ? "filter-tab active" : "filter-tab"}
            onClick={() => setCategory("all")}
          >
            Todos
          </button>
          <button
            className={category === "cpu" ? "filter-tab active" : "filter-tab"}
            onClick={() => setCategory("cpu")}
          >
            CPU
          </button>
          <button
            className={category === "gpu" ? "filter-tab active" : "filter-tab"}
            onClick={() => setCategory("gpu")}
          >
            GPU
          </button>
          <button
            className={category === "ram" ? "filter-tab active" : "filter-tab"}
            onClick={() => setCategory("ram")}
          >
            Memoria
          </button>
          <button
            className={
              category === "storage" ? "filter-tab active" : "filter-tab"
            }
            onClick={() => setCategory("storage")}
          >
            Almacenamiento
          </button>
          <button
            className={
              category === "motherboard" ? "filter-tab active" : "filter-tab"
            }
            onClick={() => setCategory("motherboard")}
          >
            Placa Base
          </button>
        </div>

        <div className="hw-actions-right">
          <div className="hw-search-box">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              aria-label="Buscar sensor o componente"
              placeholder="Buscar sensor o componente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search" aria-label="Borrar búsqueda" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>

          <button
            className="hw-btn reset-btn"
            onClick={resetMinMax}
            title="Reiniciar valores mínimos y máximos a los actuales"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Restablecer mín/máx</span>
          </button>

          <button
            className={`hw-btn pause-btn ${isPaused ? "paused" : ""}`}
            onClick={() => setIsPaused(!isPaused)}
            aria-pressed={isPaused}
            title={
              isPaused
                ? "Reanudar registro de mínimos y máximos"
                : "Pausar registro de mínimos y máximos"
            }
          >
            <span className={`live-dot ${isPaused ? "paused" : ""}`} />
            <span>{isPaused ? "Reanudar mín/máx" : "Pausar mín/máx"}</span>
          </button>

          <div className="hw-expand-group">
            <button
              className="hw-icon-btn"
              onClick={expandAll}
              title="Expandir todas las secciones"
            >
              +
            </button>
            <button
              className="hw-icon-btn"
              onClick={collapseAll}
              title="Colapsar todas las secciones"
            >
              −
            </button>
          </div>
        </div>
      </div>      <div className="hw-tree">
        <MotherboardSection {...sectionProps} />
        <CpuSection {...sectionProps} />
        <GpuSection {...sectionProps} />
        <MemorySection {...sectionProps} />
        <StorageSection {...sectionProps} />
      </div>

      <footer className="app-footer hw-footer">
        <span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Muestreo en tiempo real activo · Última lectura:{" "}
          {report?.collectedAt
            ? new Date(report.collectedAt).toLocaleTimeString(
                document.documentElement.lang === "en" ? "en-US" : "es-ES",
              )
            : "—"}
        </span>
        <span>
          Motor de telemetría y sensores integrado localmente sin servicios
          externos
        </span>
      </footer>
    </div>
  );
}
