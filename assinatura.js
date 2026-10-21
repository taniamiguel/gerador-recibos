/* ===== Assinatura (visto) – compartilhada pelo recibo e pela declaração =====
   1) Se existir o arquivo "assinatura.png" no site, ele é a assinatura padrão
      e aparece para TODOS que acessarem o link.
   2) Quem desenhar ou enviar outra assinatura no quadro substitui a padrão
      apenas no próprio aparelho.                                              */
(function () {
  const CHAVE = "podosaude_assinatura";
  const PADRAO = "assinatura.png";
  const cv = document.getElementById("assin-canvas");
  const ctx = cv.getContext("2d");
  const imgDoc = document.getElementById("d-assinatura");
  const dica = document.getElementById("assin-dica");
  let desenhando = false, temTraco = false, temPadrao = false;

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
  /* Mostra a assinatura padrão (do site) no quadro e no documento */
  function usarPadrao() {
    if (temPadrao) {
      cv.style.background = `#fff url(${PADRAO}) center / contain no-repeat`;
      mostrar(PADRAO);
      dica.textContent = "Assinatura padrão da clínica. Para usar outra só neste aparelho, desenhe por cima ou envie uma imagem.";
    } else {
      cv.style.background = "#fff";
      mostrar("");
      dica.textContent = "Assine com o dedo ou o mouse. Fica salva neste aparelho.";
    }
  }
  function salvar() {
    let url = "";
    if (temTraco) { try { url = cv.toDataURL("image/png"); } catch (e) {} }
    try { url ? localStorage.setItem(CHAVE, url) : localStorage.removeItem(CHAVE); } catch (e) {}
    if (url) { cv.style.background = "#fff"; mostrar(url); dica.textContent = "Assinatura salva neste aparelho."; }
    else usarPadrao();
  }
  function ponto(e) {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height };
  }

  /* Desenho com dedo ou mouse */
  cv.addEventListener("pointerdown", e => {
    desenhando = true;
    cv.setPointerCapture(e.pointerId);
    cv.style.background = "#fff";
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

  /* Limpar: apaga a assinatura deste aparelho (volta para a padrão, se houver) */
  document.getElementById("assin-limpar").addEventListener("click", () => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    temTraco = false;
    salvar();
  });

  /* Baixar a assinatura como imagem (para virar a assinatura padrão do site) */
  document.getElementById("assin-baixar").addEventListener("click", () => {
    const url = temTraco ? (() => { try { return cv.toDataURL("image/png"); } catch (e) { return ""; } })()
                         : (temPadrao ? PADRAO : "");
    if (!url) { alertaSuave("Desenhe a assinatura primeiro."); return; }
    const a = document.createElement("a");
    a.href = url;
    a.download = "assinatura.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  function alertaSuave(msg) {
    const antes = dica.textContent;
    dica.textContent = msg;
    setTimeout(() => dica.textContent = antes, 2500);
  }

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
  document.getElementById("assin-enviar").addEventListener("click", () => document.getElementById("assin-arquivo").click());
  document.getElementById("assin-arquivo").addEventListener("change", e => {
    const arq = e.target.files[0];
    if (!arq) return;
    const leitor = new FileReader();
    leitor.onload = () => desenharImagem(leitor.result, salvar);
    leitor.readAsDataURL(arq);
    e.target.value = "";
  });

  /* Início: assinatura deste aparelho > assinatura padrão do site > nenhuma */
  let salva = "";
  try { salva = localStorage.getItem(CHAVE) || ""; } catch (e) {}
  const teste = new Image();
  teste.onload = () => { temPadrao = true; if (!salva) usarPadrao(); };
  teste.onerror = () => { temPadrao = false; if (!salva) usarPadrao(); };
  teste.src = PADRAO + "?v=" + Date.now();
  if (salva) {
    desenharImagem(salva);
    mostrar(salva);
    dica.textContent = "Assinatura salva neste aparelho.";
  } else {
    usarPadrao();
  }
})();
