const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const scanBtn = document.getElementById('scanBtn');
const wrap = document.getElementById('polaroidWrap');

uploadBtn.onclick = ()=> fileInput.click();

fileInput.onchange = (e)=>{
  const files = e.target.files;
  for(let f of files){
    const url = URL.createObjectURL(f);
    const card = document.createElement('div');
    card.className = "polaroid-card";
    card.innerHTML = `<img src="${url}">`;
    wrap.appendChild(card);
  }
}

scanBtn.onclick = ()=>{
  alert("扫描功能后续对接摄像头，现在先占位");
}
