import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import { writeFile } from "node:fs/promises";
import { release as getOsRelease } from "node:os";
import path from "node:path";
import { autoUpdater, NsisUpdater } from "electron-updater";
import { getHardwareReport, getSystemSnapshot, isSupportedWindowsVersion } from "./system";
import type {
  CleanupItem,
  ExportFileRequest,
  ExportFileResult,
  UpdateNotice,
  UpdateSnapshot,
  UpdateState
} from "../shared/types";

let mainWindow: BrowserWindow | null = null;
let updateNotice: UpdateNotice | undefined;
let updateState: UpdateState = { status: "idle" };
let updatesConfigured = false;

function configureApplicationMenu() {
  const spanish = app.getLocale().toLowerCase().startsWith("es");
  const labels = spanish
    ? {
        file: "Archivo",
        close: "Cerrar ventana",
        quit: "Salir",
        edit: "Editar",
        view: "Ver",
        reload: "Recargar",
        forceReload: "Forzar recarga",
        window: "Ventana",
        help: "Ayuda",
        about: "Acerca de Nexo PC",
        aboutMessage: `Nexo PC ${app.getVersion()}\nDiagnóstico y mantenimiento local para Windows.`,
        confirm: "Aceptar",
      }
    : {
        file: "File",
        close: "Close window",
        quit: "Quit",
        edit: "Edit",
        view: "View",
        reload: "Reload",
        forceReload: "Force reload",
        window: "Window",
        help: "Help",
        about: "About Nexo PC",
        aboutMessage: `Nexo PC ${app.getVersion()}\nLocal diagnostics and maintenance for Windows.`,
        confirm: "OK",
      };

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: labels.file,
        submenu: [
          { label: labels.close, role: "close" },
          { type: "separator" },
          { label: labels.quit, role: "quit" },
        ],
      },
      {
        label: labels.edit,
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
        ],
      },
      {
        label: labels.view,
        submenu: [
          { label: labels.reload, role: "reload" },
          { label: labels.forceReload, role: "forceReload" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { type: "separator" },
          { role: "togglefullscreen" },
        ],
      },
      {
        label: labels.window,
        submenu: [
          { role: "minimize" },
          { role: "zoom" },
          { type: "separator" },
          { label: labels.close, role: "close" },
        ],
      },
      {
        label: labels.help,
        submenu: [
          {
            label: labels.about,
            click: () => {
              const options = {
                type: "info" as const,
                title: labels.about,
                message: labels.aboutMessage,
                buttons: [labels.confirm],
              };
              if (mainWindow) void dialog.showMessageBox(mainWindow, options);
              else void dialog.showMessageBox(options);
            },
          },
        ],
      },
    ]),
  );
}

class WindowsTempUpdater extends NsisUpdater {
  constructor() {
    super();
    Object.defineProperty(this.app, "baseCachePath", {
      configurable: true,
      get: () => app.getPath("temp")
    });
  }
}

const updater = process.platform === "win32"
  ? new WindowsTempUpdater()
  : autoUpdater;

function sendUpdate(notice: UpdateNotice) {
  updateNotice = notice;
  mainWindow?.webContents.send("update:notice", notice);
}

function sendUpdateState(state: UpdateState) {
  updateState = state;
  mainWindow?.webContents.send("update:state", state);
}

function formatUpdateError(error: unknown) {
  const spanish = app.getLocale().toLowerCase().startsWith("es");
  const details = error instanceof Error ? error.message : "";
  if (/\b404\b/.test(details)) {
    return spanish
      ? "La última publicación de GitHub no contiene latest.yml. Inténtalo de nuevo cuando se publique la siguiente versión."
      : "The latest GitHub release does not contain latest.yml. Try again after the next version is published.";
  }
  return spanish
    ? "No se pudo completar la actualización. Comprueba tu conexión e inténtalo de nuevo."
    : "Could not complete the update. Check your connection and try again.";
}

async function checkForUpdates() {
  if (!app.isPackaged) {
    sendUpdateState({
      status: "unsupported",
      message: "La búsqueda de actualizaciones está disponible en la aplicación instalada."
    });
    return;
  }

  sendUpdateState({ status: "checking" });
  try {
    await updater.checkForUpdates();
  } catch (error) {
    console.error("Error al comprobar actualizaciones.", error);
    const message = formatUpdateError(error);
    sendUpdateState({ status: "error", message });
    throw new Error(message);
  }
}

function createWindow() {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "icon.png")
    : path.join(__dirname, "../../assets/icon.png");
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 760,
    minHeight: 600,
    icon: iconPath,
    backgroundColor: "#fafafa",
    title: "Nexo PC",
    ...(process.platform === "win32"
      ? {
          titleBarStyle: "hidden" as const,
          titleBarOverlay: {
            color: "#fafafa",
            symbolColor: "#4c4c4c",
            height: 42
          }
        }
      : {}),
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false,
      sandbox: true
    }
  });
  mainWindow.setMenuBarVisibility(true);
  mainWindow.maximize();
  mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  if (updatesConfigured) {
    mainWindow.webContents.once("did-finish-load", () => {
      void checkForUpdates().catch((error: unknown) => {
        console.error("No se pudo comprobar si hay actualizaciones al abrir Nexo PC.", error);
      });
    });
  }
}

