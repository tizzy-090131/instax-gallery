const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const scanBtn = document.getElementById('scanBtn');
const wrap = document.getElementById('polaroidWrap');
const tags = document.querySelectorAll('.category-bar .tag');

const libModal = document.getElementById('libModal');
const inviteModal = document.getElementById('inviteModal');
const closeModal = document.getElementById('closeModal');
const closeInviteModal = document.getElementById('closeInviteModal');
const libListBtn = document.getElementById('libListBtn');

const currentLibNameDom = document.getElementById('currentLibName');
const libTypeBadge = document.getElementById('libTypeBadge');
const libListDom = document.getElementById('libListDom');

const newLibNameInput = document.getElementById('newLibName');
const createLibBtn = document.getElementById('createLibBtn');
const inviteCodeInput = document.getElementById('inviteCodeInput');
const joinLibBtn = document.getElementById('joinLibBtn');
const inviteCodeShow = document.getElementById('inviteCodeShow');
const copyCodeBtn = document.getElementById('copyCodeBtn');

const tabBtns = document.querySelectorAll('.tab-btn');
const panelList = document.getElementById('panel-list');
const panelNew = document.getElementById('panel-new');
const panelJoin = document.getElementById('panel-join');

let currentType = '全部';
let activeLibId = null;

// ---------- 本地数据 ----------
function getDB() {
  const raw = localStorage.getItem("instaxDB");
  return raw ? JSON.parse(raw) : initDB();
}
function saveDB(db) {
  localStorage.setItem("instaxDB", JSON.stringify(db));
}
function initDB() {
  const db = { libs: {}, photos: {} };
  const defaultId = genId();
  db.libs[defaultId] = {
    id: defaultId,
    name: "默认图库",
    scope: "public",
    owner: true,
    invite: null
  };
  db.photos[defaultId] = [];
  saveDB(db);
  return db;
}
function genId() { return crypto.randomUUID(); }
function genInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ---------- 分类筛选 ----------
tags.forEach(tag => {
  tag.onclick = () => {
    tags.forEach(t => t.classList.remove('active'));
    tag.classList.add('active');
    currentType = tag.innerText.trim();
    renderPhotos();
  };
});

// ---------- 上传 ----------
uploadBtn.onclick = () => fileInput.click();
fileInput.onchange = (e) => {
  const db = getDB();
  const files = e.target.files;
  if (!activeLibId) return;
  for (let f of files) {
    const url = URL.createObjectURL(f);
    db.photos[activeLibId].push({
      id: genId(),
      src: url,
      type: currentType === '全部' ? 'mini' : currentType
    });
  }
  saveDB(db);
  fileInput.value = '';
  renderPhotos();
};
scanBtn.onclick = () => alert("摄像头扫描功能后续对接");

// ---------- 弹窗标签页 ----------
tabBtns.forEach(btn => {
  btn.onclick = () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    panelList.classList.toggle('hidden', tab !== 'list');
    panelNew.classList.toggle('hidden', tab !== 'new');
    panelJoin.classList.toggle('hidden', tab !== 'join');
  };
});

libListBtn.onclick = () => {
  libModal.classList.remove('hidden');
  renderLibList();
};
closeModal.onclick = () => libModal.classList.add('hidden');
closeInviteModal.onclick = () => inviteModal.classList.add('hidden');

// ---------- 新建图库 ----------
createLibBtn.onclick = () => {
  const db = getDB();
  const name = newLibNameInput.value.trim();
  if (!name) { alert("图库名字不能为空"); return; }
  const scope = document.querySelector('input[name="libScope"]:checked').value;
  const lid = genId();
  db.libs[lid] = {
    id: lid,
    name,
    scope,
    owner: true,
    invite: scope === 'private' ? genInviteCode() : null
  };
  db.photos[lid] = [];
  saveDB(db);
  newLibNameInput.value = "";
  renderLibList();
};

// ---------- 邀请码加入 ----------
joinLibBtn.onclick = () => {
  const db = getDB();
  const code = inviteCodeInput.value.trim();
  const match = Object.values(db.libs).find(l => l.scope === 'private' && l.invite === code);
  if (!match) { alert("邀请码无效"); return; }
  db.libs[match.id].owner = true;
  saveDB(db);
  inviteCodeInput.value = "";
  renderLibList();
  alert("成功加入图库：" + match.name);
};

