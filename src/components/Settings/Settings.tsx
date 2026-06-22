import { useState } from 'react'
import type { AppMode, UserSettings } from '../../types'
import './Settings.css'

interface SettingsProps {
  settings: UserSettings
  onSave: (settings: UserSettings) => void
  onClose: () => void
  currentTheme: 'light' | 'dark'
  onThemePreview: (theme: 'light' | 'dark') => void
}

export function Settings({ settings, onSave, onClose, currentTheme, onThemePreview }: SettingsProps) {
  const [userName, setUserName] = useState(settings.userName)
  const [partnerNickname, setPartnerNickname] = useState(settings.partnerNickname)
  const [customMessages, setCustomMessages] = useState<string[]>(settings.customMessages)
  const [defaultMode] = useState<AppMode>(settings.defaultMode)
  const [theme, setTheme] = useState<'light' | 'dark'>(settings.theme)
  const [newMessage, setNewMessage] = useState('')

  function addMessage() {
    const trimmed = newMessage.trim()
    if (!trimmed) return
    setCustomMessages(prev => [...prev, trimmed])
    setNewMessage('')
  }

  function removeMessage(index: number) {
    setCustomMessages(prev => prev.filter((_, i) => i !== index))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') addMessage()
  }

  function handleSave() {
    onSave({ userName, partnerNickname, customMessages, defaultMode, theme })
  }

  return (
    <div className={`settings-panel${currentTheme === 'dark' ? ' theme-dark' : ''}`}>
      <div className="settings-header">
        <h2 className="settings-title">Settings</h2>
        <button className="settings-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="settings-body">
        <div className="settings-field">
          <label className="settings-label">Your Name</label>
          <input
            className="settings-input"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="You"
          />
        </div>

        <div className="settings-field">
          <label className="settings-label">Partner's Name</label>
          <input
            className="settings-input"
            value={partnerNickname}
            onChange={e => setPartnerNickname(e.target.value)}
            placeholder="Yoonah"
          />
        </div>

        <div className="settings-field">
          <label className="settings-label">Theme</label>
          <div className="settings-mode-toggle">
            <button
              type="button"
              className={`settings-mode-btn${theme === 'light' ? ' active' : ''}`}
              onClick={() => { setTheme('light'); onThemePreview('light') }}
            >
              Light
            </button>
            <button
              type="button"
              className={`settings-mode-btn${theme === 'dark' ? ' active' : ''}`}
              onClick={() => { setTheme('dark'); onThemePreview('dark') }}
            >
              Dark
            </button>
          </div>
        </div>

        <div className="settings-field">
          <label className="settings-label">Custom Message</label>
          <div className="settings-message-row">
            <input
              className="settings-input"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a message..."
            />
            <button className="settings-add-btn" onClick={addMessage}>+</button>
          </div>
          {customMessages.length > 0 && (
            <ul className="custom-message-list">
              {customMessages.map((msg, i) => (
                <li key={i} className="custom-message-item">
                  <span className="custom-message-text">{msg}</span>
                  <button
                    className="custom-message-delete"
                    onClick={() => removeMessage(i)}
                    aria-label="Delete"
                  >✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="settings-footer">
        <button className="settings-save-btn" onClick={handleSave}>Save</button>
      </div>
    </div>
  )
}