function configureUpdates() {
  if (!app.isPackaged) return;
  updatesConfigured = true;
  updater.autoDownload = false;
  updater.on("checking-for-update", () => sendUpdateState({ status: "checking" }));
  updater.on("update-not-available", () => sendUpdateState({ status: "up-to-date" }));
  updater.on("update-available", (info) => {
    sendUpdate({ version: info.version, downloaded: false });
    sendUpdateState({ status: "available", version: info.version });
  });
  updater.on("download-progress", ({ percent }) => {
    sendUpdateState({
      status: "downloading",
      version: updateNotice?.version,
      progress: Math.max(0, Math.min(100, Math.round(percent)))
    });
  });
  updater.on("update-downloaded", (info) => {
    sendUpdate({ version: info.version, downloaded: true });
    sendUpdateState({ status: "downloaded", version: info.version });
    setTimeout(() => updater.quitAndInstall(), 800);
  });
  updater.on("error", (error) => {
    console.error("Error al actualizar Nexo PC.", error);
    sendUpdateState({ status: "error", message: formatUpdateError(error) });
  });
}

ipcMain.handle("window:minimize", () => mainWindow?.minimize());
ipcMain.handle("window:maximize", () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle("window:close", () => mainWindow?.close());
ipcMain.handle("window:isMaximized", () => mainWindow?.isMaximized() ?? false);
ipcMain.handle("window:set-theme", (_event, theme: "light" | "dark") => {
  if (process.platform !== "win32" || !mainWindow) return;
  mainWindow.setTitleBarOverlay({
    color: theme === "dark" ? "#151515" : "#fafafa",
    symbolColor: theme === "dark" ? "#c2c2c2" : "#4c4c4c",
    height: 42
  });
});

ipcMain.handle("system:snapshot", getSystemSnapshot);
ipcMain.handle("hardware:report", getHardwareReport);

ipcMain.handle("cleanup:preview", (): CleanupItem[] => [
  { label: "Archivos temporales de usuario", path: "%TEMP%", sizeMb: 0, selected: true },
  { label: "Papelera de reciclaje", path: "Recycle Bin", sizeMb: 0, selected: false }
]);
ipcMain.handle("update:download", () => {
  sendUpdateState({
    status: "downloading",
    version: updateNotice?.version,
    progress: 0
  });
  return updater.downloadUpdate();
});
ipcMain.handle("update:install", () => updater.quitAndInstall());
ipcMain.handle("update:check", () => checkForUpdates());
ipcMain.handle("update:current", (): UpdateSnapshot => ({
  notice: updateNotice,
  state: updateState
}));
ipcMain.handle("export:file", async (event, request: ExportFileRequest): Promise<ExportFileResult> => {
  if (
    !request ||
    typeof request.fileName !== "string" ||
    !["txt", "csv"].includes(request.format) ||
    typeof request.content !== "string" ||
    (request.language !== "es" && request.language !== "en")
  ) {
    throw new TypeError("La solicitud de exportación no es válida.");
  }
  if (request.content.length > 20_000_000) {
    throw new RangeError("El archivo de exportación supera el tamaño permitido.");
  }

  const baseName = path.basename(request.fileName).replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
  const fileName = baseName.toLowerCase().endsWith(`.${request.format}`)
    ? baseName
    : `${baseName}.${request.format}`;
  const parentWindow = BrowserWindow.fromWebContents(event.sender) ?? mainWindow;
  if (!parentWindow) throw new Error("No hay una ventana disponible para exportar el archivo.");
  const result = await dialog.showSaveDialog(parentWindow, {
    title: request.language === "en" ? "Export information" : "Exportar información",
    defaultPath: fileName,
    buttonLabel: request.language === "en" ? "Save" : "Guardar",
    filters: [{ name: request.format.toUpperCase(), extensions: [request.format] }]
  });
  if (result.canceled || !result.filePath) return { status: "cancelled" };

  await writeFile(result.filePath, request.content, "utf8");
  return { status: "saved" };
});

app.whenReady().then(() => {
  if (process.platform !== "win32" || !isSupportedWindowsVersion(getOsRelease())) {
    const spanish = app.getLocale().toLowerCase().startsWith("es");
    dialog.showErrorBox(
      spanish ? "Sistema no compatible" : "Unsupported system",
      spanish
        ? "Nexo PC requiere Windows 10 versión 1809–22H2 o Windows 11."
        : "Nexo PC requires Windows 10 version 1809–22H2 or Windows 11.",
    );
    app.quit();
    return;
  }

  configureApplicationMenu();
  configureUpdates();
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
