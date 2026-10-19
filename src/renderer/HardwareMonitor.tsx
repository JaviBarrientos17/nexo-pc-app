import { useState, useMemo, useEffect } from "react";
import type { HardwareReport } from "../shared/types";

interface MinMaxTrack {
  min: number;
  max: number;
}

interface HardwareMonitorProps {
  report?: HardwareReport;
  onRefresh?: () => void;
}

type CategoryFilter = "all" | "cpu" | "gpu" | "ram" | "storage" | "motherboard";

export function HardwareMonitor({ report, onRefresh }: HardwareMonitorProps) {
  const [history, setHistory] = useState<Record<string, MinMaxTrack>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Update Min/Max tracking on each report tick unless paused
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

      // CPU
      updateVal("cpu_load", report.cpu.usagePercent);
      updateVal("cpu_clock", report.cpu.currentClockGhz);
      if (report.cpu.temperatureC !== undefined) {
        updateVal("cpu_temp", report.cpu.temperatureC);
      }

      // RAM
      updateVal("ram_usage_pct", report.memory.usagePercent);
      updateVal("ram_used_gb", report.memory.usedGb);
      updateVal("ram_free_gb", report.memory.freeGb);
      updateVal("vram_sys_used_gb", report.memory.virtualUsedGb);

      // GPU
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

      // Logical Disks
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

  const isVisible = (cat: CategoryFilter, text: string) => {
    if (category !== "all" && category !== cat) return false;
    return matchesSearch(text);
  };

  return (
    <div className="hw-monitor-container">
      {/* Top Banner / Hero */}
      <section className="hero hw-hero">
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
      </section>

      {/* Control Bar: Filters, Search, Reset Min/Max, Pause */}
      <div className="hw-controls-bar">
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
              placeholder="Buscar sensor o componente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search" onClick={() => setSearch("")}>
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
            <span>Reset Mín/Máx</span>
          </button>

          <button
            className={`hw-btn pause-btn ${isPaused ? "paused" : ""}`}
            onClick={() => setIsPaused(!isPaused)}
            title={
              isPaused
                ? "Reanudar actualización en vivo"
                : "Pausar actualización en vivo"
            }
          >
            <span className={`live-dot ${isPaused ? "paused" : ""}`} />
            <span>{isPaused ? "Pausado" : "En Vivo"}</span>
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
      </div>

      {/* Sensors Tree / Sections */}
      <div className="hw-tree">
        {/* 1. Motherboard */}
        {(category === "all" || category === "motherboard") &&
          matchesSearch(
            "Placa Base Motherboard BIOS Gigabyte Asus MSI ASRock " +
              (report?.motherboard.product || ""),
          ) && (
            <section className="hw-card">
              <header
                className="hw-card-header"
                onClick={() => toggleSection("motherboard")}
              >
                <div className="hw-header-title">
                  <span className="hw-icon-badge blue">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="3" />
                      <rect x="7" y="7" width="4" height="4" />
                      <rect x="13" y="7" width="4" height="4" />
                      <rect x="7" y="13" width="10" height="4" />
                    </svg>
                  </span>
                  <div>
                    <h3>Placa Base & BIOS</h3>
                    <small>
                      {report?.motherboard.manufacturer} ·{" "}
                      {report?.motherboard.product}
                    </small>
                  </div>
                </div>
                <span className="hw-toggle-icon">
                  {collapsed.motherboard ? "▼" : "▲"}
                </span>
              </header>

              {!collapsed.motherboard && (
                <div className="hw-card-body">
                  <table className="hw-table">
                    <thead>
                      <tr>
                        <th style={{ width: "38%" }}>Propiedad / Parámetro</th>
                        <th style={{ width: "24%" }}>Valor</th>
                        <th style={{ width: "19%" }}>Detalle</th>
                        <th style={{ width: "19%" }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span className="sensor-name">
                            Fabricante de Placa
                          </span>
                        </td>
                        <td className="sensor-val highlight">
                          {report?.motherboard.manufacturer || "—"}
                        </td>
                        <td className="sensor-text">
                          {report?.motherboard.product || "—"}
                        </td>
                        <td>
                          <span className="hw-badge-ok">Activo</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="sensor-name">Versión de BIOS</span>
                        </td>
                        <td className="sensor-val highlight">
                          {report?.motherboard.biosVersion || "—"}
                        </td>
                        <td className="sensor-text">
                          Fecha: {report?.motherboard.biosDate || "—"}
                        </td>
                        <td>
                          <span className="hw-badge-ok">SMBIOS OK</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="sensor-name">
                            Socket del Procesador
                          </span>
                        </td>
                        <td className="sensor-val">
                          {report?.cpu.socket || "—"}
                        </td>
                        <td className="sensor-text">{report?.computerName}</td>
                        <td>
                          <span className="hw-badge-ok">Conectado</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

        {/* 2. CPU / Processor */}
        {(category === "all" || category === "cpu") &&
          matchesSearch(
            "CPU Procesador Intel AMD Reloj Frecuencia Temperatura Carga " +
              (report?.cpu.name || ""),
          ) && (
            <section className="hw-card">
              <header
                className="hw-card-header"
                onClick={() => toggleSection("cpu")}
              >
                <div className="hw-header-title">
                  <span className="hw-icon-badge violet">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                      <path d="M9 1v5M15 1v5M9 18v5M15 18v5M1 9h5M1 15h5M18 9h5M18 15h5" />
                    </svg>
                  </span>
                  <div>
                    <h3>Procesador: {report?.cpu.name || "CPU"}</h3>
                    <small>
                      {report?.cpu.cores ?? "—"} Núcleos físicos ·{" "}
                      {report?.cpu.logicalProcessors ?? "—"} Hilos lógicos · Socket{" "}
                      {report?.cpu.socket}
                    </small>
                  </div>
                </div>
                <span className="hw-toggle-icon">
                  {collapsed.cpu ? "▼" : "▲"}
                </span>
              </header>

              {!collapsed.cpu && (
                <div className="hw-card-body">
                  <table className="hw-table">
                    <thead>
                      <tr>
                        <th style={{ width: "36%" }}>Sensor / Métrica</th>
                        <th style={{ width: "24%" }}>Actual (Value)</th>
                        <th style={{ width: "15%" }}>Mínimo (Min)</th>
                        <th style={{ width: "15%" }}>Máximo (Max)</th>
                        <th style={{ width: "10%" }}>Nivel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Clocks */}
                      <tr className="group-row">
                        <td colSpan={5}>
                          <span className="sensor-subcat">
                            ⚡ FRECUENCIAS Y RELOJES
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="sensor-name indent">
                            Frecuencia Núcleo (Clock Speed)
                          </span>
                        </td>
                        <td className="sensor-val highlight">
                          {report?.cpu.currentClockGhz ?? "—"}{" "}
                          <span className="unit">GHz</span>
                        </td>
                        <td className="sensor-val-secondary">
                          {getMin("cpu_clock", report?.cpu.currentClockGhz)} GHz
                        </td>
                        <td className="sensor-val-secondary">
                          {getMax("cpu_clock", report?.cpu.currentClockGhz)} GHz
                        </td>
                        <td>
                          <div className="mini-bar">
                            <i
                              className="blue"
                              style={{
                                width: `${Math.min(
                                  100,
                                  report?.cpu.currentClockGhz !== undefined &&
                                    report.cpu.maxClockGhz
                                    ? (report.cpu.currentClockGhz /
                                        report.cpu.maxClockGhz) *
                                      100
                                    : 0,
                                )}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>

                      {/* Temperatures */}
                      <tr className="group-row">
                        <td colSpan={5}>
                          <span className="sensor-subcat">🌡️ TEMPERATURAS</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="sensor-name indent">
                            Paquete de CPU (Package Temp)
                          </span>
                        </td>
                        <td className="sensor-val highlight">
                          <span
                            className={`temp-badge ${report?.cpu.temperatureC === undefined ? "unknown" : tempTone(report.cpu.temperatureC)}`}
                          >
                            {report?.cpu.temperatureC ?? "—"} °C
                          </span>
                        </td>
                        <td className="sensor-val-secondary">
                          {getMin("cpu_temp", report?.cpu.temperatureC)} °C
                        </td>
                        <td className="sensor-val-secondary">
                          {getMax("cpu_temp", report?.cpu.temperatureC)} °C
                        </td>
                        <td>
                          <div className="mini-bar">
                            <i
                              className={tempTone(report?.cpu.temperatureC)}
                              style={{
                                width: `${report?.cpu.temperatureC === undefined ? 0 : Math.min(100, report.cpu.temperatureC)}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>

                      {/* Utilization */}
                      <tr className="group-row">
                        <td colSpan={5}>
                          <span className="sensor-subcat">📊 UTILIZACIÓN</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="sensor-name indent">
                            Uso Total del Procesador (CPU Total)
                          </span>
                        </td>
                        <td className="sensor-val highlight">
                          <strong>{report?.cpu.usagePercent ?? "—"}%</strong>
                        </td>
                        <td className="sensor-val-secondary">
                          {getMin("cpu_load", report?.cpu.usagePercent)}%
                        </td>
                        <td className="sensor-val-secondary">
                          {getMax("cpu_load", report?.cpu.usagePercent)}%
                        </td>
                        <td>
                          <div className="mini-bar">
                            <i
                              className={loadTone(
                                report?.cpu.usagePercent ?? 0,
                              )}
                              style={{
                                width: `${report?.cpu.usagePercent ?? 0}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

        {/* 3. GPU / Graphics */}
        {(category === "all" || category === "gpu") &&
          matchesSearch(
            "GPU Gráfica Nvidia Radeon Intel GeForce VRAM " +
              (report?.gpu.name || ""),
          ) && (
            <section className="hw-card">
              <header
                className="hw-card-header"
                onClick={() => toggleSection("gpu")}
              >
                <div className="hw-header-title">
                  <span className="hw-icon-badge orange">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </span>
                  <div>
                    <h3>Gráficos: {report?.gpu.name || "GPU"}</h3>
                    <small>
                      Driver {report?.gpu.driverVersion || "—"} ·{" "}
                      {report?.gpu.refreshRate
                        ? `${report.gpu.refreshRate} Hz`
                        : ""}
                      {report?.gpu.resolution
                        ? ` · ${report.gpu.resolution}`
                        : ""}
                    </small>
                  </div>
                </div>
                <span className="hw-toggle-icon">
                  {collapsed.gpu ? "▼" : "▲"}
                </span>
              </header>

              {!collapsed.gpu && (
                <div className="hw-card-body">
                  <table className="hw-table">
                    <thead>
                      <tr>
                        <th style={{ width: "36%" }}>Sensor / Métrica</th>
                        <th style={{ width: "24%" }}>Actual (Value)</th>
                        <th style={{ width: "15%" }}>Mínimo (Min)</th>
                        <th style={{ width: "15%" }}>Máximo (Max)</th>
                        <th style={{ width: "10%" }}>Nivel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Temperature */}
                      {report?.gpu.temperatureC !== undefined && (
                        <>
                          <tr className="group-row">
                            <td colSpan={5}>
                              <span className="sensor-subcat">
                                🌡️ TEMPERATURA GPU
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <span className="sensor-name indent">
                                GPU Core Temp
                              </span>
                            </td>
                            <td className="sensor-val highlight">
                              <span
                                className={`temp-badge ${tempTone(report.gpu.temperatureC)}`}
                              >
                                {report.gpu.temperatureC} °C
                              </span>
                            </td>
                            <td className="sensor-val-secondary">
                              {getMin("gpu_temp", report.gpu.temperatureC)} °C
                            </td>
                            <td className="sensor-val-secondary">
                              {getMax("gpu_temp", report.gpu.temperatureC)} °C
                            </td>
                            <td>
                              <div className="mini-bar">
                                <i
                                  className={tempTone(report.gpu.temperatureC)}
                                  style={{
                                    width: `${Math.min(100, report.gpu.temperatureC)}%`,
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Utilization */}
                      <tr className="group-row">
                        <td colSpan={5}>
                          <span className="sensor-subcat">
                            📊 UTILIZACIÓN & CARGA
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="sensor-name indent">
                            Carga GPU Core
                          </span>
                        </td>
                        <td className="sensor-val highlight">
                          <strong>
                            {report?.gpu.utilizationPercent ?? 0}%
                          </strong>
                        </td>
                        <td className="sensor-val-secondary">
                          {getMin("gpu_load", report?.gpu.utilizationPercent)}%
                        </td>
                        <td className="sensor-val-secondary">
                          {getMax("gpu_load", report?.gpu.utilizationPercent)}%
                        </td>
                        <td>
                          <div className="mini-bar">
                            <i
                              className={loadTone(
                                report?.gpu.utilizationPercent ?? 0,
                              )}
                              style={{
                                width: `${report?.gpu.utilizationPercent ?? 0}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                      {report?.gpu.memoryUtilizationPercent !== undefined && (
                        <tr>
                          <td>
                            <span className="sensor-name indent">
                              Controlador de Memoria GPU
                            </span>
                          </td>
                          <td className="sensor-val highlight">
                            <strong>
                              {report.gpu.memoryUtilizationPercent}%
                            </strong>
                          </td>
                          <td className="sensor-val-secondary">
                            {getMin(
                              "gpu_mem_pct",
                              report.gpu.memoryUtilizationPercent,
                            )}
                            %
                          </td>
                          <td className="sensor-val-secondary">
                            {getMax(
                              "gpu_mem_pct",
                              report.gpu.memoryUtilizationPercent,
                            )}
                            %
                          </td>
                          <td>
                            <div className="mini-bar">
                              <i
                                className="violet"
                                style={{
                                  width: `${report.gpu.memoryUtilizationPercent}%`,
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* VRAM Memory */}
                      {report?.gpu.memoryTotalMb !== undefined && (
                        <>
                          <tr className="group-row">
                            <td colSpan={5}>
                              <span className="sensor-subcat">
                                🧠 MEMORIA DE VIDEO (VRAM)
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <span className="sensor-name indent">
                                VRAM Usada
                              </span>
                            </td>
                            <td className="sensor-val highlight">
                              {report.gpu.memoryUsedMb}{" "}
                              <span className="unit">MB</span>
                              <small className="vram-total">
                                {" "}
                                / {report.gpu.memoryTotalMb} MB
                              </small>
                            </td>
                            <td className="sensor-val-secondary">
                              {getMin("gpu_mem_used", report.gpu.memoryUsedMb)}{" "}
                              MB
                            </td>
                            <td className="sensor-val-secondary">
                              {getMax("gpu_mem_used", report.gpu.memoryUsedMb)}{" "}
                              MB
                            </td>
                            <td>
                              <div className="mini-bar">
                                <i
                                  className="orange"
                                  style={{
                                    width: `${Math.round(
                                      ((report.gpu.memoryUsedMb ?? 0) /
                                        (report.gpu.memoryTotalMb || 1)) *
                                        100,
                                    )}%`,
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Power & Fan */}
                      {(report?.gpu.powerDrawWatts !== undefined ||
                        report?.gpu.fanSpeedPercent !== undefined) && (
                        <>
                          <tr className="group-row">
                            <td colSpan={5}>
                              <span className="sensor-subcat">
                                ⚡ ENERGÍA & VENTILADORES
                              </span>
                            </td>
                          </tr>
                          {report.gpu.powerDrawWatts !== undefined && (
                            <tr>
                              <td>
                                <span className="sensor-name indent">
                                  Consumo de Potencia (Power Draw)
                                </span>
                              </td>
                              <td className="sensor-val highlight">
                                {report.gpu.powerDrawWatts}{" "}
                                <span className="unit">W</span>
                              </td>
                              <td className="sensor-val-secondary">
                                {getMin("gpu_power", report.gpu.powerDrawWatts)}{" "}
                                W
                              </td>
                              <td className="sensor-val-secondary">
                                {getMax("gpu_power", report.gpu.powerDrawWatts)}{" "}
                                W
                              </td>
                              <td>
                                <div className="mini-bar">
                                  <i
                                    className="amber"
                                    style={{
                                      width: `${Math.min(100, (report.gpu.powerDrawWatts / 180) * 100)}%`,
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          )}
                          {report.gpu.fanSpeedPercent !== undefined && (
                            <tr>
                              <td>
                                <span className="sensor-name indent">
                                  Velocidad del Ventilador (Fan Speed)
                                </span>
                              </td>
                              <td className="sensor-val highlight">
                                {report.gpu.fanSpeedPercent}{" "}
                                <span className="unit">%</span>
                              </td>
                              <td className="sensor-val-secondary">
                                {getMin("gpu_fan", report.gpu.fanSpeedPercent)}%
                              </td>
                              <td className="sensor-val-secondary">
                                {getMax("gpu_fan", report.gpu.fanSpeedPercent)}%
                              </td>
                              <td>
                                <div className="mini-bar">
                                  <i
                                    className="mint"
                                    style={{
                                      width: `${report.gpu.fanSpeedPercent}%`,
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

        {/* 4. Memory (RAM) */}
        {(category === "all" || category === "ram") &&
          matchesSearch(
            "RAM Memoria DDR4 DDR5 Corsair Kingston Slots " +
              (report?.memory.modules
                .map((m) => m.manufacturer + " " + m.partNumber)
                .join(" ") || ""),
          ) && (
            <section className="hw-card">
              <header
                className="hw-card-header"
                onClick={() => toggleSection("ram")}
              >
                <div className="hw-header-title">
                  <span className="hw-icon-badge violet">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 12h4l2.2-6 4.4 12 2.2-6H21" />
                    </svg>
                  </span>
                  <div>
                    <h3>Memoria del Sistema (RAM)</h3>
                    <small>
                      {report?.memory.totalGb} GB Instalados ·{" "}
                      {report?.memory.modules.length || 0} módulos detectados
                    </small>
                  </div>
                </div>
                <span className="hw-toggle-icon">
                  {collapsed.ram ? "▼" : "▲"}
                </span>
              </header>

              {!collapsed.ram && (
                <div className="hw-card-body">
                  <table className="hw-table">
                    <thead>
                      <tr>
                        <th style={{ width: "36%" }}>Sensor / Métrica</th>
                        <th style={{ width: "24%" }}>Actual (Value)</th>
                        <th style={{ width: "15%" }}>Mínimo (Min)</th>
                        <th style={{ width: "15%" }}>Máximo (Max)</th>
                        <th style={{ width: "10%" }}>Nivel</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="group-row">
                        <td colSpan={5}>
                          <span className="sensor-subcat">
                            📊 MEMORIA FÍSICA
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="sensor-name indent">
                            Uso de Memoria Física
                          </span>
                        </td>
                        <td className="sensor-val highlight">
                          <strong>{report?.memory.usagePercent ?? 0}%</strong>
                          <small className="vram-total">
                            {" "}
                            ({report?.memory.usedGb} / {report?.memory.totalGb}{" "}
                            GB)
                          </small>
                        </td>
                        <td className="sensor-val-secondary">
                          {getMin("ram_usage_pct", report?.memory.usagePercent)}
                          %
                        </td>
                        <td className="sensor-val-secondary">
                          {getMax("ram_usage_pct", report?.memory.usagePercent)}
                          %
                        </td>
                        <td>
                          <div className="mini-bar">
                            <i
                              className={loadTone(
                                report?.memory.usagePercent ?? 0,
                              )}
                              style={{
                                width: `${report?.memory.usagePercent ?? 0}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="sensor-name indent">
                            Memoria Libre
                          </span>
                        </td>
                        <td className="sensor-val highlight">
                          {report?.memory.freeGb ?? 0}{" "}
                          <span className="unit">GB</span>
                        </td>
                        <td className="sensor-val-secondary">
                          {getMin("ram_free_gb", report?.memory.freeGb)} GB
                        </td>
                        <td className="sensor-val-secondary">
                          {getMax("ram_free_gb", report?.memory.freeGb)} GB
                        </td>
                        <td>
                          <div className="mini-bar">
                            <i
                              className="mint"
                              style={{
                                width: `${Math.round(
                                  ((report?.memory.freeGb ?? 0) /
                                    (report?.memory.totalGb || 1)) *
                                    100,
                                )}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>

                      <tr className="group-row">
                        <td colSpan={5}>
                          <span className="sensor-subcat">
                            💾 MEMORIA VIRTUAL / ARCHIVO DE PAGINACIÓN
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="sensor-name indent">
                            Memoria Virtual Asignada
                          </span>
                        </td>
                        <td className="sensor-val highlight">
                          {report?.memory.virtualUsedGb !== undefined ? (
                            <>
                              {report.memory.virtualUsedGb}{" "}
                              <span className="unit">GB</span>
                              <small className="vram-total">
                                {" "}
                                / {report.memory.virtualTotalGb ?? "—"} GB
                              </small>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="sensor-val-secondary">
                          {report?.memory.virtualUsedGb !== undefined
                            ? `${getMin("vram_sys_used_gb", report.memory.virtualUsedGb)} GB`
                            : "—"}
                        </td>
                        <td className="sensor-val-secondary">
                          {report?.memory.virtualUsedGb !== undefined
                            ? `${getMax("vram_sys_used_gb", report.memory.virtualUsedGb)} GB`
                            : "—"}
                        </td>
                        <td>
                          <div className="mini-bar">
                            <i
                              className="blue"
                              style={{
                                width: `${Math.round(
                                  ((report?.memory.virtualUsedGb ?? 0) /
                                    (report?.memory.virtualTotalGb || 1)) *
                                    100,
                                )}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* RAM Modules Details Table */}
                  {report?.memory.modules &&
                    report.memory.modules.length > 0 && (
                      <div className="sub-module-section">
                        <p className="sub-section-title">
                          MÓDULOS DE MEMORIA FÍSICA DETECTADOS (SLOTS)
                        </p>
                        <table className="hw-table sub-table">
                          <thead>
                            <tr>
                              <th>Ranura / Banco</th>
                              <th>Capacidad</th>
                              <th>Velocidad</th>
                              <th>Fabricante</th>
                              <th>Número de Parte (Part #)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.memory.modules.map((m, idx) => (
                              <tr key={idx}>
                                <td className="sensor-val highlight">
                                  {m.bankLabel} #{idx + 1}
                                </td>
                                <td>
                                  <strong>{m.capacityGb} GB</strong>
                                </td>
                                <td className="sensor-val-secondary">
                                  {m.speedMhz ? `${m.speedMhz} MHz` : "Auto"}
                                </td>
                                <td>{m.manufacturer}</td>
                                <td className="sensor-text mono">
                                  {m.partNumber || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                </div>
              )}
            </section>
          )}

        {/* 5. Storage / Disks */}
        {(category === "all" || category === "storage") &&
          matchesSearch(
            "Almacenamiento Discos SSD NVMe HDD SATA " +
              (report?.physicalDisks
                .map((d) => d.name + " " + d.busType)
                .join(" ") || ""),
          ) && (
            <section className="hw-card">
              <header
                className="hw-card-header"
                onClick={() => toggleSection("storage")}
              >
                <div className="hw-header-title">
                  <span className="hw-icon-badge mint">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16v16H4z" />
                      <path d="M7 16h10M8 7h.01M12 7h.01" />
                    </svg>
                  </span>
                  <div>
                    <h3>Almacenamiento: Unidades Físicas & Volúmenes</h3>
                    <small>
                      {report?.physicalDisks.length || 0} Unidades físicas
                      detectadas · {report?.logicalDisks.length || 0}{" "}
                      Particiones montadas
                    </small>
                  </div>
                </div>
                <span className="hw-toggle-icon">
                  {collapsed.storage ? "▼" : "▲"}
                </span>
              </header>

              {!collapsed.storage && (
                <div className="hw-card-body">
                  {/* Physical Disks List */}
                  <p className="sub-section-title">
                    UNIDADES FÍSICAS DETECTADAS
                  </p>
                  <div className="physical-disks-grid">
                    {report?.physicalDisks.map((pdisk, idx) => (
                      <div className="pdisk-card" key={idx}>
                        <div className="pdisk-top">
                          <span
                            className={`bus-tag ${pdisk.busType.toLowerCase()}`}
                          >
                            {pdisk.busType}
                          </span>
                          <span className="media-tag">{pdisk.mediaType}</span>
                          <span className="pdisk-health">
                            <i /> {pdisk.operationalStatus}
                          </span>
                        </div>
                        <strong>{pdisk.name}</strong>
                        <div className="pdisk-capacity">{pdisk.sizeGb} GB</div>
                      </div>
                    ))}
                  </div>

                  {/* Logical Volumes Table */}
                  <p
                    className="sub-section-title"
                    style={{ marginTop: "24px" }}
                  >
                    VOLÚMENES LÓGICOS & ESPACIO DE DISCO
                  </p>
                  <table className="hw-table">
                    <thead>
                      <tr>
                        <th style={{ width: "36%" }}>Unidad / Volumen</th>
                        <th style={{ width: "24%" }}>Espacio Usado</th>
                        <th style={{ width: "15%" }}>Disponible (Free)</th>
                        <th style={{ width: "15%" }}>Capacidad Total</th>
                        <th style={{ width: "10%" }}>Uso %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report?.logicalDisks.map((ldisk) => (
                        <tr key={ldisk.deviceId}>
                          <td>
                            <span className="sensor-name">
                              <strong>{ldisk.deviceId}</strong>{" "}
                              {ldisk.volumeName ? `(${ldisk.volumeName})` : ""}
                              <span className="fs-tag">{ldisk.fileSystem}</span>
                            </span>
                          </td>
                          <td className="sensor-val highlight">
                            {ldisk.usedGb} <span className="unit">GB</span>
                          </td>
                          <td className="sensor-val-secondary">
                            {ldisk.freeGb} GB
                          </td>
                          <td className="sensor-text">{ldisk.sizeGb} GB</td>
                          <td>
                            <div className="mini-bar">
                              <i
                                className={loadTone(ldisk.usagePercent)}
                                style={{ width: `${ldisk.usagePercent}%` }}
                              />
                            </div>
                            <span className="disk-pct-text">
                              {ldisk.usagePercent}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
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
