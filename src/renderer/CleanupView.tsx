import { useEffect, useMemo, useState } from "react";
import type {
  CleanupCategoryId,
  CleanupFileEntry,
  CleanupItem,
  CleanupRunOptions,
} from "../shared/types";
import { Icon } from "./Icon";

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unit]}`;
}

function formatDate(isoOrDateString?: string): string {
  if (!isoOrDateString) return "—";
  try {
    const d = new Date(isoOrDateString);
    if (Number.isNaN(d.getTime())) return isoOrDateString;
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoOrDateString;
  }
}

export interface CleanupViewProps {
  items?: CleanupItem[];
  busy?: boolean;
  message?: string;
  error?: string;
  language: "es" | "en";
  onPreview: () => void;
  onClean: (target: (CleanupCategoryId | string)[] | CleanupRunOptions) => void;
}

type SortField = "size" | "date" | "name";
type SortDirection = "asc" | "desc";

export function CleanupView({
  items,
  busy = false,
  message,
  error,
  language,
  onPreview,
  onClean,
}: CleanupViewProps) {
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | CleanupCategoryId>("all");
  const [ageFilter, setAgeFilter] = useState<"all" | "older24h">("all");
  const [sortField, setSortField] = useState<SortField>("size");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Extract all files from items
  const allFiles: CleanupFileEntry[] = useMemo(() => {
    if (!items) return [];
    const list: CleanupFileEntry[] = [];
    for (const item of items) {
      if (item.files) {
        list.push(...item.files);
      }
    }
    return list;
  }, [items]);

  // Default selection initialization on items change
  useEffect(() => {
    if (!items || items.length === 0) return;

    setSelectedFileIds((prev) => {
      // If user had existing selections, preserve those that still exist
      const next = new Set<string>();
      const existingAvailable = new Set(allFiles.map((f) => f.id));

      if (prev.size > 0) {
        for (const id of prev) {
          if (existingAvailable.has(id)) {
            next.add(id);
          }
        }
      } else {
        // First load or fresh scan: preselect safe files (>24h temp files and all recycle bin items)
        for (const file of allFiles) {
          if (file.category === "recycle-bin" || file.isOlderThan24h) {
            next.add(file.id);
          }
        }
      }
      return next;
    });
  }, [items, allFiles]);

  // Overall metric counts
  const userTempItem = useMemo(() => items?.find((i) => i.id === "user-temp"), [items]);
  const recycleBinItem = useMemo(() => items?.find((i) => i.id === "recycle-bin"), [items]);

  const totalBytes = useMemo(() => (items ?? []).reduce((acc, i) => acc + i.sizeBytes, 0), [items]);
  const totalFilesCount = useMemo(() => (items ?? []).reduce((acc, i) => acc + i.fileCount, 0), [items]);

  // Selection metrics
  const selectedFilesList = useMemo(
    () => allFiles.filter((f) => selectedFileIds.has(f.id)),
    [allFiles, selectedFileIds],
  );

  const selectedBytes = useMemo(
    () => selectedFilesList.reduce((acc, f) => acc + f.sizeBytes, 0),
    [selectedFilesList],
  );

  const selectedTempCount = useMemo(
    () => selectedFilesList.filter((f) => f.category === "user-temp").length,
    [selectedFilesList],
  );
  const selectedTempBytes = useMemo(
    () =>
      selectedFilesList
        .filter((f) => f.category === "user-temp")
        .reduce((acc, f) => acc + f.sizeBytes, 0),
    [selectedFilesList],
  );

  const selectedBinCount = useMemo(
    () => selectedFilesList.filter((f) => f.category === "recycle-bin").length,
    [selectedFilesList],
  );
  const selectedBinBytes = useMemo(
    () =>
      selectedFilesList
        .filter((f) => f.category === "recycle-bin")
        .reduce((acc, f) => acc + f.sizeBytes, 0),
    [selectedFilesList],
  );

  // Filtered & sorted files list
  const filteredFiles = useMemo(() => {
    let result = allFiles;

    if (activeCategory !== "all") {
      result = result.filter((f) => f.category === activeCategory);
    }

    if (ageFilter === "older24h") {
      result = result.filter((f) => f.isOlderThan24h);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.path.toLowerCase().includes(q) ||
          (f.originalPath && f.originalPath.toLowerCase().includes(q)) ||
          (f.itemType && f.itemType.toLowerCase().includes(q)),
      );
    }

    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "size") {
        cmp = a.sizeBytes - b.sizeBytes;
      } else if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === "date") {
        const da = a.deletedAt || a.modifiedAt || "";
        const db = b.deletedAt || b.modifiedAt || "";
        cmp = da.localeCompare(db);
      }
      return sortDirection === "desc" ? -cmp : cmp;
    });
  }, [allFiles, activeCategory, ageFilter, search, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedFiles = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredFiles.slice(start, start + pageSize);
  }, [filteredFiles, validCurrentPage, pageSize]);

  // Selection actions
  const toggleFile = (id: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllFilteredSelected =
    filteredFiles.length > 0 &&
    filteredFiles.every((f) => selectedFileIds.has(f.id));

  const toggleSelectAllFiltered = () => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (isAllFilteredSelected) {
        for (const f of filteredFiles) next.delete(f.id);
      } else {
        for (const f of filteredFiles) next.add(f.id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedFileIds(new Set(allFiles.map((f) => f.id)));
  };

  const deselectAll = () => {
    setSelectedFileIds(new Set());
  };

  const selectOlderThan24h = () => {
    setSelectedFileIds(
      new Set(
        allFiles
          .filter((f) => f.isOlderThan24h || f.category === "recycle-bin")
          .map((f) => f.id),
      ),
    );
  };

  const handleExecuteClean = () => {
    if (selectedFileIds.size === 0) return;
    setConfirmModalOpen(false);

    // If all items in recycle bin are selected and all temp files selected, pass categoryIds
    const selectedList = Array.from(selectedFileIds);
    onClean({ fileIds: selectedList });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <>
      <section className="hero hw-hero cleanup-hero">
        <div>
          <p className="eyebrow">MANTENIMIENTO INDUSTRIAL // ALMACENAMIENTO</p>
          <h1>Limpieza y Papelera de Reciclaje</h1>
          <p className="hero-copy">
            Inspección granular de archivos temporales y vaciado selectivo de la papelera.
            Elige con precisión qué archivos purgar de forma permanente.
          </p>
        </div>

        <div className="hw-quick-chips">
          <div className="hw-chip">
            <span className="hw-chip-label">TEMPORALES</span>
            <strong>{formatBytes(userTempItem?.sizeBytes ?? 0)}</strong>
            <small>{userTempItem?.fileCount ?? 0} {language === "en" ? "files" : "archivos"}</small>
          </div>
          <div className="hw-chip">
            <span className="hw-chip-label">PAPELERA</span>
            <strong>{formatBytes(recycleBinItem?.sizeBytes ?? 0)}</strong>
            <small>{recycleBinItem?.fileCount ?? 0} {language === "en" ? "items" : "elementos"}</small>
          </div>
          <div className="hw-chip">
            <span className="hw-chip-label">TOTAL DETECTADO</span>
            <strong>{formatBytes(totalBytes)}</strong>
            <small>{totalFilesCount} {language === "en" ? "items total" : "elementos en total"}</small>
          </div>
          <div className={`hw-chip cleanup-chip-selected ${selectedFileIds.size > 0 ? "active" : ""}`}>
            <span className="hw-chip-label">SELECCIONADO</span>
            <strong className="mono">{formatBytes(selectedBytes)}</strong>
            <small>{selectedFileIds.size} {language === "en" ? "files to delete" : "archivos a purgar"}</small>
          </div>
        </div>
      </section>

      {/* Industrial Controls Toolbar */}
      <div className="hw-controls-bar cleanup-controls-bar">
        <div className="hw-filter-tabs">
          <button
            className={`filter-tab ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => {
              setActiveCategory("all");
              setCurrentPage(1);
            }}
          >
            Todos ({allFiles.length})
          </button>
          <button
            className={`filter-tab ${activeCategory === "user-temp" ? "active" : ""}`}
            onClick={() => {
              setActiveCategory("user-temp");
              setCurrentPage(1);
            }}
          >
            Temporales ({userTempItem?.fileCount ?? 0})
          </button>
          <button
            className={`filter-tab ${activeCategory === "recycle-bin" ? "active" : ""}`}
            onClick={() => {
              setActiveCategory("recycle-bin");
              setCurrentPage(1);
            }}
          >
            Papelera ({recycleBinItem?.fileCount ?? 0})
          </button>
        </div>

        <div className="hw-actions-right">
          <div className="hw-search-box">
            <Icon name="sparkles" size={14} />
            <input
              type="text"
              placeholder={
                language === "en"
                  ? "Search by file, ext, or path..."
                  : "Buscar por archivo, ext o ruta..."
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch("")}
                title="Borrar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          <button
            className={`hw-btn ${ageFilter === "older24h" ? "active-filter" : ""}`}
            onClick={() => setAgeFilter((prev) => (prev === "older24h" ? "all" : "older24h"))}
            title="Mostrar solo archivos con más de 24 horas"
          >
            {ageFilter === "older24h" ? "✓ Solo > 24 h" : "Filtro > 24 h"}
          </button>

          <button
            className="hw-btn"
            onClick={selectOlderThan24h}
            title="Seleccionar archivos seguros para eliminar"
          >
            Seleccionar &gt; 24h
          </button>

          <button
            className="hw-btn"
            onClick={selectAll}
            title="Seleccionar todos los archivos detectados"
          >
            Seleccionar todo
          </button>

          <button
            className="hw-btn"
            onClick={deselectAll}
            title="Deseleccionar todos los archivos"
          >
            Deseleccionar
          </button>

          <button
            className="secondary-button hw-btn"
            onClick={onPreview}
            disabled={busy}
            title="Escanear y actualizar lista de archivos"
          >
            <Icon name="refresh" size={14} />
            {busy ? "Analizando…" : "Analizar"}
          </button>
        </div>
      </div>

      {/* Main File Table Surface */}
      <article className="hw-card cleanup-table-card">
        <header className="hw-card-header cleanup-card-header">
          <div className="hw-header-title">
            <span className="hw-icon-badge orange">
              <Icon name="trash" size={16} />
            </span>
            <div>
              <h3>
                {language === "en"
                  ? "Files detected for deletion"
                  : "Archivos detectados para eliminación"}
              </h3>
              <small>
                {filteredFiles.length}{" "}
                {language === "en" ? "matching files" : "archivos coincidentes"} ·{" "}
                {selectedFileIds.size} {language === "en" ? "selected" : "seleccionados"} (
                {formatBytes(selectedBytes)})
              </small>
            </div>
          </div>

          <div className="cleanup-header-stats">
            <span className="cleanup-showing-badge mono">
              {filteredFiles.length === 0
                ? "0 - 0"
                : `${(validCurrentPage - 1) * pageSize + 1} - ${Math.min(
                    validCurrentPage * pageSize,
                    filteredFiles.length,
                  )} de ${filteredFiles.length}`}
            </span>
          </div>
        </header>

        <div className="hw-card-body cleanup-table-container">
          {items === undefined && !busy ? (
            <div className="empty-state">
              <Icon name="refresh" size={32} />
              <p>Pulsa «Analizar» para escanear archivos temporales y consultar la Papelera.</p>
              <button className="primary-button" onClick={onPreview}>
                <Icon name="refresh" size={15} />
                Analizar ahora
              </button>
            </div>
          ) : busy && (!items || allFiles.length === 0) ? (
            <div className="empty-state cleanup-loading-state">
              <span className="hardware-loading-spinner" />
              <p>Escaneando ubicaciones del sistema y papelera de reciclaje…</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron archivos que coincidan con los filtros aplicados.</p>
              {(search || ageFilter !== "all" || activeCategory !== "all") && (
                <button
                  className="secondary-button"
                  onClick={() => {
                    setSearch("");
                    setAgeFilter("all");
                    setActiveCategory("all");
                  }}
                >
                  Restablecer filtros
                </button>
              )}
            </div>
          ) : (
            <table className="hw-table cleanup-table">
              <thead>
                <tr>
                  <th style={{ width: "42px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      className="cleanup-checkbox"
                      checked={isAllFilteredSelected}
                      onChange={toggleSelectAllFiltered}
                      title="Seleccionar o deseleccionar visibles"
                      aria-label="Seleccionar o deseleccionar visibles"
                    />
                  </th>
                  <th style={{ width: "65px" }}>TIPO</th>
                  <th
                    style={{ width: "45%", cursor: "pointer" }}
                    onClick={() => toggleSort("name")}
                    title="Ordenar por nombre"
                  >
                    NOMBRE Y RUTA {sortField === "name" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th style={{ width: "16%" }}>CATEGORÍA</th>
                  <th
                    style={{ width: "16%", cursor: "pointer" }}
                    onClick={() => toggleSort("date")}
                    title="Ordenar por fecha"
                  >
                    ANTIGÜEDAD {sortField === "date" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th
                    style={{ width: "15%", textAlign: "right", cursor: "pointer" }}
                    onClick={() => toggleSort("size")}
                    title="Ordenar por tamaño"
                  >
                    TAMAÑO {sortField === "size" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedFiles.map((file) => {
                  const isSelected = selectedFileIds.has(file.id);
                  return (
                    <tr
                      key={file.id}
                      className={`cleanup-row-tr ${isSelected ? "selected-tr" : ""}`}
                      onClick={() => toggleFile(file.id)}
                    >
                      <td
                        style={{ textAlign: "center" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="cleanup-checkbox"
                          checked={isSelected}
                          onChange={() => toggleFile(file.id)}
                          aria-label={`Seleccionar ${file.name}`}
                        />
                      </td>

                      <td>
                        <span className={`file-type-badge ${file.category}`}>
                          {file.itemType || "TMP"}
                        </span>
                      </td>

                      <td>
                        <div className="cleanup-file-info">
                          <strong className="cleanup-file-name mono" title={file.name}>
                            {file.name}
                          </strong>
                          <small
                            className="cleanup-file-path mono"
                            title={file.originalPath || file.path}
                          >
                            {file.originalPath ? `Origen: ${file.originalPath}` : file.path}
                          </small>
                        </div>
                      </td>

                      <td>
                        <span className={`cleanup-cat-tag ${file.category}`}>
                          {file.category === "recycle-bin"
                            ? "Papelera"
                            : "Temporal Usuario"}
                        </span>
                      </td>

                      <td>
                        <div className="cleanup-age-cell">
                          <span
                            className={`metric-chip ${file.isOlderThan24h ? "ok" : "warning"}`}
                          >
                            {file.isOlderThan24h ? "> 24 h" : "Reciente"}
                          </span>
                          <small className="mono">
                            {formatDate(file.deletedAt || file.modifiedAt)}
                          </small>
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <strong className="cleanup-size-val mono">
                          {formatBytes(file.sizeBytes)}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination bar */}
        {filteredFiles.length > pageSize && (
          <div className="cleanup-pagination-bar">
            <div className="cleanup-page-controls">
              <button
                className="hw-btn"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage(1)}
                title="Primera página"
              >
                ««
              </button>
              <button
                className="hw-btn"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span className="cleanup-page-indicator mono">
                Página {validCurrentPage} de {totalPages}
              </span>
              <button
                className="hw-btn"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </button>
              <button
                className="hw-btn"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Última página"
              >
                »»
              </button>
            </div>

            <div className="cleanup-page-size-selector">
              <span className="cleanup-size-label">Por página:</span>
              {[50, 100, 250].map((size) => (
                <button
                  key={size}
                  className={`hw-btn ${pageSize === size ? "active-filter" : ""}`}
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Floating Action / Summary Panel */}
      <div className="cleanup-action-dock surface">
        <div className="cleanup-dock-summary">
          <div className="cleanup-dock-metric">
            <span className="section-kicker">SELECCIÓN ACTUAL</span>
            <div className="cleanup-dock-numbers">
              <strong className="mono">{formatBytes(selectedBytes)}</strong>
              <small>
                {selectedFileIds.size} de {allFiles.length}{" "}
                {language === "en" ? "files selected" : "archivos seleccionados"}
              </small>
            </div>
          </div>

          <div className="cleanup-dock-feedback">
            {message && (
              <div className="cleanup-feedback success-banner" role="status">
                <Icon name="check" size={16} />
                <span>{message}</span>
              </div>
            )}
            {error && (
              <div className="cleanup-feedback error-banner" role="alert">
                <Icon name="alert" size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="cleanup-dock-actions">
          <button
            className="danger-button cleanup-execute-button"
            onClick={() => setConfirmModalOpen(true)}
            disabled={busy || selectedFileIds.size === 0}
          >
            <Icon name="trash" size={16} />
            <span>
              {busy
                ? language === "en"
                  ? "Deleting..."
                  : "Eliminando…"
                : language === "en"
                  ? `Clean selected (${formatBytes(selectedBytes)})`
                  : `Limpiar seleccionados (${formatBytes(selectedBytes)})`}
            </span>
          </button>
        </div>
      </div>

      {/* Industrial Safety Note */}
      <div className="safety-note cleanup-safety-note">
        <Icon name="shield" size={20} />
        <div>
          <strong>Protección activa y control granular.</strong>
          <span>
            {" "}Solo se eliminarán los archivos marcados en la tabla superior. Los temporales en uso
            por Windows o por aplicaciones abiertas se omitirán de forma segura sin interrumpir procesos.
            Los elementos de la papelera seleccionados se purgarán definitivamente.
          </span>
        </div>
      </div>

      {/* Industrial Confirmation Modal */}
      {confirmModalOpen && (
        <div className="cleanup-modal-overlay" role="dialog" aria-modal="true">
          <div className="cleanup-modal-card hw-card">
            <header className="cleanup-modal-header">
              <span className="hw-icon-badge red">
                <Icon name="alert" size={18} />
              </span>
              <div>
                <h3>Confirmar purga permanente</h3>
                <small>Esta acción no se puede deshacer</small>
              </div>
              <button
                className="cleanup-modal-close"
                onClick={() => setConfirmModalOpen(false)}
              >
                ×
              </button>
            </header>

            <div className="cleanup-modal-body">
              <p className="cleanup-modal-text">
                Estás a punto de eliminar de forma irreversible los siguientes elementos de tu equipo:
              </p>

              <div className="cleanup-modal-breakdown">
                <div className="breakdown-row">
                  <span>Archivos temporales seleccionados:</span>
                  <strong className="mono">
                    {selectedTempCount} ({formatBytes(selectedTempBytes)})
                  </strong>
                </div>
                <div className="breakdown-row">
                  <span>Elementos de papelera seleccionados:</span>
                  <strong className="mono">
                    {selectedBinCount} ({formatBytes(selectedBinBytes)})
                  </strong>
                </div>
                <div className="breakdown-row total-row">
                  <span>Espacio total a liberar:</span>
                  <strong className="mono cleanup-total-text">
                    {formatBytes(selectedBytes)}
                  </strong>
                </div>
              </div>

              <div className="cleanup-modal-warning">
                <Icon name="shield" size={16} />
                <span>
                  Los archivos bloqueados por el sistema operativo o aplicaciones en ejecución
                  serán omitidos automáticamente por seguridad.
                </span>
              </div>
            </div>

            <footer className="cleanup-modal-footer">
              <button
                className="secondary-button"
                onClick={() => setConfirmModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="danger-button"
                onClick={handleExecuteClean}
              >
                <Icon name="trash" size={15} />
                Confirmar eliminación ({formatBytes(selectedBytes)})
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
