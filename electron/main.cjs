const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: "Espace d'étude",
    autoHideMenuBar: true,       // Cache la barre de menu (Fichier, Édition...)
    backgroundColor: '#0f172a',  // Fond sombre pendant le chargement
    show: false,                 // Ne montre pas la fenêtre tant que ce n'est pas prêt
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Empêche le menu par défaut d'apparaître (Alt ne l'affiche plus non plus)
  Menu.setApplicationMenu(null)

  // Charge l'app compilée
  win.loadFile(path.join(__dirname, '../dist/index.html'))

  // Force la fermeture immédiate des DevTools s'ils s'ouvrent
  win.webContents.on('devtools-opened', () => {
    win.webContents.closeDevTools()
  })

  // Affiche la fenêtre seulement quand c'est prêt → pas de flash blanc
  win.once('ready-to-show', () => {
    win.show()
  })

  // En dev : ouvrir les DevTools avec F12
  // En prod : laisser fermé
  // win.webContents.openDevTools()
}

// Autorise une seule instance de l'app (si elle clique deux fois sur l'icône, ça réutilise la même fenêtre)
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const wins = BrowserWindow.getAllWindows()
    if (wins.length > 0) {
      if (wins[0].isMinimized()) wins[0].restore()
      wins[0].focus()
    }
  })

  app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})