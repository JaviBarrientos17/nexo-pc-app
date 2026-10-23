import type { HardwareSectionProps } from "./HardwareSectionTypes";

export function MemorySection(props: HardwareSectionProps) {
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
    <>      {(category === "all" || category === "ram") &&
        matchesSearch(
          "RAM Memoria DDR4 DDR5 Corsair Kingston Slots " +
            (report?.memory.modules
              .map((m) => m.manufacturer + " " + m.partNumber)
              .join(" ") || ""),
        ) && (
          <section className="hw-card">
            <header
              className="hw-card-header"
              role="button"
              tabIndex={0}
              aria-expanded={!collapsed.ram}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleSection("ram");
                }
              }}
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
                          MEMORIA FÍSICA
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
                          MEMORIA VIRTUAL / ARCHIVO DE PAGINACIÓN
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
                  </table>                  {report?.memory.modules &&
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


    </>
  );
}
