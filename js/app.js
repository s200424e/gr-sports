/* =========================================================
   GR SPORTS · comportamento da página
   Efeitos da biblioteca usados aqui:
   - Lenis + GSAP ScrollTrigger (rolagem suave, cena presa) — do projeto Revo
   - Cortina de abertura, títulos palavra por palavra, botões magnéticos,
     luz que segue o cursor, contadores — do projeto Revo
   - Rolagem com zoom (skill /rolagem-zoom) — quadro de horários
   - Cartão de vidro (skill /cartao-perfil-glass) — Instagram
   ========================================================= */
(function () {
  'use strict';

  var D = window.DADOS;
  var html = document.documentElement;
  var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ponteiroFino = matchMedia('(pointer: fine)').matches;
  html.classList.add('js');
  if (reduz) html.classList.add('sem-movimento');

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var limitar = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var mix = function (a, b, t) { return a + (b - a) * t; };
  var real = function (v) { return v.toLocaleString('pt-BR', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }); };

  var DIA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  var DIA_LONGO = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0];

  /* ---------- Hora de Brasília ---------- */
  function agora() {
    var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    var dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
    return { dia: dia, min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
  }
  var minutos = function (h) { var p = h.split(':'); return +p[0] * 60 + +p[1]; };

  /* ---------- Turmas ---------- */
  var MODS = D.modalidades;
  function turmasDoDia(dia, mod) {
    return D.turmas.filter(function (t) { return t.dias.indexOf(dia) > -1 && (!mod || mod === 'todas' || t.mod === mod); })
      .sort(function (a, b) { return minutos(a.hora) - minutos(b.hora) || a.mod.localeCompare(b.mod); });
  }
  var diasTxt = function (dias) { return dias.map(function (d) { return DIA_CURTO[d]; }).join(' e '); };
  var nomeNivel = function (n) { return D.niveis[n].nome; };
  var nomeMod = function (m) { return MODS[m].nome; };
  function profDe(t) { var p = D.professores.filter(function (x) { return x.id === t.prof; })[0]; return p && p.nome ? 'Prof. ' + p.nome : ''; }
  var totalSemana = D.turmas.reduce(function (s, t) { return s + t.dias.length; }, 0);

  function statusHoje(lista) {
    var a = agora(), dur = D.duracaoTurmaMin;
    var rolando = null, proxima = null;
    lista.forEach(function (t) {
      var ini = minutos(t.hora);
      if (a.min >= ini && a.min < ini + dur && !rolando) rolando = t;
      if (ini > a.min && !proxima) proxima = t;
    });
    return { rolando: rolando, proxima: proxima, min: a.min };
  }
  function proximoDiaComTurma(apos) {
    for (var i = 1; i <= 7; i++) { var d = (apos + i) % 7; var l = turmasDoDia(d); if (l.length) return { dia: d, turma: l[0], emDias: i }; }
    return null;
  }

  /* ---------- Contato: WhatsApp ou Direct do Instagram ---------- */
  var linkInsta = 'https://www.instagram.com/' + D.instagram + '/';
  var linkDirect = 'https://ig.me/m/' + D.instagram;
  function copiar(txt) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt);
    var t = document.createElement('textarea'); t.value = txt; t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } catch (e) { /* sem cópia */ }
    t.remove(); return Promise.resolve();
  }
  function enviar(msg) {
    if (D.whatsapp) {
      window.open('https://wa.me/' + D.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    } else {
      copiar(msg).then(function () { avisar('Mensagem copiada. Cole no Direct da GR Sports.'); }, function () { /* ignora */ });
      window.open(linkDirect, '_blank', 'noopener');
    }
  }
  var avisoTimer;
  function avisar(txt) {
    var a = $('#aviso'); a.textContent = txt; a.classList.add('mostra');
    clearTimeout(avisoTimer); avisoTimer = setTimeout(function () { a.classList.remove('mostra'); }, 3200);
  }

  /* =========================================================
     Rolagem suave (Lenis) + GSAP
     ========================================================= */
  var lenis = null;
  var temGsap = !!(window.gsap && window.ScrollTrigger);
  if (temGsap) gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && !reduz) {
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    if (temGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  function irPara(alvo) {
    var el = typeof alvo === 'string' ? document.getElementById(alvo) : alvo;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault(); irPara(id);
  });
  $$('[data-ir]').forEach(function (b) { b.addEventListener('click', function () { irPara(b.dataset.ir); }); });

  /* =========================================================
     Conteúdo gerado a partir de dados.js
     ========================================================= */
  // Modalidades
  (function () {
    var caixa = $('#listaModalidades');
    Object.keys(MODS).forEach(function (k) {
      var m = MODS[k];
      var niveis = [];
      D.turmas.forEach(function (t) { if (t.mod === k && niveis.indexOf(t.nivel) < 0) niveis.push(t.nivel); });
      var ordem = ['kids', 'iniciante', 'intermediario', 'personal'];
      niveis.sort(function (a, b) { return ordem.indexOf(a) - ordem.indexOf(b); });
      var minimo = Math.min.apply(null, m.planos.map(function (p) { return p.preco; }));
      var art = document.createElement('article');
      art.className = 'mod';
      art.innerHTML =
        '<div class="mod-luz"></div><div class="mod-fotos">' + m.fotos.map(function (f) { return '<figure><img src="img/feed/' + f + '.webp" alt="" loading="lazy"></figure>'; }).join('') + '</div>' +
        '<div class="mod-corpo"><h3 class="mod-nome">' + m.nome + '</h3><p class="mod-resumo">' + m.resumo + '</p>' +
        '<ul class="mod-niveis">' + niveis.map(function (n) { return '<li>' + nomeNivel(n) + '</li>'; }).join('') + '</ul>' +
        '<div class="mod-rodape"><p class="mod-preco">a partir de<b>R$ ' + real(minimo) + '/mês</b></p>' +
        '<button class="btn btn-amarelo magnetico" data-abrir="experimental" data-mod="' + k + '">Quero experimentar <svg><use href="#i-seta"/></svg></button></div></div>';
      caixa.appendChild(art);
      art.addEventListener('pointermove', function (e) {
        var r = art.getBoundingClientRect();
        art.style.setProperty('--mx', (e.clientX - r.left) + 'px'); art.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  })();

  // Destaques e galeria
  $('#destaques').innerHTML = D.destaques.map(function (d) {
    return '<article class="destaque"><img src="' + d.foto + '" alt="" loading="lazy"><div><h3>' + d.titulo + '</h3><p>' + d.texto + '</p></div></article>';
  }).join('');
  (function () {
    var linhas = $$('.galeria-linha'), metade = Math.ceil(D.galeria.length / 2);
    [D.galeria.slice(0, metade), D.galeria.slice(metade)].forEach(function (lista, i) {
      var fig = lista.map(function (n) { return '<figure><img src="img/feed/' + n + '.webp" alt="" loading="lazy" decoding="async"></figure>'; }).join('');
      linhas[i].innerHTML = fig + fig; // duplicado para o loop infinito
    });
  })();

  // Instagram (vidro)
  var milhar = function (n) { return n.toLocaleString('pt-BR'); };
  $('#igPosts').textContent = milhar(D.perfil.posts);
  $('#igSeg').textContent = milhar(D.perfil.seguidores);
  $('#igSeguindo').textContent = milhar(D.perfil.seguindo);
  $('#igSeguir').href = linkInsta; $('#igDirect').href = linkDirect; $('#barraInsta').href = linkInsta;
  $('[data-contar="8030"]').dataset.contar = D.perfil.seguidores;
  $('[data-contar="20"]').dataset.contar = totalSemana;
  $('#totalTreinos').textContent = totalSemana;

  // Local
  (function () {
    var e = D.endereco, q = encodeURIComponent(e.busca);
    $('#localEnd').innerHTML = e.linha1 + '<small>' + e.linha2 + ' · CEP ' + e.cep + '</small>';
    $('#rodapeEnd').textContent = e.linha1 + ' · ' + e.linha2;
    $('#localBotoes').innerHTML =
      '<a href="https://www.google.com/maps/search/?api=1&query=' + q + '" target="_blank" rel="noopener">Maps</a>' +
      '<a href="https://waze.com/ul?q=' + q + '&navigate=yes" target="_blank" rel="noopener">Waze</a>' +
      '<a href="https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff%5Bformatted_address%5D=' + q + '" target="_blank" rel="noopener">Uber</a>';
    // O mapa só carrega quando a seção chega perto da tela
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { $('#mapa').src = 'https://maps.google.com/maps?q=' + q + '&z=16&output=embed'; io.disconnect(); }
    }, { rootMargin: '600px' });
    io.observe($('#local'));
    $('#copiarEnd').addEventListener('click', function () {
      copiar(e.linha1 + ', ' + e.linha2 + ', CEP ' + e.cep).then(function () { avisar('Endereço copiado.'); });
    });
  })();

  // Perguntas (só com o que está nos posts)
  (function () {
    var kids = D.turmas.filter(function (t) { return t.nivel === 'kids'; })[0];
    var personal = D.turmas.filter(function (t) { return t.nivel === 'personal'; });
    var precos = Object.keys(MODS).map(function (k) {
      return MODS[k].nome + ': ' + MODS[k].planos.map(function (p) { return 'R$ ' + real(p.preco) + ' (' + p.vezes + 'x na semana)'; }).join(' ou ');
    }).join('. ');
    var faq = [
      ['Nunca joguei. Tem turma para mim?', 'Tem. A maior parte da grade é de turmas de iniciante, nas duas modalidades. Você aprende o fundamento do zero com o professor.'],
      ['Tem aula para criança?', kids ? 'Tem turma kids de ' + nomeMod(kids.mod).toLowerCase() + ' na ' + kids.dias.map(function (d) { return DIA_LONGO[d]; }).join(' e na ') + ', às ' + kids.hora + '.' : 'Pergunte pelo WhatsApp.'],
      ['Quanto custa?', precos + '. É uma mensalidade fixa.'],
      ['Como funciona o personal?', 'É o treino individual, com horários na ' + diasTxt(personal[0].dias).replace(/Seg/, 'segunda').replace(/Qua/, 'quarta') + ', às ' + personal.map(function (t) { return t.hora; }).join(' e às ') + '. O valor é combinado direto com a GR Sports.'],
      ['Posso treinar só uma vez por semana?', 'Pode. As duas modalidades têm plano de 1x por semana.'],
      ['Onde fica?', D.endereco.linha1 + ', ' + D.endereco.linha2 + '. Os botões de Maps, Waze e Uber estão logo acima.'],
    ];
    $('#faq').innerHTML = faq.map(function (f) { return '<details><summary>' + f[0] + '</summary><p class="resp">' + f[1] + '</p></details>'; }).join('');
    $$('#faq details').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) $$('#faq details').forEach(function (o) { if (o !== d) o.open = false; });
        if (temGsap) ScrollTrigger.refresh();
      });
    });
  })();

  /* =========================================================
     Chip "hoje" no hero
     ========================================================= */
  function atualizarHoje() {
    var a = agora(), lista = turmasDoDia(a.dia), el = $('#hojeTexto');
    if (lista.length) {
      var s = statusHoje(lista);
      if (s.rolando) el.innerHTML = 'Agora na areia: <b>' + s.rolando.hora + ' ' + nomeNivel(s.rolando.nivel) + '</b> de ' + nomeMod(s.rolando.mod).toLowerCase() + (s.proxima ? '. Próxima às <b>' + s.proxima.hora + '</b>' : '');
      else if (s.proxima) el.innerHTML = 'Hoje tem <b>' + lista.length + ' turmas</b>. A próxima é às <b>' + s.proxima.hora + '</b>, ' + nomeNivel(s.proxima.nivel).toLowerCase() + ' de ' + nomeMod(s.proxima.mod).toLowerCase();
      else { var p = proximoDiaComTurma(a.dia); el.innerHTML = 'Os treinos de hoje acabaram. Próximo: <b>' + (p.emDias === 1 ? 'amanhã' : DIA_LONGO[p.dia]) + ' às ' + p.turma.hora + '</b>'; }
    } else {
      var px = proximoDiaComTurma(a.dia);
      el.innerHTML = 'Hoje não tem turma fixa. Próximo treino: <b>' + (px.emDias === 1 ? 'amanhã' : DIA_LONGO[px.dia]) + ' às ' + px.turma.hora + '</b>';
    }
  }
  atualizarHoje();

  /* =========================================================
     Stories com os cartazes da semana
     ========================================================= */
  (function () {
    var trilho = $('#storyTrilho'), barras = $('#storyBarras'), story = $('#story');
    var lista = D.professores;
    trilho.innerHTML = lista.map(function (p, i) { return '<img src="' + p.story + '" alt="Story: ' + p.dias + ', turmas de ' + nomeMod(p.modalidade).toLowerCase() + '"' + (i ? ' loading="lazy"' : '') + '>'; }).join('');
    barras.innerHTML = lista.map(function () { return '<span><i></i></span>'; }).join('');
    var imgs = $$('img', trilho), fills = $$('i', barras);
    var atual = 0, inicio = 0, pausado = false, decorrido = 0, DUR = 5200;
    function mostrar(i) {
      atual = (i + lista.length) % lista.length; decorrido = 0; inicio = performance.now();
      imgs.forEach(function (im, k) { im.classList.toggle('ativo', k === atual); });
      fills.forEach(function (f, k) { f.style.transform = 'scaleX(' + (k < atual ? 1 : 0) + ')'; });
      $('#storyCta').textContent = 'Quero treinar ' + lista[atual].dias.toLowerCase().replace(' e ', ' e ');
    }
    function quadro(t) {
      if (!pausado && !document.hidden) {
        decorrido += Math.min(64, t - inicio);
        fills[atual].style.transform = 'scaleX(' + limitar(decorrido / DUR, 0, 1) + ')';
        if (decorrido >= DUR) mostrar(atual + 1);
      }
      inicio = t;
      requestAnimationFrame(quadro);
    }
    mostrar(0);
    if (!reduz) requestAnimationFrame(function (t) { inicio = t; quadro(t); });
    $('.story-voltar').addEventListener('click', function () { mostrar(atual - 1); });
    $('.story-avancar').addEventListener('click', function () { mostrar(atual + 1); });
    story.addEventListener('pointerenter', function () { pausado = true; });
    story.addEventListener('pointerleave', function () { pausado = false; });
    $('#storyCta').addEventListener('click', function () { abrirFolha({ mod: lista[atual].modalidade }); });
  })();

  /* =========================================================
     Quadro de horários
     ========================================================= */
  var estadoQuadro = { dia: agora().dia, mod: 'todas' };
  function linhaTurma(t, i, extra) {
    var prof = profDe(t);
    return '<li class="turma ' + (extra || '') + '" style="--i:' + i + '">' +
      '<span class="turma-hora">' + t.hora + '</span>' +
      '<span class="turma-nivel"><b>' + nomeNivel(t.nivel) + (extra === 'agora' ? '<span class="turma-tag">agora</span>' : extra === 'proxima' ? '<span class="turma-tag">próxima</span>' : '') + '</b><small>' + nomeMod(t.mod) + (prof ? ' · ' + prof : '') + '</small></span>' +
      '<button class="turma-btn" data-turma="' + D.turmas.indexOf(t) + '" aria-label="Quero a turma das ' + t.hora + '"><span>Quero</span><svg><use href="#i-seta"/></svg></button></li>';
  }
  function desenharDias() {
    var hoje = agora().dia;
    $('#dias').innerHTML = ORDEM_DIAS.map(function (d) {
      var n = turmasDoDia(d, estadoQuadro.mod).length;
      return '<button class="dia' + (d === hoje ? ' hoje' : '') + (n ? '' : ' vazio') + '" role="tab" aria-selected="' + (d === estadoQuadro.dia) + '" data-dia="' + d + '"><b>' + DIA_CURTO[d] + '</b><small>' + (n ? n + (n > 1 ? ' turmas' : ' turma') : 'livre') + '</small></button>';
    }).join('');
  }
  function desenharTurmas() {
    var lista = turmasDoDia(estadoQuadro.dia, estadoQuadro.mod), hoje = agora().dia, st = $('#quadroStatus'), ol = $('#turmas');
    if (!lista.length) {
      var p = proximoDiaComTurma(estadoQuadro.dia);
      st.innerHTML = '';
      ol.innerHTML = '<li class="turmas-vazio"><b>Sem turma fixa</b>Na grade divulgada não tem turma ' + (estadoQuadro.mod === 'todas' ? '' : 'de ' + nomeMod(estadoQuadro.mod).toLowerCase() + ' ') + 'nesse dia. Quer saber de jogo livre ou personal? Chama a GR Sports.' + (p ? ' Próxima turma: <strong>' + DIA_LONGO[p.dia] + ' às ' + p.turma.hora + '</strong>.' : '') + '</li>';
      return;
    }
    var s = estadoQuadro.dia === hoje ? statusHoje(lista) : null;
    if (s) st.innerHTML = s.rolando ? '<b>●</b> Tem treino rolando agora' : s.proxima ? 'Hoje · próxima turma às <b>' + s.proxima.hora + '</b>' : 'Os treinos de hoje já acabaram';
    else st.textContent = DIA_LONGO[estadoQuadro.dia].replace(/^./, function (c) { return c.toUpperCase(); }) + ' · ' + lista.length + (lista.length > 1 ? ' turmas' : ' turma');
    ol.innerHTML = lista.map(function (t, i) {
      var ex = '';
      if (s) { var ini = minutos(t.hora); if (t === s.rolando) ex = 'agora'; else if (t === s.proxima) ex = 'proxima'; else if (ini + D.duracaoTurmaMin <= s.min) ex = 'passou'; }
      return linhaTurma(t, i, ex);
    }).join('');
  }
  // Tela grande: a semana inteira em colunas, como um cartaz
  var telaGrande = matchMedia('(min-width: 960px)');
  function desenharSemana() {
    var a = agora(), cols = $('#semana');
    cols.innerHTML = ORDEM_DIAS.map(function (d) {
      var lista = turmasDoDia(d, estadoQuadro.mod), s = d === a.dia ? statusHoje(lista) : null;
      return '<div class="col' + (d === a.dia ? ' hoje' : '') + (lista.length ? '' : ' vazia') + '"><h4>' + DIA_CURTO[d] + (d === a.dia ? '<span>hoje</span>' : '') + '</h4>' +
        (lista.length ? lista.map(function (t, i) {
          var ini = minutos(t.hora), ex = '';
          if (s) { if (t === s.rolando) ex = ' agora'; else if (t === s.proxima) ex = ' proxima'; else if (ini + D.duracaoTurmaMin <= s.min) ex = ' passou'; }
          return '<button class="cel' + ex + ' m-' + t.mod + '" style="--i:' + i + '" data-turma="' + D.turmas.indexOf(t) + '"><b>' + t.hora + '</b><span>' + nomeNivel(t.nivel) + '</span><small>' + nomeMod(t.mod) + '</small></button>';
        }).join('') : '<p class="col-livre">Sem turma fixa</p>') + '</div>';
    }).join('');
  }
  function desenharQuadro() {
    var grande = telaGrande.matches;
    $('#quadro').classList.toggle('semana-toda', grande);
    if (grande) { desenharSemana(); var hoje = turmasDoDia(agora().dia, estadoQuadro.mod), s = statusHoje(hoje); $('#quadroStatus').innerHTML = hoje.length ? (s.rolando ? '<b>●</b> Tem treino rolando agora' : s.proxima ? 'Hoje · próxima turma às <b>' + s.proxima.hora + '</b>' : 'Os treinos de hoje já acabaram. Clique numa turma para reservar a sua vaga.') : 'Clique numa turma para pedir a sua vaga.'; }
    else { desenharDias(); desenharTurmas(); }
  }
  if (telaGrande.addEventListener) telaGrande.addEventListener('change', desenharQuadro);
  desenharQuadro();
  $('#dias').addEventListener('click', function (e) {
    var b = e.target.closest('.dia'); if (!b) return;
    estadoQuadro.dia = +b.dataset.dia; desenharDias(); desenharTurmas();
  });
  $('#filtros').addEventListener('click', function (e) {
    var b = e.target.closest('.filtro'); if (!b) return;
    $$('.filtro').forEach(function (f) { f.classList.toggle('ativo', f === b); });
    estadoQuadro.mod = b.dataset.mod; desenharQuadro();
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-turma]'); if (!b) return;
    var t = D.turmas[+b.dataset.turma];
    abrirFolha({ mod: t.mod, nivel: t.nivel === 'kids' ? 'kids' : t.nivel === 'personal' ? 'personal' : t.nivel === 'intermediario' ? 'bem' : 'nunca', turma: +b.dataset.turma });
  });
  setInterval(function () { atualizarHoje(); desenharQuadro(); }, 60000);

  /* ---------- Rolagem com zoom (skill /rolagem-zoom) ---------- */
  (function () {
    var intro = $('.horarios-intro'), conteudo = $('#horariosConteudo'), palco = $('#palcoZoom'), slot = $('#slot');
    var raiz = html.style, m, atualT = 0, pedido = 0;
    function cfg() {
      return innerWidth < 720
        ? { escalaInicial: .82, escalaFinal: 1, rotacaoInicial: 4, sobreposicao: .2, folga: 28, inicio: .2, fimExtra: .3 }
        : { escalaInicial: .55, escalaFinal: 1, rotacaoInicial: 5, sobreposicao: .3, folga: 40, inicio: .2, fimExtra: .35 };
    }
    function medir() {
      var C = cfg();
      var heroTopo = intro.offsetTop, heroAltura = intro.offsetHeight, heroBase = heroTopo + heroAltura;
      var slotTopo = palco.offsetTop + slot.offsetTop, slotAltura = slot.offsetHeight;
      var alvo = heroBase - slotAltura * C.escalaInicial * C.sobreposicao;
      var ultimo = conteudo.lastElementChild;
      var base = heroTopo + conteudo.offsetTop + ultimo.offsetTop + ultimo.offsetHeight;
      alvo = Math.max(alvo, base + C.folga);
      m = { C: C, yInicial: Math.min(alvo - slotTopo, 0), ini: heroTopo + heroAltura * C.inicio, fim: heroBase + innerHeight * C.fimExtra };
    }
    function aplicar(t) {
      var C = m.C;
      raiz.setProperty('--zoom-y', mix(m.yInicial, 0, t).toFixed(2) + 'px');
      raiz.setProperty('--zoom-scale', mix(C.escalaInicial, C.escalaFinal, t).toFixed(4));
      raiz.setProperty('--zoom-rot', mix(C.rotacaoInicial, 0, t).toFixed(3) + 'deg');
    }
    var alvoAtual = function () { return limitar((scrollY - m.ini) / (m.fim - m.ini), 0, 1); };
    var suav = (lenis || reduz) ? 1 : .14;
    function passo() {
      pedido = 0;
      var a = alvoAtual(); atualT += (a - atualT) * suav;
      if (Math.abs(a - atualT) < .0005) atualT = a;
      aplicar(atualT);
      if (atualT !== a) pedido = requestAnimationFrame(passo);
    }
    addEventListener('scroll', function () { pedido = pedido || requestAnimationFrame(passo); }, { passive: true });
    addEventListener('resize', function () { medir(); atualT = alvoAtual(); aplicar(atualT); });
    medir(); atualT = alvoAtual(); aplicar(atualT);
    addEventListener('load', function () { medir(); aplicar(atualT = alvoAtual()); });
  })();

  /* =========================================================
     Planos: calculadora
     ========================================================= */
  var estadoPlano = { mod: 'futevolei', vezes: 2 };
  var valorMostrado = 160;
  function animarNumero(el, de, para) {
    if (reduz || de === para) { el.textContent = real(para); return; }
    var t0 = performance.now(), dur = 600;
    (function f(t) {
      var k = limitar((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(mix(de, para, e));
      if (k < 1) requestAnimationFrame(f); else el.textContent = real(para);
    })(t0);
  }
  function diasDaMod(mod) {
    var grupos = {};
    D.turmas.forEach(function (t) {
      if (t.mod !== mod || t.nivel === 'personal') return;
      var k = diasTxt(t.dias);
      (grupos[k] = grupos[k] || []).push(t.hora);
    });
    return Object.keys(grupos).map(function (k) {
      var hs = grupos[k].filter(function (h, i, a) { return a.indexOf(h) === i; }).sort();
      return k + ' · ' + hs.join(', ');
    });
  }
  function desenharPlano() {
    var m = MODS[estadoPlano.mod];
    var plano = m.planos.filter(function (p) { return p.vezes === estadoPlano.vezes; })[0];
    animarNumero($('#calcValor'), valorMostrado, plano.preco); valorMostrado = plano.preco;
    var porTreino = plano.preco / (plano.vezes * 4);
    var outro = m.planos.filter(function (p) { return p.vezes !== plano.vezes; })[0];
    var outroTreino = outro.preco / (outro.vezes * 4);
    var comp = '';
    if (plano.vezes === 2 && porTreino < outroTreino) comp = ' No 2x, cada treino sai <b>R$ ' + real(outroTreino - porTreino) + ' mais barato</b> que no 1x.';
    $('#calcDetalhe').innerHTML = 'Cerca de <b>R$ ' + real(porTreino) + ' por treino</b> num mês de 4 semanas.' + comp;
    $('#calcDias').innerHTML = diasDaMod(estadoPlano.mod).map(function (d) { return '<li>' + d + '</li>'; }).join('');
    [['#segMod', estadoPlano.mod], ['#segVezes', String(estadoPlano.vezes)]].forEach(function (par) {
      var seg = $(par[0]); $$('button', seg).forEach(function (b, i) { var on = b.dataset.v === par[1]; b.setAttribute('aria-checked', on); if (on) seg.dataset.i = i; });
    });
    $$('.plano').forEach(function (p) { p.classList.toggle('ativo', p.dataset.mod === estadoPlano.mod && +p.dataset.vezes === estadoPlano.vezes); });
  }
  $('#tabelaPlanos').innerHTML = Object.keys(MODS).map(function (k) {
    return MODS[k].planos.map(function (p) {
      return '<button class="plano" data-mod="' + k + '" data-vezes="' + p.vezes + '"><small>' + MODS[k].nome + ' · ' + p.vezes + 'x</small><b>R$ ' + real(p.preco) + '</b></button>';
    }).join('');
  }).join('');
  $('#segMod').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { estadoPlano.mod = b.dataset.v; desenharPlano(); } });
  $('#segVezes').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { estadoPlano.vezes = +b.dataset.v; desenharPlano(); } });
  $('#tabelaPlanos').addEventListener('click', function (e) { var b = e.target.closest('.plano'); if (b) { estadoPlano.mod = b.dataset.mod; estadoPlano.vezes = +b.dataset.vezes; desenharPlano(); } });
  $('#calcCta').addEventListener('click', function () {
    var m = MODS[estadoPlano.mod], p = m.planos.filter(function (x) { return x.vezes === estadoPlano.vezes; })[0];
    enviar('Oi, GR Sports! Vim pelo site e quero começar no plano de ' + m.nome + ' ' + p.vezes + 'x por semana (R$ ' + real(p.preco) + '/mês). Como faço?');
  });
  desenharPlano();

  /* =========================================================
     Quiz: qual turma é a sua?
     ========================================================= */
  (function () {
    var palco = $('#quizPalco'), passos = $$('#quizPassos span'), resp = {};
    var PERGUNTAS = [
      { chave: 'quem', titulo: 'Quem vai treinar?', ops: [['adulto', '🙋', 'Eu mesmo', 'Adolescente ou adulto'], ['crianca', '🧒', 'Uma criança', 'Filho, filha, sobrinho…']] },
      { chave: 'mod', titulo: 'Qual modalidade?', ops: [['futevolei', '⚽', 'Futevôlei', 'Sem as mãos'], ['volei', '🏐', 'Vôlei de praia', 'Com as mãos'], ['qualquer', '🤷', 'Ainda não sei', 'Quero conhecer as duas']] },
      { chave: 'nivel', titulo: 'Como você está na areia?', ops: [['nunca', '🌱', 'Nunca joguei', 'Vou começar do zero'], ['pouco', '🏃', 'Já jogo um pouco', 'Brinco com os amigos'], ['bem', '🔥', 'Jogo bem', 'Quero evoluir'], ['personal', '🎯', 'Quero atenção individual', 'Treino personal']] },
    ];
    function pergunta(i) {
      var q = PERGUNTAS[i];
      passos.forEach(function (p, k) { p.classList.toggle('feito', k < i); });
      palco.innerHTML = '<div class="quiz-pergunta"><h3>' + q.titulo + '</h3><div class="quiz-opcoes">' +
        q.ops.map(function (o) { return '<button class="quiz-op" data-v="' + o[0] + '"><i>' + o[1] + '</i><span>' + o[2] + '<small>' + o[3] + '</small></span></button>'; }).join('') +
        '</div>' + (i ? '<button class="quiz-voltar">Voltar</button>' : '') + '</div>';
      $$('.quiz-op', palco).forEach(function (b) {
        b.addEventListener('click', function () {
          resp[q.chave] = b.dataset.v;
          if (q.chave === 'quem' && b.dataset.v === 'crianca') { resp.nivel = 'kids'; return pergunta(1); }
          if (q.chave === 'mod' && resp.quem === 'crianca') return resultado();
          if (i < PERGUNTAS.length - 1) pergunta(i + 1); else resultado();
        });
      });
      var v = $('.quiz-voltar', palco);
      if (v) v.addEventListener('click', function () { pergunta(i - 1); });
    }
    function resultado(semConfete) {
      passos.forEach(function (p) { p.classList.add('feito'); });
      var nivel = resp.quem === 'crianca' ? 'kids' : ({ nunca: 'iniciante', pouco: 'iniciante', bem: 'intermediario', personal: 'personal' })[resp.nivel];
      var mods = resp.mod === 'qualquer' ? Object.keys(MODS) : [resp.mod];
      var achou = D.turmas.filter(function (t) { return t.nivel === nivel && mods.indexOf(t.mod) > -1; });
      var nota = '';
      if (!achou.length) {
        var alt = D.turmas.filter(function (t) { return t.nivel === nivel; });
        if (alt.length) {
          nota = 'A grade divulgada não tem ' + nomeNivel(nivel).toLowerCase() + ' de ' + mods.map(nomeMod).join(' ou ').toLowerCase() + '. Ela tem em ' + nomeMod(alt[0].mod).toLowerCase() + '. Pergunte se abre turma na sua modalidade.';
          achou = alt;
        } else {
          nota = 'Essa turma não está na grade divulgada. Na aula experimental o professor avalia seu nível e indica o melhor horário.';
          achou = D.turmas.filter(function (t) { return t.nivel === 'iniciante' && mods.indexOf(t.mod) > -1; });
        }
      }
      var modsAchadas = achou.map(function (t) { return t.mod; }).filter(function (m, i, a) { return a.indexOf(m) === i; });
      var modsTitulo = nota ? mods : modsAchadas; // no plano B, o título mantém a modalidade que a pessoa escolheu
      var titulo = nomeNivel(nivel) + (modsTitulo.length === 1 ? ' de ' + nomeMod(modsTitulo[0]) : '');
      var precos = modsAchadas.map(function (k) { return MODS[k].nome + ': R$ ' + MODS[k].planos.map(function (p) { return real(p.preco) + ' (' + p.vezes + 'x)'; }).join(' ou R$ '); }).join(' · ');
      palco.innerHTML = '<div class="quiz-resultado"><p class="rotulo">Sua turma</p><h3>' + titulo + '</h3>' +
        (nota ? '<p>' + nota + '</p>' : '<p>Esses são os horários da sua turma na grade da semana:</p>') +
        '<ol class="turmas">' + achou.map(function (t, i) {
          return '<li class="turma" style="--i:' + i + '"><span class="turma-hora">' + t.hora + '</span><span class="turma-nivel"><b>' + diasTxt(t.dias) + '</b><small>' + nomeNivel(t.nivel) + ' · ' + nomeMod(t.mod) + '</small></span>' +
            '<button class="turma-btn" data-turma="' + D.turmas.indexOf(t) + '"><span>Quero</span><svg><use href="#i-seta"/></svg></button></li>';
        }).join('') + '</ol>' +
        (nivel !== 'personal' ? '<p style="margin-bottom:16px;color:var(--cinza);font-size:14px">' + precos + ' por mês.</p>' : '<p style="margin-bottom:16px;color:var(--cinza);font-size:14px">O valor do personal é combinado direto com a GR Sports.</p>') +
        '<div class="quiz-acoes"><button class="btn btn-gradiente btn-grande" id="quizCta">Agendar aula experimental <svg><use href="#i-seta"/></svg></button><button class="quiz-voltar" id="quizRefazer">Refazer o teste</button></div></div>';
      $('#quizCta').addEventListener('click', function () {
        abrirFolha({ mod: modsAchadas.length === 1 ? modsAchadas[0] : 'qualquer', nivel: resp.quem === 'crianca' ? 'kids' : resp.nivel });
      });
      $('#quizRefazer').addEventListener('click', function () { resp = {}; pergunta(0); });
      if (!semConfete) confete($('#quizCaixa'));
    }
    pergunta(0);
  })();

  function confete(caixa) {
    if (reduz || !caixa.animate) return;
    var cores = ['#F51300', '#FF6A00', '#FFB608', '#0C0C0D', '#fff'];
    for (var i = 0; i < 36; i++) {
      var c = document.createElement('i'); c.className = 'confete';
      c.style.background = cores[i % cores.length]; c.style.left = '50%'; c.style.top = '30%';
      caixa.appendChild(c);
      var ang = Math.random() * Math.PI * 2, dist = 120 + Math.random() * 220;
      c.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + (Math.sin(ang) * dist * .6 + 260) + 'px) rotate(' + (Math.random() * 720 - 360) + 'deg)', opacity: 0 },
      ], { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = (function (el) { return function () { el.remove(); }; })(c);
    }
  }

  /* =========================================================
     Folha: aula experimental
     ========================================================= */
  var folha = $('#folha'), fundo = $('#folhaFundo'), focoAntes = null;
  var estadoFolha = { mod: '', nivel: '', turma: '' };
  var OPC_MOD = [['futevolei', 'Futevôlei'], ['volei', 'Vôlei de praia'], ['qualquer', 'Ainda não sei']];
  var OPC_NIVEL = [['nunca', 'Nunca joguei'], ['pouco', 'Jogo um pouco'], ['bem', 'Jogo bem'], ['kids', 'Kids (criança)'], ['personal', 'Personal']];
  var NIVEL_TXT = { nunca: 'Nunca joguei', pouco: 'Já jogo um pouco', bem: 'Jogo bem', kids: 'Turma kids (criança)', personal: 'Treino personal' };
  folha.setAttribute('data-lenis-prevent', '');
  $('#turmas').setAttribute('data-lenis-prevent', '');

  function chips(caixa, opcoes, chave) {
    caixa.innerHTML = opcoes.map(function (o) { return '<button class="chip" aria-pressed="' + (estadoFolha[chave] === o[0]) + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('');
  }
  function opcoesTurma() {
    var sel = $('#fTurma'), mod = estadoFolha.mod;
    var lista = D.turmas.map(function (t, i) { return { t: t, i: i }; }).filter(function (x) { return !mod || mod === 'qualquer' || x.t.mod === mod; });
    sel.innerHTML = '<option value="">Qualquer horário que tiver vaga</option>' + lista.map(function (x) {
      return '<option value="' + x.i + '"' + (String(x.i) === String(estadoFolha.turma) ? ' selected' : '') + '>' + diasTxt(x.t.dias) + ' · ' + x.t.hora + ' · ' + nomeNivel(x.t.nivel) + ' · ' + nomeMod(x.t.mod) + '</option>';
    }).join('');
    if (!sel.value) estadoFolha.turma = '';
  }
  function mensagem() {
    var nome = $('#fNome').value.trim(), t = estadoFolha.turma !== '' ? D.turmas[+estadoFolha.turma] : null;
    var linhas = ['Oi, GR Sports! Vim pelo site e quero marcar uma aula experimental.'];
    if (nome) linhas.push('Nome: ' + nome);
    if (estadoFolha.mod) linhas.push('Modalidade: ' + (estadoFolha.mod === 'qualquer' ? 'ainda não sei, quero conhecer' : nomeMod(estadoFolha.mod)));
    if (estadoFolha.nivel) linhas.push('Nível: ' + NIVEL_TXT[estadoFolha.nivel]);
    linhas.push('Turma: ' + (t ? diasTxt(t.dias) + ' às ' + t.hora + ' (' + nomeNivel(t.nivel) + ', ' + nomeMod(t.mod) + ')' : 'qualquer horário com vaga'));
    return linhas.join('\n');
  }
  function atualizarFolha() { $('#fPrevia').textContent = mensagem(); }
  function abrirFolha(pre) {
    pre = pre || {};
    estadoFolha.mod = pre.mod || ''; estadoFolha.nivel = pre.nivel || ''; estadoFolha.turma = pre.turma !== undefined ? pre.turma : '';
    chips($('#fMod'), OPC_MOD, 'mod'); chips($('#fNivel'), OPC_NIVEL, 'nivel'); opcoesTurma(); atualizarFolha();
    $('#fEnviarTxt').textContent = D.whatsapp ? 'Enviar pelo WhatsApp' : 'Enviar pelo Direct do Instagram';
    $('#fNota').textContent = D.whatsapp ? 'Abre o WhatsApp com a mensagem pronta. É só enviar.' : 'A mensagem é copiada e o Direct da GR Sports abre. É só colar e enviar.';
    focoAntes = document.activeElement;
    fundo.hidden = false; folha.hidden = false; document.body.classList.add('travado');
    if (lenis) lenis.stop();
    setTimeout(function () { $('#fNome').focus({ preventScroll: true }); }, 60);
  }
  function fecharFolha() {
    folha.hidden = true; fundo.hidden = true; document.body.classList.remove('travado');
    if (lenis) lenis.start();
    if (focoAntes && focoAntes.focus) focoAntes.focus({ preventScroll: true });
  }
  window.abrirFolha = abrirFolha;
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-abrir="experimental"]'); if (!b) return;
    abrirFolha({ mod: b.dataset.mod || '' });
  });
  $('#folhaFechar').addEventListener('click', fecharFolha);
  fundo.addEventListener('click', fecharFolha);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !folha.hidden) fecharFolha(); });
  $('#fMod').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    estadoFolha.mod = b.dataset.v; chips($('#fMod'), OPC_MOD, 'mod'); opcoesTurma(); atualizarFolha();
  });
  $('#fNivel').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    estadoFolha.nivel = b.dataset.v; chips($('#fNivel'), OPC_NIVEL, 'nivel'); atualizarFolha();
  });
  $('#fTurma').addEventListener('change', function (e) { estadoFolha.turma = e.target.value; atualizarFolha(); });
  $('#fNome').addEventListener('input', atualizarFolha);
  $('#fEnviar').addEventListener('click', function () { enviar(mensagem()); });

  /* ---------- Compartilhar ---------- */
  $('#compartilhar').addEventListener('click', function () {
    var url = D.linkPagina || location.href.split('#')[0];
    var dados = { title: 'GR Sports', text: 'Futevôlei e vôlei de praia na Ceilândia. Bora treinar?', url: url };
    if (navigator.share) navigator.share(dados).catch(function () { /* cancelado */ });
    else copiar(url).then(function () { avisar('Link copiado. Manda pra galera!'); });
  });

  /* =========================================================
     Movimento
     ========================================================= */
  // Títulos palavra por palavra
  $$('.dividir').forEach(function (el) {
    var n = 0;
    el.innerHTML = el.innerHTML.split(/(<[^>]+>)/).map(function (parte) {
      if (parte.charAt(0) === '<') return parte;
      return parte.split(/(\s+)/).map(function (tok) {
        if (!tok.trim()) return tok;
        return '<span class="palavra"><span style="--i:' + (n++) + '">' + tok + '</span></span>';
      }).join('');
    }).join('');
  });
  var ioTitulos = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('entrou'); ioTitulos.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });

  // Blocos e cascatas (WAAPI, não depende do GSAP)
  function revelar(el, atraso) {
    if (reduz || !el.animate) { el.style.opacity = 1; el.style.transform = 'none'; return; }
    el.animate([{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }],
      { duration: 900, delay: atraso || 0, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' })
      .onfinish = function () { el.style.opacity = 1; el.style.transform = 'none'; };
  }
  var ioBlocos = new IntersectionObserver(function (en) {
    en.forEach(function (x) {
      if (!x.isIntersecting) return;
      var el = x.target; ioBlocos.unobserve(el);
      if (el.hasAttribute('data-cascata')) Array.prototype.forEach.call(el.children, function (c, i) { revelar(c, i * 110); });
      else revelar(el, 0);
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  // Contadores tipo placar
  var ioPlacar = new IntersectionObserver(function (en) {
    en.forEach(function (x) {
      if (!x.isIntersecting) return;
      var el = x.target, fim = +el.dataset.contar; ioPlacar.unobserve(el);
      if (reduz) { el.textContent = milhar(fim); return; }
      var t0 = performance.now(), dur = 1800;
      (function f(t) {
        var k = limitar((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 4);
        el.textContent = milhar(Math.round(fim * e));
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    });
  }, { threshold: .6 });

  function iniciarObservadores() {
    $$('.dividir').forEach(function (el) { if (!el.classList.contains('hero-titulo')) ioTitulos.observe(el); });
    $$('[data-revelar],[data-cascata]').forEach(function (el) { ioBlocos.observe(el); });
    $$('[data-contar]').forEach(function (el) { ioPlacar.observe(el); });
  }

  // Abertura: logo se desenha, cortina sobe, hero entra
  function entradaHero() {
    $('.hero-titulo').classList.add('entrou');
    if (reduz) return;
    [$('.selo-local'), $('.hero-lead'), $('.hero-acoes'), $('#hojeChip')].forEach(function (el, i) { revelar(el, 250 + i * 110); });
    var st = $('.hero-story');
    if (st.animate) st.animate([{ opacity: 0, transform: 'translateY(60px) rotate(8deg)' }, { opacity: 1, transform: 'none' }], { duration: 1200, delay: 300, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
  }
  (function () {
    var ab = $('#abertura');
    if (reduz) { ab.remove(); entradaHero(); iniciarObservadores(); return; }
    if (lenis) lenis.stop();
    [$('.selo-local'), $('.hero-lead'), $('.hero-acoes'), $('#hojeChip')].forEach(function (el) { el.style.opacity = 0; });
    var pronto = false;
    function sair() {
      if (pronto) return; pronto = true;
      ab.classList.add('saiu'); window.scrollTo(0, 0);
      setTimeout(function () { entradaHero(); iniciarObservadores(); if (lenis) lenis.start(); }, 380);
      setTimeout(function () { ab.remove(); }, 1100);
    }
    var minimo = new Promise(function (r) { setTimeout(r, 1350); });
    var fontes = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.all([minimo, fontes]).then(sair);
    setTimeout(sair, 3000); // nunca prende o visitante
  })();

  // Loop de rolagem: progresso, topo, barra, faixa, galeria, parallax
  var faixa = $('#faixa'), linhas = $$('.galeria-linha'), topo = $('#topo'), barra = $('#barra'), prog = $('.progresso');
  faixa.innerHTML += faixa.innerHTML; // duplica para o loop
  var escuras = $$('.faixa, .preto, .horarios-intro, .palco-zoom, .insta, .final, .rodape');
  var paralaxe = $$('[data-parallax]'), fotosMod = $$('.mod-fotos');
  var ultimoY = scrollY, vel = 0, posFaixa = 0, posLinhas = [0, 0], dirFaixa = 1, tAnt = performance.now();
  function loop(t) {
    var dt = Math.min(.05, (t - tAnt) / 1000); tAnt = t;
    var y = scrollY, dy = y - ultimoY; ultimoY = y;
    vel += ((lenis ? lenis.velocity : dy) - vel) * .2;
    var alto = document.documentElement.scrollHeight - innerHeight;
    prog.style.setProperty('--p', alto > 0 ? (y / alto).toFixed(4) : 0);
    topo.classList.toggle('rolou', y > 20);
    var escuro = false;
    for (var i = 0; i < escuras.length; i++) { var r = escuras[i].getBoundingClientRect(); if (r.top <= 32 && r.bottom >= 32) { escuro = true; break; } }
    topo.classList.toggle('escuro', escuro);
    barra.classList.toggle('visivel', y > innerHeight * .6 && folha.hidden);
    if (!reduz) {
      if (Math.abs(vel) > .5) dirFaixa = vel > 0 ? 1 : -1;
      var w = faixa.scrollWidth / 2;
      posFaixa -= (70 + Math.abs(vel) * 18) * dirFaixa * dt;
      if (posFaixa <= -w) posFaixa += w; if (posFaixa > 0) posFaixa -= w;
      faixa.style.transform = 'translate3d(' + posFaixa.toFixed(1) + 'px,0,0) skewX(' + limitar(-vel * .6, -12, 12).toFixed(2) + 'deg)';
      linhas.forEach(function (l, k) {
        var lw = l.scrollWidth / 2, d = k ? 1 : -1;
        posLinhas[k] += (34 + Math.abs(vel) * 10) * d * dt;
        if (posLinhas[k] <= -lw) posLinhas[k] += lw; if (posLinhas[k] > 0) posLinhas[k] -= lw;
        l.style.transform = 'translate3d(' + posLinhas[k].toFixed(1) + 'px,0,0)';
      });
      paralaxe.forEach(function (el) { el.style.transform = 'translate3d(0,' + (y * (+el.dataset.parallax) / 100).toFixed(1) + 'px,0)'; });
      fotosMod.forEach(function (fs) {
        var r2 = fs.getBoundingClientRect();
        if (r2.bottom < 0 || r2.top > innerHeight) return;
        fs.style.setProperty('--abre', limitar(1 - (r2.top - innerHeight * .25) / (innerHeight * .6), 0, 1).toFixed(3));
      });
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Botões magnéticos e cartão de vidro (só com mouse)
  if (ponteiroFino && !reduz) {
    document.addEventListener('pointermove', function (e) {
      var b = e.target.closest && e.target.closest('.magnetico');
      $$('.magnetico.puxado').forEach(function (o) { if (o !== b) { o.style.transform = ''; o.classList.remove('puxado'); } });
      if (!b) return;
      var r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .2).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px)';
      b.classList.add('puxado');
    });
    var vidro = $('#vidro');
    vidro.addEventListener('pointermove', function (e) {
      var r = vidro.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      vidro.style.transform = 'rotateX(' + ((.5 - y) * 16).toFixed(2) + 'deg) rotateY(' + ((x - .5) * 16).toFixed(2) + 'deg)';
      vidro.style.setProperty('--mx', (x * 100) + '%'); vidro.style.setProperty('--my', (y * 100) + '%');
    });
    vidro.addEventListener('pointerleave', function () { vidro.style.transform = ''; });
  }

  /* ---------- Cena presa: a bola cruza a rede a cada passo (GSAP) ---------- */
  (function () {
    var passosEl = $$('#lancePassos li');
    if (!temGsap || reduz) { html.classList.add('sem-movimento-lance'); passosEl.forEach(function (li) { li.classList.add('ativo'); }); return; }
    var bola = $('#lanceBola'), sombra = $('#lanceSombra'), rastro = $('#lanceRastro');
    var X, CHAO = 368, PICO = 60;
    function medirQuadra() { // a bola quica dentro da parte visível da quadra
      var vis = Math.min(1, innerWidth / $('.lance-svg').getBoundingClientRect().width);
      var meia = Math.min(350, vis * 500 - 70);
      X = [500 - meia, 500 + meia, 500 - meia, 500 + meia];
    }
    medirQuadra(); addEventListener('resize', medirQuadra);
    function pos(p) {
      var seg = Math.min(2, Math.floor(p * 3)), t = p * 3 - seg;
      var x = mix(X[seg], X[seg + 1], t), y = CHAO - (CHAO - PICO) * 4 * t * (1 - t);
      return { seg: seg, t: t, x: x, y: y };
    }
    function desenhar(p) {
      var q = pos(p);
      bola.setAttribute('transform', 'translate(' + q.x.toFixed(1) + ' ' + q.y.toFixed(1) + ') rotate(' + (p * 1080).toFixed(1) + ')');
      var h = (CHAO - q.y) / (CHAO - PICO);
      sombra.setAttribute('cx', q.x.toFixed(1)); sombra.setAttribute('rx', (26 - h * 12).toFixed(1)); sombra.style.opacity = (1 - h * .6).toFixed(2);
      var d = '', a = X[q.seg], b = X[q.seg + 1];
      for (var k = 0; k <= 24; k++) {
        var tt = q.t * k / 24, xx = mix(a, b, tt), yy = CHAO - (CHAO - PICO) * 4 * tt * (1 - tt);
        d += (k ? 'L' : 'M') + xx.toFixed(1) + ' ' + yy.toFixed(1);
      }
      rastro.setAttribute('d', d);
      passosEl.forEach(function (li, i) { li.classList.toggle('ativo', i === q.seg); });
    }
    desenhar(0);
    ScrollTrigger.create({ trigger: '#lanceCena', start: 'top top', end: '+=220%', pin: true, scrub: .6, onUpdate: function (s) { desenhar(Math.min(.9999, s.progress)); } });
  })();

  /* ---------- "Vem pra areia" se enche de amarelo ao rolar ---------- */
  (function () {
    var el = $('#finalGigante');
    if (!temGsap || reduz) { el.style.setProperty('--enche', '100%'); el.style.setProperty('--enche2', '100%'); return; }
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', end: 'bottom 45%', scrub: true,
      onUpdate: function (s) {
        el.style.setProperty('--enche', (limitar(s.progress * 2, 0, 1) * 100).toFixed(1) + '%');
        el.style.setProperty('--enche2', (limitar(s.progress * 2 - 1, 0, 1) * 100).toFixed(1) + '%');
      },
    });
  })();

  addEventListener('load', function () { if (temGsap) ScrollTrigger.refresh(); });
})();
