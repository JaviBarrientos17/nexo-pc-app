import { CpuHistoryChart } from "./Charts";

export function PerformancePanel({
  cpu,
  cpuHistory,
}: {
  cpu?: number;
  cpuHistory: number[];
}) {
  return (
    <article className="surface performance-panel">
      <div className="surface-heading">
        <div>
          <p className="section-kicker">RENDIMIENTO</p>
          <h2>Actividad del procesador</h2>
        </div>
        <div className="surface-value">
          <strong>{cpu === undefined ? "—" : `${cpu}%`}</strong>
          <span>uso actual</span>
        </div>
      </div>
      <CpuHistoryChart values={cpuHistory} current={cpu ?? 0} />
    </article>
  );
}
