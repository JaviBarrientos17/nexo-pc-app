import type { HardwareReport, SystemSnapshot, UpdateState } from "../../shared/types";
import { Icon, type IconName } from "../Icon";

type Recommendation = { icon: IconName; title: string; detail: string; action?: "hardware" | "cleanup" };

function getRecommendations(snapshot: SystemSnapshot | undefined, hardware: HardwareReport | undefined, updateState: UpdateState): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const fullDisk = snapshot?.disks.filter((disk) => disk.sizeGb > 0 && disk.freeGb / disk.sizeGb < 0.15).sort((a, b) => a.freeGb - b.freeGb)[0];
  if (fullDisk) recommendations.push({ icon: "trash", title: `Libera espacio en ${fullDisk.name}`, detail: `Solo quedan ${Math.round(fullDisk.freeGb)} GB disponibles.`, action: "cleanup" });
  if ((hardware?.memory.usagePercent ?? 0) >= 85) recommendations.push({ icon: "pulse", title: "El uso de memoria es elevado", detail: `La RAM está al ${Math.round(hardware!.memory.usagePercent)} %. Revisa las aplicaciones activas.`, action: "hardware" });
  if (hardware?.physicalDisks.some((disk) => disk.health === "warning")) recommendations.push({ icon: "alert", title: "Revisa el estado de una unidad", detail: "Windows ha informado de una advertencia en el almacenamiento.", action: "hardware" });
  if (updateState.status === "available") recommendations.push({ icon: "download", title: "Hay una actualización disponible", detail: "Instálala desde Ajustes para contar con las últimas mejoras." });
  return recommendations.length > 0 ? recommendations.slice(0, 3) : [{ icon: "sparkles", title: "El equipo está funcionando con normalidad", detail: "Sigue supervisando tus métricas para detectar cambios a tiempo." }];
}

export function RecommendationsPanel({ snapshot, hardware, updateState, onOpenHardware, onOpenCleanup }: { snapshot?: SystemSnapshot; hardware?: HardwareReport; updateState: UpdateState; onOpenHardware: () => void; onOpenCleanup: () => void }) {
  const recommendations = getRecommendations(snapshot, hardware, updateState);
  return <article className="surface recommendations-panel">
    <div className="surface-heading"><div><p className="section-kicker">ASISTENTE LOCAL</p><h2>Sugerencias para tu equipo</h2></div><Icon name="sparkles" size={18} /></div>
    <div className="recommendations-list">{recommendations.map((recommendation) => <button className="recommendation" key={recommendation.title} type="button" disabled={!recommendation.action} onClick={() => { if (recommendation.action === "hardware") onOpenHardware(); if (recommendation.action === "cleanup") onOpenCleanup(); }}>
      <Icon name={recommendation.icon} size={16} /><span><strong>{recommendation.title}</strong><small>{recommendation.detail}</small></span>{recommendation.action && <Icon name="arrow" size={16} />}
    </button>)}</div>
  </article>;
}
