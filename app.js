// YouTube QA Telegram Mini App - Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Telegram Web App SDK
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    document.body.classList.add('telegram-theme');
  }

  // State Management
  const state = {
    mode: null, // 'student' or 'admin'
    studentSlug: null, // Group slug for students
    adminGroups: [], // Array of groups
    adminSelectedTab: null, // Current active group ID or 'settings'
    adminQuestions: [], // Questions in active group
    attachedFile: null, // File object to upload
    deleteTargetGroupId: null, // Stored group ID for deletion confirmation
  };

  // DOM Elements
  const appLoading = document.getElementById('app-loading');
  const appContainer = document.getElementById('app-container');
  const studentView = document.getElementById('student-view');
  const studentGroupTitle = document.getElementById('student-group-title');
  const questionForm = document.getElementById('question-form');
  const questionText = document.getElementById('question-text');
  const charCount = document.getElementById('char-count');
  const studentSuccess = document.getElementById('student-success');
  const submitQuestionBtn = document.getElementById('submit-question-btn');
  const closeAppBtn = document.getElementById('close-app-btn');

  const studentFileInput = document.getElementById('student-file-input');
  const studentSelectFileBtn = document.getElementById('student-select-file-btn');
  const studentFileInfo = document.getElementById('student-file-info');
  const studentFileName = document.getElementById('student-file-name');
  const studentFileSize = document.getElementById('student-file-size');
  const studentRemoveFileBtn = document.getElementById('student-remove-file-btn');
  const studentFilePreview = document.getElementById('student-file-preview');

  const adminView = document.getElementById('admin-view');
  const adminTabs = document.getElementById('admin-tabs');
  const adminContent = document.getElementById('admin-content');

  // Modals
  const replyModal = document.getElementById('reply-modal');
  const closeReplyModalBtn = document.getElementById('close-reply-modal-btn');
  const replyForm = document.getElementById('reply-form');
  const replyQuestionId = document.getElementById('reply-question-id');
  const replyStudentAvatar = document.getElementById('reply-student-avatar');
  const replyStudentName = document.getElementById('reply-student-name');
  const replyStudentUsername = document.getElementById('reply-student-username');
  const replyQuestionTime = document.getElementById('reply-question-time');
  const replyQuestionText = document.getElementById('reply-question-text');
  const replyQuestionImage = document.getElementById('reply-question-image');
  const replyText = document.getElementById('reply-text');
  const selectFileBtn = document.getElementById('select-file-btn');
  const fileInput = document.getElementById('reply-file-input');
  const selectedFileInfo = document.getElementById('selected-file-info');
  const selectedFileName = document.getElementById('selected-file-name');
  const selectedFileSize = document.getElementById('selected-file-size');
  const removeFileBtn = document.getElementById('remove-file-btn');
  const submitReplyBtn = document.getElementById('submit-reply-btn');

  const groupModal = document.getElementById('group-modal');
  const closeGroupModalBtn = document.getElementById('close-group-modal-btn');
  const groupForm = document.getElementById('group-form');
  const groupNameInput = document.getElementById('group-name');
  const submitGroupBtn = document.getElementById('submit-group-btn');

  const confirmModal = document.getElementById('confirm-modal');
  const closeConfirmModalBtn = document.getElementById('close-confirm-modal-btn');
  const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

  const toastContainer = document.getElementById('toast-container');

  // Determine InitData for authentication
  function getInitData() {
    let initData = tg?.initData || '';
    
    // Developer bypass for local manual testing in standard browsers
    if (!initData && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') {
        initData = 'mock_admin';
      } else if (urlParams.get('slug')) {
        initData = `mock_student_12345_${urlParams.get('slug')}`;
      }
    }
    return initData;
  }

  // Toast System
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const textNode = document.createElement('span');
    textNode.textContent = message;
    toast.appendChild(textNode);
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'inherit';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.marginLeft = '12px';
    closeBtn.onclick = () => toast.remove();
    toast.appendChild(closeBtn);

    toastContainer.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  // Init App View Mode
  function initApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === 'true';
    const slug = urlParams.get('slug');

    if (isAdminMode) {
      state.mode = 'admin';
      loadAdminDashboard();
    } else if (slug) {
      state.mode = 'student';
      state.studentSlug = slug;
      loadStudentPanel();
    } else {
      // No valid mode
      appLoading.style.display = 'none';
      appContainer.innerHTML = `
        <div class="card glassmorphic text-center" style="margin-top: 50px; text-align: center;">
          <div class="logo-badge">!</div>
          <h2>Havola xato</h2>
          <p style="color: var(--text-secondary); margin-top: 10px;">
            Sizda faol guruh havolasi yo'q. Kurs guruhidan olingan maxsus telegram start havolasi orqali kiring.
          </p>
        </div>
      `;
      appContainer.style.display = 'block';
      document.body.classList.remove('loading');
    }
  }

  // ----------------------------------------------------
  // STUDENT PANEL CODE
  // ----------------------------------------------------

  function loadStudentPanel() {
    // Standard capitalization of slug as group name for aesthetic title fallback
    const displayGroupName = state.studentSlug.charAt(0).toUpperCase() + state.studentSlug.slice(1);
    studentGroupTitle.textContent = `${displayGroupName} guruhi`;
    
    appLoading.style.display = 'none';
    appContainer.style.display = 'block';
    studentView.style.display = 'block';
    document.body.classList.remove('loading');

    // Textarea char count listener
    questionText.addEventListener('input', () => {
      const len = questionText.value.length;
      charCount.textContent = len;
      if (len >= 950) {
        charCount.style.color = 'var(--danger-color)';
      } else {
        charCount.style.color = 'var(--text-secondary)';
      }
    });

    // Student File Upload Listeners
    if (studentSelectFileBtn) {
      studentSelectFileBtn.addEventListener('click', () => {
        studentFileInput.click();
      });

      studentFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
          showToast('Fayl hajmi 5MB dan oshmasligi kerak', 'error');
          studentFileInput.value = '';
          return;
        }

        state.attachedFile = file;
        
        // Show file info
        studentFileName.textContent = file.name;
        studentFileSize.textContent = `(${(file.size / 1024).toFixed(1)} KB)`;
        studentSelectFileBtn.style.display = 'none';
        studentFileInfo.style.display = 'flex';

        // Show preview if image
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            studentFilePreview.src = e.target.result;
            studentFilePreview.style.display = 'block';
          };
          reader.readAsDataURL(file);
        } else {
          studentFilePreview.style.display = 'none';
        }
      });

      studentRemoveFileBtn.addEventListener('click', () => {
        studentFileInput.value = '';
        state.attachedFile = null;
        studentSelectFileBtn.style.display = 'flex';
        studentFileInfo.style.display = 'none';
        studentFilePreview.src = '';
      });
    }

    // Handle Form Submit
    questionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const qText = questionText.value.trim();
      if (!qText) return;

      setLoading(submitQuestionBtn, true);

      try {
        let response;
        if (state.attachedFile) {
          const formData = new FormData();
          formData.append('group_slug', state.studentSlug);
          formData.append('question_text', qText);
          formData.append('file', state.attachedFile);
          
          response = await fetch('/api/question', {
            method: 'POST',
            headers: {
              'X-Telegram-Init-Data': getInitData()
            },
            body: formData
          });
        } else {
          response = await fetch('/api/question', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Telegram-Init-Data': getInitData()
            },
            body: JSON.stringify({
              group_slug: state.studentSlug,
              question_text: qText
            })
          });
        }

        const result = await response.json();
        
        if (response.ok && result.success) {
          // Success sequence
          questionForm.style.display = 'none';
          studentSuccess.style.display = 'block';
          
          // Qolgan savol sonini ko'rsatish
          const remainingInfo = document.getElementById('remaining-info');
          if (remainingInfo && result.remaining_today !== undefined) {
            if (result.remaining_today > 0) {
              remainingInfo.textContent = `📝 Bugun yana ${result.remaining_today} ta savol yuborishingiz mumkin.`;
            } else {
              remainingInfo.textContent = `⚠️ Bugungi kunlik limit tugadi (3/3).`;
            }
          }
        } else {
          showToast(result.error || 'Savol yuborishda xatolik yuz berdi', 'error');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        showToast('Internet aloqasi mavjud emas yoki serverda xatolik', 'error');
      } finally {
        setLoading(submitQuestionBtn, false);
      }
    });

    // Close button
    closeAppBtn.addEventListener('click', () => {
      if (tg) {
        tg.close();
      } else {
        window.close();
      }
    });
  }

  // ----------------------------------------------------
  // ADMIN PANEL CODE
  // ----------------------------------------------------

  async function loadAdminDashboard() {
    try {
      const response = await fetch('/api/admin/groups', {
        method: 'GET',
        headers: {
          'X-Telegram-Init-Data': getInitData()
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Dashboard loading failed');
      }

      const result = await response.json();
      state.adminGroups = result.groups;

      // Select first active group tab or fallback to settings
      if (state.adminGroups.length > 0) {
        state.adminSelectedTab = state.adminGroups[0].id;
      } else {
        state.adminSelectedTab = 'settings';
      }

      renderAdminNav();
      renderAdminContent();

      appLoading.style.display = 'none';
      appContainer.style.display = 'block';
      adminView.style.display = 'block';
      document.body.classList.remove('loading');

    } catch (error) {
      console.error(error);
      appLoading.style.display = 'none';
      appContainer.innerHTML = `
        <div class="card glassmorphic text-center" style="margin-top: 50px; text-align: center;">
          <div class="logo-badge">X</div>
          <h2>Kirish taqiqlanadi</h2>
          <p style="color: var(--text-secondary); margin-top: 10px;">
            ${error.message || 'Faqatgina admin ushbu panelga kira oladi.'}
          </p>
        </div>
      `;
      appContainer.style.display = 'block';
      document.body.classList.remove('loading');
    }
  }

  // Render Admin Navigation Tabs
  function renderAdminNav() {
    adminTabs.innerHTML = '';

    // Render group tabs
    state.adminGroups.forEach(g => {
      const tab = document.createElement('button');
      tab.className = `tab-btn ${state.adminSelectedTab === g.id ? 'active' : ''}`;
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = g.name;
      tab.appendChild(nameSpan);

      if (g.pending_count > 0) {
        const badge = document.createElement('span');
        badge.className = 'tab-badge';
        badge.textContent = g.pending_count;
        tab.appendChild(badge);
      }

      tab.addEventListener('click', () => {
        state.adminSelectedTab = g.id;
        renderAdminNav();
        renderAdminContent();
      });
      adminTabs.appendChild(tab);
    });

    // Render Settings Tab
    const settingsTab = document.createElement('button');
    settingsTab.className = `tab-btn ${state.adminSelectedTab === 'settings' ? 'active' : ''}`;
    settingsTab.innerHTML = '⚙️ Sozlamalar';
    settingsTab.addEventListener('click', () => {
      state.adminSelectedTab = 'settings';
      renderAdminNav();
      renderAdminContent();
    });
    adminTabs.appendChild(settingsTab);
  }

  // Render Admin main content area (based on selected tab)
  async function renderAdminContent() {
    adminContent.innerHTML = '';

    // Case 1: Settings view selected
    if (state.adminSelectedTab === 'settings') {
      renderSettingsView();
      return;
    }

    // Case 2: Group questions view
    adminContent.innerHTML = `
      <div class="spinner-container" style="padding: 40px 0;">
        <div class="spinner" style="width: 32px; height: 32px;"></div>
        <p>Yuklanmoqda...</p>
      </div>
    `;

    try {
      const response = await fetch(`/api/admin/questions/${state.adminSelectedTab}`, {
        method: 'GET',
        headers: {
          'X-Telegram-Init-Data': getInitData()
        }
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      state.adminQuestions = result.questions;
      adminContent.innerHTML = ''; // Clear spinner

      if (state.adminQuestions.length === 0) {
        adminContent.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🎉</div>
            <p>Javob berilmagan savollar yo'q!</p>
          </div>
        `;
        return;
      }

      // Render questions feed
      state.adminQuestions.forEach(q => {
        const card = document.createElement('article');
        card.className = 'question-card glassmorphic';
        
        // Initials for avatar
        const initials = getInitials(q.first_name);
        const timeAgo = formatTimeAgo(q.created_at);
        const userDisplay = q.username ? `@${q.username}` : '';

        card.innerHTML = `
          <div class="student-info-bar">
            <div class="avatar">${initials}</div>
            <div>
              <div class="name">${escapeHTML(q.first_name)}</div>
              <div class="username">${userDisplay}</div>
            </div>
            <div class="timestamp">${timeAgo}</div>
          </div>
          <p class="question-snippet">${escapeHTML(q.question_text)}</p>
          ${q.image_url ? '<div class="attachment-badge">📎 Rasm biriktirilgan</div>' : ''}
          <div class="question-card-footer">
            <button class="btn btn-secondary btn-sm">Javob berish</button>
          </div>
        `;

        card.addEventListener('click', () => openReplyModal(q));
        adminContent.appendChild(card);
      });

    } catch (err) {
      console.error(err);
      adminContent.innerHTML = `
        <div class="empty-state" style="color: var(--danger-color)">
          <p>Savollarni yuklashda xatolik: ${err.message}</p>
        </div>
      `;
    }
  }

  // Render settings page (Group list management, adding new groups)
  function renderSettingsView() {
    const container = document.createElement('div');
    container.className = 'settings-container animate-fade-in';

    // Header create action
    const headerAction = document.createElement('div');
    headerAction.className = 'settings-header-action';
    
    const addGroupBtn = document.createElement('button');
    addGroupBtn.className = 'btn btn-primary btn-sm';
    addGroupBtn.innerHTML = '+ Yangi guruh';
    addGroupBtn.addEventListener('click', () => {
      groupNameInput.value = '';
      groupModal.style.display = 'flex';
    });
    headerAction.appendChild(addGroupBtn);
    container.appendChild(headerAction);

    // Groups List
    const list = document.createElement('div');
    list.className = 'groups-list';

    if (state.adminGroups.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <p>Hozircha guruhlar mavjud emas.</p>
        </div>
      `;
    } else {
      state.adminGroups.forEach(g => {
        const row = document.createElement('div');
        row.className = 'group-row-item glassmorphic';
        
        // Deep link path
        const botUsername = tg?.initDataUnsafe?.receiver?.username || 'Teno_questions_bot';
        const startLink = `https://t.me/${botUsername}?start=${g.slug}`;

        row.innerHTML = `
          <div class="group-row-header">
            <div class="group-title">${escapeHTML(g.name)}</div>
            <div class="tab-badge">${g.pending_count} savol</div>
          </div>
          <div class="group-link-box">
            <span class="group-link-text" id="link-text-${g.id}">${startLink}</span>
          </div>
          <div class="group-row-actions">
            <button class="btn btn-secondary btn-sm" id="btn-copy-${g.id}">Nusxalash</button>
            <button class="btn btn-danger btn-sm" id="btn-delete-${g.id}">O'chirish</button>
          </div>
        `;

        // Clipboard Copy listener
        row.querySelector(`#btn-copy-${g.id}`).addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(startLink);
            showToast('Havola clipboardga ko\'chirildi!');
          } catch (err) {
            showToast('Nusxalab bo\'lmadi, qo\'lda nusxalang', 'error');
          }
        });

        // Trigger Delete confirmation modal
        row.querySelector(`#btn-delete-${g.id}`).addEventListener('click', (e) => {
          e.stopPropagation();
          state.deleteTargetGroupId = g.id;
          confirmModal.style.display = 'flex';
        });

        list.appendChild(row);
      });
    }

    container.appendChild(list);
    adminContent.appendChild(container);
  }

  // ----------------------------------------------------
  // ADMIN ACTIONS & DIALOG HANDLERS
  // ----------------------------------------------------

  // A. Answer Modal logic
  function openReplyModal(question) {
    replyQuestionId.value = question.id;
    replyStudentAvatar.textContent = getInitials(question.first_name);
    replyStudentName.textContent = question.first_name;
    replyStudentUsername.textContent = question.username ? `@${question.username}` : 'username yo\'q';
    replyQuestionTime.textContent = formatTimeAgo(question.created_at);
    replyQuestionText.textContent = question.question_text;
    
    if (question.image_url && replyQuestionImage) {
      replyQuestionImage.src = question.image_url;
      replyQuestionImage.style.display = 'block';
    } else if (replyQuestionImage) {
      replyQuestionImage.style.display = 'none';
      replyQuestionImage.src = '';
    }
    
    // Clear previous inputs
    replyText.value = '';
    state.attachedFile = null;
    fileInput.value = '';
    selectedFileInfo.style.display = 'none';

    replyModal.style.display = 'flex';
    replyText.focus();
  }

  // Trigger file browser
  selectFileBtn.addEventListener('click', () => {
    fileInput.click();
  });

  // File selected trigger
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Fayl o\'lchami 10MB dan ko\'p bo\'lmasligi kerak', 'error');
      fileInput.value = '';
      return;
    }

    state.attachedFile = file;
    selectedFileName.textContent = file.name;
    selectedFileSize.textContent = `(${formatBytes(file.size)})`;
    selectedFileInfo.style.display = 'flex';
  });

  // Remove file listener
  removeFileBtn.addEventListener('click', () => {
    state.attachedFile = null;
    fileInput.value = '';
    selectedFileInfo.style.display = 'none';
  });

  // Submit Answer
  replyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const ansText = replyText.value.trim();
    const qId = replyQuestionId.value;

    if (!ansText && !state.attachedFile) {
      showToast('Javob matni yoki biriktirilgan fayl bo\'lishi shart', 'error');
      return;
    }

    setLoading(submitReplyBtn, true);

    try {
      const formData = new FormData();
      formData.append('question_id', qId);
      formData.append('answer_text', ansText);
      if (state.attachedFile) {
        formData.append('file', state.attachedFile);
      }

      const response = await fetch('/api/admin/answer', {
        method: 'POST',
        headers: {
          'X-Telegram-Init-Data': getInitData()
        },
        body: formData // No Content-Type header when sending FormData!
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast('Javob talabaga yuborildi!');
        replyModal.style.display = 'none';
        
        // Refresh dashboard numbers & active questions list
        await refreshDashboardState();
      } else {
        showToast(result.error || 'Javob yuborishda xatolik yuz berdi', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Xabar yuborilmadi (Internet aloqasini tekshiring)', 'error');
    } finally {
      setLoading(submitReplyBtn, false);
    }
  });

  closeReplyModalBtn.addEventListener('click', () => {
    replyModal.style.display = 'none';
  });

  // B. Group Creation Submission
  groupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = groupNameInput.value.trim();
    if (!name) return;

    setLoading(submitGroupBtn, true);

    try {
      const response = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': getInitData()
        },
        body: JSON.stringify({ name })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast('Yangi guruh muvaffaqiyatli yaratildi!');
        groupModal.style.display = 'none';
        
        // Reload dashboard
        await refreshDashboardState();
      } else {
        showToast(result.error || 'Guruh yaratishda xatolik', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Guruh yaratib bo\'lmadi', 'error');
    } finally {
      setLoading(submitGroupBtn, false);
    }
  });

  closeGroupModalBtn.addEventListener('click', () => {
    groupModal.style.display = 'none';
  });

  // C. Group Deletion Dialog logic
  confirmDeleteBtn.addEventListener('click', async () => {
    if (!state.deleteTargetGroupId) return;

    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.textContent = 'O\'chirilmoqda...';

    try {
      const response = await fetch(`/api/admin/groups/${state.deleteTargetGroupId}`, {
        method: 'DELETE',
        headers: {
          'X-Telegram-Init-Data': getInitData()
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast('Guruh o\'chirib yuborildi!');
        confirmModal.style.display = 'none';
        
        // Adjust selected tab if current active tab was deleted
        if (state.adminSelectedTab === state.deleteTargetGroupId) {
          state.adminSelectedTab = 'settings';
        }

        await refreshDashboardState();
      } else {
        showToast(result.error || 'Guruhni o\'chirishda xatolik yuz berdi', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server aloqa xatosi', 'error');
    } finally {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.textContent = 'O\'chirish';
      state.deleteTargetGroupId = null;
    }
  });

  confirmCancelBtn.addEventListener('click', () => {
    confirmModal.style.display = 'none';
    state.deleteTargetGroupId = null;
  });

  closeConfirmModalBtn.addEventListener('click', () => {
    confirmModal.style.display = 'none';
    state.deleteTargetGroupId = null;
  });

  // Close modals when clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === replyModal) {
      replyModal.style.display = 'none';
    } else if (e.target === groupModal) {
      groupModal.style.display = 'none';
    } else if (e.target === confirmModal) {
      confirmModal.style.display = 'none';
      state.deleteTargetGroupId = null;
    }
  });

  // Refresh groups and counts from DB
  async function refreshDashboardState() {
    try {
      const response = await fetch('/api/admin/groups', {
        method: 'GET',
        headers: {
          'X-Telegram-Init-Data': getInitData()
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        state.adminGroups = result.groups;
        
        // Render updated components
        renderAdminNav();
        renderAdminContent();
      }
    } catch (err) {
      console.error('Error refreshing admin state:', err);
    }
  }

  // ----------------------------------------------------
  // HELPER UTILITIES
  // ----------------------------------------------------

  function setLoading(buttonEl, isLoading) {
    const textEl = buttonEl.querySelector('.btn-text');
    const spinnerEl = buttonEl.querySelector('.btn-spinner');

    if (isLoading) {
      buttonEl.disabled = true;
      if (textEl) textEl.style.display = 'none';
      if (spinnerEl) spinnerEl.style.display = 'inline-block';
    } else {
      buttonEl.disabled = false;
      if (textEl) textEl.style.display = 'inline-block';
      if (spinnerEl) spinnerEl.style.display = 'none';
    }
  }

  function getInitials(name) {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function formatTimeAgo(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Hozirgina';
    if (diffMins < 60) return `${diffMins} daqiqa oldin`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} soat oldin`;

    // Standard short date format
    return date.toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Launch App
  initApp();
});
