import type { HardwareSectionProps } from "./HardwareSectionTypes";

export function CpuSection(props: HardwareSectionProps) {
  const {
    report,
    category,
    collapsed,
    matchesSearch,
    toggleSection,
    getMin,
    getMax,
    tempTone,
    loadTone,
  } = props;
  return (
    <>      {(category === "all" || category === "cpu") &&
        matchesSearch(
          "CPU Procesador Intel AMD Reloj Frecuencia Temperatura Carga " +
            (report?.cpu.name || ""),
        ) && (
          <section className="hw-card">
            <header
              className="hw-card-header"
              role="button"
              tabIndex={0}
              aria-expanded={!collapsed.cpu}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleSection("cpu");
                }
              }}
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
                  <tbody>                    <tr className="group-row">
                      <td colSpan={5}>
                        <span className="sensor-subcat">
                          FRECUENCIAS Y RELOJES
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
                    </tr>                    <tr className="group-row">
                      <td colSpan={5}>
                        <span className="sensor-subcat">TEMPERATURAS</span>
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
                    </tr>                    <tr className="group-row">
                      <td colSpan={5}>
                        <span className="sensor-subcat">UTILIZACIÓN</span>
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


    </>
  );
}
