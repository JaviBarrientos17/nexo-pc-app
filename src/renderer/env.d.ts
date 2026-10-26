/// <reference types="vite/client" />

import type {
  CleanupCategoryId,
  CleanupItem,
  CleanupRunOptions,
  CleanupResult,
  ExportFileRequest,
  ExportFileResult,
  FanControlInfo,
  HardwareReport,
  SystemSnapshot,
  UpdateNotice,
  UpdateSnapshot,
  UpdateState,
} from "../shared/types";

declare global {
  interface Window {
    nexo: {
      getSnapshot(): Promise<SystemSnapshot>;
      getHardwareReport(): Promise<HardwareReport>;
      getFanControls(): Promise<FanControlInfo[]>;
      setFanControl(id: string, percent: number): Promise<FanControlInfo[]>;
      restoreFanControls(): Promise<FanControlInfo[]>;
      getCleanupPreview(): Promise<CleanupItem[]>;
      cleanSelectedItems(target: (CleanupCategoryId | string)[] | CleanupRunOptions): Promise<CleanupResult[]>;
      downloadUpdate(): Promise<void>;
      installUpdate(): Promise<void>;
      checkForUpdates(): Promise<void>;
      getUpdateSnapshot(): Promise<UpdateSnapshot>;
      exportFile(request: ExportFileRequest): Promise<ExportFileResult>;
      minimizeWindow(): Promise<void>;
      maximizeWindow(): Promise<void>;
      closeWindow(): Promise<void>;
      setWindowTheme(theme: "light" | "dark"): Promise<void>;
      onUpdateNotice(callback: (notice: UpdateNotice) => void): () => void;
      onUpdateState(callback: (state: UpdateState) => void): () => void;
    };
  }
}
