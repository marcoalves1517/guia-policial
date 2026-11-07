// Guia de Expediente Policial - Core Logic & Real-Time Cloud Engine

// =========================================================================
// 1. AUTO-UPDATE & ANTI-CACHE ENGINE (v8.4.0)
// =========================================================================
const CURRENT_APP_VERSION = 'v8.4.0';
(function autoUpdateCheck() {
  try {
    const storedVersion = localStorage.getItem('opc_app_version');
    if (storedVersion !== CURRENT_APP_VERSION) {
      console.log('Nova versão v8.4 detetada! A atualizar cache...');
      localStorage.setItem('opc_app_version', CURRENT_APP_VERSION);
      localStorage.removeItem('opc_expedientes_data');
      localStorage.removeItem('opc_artigos_data');
      if ('caches' in window) {
        caches.keys().then((keys) => {
          return Promise.all(keys.map(k => caches.delete(k)));
        }).then(() => {
          window.location.reload();
        });
        return;
      }
    }
  } catch (err) {
    console.warn('Erro na verificação de versão:', err);
  }
})();

// =========================================================================
// CRYPTOGRAPHIC SECURITY (SHA-256) & SOUND SYNTHESIZER ENGINE
// =========================================================================
// Admin password is never stored in clear text. Only a salted PBKDF2-SHA256
// derivation (150k iterations) is kept, so the password cannot be read from the code.
const ADMIN_KDF = {
  salt: 'ee682819ee0d82b955b5ca318a180545',
  iterations: 150000,
  hash: 'b4e4347bd3414a029b37d3b432aaf3a41d412964924212ea3409a0fca682f042'
};

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

async function pbkdf2Hex(password, saltHex, iterations) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex), iterations, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyAdminPassword(input) {
  if (!input || !(window.crypto && crypto.subtle)) return false;
  try {
    const derived = await pbkdf2Hex(input, ADMIN_KDF.salt, ADMIN_KDF.iterations);
    let diff = derived.length ^ ADMIN_KDF.hash.length;
    for (let i = 0; i < derived.length; i++) diff |= derived.charCodeAt(i) ^ (ADMIN_KDF.hash.charCodeAt(i) || 0);
    return diff === 0;
  } catch (e) {
    return false;
  }
}

// Remove any legacy plain-text admin password left from older versions
try {
  localStorage.removeItem('opc_admin_password');
  localStorage.removeItem('opc_admin_custom_hash');
} catch (e) {}

// =========================================================================
// SOUND SYNTHESIZER (Web Audio API - offline, shared context, mutable)
// =========================================================================
let sharedAudioCtx = null;
function getAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx();
  if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume().catch(() => {});
  return sharedAudioCtx;
}

function isSoundOn() {
  try { return localStorage.getItem('opc_sound_off') !== '1'; } catch (e) { return true; }
}

// notes: [[freq, startOffset, duration, type, volume], ...]
function playTones(notes) {
  if (!isSoundOn()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    notes.forEach(([freq, at, dur, type = 'sine', vol = 0.1, freqEnd]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + at);
      if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, now + at + dur);
      gain.gain.setValueAtTime(0.0001, now + at);
      gain.gain.exponentialRampToValueAtTime(vol, now + at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + at);
      osc.stop(now + at + dur + 0.02);
    });
  } catch (e) {}
}

function playLoginSuccessSound() { playTones([[523.25, 0, 0.18, 'sine', 0.12], [659.25, 0.09, 0.18, 'sine', 0.12], [783.99, 0.18, 0.18, 'sine', 0.12], [1046.5, 0.28, 0.35, 'sine', 0.1]]); }
function playAdminLoginSound() { playTones([[392, 0, 0.16, 'triangle', 0.12], [523.25, 0.1, 0.16, 'triangle', 0.12], [659.25, 0.2, 0.16, 'triangle', 0.12], [783.99, 0.3, 0.16, 'triangle', 0.12], [1046.5, 0.4, 0.5, 'sine', 0.12]]); }
function playLogoutSound() { playTones([[659.25, 0, 0.22, 'sine', 0.1, 440], [440, 0.14, 0.3, 'sine', 0.08, 293.66]]); }
function playErrorSound() { playTones([[220, 0, 0.12, 'triangle', 0.12], [185, 0.1, 0.2, 'triangle', 0.12]]); }
function playAlertChime() { playTones([[587.33, 0, 0.14, 'sine', 0.16], [880, 0.12, 0.3, 'sine', 0.16]]); }
function playClickSound() { playTones([[880, 0, 0.05, 'sine', 0.05]]); }
function playTabSound() { playTones([[520, 0, 0.07, 'sine', 0.06, 700]]); }
function playOpenSound() { playTones([[400, 0, 0.1, 'sine', 0.07, 640]]); }
function playCloseSound() { playTones([[560, 0, 0.1, 'sine', 0.06, 340]]); }
function playSendSound() { playTones([[659.25, 0, 0.1, 'sine', 0.1], [880, 0.08, 0.16, 'sine', 0.1]]); }
function playToggleSound() { playTones([[740, 0, 0.05, 'triangle', 0.06]]); }

// Global UI feedback: soft click on any button / tappable card
document.addEventListener('click', (ev) => {
  const t = ev.target.closest && ev.target.closest('button, .nav-tab, .chip, .crime-card, .article-card, .icon-btn, a.btn-whatsapp');
  if (!t) return;
  if (t.closest('#detailModal, #adminModal, #settingsModal, #securityGate, .app-header, .nav-tabs, nav') || t.matches('.crime-card, .article-card')) {
    playClickSound();
  }
  // Ripple effect (only on solid buttons, so badges/icons are never clipped)
  if (!t.matches('.btn-primary, .btn-secondary, .btn-whatsapp, .btn-approve, .btn-reject, .nav-tab')) return;
  const r = t.getBoundingClientRect();
  const rip = document.createElement('span');
  rip.className = 'ripple';
  const size = Math.max(r.width, r.height);
  rip.style.width = rip.style.height = size + 'px';
  rip.style.left = (ev.clientX - r.left - size / 2) + 'px';
  rip.style.top = (ev.clientY - r.top - size / 2) + 'px';
  if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
  t.classList.add('has-ripple');
  t.appendChild(rip);
  setTimeout(() => rip.remove(), 600);
}, true);

// Data Arrays
let allExpedientes = [];
let allArtigos = [];

let activeMainTab = 'expedientes';

// Expedientes state
let currentCategory = 'all';
let currentNature = 'all';
let currentSearch = '';
let onlyFavorites = false;
let currentDetailItem = null;

// Artigos state
let currentArtigoTheme = 'all';
let currentArtigoSearch = '';
const expandedArticles = new Set();

// Active Polling & Interval Timers (declared explicitly)
let adminPollInterval = null;
let userApprovalPollInterval = null;
let sessionGuardInterval = null;

// =========================================================================
// 2. REAL-TIME CLOUD EVENT BUS (NTFY.SH TELEFONE ↔ PC)
// =========================================================================
const DEFAULT_SYNC_TOPIC = 'opc_guia_marcoalves_v8';
const NTFY_BASE_URL = 'https://ntfy.sh';

function getSyncTopic() {
  return localStorage.getItem('opc_sync_topic') || DEFAULT_SYNC_TOPIC;
}

let syncEventSource = null;
let lastKnownPendingCount = 0;

