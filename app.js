/* Modern Q&A App Styling - Premium Glassmorphism */

:root {
  /* Default dark theme values (fallbacks for non-Telegram environments) */
  --bg-color: #0d0e15;
  --secondary-bg-color: #161824;
  --card-bg: rgba(255, 255, 255, 0.03);
  --card-border: rgba(255, 255, 255, 0.06);
  --text-color: #f1f2f6;
  --text-secondary: #9ca3af;
  --accent-color: #6366f1;
  --accent-hover: #4f46e5;
  --danger-color: #ef4444;
  --danger-hover: #dc2626;
  --success-color: #10b981;
  --border-radius-lg: 20px;
  --border-radius-md: 12px;
  --border-radius-sm: 8px;
  --font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.3);
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Override variables using Telegram Web App theme if available */
body.telegram-theme {
  --bg-color: var(--tg-theme-bg-color, #0d0e15);
  --secondary-bg-color: var(--tg-theme-secondary-bg-color, #161824);
  --text-color: var(--tg-theme-text-color, #f1f2f6);
  --text-secondary: var(--tg-theme-hint-color, #9ca3af);
  --accent-color: var(--tg-theme-button-color, #6366f1);
  --accent-hover: var(--tg-theme-button-color, #4f46e5); /* dynamic hover will be done via opacity */
}

/* Reset & Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background: radial-gradient(circle at 50% 0%, var(--secondary-bg-color) 0%, var(--bg-color) 100%);
  color: var(--text-color);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Layout Containers */
main {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 16px 80px 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.view-panel {
  width: 100%;
  animation: fadeIn 0.4s ease;
}

/* Loading Overlay */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-color);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: opacity 0.3s ease;
}

.spinner-container {
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

.spinner-container p {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Typography & Headers */
.app-header {
  text-align: center;
  margin-bottom: 30px;
  padding-top: 10px;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--accent-color) 0%, #a855f7 100%);
  border-radius: 20px;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

h1 {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 90%;
  margin: 0 auto;
}

/* Glassmorphism Cards */
.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-lg);
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
}

/* Forms */
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.textarea-wrapper {
  position: relative;
}

textarea, input[type="text"] {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--card-border);
  border-radius: var(--border-radius-md);
  color: var(--text-color);
  padding: 14px 16px;
  font-family: var(--font-family);
  font-size: 15px;
  transition: var(--transition-smooth);
  outline: none;
}

textarea {
  min-height: 140px;
  resize: vertical;
}

textarea:focus, input[type="text"]:focus {
  border-color: var(--accent-color);
  background: rgba(0, 0, 0, 0.35);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.char-counter {
  position: absolute;
  bottom: 12px;
  right: 12px;
  font-size: 11px;
  color: var(--text-secondary);
  background: rgba(0,0,0,0.4);
  padding: 2px 6px;
  border-radius: 4px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 15px;
  padding: 14px 24px;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition-smooth);
  position: relative;
  overflow: hidden;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background: var(--accent-color);
  color: #ffffff;
}

body:not(.telegram-theme) .btn-primary:hover {
  background: var(--accent-hover);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-color);
  border: 1px solid var(--card-border);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

.btn-danger {
  background: var(--danger-color);
  color: #fff;
}

.btn-danger:hover {
  background: var(--danger-hover);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: var(--border-radius-sm);
}

.btn-block {
  display: flex;
  width: 100%;
}

/* Button Spinner */
.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-left-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Student Success Card */
.success-card {
  text-align: center;
  animation: scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 40px 24px;
}

.success-icon-wrapper {
  margin-bottom: 24px;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 2px solid var(--success-color);
}

.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: var(--success-color);
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 3;
  stroke-linecap: round;
  stroke: var(--success-color);
  fill: none;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
}

.success-card h2 {
  font-size: 24px;
  margin-bottom: 12px;
  font-weight: 700;
}

.success-card p {
  color: var(--text-secondary);
  font-size: 15px;
  margin-bottom: 30px;
}

/* ADMIN VIEW NAVIGATION TABS */
.admin-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 14, 21, 0.8);
  border: 1px solid var(--card-border);
  border-radius: var(--border-radius-md);
  margin-bottom: 20px;
  padding: 4px;
  overflow: hidden;
}

.admin-nav-tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none; /* Hide standard Firefox scrollbar */
  -ms-overflow-style: none; /* IE/Edge */
}

