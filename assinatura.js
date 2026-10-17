/* ===== Assinatura (visto) – compartilhada pelo recibo e pela declaração =====
   Desenhe com o dedo/mouse ou envie uma imagem. Fica salva neste aparelho. */
(function () {
  const CHAVE = "podosaude_assinatura";
  const cv = document.getElementById("assin-canvas");
  const ctx = cv.getContext("2d");
  const imgDoc = document.getElementById("d-assinatura");
  let desenhando = false, temTraco = false;

  function pincel() {
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a2b6d";
  }
  pincel();

  function mostrar(url) {
    if (url) { imgDoc.src = url; imgDoc.style.display = ""; }
    else { imgDoc.removeAttribute("src"); imgDoc.style.display = "none"; }
  }
  function salvar() {
    const url = temTraco ? cv.toDataURL("image/png") : "";
    try { url ? localStorage.setItem(CHAVE, url) : localStorage.removeItem(CHAVE); } catch (e) {}
    mostrar(url);
  }
  function ponto(e) {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height };
  }

  /* Desenho com dedo ou mouse */
  cv.addEventListener("pointerdown", e => {
    desenhando = true;
    cv.setPointerCapture(e.pointerId);
    const p = ponto(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();
    temTraco = true;
  });
  cv.addEventListener("pointermove", e => {
    if (!desenhando) return;
    const p = ponto(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
  ["pointerup", "pointercancel"].forEach(ev => cv.addEventListener(ev, () => {
    if (desenhando) { desenhando = false; salvar(); }
  }));

  /* Limpar */
  document.getElementById("assin-limpar").addEventListener("click", () => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    temTraco = false;
    salvar();
  });

  /* Desenha uma imagem no quadro, centralizada */
  function desenharImagem(src, depois) {
    const im = new Image();
    im.onload = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const esc = Math.min(cv.width / im.width, cv.height / im.height);
      const w = im.width * esc, h = im.height * esc;
      ctx.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
      pincel();
      temTraco = true;
      if (depois) depois();
    };
    im.src = src;
  }

  /* Enviar foto/imagem da assinatura */
  document.getElementById("assin-arquivo").addEventListener("change", e => {
    const arq = e.target.files[0];
    if (!arq) return;
    const leitor = new FileReader();
    leitor.onload = () => desenharImagem(leitor.result, salvar);
    leitor.readAsDataURL(arq);
    e.target.value = "";
  });

  /* Carrega a assinatura salva */
  let salva = "";
  try { salva = localStorage.getItem(CHAVE) || ""; } catch (e) {}
  if (salva) { desenharImagem(salva); mostrar(salva); } else { mostrar(""); }
})();
