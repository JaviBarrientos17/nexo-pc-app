import type { HardwareSectionProps } from "./HardwareSectionTypes";

export function GpuSection(props: HardwareSectionProps) {
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
    <>      {(category === "all" || category === "gpu") &&
        matchesSearch(
          "GPU Gráfica Nvidia Radeon Intel GeForce VRAM " +
            (report?.gpu.name || ""),
        ) && (
          <section className="hw-card">
            <header
              className="hw-card-header"
              role="button"
              tabIndex={0}
              aria-expanded={!collapsed.gpu}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleSection("gpu");
                }
              }}
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
                  <tbody>                    {report?.gpu.temperatureC !== undefined && (
                      <>
                        <tr className="group-row">
                          <td colSpan={5}>
                            <span className="sensor-subcat">
                              TEMPERATURA GPU
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
                      )}                      <tr className="group-row">
                        <td colSpan={5}>
                          <span className="sensor-subcat">
                            UTILIZACIÓN & CARGA
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
                      )}                      {report?.gpu.memoryTotalMb !== undefined && (
                        <>
                          <tr className="group-row">
                            <td colSpan={5}>
                              <span className="sensor-subcat">
                                MEMORIA DE VIDEO (VRAM)
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
                      )}                      {(report?.gpu.powerDrawWatts !== undefined ||
                        report?.gpu.fanSpeedPercent !== undefined) && (
                        <>
                          <tr className="group-row">
                            <td colSpan={5}>
                              <span className="sensor-subcat">
                                ENERGÍA & VENTILADORES
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


    </>
  );
}
