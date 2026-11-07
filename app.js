// Guia de Expediente Policial - Core Logic & Real-Time Cloud Engine

// =========================================================================
// 1. AUTO-UPDATE & ANTI-CACHE ENGINE (v6.0.0)
// =========================================================================
const CURRENT_APP_VERSION = 'v6.0.0';
(function autoUpdateCheck() {
  try {
    const storedVersion = localStorage.getItem('opc_app_version');
    if (storedVersion && storedVersion !== CURRENT_APP_VERSION) {
      console.log('Nova versão detetada! A atualizar cache automaticamente...');
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
    localStorage.setItem('opc_app_version', CURRENT_APP_VERSION);
  } catch (err) {
    console.warn('Erro na verificação de versão:', err);
  }
})();

// Audio Chime for Admin Alert (Web Audio API)
function playAlertChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Restricted by browser autoplay policy until first click
  }
}

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

// =========================================================================
// 2. REAL-TIME CLOUD DATABASE (TELEFONE ↔ PC)
// =========================================================================
const DEFAULT_CLOUD_DB_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1b3a44d815846';

function getCloudDbUrl() {
  return localStorage.getItem('opc_cloud_sync_url') || DEFAULT_CLOUD_DB_URL;
}

let cloudFetchPromise = null;
let adminPollInterval = null;
let userApprovalPollInterval = null;
let lastKnownPendingCount = 0;

async function fetchFromCloudDB() {
  if (cloudFetchPromise) return cloudFetchPromise;

  cloudFetchPromise = (async () => {
    const url = getCloudDbUrl();
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const doc = await res.json();
      if (doc && doc.data) {
        if (Array.isArray(doc.data.users)) {
          localStorage.setItem('opc_users_db', JSON.stringify(doc.data.users));
        }
        if (Array.isArray(doc.data.invites)) {
          localStorage.setItem('opc_invites_db', JSON.stringify(doc.data.invites));
        }
        return doc.data;
      }
    } catch (err) {
      console.warn('Sync cloud offline ou indisponível:', err);
    } finally {
      cloudFetchPromise = null;
    }
    return null;
  })();

  return cloudFetchPromise;
}

async function pushToCloudDB(updateFn) {
  const url = getCloudDbUrl();
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Falha ao obter estado cloud: ' + res.status);
    const doc = await res.json();
    if (!doc.data) doc.data = { users: [], invites: [] };

    // Apply updates via callback
    doc.data = updateFn(doc.data);
    doc.data.lastUpdated = new Date().toISOString();

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: doc.name || 'guia_policial_cloud_db', data: doc.data })
    });

    if (putRes.ok) {
      if (Array.isArray(doc.data.users)) localStorage.setItem('opc_users_db', JSON.stringify(doc.data.users));
      if (Array.isArray(doc.data.invites)) localStorage.setItem('opc_invites_db', JSON.stringify(doc.data.invites));
      return true;
    }
  } catch (err) {
    console.warn('Erro ao enviar para a nuvem:', err);
  }
  return false;
}

// =========================================================================
// 3. AUTHENTICATION & USER MANAGEMENT STATE
// =========================================================================
const DEFAULT_ADMIN_PASS = 'pinhalnovo';

function getAdminPassword() {
  return localStorage.getItem('opc_admin_password') || DEFAULT_ADMIN_PASS;
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

function unlockApp() {
  document.getElementById('securityGate').style.display = 'none';
}

function logoutApp() {
  if (adminPollInterval) clearInterval(adminPollInterval);
  if (userApprovalPollInterval) clearInterval(userApprovalPollInterval);

  localStorage.removeItem('opc_unlocked');
  localStorage.removeItem('opc_current_user');
  document.getElementById('securityGate').style.display = 'flex';
  document.getElementById('adminPanelBtn').style.display = 'none';
  closeAdminModal();
  closeDetail();
  closeSettings();
  showToast('Sessão terminada.');
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
    if (adminPollInterval) clearInterval(adminPollInterval);
  }
}

// ---------------------------------------------------------------------
// Auth Portal Tabs & Submissions
// ---------------------------------------------------------------------

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.auth-form-panel').forEach(p => p.classList.remove('active'));

  hideGateMessages();

  if (tab === 'direct') {
    document.getElementById('authTabDirect').classList.add('active');
    document.getElementById('panelDirect').classList.add('active');
  } else if (tab === 'login') {
    document.getElementById('authTabLogin').classList.add('active');
    document.getElementById('panelLogin').classList.add('active');
  } else if (tab === 'register') {
    document.getElementById('authTabRegister').classList.add('active');
    document.getElementById('panelRegister').classList.add('active');
  }
}

