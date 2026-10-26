const fs = require("fs");
const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("headless");

const { getHardwareReport, getSystemSnapshot } = require("../dist-electron/electron/system");
const { getCleanupPreview, cleanSelectedItems } = require("../dist-electron/electron/cleanup");

let mainWindow;

const updateNotice = undefined;
const updateState = { status: "up-to-date" };

ipcMain.handle("window:minimize", () => mainWindow?.minimize());
ipcMain.handle("window:maximize", () => {});
ipcMain.handle("window:close", () => mainWindow?.close());
ipcMain.handle("window:isMaximized", () => false);
ipcMain.handle("window:set-theme", (_event, theme) => {
  if (process.platform === "win32" && mainWindow) {
    try {
      mainWindow.setTitleBarOverlay({
        color: theme === "dark" ? "#151515" : "#fafafa",
        symbolColor: theme === "dark" ? "#c2c2c2" : "#4c4c4c",
        height: 42,
      });
    } catch (_) {}
  }
});

ipcMain.handle("system:snapshot", getSystemSnapshot);
ipcMain.handle("hardware:report", getHardwareReport);
ipcMain.handle("cleanup:preview", () => getCleanupPreview());
ipcMain.handle("cleanup:run", (_event, payload) => cleanSelectedItems(payload));
ipcMain.handle("update:current", () => ({ notice: updateNotice, state: updateState }));
ipcMain.handle("update:check", () => Promise.resolve());
ipcMain.handle("update:download", () => Promise.resolve());
ipcMain.handle("update:install", () => Promise.resolve());
ipcMain.handle("export:file", () => Promise.resolve({ status: "saved" }));

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture(name) {
  await sleep(600);
  const image = await mainWindow.webContents.capturePage();
  const filePath = path.join(__dirname, "../assets/screenshots", `${name}.png`);
  fs.writeFileSync(filePath, image.toPNG());
  console.log(`Saved screenshot: ${name}.png (${image.getSize().width}x${image.getSize().height})`);
}

async function run() {
  mainWindow = new BrowserWindow({
    width: 1361,
    height: 960,
    show: false,
    backgroundColor: "#fafafa",
    title: "Nexo PC",
    webPreferences: {
      offscreen: true,
      preload: path.join(__dirname, "../dist-electron/electron/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false,
    },
  });

  await mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));

  // Ensure initial theme is light and percentage bars enabled
  await mainWindow.webContents.executeJavaScript(`
    localStorage.setItem("nexo-theme", "light");
    localStorage.setItem("nexo-percentage-bars", "true");
    document.documentElement.dataset.theme = "light";
  `);

  console.log("Waiting for initial data loading to complete...");
  for (let i = 0; i < 60; i++) {
    const loading = await mainWindow.webContents.executeJavaScript(`
      Boolean(document.querySelector(".hardware-loading-overlay"))
    `);
    if (!loading) break;
    await sleep(300);
  }

  // Let sparklines / initial render settle
  await sleep(1500);

  // 1. Capture resumen (light)
  console.log("Capturing resumen (light)...");
  await capture("resumen");

  // 2. Switch to dark mode and capture resumen-oscuro
  console.log("Capturing resumen-oscuro...");
  await mainWindow.webContents.executeJavaScript(`
    const btn = document.querySelector(".theme-switch");
    if (btn) btn.click();
  `);
  await sleep(600);
  await capture("resumen-oscuro");

  // Switch back to light mode for remaining screenshots
  await mainWindow.webContents.executeJavaScript(`
    const btn = document.querySelector(".theme-switch");
    if (btn) btn.click();
  `);
  await sleep(500);

  // 3. Capture Hardware
  console.log("Navigating to Hardware...");
  await mainWindow.webContents.executeJavaScript(`
    const btn = document.querySelector('button[title="Hardware"]');
    if (btn) btn.click();
  `);
  for (let i = 0; i < 30; i++) {
    const loading = await mainWindow.webContents.executeJavaScript(`
      Boolean(document.querySelector(".hardware-loading-overlay"))
    `);
    if (!loading) break;
    await sleep(200);
  }
  await sleep(1000);
  await capture("hardware");

  // 4. Capture Salud del sistema
  console.log("Navigating to Salud del sistema...");
  await mainWindow.webContents.executeJavaScript(`
    const btn = document.querySelector('button[title="Salud del sistema"]');
    if (btn) btn.click();
  `);
  for (let i = 0; i < 30; i++) {
    const loading = await mainWindow.webContents.executeJavaScript(`
      Boolean(document.querySelector(".hardware-loading-overlay"))
    `);
    if (!loading) break;
    await sleep(200);
  }
  await sleep(1000);
  await capture("salud-sistema");

  // 5. Capture Unidades
  console.log("Navigating to Unidades...");
  await mainWindow.webContents.executeJavaScript(`
    const btn = document.querySelector('button[title="Unidades"]');
    if (btn) btn.click();
  `);
  for (let i = 0; i < 30; i++) {
    const loading = await mainWindow.webContents.executeJavaScript(`
      Boolean(document.querySelector(".hardware-loading-overlay"))
    `);
    if (!loading) break;
    await sleep(200);
  }
  await sleep(1000);
  await capture("unidades");

  // 6. Capture Limpieza
  console.log("Navigating to Limpieza...");
  await mainWindow.webContents.executeJavaScript(`
    const btn = document.querySelector('button[title="Limpieza"]');
    if (btn) btn.click();
  `);
  await sleep(2500);
  await capture("limpieza");

  // 7. Capture Actualizaciones
  console.log("Navigating to Actualizaciones...");
  await mainWindow.webContents.executeJavaScript(`
    const btn = document.querySelector('button[title="Actualizaciones"]');
    if (btn) btn.click();
  `);
  await sleep(800);
  await capture("actualizaciones");

  // 8. Capture Ajustes
  console.log("Navigating to Ajustes...");
  await mainWindow.webContents.executeJavaScript(`
    const btn = document.querySelector('button[title="Ajustes"]');
    if (btn) btn.click();
  `);
  await sleep(800);
  await capture("ajustes");

  console.log("All screenshots captured successfully!");
  app.quit();
}

app.whenReady().then(run).catch((err) => {
  console.error(err);
  app.quit();
});

