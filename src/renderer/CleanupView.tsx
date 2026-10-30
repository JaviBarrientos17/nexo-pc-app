import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CleanupCategoryId,
  CleanupFileEntry,
  CleanupItem,
  CleanupRunOptions,
} from "../shared/types";
import { Icon } from "./Icon";
import "./cleanup.css";

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

function formatDate(value: string | undefined, locale: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ───────────── Textos ───────────── */

const TEXT = {
  es: {
    title: "Limpieza",
    stripTitle: "Archivos detectados",
    selCount: (n: number, loc: string) =>
      `${n.toLocaleString(loc)} seleccionados`,
    armed: "Selección activa",
    idle: "Sin selección",
    selectToClean: "Selecciona archivos",
    irreversible: "Acción irreversible",
    subtitle:
      "Revisa qué ocupa espacio y elige qué eliminar. No se borra nada hasta que lo confirmes.",
    analyze: "Analizar",
    analyzing: "Analizando…",
    detected: "detectado para limpiar",
    temp: "Archivos temporales",
    bin: "Papelera de reciclaje",
    all: "Todos",
    tempTab: "Temporales",
    binTab: "Papelera",
    search: "Buscar por nombre, tipo o ruta",
    clearSearch: "Borrar búsqueda",
    older: "Más de 24 h",
    selectSafe: "Seleccionar seguros",
    selectAll: "Todo",
    selectNone: "Ninguno",
    colType: "Tipo",
    colName: "Nombre y ruta",
    colCat: "Categoría",
    colAge: "Antigüedad",
    colSize: "Tamaño",
    recent: "Reciente",
    origin: "Origen",
    selectVisible: "Seleccionar o deseleccionar los visibles",
    selectRow: (n: string) => `Seleccionar ${n}`,
    emptyIdle:
      "Pulsa «Analizar» para buscar archivos temporales y revisar la papelera.",
    scanning: "Buscando archivos temporales y revisando la papelera…",
    noMatches: "Ningún archivo coincide con los filtros.",
    resetFilters: "Quitar filtros",
    perPage: "Por página",
    prev: "Anterior",
    next: "Siguiente",
    page: (p: number, t: number) => `Página ${p} de ${t}`,
    range: (a: number, b: number, t: number, loc: string) =>
      t === 0
        ? "0 resultados"
        : `${a.toLocaleString(loc)}–${b.toLocaleString(loc)} de ${t.toLocaleString(loc)}`,
    files: (n: number, loc: string) =>
      n === 1 ? "1 archivo" : `${n.toLocaleString(loc)} archivos`,
    itemsOf: (n: number, t: number, loc: string) =>
      `${n.toLocaleString(loc)} de ${t.toLocaleString(loc)} archivos seleccionados`,
    clean: (size: string) => `Limpiar ${size}`,
    cleaning: "Eliminando…",
    footnote:
      "Los archivos en uso por Windows o por otras aplicaciones se omiten sin interrumpir nada. Lo que elimines aquí no se puede recuperar.",
    modalTitle: (n: string) => `¿Eliminar ${n}?`,
    modalFree: (size: string) =>
      `Vas a liberar ${size}. Esta acción es permanente y no se puede deshacer.`,
    modalBinNote: "Se vacía definitivamente de la papelera",
    modalTempNote: "Se eliminan del disco, no pasan por la papelera",
    largest: "Los más grandes",
    andMore: (n: number, loc: string) => `y ${n.toLocaleString(loc)} más`,
    recentWarn: (n: number, loc: string) =>
      `Incluye ${n.toLocaleString(loc)} ${n === 1 ? "archivo modificado" : "archivos modificados"} en las últimas 24 h que podrían estar en uso.`,
    cancel: "Cancelar",
    confirm: "Eliminar definitivamente",
  },
  en: {
    title: "Cleanup",
    eyebrow: "Maintenance // Storage",
    stripTitle: "Detected files",
    selCount: (n: number, loc: string) => `${n.toLocaleString(loc)} selected`,
    armed: "Selection active",
    idle: "Nothing selected",
    selectToClean: "Select files",
    irreversible: "Irreversible action",
    subtitle:
      "See what is taking up space and choose what to delete. Nothing is removed until you confirm.",
    analyze: "Scan",
    analyzing: "Scanning…",
    detected: "found to clean",
    temp: "Temporary files",
    bin: "Recycle Bin",
    all: "All",
    tempTab: "Temporary",
    binTab: "Recycle Bin",
    search: "Search by name, type or path",
    clearSearch: "Clear search",
    older: "Older than 24 h",
    selectSafe: "Select safe ones",
    selectAll: "All",
    selectNone: "None",
    colType: "Type",
    colName: "Name and path",
    colCat: "Category",
    colAge: "Age",
    colSize: "Size",
    recent: "Recent",
    origin: "From",
    selectVisible: "Select or deselect visible files",
    selectRow: (n: string) => `Select ${n}`,
    emptyIdle:
      "Press “Scan” to look for temporary files and check the Recycle Bin.",
    scanning: "Looking for temporary files and checking the Recycle Bin…",
    noMatches: "No files match the current filters.",
    resetFilters: "Clear filters",
    perPage: "Per page",
    prev: "Previous",
    next: "Next",
    page: (p: number, t: number) => `Page ${p} of ${t}`,
    range: (a: number, b: number, t: number, loc: string) =>
      t === 0
        ? "0 results"
        : `${a.toLocaleString(loc)}–${b.toLocaleString(loc)} of ${t.toLocaleString(loc)}`,
    files: (n: number, loc: string) =>
      n === 1 ? "1 file" : `${n.toLocaleString(loc)} files`,
    itemsOf: (n: number, t: number, loc: string) =>
      `${n.toLocaleString(loc)} of ${t.toLocaleString(loc)} files selected`,
    clean: (size: string) => `Clean ${size}`,
    cleaning: "Deleting…",
    footnote:
      "Files in use by Windows or other apps are skipped without interrupting anything. What you delete here cannot be recovered.",
    modalTitle: (n: string) => `Delete ${n}?`,
    modalFree: (size: string) =>
      `You will free ${size}. This is permanent and cannot be undone.`,
    modalBinNote: "Permanently emptied from the Recycle Bin",
    modalTempNote: "Deleted from disk, not sent to the Recycle Bin",
    largest: "Largest files",
    andMore: (n: number, loc: string) => `and ${n.toLocaleString(loc)} more`,
    recentWarn: (n: number, loc: string) =>
      `Includes ${n.toLocaleString(loc)} ${n === 1 ? "file" : "files"} modified in the last 24 h that may be in use.`,
    cancel: "Cancel",
    confirm: "Delete permanently",
  },
} as const;

/* ───────────── Iconos locales ───────────── */

function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 3.5L5 6.5L8 3.5" />
    </svg>
  );
}

