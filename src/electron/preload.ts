import { contextBridge, ipcRenderer } from "electron";
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

contextBridge.exposeInMainWorld("nexo", {
  getSnapshot: (): Promise<SystemSnapshot> => ipcRenderer.invoke("system:snapshot"),
  getHardwareReport: (): Promise<HardwareReport> => ipcRenderer.invoke("hardware:report"),
  getCleanupPreview: (): Promise<CleanupItem[]> => ipcRenderer.invoke("cleanup:preview"),
  downloadUpdate: () => ipcRenderer.invoke("update:download"),
  installUpdate: () => ipcRenderer.invoke("update:install"),
  checkForUpdates: () => ipcRenderer.invoke("update:check"),
  getUpdateSnapshot: (): Promise<UpdateSnapshot> => ipcRenderer.invoke("update:current"),
  exportFile: (request: ExportFileRequest): Promise<ExportFileResult> =>
    ipcRenderer.invoke("export:file", request),
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window:maximize"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  setWindowTheme: (theme: "light" | "dark") => ipcRenderer.invoke("window:set-theme", theme),
  onUpdateNotice: (callback: (notice: UpdateNotice) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, notice: UpdateNotice) => callback(notice);
    ipcRenderer.on("update:notice", listener);
    return () => ipcRenderer.removeListener("update:notice", listener);
  },
  onUpdateState: (callback: (state: UpdateState) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: UpdateState) => callback(state);
    ipcRenderer.on("update:state", listener);
    return () => ipcRenderer.removeListener("update:state", listener);
  },
});
