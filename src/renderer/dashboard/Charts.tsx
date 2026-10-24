import { meter } from "./utils";

function makeLinePath(
  values: number[],
  width: number,
  height: number,
  padding = 2,
  offsetY = 0,
) {
  if (values.length === 0) return "";
  const plotHeight = height - padding * 2;
  const points = values.map((value, index) => ({
    x: values.length === 1 ? 0 : (index / (values.length - 1)) * width,
    y: offsetY + padding + (1 - meter(value) / 100) * plotHeight,
  }));
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const middleX = (previous.x + current.x) / 2;
    path += ` Q ${middleX} ${previous.y} ${middleX} ${(previous.y + current.y) / 2}`;
    path += ` T ${current.x} ${current.y}`;
  }
  return path;
}

export function Sparkline({
  values,
  tone,
}: {
  values: number[];
  tone: "blue" | "violet" | "mint" | "orange";
}) {
  const line = makeLinePath(values, 120, 28, 2);
  if (!line) return null;
  const area = `${line} L 120 28 L 0 28 Z`;

  return (
    <svg
      className={`sparkline ${tone}`}
      viewBox="0 0 120 28"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="sparkline-area" d={area} />
      <path className="sparkline-line" d={line} />
    </svg>
  );
}

export function CpuHistoryChart({
  values,
  current,
}: {
  values: number[];
  current: number;
}) {
  const plotTop = 12;
  const plotBottom = 158;
  const line = values.length > 1 ? makeLinePath(values, 620, plotBottom - plotTop, 0, plotTop) : "";
  const area = line ? `${line} L 620 ${plotBottom} L 0 ${plotBottom} Z` : "";
  const horizontalLevels = [100, 75, 50, 25, 0];

  return (
    <div className="chart">
      <div className="chart-labels">
        {horizontalLevels.map((level) => (
          <span key={level}>{level}%</span>
        ))}
      </div>
      <svg
        viewBox={`0 0 620 ${plotBottom + 12}`}
        preserveAspectRatio="none"
        aria-label={`Historial de uso de CPU: ${values.length} lecturas. Uso actual ${Math.round(current)} por ciento.`}
        role="img"
      >
        <path
          className="chart-grid"
          d={horizontalLevels
            .map((level) => {
              const y = plotTop + (1 - level / 100) * (plotBottom - plotTop);
              return `M0 ${y}H620`;
            })
            .join("")}
        />
        <path
          className="chart-grid chart-grid-vertical"
          d="M0 12V158M103 12V158M206 12V158M310 12V158M413 12V158M516 12V158M620 12V158"
        />
        {area && <path className="chart-area" d={area} />}
        {line && <path className="chart-line" d={line} />}
      </svg>
      {values.length < 2 && <span className="chart-empty">Esperando más lecturas para mostrar la actividad</span>}
      <div className="chart-times">
        <span>{values.length === 1 ? "1 lectura" : `Últimas ${values.length} lecturas`}</span>
        <span>ahora</span>
      </div>
    </div>
  );
}
