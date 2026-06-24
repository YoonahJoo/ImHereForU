/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, exposed in `preload.ts`.
// Mirrors the trimmed bridge (not the full Electron IpcRenderer): `on`
// returns an unsubscribe function for reliable cleanup.
type IpcRendererListener = (
  event: import('electron').IpcRendererEvent,
  ...args: any[]
) => void

interface IpcRendererBridge {
  on(channel: string, listener: IpcRendererListener): () => void
  off(channel: string, listener?: (...args: any[]) => void): void
  send(channel: string, ...args: any[]): void
  invoke(channel: string, ...args: any[]): Promise<any>
}

interface Window {
  ipcRenderer: IpcRendererBridge
}