function showGateError(msg) {
  const el = document.getElementById('gateError');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('gateSuccess').style.display = 'none';
}

function showGateSuccess(msg) {
  const el = document.getElementById('gateSuccess');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('gateError').style.display = 'none';
}

function hideGateMessages() {
  document.getElementById('gateError').style.display = 'none';
  document.getElementById('gateSuccess').style.display = 'none';
}

// 1. Direct Submit: Admin Password or Invite Code
async function handleDirectSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('directPinInput').value.trim();
  if (!input) return;

  const adminPass = getAdminPassword();

  // Check Admin Master Passwords (Marco)
  if (input.toLowerCase() === adminPass.toLowerCase() || input.toLowerCase() === 'admin.pinhalnovo' || input.toLowerCase() === 'pinhalnovo') {
    const adminUser = {
      id: 'admin_root',
      name: 'Administrador Marco',
      role: 'admin',
      email: 'admin@local'
    };
    setCurrentUser(adminUser);
    showToast('Bem-vindo, Administrador Marco!');
    return;
  }

  // Check Cloud Invites
  await fetchFromCloudDB();
  const invites = getInviteCodes();
  const matchedInvite = invites.find(inv => inv.code.toUpperCase() === input.toUpperCase() && inv.active);

  if (matchedInvite) {
    const inviteUser = {
      id: 'inv_' + matchedInvite.code,
      name: matchedInvite.label || 'Colega Autorizado',
      role: 'OPC',
      inviteCode: matchedInvite.code
    };
    setCurrentUser(inviteUser);
    showToast(`Acesso concedido com convite: ${matchedInvite.label}`);
    return;
  }

  showGateError('Código ou senha incorreta!');
  document.getElementById('directPinInput').value = '';
}

// 2. User Account Login
async function handleAccountLogin(e) {
  e.preventDefault();
  const contact = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass = document.getElementById('loginPassword').value;

  if (!contact || !pass) {
    showGateError('Por favor preencha todos os campos.');
    return;
  }

  showToast('A verificar credenciais...');
  await fetchFromCloudDB();
  const users = getUsers();
  const user = users.find(u => (u.contact && u.contact.toLowerCase() === contact) || (u.email && u.email.toLowerCase() === contact));

  if (!user) {
    showGateError('Conta não encontrada! Se ainda não se registou, vá à aba "Pedir Acesso".');
    return;
  }

  if (user.password !== pass) {
    showGateError('Palavra-passe incorreta!');
    return;
  }

  if (user.status === 'pending') {
    showGateError('A sua conta aguarda aprovação pelo Administrador Marco. Foi colocada na lista de espera.');
    // Start active waiting screen
    startUserWaitingScreen(user);
    return;
  }

  if (user.status === 'rejected') {
    showGateError('Acesso recusado pelo Administrador.');
    return;
  }

  if (user.status === 'approved') {
    setCurrentUser(user);
    showToast(`Bem-vindo, ${user.name}!`);
  }
}

// 3. User Registration (Live Real-Time to Cloud)
async function handleAccountRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const role = document.getElementById('regRole').value.trim();
  const contact = document.getElementById('regContact').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;

  if (!name || !role || !contact || !password) {
    showGateError('Preencha todos os campos obrigatórios.');
    return;
  }

  showToast('A enviar pedido para a nuvem...');
  await fetchFromCloudDB();
  const users = getUsers();
  const exists = users.find(u => (u.contact && u.contact.toLowerCase() === contact) || (u.email && u.email.toLowerCase() === contact));

  if (exists) {
    if (exists.status === 'approved') {
      showGateSuccess('Esta conta já se encontra APROVADA! Vá à aba "Entrar com Conta".');
      return;
    } else {
      showGateError('Este pedido já foi enviado e aguarda aprovação de Marco.');
      startUserWaitingScreen(exists);
      return;
    }
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    name,
    role,
    contact,
    email: contact,
    password,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Push to Cloud DB in real time!
  const pushed = await pushToCloudDB((data) => {
    if (!data.users) data.users = [];
    const idx = data.users.findIndex(u => (u.contact && u.contact.toLowerCase() === contact) || (u.email && u.email.toLowerCase() === contact));
    if (idx >= 0) {
      data.users[idx] = newUser;
    } else {
      data.users.unshift(newUser);
    }
    return data;
  });

  if (!pushed) {
    showGateError('Aviso: ligação lenta. A tentar manter pedido local e na nuvem...');
  }

  // Start real-time waiting screen on user's phone!
  startUserWaitingScreen(newUser);
}

