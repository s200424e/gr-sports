/* =========================================================
   GR SPORTS · Área do aluno
   Sem login: o nome e a turma do aluno ficam só no celular dele (localStorage).
   Avisos: planilha do Google publicada como CSV (ALUNO.planilhaCSV) ou exemplos.
   ========================================================= */
(function () {
  'use strict';
  var D = window.DADOS, A = window.ALUNO;
  document.documentElement.classList.add('js');

  var $ = function (s) { return document.querySelector(s); };
  var DIA_LONGO = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var DIA_CURTO = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var DUR = D.duracaoTurmaMin || 60;

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function reais(v) { return 'R$ ' + (Math.round(v) === v ? v : v.toFixed(2).replace('.', ',')); }
  function semAcento(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  /* ---------- Data e hora de Brasília ---------- */
  function agora() {
    var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    return {
      iso: o.year + '-' + o.month + '-' + o.day,
      dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday),
      min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10),
      hora: parseInt(o.hour, 10) % 24,
    };
  }
  function somarDias(iso, n) {
    var d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function diaDaSemana(iso) { return new Date(iso + 'T12:00:00Z').getUTCDay(); }
  function diasEntre(a, b) { return Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 864e5); }
  function ddmm(iso) { return iso.slice(8, 10) + '/' + iso.slice(5, 7); }
  function quando(iso, hoje) {
    var n = diasEntre(hoje, iso);
    if (n === 0) return 'hoje';
    if (n === 1) return 'amanhã';
    if (n === -1) return 'ontem';
    return DIA_LONGO[diaDaSemana(iso)] + ', ' + ddmm(iso);
  }
  // Aceita: 25/11/2026, 25/11/26, 25/11, 2026-11-25, hoje, amanhã, +3
  function lerData(txt, hoje) {
    var t = semAcento(String(txt || '').trim().toLowerCase());
    if (!t) return '';
    if (t === 'hoje') return hoje;
    if (t === 'amanha') return somarDias(hoje, 1);
    var m = t.match(/^\+(\d+)$/); if (m) return somarDias(hoje, +m[1]);
    m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
    m = t.match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?/);
    if (!m) return '';
    var ano = m[3] ? (m[3].length === 2 ? '20' + m[3] : m[3]) : hoje.slice(0, 4);
    return ano + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  }
  // "19h30", "19h", "19:30" → "19:30"
  function lerHora(t) {
    var m = String(t).trim().match(/^(\d{1,2})\s*(?:h|:)?\s*(\d{2})?/i);
    return m ? ('0' + m[1]).slice(-2) + ':' + (m[2] || '00') : '';
  }
  function emMin(h) { var p = h.split(':'); return +p[0] * 60 + +p[1]; }

  /* ---------- Turmas ---------- */
  function nomeMod(k) { return (D.modalidades[k] || {}).nome || k; }
  function nomeNivel(k) { return (D.niveis[k] || {}).nome || k; }
  function nomeTurma(t) { return nomeMod(t.mod) + ' ' + nomeNivel(t.nivel).toLowerCase(); }
  function diasTurma(t) {
    var n = t.dias.map(function (d) { return DIA_LONGO[d]; });
    return n.length > 1 ? n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1] : n[0];
  }
  function turmasDoDia(dia) {
    return D.turmas.map(function (t, i) { return { t: t, i: i }; })
      .filter(function (x) { return x.t.dias.indexOf(dia) > -1; })
      .sort(function (a, b) { return emMin(a.t.hora) - emMin(b.t.hora); });
  }
  // Próxima vez que a turma acontece a partir de agora (iso + hora)
  function proximaVez(t, ag) {
    for (var n = 0; n < 8; n++) {
      var iso = somarDias(ag.iso, n), d = diaDaSemana(iso);
      if (t.dias.indexOf(d) > -1 && (n > 0 || emMin(t.hora) + DUR > ag.min)) return iso;
    }
    return '';
  }

  /* ---------- Aluno (só neste celular) ---------- */
  var CHAVE = 'gr-aluno';
  var aluno = {};
  try { aluno = JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { aluno = {}; }
  function salvarAluno() { try { localStorage.setItem(CHAVE, JSON.stringify(aluno)); } catch (e) { /* modo privado */ } }
  function minhaTurma() { return aluno.turma != null ? D.turmas[aluno.turma] : null; }
  function apresentacao() {
    var t = minhaTurma(), nome = aluno.nome ? 'Aqui é ' + aluno.nome : 'Sou aluno da GR';
    return t ? nome + ', da turma de ' + nomeTurma(t) + ' das ' + t.hora + ' (' + diasTurma(t) + ')' : nome;
  }

  /* ---------- Contato: WhatsApp ou Direct ---------- */
  var aviso = $('#avisoFlutuante'), avisoT;
  function avisar(txt) {
    aviso.textContent = txt; aviso.classList.add('ver');
    clearTimeout(avisoT); avisoT = setTimeout(function () { aviso.classList.remove('ver'); }, 3200);
  }
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
      copiar(msg).then(function () { avisar('Mensagem copiada. Cole no Direct da GR Sports.'); }, function () {});
      window.open('https://ig.me/m/' + D.instagram, '_blank', 'noopener');
    }
  }

  /* ---------- Avisos ---------- */
  var avisos = [];
  function tipoDe(t) {
    t = semAcento(String(t || '').toLowerCase());
    if (/sem|chuva|cancel|nao tem|feriado/.test(t)) return 'sem-treino';
    if (/evento|torneio|festa|confra|campeonato/.test(t)) return 'evento';
    if (/horario|mudanc|troca/.test(t)) return 'horario';
    return 'aviso';
  }
  var ROTULO = { 'sem-treino': 'Sem treino', evento: 'Evento', horario: 'Horário', aviso: 'Aviso' };

  function lerCSV(txt) {
    txt = txt.replace(/^﻿/, '');
    var sep = (txt.split('\n')[0].match(/;/g) || []).length > (txt.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
    var linhas = [], linha = [], campo = '', aspas = false;
    for (var i = 0; i < txt.length; i++) {
      var c = txt[i];
      if (aspas) {
        if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++; } else aspas = false; }
        else campo += c;
      } else if (c === '"') aspas = true;
      else if (c === sep) { linha.push(campo); campo = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && txt[i + 1] === '\n') i++;
        linha.push(campo); linhas.push(linha); linha = []; campo = '';
      } else campo += c;
    }
    if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
    var cab = (linhas.shift() || []).map(function (h) { return semAcento(h.trim().toLowerCase()).replace(/[^a-z]/g, ''); });
    var col = function (nomes) { for (var k = 0; k < cab.length; k++) if (nomes.indexOf(cab[k]) > -1) return k; return -1; };
    var c = { data: col(['data', 'dia']), tipo: col(['tipo']), titulo: col(['titulo', 'aviso']), texto: col(['texto', 'detalhes', 'descricao', 'mensagem']), ate: col(['ate', 'atequando', 'fim']), turmas: col(['turmas', 'horarios', 'horario']) };
    return linhas.map(function (l) {
      var v = function (k) { return c[k] > -1 ? (l[c[k]] || '').trim() : ''; };
      return { data: v('data'), tipo: v('tipo'), titulo: v('titulo'), texto: v('texto'), ate: v('ate'), turmas: v('turmas') };
    }).filter(function (a) { return a.titulo || a.texto; });
  }

  function prepararAvisos(lista, hoje) {
    return lista.map(function (a) {
      var tipo = tipoDe(a.tipo), data = lerData(a.data, hoje) || hoje;
      var ate = lerData(a.ate, hoje) || (tipo === 'aviso' || tipo === 'horario' ? somarDias(data, 7) : data);
      var horas = String(a.turmas || '').split(/[,;e]+/).map(lerHora).filter(Boolean);
      return { tipo: tipo, data: data, ate: ate, titulo: a.titulo || ROTULO[tipo], texto: a.texto || '', horas: horas };
    }).filter(function (a) {
      if (a.ate < hoje) return false;                    // já passou
      if (a.tipo === 'aviso' || a.tipo === 'horario') return a.data <= hoje; // aviso agendado só aparece no dia
      return true;                                       // sem treino e eventos aparecem antes
    });
  }

  function carregarAvisos() {
    var hoje = agora().iso;
    $('#demo').hidden = !!A.planilhaCSV;
    if (!A.planilhaCSV) {
      avisos = prepararAvisos(A.avisosExemplo || [], hoje);
      return Promise.resolve();
    }
    var url = A.planilhaCSV + (A.planilhaCSV.indexOf('?') > -1 ? '&' : '?') + 'nc=' + Date.now();
    return fetch(url, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) {
        try { localStorage.setItem('gr-avisos', txt); } catch (e) {}
        avisos = prepararAvisos(lerCSV(txt), hoje);
      })
      .catch(function () {
        var guardado = null; try { guardado = localStorage.getItem('gr-avisos'); } catch (e) {}
        avisos = guardado ? prepararAvisos(lerCSV(guardado), hoje) : [];
      });
  }

  // Cancelamento que vale para uma turma num dia
  function cancelamento(iso, t) {
    for (var i = 0; i < avisos.length; i++) {
      var a = avisos[i];
      if (a.tipo === 'sem-treino' && iso >= a.data && iso <= a.ate && (!a.horas.length || a.horas.indexOf(t.hora) > -1)) return a;
    }
    return null;
  }

  /* ---------- Hoje ---------- */
  function desenharHoje() {
    var ag = agora(), t = minhaTurma();
    var periodo = ag.hora < 12 ? 'Bom dia' : ag.hora < 18 ? 'Boa tarde' : 'Boa noite';
    $('#ola').textContent = periodo + ', ' + (aluno.nome || 'atleta');
    var dt = new Date(ag.iso + 'T12:00:00Z');
    $('#hojeData').textContent = DIA_LONGO[ag.dia].replace(/^./, function (c) { return c.toUpperCase(); }) + ', ' + dt.getUTCDate() + ' de ' + MES[dt.getUTCMonth()];
    $('#btnMinhaTurma span').textContent = t ? 'Trocar minha turma' : 'Escolher minha turma';

    var doDia = turmasDoDia(ag.dia);
    // Aviso geral de "sem treino hoje"
    var geral = avisos.filter(function (a) { return a.tipo === 'sem-treino' && ag.iso >= a.data && ag.iso <= a.ate; })[0];
    var todasCanceladas = doDia.length && doDia.every(function (x) { return cancelamento(ag.iso, x.t); });
    $('#hojeCancelado').hidden = !(geral && doDia.length);
    if (geral) {
      $('#hojeCanceladoTitulo').textContent = geral.titulo;
      $('#hojeCanceladoTexto').textContent = geral.texto + (geral.horas.length && !todasCanceladas ? ' Vale para: ' + geral.horas.join(', ') + '.' : '');
    }

    // Meu treino
    var meu = $('#meuTreino');
    meu.hidden = !t; meu.className = 'meu-treino'; meu.textContent = '';
    if (t) {
      var iso = proximaVez(t, ag), canc = iso && cancelamento(iso, t), ini = emMin(t.hora);
      var rotulo, frase;
      if (iso === ag.iso) {
        rotulo = 'Seu treino hoje';
        if (canc) { frase = 'Cancelado: ' + canc.titulo.toLowerCase(); meu.classList.add('cancelado'); }
        else if (ag.min >= ini) frase = 'Rolando agora. Bom treino!';
        else { var f = ini - ag.min; frase = 'Começa em ' + (f >= 60 ? Math.floor(f / 60) + 'h' + (f % 60 ? ('0' + f % 60).slice(-2) : '') : f + ' min'); }
      } else {
        rotulo = 'Seu próximo treino';
        frase = iso ? (quando(iso, ag.iso).replace(/^./, function (c) { return c.toUpperCase(); })) + (canc ? ' · cancelado' : '') : '';
        if (canc) meu.classList.add('cancelado');
      }
      meu.append(el('small', '', rotulo), el('strong', '', t.hora + ' · ' + nomeTurma(t)), el('span', '', frase));
    }

    // Lista do dia
    var ul = $('#hojeLista'); ul.textContent = '';
    if (!doDia.length) {
      var prox = null;
      for (var n = 1; n < 8 && !prox; n++) { var l = turmasDoDia((ag.dia + n) % 7); if (l.length) prox = { n: n, t: l[0].t }; }
      var v = el('li', 'hoje-vazio');
      v.append('Hoje não tem turma na GR. ');
      if (prox) v.append('Próximo treino: ', el('b', '', DIA_LONGO[(ag.dia + prox.n) % 7] + ', ' + prox.t.hora), ' (' + nomeTurma(prox.t) + ').');
      ul.append(v); return;
    }
    var marcouProxima = false;
    doDia.forEach(function (x) {
      var tt = x.t, ini = emMin(tt.hora), li = el('li'), st;
      if (cancelamento(ag.iso, tt)) { li.className = 'cancelada'; st = 'Cancelada'; }
      else if (ag.min >= ini && ag.min < ini + DUR) { li.className = 'rolando'; st = 'Rolando'; }
      else if (ag.min >= ini + DUR) { li.className = 'passou'; st = 'Já foi'; }
      else if (!marcouProxima) { li.className = 'proxima'; st = 'Próxima'; marcouProxima = true; }
      else st = 'Hoje';
      if (aluno.turma === x.i) li.classList.add('minha');
      var qual = el('span', 'qual', nomeTurma(tt));
      qual.append(el('small', '', aluno.turma === x.i ? 'Sua turma' : (D.niveis[tt.nivel] || {}).desc || ''));
      li.append(el('span', 'hora', tt.hora), qual, el('span', 'status', st));
      ul.append(li);
    });
  }

  /* ---------- Mural e agenda ---------- */
  function desenharMural() {
    var hoje = agora().iso, mural = $('#mural'); mural.textContent = '';
    var lista = avisos.filter(function (a) { return a.tipo !== 'evento'; }).sort(function (a, b) {
      var pa = a.tipo === 'sem-treino' ? 0 : 1, pb = b.tipo === 'sem-treino' ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return pa === 0 ? (a.data < b.data ? -1 : 1) : (a.data > b.data ? -1 : 1);
    });
    if (!lista.length) { mural.append(el('p', 'mural-vazio', 'Nenhum aviso por enquanto. Bom treino!')); }
    lista.forEach(function (a) {
      var c = el('article', 'recado ' + a.tipo), topo = el('div', 'recado-topo');
      var q = a.tipo === 'sem-treino' ? quando(a.data, hoje) : (a.data === hoje ? 'hoje' : 'desde ' + quando(a.data, hoje));
      topo.append(el('span', 'recado-tag', ROTULO[a.tipo]), el('span', '', q.replace(/^./, function (x) { return x.toUpperCase(); })));
      c.append(topo, el('h3', '', a.titulo));
      if (a.texto) c.append(el('p', '', a.texto));
      mural.append(c);
    });

    var ev = avisos.filter(function (a) { return a.tipo === 'evento'; }).sort(function (a, b) { return a.data < b.data ? -1 : 1; });
    $('#agendaBloco').hidden = !ev.length;
    var ol = $('#agenda'); ol.textContent = '';
    ev.forEach(function (a) {
      var li = el('li'), dia = el('div', 'dia'), d = new Date(a.data + 'T12:00:00Z'), corpo = el('div');
      dia.append(el('b', '', String(d.getUTCDate())), el('small', '', MES[d.getUTCMonth()].slice(0, 3)));
      var n = diasEntre(hoje, a.data);
      corpo.append(el('p', 'falta', n <= 0 ? 'É hoje!' : n === 1 ? 'Amanhã' : DIA_CURTO[d.getUTCDay()] + ' · daqui a ' + n + ' dias'), el('h3', '', a.titulo));
      if (a.texto) corpo.append(el('p', '', a.texto));
      li.append(dia, corpo); ol.append(li);
    });
  }

  /* ---------- Pix (BR Code "copia e cola") ---------- */
  function emv(id, v) { return id + ('0' + v.length).slice(-2) + v; }
  function crc16(s) {
    var crc = 0xFFFF;
    for (var i = 0; i < s.length; i++) {
      crc ^= s.charCodeAt(i) << 8;
      for (var j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
    return ('000' + crc.toString(16).toUpperCase()).slice(-4);
  }
  function limpo(s, max) { return semAcento(s).toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim().slice(0, max); }
  function pixCopiaECola(valor) {
    var p = emv('00', '01') + emv('26', emv('00', 'br.gov.bcb.pix') + emv('01', A.pix.chave.trim())) +
      emv('52', '0000') + emv('53', '986') + (valor ? emv('54', valor.toFixed(2)) : '') + emv('58', 'BR') +
      emv('59', limpo(A.pix.nome || D.nome, 25)) + emv('60', limpo(A.pix.cidade || 'BRASILIA', 15)) +
      emv('62', emv('05', 'MENSALIDADE')) + '6304';
    return p + crc16(p);
  }

  /* ---------- Mensalidade ---------- */
  var MODS = Object.keys(D.modalidades);
  var pag = { mod: '', vezes: 0 };
  function chips(alvo, opcoes, atual, aoEscolher) {
    alvo.textContent = '';
    opcoes.forEach(function (o) {
      var b = el('button', 'chip', o.rotulo); b.type = 'button';
      b.setAttribute('aria-pressed', String(o.v === atual));
      b.addEventListener('click', function () { aoEscolher(o.v); });
      alvo.append(b);
    });
  }
  function planoAtual() {
    return (D.modalidades[pag.mod].planos || []).filter(function (p) { return p.vezes === pag.vezes; })[0];
  }
  function desenharMensalidade() {
    if (!pag.mod) {
      var t = minhaTurma(); pag.mod = t ? t.mod : MODS[0];
      var dias = t ? t.dias.length : 0, planos = D.modalidades[pag.mod].planos;
      pag.vezes = (planos.filter(function (p) { return p.vezes === dias; })[0] || planos[planos.length - 1]).vezes;
    }
    chips($('#pMod'), MODS.map(function (k) { return { v: k, rotulo: nomeMod(k) }; }), pag.mod, function (v) {
      pag.mod = v; var pl = D.modalidades[v].planos;
      if (!pl.some(function (p) { return p.vezes === pag.vezes; })) pag.vezes = pl[pl.length - 1].vezes;
      desenharMensalidade();
    });
    chips($('#pPlano'), D.modalidades[pag.mod].planos.map(function (p) { return { v: p.vezes, rotulo: p.vezes + 'x por semana' }; }), pag.vezes, function (v) { pag.vezes = v; desenharMensalidade(); });
    var pl = planoAtual();
    $('#pValor').textContent = reais(pl.preco);

    var tem = !!(A.pix && A.pix.chave);
    $('#pCopiarTxt').textContent = tem ? 'Copiar Pix copia e cola' : 'Pedir dados do Pix';
    $('#pCopiar').querySelector('use').setAttribute('href', tem ? '#i-copiar' : '#i-whats');
    $('#pNota').textContent = tem ? 'Abra o app do banco, escolha Pix copia e cola e cole. O valor já vem preenchido.' : 'A chave Pix ainda não está nesta página. O botão pede os dados para a GR.';

    var v = $('#vencimento');
    v.hidden = !A.vencimentoDia;
    if (A.vencimentoDia) {
      var ag = agora(), hojeDia = +ag.iso.slice(8, 10), venc = A.vencimentoDia;
      var alvo = hojeDia <= venc ? ag.iso.slice(0, 8) + ('0' + venc).slice(-2) : null;
      if (!alvo) { var prox = new Date(ag.iso.slice(0, 8) + '01T12:00:00Z'); prox.setUTCMonth(prox.getUTCMonth() + 1); alvo = prox.toISOString().slice(0, 8) + ('0' + venc).slice(-2); }
      var falta = diasEntre(ag.iso, alvo);
      v.textContent = 'Vence todo dia ' + venc + '. ' + (falta === 0 ? 'Vence hoje!' : falta === 1 ? 'Vence amanhã.' : 'Faltam ' + falta + ' dias.');
    }
  }
  function mesAtual() { var ag = agora(); return MES[+ag.iso.slice(5, 7) - 1]; }
  function descricaoPlano() { var pl = planoAtual(); return nomeMod(pag.mod) + ' ' + pl.vezes + 'x por semana, ' + reais(pl.preco); }

  $('#pCopiar').addEventListener('click', function () {
    var b = this;
    if (A.pix && A.pix.chave) {
      copiar(pixCopiaECola(planoAtual().preco)).then(function () {
        b.classList.add('ok'); $('#pCopiarTxt').textContent = 'Pix copiado!';
        avisar('Pix copiado. Cole no app do seu banco.');
        setTimeout(function () { b.classList.remove('ok'); $('#pCopiarTxt').textContent = 'Copiar Pix copia e cola'; }, 2600);
      });
    } else {
      exigirAluno(function () { enviar('Oi! ' + apresentacao() + '. Quero pagar a mensalidade de ' + mesAtual() + ' (' + descricaoPlano() + '). Pode me mandar a chave Pix?'); });
    }
  });
  $('#pComprovante').addEventListener('click', function () {
    exigirAluno(function () { enviar('Oi! ' + apresentacao() + '. Paguei a mensalidade de ' + mesAtual() + ' (' + descricaoPlano() + '). Segue o comprovante.'); });
  });

  /* ---------- Faltas e reposição ---------- */
  function opcoesReposicao() {
    var sel = $('#rTurma'), atual = sel.value, t = minhaTurma();
    sel.textContent = '';
    D.turmas.map(function (x, i) { return { t: x, i: i }; })
      .filter(function (x) { return x.i !== aluno.turma && x.t.nivel !== 'personal' && (!t || x.t.mod === t.mod); })
      .sort(function (a, b) { return a.t.dias[0] - b.t.dias[0] || emMin(a.t.hora) - emMin(b.t.hora); })
      .forEach(function (x) {
        var o = el('option', '', diasTurma(x.t).replace(/^./, function (c) { return c.toUpperCase(); }) + ' · ' + x.t.hora + ' · ' + nomeTurma(x.t));
        o.value = x.i; sel.append(o);
      });
    if (atual && sel.querySelector('option[value="' + atual + '"]')) sel.value = atual;
  }
  function dataPerdida() {
    var ag = agora(), t = minhaTurma(), r = $('#rData');
    r.max = ag.iso; r.min = somarDias(ag.iso, -30);
    if (r.value) return;
    var iso = ag.iso;
    if (t) for (var n = 0; n < 8; n++) { var d = somarDias(ag.iso, -n); if (t.dias.indexOf(diaDaSemana(d)) > -1) { iso = d; break; } }
    r.value = iso;
  }
  function msgReposicao() {
    var ag = agora(), iso = $('#rData').value || ag.iso, alvo = D.turmas[+$('#rTurma').value];
    if (!alvo) return '';
    return 'Oi! ' + apresentacao() + '. Perdi o treino de ' + quando(iso, ag.iso) + ' e queria repor na turma de ' + nomeTurma(alvo) +
      ' (' + diasTurma(alvo) + ', ' + alvo.hora + '). Tem vaga?';
  }
  function atualizarPrevia() { $('#rPrevia').textContent = msgReposicao(); }
  $('#rData').addEventListener('change', atualizarPrevia);
  $('#rTurma').addEventListener('change', atualizarPrevia);
  $('#rEnviar').addEventListener('click', function () { exigirAluno(function () { enviar(msgReposicao()); }); });

  $('#btnFalta').addEventListener('click', function () {
    exigirAluno(function () {
      var ag = agora(), t = minhaTurma(), iso = proximaVez(t, ag);
      var quandoTxt = iso === ag.iso ? 'ao treino de hoje' : 'ao próximo treino';
      enviar('Oi! ' + apresentacao() + '. Não vou conseguir ir ' + quandoTxt + ' (' + DIA_LONGO[diaDaSemana(iso)] + ', ' + ddmm(iso) + '). Valeu!');
    }, true);
  });

  /* ---------- Folha: nome e turma ---------- */
  var folha = $('#folha'), fundo = $('#folhaFundo'), pendente = null, folhaMod = '';
  function opcoesMinhaTurma() {
    var sel = $('#mTurma'); sel.textContent = '';
    D.turmas.map(function (x, i) { return { t: x, i: i }; })
      .filter(function (x) { return x.t.mod === folhaMod; })
      .sort(function (a, b) { return a.t.dias[0] - b.t.dias[0] || emMin(a.t.hora) - emMin(b.t.hora); })
      .forEach(function (x) {
        var o = el('option', '', diasTurma(x.t).replace(/^./, function (c) { return c.toUpperCase(); }) + ' · ' + x.t.hora + ' · ' + nomeNivel(x.t.nivel));
        o.value = x.i; sel.append(o);
      });
    if (aluno.turma != null && D.turmas[aluno.turma] && D.turmas[aluno.turma].mod === folhaMod) sel.value = aluno.turma;
  }
  function desenharChipsFolha() {
    chips($('#mMod'), MODS.map(function (k) { return { v: k, rotulo: nomeMod(k) }; }), folhaMod, function (v) { folhaMod = v; desenharChipsFolha(); opcoesMinhaTurma(); });
  }
  function abrirFolha(depois, motivo) {
    pendente = depois || null;
    folhaMod = (minhaTurma() || {}).mod || MODS[0];
    $('#mNome').value = aluno.nome || '';
    $('.folha-sub').textContent = motivo || 'Fica salvo só neste celular. Serve para a página destacar o seu treino e já colocar seu nome nas mensagens.';
    desenharChipsFolha(); opcoesMinhaTurma();
    fundo.hidden = false; folha.hidden = false; document.body.classList.add('travado');
    setTimeout(function () { $('#mNome').focus({ preventScroll: true }); }, 60);
  }
  function fecharFolha() { fundo.hidden = true; folha.hidden = true; document.body.classList.remove('travado'); pendente = null; }
  // Antes de mandar mensagem, garante nome (e turma, quando precisa)
  function exigirAluno(fn, precisaTurma) {
    if (aluno.nome && (!precisaTurma || minhaTurma())) return fn();
    abrirFolha(fn, 'Antes, diga seu nome e sua turma. Fica salvo só neste celular, para a mensagem já sair completa.');
  }
  $('#btnMinhaTurma').addEventListener('click', function () { abrirFolha(); });
  $('#folhaFechar').addEventListener('click', fecharFolha);
  fundo.addEventListener('click', fecharFolha);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !folha.hidden) fecharFolha(); });
  $('#mSalvar').addEventListener('click', function () {
    var nome = $('#mNome').value.trim();
    if (!nome) { $('#mNome').focus(); avisar('Escreva seu nome.'); return; }
    aluno.nome = nome.slice(0, 40); aluno.turma = +$('#mTurma').value; salvarAluno();
    var fn = pendente; fecharFolha();
    pag.mod = ''; $('#rData').value = '';
    tudo();
    avisar('Pronto, ' + aluno.nome + '!');
    if (fn) setTimeout(fn, 150);
  });

  /* ---------- Combinados e atalhos ---------- */
  function desenharCombinados() {
    var ul = $('#combinados'); ul.textContent = '';
    (A.combinados || []).forEach(function (c) {
      var li = el('li'), d = el('div');
      d.append(el('b', '', c.titulo), el('span', '', c.texto));
      li.append(el('i', '', c.emoji), d); ul.append(li);
    });
  }
  if (A.grupoWhatsApp) { $('#aGrupo').href = A.grupoWhatsApp; $('#aGrupo').hidden = false; }
  $('#aInsta').href = 'https://www.instagram.com/' + D.instagram + '/';
  $('#aMapa').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(D.endereco.busca);
  $('#aIndicar').addEventListener('click', function () {
    var url = D.linkPagina || new URL('../', location.href).href;
    var txt = 'Bora treinar comigo na GR Sports? Tem futevôlei e vôlei de praia na Ceilândia, e a primeira aula é experimental.';
    if (navigator.share) navigator.share({ title: 'GR Sports', text: txt, url: url }).catch(function () {});
    else copiar(txt + ' ' + url).then(function () { avisar('Convite copiado. Cole no WhatsApp do seu amigo.'); });
  });

  /* ---------- Início ---------- */
  function tudo() { desenharHoje(); desenharMural(); desenharMensalidade(); opcoesReposicao(); dataPerdida(); atualizarPrevia(); }
  desenharCombinados();
  tudo();
  carregarAvisos().then(tudo);
  setInterval(desenharHoje, 30000);
  // Quando o aluno volta para a aba, busca avisos novos
  document.addEventListener('visibilitychange', function () { if (!document.hidden) carregarAvisos().then(tudo); });

  window.__aluno = { lerCSV: lerCSV, pixCopiaECola: pixCopiaECola, crc16: crc16, prepararAvisos: prepararAvisos };
})();
