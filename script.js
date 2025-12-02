// MovieVerse — script.js (complete, unified)
// Keys and utils
const DB = { USERS: 'mv_users_mv', ITEMS: 'mv_items_mv', CURRENT: 'mv_current_mv', THEME: 'mv_theme_mv' };

const uid = (p='id') => p + '_' + Math.random().toString(36).slice(2,9);
const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch(e){ return []; } };
const write = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const getUsers = () => read(DB.USERS);
const setUsers = (v) => write(DB.USERS,v);
const getItems = () => read(DB.ITEMS);
const setItems = (v) => write(DB.ITEMS,v);
const getCurrentUser = () => { try{ return JSON.parse(localStorage.getItem(DB.CURRENT)); } catch(e){ return null; } };
const setCurrentUser = (u) => { if(!u) localStorage.removeItem(DB.CURRENT); else localStorage.setItem(DB.CURRENT, JSON.stringify(u)); };
const setTheme = (t) => localStorage.setItem(DB.THEME, t);
const getTheme = () => localStorage.getItem(DB.THEME) || 'dark';


// Demo seed (REMOVIDO: não cria mais filmes/pessoas automaticamente)
function seedDemo(){
  // Agora vazio e não faz nada
}





// DOM refs
const dom = {
  greeting: document.getElementById('greeting'),
  btnAuthOpen: document.getElementById('btnAuthOpen'),
  btnLogout: document.getElementById('btnLogout'),
  themeToggle: document.getElementById('themeToggle'),
  navLinks: document.querySelectorAll('.nav-link'),
  pages: {
    home: document.getElementById('page-home'),
    catalog: document.getElementById('page-catalog'),
    add: document.getElementById('page-add'),
    favorites: document.getElementById('page-favorites'),
    ranking: document.getElementById('page-ranking'),
    profile: document.getElementById('page-profile')
  },
  heroSlider: document.getElementById('heroSlider'),
  homeHighlights: document.getElementById('homeHighlights'),
  catalogGrid: document.getElementById('catalogGrid'),
  favoritesGrid: document.getElementById('favoritesGrid'),
  rankingGrid: document.getElementById('rankingGrid'),
  userContents: document.getElementById('userContents'),
  userFavs: document.getElementById('userFavs'),
  profileName: document.getElementById('profileName'),
  profileEmail: document.getElementById('profileEmail'),
  searchInput: document.getElementById('searchInput'),
  filterSort: document.getElementById('filterSort'),
  formAddEdit: document.getElementById('formAddEdit'),
  addTitle: document.getElementById('addTitle'),
  btnCancelAdd: document.getElementById('btnCancelAdd'),
  // Auth modal
  modalAuth: document.getElementById('modalAuth'),
  tabLogin: document.getElementById('tabLogin'),
  tabRegister: document.getElementById('tabRegister'),
  formLogin: document.getElementById('formLogin'),
  formRegister: document.getElementById('formRegister'),
  loginUser: document.getElementById('loginUser'),
  loginPass: document.getElementById('loginPass'),
  regName: document.getElementById('regName'),
  regEmail: document.getElementById('regEmail'),
  regPass: document.getElementById('regPass'),
  // details modal
  modalDetails: document.getElementById('modalDetails'),
  detailImg: document.getElementById('detailImg'),
  detailName: document.getElementById('detailName'),
  detailMeta: document.getElementById('detailMeta'),
  detailSynopsis: document.getElementById('detailSynopsis'),
  avgRating: document.getElementById('avgRating'),
  userStars: document.getElementById('userStars'),
  commentsList: document.getElementById('commentsList'),
  formComment: document.getElementById('formComment'),
  commentText: document.getElementById('commentText'),
  // confirm
  modalConfirm: document.getElementById('modalConfirm'),
  confirmText: document.getElementById('confirmText'),
  confirmYes: document.getElementById('confirmYes'),
  confirmNo: document.getElementById('confirmNo'),
  // inputs add/edit
  fieldName: document.getElementById('fieldName'),
  fieldGenre: document.getElementById('fieldGenre'),
  fieldCast: document.getElementById('fieldCast'),
  fieldDate: document.getElementById('fieldDate'),
  fieldDirector: document.getElementById('fieldDirector'),
  fieldAge: document.getElementById('fieldAge'),
  fieldPlatforms: document.getElementById('fieldPlatforms'),
  fieldImage: document.getElementById('fieldImage'),
  fieldSynopsis: document.getElementById('fieldSynopsis'),
  // profile
  userContentsDiv: document.getElementById('userContents'),
  userFavsDiv: document.getElementById('userFavs'),
  ctaAddQuick: document.getElementById('ctaAddQuick')
};

