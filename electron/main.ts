import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null
let overlayWin: BrowserWindow | null

// ── Renderer URL helpers (dev server vs. packaged files) ──────────────
function loadRenderer(target: BrowserWindow, htmlFile: string) {
  if (VITE_DEV_SERVER_URL) {
    target.loadURL(new URL(htmlFile, VITE_DEV_SERVER_URL).href)
  } else {
    target.loadFile(path.join(RENDERER_DIST, htmlFile))
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 750,
    transparent: true,
    frame: false,
    resizable: false,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    title: 'Mini Yoonah',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      devTools: true,
    },
  })

  win.setMenuBarVisibility(false)
  loadRenderer(win, 'index.html')

  win.on('closed', () => {
    win = null
  })
}

// ── v3.0: transparent full-screen overlay for the desktop-mate ────────
function createOverlayWindow() {
  const display = screen.getPrimaryDisplay()
  const { x, y, width, height } = display.bounds

  overlayWin = new BrowserWindow({
    x,
    y,
    width,
    height,
    show: false, // hidden until the character "steps out" of the book
    transparent: true,
    backgroundColor: '#00000000', // fully transparent; prevents gray repaint flashes
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    focusable: false, // never steals focus from the user's active app
    skipTaskbar: true,
    hasShadow: false,
    title: 'Yoonah Overlay',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      devTools: true,
      // This window is never focused (focusable:false), so Chromium would treat
      // it as "background" and throttle JS timers — which froze setTimeout-based
      // reverts (e.g. cheering → focus_mode) and bubble auto-hide. Keep timers
      // running normally for the always-present companion.
      backgroundThrottling: false,
    },
  })

  overlayWin.setMenuBarVisibility(false)
  // Keep the character floating above normal windows on every Space (macOS).
  overlayWin.setAlwaysOnTop(true, 'screen-saver')
  overlayWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  // Default: ignore mouse events but forward them so the apps below stay usable.
  overlayWin.setIgnoreMouseEvents(true, { forward: true })

  loadRenderer(overlayWin, 'overlay.html')

  overlayWin.on('closed', () => {
    overlayWin = null
  })
}

// ── IPC: mouse pass-through toggle driven by the overlay renderer ─────
ipcMain.on('overlay:cursor-on-character', () => {
  overlayWin?.setIgnoreMouseEvents(false)
})
ipcMain.on('overlay:cursor-off-character', () => {
  overlayWin?.setIgnoreMouseEvents(true, { forward: true })
})

// ── IPC: book → overlay lifecycle + state sync ────────────────────────
// Book asks the character to step out onto the desktop.
ipcMain.on('book:exit-character', (_, payload) => {
  if (!overlayWin) return
  // Cover the display the book currently lives on (multi-monitor friendly).
  const target = win
    ? screen.getDisplayMatching(win.getBounds())
    : screen.getPrimaryDisplay()
  overlayWin.setBounds(target.bounds)
  // Re-arm pass-through every time she steps out (a prior hover may have left
  // it disabled, which would otherwise block clicks across the whole screen).
  overlayWin.setIgnoreMouseEvents(true, { forward: true })
  overlayWin.showInactive() // become visible without stealing focus
  overlayWin.webContents.send('overlay:show', payload)
  // The book "disappears" the moment she's out on the desktop.
  win?.hide()
})

// Book relays timer / theme changes while the character is out. (Expression
// is owned locally by the overlay so desktop interactions aren't overridden.)
ipcMain.on('overlay:set-timer', (_, running) => {
  overlayWin?.webContents.send('overlay:set-timer', running)
})
ipcMain.on('overlay:set-theme', (_, theme) => {
  overlayWin?.webContents.send('overlay:set-theme', theme)
})

// Overlay asks to send the character back into the book (come home):
// reveal the book first (with the character settling in), then hide the overlay.
ipcMain.on('overlay:enter-character', () => {
  if (!win || win.isDestroyed()) {
    // The book was closed while she was out — reopen it so she has a home.
    createWindow()
  } else {
    win.webContents.send('book:character-entered')
    win.show()
  }
  overlayWin?.hide()
})

// ── IPC: book window keeps its own size control (unchanged) ───────────
ipcMain.on('resize-window', (_, { width, height }: { width: number; height: number }) => {
  if (win && !win.isDestroyed()) win.setSize(width, height)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
    overlayWin = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
  createOverlayWindow()

  // The overlay is a utility window (focusable:false, skipTaskbar, alwaysOnTop)
  // and can push the app into macOS "accessory" mode, which drops the Dock
  // icon. Force a regular Dock presence so the app always shows in the Dock.
  if (process.platform === 'darwin') {
    app.setActivationPolicy('regular')
    app.dock?.show()
  }
})
