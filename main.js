const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 630,
    height: 450,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    icon: path.join(__dirname, 'assets/game.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
  win.center();
  win.removeMenu();

  ipcMain.handle('launch-game', async (event, playerName, launchParams) => {
    try {
      const gameDir = path.resolve(__dirname, '..');
      const iniPath = path.join(gameDir, 'rev.ini');
      const exePath = path.join(gameDir, 'hl2.exe');
      const appIdPath = path.join(gameDir, 'steam_appid.txt');

      if (!fs.existsSync(exePath)) {
        console.error('Error: hl2.exe no encontrado');
        return;
      }

      if (!fs.existsSync(appIdPath)) {
        console.log('steam_appid.txt no encontrado, creandolo...');
        fs.writeFileSync(appIdPath, '240', 'utf8');
      }

      if (fs.existsSync(iniPath)) {
        let content = fs.readFileSync(iniPath, 'utf8');
        content = content.replace(/PlayerName=.*/i, `PlayerName=${playerName}`);
        content = content.replace(/ProcName=.*/i, `ProcName=${launchParams}`);
        fs.writeFileSync(iniPath, content, 'utf8');
        console.log('rev.ini actualizado');
      } else {
        console.error('rev.ini no encontrado');
        return;
      }

      exec(`"${exePath}" ${launchParams}`, { cwd: gameDir }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al iniciar hl2.exe: ${error.message}`);
          return;
        }
        console.log(`Juego iniciado:\n${stdout}`);
      });

    } catch (err) {
      console.error('Error al modificar rev.ini o iniciar el juego:', err);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