// Broadcast an event to all connected devices in real time (< 0.3s latency)
async function broadcastSyncEvent(payload) {
  const topic = getSyncTopic();
  try {
    const res = await fetch(`${NTFY_BASE_URL}/${topic}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao transmitir evento de sincronização:', err);
    return false;
  }
}

// Connect to real-time Server-Sent Events stream
function initRealtimeBus() {
  if (syncEventSource) return;
  const topic = getSyncTopic();

  try {
    syncEventSource = new EventSource(`${NTFY_BASE_URL}/${topic}/sse`);

    syncEventSource.onmessage = (e) => {
      try {
        const ntfyMsg = JSON.parse(e.data);
        if (!ntfyMsg || !ntfyMsg.message) return;
        const payload = JSON.parse(ntfyMsg.message);
        handleIncomingSyncEvent(payload, false);
      } catch (err) {
        // Heartbeat or parse error
      }
    };

    syncEventSource.onerror = () => {
      // Browser automatically retries EventSource reconnection
    };
  } catch (err) {
    console.warn('EventSource indisponível:', err);
  }
}

// Recover recent events from last 24h cache
async function catchUpSyncHistory() {
  const topic = getSyncTopic();
  try {
    const res = await fetch(`${NTFY_BASE_URL}/${topic}/json?poll=1&since=24h`, { cache: 'no-cache' });
    if (!res.ok) return;
    const text = await res.text();
    const lines = text.trim().split('\n');
    for (const line of lines) {
      if (!line) continue;
      try {
        const item = JSON.parse(line);
        if (item && item.message) {
          const payload = JSON.parse(item.message);
          handleIncomingSyncEvent(payload, true);
        }
      } catch {}
    }
    updateAdminHeaderBadge();
  } catch (err) {
    console.warn('Falha no histórico de sincronização:', err);
  }
}

// Central dispatcher for real-time events
function handleIncomingSyncEvent(payload, isBackfill = false) {
  if (!payload || !payload.type) return;

  const users = getUsers();
  const invites = getInviteCodes();

  // 1. Colleague requested access via form
  if (payload.type === 'REQUEST_ACCESS' && payload.user) {
    const incoming = payload.user;
    const idx = users.findIndex(u => 
      u.id === incoming.id || 
      (incoming.phone && u.phone && u.phone.replace(/\D/g, '') === incoming.phone.replace(/\D/g, '')) ||
      (incoming.code && u.code && u.code === incoming.code)
    );
    
    if (idx >= 0) {
      if (users[idx].status !== 'approved' && users[idx].status !== 'blocked') {
        users[idx] = { ...users[idx], ...incoming };
      }
    } else {
      users.unshift(incoming);
    }
    saveUsersLocally(users);

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      updateAdminHeaderBadge();
      if (!isBackfill) {
        playAlertChime();
        showToast(`🚨 Novo pedido: ${incoming.name} (${incoming.role})!`);
        const modal = document.getElementById('adminModal');
        if (modal && modal.classList.contains('open')) {
          renderAdminDashboard();
        }
      }
    }
  }

  // 2. Marco approved a colleague from PC
  else if (payload.type === 'ACCESS_APPROVED') {
    const userId = payload.userId;
    const userCode = payload.code;
    const userPhone = payload.phone;

    const target = users.find(u => u.id === userId || (userCode && u.code === userCode));
    if (target) {
      target.status = 'approved';
      saveUsersLocally(users);
    }

    // Check if this device is waiting for this approval!
    const pendingId = localStorage.getItem('opc_pending_user_id');
    const isWaiting = (pendingId && (pendingId === userId || (target && target.id === pendingId)));

    if (isWaiting) {
      localStorage.removeItem('opc_pending_user_id');
      const approvedUser = payload.user || target || { id: userId, name: payload.userName || 'Colega', role: 'OPC', code: userCode, status: 'approved' };
      
      showGateSuccess('✓ Acesso APROVADO pelo Administrador! A entrar no sistema...');
      showToast('🎉 Bem-vindo ao Guia Policial!');
      setTimeout(() => {
        setCurrentUser(approvedUser);
      }, 500);
    }

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      updateAdminHeaderBadge();
      const modal = document.getElementById('adminModal');
      if (modal && modal.classList.contains('open')) {
        renderAdminDashboard();
      }
    }
  }

  // 3. Marco rejected or revoked access (BLOQUEAR / RECUSAR)
  else if (payload.type === 'ACCESS_REVOKED') {
    const userId = payload.userId;
    const userCode = payload.code;
    const userPhone = payload.phone;

    const target = users.find(u => u.id === userId || (userCode && u.code === userCode));
    if (target) {
      target.status = 'blocked';
      saveUsersLocally(users);
    }

    // If waiting screen was open
    const pendingId = localStorage.getItem('opc_pending_user_id');
    if (pendingId === userId || (target && target.id === pendingId)) {
      localStorage.removeItem('opc_pending_user_id');
      cancelWaitingRequest();
      showGateError('O seu pedido de acesso foi recusado pelo Administrador.');
    }

    // If colleague is currently logged in on this device: KICK OUT IMMEDIATELY (<0.3s)
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role !== 'admin') {
      const isMatch = (currentUser.id && currentUser.id === userId) ||
                      (userCode && currentUser.code === userCode) ||
                      (userPhone && currentUser.phone && currentUser.phone.replace(/\D/g, '') === userPhone.replace(/\D/g, ''));
      if (isMatch) {
        logoutApp('A sua conta foi bloqueada ou suspensa pelo Administrador.');
        showGateError('A sua conta foi bloqueada ou suspensa pelo Administrador.');
        return;
      }
    }

    if (currentUser && currentUser.role === 'admin') {
      updateAdminHeaderBadge();
      const modal = document.getElementById('adminModal');
      if (modal && modal.classList.contains('open')) {
        renderAdminDashboard();
      }
    }
  }

  // 4. Invite generated by Marco
  else if (payload.type === 'INVITE_CREATED' && payload.invite) {
    const idx = invites.findIndex(i => i.code === payload.invite.code);
    if (idx >= 0) {
      invites[idx] = payload.invite;
    } else {
      invites.unshift(payload.invite);
    }
    saveInvitesLocally(invites);
  }

  // 5. Invite toggled/revoked
  else if (payload.type === 'INVITE_TOGGLED') {
    const inv = invites.find(i => i.code === payload.code);
    if (inv) {
      inv.active = payload.active;
      saveInvitesLocally(invites);
    }
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.inviteCode === payload.code && !payload.active) {
      logoutApp('O código de convite utilizado foi revogado.');
      showGateError('O código de convite utilizado foi revogado.');
    }
  }

  // 6. Global Wipe DB Event
  else if (payload.type === 'WIPE_ALL_DATA') {
    const currentUser = getCurrentUser();
    localStorage.removeItem('opc_users_db');
    localStorage.removeItem('opc_invites_db');
    localStorage.removeItem('opc_pending_user_id');
    if (currentUser && currentUser.role !== 'admin') {
      logoutApp('A base de dados foi reposta pelo Administrador.');
      showGateError('A base de dados foi reposta pelo Administrador.');
    } else if (currentUser && currentUser.role === 'admin') {
      renderAdminDashboard();
      updateAdminHeaderBadge();
    }
  }

}

function saveUsersLocally(users) {
  localStorage.setItem('opc_users_db', JSON.stringify(users));
}

function saveInvitesLocally(invites) {
  localStorage.setItem('opc_invites_db', JSON.stringify(invites));
}

function updateAdminHeaderBadge() {
  const users = getUsers();
  const pending = users.filter(u => u.status === 'pending');
  const headerBadge = document.getElementById('headerPendingBadge');
  const adminBtn = document.getElementById('adminPanelBtn');

  if (pending.length > 0) {
    if (headerBadge) {
      headerBadge.textContent = pending.length;
      headerBadge.style.display = 'inline-block';
    }
    if (adminBtn) adminBtn.classList.add('has-pending-alert');
  } else {
    if (headerBadge) headerBadge.style.display = 'none';
    if (adminBtn) adminBtn.classList.remove('has-pending-alert');
  }
}

// =========================================================================
// 3. AUTHENTICATION & USER MANAGEMENT STATE
// =========================================================================

function getAdminPassword() {
  return 'set'; // admin password is fixed (hashed in code)
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('opc_users_db') || '[]');
  } catch {
    return [];
  }
}

function getInviteCodes() {
  try {
    return JSON.parse(localStorage.getItem('opc_invites_db') || '[]');
  } catch {
    return [];
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('opc_current_user') || 'null');
  } catch {
    return null;
  }
}

function setCurrentUser(userObj) {
  localStorage.setItem('opc_current_user', JSON.stringify(userObj));
  localStorage.setItem('opc_unlocked', 'true');
  applyUserSession(userObj);
}

function isAppUnlocked() {
  return localStorage.getItem('opc_unlocked') === 'true';
}

function playGateUnlockAnimation() {
  return new Promise((resolve) => {
    const gate = document.getElementById('securityGate');
    if (!gate || gate.style.display === 'none') return resolve();
    gate.classList.add('unlocking');
    setTimeout(() => { gate.classList.remove('unlocking'); resolve(); }, 480);
  });
}

function shakeGate() {
  const box = document.querySelector('.security-box');
  if (!box) return;
  box.classList.remove('shake');
  void box.offsetWidth;
  box.classList.add('shake');
  setTimeout(() => box.classList.remove('shake'), 500);
}

function unlockApp() {
  const gate = document.getElementById('securityGate');
  if (gate) gate.style.display = 'none';
  const app = document.getElementById('appContainer');
  if (app) {
    app.classList.remove('app-enter');
    void app.offsetWidth;
    app.classList.add('app-enter');
  }
}

function logoutApp(msg = '') {
  playLogoutSound();
  try {
    if (adminPollInterval) { clearInterval(adminPollInterval); adminPollInterval = null; }
    if (userApprovalPollInterval) { clearInterval(userApprovalPollInterval); userApprovalPollInterval = null; }
    if (sessionGuardInterval) { clearInterval(sessionGuardInterval); sessionGuardInterval = null; }
  } catch (e) {
    console.warn('Erro ao limpar timers no logout:', e);
  }

  localStorage.removeItem('opc_unlocked');
  localStorage.removeItem('opc_current_user');
  localStorage.removeItem('opc_pending_user_id');

  const gate = document.getElementById('securityGate');
  if (gate) {
    gate.style.display = 'flex';
    gate.classList.remove('gate-return');
    void gate.offsetWidth;
    gate.classList.add('gate-return');
    setTimeout(() => gate.classList.remove('gate-return'), 600);
  }

  const adminBtn = document.getElementById('adminPanelBtn');
  if (adminBtn) adminBtn.style.display = 'none';

  const input = document.getElementById('unifiedLoginInput');
  if (input) input.value = '';

  switchGateView('login');
  closeAdminModal();
  closeDetail();
  closeSettings();
  closeAdminSetupModal();
  updateAdminSetupBanner();

  if (msg) {
    showGateError(msg);
  } else {
    showToast('Sessão terminada com sucesso.');
  }
}

function applyUserSession(user) {
  unlockApp();
  const badge = document.getElementById('userRoleBadge');
  const adminBtn = document.getElementById('adminPanelBtn');

  if (user && user.role === 'admin') {
    if (badge) {
      badge.textContent = 'ADMIN';
      badge.className = 'admin-badge';
    }
    if (adminBtn) adminBtn.style.display = 'flex';
    startAdminRealTimePolling();
  } else {
    if (badge) {
      badge.textContent = user ? (user.role || 'OPC') : 'OPC';
      badge.className = 'brand-badge';
    }
    if (adminBtn) adminBtn.style.display = 'none';
    if (adminPollInterval) {
      clearInterval(adminPollInterval);
      adminPollInterval = null;
    }
  }
}

// ---------------------------------------------------------------------
// Gate Views, Setup & Unified Login
// ---------------------------------------------------------------------

function switchGateView(view) {
  hideGateMessages();
  const loginPanel = document.getElementById('gateViewLogin');
  const reqPanel = document.getElementById('gateViewRequest');
  const waitPanel = document.getElementById('gateViewWaiting');
  const setupPanel = document.getElementById('gateViewSetup');

  if (loginPanel) loginPanel.classList.remove('active');
  if (reqPanel) reqPanel.classList.remove('active');
  if (waitPanel) waitPanel.classList.remove('active');
  if (setupPanel) setupPanel.classList.remove('active');

  if (view === 'login' && loginPanel) {
    loginPanel.classList.add('active');
    const input = document.getElementById('unifiedLoginInput');
    if (input) setTimeout(() => input.focus(), 100);
  } else if (view === 'setup' && setupPanel) {
    setupPanel.classList.add('active');
    const p1 = document.getElementById('setupNewAdminPass');
    if (p1) setTimeout(() => p1.focus(), 100);
  } else if (view === 'request' && reqPanel) {
    reqPanel.classList.add('active');
    const firstInput = document.getElementById('reqName');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  } else if (view === 'waiting' && waitPanel) {
    waitPanel.classList.add('active');
  }
}

function showGateError(msg) {
  shakeGate();
  const el = document.getElementById('gateError');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
  const succ = document.getElementById('gateSuccess');
  if (succ) succ.style.display = 'none';
}

function showGateSuccess(msg) {
  const el = document.getElementById('gateSuccess');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
  const err = document.getElementById('gateError');
  if (err) err.style.display = 'none';
}

function hideGateMessages() {
  const err = document.getElementById('gateError');
  if (err) err.style.display = 'none';
  const succ = document.getElementById('gateSuccess');
  if (succ) succ.style.display = 'none';
}

function updateAdminSetupBanner() {
  const banner = document.getElementById('adminFirstRunNotice');
  if (banner) {
    const adminPass = getAdminPassword();
    banner.style.display = adminPass ? 'none' : 'flex';
  }
}

function openAdminSetupModal() {
  switchGateView('setup');
}

function closeAdminSetupModal() {
  switchGateView('login');
}

function closeAdminSetupOnBackdrop(e) {
  switchGateView('login');
}

// 1. Unified Login (User Code or Admin Password)
async function handleUnifiedLogin(e) {
  e.preventDefault();
  hideGateMessages();
  const input = (document.getElementById('unifiedLoginInput').value || '').trim();
  if (!input) return;

  // 1. Check if Admin Password matches cryptographically (SHA-256 for private admin password)
  const isAdmin = await verifyAdminPassword(input);
  if (isAdmin) {
    const adminUser = {
      id: 'admin_root',
      name: 'Administrador',
      role: 'admin'
    };
    playAdminLoginSound();
    await playGateUnlockAnimation();
    setCurrentUser(adminUser);
    showToast('👑 Bem-vindo, Administrador!');
    setTimeout(() => {
      openAdminModal();
    }, 350);
    return;
  }

  showToast('A verificar código...');
  await catchUpSyncHistory();
  const users = getUsers();

  // 2. Check Colleague by Code (or Phone)
  const cleanInputDigits = input.replace(/\D/g, '');
  const matchedUser = users.find(u => {
    if (u.code && u.code.toLowerCase() === input.toLowerCase()) return true;
    if (cleanInputDigits && u.phone && u.phone.replace(/\D/g, '') === cleanInputDigits) return true;
    return false;
  });

  if (matchedUser) {
    if (matchedUser.status === 'approved') {
      playLoginSuccessSound();
      await playGateUnlockAnimation();
      setCurrentUser(matchedUser);
      showToast(`Bem-vindo, ${matchedUser.role ? matchedUser.role + ' ' : ''}${matchedUser.name}!`);
      return;
    } else if (matchedUser.status === 'blocked' || matchedUser.status === 'rejected') {
      playErrorSound();
      showGateError('Acesso suspenso ou recusado pelo Administrador.');
      return;
    } else { // pending
      showGateSuccess(`O seu pedido com o código ${matchedUser.code} aguarda validação pelo Administrador.`);
      startUserWaitingScreen(matchedUser);
      return;
    }
  }

  // 3. Check VIP Invites
  const invites = getInviteCodes();
  const matchedInvite = invites.find(inv => inv.code.toUpperCase() === input.toUpperCase());
  if (matchedInvite) {
    if (matchedInvite.active) {
      const inviteUser = {
        id: 'inv_' + matchedInvite.code,
        name: matchedInvite.label || 'Colega Autorizado',
        role: 'OPC',
        inviteCode: matchedInvite.code
      };
      playLoginSuccessSound();
      await playGateUnlockAnimation();
      setCurrentUser(inviteUser);
      showToast(`Acesso concedido com convite: ${matchedInvite.label}`);
      return;
    } else {
      playErrorSound();
      showGateError('Este código de convite foi revogado.');
      return;
    }
  }

  playErrorSound();
  showGateError('Chave ou código inválido.');
  document.getElementById('unifiedLoginInput').value = '';
}

// 2. Colleague Access Request (Nome, Posto, Unidade, Telemóvel/WhatsApp)
async function handleAccessRequest(e) {
  e.preventDefault();
  hideGateMessages();
  const name = document.getElementById('reqName').value.trim();
  const role = document.getElementById('reqRole').value.trim();
  const unit = document.getElementById('reqUnit').value.trim();
  const phone = document.getElementById('reqPhone').value.trim();

  if (!name || !role || !unit || !phone) {
    showGateError('Preencha todos os campos obrigatórios.');
    return;
  }

  showToast('A enviar pedido em tempo real...');
  await catchUpSyncHistory();
  const users = getUsers();

  const cleanPhone = phone.replace(/\D/g, '');
  const existing = users.find(u => u.phone && u.phone.replace(/\D/g, '') === cleanPhone);

  if (existing) {
    if (existing.status === 'approved') {
      showGateSuccess(`Conta já aprovada! O teu código é: ${existing.code}`);
      document.getElementById('unifiedLoginInput').value = existing.code;
      switchGateView('login');
      return;
    } else if (existing.status === 'blocked') {
      showGateError('O acesso para este número foi bloqueado pelo Administrador.');
      return;
    } else {
      // Existing pending - update info and show waiting
      existing.name = name;
      existing.role = role;
      existing.unit = unit;
      saveUsersLocally(users);
      await broadcastSyncEvent({ type: 'REQUEST_ACCESS', user: existing });
      startUserWaitingScreen(existing);
      return;
    }
  }

  // Generate 4-digit code (1000 - 9999)
  let newCode;
  do {
    newCode = String(Math.floor(1000 + Math.random() * 9000));
  } while (users.some(u => u.code === newCode));

  const newUser = {
    id: 'usr_' + Date.now(),
    name,
    role,
    unit,
    phone,
    code: newCode,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  users.unshift(newUser);
  saveUsersLocally(users);

  // Broadcast instantly to Marco's PC (< 0.3s latency)
  await broadcastSyncEvent({
    type: 'REQUEST_ACCESS',
    user: newUser
  });

  startUserWaitingScreen(newUser);
  playSendSound();
  setTimeout(() => {
    if (!openAdminWhatsapp(newUser)) {
      showToast('Toque em "Notificar Administrador por WhatsApp" para enviar a mensagem.');
    }
  }, 700);
}

// Real-Time Waiting Screen on Colleague's Phone
function startUserWaitingScreen(user) {
  if (!user) return;
  localStorage.setItem('opc_pending_user_id', user.id);

  switchGateView('waiting');

  const badge = document.getElementById('waitingCodeBadge');
  if (badge) badge.textContent = user.code || '----';

  const waLink = document.getElementById('waitingWhatsappLink');
  if (waLink) waLink.href = buildAdminWhatsappLink(user);

  showGateSuccess(`Código gerado: ${user.code}. A aguardar validação em tempo real...`);

  initRealtimeBus();

  if (userApprovalPollInterval) clearInterval(userApprovalPollInterval);
  userApprovalPollInterval = setInterval(catchUpSyncHistory, 5000);
}

const ADMIN_WHATSAPP = '351965668772';

function buildAdminWhatsappLink(user) {
  const msg = encodeURIComponent(
    `Olá Administrador! Submeti o meu pedido de acesso ao Guia Policial (OPC):\n` +
    `👤 Nome: ${user.name}\n` +
    `🎖️ Posto: ${user.role}\n` +
    `🏢 Unidade: ${user.unit || 'OPC'}\n` +
    `📱 Telemóvel: ${user.phone}\n` +
    `🔑 Código Provisório: *${user.code}*\n\n` +
    `Pode validar e aprovar o meu código de acesso no painel?`
  );
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`;
}

// Opens WhatsApp with the message already written to the Administrator.
// (WhatsApp only requires the user to press "Send" - no web page can send it silently.)
function openAdminWhatsapp(user) {
  const url = buildAdminWhatsappLink(user);
  playSendSound();
  const w = window.open(url, '_blank');
  return !!w;
}

function cancelWaitingRequest() {
  if (userApprovalPollInterval) {
    clearInterval(userApprovalPollInterval);
    userApprovalPollInterval = null;
  }
  localStorage.removeItem('opc_pending_user_id');
  switchGateView('login');
  hideGateMessages();
}

// =========================================================================
// 4. PAINEL DE ADMINISTRAÇÃO & REAL-TIME POLLING (MARCO)
// =========================================================================

function startAdminRealTimePolling() {
  initRealtimeBus();
  catchUpSyncHistory();

  if (adminPollInterval) clearInterval(adminPollInterval);
  adminPollInterval = setInterval(catchUpSyncHistory, 12000);
}

async function manualAdminRefresh() {
  showToast('A verificar atualizações em direto...');
  await catchUpSyncHistory();
  renderAdminDashboard();
  updateAdminHeaderBadge();
  showToast('Sincronização concluída!');
}

function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if (!modal) return;
  modal.classList.add('open');

  const topicInput = document.getElementById('adminCloudSyncUrl');
  if (topicInput) {
    topicInput.value = `${NTFY_BASE_URL}/${getSyncTopic()}`;
  }

  catchUpSyncHistory().then(() => renderAdminDashboard());
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.remove('open');
}

function closeAdminOnBackdrop(e) {
  if (e.target.id === 'adminModal') closeAdminModal();
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('adminViewPending').style.display = tab === 'pending' ? 'block' : 'none';
  document.getElementById('adminViewApproved').style.display = tab === 'approved' ? 'block' : 'none';
  document.getElementById('adminViewInvites').style.display = tab === 'invites' ? 'block' : 'none';
  document.getElementById('adminViewSecurity').style.display = tab === 'security' ? 'block' : 'none';

  if (tab === 'pending') document.getElementById('adminTabPending').classList.add('active');
  if (tab === 'approved') document.getElementById('adminTabApproved').classList.add('active');
  if (tab === 'invites') document.getElementById('adminTabInvites').classList.add('active');
  if (tab === 'security') document.getElementById('adminTabSecurity').classList.add('active');

  renderAdminDashboard();
}

function renderAdminDashboard() {
  const users = getUsers();
  const pending = users.filter(u => u.status === 'pending');
  const approved = users.filter(u => u.status === 'approved' || u.status === 'blocked');

  // Badge counters
  const pendCount = document.getElementById('adminPendingCount');
  const appCount = document.getElementById('adminApprovedCount');
  if (pendCount) pendCount.textContent = pending.length;
  if (appCount) appCount.textContent = approved.length;

  // 1. Pending List
  const pendContainer = document.getElementById('adminPendingList');
  if (pendContainer) {
    if (pending.length === 0) {
      pendContainer.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted);">
          Nenhum pedido de acesso pendente no momento.
        </div>
      `;
    } else {
      pendContainer.innerHTML = pending.map(u => `
        <div class="user-card">
          <div class="user-card-header">
            <span class="user-name">${u.name}</span>
            <span class="badge badge-pending">Pendente</span>
          </div>
          <div class="user-meta" style="margin-top: 6px;">
            <span>🎖️ ${u.role}</span>
            <span>🏢 ${u.unit || 'OPC'}</span>
            <span>📱 ${u.phone}</span>
          </div>
          <div style="margin: 8px 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">Código atribuído:</span>
            <span class="code-display-badge">${u.code || '----'}</span>
          </div>
          <div class="user-actions">
            <button class="btn-whatsapp" onclick="adminApproveUser('${u.id}', true)">
              💬 Aprovar e Enviar WhatsApp
            </button>
            <button class="btn-approve" onclick="adminApproveUser('${u.id}', false)">
              ✓ Aprovar Apenas
            </button>
            <button class="btn-reject" onclick="adminRejectUser('${u.id}')">
              ✕ Recusar
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  // 2. Approved / Blocked List
  const appContainer = document.getElementById('adminApprovedList');
  if (appContainer) {
    if (approved.length === 0) {
      appContainer.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted);">
          Nenhum utilizador registado ainda.
        </div>
      `;
    } else {
      appContainer.innerHTML = approved.map(u => `
        <div class="user-card">
          <div class="user-card-header">
            <span class="user-name">${u.name}</span>
            <span class="badge ${u.status === 'blocked' ? 'badge-blocked' : 'badge-approved'}">
              ${u.status === 'blocked' ? 'Bloqueado' : 'Aprovado'}
            </span>
          </div>
          <div class="user-meta" style="margin-top: 6px;">
            <span>🎖️ ${u.role}</span>
            <span>🏢 ${u.unit || 'OPC'}</span>
            <span>📱 ${u.phone}</span>
          </div>
          <div style="margin: 8px 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">Código de Acesso:</span>
            <span class="code-display-badge">${u.code || '----'}</span>
          </div>
          <div class="user-actions">
            <button class="btn-whatsapp" style="padding: 5px 10px; font-size: 0.75rem;" onclick="sendUserCodeViaWhatsApp('${u.id}')">
              💬 Enviar WhatsApp
            </button>
            ${u.status === 'blocked' ? `
              <button class="btn-approve" style="padding: 5px 10px; font-size: 0.75rem;" onclick="adminUnblockUser('${u.id}')">
                🔓 Desbloquear
              </button>
            ` : `
              <button class="btn-reject" style="padding: 5px 10px; font-size: 0.75rem;" onclick="adminRevokeUser('${u.id}')">
                🔒 Bloquear
              </button>
            `}
            <button class="btn-secondary" style="padding: 5px 10px; font-size: 0.75rem;" onclick="adminDeleteUser('${u.id}')">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  // 3. Invites List
  renderAdminInvites();
}

async function adminApproveUser(id, sendWhatsApp = false) {
  const users = getUsers();
  const u = users.find(x => x.id === id);
  if (!u) return;

  u.status = 'approved';
  saveUsersLocally(users);
  renderAdminDashboard();
  updateAdminHeaderBadge();

  // Instant broadcast to colleague's phone via ntfy SSE!
  await broadcastSyncEvent({
    type: 'ACCESS_APPROVED',
    userId: id,
    code: u.code,
    phone: u.phone,
    userName: u.name,
    user: u
  });

  if (sendWhatsApp) {
    sendUserCodeViaWhatsApp(id);
  }

  showToast(`✓ ${u.name} APROVADO! Código: ${u.code}`);
}

function sendUserCodeViaWhatsApp(id) {
  const users = getUsers();
  const u = users.find(x => x.id === id);
  if (!u) return;

  let phoneNum = (u.phone || '').replace(/\D/g, '');
  if (phoneNum.length === 9) phoneNum = '351' + phoneNum;

  const url = window.location.href.split('?')[0].split('#')[0];
  const msg = encodeURIComponent(
    `Olá ${u.name}! O teu acesso ao Guia Policial (OPC) foi aprovado.\n\n` +
    `🔑 O teu Código de Acesso: *${u.code}*\n` +
    `📲 Acede aqui: ${url}\n\n` +
    `Basta colocar este código no ecrã de entrada para acederes diretamente!`
  );

  window.open(`https://wa.me/${phoneNum}?text=${msg}`, '_blank');
}

async function adminRejectUser(id) {
  const users = getUsers();
  const u = users.find(x => x.id === id);
  if (!u) return;

  u.status = 'rejected';
  saveUsersLocally(users);
  renderAdminDashboard();
  updateAdminHeaderBadge();

  await broadcastSyncEvent({
    type: 'ACCESS_REVOKED',
    userId: id,
    code: u.code,
    phone: u.phone
  });

  showToast('Pedido recusado.');
}

async function adminRevokeUser(id) {
  const users = getUsers();
  const u = users.find(x => x.id === id);
  if (!u) return;

  u.status = 'blocked';
  saveUsersLocally(users);
  renderAdminDashboard();
  updateAdminHeaderBadge();

  await broadcastSyncEvent({
    type: 'ACCESS_REVOKED',
    userId: id,
    code: u.code,
    phone: u.phone
  });

  showToast(`Acesso de ${u.name} BLOQUEADO! Sessão terminada imediatamente.`);
}

async function adminUnblockUser(id) {
  const users = getUsers();
  const u = users.find(x => x.id === id);
  if (!u) return;

  u.status = 'approved';
  saveUsersLocally(users);
  renderAdminDashboard();
  updateAdminHeaderBadge();

  await broadcastSyncEvent({
    type: 'ACCESS_APPROVED',
    userId: id,
    code: u.code,
    phone: u.phone,
    user: u
  });

  showToast(`Acesso de ${u.name} REATIVADO.`);
}

async function adminDeleteUser(id) {
  const users = getUsers();
  const u = users.find(x => x.id === id);
  const name = u ? u.name : 'utilizador';

  if (confirm(`Eliminar permanentemente ${name}?`)) {
    const updatedUsers = users.filter(x => x.id !== id);
    saveUsersLocally(updatedUsers);
    renderAdminDashboard();
    updateAdminHeaderBadge();

    await broadcastSyncEvent({
      type: 'ACCESS_REVOKED',
      userId: id,
      code: u?.code,
      phone: u?.phone
    });

    showToast('Utilizador eliminado.');
  }
}

async function adminWipeAllDatabases() {
  if (!confirm('ATENÇÃO: Tem a certeza que deseja LIMPAR TODAS AS BASES DE DADOS?\n\nTodos os utilizadores, pedidos pendentes e convites serão eliminados.')) {
    return;
  }

  localStorage.removeItem('opc_users_db');
  localStorage.removeItem('opc_invites_db');
  localStorage.removeItem('opc_pending_user_id');

  await broadcastSyncEvent({
    type: 'WIPE_ALL_DATA'
  });

  renderAdminDashboard();
  updateAdminHeaderBadge();
  showToast('Base de dados completamente limpa!');
}

// ---------------------------------------------------------------------
// Invite Code Generator (VIP Access)
// ---------------------------------------------------------------------

function renderAdminInvites() {
  const container = document.getElementById('adminInvitesList');
  if (!container) return;

  const invites = getInviteCodes();
  if (invites.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-muted);">
        Nenhum código de convite ativo. Crie um acima para partilhar.
      </div>
    `;
    return;
  }

  container.innerHTML = invites.map(inv => `
    <div class="user-card">
      <div class="user-card-header">
        <span class="code-display-badge">
          ${inv.code}
        </span>
        <span class="badge ${inv.active ? 'badge-approved' : 'badge-rejected'}">
          ${inv.active ? 'Ativo' : 'Revogado'}
        </span>
      </div>
      <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 6px;">
        Para: <strong>${inv.label}</strong> • Criado em: ${new Date(inv.createdAt).toLocaleDateString('pt-PT')}
      </div>
      <div class="user-actions">
        <button class="btn-whatsapp" onclick="copyInviteToWhatsapp('${inv.code}', '${inv.label}')">
          💬 Partilhar no WhatsApp
        </button>
        <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.78rem;" onclick="toggleInviteActive('${inv.code}')">
          ${inv.active ? 'Desativar' : 'Reativar'}
        </button>
      </div>
    </div>
  `).join('');
}

async function createInviteCode() {
  const labelInput = document.getElementById('newInviteLabel');
  const label = labelInput.value.trim() || 'Colega';

  const randomStr = Math.floor(1000 + Math.random() * 9000);
  const code = `OPC-${randomStr}`;

  const invites = getInviteCodes();
  const newInvite = {
    code,
    label,
    active: true,
    createdAt: new Date().toISOString()
  };
  invites.unshift(newInvite);
  saveInvitesLocally(invites);

  await broadcastSyncEvent({
    type: 'INVITE_CREATED',
    invite: newInvite
  });

  labelInput.value = '';
  renderAdminInvites();
  showToast(`Código ${code} gerado com sucesso!`);
}

async function toggleInviteActive(code) {
  const invites = getInviteCodes();
  const inv = invites.find(i => i.code === code);
  if (inv) {
    inv.active = !inv.active;
    saveInvitesLocally(invites);
    await broadcastSyncEvent({
      type: 'INVITE_TOGGLED',
      code: inv.code,
      active: inv.active
    });
    renderAdminInvites();
    showToast(`Código ${code} atualizado.`);
  }
}

function copyInviteToWhatsapp(code, label) {
  const url = window.location.href.split('?')[0].split('#')[0];
  const msg = `Olá ${label}! Segue o teu código de acesso exclusivo ao Guia Policial (OPC):\n\n🔑 Código: *${code}*\n📲 Acede aqui: ${url}\n\nAo abrir o link, basta colocar o código no campo de entrada para aceder diretamente!`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(msg).then(() => {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  }
}

// ---------------------------------------------------------------------
// Admin Security Settings
// ---------------------------------------------------------------------

function saveCloudSyncUrl() {
  showToast('Canal em tempo real ativo: ' + getSyncTopic());
  catchUpSyncHistory().then(() => renderAdminDashboard());
}

// =========================================================================
// 5. MAIN NAVIGATION TABS (EXPEDIENTES | ARTIGOS | PRAZOS)
// =========================================================================

function switchMainTab(tabName) {
  if (tabName !== activeMainTab) playTabSound();
  activeMainTab = tabName;

  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tabExpedientes').classList.toggle('active', tabName === 'expedientes');
  document.getElementById('tabArtigos').classList.toggle('active', tabName === 'artigos');
  document.getElementById('tabPrazos').classList.toggle('active', tabName === 'prazos');

  document.getElementById('viewExpedientes').style.display = tabName === 'expedientes' ? 'block' : 'none';
  document.getElementById('viewArtigos').style.display = tabName === 'artigos' ? 'block' : 'none';
  document.getElementById('viewPrazos').style.display = tabName === 'prazos' ? 'block' : 'none';

  const shown = document.getElementById(tabName === 'artigos' ? 'viewArtigos' : tabName === 'prazos' ? 'viewPrazos' : 'viewExpedientes');
  if (shown) {
    shown.classList.remove('view-enter');
    void shown.offsetWidth;
    shown.classList.add('view-enter');
  }

  if (tabName === 'artigos') {
    renderArtigosUI();
  } else if (tabName === 'expedientes') {
    renderUI();
  }
}

// =========================================================================
// 6. DATA LOADING & DATABASES
// =========================================================================

async function loadAllData() {
  const cachedExp = localStorage.getItem('opc_expedientes_data');
  const cachedArt = localStorage.getItem('opc_artigos_data');

  if (cachedExp) {
    try { allExpedientes = JSON.parse(cachedExp); } catch (e) {}
  }
  if (cachedArt) {
    try { allArtigos = JSON.parse(cachedArt); } catch (e) {}
  }

  renderUI();
  renderArtigosUI();

  // Load and sync
  await syncData(false);
  await catchUpSyncHistory();
}

async function syncData(manual = false) {
  const syncBtn = document.getElementById('syncBtn');
  if (syncBtn) syncBtn.classList.add('loading');

  try {
    const resExp = await fetch('expedientes.json?t=' + Date.now());
    if (resExp.ok) {
      const dataExp = await resExp.json();
      if (Array.isArray(dataExp) && dataExp.length > 0) {
        allExpedientes = dataExp;
        localStorage.setItem('opc_expedientes_data', JSON.stringify(dataExp));
      }
    }

    const resArt = await fetch('artigos_opc.json?t=' + Date.now());
    if (resArt.ok) {
      const dataArt = await resArt.json();
      if (Array.isArray(dataArt) && dataArt.length > 0) {
        allArtigos = dataArt;
        localStorage.setItem('opc_artigos_data', JSON.stringify(dataArt));
      }
    }

    updateStatusDisplay();
    renderUI();
    renderArtigosUI();

    if (manual) {
      showToast(`Sincronizado! ${allExpedientes.length} crimes e ${allArtigos.length} artigos.`);
    }
  } catch (err) {
    console.log('Modo offline ativo:', err);
  } finally {
    if (syncBtn) syncBtn.classList.remove('loading');
    updateOnlineStatus();
  }
}

function updateStatusDisplay() {
  const versionText = document.getElementById('dataVersionText');
  if (versionText) {
    versionText.textContent = `${allExpedientes.length} Crimes + ${allArtigos.length} Artigos OPC`;
  }
}

function updateOnlineStatus() {
  const dot = document.getElementById('networkDot');
  const text = document.getElementById('networkStatusText');
  if (!dot || !text) return;

  if (navigator.onLine) {
    dot.className = 'dot';
    text.textContent = 'Online';
  } else {
    dot.className = 'dot offline';
    text.textContent = 'Offline (Local)';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// =========================================================================
// 7. FAVORITES & CHECKLIST STATE
// =========================================================================

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('opc_favorites') || '[]');
  } catch {
    return [];
  }
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id, e) {
  playToggleSound();
  if (e) e.stopPropagation();
  let favs = getFavorites();
  if (favs.includes(id)) {
    favs = favs.filter(favId => favId !== id);
    showToast('Removido dos favoritos.');
  } else {
    favs.push(id);
    showToast('Adicionado aos favoritos!');
  }
  localStorage.setItem('opc_favorites', JSON.stringify(favs));
  renderUI();
  updateDetailStar();
}

function toggleFavoritesFilter() {
  onlyFavorites = !onlyFavorites;
  const btn = document.getElementById('favFilterBtn');
  if (btn) btn.classList.toggle('active', onlyFavorites);
  renderCrimeList();
}

function getChecklistState(itemId) {
  try {
    return JSON.parse(localStorage.getItem(`opc_check_${itemId}`) || '{}');
  } catch {
    return {};
  }
}

function toggleChecklistItem(itemId, idx, checked) {
  playToggleSound();
  const state = getChecklistState(itemId);
  state[idx] = checked;
  localStorage.setItem(`opc_check_${itemId}`, JSON.stringify(state));
  
  const el = document.getElementById(`checkItem-${idx}`);
  if (el) el.classList.toggle('done', checked);
}

function normalizeText(str) {
  if (!str) return '';
  return str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// =========================================================================
// 8. EXPEDIENTES RENDERING
// =========================================================================

function handleSearch(val) {
  currentSearch = val;
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
  renderCrimeList();
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  if (input) {
    input.value = '';
    currentSearch = '';
    document.getElementById('clearSearchBtn').style.display = 'none';
    renderCrimeList();
  }
}

function selectCategory(catId, btn) {
  currentCategory = catId;
  document.querySelectorAll('#categoriesBar .pill-btn').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCrimeList();
}

function setNatureFilter(nature, btn) {
  currentNature = nature;
  document.querySelectorAll('.sub-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCrimeList();
}

function renderCategories() {
  const categoriesBar = document.getElementById('categoriesBar');
  if (!categoriesBar) return;

  const categories = [
    { id: 'all', name: 'Todas as Categorias', icon: '📂' },
    { id: 'patrimonio', name: 'Património', icon: '🛡️' },
    { id: 'pessoas', name: 'Pessoas', icon: '👤' },
    { id: 'sexuais', name: 'Crimes Sexuais', icon: '⚠️' },
    { id: 'autoridade', name: 'Autoridade Pública', icon: '⚖️' },
    { id: 'rodoviarios', name: 'Rodoviários', icon: '🚗' },
    { id: 'drogas', name: 'Drogas', icon: '💊' },
    { id: 'armas', name: 'Armas', icon: '🔫' },
    { id: 'informaticos', name: 'Informáticos', icon: '💻' }
  ];

  categoriesBar.innerHTML = categories.map(cat => {
    const count = cat.id === 'all' 
      ? allExpedientes.length 
      : allExpedientes.filter(x => x.category_id === cat.id).length;

    const isActive = currentCategory === cat.id ? 'active' : '';
    return `
      <button class="pill-btn ${isActive}" onclick="selectCategory('${cat.id}', this)">
        <span>${cat.icon}</span>
        <span>${cat.name}</span>
        <span class="pill-count">${count}</span>
      </button>
    `;
  }).join('');
}

function renderCrimeList() {
  const container = document.getElementById('crimeList');
  const countLabel = document.getElementById('resultsCount');
  if (!container) return;

  const searchNorm = normalizeText(currentSearch);
  const favs = getFavorites();

  const filtered = allExpedientes.filter(item => {
    if (currentCategory !== 'all' && item.category_id !== currentCategory) return false;
    if (currentNature !== 'all' && !item.nature.includes(currentNature)) return false;
    if (onlyFavorites && !favs.includes(item.id)) return false;

    if (searchNorm) {
      const matchName = normalizeText(item.name).includes(searchNorm);
      const matchArt = normalizeText(item.article).includes(searchNorm);
      const matchCat = normalizeText(item.category).includes(searchNorm);
      const matchSteps = item.steps && item.steps.some(s => normalizeText(s).includes(searchNorm));
      const matchDocs = item.expediente_docs && item.expediente_docs.some(d => normalizeText(d).includes(searchNorm));
      const matchNotes = item.critical_notes && item.critical_notes.some(n => normalizeText(n).includes(searchNorm));
      
      if (!matchName && !matchArt && !matchCat && !matchSteps && !matchDocs && !matchNotes) {
        return false;
      }
    }
    return true;
  });

  if (countLabel) {
    countLabel.textContent = `${filtered.length} procedimento${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
        <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
        <div style="font-weight: 600; color: #fff;">Nenhum procedimento encontrado</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const isFav = favs.includes(item.id);
    const natureClass = item.nature.includes('Público') && !item.nature.includes('Semipúblico') 
      ? 'badge-public' 
      : 'badge-semi';

    return `
      <div class="crime-card" onclick="openDetail('${item.id}')">
        <div class="crime-header">
          <div class="crime-title">${item.name}</div>
          <button class="star-card-btn ${isFav ? 'favorited' : ''}" onclick="toggleFavorite('${item.id}', event)" title="Favorito">
            ★
          </button>
        </div>

        <div class="crime-meta">
          <span class="badge badge-article">${item.article}</span>
          <span class="badge badge-category">${item.category}</span>
          <span class="badge ${natureClass}">${item.nature}</span>
        </div>

        <div class="crime-preview">
          ${item.steps && item.steps.length > 0 ? '1. ' + item.steps[0] : ''}
        </div>

        <div class="card-footer">
          <span>Ver checklist e expediente completo</span>
          <span>&rarr;</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderUI() {
  renderCategories();
  renderCrimeList();
  updateStatusDisplay();
}

// =========================================================================
// 9. PRONTUÁRIO & ARTIGOS RENDERING
// =========================================================================

function handleArtigosSearch(val) {
  currentArtigoSearch = val;
  const clearBtn = document.getElementById('clearArtigosSearchBtn');
  if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
  renderArtigosList();
}

function clearArtigosSearch() {
  const input = document.getElementById('searchArtigosInput');
  if (input) {
    input.value = '';
    currentArtigoSearch = '';
    document.getElementById('clearArtigosSearchBtn').style.display = 'none';
    renderArtigosList();
  }
}

function selectArtigoTheme(themeId, btn) {
  currentArtigoTheme = themeId;
  document.querySelectorAll('#artigosThemesBar .pill-btn').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderArtigosList();
}

function toggleArticleExpand(id) {
  if (expandedArticles.has(id)) {
    expandedArticles.delete(id);
  } else {
    expandedArticles.add(id);
  }
  const el = document.getElementById(`artBody-${id}`);
  const btn = document.getElementById(`artBtn-${id}`);
  if (el) el.classList.toggle('open', expandedArticles.has(id));
  if (btn) btn.textContent = expandedArticles.has(id) ? 'Recolher Detalhes ▲' : 'Ver Regras & Detalhes ▼';
}

function renderArtigosThemes() {
  const bar = document.getElementById('artigosThemesBar');
  if (!bar) return;

  const themes = [
    { id: 'all', name: 'Todos os Artigos', icon: '📚' },
    { id: 'competencias', name: 'Poderes & Competências', icon: '👮' },
    { id: 'detencao', name: 'Detenção & Flagrante', icon: '🚨' },
    { id: 'arguido', name: 'Arguido & TIR', icon: '⚖️' },
    { id: 'revistas', name: 'Revistas & Buscas', icon: '🔍' },
    { id: 'vitima', name: 'Estatuto da Vítima', icon: '👥' },
    { id: 'legitima_defesa', name: 'Legítima Defesa', icon: '🛡️' },
    { id: 'queixa', name: 'Queixa & Prazos', icon: '⏳' },
    { id: 'autoridade', name: 'Crimes Contra Autoridade', icon: '🏛️' }
  ];

  bar.innerHTML = themes.map(th => {
    const count = th.id === 'all'
      ? allArtigos.length
      : allArtigos.filter(x => x.theme === th.id).length;

    const isActive = currentArtigoTheme === th.id ? 'active' : '';
    return `
      <button class="pill-btn ${isActive}" onclick="selectArtigoTheme('${th.id}', this)">
        <span>${th.icon}</span>
        <span>${th.name}</span>
        <span class="pill-count">${count}</span>
      </button>
    `;
  }).join('');
}

function renderArtigosList() {
  const container = document.getElementById('artigosList');
  const countLabel = document.getElementById('artigosResultsCount');
  if (!container) return;

  const searchNorm = normalizeText(currentArtigoSearch);

  const filtered = allArtigos.filter(art => {
    if (currentArtigoTheme !== 'all' && art.theme !== currentArtigoTheme) return false;

    if (searchNorm) {
      const matchArt = normalizeText(art.article).includes(searchNorm);
      const matchTitle = normalizeText(art.title).includes(searchNorm);
      const matchSummary = normalizeText(art.summary).includes(searchNorm);
      const matchRules = art.key_rules && art.key_rules.some(r => normalizeText(r).includes(searchNorm));
      const matchAtt = normalizeText(art.attention_opc).includes(searchNorm);

      if (!matchArt && !matchTitle && !matchSummary && !matchRules && !matchAtt) {
        return false;
      }
    }
    return true;
  });

  if (countLabel) {
    countLabel.textContent = `${filtered.length} artigo${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
        <div style="font-size: 2rem; margin-bottom: 8px;">📖</div>
        <div style="font-weight: 600; color: #fff;">Nenhum artigo encontrado</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(art => {
    const isExpanded = expandedArticles.has(art.id);
    const codeBadgeClass = art.code === 'CPP' ? 'badge-cpp' : 'badge-cp';
    const rulesHtml = (art.key_rules || []).map(r => `<li>${r}</li>`).join('');

    return `
      <div class="article-card">
        <div class="article-header">
          <div>
            <span class="badge ${codeBadgeClass}" style="margin-bottom: 4px;">${art.article}</span>
            <div class="article-title">${art.title}</div>
          </div>
        </div>

        <div class="article-summary-box">
          ${art.summary}
        </div>

        <div class="article-collapsible ${isExpanded ? 'open' : ''}" id="artBody-${art.id}">
          <div class="article-section-title">📌 Regras Práticas de Atuação (OPC)</div>
          <ul class="article-rules-list">
            ${rulesHtml}
          </ul>

          ${art.attention_opc ? `
            <div class="article-attention-box">
              <strong>⚠️ ATENÇÃO OPC (PARA NÃO ERRAR):</strong><br>
              ${art.attention_opc}
            </div>
          ` : ''}
        </div>

        <div class="article-btn-row">
          <button class="btn-toggle-art" id="artBtn-${art.id}" onclick="toggleArticleExpand('${art.id}')">
            ${isExpanded ? 'Recolher Detalhes ▲' : 'Ver Regras & Detalhes ▼'}
          </button>
          <button class="btn-copy-art" onclick="copyArticleSummary('${art.id}')" title="Copiar resumo">
            📋 Copiar
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderArtigosUI() {
  renderArtigosThemes();
  renderArtigosList();
}

function copyArticleSummary(id) {
  const art = allArtigos.find(x => x.id === id);
  if (!art) return;

  let txt = `📖 *${art.article.toUpperCase()} - ${art.title.toUpperCase()}*\n`;
  txt += `\n*Resumo Prático OPC:*\n${art.summary}\n`;
  
  if (art.key_rules && art.key_rules.length > 0) {
    txt += `\n*Regras Essenciais:*\n`;
    art.key_rules.forEach(r => { txt += `• ${r}\n`; });
  }

  if (art.attention_opc) {
    txt += `\n⚠️ *Atenção OPC:* ${art.attention_opc}\n`;
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(() => {
      showToast('Artigo copiado para a área de transferência!');
    }).catch(() => showToast('Erro ao copiar texto.'));
  }
}

// =========================================================================
// 10. EXPEDIENTE DETAIL MODAL & CHECKLIST
// =========================================================================

function openDetail(id) {
  const item = allExpedientes.find(x => x.id === id);
  if (!item) return;
  if (!currentDetailItem) playOpenSound();

  currentDetailItem = item;
  updateDetailStar();

  const body = document.getElementById('detailBody');
  const checkState = getChecklistState(item.id);

  const stepsHtml = (item.steps || []).map((step, idx) => `
    <div class="step-item">
      <div class="step-num">${idx + 1}</div>
      <div class="step-text">${step}</div>
    </div>
  `).join('');

  const docsHtml = (item.expediente_docs || []).map((doc, idx) => {
    const isChecked = !!checkState[idx];
    return `
      <label class="check-item ${isChecked ? 'done' : ''}" id="checkItem-${idx}">
        <input 
          type="checkbox" 
          ${isChecked ? 'checked' : ''} 
          onchange="toggleChecklistItem('${item.id}', ${idx}, this.checked)"
        >
        <span class="check-label">${doc}</span>
      </label>
    `;
  }).join('');

  const notesHtml = (item.critical_notes || []).map(note => `
    <li style="margin-bottom: 6px;">${note}</li>
  `).join('');

  body.innerHTML = `
    <div class="detail-title">${item.name}</div>
    <div class="detail-article">${item.article} — ${item.category}</div>

    <div class="info-box police-box">
      <div class="info-header">
        <span>⚖️ Natureza Jurídica: <strong>${item.nature}</strong></span>
      </div>
      <div class="info-body">
        ${item.nature_desc || 'Atuação conforme as regras gerais do CPP.'}
      </div>
    </div>

    <div class="info-box danger-box">
      <div class="info-header">
        <span>🚨 Detenção em Flagrante Delito</span>
      </div>
      <div class="info-body">
        ${item.detention || 'Avaliar os requisitos gerais dos artigos 255.º e 256.º do CPP.'}
      </div>
    </div>

    <div class="info-box">
      <div class="info-header">
        <span>📋 Atuação no Terreno (Passo a Passo)</span>
      </div>
      <div class="steps-list">
        ${stepsHtml}
      </div>
    </div>

    <div class="info-box">
      <div class="info-header">
        <span>📑 Peças de Expediente a Elaborar (Checklist)</span>
      </div>
      <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px;">
        Toque para assinalar os documentos à medida que os elabora:
      </div>
      <div class="checklist-container">
        ${docsHtml}
      </div>
    </div>

    ${item.critical_notes && item.critical_notes.length > 0 ? `
      <div class="info-box alert-box">
        <div class="info-header">
          <span>⚠️ Atenção OPC (Para Não Errar)</span>
        </div>
        <div class="info-body">
          <ul style="padding-left: 18px; margin: 0;">
            ${notesHtml}
          </ul>
        </div>
      </div>
    ` : ''}

    <div class="detail-actions-bar">
      <button class="btn-primary" onclick="copyExpedienteSummary('${item.id}')">
        <span>📋 Copiar Resumo / Enviar</span>
      </button>
      <button class="btn-secondary" onclick="resetChecklist('${item.id}')">
        Desmarcar Checklist
      </button>
    </div>
  `;

  document.getElementById('detailModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateDetailStar() {
  const btn = document.getElementById('detailStarBtn');
  if (!btn || !currentDetailItem) return;

  const isFav = isFavorite(currentDetailItem.id);
  btn.classList.toggle('active', isFav);
  btn.style.color = isFav ? 'var(--accent-amber)' : 'var(--text-secondary)';
}

function toggleCurrentFavorite() {
  if (currentDetailItem) toggleFavorite(currentDetailItem.id);
}

function closeDetail() {
  const modal = document.getElementById('detailModal');
  if (modal && modal.classList.contains('open')) playCloseSound();
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = 'auto';
  }
  currentDetailItem = null;
}

function resetChecklist(itemId) {
  localStorage.removeItem(`opc_check_${itemId}`);
  openDetail(itemId);
  showToast('Checklist reiniciada.');
}

function copyExpedienteSummary(itemId) {
  const item = allExpedientes.find(x => x.id === itemId);
  if (!item) return;

  let text = `🚨 *GUIA POLICIAL - ${item.name.toUpperCase()}*\n`;
  text += `📖 ${item.article} (${item.nature})\n\n`;
  text += `🚨 *FLAGRANTE DELITO:*\n${item.detention}\n\n`;
  text += `📋 *PASSOS NO TERRENO:*\n`;
  (item.steps || []).forEach((s, i) => { text += `${i + 1}. ${s}\n`; });
  text += `\n📑 *PEÇAS DE EXPEDIENTE:*\n`;
  (item.expediente_docs || []).forEach(d => { text += `▫️ ${d}\n`; });

  if (item.critical_notes && item.critical_notes.length > 0) {
    text += `\n⚠️ *ATENÇÃO OPC:*\n`;
    item.critical_notes.forEach(n => { text += `• ${n}\n`; });
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Resumo copiado para a área de transferência!');
    }).catch(() => showToast('Erro ao copiar texto.'));
  }
}

// =========================================================================
// 11. SETTINGS MODAL & RESET
// =========================================================================

function toggleSound() {
  const nowOff = isSoundOn();
  try { localStorage.setItem('opc_sound_off', nowOff ? '1' : '0'); } catch (e) {}
  updateSoundButton();
  if (!nowOff) playToggleSound();
}

function updateSoundButton() {
  const b = document.getElementById('soundToggleBtn');
  if (b) b.textContent = isSoundOn() ? '🔊 Sons: Ligados' : '🔇 Sons: Desligados';
}

function openSettings() {
  updateSoundButton();
  const modal = document.getElementById('settingsModal');
  const sessInfo = document.getElementById('settingsSessionInfo');
  const user = getCurrentUser();

  if (sessInfo) {
    sessInfo.textContent = user 
      ? `Autenticado como: ${user.name} (${user.role.toUpperCase()})` 
      : 'Sessão com código direto ativo';
  }

  if (modal) modal.classList.add('open');
}

function closeSettings() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.classList.remove('open');
}

function closeSettingsOnBackdrop(e) {
  if (e.target.id === 'settingsModal') closeSettings();
}

function resetAppData() {
  if (confirm('Deseja limpar os dados em cache e recarregar a versão mais recente?')) {
    localStorage.removeItem('opc_expedientes_data');
    localStorage.removeItem('opc_artigos_data');
    localStorage.removeItem('opc_favorites');
    if ('caches' in window) {
      caches.keys().then((keys) => {
        return Promise.all(keys.map(k => caches.delete(k)));
      }).then(() => {
        location.reload();
      });
    } else {
      location.reload();
    }
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// =========================================================================
// 12. PWA SERVICE WORKER AUTO-UPDATE (v7.0)
// =========================================================================

if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('Nova versão ativada! A recarregar...');
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js?v=7.0')
      .then(reg => {
        reg.update();
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ action: 'skipWaiting' });
              }
            });
          }
        });
      })
      .catch(err => console.log('Falha ao registar ServiceWorker:', err));
  });
}

// =========================================================================
// 13. APP INITIALIZATION & RECOVERY
// =========================================================================

async function checkPendingApprovalOnLoad(pendingId) {
  switchGateView('waiting');
  showGateSuccess('A verificar aprovação com o Administrador...');

  initRealtimeBus();
  await catchUpSyncHistory();

  const users = getUsers();
  const liveUser = users.find(u => u.id === pendingId);

  if (liveUser) {
    if (liveUser.status === 'approved') {
      localStorage.removeItem('opc_pending_user_id');
      showGateSuccess('✓ Acesso aprovado pelo Administrador! A entrar...');
      showToast('🎉 Bem-vindo, ' + liveUser.name + '!');
      setTimeout(() => {
        setCurrentUser(liveUser);
      }, 500);
      return;
    } else if (liveUser.status === 'rejected' || liveUser.status === 'blocked') {
      localStorage.removeItem('opc_pending_user_id');
      cancelWaitingRequest();
      showGateError('O seu pedido de acesso foi recusado ou bloqueado pelo Administrador.');
      return;
    } else {
      // Still pending
      startUserWaitingScreen(liveUser);
      return;
    }
  }

  startUserWaitingScreen({ id: pendingId, name: 'Colega', role: 'OPC' });
}

function startSessionGuard(user) {
  if (sessionGuardInterval) clearInterval(sessionGuardInterval);
  // Fast periodic check every 3.5 seconds to guarantee instant lock if revoked
  sessionGuardInterval = setInterval(async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role === 'admin') return;

    const users = getUsers();
    const invites = getInviteCodes();

    if (currentUser.inviteCode) {
      const inv = invites.find(i => i.code === currentUser.inviteCode);
      if (inv && !inv.active) {
        logoutApp('O seu código de convite foi revogado.');
        showGateError('O seu código de convite foi revogado.');
      }
    } else {
      const liveUser = users.find(u => 
        (currentUser.id && u.id === currentUser.id) || 
        (currentUser.code && u.code === currentUser.code)
      );
      if (liveUser && (liveUser.status === 'blocked' || liveUser.status === 'rejected')) {
        logoutApp('A sua conta foi bloqueada pelo Administrador.');
        showGateError('A sua conta foi bloqueada pelo Administrador.');
      }
    }
  }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Connect real-time event stream immediately
  initRealtimeBus();

  // 2. Check session or pending request
  const user = getCurrentUser();

  if (isAppUnlocked() && user) {
    applyUserSession(user);
    if (user.role !== 'admin') {
      startSessionGuard(user);
    }
  } else {
    const pendingId = localStorage.getItem('opc_pending_user_id');
    if (pendingId) {
      checkPendingApprovalOnLoad(pendingId);
    } else {
      const gate = document.getElementById('securityGate');
      if (gate) gate.style.display = 'flex';
      switchGateView('login');
      catchUpSyncHistory();
    }
  }

  loadAllData();
});