.admin-nav-tabs::-webkit-scrollbar {
  display: none; /* Hide Chrome/Safari scrollbar */
}

.tab-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 10px 16px;
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 14px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition-smooth);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.03);
}

.tab-btn.active {
  background: var(--accent-color);
  color: #fff;
}

.tab-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 20px;
  min-width: 18px;
  text-align: center;
}

.tab-btn.active .tab-badge {
  background: rgba(0, 0, 0, 0.2);
}

/* Question List & Cards */
.admin-content-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--border-radius-md);
  padding: 16px;
  cursor: pointer;
  transition: var(--transition-smooth);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.question-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.05);
}

.student-info-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7 0%, var(--accent-color) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
}

.student-info-bar .name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
}

.student-info-bar .username {
  font-size: 12px;
  color: var(--text-secondary);
}

.student-info-bar .timestamp {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-secondary);
}

.question-snippet {
  font-size: 14px;
  color: var(--text-color);
  line-height: 1.5;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-card-footer {
  display: flex;
  justify-content: flex-end;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: var(--text-secondary);
}

.empty-state-icon {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* Modals Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-end; /* Slides up from bottom */
}

@media(min-width: 600px) {
  .modal-overlay {
    align-items: center; /* Center on desktop */
  }
}

.modal-content {
  background: var(--secondary-bg-color);
  border-top: 1px solid var(--card-border);
  width: 100%;
  max-width: 600px;
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  padding: 24px;
  box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
  max-height: 90vh;
  overflow-y: auto;
}

@media(min-width: 600px) {
  .modal-content {
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.original-question-box {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--card-border);
  border-radius: var(--border-radius-md);
  padding: 14px;
}

.original-question-box .label {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: 4px;
  text-transform: uppercase;
}

.original-question-box p {
  font-size: 14px;
  color: var(--text-color);
  white-space: pre-wrap;
  word-break: break-word;
}

/* File Upload Styles */
.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.selected-file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 6px 12px;
  border-radius: var(--border-radius-sm);
  font-size: 13px;
}

.selected-file-info .file-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.selected-file-info .file-size {
  color: var(--text-secondary);
  font-size: 11px;
}

.remove-file-btn {
  background: transparent;
  border: none;
  color: var(--danger-color);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
}

/* Settings View Elements */
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-header-action {
  display: flex;
  justify-content: flex-end;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-row-item {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--border-radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-row-header .group-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-color);
}

.group-link-box {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.2);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--card-border);
  padding: 8px 12px;
  font-size: 12px;
}

.group-link-text {
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
  margin-right: 8px;
}

.group-row-actions {
  display: flex;
  gap: 8px;
}

.group-row-actions .btn {
  flex-grow: 1;
}

/* Custom Alert Modals */
.alert-modal {
  text-align: center;
}

.alert-modal p {
  font-size: 15px;
  margin-bottom: 20px;
  color: var(--text-color);
}

.alert-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.alert-actions .btn {
  flex: 1;
}

/* Toast System */
#toast-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1100;
  width: 90%;
  max-width: 400px;
}

.toast {
  background: rgba(22, 24, 36, 0.95);
  border: 1px solid var(--card-border);
  color: var(--text-color);
  padding: 12px 18px;
  border-radius: var(--border-radius-md);
  font-size: 13px;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: toastFadeIn 0.3s ease forwards;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toast.toast-error {
  border-left: 4px solid var(--danger-color);
}

.toast.toast-success {
  border-left: 4px solid var(--success-color);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleUp {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes toastFadeIn {
  from { opacity: 0; transform: translateY(12px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Scrollbars styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--card-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
