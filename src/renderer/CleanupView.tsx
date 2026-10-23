import { useEffect, useMemo, useState } from "react";
import type { CleanupItem } from "../shared/types";
import { Icon } from "./Icon";

function formatBytes(bytes: number) {
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

export function CleanupView({
  items,
  selectedIds,
  busy = false,
  message,
  error,
  language,
  onPreview,
  onSelectionChange,
  onClean,
}: {
  items?: CleanupItem[];
  selectedIds: CleanupItem["id"][];
  busy?: boolean;
  message?: string;
  error?: string;
  language: "es" | "en";
  onPreview: () => void;
  onSelectionChange: (ids: CleanupItem["id"][]) => void;
  onClean: (ids: CleanupItem["id"][]) => void;
}) {
  const [selection, setSelection] = useState(selectedIds);
  useEffect(() => setSelection(selectedIds), [selectedIds]);

  const selectedItems = useMemo(
    () => (items ?? []).filter((item) => selection.includes(item.id)),
    [items, selection],
  );
  const selectedBytes = selectedItems.reduce(
    (total, item) => total + item.sizeBytes,
    0,
  );
  const selectedFiles = selectedItems.reduce(
    (total, item) => total + item.fileCount,
    0,
  );

  const toggleSelection = (id: CleanupItem["id"]) => {
    const next = selection.includes(id)
      ? selection.filter((selectedId) => selectedId !== id)
      : [...selection, id];
    setSelection(next);
    onSelectionChange(next);
  };

  const confirmCleanup = () => {
    if (selection.length === 0) return;
    const confirmation =
      language === "en"
        ? `Permanently delete up to ${formatBytes(selectedBytes)} from ${selectedItems.length} selected location(s)? Files in the Recycle Bin cannot be restored.`
        : `¿Eliminar permanentemente hasta ${formatBytes(selectedBytes)} de ${selectedItems.length} ubicaciones? Los archivos de la Papelera no se podrán recuperar.`;
    if (window.confirm(confirmation)) onClean(selection);
  };

  return (
    <>
      <section className="hero cleanup-hero">
        <div>
          <p className="eyebrow">MANTENIMIENTO SEGURO</p>
          <h1>
            Haz espacio
            <br />
            con tranquilidad
          </h1>
          <p className="hero-copy">
            Revisa cuánto espacio puedes liberar. Los temporales recientes se
            conservan y no se elimina nada sin tu confirmación.
          </p>
        </div>
        <div className="scan-status">
          <span className="scan-ring amber">
            <Icon name="sparkles" size={21} />
          </span>
          <div>
            <strong>Limpieza protegida</strong>
            <small>Solo ubicaciones seleccionadas</small>
          </div>
        </div>
      </section>
      <article className="surface cleanup-surface">
        <div className="surface-heading">
          <div>
            <p className="section-kicker">ANÁLISIS REAL</p>
            <h2>Elementos que puedes revisar</h2>
          </div>
          <button
            className="secondary-button"
            onClick={onPreview}
            disabled={busy}
          >
            <Icon name="refresh" size={15} />
            {busy ? "Analizando…" : "Analizar"}
          </button>
        </div>
        {items ? (
          items.map((item) => (
            <label className="cleanup-row" key={item.id}>
              <input
                type="checkbox"
                checked={selection.includes(item.id)}
                onChange={() => toggleSelection(item.id)}
                disabled={busy || item.fileCount === 0}
              />
              <span className="cleanup-icon">
                <Icon
                  name={item.id === "recycle-bin" ? "disk" : "sparkles"}
                  size={16}
                />
              </span>
              <span className="cleanup-row-copy">
                <strong>{item.label}</strong>
                <small title={item.path}>{item.path}</small>
              </span>
              <span className="cleanup-row-size">
                {item.fileCount === 0
                  ? "Sin elementos"
                  : `${formatBytes(item.sizeBytes)} · ${item.fileCount} ${
                      language === "en" ? "items" : "elementos"
                    }`}
              </span>
              <Icon name="arrow" size={16} />
            </label>
          ))
        ) : (
          <p className="empty-state">
            Pulsa «Analizar» para buscar temporales y consultar la Papelera.
          </p>
        )}
        {selectedItems.length > 0 && (
          <div className="cleanup-selection-summary">
            <span>
              {language === "en" ? "Selected" : "Seleccionados"}:{" "}
              <strong>{selectedFiles}</strong>{" "}
              {language === "en" ? "items" : "elementos"}
            </span>
            <strong>{formatBytes(selectedBytes)}</strong>
          </div>
        )}
        <div className="cleanup-actions">
          <div className="cleanup-action-messages">
            <div className="cleanup-feedback" role="status" aria-live="polite">
              {message}
            </div>
            <div
              className="cleanup-feedback error"
              role={error ? "alert" : "status"}
              aria-live={error ? "assertive" : "polite"}
            >
              {error}
            </div>
          </div>
          <button
            className="danger-button"
            onClick={confirmCleanup}
            disabled={busy || !items || selectedFiles === 0}
          >
            <Icon name="trash" size={15} />
            {busy
              ? language === "en"
                ? "Working…"
                : "Procesando…"
              : language === "en"
                ? "Clean selected"
                : "Limpiar seleccionados"}
          </button>
        </div>
        <div className="safety-note">
          <Icon name="shield" size={18} />
          <span>
            <strong>Protección activa.</strong> Solo se eliminan temporales de
            más de 24 horas. Los archivos de la Papelera se borran
            permanentemente, tras confirmar.
          </span>
        </div>
      </article>
    </>
  );
}