// Real-Time Waiting Screen on Colleague's Phone
function startUserWaitingScreen(user) {
  if (!user) return;
  localStorage.setItem('opc_pending_user_id', user.id);

  switchAuthTab('register');
  document.getElementById('regFormElement').style.display = 'none';
  const waitScreen = document.getElementById('regWaitingScreen');
  waitScreen.style.display = 'block';

  // Format WhatsApp Link
  const waLink = document.getElementById('regWhatsappLink');
  const msg = encodeURIComponent(`Olá Marco! Criei conta no Guia Policial (OPC):\nNome: ${user.name}\nPosto: ${user.role}\nContacto: ${user.contact}\nPodes aprovar o meu acesso no teu painel?`);
  waLink.href = `https://wa.me/?text=${msg}`;

  showGateSuccess('Pedido enviado! Aguarde aprovação nesta janela...');

  // Active polling every 2.5 seconds: enters automatically once approved!
  if (userApprovalPollInterval) clearInterval(userApprovalPollInterval);
  userApprovalPollInterval = setInterval(async () => {
    const cloudData = await fetchFromCloudDB();
    if (cloudData && Array.isArray(cloudData.users)) {
      const liveUser = cloudData.users.find(u => u.id === user.id);
      if (liveUser && liveUser.status === 'approved') {
        clearInterval(userApprovalPollInterval);
        localStorage.removeItem('opc_pending_user_id');
        showGateSuccess('✓ Acesso APROVADO pelo Marco! A entrar no sistema...');
        showToast('🎉 Acesso Concedido! Bem-vindo.');
        setTimeout(() => {
          setCurrentUser(liveUser);
        }, 800);
      } else if (liveUser && liveUser.status === 'rejected') {
        clearInterval(userApprovalPollInterval);
        localStorage.removeItem('opc_pending_user_id');
        showGateError('O seu pedido foi recusado pelo Administrador.');
        cancelWaitingRegistration();
      }
    }
  }, 2500);
}

function cancelWaitingRegistration() {
  if (userApprovalPollInterval) clearInterval(userApprovalPollInterval);
  localStorage.removeItem('opc_pending_user_id');
  document.getElementById('regFormElement').style.display = 'block';
  document.getElementById('regWaitingScreen').style.display = 'none';
  hideGateMessages();
}

// =========================================================================
// 4. PAINEL DE ADMINISTRAÇÃO & REAL-TIME POLLING (MARCO)
// =========================================================================

function startAdminRealTimePolling() {
  if (adminPollInterval) clearInterval(adminPollInterval);
  
  // Initial check
  checkAdminUpdates();

  // Poll cloud DB every 3 seconds for new requests from phones!
  adminPollInterval = setInterval(checkAdminUpdates, 3000);
}

async function checkAdminUpdates() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') return;

  const data = await fetchFromCloudDB();
  if (data && Array.isArray(data.users)) {
    const pending = data.users.filter(u => u.status === 'pending');
    
    // Header Notification Badge & Pulsing alert ring
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

    // If new request arrived, sound chime + toast alert!
    if (pending.length > lastKnownPendingCount) {
      const newest = pending[0];
      playAlertChime();
      showToast(`🚨 Novo pedido: ${newest.name} (${newest.role})!`);
    }
    lastKnownPendingCount = pending.length;

    // If admin modal is currently open, re-render immediately!
    const modal = document.getElementById('adminModal');
    if (modal && modal.classList.contains('open')) {
      renderAdminDashboard();
    }
  }
}

async function manualAdminRefresh() {
  showToast('A verificar atualizações na nuvem...');
  await fetchFromCloudDB();
  renderAdminDashboard();
  showToast('Sincronização concluída!');
}

