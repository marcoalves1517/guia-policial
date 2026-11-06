// Guia de Expediente Policial - Core Logic

let allExpedientes = [];
let currentCategory = 'all';
let currentNature = 'all';
let currentSearch = '';
let onlyFavorites = false;
let currentDetailItem = null;

// Security PIN Configuration
const DEFAULT_PIN = 'GNR2025';

function getStoredPin() {
  return localStorage.getItem('opc_app_pin') || DEFAULT_PIN;
}

function isAppUnlocked() {
  return localStorage.getItem('opc_unlocked') === 'true';
}

function unlockApp() {
  localStorage.setItem('opc_unlocked', 'true');
  document.getElementById('securityGate').style.display = 'none';
}

function lockApp() {
  localStorage.removeItem('opc_unlocked');
  document.getElementById('securityGate').style.display = 'flex';
  document.getElementById('pinInput').value = '';
  document.getElementById('gateError').style.display = 'none';
  closeDetail();
  closeSettings();
}

function handlePinSubmit(e) {
  e.preventDefault();
  const inputPin = document.getElementById('pinInput').value.trim();
  const validPin = getStoredPin();

  if (inputPin.toUpperCase() === validPin.toUpperCase()) {
    unlockApp();
    showToast('Acesso autorizado! Bem-vindo ao Guia.');
  } else {
    document.getElementById('gateError').style.display = 'block';
    document.getElementById('pinInput').value = '';
    document.getElementById('pinInput').focus();
  }
}

// ---------------------------------------------------------------------
// Data Loading & Syncing
// ---------------------------------------------------------------------

async function loadExpedientes() {
  const cachedData = localStorage.getItem('opc_expedientes_data');
  if (cachedData) {
    try {
      allExpedientes = JSON.parse(cachedData);
      renderUI();
    } catch (err) {
      console.warn('Erro ao ler cache local:', err);
    }
  }

  // Fetch latest data from server/file
  await syncData(false);
}

async function syncData(manual = false) {
  const syncBtn = document.getElementById('syncBtn');
  if (syncBtn) syncBtn.classList.add('loading');

  const customUrl = localStorage.getItem('opc_sync_url') || 'expedientes.json';

  try {
    const res = await fetch(customUrl + '?t=' + Date.now());
    if (!res.ok) throw new Error('Falha ao descarregar base de dados');
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      allExpedientes = data;
      localStorage.setItem('opc_expedientes_data', JSON.stringify(data));
      localStorage.setItem('opc_last_sync', new Date().toISOString());
      
      updateStatusDisplay();
      renderUI();

      if (manual) {
        showToast(`Sincronizado! ${data.length} procedimentos atualizados.`);
      }
    }
  } catch (err) {
    console.log('Modo offline ativo ou erro na sincronização:', err);
    if (manual) {
      showToast('Sem ligação à rede. A utilizar cópia local guardada.');
    }
  } finally {
    if (syncBtn) syncBtn.classList.remove('loading');
    updateOnlineStatus();
  }
}

function updateStatusDisplay() {
  const versionText = document.getElementById('dataVersionText');
  if (versionText) {
    versionText.textContent = `${allExpedientes.length} Procedimentos Atualizados`;
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

// ---------------------------------------------------------------------
// Favorites Management
// ---------------------------------------------------------------------

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('opc_favorites') || '[]');
  } catch {
    return [];
  }
}

function isFavorite(id) {
  const favs = getFavorites();
  return favs.includes(id);
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

// ---------------------------------------------------------------------
// Checklist Memory (Persistent Per Procedure)
// ---------------------------------------------------------------------

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
  if (el) {
    el.classList.toggle('done', checked);
  }
}

// ---------------------------------------------------------------------
// Search & Filter Logic
// ---------------------------------------------------------------------

function normalizeText(str) {
  if (!str) return '';
  return str.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function handleSearch(val) {
  currentSearch = val;
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) {
    clearBtn.style.display = val ? 'block' : 'none';
  }
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
  document.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCrimeList();
}

