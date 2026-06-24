import { ipcRenderer, contextBridge, type IpcRendererEvent } from 'electron'

type IpcListener = (event: IpcRendererEvent, ...args: unknown[]) => void

// --------- Expose a small, typed IPC bridge to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  // `on` registers a wrapped listener and returns an unsubscribe function,
  // so renderers can clean up reliably (the wrapper can't be matched by `off`).
  on(channel: string, listener: IpcListener) {
    const wrapped = (event: IpcRendererEvent, ...args: unknown[]) => listener(event, ...args)
    ipcRenderer.on(channel, wrapped)
    return () => {
      ipcRenderer.removeListener(channel, wrapped)
    }
  },
  off(channel: string, listener?: (...args: unknown[]) => void) {
    if (listener) ipcRenderer.removeListener(channel, listener)
    else ipcRenderer.removeAllListeners(channel)
  },
  send(channel: string, ...args: unknown[]) {
    ipcRenderer.send(channel, ...args)
  },
  invoke(channel: string, ...args: unknown[]) {
    return ipcRenderer.invoke(channel, ...args)
  },
})