// Modal helpers
function openModal(el){ if(!el) return; el.setAttribute('aria-hidden','false'); }
function closeModal(el){ if(!el) return; el.setAttribute('aria-hidden','true'); }
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', e => { const m = e.target.closest('.modal'); if(m) closeModal(m); }));
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if(e.target === m) closeModal(m); }));

// Routing / Nav
function setActiveRoute(route){
  Object.keys(dom.pages).forEach(k => {
    const el = dom.pages[k];
    if(!el) return;
    if(k === route) el.classList.remove('hidden'); else el.classList.add('hidden');
  });
  dom.navLinks.forEach(a => a.classList.toggle('active', a.dataset.route === route));
  // special renders
  if(route === 'catalog') renderCatalog();
  if(route === 'favorites') renderFavorites();
  if(route === 'ranking') renderRanking();
  if(route === 'profile') renderProfile();
  if(route === 'home') { renderHeroSlider(); renderHomeHighlights(); }
}
document.querySelectorAll('[data-route]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); setActiveRoute(a.dataset.route); }));
document.querySelectorAll('[data-route-to]').forEach(b => b.addEventListener('click', e => { const r = b.dataset.routeTo || b.getAttribute('data-route-to'); setActiveRoute(r); }));

// Auth UI
function refreshAuthUI(){
  const user = getCurrentUser();
  if(user){
    dom.greeting.textContent = `Olá, ${user.name || user.username} 👋`;
    dom.btnAuthOpen.style.display = 'none';
    dom.btnLogout.style.display = '';
  } else {
    dom.greeting.textContent = 'Olá, visitante 👋';
    dom.btnAuthOpen.style.display = '';
    dom.btnLogout.style.display = 'none';
  }
}

// Auth handlers
function validateEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

dom.formLogin.addEventListener('submit', e => {
  e.preventDefault();
  const v = dom.loginUser.value.trim();
  const p = dom.loginPass.value;
  const users = getUsers();
  const user = users.find(u => (u.username.toLowerCase() === v.toLowerCase() || u.email.toLowerCase() === v.toLowerCase()) && u.pass === p);
  if(!user){ alert('Usuário ou senha inválidos.'); return; }
  setCurrentUser({ id: user.id, username: user.username, name: user.name, email: user.email });
  closeModal(dom.modalAuth);
  refreshAuthUI();
  renderCatalog();
  renderProfile();
});

dom.formRegister.addEventListener('submit', e => {
  e.preventDefault();
  const name = dom.regName.value.trim();
  const email = dom.regEmail.value.trim();
  const pass = dom.regPass.value;
  if(!name || !validateEmail(email) || pass.length < 6){ alert('Verifique nome, email e senha (mín 6).'); return; }
  const users = getUsers();
  if(users.some(u => u.email.toLowerCase() === email.toLowerCase())){ alert('Email já cadastrado.'); return; }
  const username = name.toLowerCase().replace(/\s+/g,'').slice(0,12) + Math.floor(Math.random()*90);
  const newUser = { id: uid('u'), name, username, email, pass, favorites:[] };
  users.push(newUser);
  setUsers(users);
  setCurrentUser({ id: newUser.id, username: newUser.username, name: newUser.name, email: newUser.email });
  closeModal(dom.modalAuth);
  refreshAuthUI();
  renderProfile();
  alert('Cadastro realizado — você está logado!');
});

// Auth modal tabs
dom.tabLogin.addEventListener('click', ()=> { dom.tabLogin.classList.add('active'); dom.tabRegister.classList.remove('active'); dom.formLogin.style.display=''; dom.formRegister.style.display='none';});
dom.tabRegister.addEventListener('click', ()=> { dom.tabRegister.classList.add('active'); dom.tabLogin.classList.remove('active'); dom.formRegister.style.display=''; dom.formLogin.style.display='none';});
dom.btnAuthOpen.addEventListener('click', ()=> { dom.formLogin.reset(); dom.formRegister.reset(); openModal(dom.modalAuth);});
dom.btnLogout.addEventListener('click', ()=> { setCurrentUser(null); refreshAuthUI(); renderCatalog(); renderProfile(); alert('Logout efetuado.'); });

// Utilities
function formatDateShort(d){ if(!d) return '-'; const dt = new Date(d); if(isNaN(dt)) return d; return dt.getFullYear(); }
function escapeHtml(str){ if(!str && str!==0) return ''; return (''+str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function buildAvgRating(item){ const vals = Object.values(item.ratings || {}); if(!vals.length) return 0; return Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10; }

// Catalog render
function renderCard(item){
  const cur = getCurrentUser();
  const isOwner = cur && cur.id === item.ownerId;
  const wrapper = document.createElement('div'); wrapper.className = 'card';
  wrapper.innerHTML = `
    <div class="card-media"><img src="${item.image || fallbackImage()}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='${fallbackImage()}';"></div>
    <div class="card-body">
      <h3>${escapeHtml(item.title)}</h3>
      <div class="meta">${escapeHtml(item.genre)} • ${formatDateShort(item.release)}</div>
      <div class="meta">Diretor: ${escapeHtml(item.director || '-')}</div>
      <div class="meta">Plataformas: ${escapeHtml((item.platforms||[]).join(', '))}</div>
      <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
        <div style="font-weight:800">${buildAvgRating(item) || 0} ★</div>
        <div class="mini-stars" data-id="${item.id}">${renderMiniStars(item)}</div>
      </div>
      <div class="card-actions" style="margin-top:8px;display:flex;gap:8px;justify-content:space-between">
        <div>
          <button class="btn small" data-action="view" data-id="${item.id}">Ver</button>
          <button class="btn small" data-action="fav" data-id="${item.id}">${isFavorited(item)?'★':'☆'} Favorito</button>
        </div>
        <div>
          ${isOwner? `<button class="btn ghost small" data-action="edit" data-id="${item.id}">Editar</button>
          <button class="btn ghost small" data-action="delete" data-id="${item.id}">Excluir</button>` : ''}
        </div>
      </div>
    </div>
  `;
  // attach events
  wrapper.querySelector('[data-action="view"]').addEventListener('click', ()=> openDetails(item.id));
  wrapper.querySelector('[data-action="fav"]').addEventListener('click', (e)=> { e.stopPropagation(); toggleFavorite(item.id); renderCatalog(); renderFavorites(); renderProfile(); });
  const editBtn = wrapper.querySelector('[data-action="edit"]'); if(editBtn) editBtn.addEventListener('click', ()=> openEdit(item.id));
  const delBtn = wrapper.querySelector('[data-action="delete"]'); if(delBtn) delBtn.addEventListener('click', ()=> confirmDelete(item.id));
  return wrapper;
}
function renderMiniStars(item){
  const avg = Math.round(buildAvgRating(item));
  let html=''; for(let i=1;i<=5;i++){ html += `<span class="star ${i<=avg? 'on':'off'}">★</span>`; } return html;
}
function renderCatalog(){
  dom.catalogGrid.innerHTML = '';
  const q = (dom.searchInput.value || '').toLowerCase().trim();
  const sort = dom.filterSort.value;
  let items = getItems().slice();
  // filter
  items = items.filter(it => {
    if(!q) return true;
    const hay = (it.title + ' ' + it.genre + ' ' + (it.cast||[]).join(' ')).toLowerCase();
    return hay.includes(q);
  });
  // sort
  if(sort === 'rating') items.sort((a,b)=> buildAvgRating(b) - buildAvgRating(a));
  else if(sort === 'alpha') items.sort((a,b)=> a.title.localeCompare(b.title));
  else items.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  if(items.length === 0){ dom.catalogGrid.innerHTML = `<div class="card"><div style="padding:18px;color:#ddd">Nenhum filme encontrado.</div></div>`; return; }
  items.forEach(i => dom.catalogGrid.appendChild(renderCard(i)));
}

// Hero slider & highlights
function renderHeroSlider(){
  dom.heroSlider.innerHTML = '';
  const items = getItems().slice(0,5);
  items.forEach((it, idx) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (idx===0? ' active':'');
    slide.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45)), url('${it.image || fallbackImage()}')`;
    slide.title = it.title;
    slide.addEventListener('click', ()=> openDetails(it.id));
    dom.heroSlider.appendChild(slide);
  });
  startSlider();
}
let sliderTimer = null;
function startSlider(){
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  if(sliderTimer) clearInterval(sliderTimer);
  if(slides.length <= 1) return;
  let idx = 0;
  sliderTimer = setInterval(()=> {
    slides.forEach(s=>s.classList.remove('active'));
    idx = (idx+1)%slides.length;
    slides[idx].classList.add('active');
  }, 4500);
}
function renderHomeHighlights(){
  dom.homeHighlights.innerHTML = '';
  const items = getItems().slice(0,4);
  items.forEach(it => {
    const c = document.createElement('div'); c.className='card';
    c.innerHTML = `<div class="card-media"><img src="${it.image || fallbackImage()}" onerror="this.src='${fallbackImage()}'"></div>
                   <div class="card-body"><h3>${escapeHtml(it.title)}</h3><div class="meta">${escapeHtml(it.genre)}</div></div>`;
    c.addEventListener('click', ()=> openDetails(it.id));
    dom.homeHighlights.appendChild(c);
  });
}

// Details, comments, rating
let currentDetailId = null;
function openDetails(itemId){
  const items = getItems();
  const it = items.find(x=>x.id===itemId);
  if(!it) return alert('Item não encontrado.');
  currentDetailId = itemId;
  dom.detailImg.src = it.image || fallbackImage();
  dom.detailName.textContent = it.title;
  dom.detailMeta.textContent = `${it.genre} • ${it.release || '-'} • Diretor: ${it.director || '-'}`;
  dom.detailSynopsis.textContent = it.synopsis || '-';
  dom.avgRating.textContent = buildAvgRating(it) || 0;
  buildStarInput('userStars', it);
  renderCommentsList(it);
  openModal(dom.modalDetails);
}
function buildStarInput(containerId, item){
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const user = getCurrentUser();
  const myRating = user ? (item.ratings && item.ratings[user.id]) || 0 : 0;
  for(let i=1;i<=5;i++){
    const span = document.createElement('span');
    span.className = 'star ' + (i<=myRating ? 'on' : 'off');
    span.textContent = '★';
    span.dataset.value = i;
    span.addEventListener('mouseenter', ()=> highlightStars(container, i));
    span.addEventListener('mouseleave', ()=> highlightStars(container, myRating));
    span.addEventListener('click', ()=> {
      if(!user){ closeModal(dom.modalDetails); openModal(dom.modalAuth); return; }
      const items = getItems();
      const it = items.find(x=>x.id===item.id);
      it.ratings = it.ratings || {};
      it.ratings[user.id] = i;
      setItems(items);
      dom.avgRating.textContent = buildAvgRating(it);
      renderCatalog(); renderProfile(); buildStarInput(containerId, it);
    });
    container.appendChild(span);
  }
}
function highlightStars(container, upto){
  const spans = container.querySelectorAll('.star');
  spans.forEach(s => {
    s.classList.toggle('on', Number(s.dataset.value) <= upto);
    s.classList.toggle('off', Number(s.dataset.value) > upto);
  });
}
function renderCommentsList(item){
  dom.commentsList.innerHTML = '';
  (item.comments || []).slice().reverse().forEach(c=>{
    const el = document.createElement('div'); el.className='comment';
    el.innerHTML = `<div class="meta"><strong>${escapeHtml(c.name)}</strong> • ${escapeHtml(formatDateFull(c.ts))}</div>
                    <div>${escapeHtml(c.text)}</div>`;
    dom.commentsList.appendChild(el);
  });
}
dom.formComment.addEventListener('submit', (e)=>{
  e.preventDefault();
  const user = getCurrentUser();
  if(!user){ closeModal(dom.modalDetails); openModal(dom.modalAuth); return; }
  const text = dom.commentText.value.trim();
  if(!text) return;
  const items = getItems();
  const it = items.find(x=>x.id===currentDetailId);
  it.comments = it.comments || [];
  it.comments.push({ id: uid('c'), userId: user.id, name: user.name || user.username, ts: new Date().toISOString(), text });
  setItems(items);
  dom.commentText.value = '';
  renderCommentsList(it);
});

// Add / Edit / Delete
let editingId = null;
dom.formAddEdit.addEventListener('submit', (e)=>{
  e.preventDefault();
  const user = getCurrentUser();
  if(!user){ openModal(dom.modalAuth); return; }
  const items = getItems();
  const title = dom.fieldName.value.trim();
  const genre = dom.fieldGenre.value.trim();
  const release = dom.fieldDate.value || '';
  const director = dom.fieldDirector.value.trim();
  const cast = dom.fieldCast.value.split(',').map(s=>s.trim()).filter(Boolean);
  const ratingAge = dom.fieldAge.value.trim();
  const platforms = dom.fieldPlatforms.value.split(',').map(s=>s.trim()).filter(Boolean);
  const image = dom.fieldImage.value.trim() || fallbackImage();
  const synopsis = dom.fieldSynopsis.value.trim();

  if(!title || !genre || !cast.length || !synopsis || !image){ alert('Preencha todos os campos obrigatórios.'); return; }

  if(editingId){
    const it = items.find(x=>x.id===editingId);
    if(!it) return alert('Item não encontrado.');
    if(it.ownerId !== user.id){ alert('Somente o dono pode editar este conteúdo.'); return; }
    Object.assign(it,{title,genre,release,director,cast,ratingAge,platforms,image,synopsis});
  } else {
    const newItem = { id: uid('m'), ownerId: user.id, ownerName: user.username || user.name, title, genre, release, director, cast, ratingAge, platforms, image, synopsis, ratings:{}, comments:[], favorites:[], createdAt: new Date().toISOString() };
    items.unshift(newItem);
  }
  setItems(items);
  editingId = null;
  dom.formAddEdit.reset();
  dom.addTitle.textContent = 'Adicionar Novo Filme/Série';
  setActiveRoute('catalog');
  renderCatalog();
  renderProfile();
});
function openEdit(itemId){
  const user = getCurrentUser();
  if(!user){ openModal(dom.modalAuth); return; }
  const items = getItems(); const it = items.find(x=>x.id===itemId);
  if(!it) return alert('Item não encontrado.');
  if(it.ownerId !== user.id){ alert('Você não é o dono deste conteúdo.'); return; }
  editingId = it.id;
  dom.addTitle.textContent = 'Editar Item';
  dom.fieldName.value = it.title;
  dom.fieldGenre.value = it.genre;
  dom.fieldDate.value = it.release;
  dom.fieldDirector.value = it.director;
  dom.fieldCast.value = (it.cast||[]).join(', ');
  dom.fieldAge.value = it.ratingAge || '';
  dom.fieldPlatforms.value = (it.platforms||[]).join(', ');
  dom.fieldImage.value = it.image;
  dom.fieldSynopsis.value = it.synopsis;
  setActiveRoute('add');
}
dom.btnCancelAdd.addEventListener('click', ()=> { editingId = null; dom.formAddEdit.reset(); dom.addTitle.textContent = 'Adicionar Novo Filme/Série'; setActiveRoute('catalog'); });

let deleteTargetId = null;
function confirmDelete(itemId){
  const it = getItems().find(x=>x.id===itemId);
  if(!it) return alert('Item não encontrado.');
  const user = getCurrentUser();
  if(!user || it.ownerId !== user.id){ alert('Somente o dono pode excluir este conteúdo.'); return; }
  deleteTargetId = itemId;
  dom.confirmText.textContent = `Tem certeza que deseja excluir "${it.title}"?`;
  openModal(dom.modalConfirm);
}
dom.confirmYes.addEventListener('click', ()=> {
  if(!deleteTargetId) return closeModal(dom.modalConfirm);
  let items = getItems();
  items = items.filter(i=>i.id!==deleteTargetId);
  setItems(items);
  deleteTargetId = null; closeModal(dom.modalConfirm);
  renderCatalog(); renderProfile(); renderFavorites();
});
dom.confirmNo.addEventListener('click', ()=> { deleteTargetId = null; closeModal(dom.modalConfirm); });

// Search & helpers
dom.searchInput && dom.searchInput.addEventListener('input', ()=> renderCatalog());
dom.filterSort && dom.filterSort.addEventListener('change', ()=> renderCatalog());

function fallbackImage(){ return 'https://via.placeholder.com/500x750.png?text=Imagem+Indispon%C3%ADvel'; }

// Favorites
function isFavorited(item){
  const cur = getCurrentUser();
  if(!cur) return false;
  return (item.favorites || []).includes(cur.id);
}
function toggleFavorite(itemId){
  const cur = getCurrentUser();
  if(!cur){ openModal(dom.modalAuth); return; }
  const items = getItems();
  const it = items.find(x=>x.id===itemId);
  if(!it) return;
  it.favorites = it.favorites || [];
  const idx = it.favorites.indexOf(cur.id);
  if(idx === -1) it.favorites.push(cur.id); else it.favorites.splice(idx,1);
  setItems(items);
  // sync user's favorites array
  const users = getUsers();
  const u = users.find(x=>x.id===cur.id);
  if(u){
    u.favorites = u.favorites || [];
    if(idx === -1 && !u.favorites.includes(itemId)) u.favorites.push(itemId);
    if(idx !== -1){ const r = u.favorites.indexOf(itemId); if(r !== -1) u.favorites.splice(r,1); }
    setUsers(users);
  }
}

// Render favorites
function renderFavorites(){
  dom.favoritesGrid.innerHTML = '';
  const cur = getCurrentUser();
  if(!cur){ dom.favoritesGrid.innerHTML = `<div class="card"><div style="padding:18px;color:#ddd">Faça login para ver seus favoritos.</div></div>`; return; }
  const items = getItems().filter(i => (i.favorites||[]).includes(cur.id));
  if(items.length === 0){ dom.favoritesGrid.innerHTML = `<div class="card"><div style="padding:18px;color:#ddd">Você ainda não favoritou nenhum filme.</div></div>`; return; }
  items.forEach(it => dom.favoritesGrid.appendChild(renderCard(it)));
}

// Ranking
function renderRanking(){
  dom.rankingGrid.innerHTML = '';
  let items = getItems().slice();
  items.sort((a,b)=> buildAvgRating(b) - buildAvgRating(a));
  items.slice(0,12).forEach(it => dom.rankingGrid.appendChild(renderCard(it)));
}

// Profile
function renderProfile(){
  const cur = getCurrentUser();
  if(!cur){
    dom.profileName.textContent = '-';
    dom.profileEmail.textContent = '-';
    dom.userContents.innerHTML = `<div class="card"><div style="padding:18px;color:#ddd">Faça login para ver seus conteúdos.</div></div>`;
    dom.userFavs.innerHTML = '';
    return;
  }
  dom.profileName.textContent = cur.name || cur.username;
  dom.profileEmail.textContent = cur.email || '-';

  const userItems = getItems().filter(it => it.ownerId === cur.id);
  dom.userContents.innerHTML = '';
  if(userItems.length === 0) dom.userContents.innerHTML = '<div class="card"><div style="padding:18px;color:#ddd">Você ainda não criou itens.</div></div>';
  userItems.forEach(it => {
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `<div class="card-media"><img src="${it.image || fallbackImage()}" onerror="this.src='${fallbackImage()}'"></div>
      <div class="card-body"><h3>${escapeHtml(it.title)}</h3><div class="meta">${escapeHtml(it.genre)}</div>
      <div style="margin-top:8px;display:flex;gap:8px"><button class="btn small" data-id="${it.id}" data-act="view">Ver</button>
      <button class="btn small ghost" data-id="${it.id}" data-act="edit">Editar</button>
      <button class="btn small ghost" data-id="${it.id}" data-act="del">Excluir</button></div></div>`;
    el.querySelector('[data-act="view"]').addEventListener('click', ()=> openDetails(it.id));
    el.querySelector('[data-act="edit"]').addEventListener('click', ()=> openEdit(it.id));
    el.querySelector('[data-act="del"]').addEventListener('click', ()=> confirmDelete(it.id));
    dom.userContents.appendChild(el);
  });

  const favs = getItems().filter(i => (i.favorites||[]).includes(cur.id));
  dom.userFavs.innerHTML = '';
  if(favs.length === 0) dom.userFavs.innerHTML = '<div class="card"><div style="padding:18px;color:#ddd">Nenhum favorito ainda.</div></div>';
  favs.forEach(it => dom.userFavs.appendChild(renderCard(it)));
}

// Confirm delete flow already wired above

// Theme
function applyTheme(){
  const t = getTheme();
  if(t === 'light'){ document.documentElement.style.setProperty('--bg','#f5f6fa'); document.body.style.background = '#f5f6fa'; dom.themeToggle.textContent = 'Dark'; }
  else { document.body.style.background = 'radial-gradient(circle at 10% 10%, #25003a, #0c0016 60%)'; dom.themeToggle.textContent = 'Light'; }
}
dom.themeToggle.addEventListener('click', ()=> {
  const cur = getTheme();
  const next = cur === 'dark' ? 'light' : 'dark';
  setTheme(next); applyTheme();
});

// Confirm modal close on click outside
document.addEventListener('click', (ev) => {
  if(ev.target === dom.modalAuth) closeModal(dom.modalAuth);
  if(ev.target === dom.modalDetails) closeModal(dom.modalDetails);
  if(ev.target === dom.modalConfirm) closeModal(dom.modalConfirm);
});

// Misc helpers: confirm UI opened by confirmDelete click already
function confirm(text, yesCallback){
  dom.confirmText.textContent = text;
  openModal(dom.modalConfirm);
  const yes = () => { closeModal(dom.modalConfirm); dom.confirmYes.removeEventListener('click', yes); dom.confirmNo.removeEventListener('click', no); yesCallback(); };
  const no = () => { closeModal(dom.modalConfirm); dom.confirmYes.removeEventListener('click', yes); dom.confirmNo.removeEventListener('click', no); };
  dom.confirmYes.addEventListener('click', yes);
  dom.confirmNo.addEventListener('click', no);
}

// Initialization
function init(){
  refreshAuthUI();
  applyTheme();
  renderCatalog();
  renderHeroSlider();
  renderHomeHighlights();
  renderProfile();
  startSlider();

  // bind quick add CTA: open add page only if logged
  dom.ctaAddQuick.addEventListener('click', ()=> {
    const cur = getCurrentUser();
    if(!cur){ openModal(dom.modalAuth); } else setActiveRoute('add');
  });

  // global event delegation for catalog buttons (to ensure handlers if needed)
  document.body.addEventListener('click', (e) => {
    if(e.target.matches('[data-action="view"]')) openDetails(e.target.dataset.id);
  });
}
document.addEventListener('DOMContentLoaded', init);
