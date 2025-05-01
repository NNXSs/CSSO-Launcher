contextBridge.exposeInMainWorld('electronAPI', {
  launchGame: (playerName, launchParams) => ipcRenderer.invoke('launch-game', playerName, launchParams),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  loadConfig: () => ipcRenderer.invoke('load-config')
});
