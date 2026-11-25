/* =========================================================
   GR SPORTS · Área do aluno
   Horários, modalidades e preços vêm de ../js/dados.js (os mesmos da página principal).
   Aqui fica só o que é da área do aluno.
   Itens marcados com CONFIRMAR precisam ser conferidos com o dono.
   ========================================================= */
window.ALUNO = {
  // Planilha do Google publicada como CSV (Arquivo > Compartilhar > Publicar na Web > CSV).
  // Vazio: a página usa os avisos de exemplo logo abaixo.
  planilhaCSV: "", // CONFIRMAR: colar o link da planilha do dono

  pix: {
    // Chave como está cadastrada no banco: CPF/CNPJ só dígitos, e-mail, celular no formato +5561999999999, ou chave aleatória.
    // Vazia: o botão vira "Pedir dados do Pix" e manda mensagem para a GR.
    chave: "",          // CONFIRMAR
    nome: "GR SPORTS",  // CONFIRMAR: nome do recebedor como aparece no banco (até 25 letras)
    cidade: "BRASILIA",
  },
  vencimentoDia: null,   // CONFIRMAR: dia do mês em que a mensalidade vence (ex.: 10). null esconde a linha.

  grupoWhatsApp: "",     // CONFIRMAR: link de convite do grupo dos alunos (https://chat.whatsapp.com/...)

  // Combinados da arena. Sugestões: confirmar com o dono antes de publicar.
  combinados: [
    { emoji: "⏱️", titulo: "Chegue 10 minutos antes", texto: "Dá tempo de aquecer e o treino começa no horário." },
    { emoji: "💧", titulo: "Traga sua garrafa de água", texto: "Na areia o corpo perde água rápido, mesmo à noite." },
    { emoji: "📲", titulo: "Vai faltar? Avise", texto: "Use o botão \"Vou faltar hoje\" desta página. O professor agradece." },
    { emoji: "🔁", titulo: "Reposição é combinada antes", texto: "Peça a reposição por aqui e espere a confirmação da vaga." },
    { emoji: "🤝", titulo: "A areia é de todos", texto: "Respeite o horário da turma seguinte e deixe a quadra pronta." },
  ],

  // Avisos de exemplo, usados quando a planilha está vazia ou fora do ar.
  // Mesmas colunas da planilha. "data" aceita 25/11/2026, 25/11 ou o nome do dia: "hoje" e "amanhã".
  avisosExemplo: [
    { data: "hoje",   tipo: "sem treino", titulo: "Choveu forte: sem treino hoje", texto: "A areia encharcou. As turmas de hoje ficam para a reposição da semana.", turmas: "" },
    { data: "hoje",   tipo: "aviso",      titulo: "Camisa oficial chegou", texto: "Tamanhos P ao GG na recepção. Garanta a sua antes do torneio.", ate: "" },
    { data: "+12",    tipo: "evento",     titulo: "Torneio interno de dezembro", texto: "Chaves masculina e mista de iniciantes. Inscrição gratuita com o professor.", ate: "" },
    { data: "+30",    tipo: "evento",     titulo: "Confraternização de fim de ano", texto: "Treino festivo, GR Burger e premiação da galera que mais evoluiu.", ate: "" },
  ],
};
