// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Example: A function to send a message to the main process
  sendMessage: (message) => ipcRenderer.send('message-from-renderer', message),
  // Example: A function to receive a message from the main process
  onMessage: (callback) => ipcRenderer.on('message-to-renderer', (event, message) => callback(message))
});
