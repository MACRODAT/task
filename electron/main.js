import { app, BrowserWindow } from 'electron';
import path from 'path';
import url from 'url';
import next from 'next';
import http from 'http';

// Support __dirname in ESM
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect dev mode
const dev = !app.isPackaged;

// Set up Next.js server
const nextApp = next({ dev, dir: path.join(__dirname, '..') });
const handle = nextApp.getRequestHandler();

let mainWindow;

async function createWindow() {
  await nextApp.prepare(); // Start Next.js

  // Start local HTTP server
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  server.listen(3000, () => {
    console.log('> Next.js server ready on http://localhost:3000');
  });

  // Create Electron window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    fullscreen: true,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true,
    movable: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      contextIsolation: true,
    },
    title: "Instances et messages",
    icon: path.join(__dirname, '..', 'public', 'icon.ico'),
  });

  // Load app
  mainWindow.loadURL('http://localhost:3000');

  // DevTools in dev mode
  if (dev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createWindow(); });
