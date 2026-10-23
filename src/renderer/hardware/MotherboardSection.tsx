import type { HardwareSectionProps } from "./HardwareSectionTypes";

export function MotherboardSection(props: HardwareSectionProps) {
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
    <>      {(category === "all" || category === "motherboard") &&
        matchesSearch(
          "Placa Base Motherboard BIOS Gigabyte Asus MSI ASRock " +
            (report?.motherboard.product || ""),
        ) && (
          <section className="hw-card">
            <header
              className="hw-card-header"
              role="button"
              tabIndex={0}
              aria-expanded={!collapsed.motherboard}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleSection("motherboard");
                }
              }}
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


    </>
  );
}
