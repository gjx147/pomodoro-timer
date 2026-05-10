const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, body) => {
    ipcRenderer.send('show-notification', { title, body });
  },
  setAlwaysOnTop: (flag) => {
    ipcRenderer.send('set-always-on-top', flag);
  }
});