// ---------- 渲染图库列表：全部可删除 ----------
function renderLibList() {
  const db = getDB();
  libListDom.innerHTML = "";
  Object.values(db.libs).forEach(lib => {
    const div = document.createElement("div");
    div.className = "lib-item";
    div.innerHTML = `
      <div>
        <div>${lib.name}</div>
        <div style="font-size:12px;color:#666">${lib.scope === 'public' ? "公开" : "私密"}</div>
      </div>
      <div class="lib-actions">
        <button class="glass-btn lib-switch" data-id="${lib.id}">切换</button>
        ${lib.scope === 'private' && lib.owner ? `<button class="glass-btn show-code" data-code="${lib.invite}">邀请码</button>` : ""}
        <button class="glass-btn danger lib-del" data-id="${lib.id}">删除</button>
      </div>
    `;
    libListDom.appendChild(div);
  });

  document.querySelectorAll('.lib-switch').forEach(btn => {
    btn.onclick = () => {
      activeLibId = btn.dataset.id;
      libModal.classList.add('hidden');
      renderHeader();
      renderPhotos();
    };
  });

  document.querySelectorAll('.show-code').forEach(btn => {
    btn.onclick = () => {
      inviteCodeShow.innerText = btn.dataset.code;
      inviteModal.classList.remove('hidden');
    };
  });

  document.querySelectorAll('.lib-del').forEach(btn => {
    btn.onclick = () => deleteLib(btn.dataset.id);
  });
}

// ---------- 删除图库 ----------
function deleteLib(libId) {
  const db = getDB();
  const lib = db.libs[libId];
  if (!lib) return;
  const photoCount = (db.photos[libId] || []).length;
  const tip = photoCount > 0
    ? `确定删除图库「${lib.name}」吗？里面 ${photoCount} 张照片会一起删掉，无法恢复。`
    : `确定删除图库「${lib.name}」吗？`;
  if (!confirm(tip)) return;

  delete db.libs[libId];
  delete db.photos[libId];

  const remainingIds = Object.keys(db.libs);
  if (remainingIds.length === 0) {
    const newDefaultId = genId();
    db.libs[newDefaultId] = {
      id: newDefaultId,
      name: "默认图库",
      scope: "public",
      owner: true,
      invite: null
    };
    db.photos[newDefaultId] = [];
    activeLibId = newDefaultId;
  } else {
    if (activeLibId === libId) {
      activeLibId = remainingIds[0];
    }
  }
  saveDB(db);
  renderLibList();
  renderHeader();
  renderPhotos();
}

// ---------- 删除单张照片 ----------
function deletePhoto(photoId) {
  const db = getDB();
  if (!activeLibId) return;
  db.photos[activeLibId] = db.photos[activeLibId].filter(p => p.id !== photoId);
  saveDB(db);
  renderPhotos();
}

// ---------- 渲染照片 ----------
function renderPhotos() {
  const db = getDB();
  wrap.innerHTML = "";
  if (!activeLibId) return;
  let list = db.photos[activeLibId];
  if (currentType !== "全部") list = list.filter(p => p.type === currentType);
  if (list.length === 0) {
    wrap.innerHTML = '<div class="empty-tip">还没有照片，点「上传图片」添加吧～</div>';
    return;
  }
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'polaroid-card';
    card.innerHTML = `
      <button class="photo-del" data-pid="${p.id}">×</button>
      <img src="${p.src}">
      <div class="type-label">${p.type}</div>
    `;
    wrap.appendChild(card);
  });
  document.querySelectorAll('.photo-del').forEach(btn => {
    btn.onclick = () => {
      if (confirm("确定删除这张拍立得？")) deletePhoto(btn.dataset.pid);
    };
  });
}

function renderHeader() {
  const db = getDB();
  const lib = db.libs[activeLibId];
  if (!lib) return;
  currentLibNameDom.innerText = lib.name;
  libTypeBadge.innerText = lib.scope === "public" ? "公开" : "私密";
  libTypeBadge.className = "badge " + lib.scope;
}

copyCodeBtn.onclick = async () => {
  const c = inviteCodeShow.innerText;
  await navigator.clipboard.writeText(c);
  alert("邀请码已复制");
};

// 初始化
(function boot() {
  const db = getDB();
  activeLibId = Object.keys(db.libs)[0];
  renderHeader();
  renderPhotos();
})();
