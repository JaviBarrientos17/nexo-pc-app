import type { HardwareSectionProps } from "./HardwareSectionTypes";

export function StorageSection(props: HardwareSectionProps) {
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
    <>      {(category === "all" || category === "storage") &&
        matchesSearch(
          "Almacenamiento Discos SSD NVMe HDD SATA " +
            (report?.physicalDisks
              .map((d) => d.name + " " + d.busType)
              .join(" ") || ""),
        ) && (
          <section className="hw-card">
            <header
              className="hw-card-header"
              role="button"
              tabIndex={0}
              aria-expanded={!collapsed.storage}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleSection("storage");
                }
              }}
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
              <div className="hw-card-body">                <p className="sub-section-title">
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
                </div>                <p
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
    </>
  );
}