function setNatureFilter(nature, btn) {
  currentNature = nature;
  document.querySelectorAll('.sub-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCrimeList();
}

// ---------------------------------------------------------------------
// Rendering Categories & Crimes
// ---------------------------------------------------------------------

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
    // Category filter
    if (currentCategory !== 'all' && item.category_id !== currentCategory) {
      return false;
    }

    // Natureza filter
    if (currentNature !== 'all' && !item.nature.includes(currentNature)) {
      return false;
    }

    // Favorites filter
    if (onlyFavorites && !favs.includes(item.id)) {
      return false;
    }

    // Search query
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
        <div style="font-size: 0.85rem; margin-top: 4px;">Tente pesquisar por outro crime, número de artigo ou limpe os filtros.</div>
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

// ---------------------------------------------------------------------
// Detail Modal & Interactive Checklist
// ---------------------------------------------------------------------

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

    <!-- Natureza Jurídica & Queixa -->
    <div class="info-box police-box">
      <div class="info-header">
        <span>⚖️ Natureza Jurídica: <strong>${item.nature}</strong></span>
      </div>
      <div class="info-body">
        ${item.nature_desc || 'Atuação conforme as regras gerais do CPP.'}
      </div>
    </div>

    <!-- Detenção em Flagrante Delito -->
    <div class="info-box danger-box">
      <div class="info-header">
        <span>🚨 Detenção em Flagrante Delito</span>
      </div>
      <div class="info-body">
        ${item.detention || 'Avaliar os requisitos gerais dos artigos 255.º e 256.º do CPP.'}
      </div>
    </div>

    <!-- Passo a Passo no Terreno -->
    <div class="info-box">
      <div class="info-header">
        <span>📋 Atuação no Terreno (Passo a Passo)</span>
      </div>
      <div class="steps-list">
        ${stepsHtml}
      </div>
    </div>

    <!-- Checklist de Expediente a Elaborar -->
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

    <!-- Notas Críticas / Atenção OPC -->
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

    <!-- Bottom Actions -->
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
  if (currentDetailItem) {
    toggleFavorite(currentDetailItem.id);
  }
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
  (item.steps || []).forEach((s, i) => {
    text += `${i + 1}. ${s}\n`;
  });
  
  text += `\n📑 *PEÇAS DE EXPEDIENTE:*\n`;
  (item.expediente_docs || []).forEach(d => {
    text += `▫️ ${d}\n`;
  });

  if (item.critical_notes && item.critical_notes.length > 0) {
    text += `\n⚠️ *ATENÇÃO OPC:*\n`;
    item.critical_notes.forEach(n => {
      text += `• ${n}\n`;
    });
  }

  navigator.clipboard.writeText(text).then(() => {
    showToast('Resumo copiado para a área de transferência!');
  }).catch(() => {
    showToast('Erro ao copiar texto.');
  });
}

// ---------------------------------------------------------------------
// Settings Management
// ---------------------------------------------------------------------

function openSettings() {
  const modal = document.getElementById('settingsModal');
  const pinInput = document.getElementById('settingsPinInput');
  const syncInput = document.getElementById('settingsSyncUrl');

  if (pinInput) pinInput.value = getStoredPin();
  if (syncInput) syncInput.value = localStorage.getItem('opc_sync_url') || 'expedientes.json';

  if (modal) modal.classList.add('open');
}

function closeSettings() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.classList.remove('open');
}

function closeSettingsOnBackdrop(e) {
  if (e.target.id === 'settingsModal') {
    closeSettings();
  }
}

function saveNewPin() {
  const val = document.getElementById('settingsPinInput').value.trim();
  if (!val) {
    showToast('O código não pode estar vazio!');
    return;
  }
  localStorage.setItem('opc_app_pin', val);
  showToast('Código de acesso alterado com sucesso!');
  closeSettings();
}

function resetAppData() {
  if (confirm('Deseja limpar todos os dados em cache e recarregar?')) {
    localStorage.removeItem('opc_expedientes_data');
    localStorage.removeItem('opc_favorites');
    caches.delete('guia-policial-v1').then(() => {
      location.reload();
    });
  }
}

// ---------------------------------------------------------------------
// Toast Notification Utility
// ---------------------------------------------------------------------

let toastTimeout = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// ---------------------------------------------------------------------
// PWA Service Worker Registration
// ---------------------------------------------------------------------

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('ServiceWorker registado com sucesso:', reg.scope))
      .catch(err => console.log('Falha ao registar ServiceWorker:', err));
  });
}

// ---------------------------------------------------------------------
// App Initialization
// ---------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  if (isAppUnlocked()) {
    document.getElementById('securityGate').style.display = 'none';
  } else {
    document.getElementById('securityGate').style.display = 'flex';
  }

  loadExpedientes();
});