/* ───────────── Componente ───────────── */

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
type CategoryFilter = "all" | CleanupCategoryId;

export function CleanupView({
  items,
  busy = false,
  message,
  error,
  language,
  onPreview,
  onClean,
}: CleanupViewProps) {
  const t = TEXT[language];
  const locale = language === "en" ? "en-US" : "es-ES";

  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    new Set(),
  );
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [onlyOlder, setOnlyOlder] = useState(false);
  const [sortField, setSortField] = useState<SortField>("size");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const allFiles: CleanupFileEntry[] = useMemo(() => {
    if (!items) return [];
    const list: CleanupFileEntry[] = [];
    for (const item of items) {
      if (item.files) list.push(...item.files);
    }
    return list;
  }, [items]);

  // Nunca se preselecciona nada: el usuario elige de forma explícita.
  // Con cada análisis nuevo solo se descartan los ids que ya no existen.
  useEffect(() => {
    setSelectedFileIds((prev) => {
      if (prev.size === 0) return prev;
      const available = new Set(allFiles.map((f) => f.id));
      const next = new Set<string>();
      for (const id of prev) if (available.has(id)) next.add(id);
      return next.size === prev.size ? prev : next;
    });
  }, [allFiles]);

  /* Contadores globales (según los archivos realmente listados) */
  const totals = useMemo(() => {
    const acc = {
      temp: { bytes: 0, count: 0 },
      bin: { bytes: 0, count: 0 },
    };
    for (const f of allFiles) {
      const slot = f.category === "recycle-bin" ? acc.bin : acc.temp;
      slot.bytes += f.sizeBytes;
      slot.count += 1;
    }
    return acc;
  }, [allFiles]);
  const totalBytes = totals.temp.bytes + totals.bin.bytes;

  /* Estadísticas de la selección en una sola pasada */
  const selection = useMemo(() => {
    const s = {
      list: [] as CleanupFileEntry[],
      bytes: 0,
      tempCount: 0,
      tempBytes: 0,
      binCount: 0,
      binBytes: 0,
      recentCount: 0,
    };
    for (const f of allFiles) {
      if (!selectedFileIds.has(f.id)) continue;
      s.list.push(f);
      s.bytes += f.sizeBytes;
      if (f.category === "recycle-bin") {
        s.binCount += 1;
        s.binBytes += f.sizeBytes;
      } else {
        s.tempCount += 1;
        s.tempBytes += f.sizeBytes;
        if (!f.isOlderThan24h) s.recentCount += 1;
      }
    }
    return s;
  }, [allFiles, selectedFileIds]);

  const largestSelected = useMemo(() => {
    if (!confirmOpen) return [];
    return [...selection.list]
      .sort((a, b) => b.sizeBytes - a.sizeBytes)
      .slice(0, 4);
  }, [confirmOpen, selection.list]);

  /* Filtrado y orden */
  const filteredFiles = useMemo(() => {
    let result = allFiles;
    if (activeCategory !== "all")
      result = result.filter((f) => f.category === activeCategory);
    if (onlyOlder) result = result.filter((f) => f.isOlderThan24h);
    const q = search.trim().toLowerCase();
    if (q) {
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
      if (sortField === "size") cmp = a.sizeBytes - b.sizeBytes;
      else if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else
        cmp = (a.deletedAt || a.modifiedAt || "").localeCompare(
          b.deletedAt || b.modifiedAt || "",
        );
      return sortDirection === "desc" ? -cmp : cmp;
    });
  }, [allFiles, activeCategory, onlyOlder, search, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const pageFiles = useMemo(
    () => filteredFiles.slice((page - 1) * pageSize, page * pageSize),
    [filteredFiles, page, pageSize],
  );

  /* Selección */
  const toggleFile = (id: string) =>
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allFilteredSelected =
    filteredFiles.length > 0 &&
    filteredFiles.every((f) => selectedFileIds.has(f.id));

  const toggleFiltered = () =>
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      for (const f of filteredFiles) {
        if (allFilteredSelected) next.delete(f.id);
        else next.add(f.id);
      }
      return next;
    });

  const selectAll = () =>
    setSelectedFileIds(new Set(allFiles.map((f) => f.id)));
  const selectNone = () => setSelectedFileIds(new Set());
  const selectSafe = () =>
    setSelectedFileIds(
      new Set(
        allFiles
          .filter((f) => f.isOlderThan24h || f.category === "recycle-bin")
          .map((f) => f.id),
      ),
    );

  const toggleSort = (field: SortField) => {
    if (sortField === field)
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setOnlyOlder(false);
    setActiveCategory("all");
  };

  const goCategory = (cat: CategoryFilter) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  /* Confirmación */
  const handleExecuteClean = () => {
    if (selectedFileIds.size === 0) return;
    setConfirmOpen(false);
    onClean({ fileIds: Array.from(selectedFileIds) });
  };

  useEffect(() => {
    if (!confirmOpen) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  const sortProps = (field: SortField) => ({
    "aria-sort":
      sortField === field
        ? sortDirection === "asc"
          ? "ascending"
          : "descending"
        : ("none" as const),
  });

  const sortButton = (field: SortField, label: string) => (
    <button
      type="button"
      className="cl-th-btn"
      data-dir={sortField === field ? sortDirection : undefined}
      onClick={() => toggleSort(field)}
    >
      {label}
      {sortField === field && <SortIcon />}
    </button>
  );

  const hasData = allFiles.length > 0;
  const barEmpty = totalBytes === 0;
  const hasFilters = search !== "" || onlyOlder || activeCategory !== "all";
  const rangeStart = filteredFiles.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, filteredFiles.length);

  return (
    <div className="cl-root">
      {/* Cabecera */}
      <header className="cl-head">
        <div>
          <p className="cl-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <button
          type="button"
          className="cl-btn"
          onClick={onPreview}
          disabled={busy}
        >
          <Icon name="refresh" size={14} />
          {busy ? t.analyzing : t.analyze}
        </button>
      </header>

      {/* Resumen de espacio */}
      <section className="cl-overview" aria-label={t.detected}>
        <div className="cl-total">
          <strong className="cl-num">{formatBytes(totalBytes)}</strong>
          <span>{t.detected}</span>
        </div>
        <div className="cl-compose">
          <div
            className={`cl-bar ${barEmpty ? "empty" : ""}`}
            aria-hidden="true"
          >
            {barEmpty ? (
              <i />
            ) : (
              <>
                {totals.temp.bytes > 0 && (
                  <i className="temp" style={{ flexGrow: totals.temp.bytes }} />
                )}
                {totals.bin.bytes > 0 && (
                  <i className="bin" style={{ flexGrow: totals.bin.bytes }} />
                )}
              </>
            )}
          </div>
          <div className="cl-ruler" aria-hidden="true" />
          <div className="cl-legend">
            <div>
              <span className="cl-dot temp" />
              <span>{t.temp}</span>
              <b className="cl-num">{formatBytes(totals.temp.bytes)}</b>
              <small>{t.files(totals.temp.count, locale)}</small>
            </div>
            <div>
              <span className="cl-dot bin" />
              <span>{t.bin}</span>
              <b className="cl-num">{formatBytes(totals.bin.bytes)}</b>
              <small>{t.files(totals.bin.count, locale)}</small>
            </div>
          </div>
        </div>
      </section>

      {/* Herramientas */}
      <div className="cl-toolbar">
        <div className="cl-tabs" role="group" aria-label={t.colCat}>
          <button
            type="button"
            className="cl-tab"
            aria-pressed={activeCategory === "all"}
            onClick={() => goCategory("all")}
          >
            {t.all}
            <small className="cl-num">
              {allFiles.length.toLocaleString(locale)}
            </small>
          </button>
          <button
            type="button"
            className="cl-tab"
            aria-pressed={activeCategory === "user-temp"}
            onClick={() => goCategory("user-temp")}
          >
            {t.tempTab}
            <small className="cl-num">
              {totals.temp.count.toLocaleString(locale)}
            </small>
          </button>
          <button
            type="button"
            className="cl-tab"
            aria-pressed={activeCategory === "recycle-bin"}
            onClick={() => goCategory("recycle-bin")}
          >
            {t.binTab}
            <small className="cl-num">
              {totals.bin.count.toLocaleString(locale)}
            </small>
          </button>
        </div>

        <div className="cl-tools">
          <label className="cl-search">
            <SearchIcon />
            <input
              type="text"
              placeholder={t.search}
              aria-label={t.search}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label={t.clearSearch}
                title={t.clearSearch}
              >
                <CloseIcon />
              </button>
            )}
          </label>

          <button
            type="button"
            className="cl-chip"
            aria-pressed={onlyOlder}
            onClick={() => {
              setOnlyOlder((v) => !v);
              setCurrentPage(1);
            }}
          >
            {t.older}
          </button>

          <span className="cl-sep" aria-hidden="true" />

          <button type="button" className="cl-link" onClick={selectSafe}>
            {t.selectSafe}
          </button>
          <button type="button" className="cl-link" onClick={selectAll}>
            {t.selectAll}
          </button>
          <button type="button" className="cl-link" onClick={selectNone}>
            {t.selectNone}
          </button>
        </div>
      </div>

      {/* Tabla */}
      <section className="cl-card">
        {items === undefined && !busy ? (
          <div className="cl-empty">
            <Icon name="refresh" size={28} />
            <p>{t.emptyIdle}</p>
            <button type="button" className="cl-btn" onClick={onPreview}>
              {t.analyze}
            </button>
          </div>
        ) : busy && !hasData ? (
          <div className="cl-empty">
            <span className="cl-spinner" role="status" />
            <p>{t.scanning}</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="cl-empty">
            <p>{t.noMatches}</p>
            {hasFilters && (
              <button type="button" className="cl-btn" onClick={resetFilters}>
                {t.resetFilters}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="cl-strip">
              <span className="cl-label">{t.stripTitle}</span>
              <span className="cl-label cl-num">
                {t.selCount(selection.list.length, locale)}
              </span>
            </div>
            <div className="cl-scroll">
              <table className="cl-table">
                <thead>
                  <tr>
                    <th className="cl-col-check">
                      <input
                        type="checkbox"
                        className="cl-check"
                        checked={allFilteredSelected}
                        onChange={toggleFiltered}
                        aria-label={t.selectVisible}
                        title={t.selectVisible}
                      />
                    </th>
                    <th className="cl-col-type">{t.colType}</th>
                    <th {...sortProps("name")}>
                      {sortButton("name", t.colName)}
                    </th>
                    <th className="cl-col-cat">{t.colCat}</th>
                    <th className="cl-col-age" {...sortProps("date")}>
                      {sortButton("date", t.colAge)}
                    </th>
                    <th className="cl-col-size" {...sortProps("size")}>
                      {sortButton("size", t.colSize)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageFiles.map((file) => {
                    const selected = selectedFileIds.has(file.id);
                    const fullPath = file.originalPath || file.path;
                    return (
                      <tr
                        key={file.id}
                        aria-selected={selected}
                        onClick={() => toggleFile(file.id)}
                      >
                        <td
                          className="cl-col-check"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="cl-check"
                            checked={selected}
                            onChange={() => toggleFile(file.id)}
                            aria-label={t.selectRow(file.name)}
                          />
                        </td>
                        <td className="cl-col-type">
                          <span className={`cl-type ${file.category}`}>
                            {file.itemType || "TMP"}
                          </span>
                        </td>
                        <td>
                          <div className="cl-file">
                            <strong className="cl-mono" title={file.name}>
                              {file.name}
                            </strong>
                            <small className="cl-mono" title={fullPath}>
                              <bdi>
                                {file.originalPath
                                  ? `${t.origin}: ${file.originalPath}`
                                  : file.path}
                              </bdi>
                            </small>
                          </div>
                        </td>
                        <td className="cl-col-cat">
                          <span className="cl-pill">
                            <span
                              className={`cl-dot ${file.category === "recycle-bin" ? "bin" : "temp"}`}
                            />
                            {file.category === "recycle-bin"
                              ? t.binTab
                              : t.tempTab}
                          </span>
                        </td>
                        <td className="cl-col-age">
                          <div className="cl-age">
                            {!file.isOlderThan24h && (
                              <span className="cl-recent">{t.recent}</span>
                            )}
                            <span className="cl-num">
                              {formatDate(
                                file.deletedAt || file.modifiedAt,
                                locale,
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="cl-col-size">
                          <span className="cl-size cl-mono cl-num">
                            {formatBytes(file.sizeBytes)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="cl-foot">
              <span className="cl-num">
                {t.range(rangeStart, rangeEnd, filteredFiles.length, locale)}
              </span>
              <div className="cl-pager">
                <button
                  type="button"
                  className="cl-btn"
                  disabled={page <= 1}
                  onClick={() => setCurrentPage(page - 1)}
                >
                  {t.prev}
                </button>
                <span className="cl-num">{t.page(page, totalPages)}</span>
                <button
                  type="button"
                  className="cl-btn"
                  disabled={page >= totalPages}
                  onClick={() => setCurrentPage(page + 1)}
                >
                  {t.next}
                </button>
              </div>
              <label>
                {t.perPage}{" "}
                <select
                  className="cl-select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[50, 100, 250].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </>
        )}
      </section>

      <p className="cl-note">{t.footnote}</p>

      {/* Barra de acción fija */}
      <div className={`cl-dock ${selection.list.length > 0 ? "armed" : ""}`}>
        <div className="cl-sel">
          <div className="cl-sel-main">
            <span className="cl-label">
              <i
                className={`cl-led ${selection.list.length > 0 ? "on" : ""}`}
                aria-hidden="true"
              />
              {selection.list.length > 0 ? t.armed : t.idle}
            </span>
            <div className="cl-sel-read">
              <strong className="cl-mono cl-num">
                {formatBytes(selection.bytes)}
              </strong>
              <span className="cl-num">
                {t.itemsOf(selection.list.length, allFiles.length, locale)}
              </span>
            </div>
          </div>
          {message && (
            <div className="cl-banner ok" role="status">
              <Icon name="check" size={15} />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="cl-banner err" role="alert">
              <Icon name="alert" size={15} />
              <span>{error}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="cl-btn cl-btn-danger cl-btn-lg"
          onClick={() => setConfirmOpen(true)}
          disabled={busy || selection.list.length === 0}
        >
          <Icon name="trash" size={16} />
          {busy
            ? t.cleaning
            : selection.list.length === 0
              ? t.selectToClean
              : t.clean(formatBytes(selection.bytes))}
        </button>
      </div>

      {/* Popup de confirmación */}
      {confirmOpen && (
        <div
          className="cl-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirmOpen(false);
          }}
        >
          <div
            className="cl-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cl-modal-title"
            aria-describedby="cl-modal-desc"
          >
            <div className="cl-modal-top">
              <div className="cl-modal-head">
                <span className="cl-modal-icon">
                  <Icon name="trash" size={20} />
                </span>
                <span className="cl-label cl-danger">{t.irreversible}</span>
              </div>
              <h2 id="cl-modal-title">
                {t.modalTitle(t.files(selection.list.length, locale))}
              </h2>
              <p id="cl-modal-desc">
                {t.modalFree(formatBytes(selection.bytes))}
              </p>
            </div>

            <div className="cl-modal-body">
              <div className="cl-rows">
                {selection.tempCount > 0 && (
                  <div className="cl-row">
                    <span className="cl-row-ico temp">
                      <Icon name="sparkles" size={16} />
                    </span>
                    <span className="cl-row-text">
                      {t.temp}
                      <em>{t.modalTempNote}</em>
                    </span>
                    <b className="cl-num">
                      {t.files(selection.tempCount, locale)} ·{" "}
                      {formatBytes(selection.tempBytes)}
                    </b>
                  </div>
                )}
                {selection.binCount > 0 && (
                  <div className="cl-row">
                    <span className="cl-row-ico bin">
                      <Icon name="trash" size={16} />
                    </span>
                    <span className="cl-row-text">
                      {t.bin}
                      <em>{t.modalBinNote}</em>
                    </span>
                    <b className="cl-num">
                      {t.files(selection.binCount, locale)} ·{" "}
                      {formatBytes(selection.binBytes)}
                    </b>
                  </div>
                )}
              </div>

              {largestSelected.length > 0 && (
                <div className="cl-top">
                  <h3>{t.largest}</h3>
                  <ul>
                    {largestSelected.map((f) => (
                      <li key={f.id}>
                        <span
                          className="cl-mono"
                          title={f.originalPath || f.path}
                        >
                          {f.name}
                        </span>
                        <span className="cl-mono cl-num">
                          {formatBytes(f.sizeBytes)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {selection.list.length > largestSelected.length && (
                    <span className="more">
                      {t.andMore(
                        selection.list.length - largestSelected.length,
                        locale,
                      )}
                    </span>
                  )}
                </div>
              )}

              {selection.recentCount > 0 && (
                <div className="cl-warn">
                  <Icon name="alert" size={15} />
                  <span>{t.recentWarn(selection.recentCount, locale)}</span>
                </div>
              )}
            </div>

            <div className="cl-modal-foot">
              <button
                ref={cancelRef}
                type="button"
                className="cl-btn cl-btn-lg"
                onClick={() => setConfirmOpen(false)}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                className="cl-btn cl-btn-danger cl-btn-lg"
                onClick={handleExecuteClean}
              >
                <Icon name="trash" size={15} />
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
