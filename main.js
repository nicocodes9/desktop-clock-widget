// main.js - Electron's Main Process Script

const { app, BrowserWindow, screen, Tray, Menu } = require("electron");
const path = require("path");

let mainWindow; // Declare mainWindow globally to prevent garbage collection
let tray = null;

function createWindow() {
  // Get the primary display's work area size
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Calculate the Y position: 20% of the screen height from the top
  const yPosition = Math.round(height * 0.2);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 700, // Adjust width as needed for your clock
    height: 350, // Adjust height as needed for your clock
    x: Math.round((width - 700) / 2), // Center horizontally
    y: yPosition, // Position 20% from the top
    transparent: true, // Make the window background transparent
    frame: false, // Remove the window frame (title bar, minimize/maximize/close buttons)
    resizable: false, // Prevent resizing
    alwaysOnTop: false, // Set to false so it doesn't float above other apps
    skipTaskbar: true, // Hide the app from the taskbar/dock
    focusable: false, // IMPORTANT: Prevent the window from ever gaining focus
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Recommended for security
      nodeIntegration: false, // Keep nodeIntegration false for security
      contextIsolation: true, // Keep contextIsolation true for security
    },
  });

  // Load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // IMPORTANT: Set to true without 'forward: true' to completely ignore mouse events.
  // This ensures no focus is gained and clicks pass through to the desktop.
  mainWindow.setIgnoreMouseEvents(true);

  // Optional: Open the DevTools. Uncomment for debugging.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, "build", "icon.ico")); // Use your icon path
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Quit Clock",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Desktop Clock");
  tray.setContextMenu(contextMenu);
}

app.disableHardwareAcceleration();

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Add this block to enable auto-launch at startup
  app.setLoginItemSettings({
    openAtLogin: true,
    path: process.execPath,
    args: [],
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