function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if (!modal) return;
  modal.classList.add('open');

  const cloudInput = document.getElementById('adminCloudSyncUrl');
  if (cloudInput) {
    cloudInput.value = getCloudDbUrl();
  }

  fetchFromCloudDB().then(() => renderAdminDashboard());
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
  const approved = users.filter(u => u.status === 'approved');

  // Update badge counters
  const pendCount = document.getElementById('adminPendingCount');
  const appCount = document.getElementById('adminApprovedCount');
  if (pendCount) pendCount.textContent = pending.length;
  if (appCount) appCount.textContent = approved.length;

  // Render Pending List
  const pendContainer = document.getElementById('adminPendingList');
  if (pendContainer) {
    if (pending.length === 0) {
      pendContainer.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted);">
          Nenhum pedido de conta pendente no momento.
        </div>
      `;
    } else {
      pendContainer.innerHTML = pending.map(u => `
        <div class="user-card">
          <div class="user-card-header">
            <span class="user-name">${u.name}</span>
            <span class="badge badge-pending">Aguardando Validação</span>
          </div>
          <div class="user-meta">
            <span>🎖️ ${u.role}</span>
            <span>📱 ${u.contact}</span>
            <span>📅 ${new Date(u.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="user-actions">
            <button class="btn-approve" onclick="adminApproveUser('${u.id}')">✓ Aceitar Imediatamente</button>
            <button class="btn-reject" onclick="adminRejectUser('${u.id}')">✕ Recusar</button>
          </div>
        </div>
      `).join('');
    }
  }

  // Render Approved List
  const appContainer = document.getElementById('adminApprovedList');
  if (appContainer) {
    if (approved.length === 0) {
      appContainer.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted);">
          Nenhum utilizador com conta registada aprovada.
        </div>
      `;
    } else {
      appContainer.innerHTML = approved.map(u => `
        <div class="user-card">
          <div class="user-card-header">
            <span class="user-name">${u.name}</span>
            <span class="badge badge-approved">Aprovado</span>
          </div>
          <div class="user-meta">
            <span>🎖️ ${u.role}</span>
            <span>📱 ${u.contact}</span>
          </div>
          <div class="user-actions">
            <button class="btn-reject" onclick="adminRevokeUser('${u.id}')">🔒 Bloquear</button>
            <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="adminDeleteUser('${u.id}')">🗑️ Eliminar</button>
          </div>
        </div>
      `).join('');
    }
  }

  // Render Invites List
  renderAdminInvites();
}

async function adminApproveUser(id) {
  showToast('A aprovar conta na nuvem...');
  const success = await pushToCloudDB((data) => {
    const u = (data.users || []).find(x => x.id === id);
    if (u) u.status = 'approved';
    return data;
  });

  if (success) {
    renderAdminDashboard();
    showToast('✓ Utilizador APROVADO! O telemóvel dele entrará automaticamente.');
  }
}

async function adminRejectUser(id) {
  await pushToCloudDB((data) => {
    const u = (data.users || []).find(x => x.id === id);
    if (u) u.status = 'rejected';
    return data;
  });
  renderAdminDashboard();
  showToast('Pedido recusado.');
}

async function adminRevokeUser(id) {
  await pushToCloudDB((data) => {
    const u = (data.users || []).find(x => x.id === id);
    if (u) u.status = 'rejected';
    return data;
  });
  renderAdminDashboard();
  showToast('Acesso bloqueado.');
}

async function adminDeleteUser(id) {
  if (confirm('Eliminar permanentemente este utilizador?')) {
    await pushToCloudDB((data) => {
      data.users = (data.users || []).filter(x => x.id !== id);
      return data;
    });
    renderAdminDashboard();
    showToast('Utilizador eliminado.');
  }
}

// ---------------------------------------------------------------------
// Invite Code Generator (VIP Access without Account creation)
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
        <span style="font-size: 1.1rem; font-weight: 800; color: var(--accent-cyan); letter-spacing: 2px;">
          ${inv.code}
        </span>
        <span class="badge ${inv.active ? 'badge-approved' : 'badge-rejected'}">
          ${inv.active ? 'Ativo' : 'Revogado'}
        </span>
      </div>
      <div style="font-size: 0.82rem; color: var(--text-secondary);">
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

  await pushToCloudDB((data) => {
    if (!data.invites) data.invites = [];
    data.invites.unshift({
      code,
      label,
      active: true,
      createdAt: new Date().toISOString()
    });
    return data;
  });

  labelInput.value = '';
  renderAdminInvites();
  showToast(`Código ${code} gerado com sucesso!`);
}

async function toggleInviteActive(code) {
  await pushToCloudDB((data) => {
    const inv = (data.invites || []).find(i => i.code === code);
    if (inv) inv.active = !inv.active;
    return data;
  });
  renderAdminInvites();
  showToast(`Código ${code} atualizado na nuvem.`);
}

