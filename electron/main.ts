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
    transparent: true,
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

// ── IPC: book window keeps its own size control (unchanged) ───────────
ipcMain.on('resize-window', (_, { width, height }: { width: number; height: number }) => {
  if (win) win.setSize(width, height)
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
})
