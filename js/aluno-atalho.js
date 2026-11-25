/* =========================================================
   Atalho para a área do aluno na landing.
   Se este celular já salvou nome e turma em aluno/ (localStorage "gr-aluno"),
   o botão do topo vira "Área do aluno" e aparece a faixa com o próximo treino.
   ========================================================= */
(function () {
  'use strict';
  var D = window.DADOS, aluno;
  try { aluno = JSON.parse(localStorage.getItem('gr-aluno')); } catch (e) { aluno = null; }
  var turma = aluno && aluno.turma != null && D && D.turmas[aluno.turma];
  if (!turma) return;

  document.getElementById('souAluno').textContent = 'Área do aluno';

  var DIA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var p = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
    .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
  var hoje = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  var agora = (parseInt(p.hour, 10) % 24) * 60 + parseInt(p.minute, 10);
  var h = turma.hora.split(':'), ini = +h[0] * 60 + +h[1], dur = D.duracaoTurmaMin || 60;

  // Próximo treino desta turma
  var n = 0;
  for (; n < 8; n++) {
    var d = (hoje + n) % 7;
    if (turma.dias.indexOf(d) > -1 && (n > 0 || agora < ini + dur)) break;
  }
  var quando = n === 0 ? (agora >= ini ? 'seu treino está rolando agora' : 'seu treino é hoje às ' + turma.hora)
    : n === 1 ? 'seu treino é amanhã às ' + turma.hora
    : 'seu próximo treino é ' + DIA[(hoje + n) % 7] + ' às ' + turma.hora;

  var nome = String(aluno.nome || '').split(' ')[0];
  var txt = document.getElementById('faixaAlunoTxt');
  if (nome) { var b = document.createElement('b'); b.textContent = nome; txt.append(b, ', ' + quando); }
  else txt.textContent = quando.charAt(0).toUpperCase() + quando.slice(1);

  var faixa = document.getElementById('faixaAluno');
  faixa.classList.add('longe'); faixa.hidden = false;
  // Entra depois da abertura e some quando a pessoa desce a página
  setTimeout(function () {
    var ver = function () { faixa.classList.toggle('longe', window.scrollY > 300); };
    ver(); window.addEventListener('scroll', ver, { passive: true });
  }, 1700);
})();
