/// <reference types="vite/client" />

import type {
  CleanupItem,
  ExportFileRequest,
  ExportFileResult,
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
      getCleanupPreview(): Promise<CleanupItem[]>;
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
