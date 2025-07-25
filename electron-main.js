// electron-main.js

const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev'); // Helps differentiate dev vs. production environments

let mainWindow;

function createWindow() {
  // Get primary display dimensions to center the window
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000, // Initial width
    height: 700, // Initial height
    x: Math.floor((width - 1000) / 2), // Center horizontally
    y: Math.floor((height - 700) / 2), // Center vertically
    minWidth: 800, // Minimum width
    minHeight: 600, // Minimum height
    webPreferences: {
      nodeIntegration: true, // WARNING: Be cautious with nodeIntegration in production apps for security.
      contextIsolation: false, // Required for nodeIntegration: true in newer Electron versions
      preload: path.join(__dirname, 'preload.js') // Optional: A preload script for secure IPC
    },
    title: "My Next.js Desktop App", // Set window title
    icon: path.join(__dirname, 'public/favicon.ico') // Path to your app icon
  });

  // Load the Next.js application
  // In development, load from the Next.js dev server
  // In production, load the built Next.js files
  const startURL = isDev
    ? 'http://localhost:3000' // Next.js development server
    : `file://${path.join(__dirname, '../out/index.html')}`; // Path to Next.js build output

  mainWindow.loadURL(startURL);

  // Open the DevTools in development mode.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Optional: Create a preload.js script for secure IPC if nodeIntegration is false
// This script runs before the renderer process's web content starts loading.
// It can expose Node.js APIs to the renderer process in a controlled manner.
// Example preload.js (create this file in the same directory as electron-main.js if needed):
/*
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Example: A function to send a message to the main process
  sendMessage: (message) => ipcRenderer.send('message-from-renderer', message),
  // Example: A function to receive a message from the main process
  onMessage: (callback) => ipcRenderer.on('message-to-renderer', (event, message) => callback(message))
});
*/
