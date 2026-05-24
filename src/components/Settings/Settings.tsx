import { useState } from 'react'
import type { AppMode, UserSettings } from '../../types'
import './Settings.css'

interface SettingsProps {
  settings: UserSettings
  onSave: (settings: UserSettings) => void
  onClose: () => void
}

export function Settings({ settings, onSave, onClose }: SettingsProps) {
  const [userName, setUserName] = useState(settings.userName)
  const [partnerNickname, setPartnerNickname] = useState(settings.partnerNickname)
  const [customMessages, setCustomMessages] = useState<string[]>(settings.customMessages)
  const [defaultMode, setDefaultMode] = useState<AppMode>(settings.defaultMode)
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
    onSave({ userName, partnerNickname, customMessages, defaultMode })
    onClose()
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2 className="settings-title">⚙️ Settings</h2>
        <button className="settings-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="settings-body">
        <div className="settings-field">
          <label className="settings-label">My Name</label>
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
          <label className="settings-label">Default Mode</label>
          <div className="settings-mode-toggle">
            <button
              className={`settings-mode-btn${defaultMode === 'daily' ? ' active' : ''}`}
              onClick={() => setDefaultMode('daily')}
            >
              Daily
            </button>
            <button
              className={`settings-mode-btn${defaultMode === 'focus' ? ' active' : ''}`}
              onClick={() => setDefaultMode('focus')}
            >
              Focus
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
