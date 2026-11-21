const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const scanBtn = document.getElementById('scanBtn');
const wrap = document.getElementById('polaroidWrap');
const tags = document.querySelectorAll('.category-bar .tag');

let currentType = '全部';
const cards = []; // 存 { el, type }

// 标签切换
tags.forEach(tag => {
  tag.onclick = () => {
    tags.forEach(t => t.classList.remove('active'));
    tag.classList.add('active');
    currentType = tag.innerText.trim();
    render();
  };
});

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
  const files = e.target.files;
  for (let f of files) {
    const url = URL.createObjectURL(f);
    const card = document.createElement('div');
    card.className = 'polaroid-card';
    card.dataset.type = currentType === '全部' ? 'mini' : currentType;
    card.innerHTML = `
      <img src="${url}">
      <div class="type-label">${card.dataset.type}</div>
    `;
    cards.push({ el: card, type: card.dataset.type });
  }
  fileInput.value = '';
  render();
};

scanBtn.onclick = () => alert('扫描功能后续对接摄像头，现在先占位');

function render() {
  wrap.innerHTML = '';
  const list = currentType === '全部'
    ? cards
    : cards.filter(c => c.type === currentType);

  if (list.length === 0) {
    wrap.innerHTML = '<div class="empty-tip">还没有照片，点「上传图片」添加吧～</div>';
    return;
  }
  list.forEach(c => wrap.appendChild(c.el));
}

render();
