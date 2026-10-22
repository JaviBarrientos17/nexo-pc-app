import type { HardwareReport } from "../../shared/types";

export type CategoryFilter =
  | "all"
  | "cpu"
  | "gpu"
  | "ram"
  | "storage"
  | "motherboard";

export interface HardwareSectionProps {
  report?: HardwareReport;
  category: CategoryFilter;
  collapsed: Record<string, boolean>;
  matchesSearch: (text: string) => boolean;
  toggleSection: (id: string) => void;
  getMin: (key: string, current: number | undefined) => string | number;
  getMax: (key: string, current: number | undefined) => string | number;
  tempTone: (temp?: number) => "blue" | "red" | "amber" | "mint";
  loadTone: (pct: number) => "red" | "amber" | "blue";
}