function copyInviteToWhatsapp(code, label) {
  const url = window.location.href.split('?')[0].split('#')[0];
  const msg = `Olá ${label}! Segue o teu código de acesso exclusivo ao Guia Policial (OPC):\n\n🔑 Código: *${code}*\n📲 Acede aqui: ${url}\n\nAo abrir o link, basta colocar o código no campo inicial para entrar imediatamente!`;
  
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

function saveAdminPassword() {
  const input = document.getElementById('newAdminPasswordInput');
  const newPass = input.value.trim();
  if (!newPass) {
    showToast('A senha não pode estar vazia!');
    return;
  }
  localStorage.setItem('opc_admin_password', newPass);
  input.value = '';
  showToast('Senha de Administrador alterada com sucesso!');
}

function saveCloudSyncUrl() {
  const input = document.getElementById('adminCloudSyncUrl');
  const url = input.value.trim();
  localStorage.setItem('opc_cloud_sync_url', url);
  showToast('URL de nuvem atualizado!');
  fetchFromCloudDB().then(() => renderAdminDashboard());
}

// =========================================================================
// 5. MAIN NAVIGATION TABS (EXPEDIENTES | ARTIGOS | PRAZOS)
// =========================================================================

function switchMainTab(tabName) {
  activeMainTab = tabName;

  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tabExpedientes').classList.toggle('active', tabName === 'expedientes');
  document.getElementById('tabArtigos').classList.toggle('active', tabName === 'artigos');
  document.getElementById('tabPrazos').classList.toggle('active', tabName === 'prazos');

  document.getElementById('viewExpedientes').style.display = tabName === 'expedientes' ? 'block' : 'none';
  document.getElementById('viewArtigos').style.display = tabName === 'artigos' ? 'block' : 'none';
  document.getElementById('viewPrazos').style.display = tabName === 'prazos' ? 'block' : 'none';

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
  await fetchFromCloudDB();
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

function openSettings() {
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
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// =========================================================================
// 12. PWA SERVICE WORKER AUTO-UPDATE (v6.0)
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
    navigator.serviceWorker.register('sw.js?v=6.0')
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
  switchAuthTab('register');
  document.getElementById('regFormElement').style.display = 'none';
  document.getElementById('regWaitingScreen').style.display = 'block';
  showGateSuccess('A verificar aprovação com o Administrador Marco...');

  const cloudData = await fetchFromCloudDB();
  if (cloudData && Array.isArray(cloudData.users)) {
    const liveUser = cloudData.users.find(u => u.id === pendingId);
    if (liveUser) {
      if (liveUser.status === 'approved') {
        localStorage.removeItem('opc_pending_user_id');
        showGateSuccess('✓ Acesso aprovado pelo Marco! A entrar...');
        showToast('🎉 Bem-vindo, ' + liveUser.name + '!');
        setTimeout(() => {
          setCurrentUser(liveUser);
        }, 800);
        return;
      } else if (liveUser.status === 'rejected') {
        localStorage.removeItem('opc_pending_user_id');
        showGateError('O seu pedido de acesso foi recusado pelo Administrador.');
        cancelWaitingRegistration();
        return;
      } else {
        // Still pending: resume live radar polling
        startUserWaitingScreen(liveUser);
        return;
      }
    }
  }
  // Not found in cloud (deleted), restore standard form
  cancelWaitingRegistration();
}

function startSessionGuard(user) {
  // Check periodically if current non-admin session is still approved
  setInterval(async () => {
    const cloudData = await fetchFromCloudDB();
    if (cloudData) {
      if (user.inviteCode) {
        const inv = (cloudData.invites || []).find(i => i.code === user.inviteCode);
        if (inv && !inv.active) {
          logoutApp();
          showGateError('O seu código de convite foi revogado.');
        }
      } else if (user.id && user.role !== 'admin') {
        const liveUser = (cloudData.users || []).find(u => u.id === user.id);
        if (!liveUser || liveUser.status !== 'approved') {
          logoutApp();
          showGateError('A sua sessão foi encerrada ou revogada pelo Administrador.');
        }
      }
    }
  }, 35000);
}

document.addEventListener('DOMContentLoaded', () => {
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
      document.getElementById('securityGate').style.display = 'flex';
    }
  }

  loadAllData();
});
