/* =========================================================
   GR SPORTS · dados da página
   Tudo que muda (horários, preços, contatos) fica aqui.
   Itens marcados com CONFIRMAR foram deduzidos dos posts
   e precisam ser conferidos com o dono.
   ========================================================= */
window.DADOS = {
  nome: "GR Sports",
  slogan: "Sua praia na Ceilândia",
  instagram: "grsportsoficial",
  // Número com DDI e DDD, só dígitos. Ex.: "5561999999999".
  // Vazio: os botões abrem o Direct do Instagram e copiam a mensagem.
  whatsapp: "", // CONFIRMAR
  linkPagina: "", // CONFIRMAR: endereço final desta página

  endereco: {
    linha1: "QNM 07 Conjunto J, Lotes 1/3",
    linha2: "Ceilândia, Brasília - DF",
    cep: "72215-080",
    busca: "GR Sports, QNM 7 Conjunto J Lotes 1/3, Ceilândia, Brasília - DF, 72215-080",
  },

  // Números do perfil do Instagram (atualize de vez em quando)
  perfil: { posts: 102, seguidores: 8030, seguindo: 623 },

  modalidades: {
    futevolei: {
      nome: "Futevôlei",
      resumo: "Vôlei jogado com os pés. Vale pé, coxa, peito e cabeça. Só não vale a mão.",
      fotos: ["bicicleta-1", "cabeceio", "estrela"],
      planos: [ { vezes: 1, preco: 80 }, { vezes: 2, preco: 160 } ],
    },
    volei: {
      nome: "Vôlei de praia",
      resumo: "Fundamento do zero na areia: toque, manchete, saque e ataque, em dupla.",
      fotos: ["fundamento", "volei-praia", "bola-volei"],
      planos: [ { vezes: 1, preco: 60 }, { vezes: 2, preco: 110 } ],
    },
  },

  // Professores: os nomes não aparecem nos posts. Preencha "nome" quando souber.
  // A modalidade de cada um foi deduzida (bola de vôlei na mão, turmas no mesmo horário). CONFIRMAR
  professores: [
    { id: "p1", nome: "", modalidade: "futevolei", story: "img/story-seg-qua.webp", dias: "Segunda e quarta" },
    { id: "p2", nome: "", modalidade: "volei",     story: "img/story-ter-qui-a.webp", dias: "Terça e quinta" },
    { id: "p3", nome: "", modalidade: "futevolei", story: "img/story-ter-qui-b.webp", dias: "Terça e quinta" },
  ],

  // Grade da semana, tirada dos stories. Dias: 0 = domingo ... 6 = sábado.
  // nivel: kids | iniciante | intermediario | personal
  turmas: [
    { dias: [1, 3], hora: "18:30", nivel: "personal",      mod: "futevolei", prof: "p1" },
    { dias: [1, 3], hora: "19:30", nivel: "iniciante",     mod: "futevolei", prof: "p1" },
    { dias: [1, 3], hora: "20:30", nivel: "iniciante",     mod: "futevolei", prof: "p1" },
    { dias: [1, 3], hora: "21:30", nivel: "personal",      mod: "futevolei", prof: "p1" },
    { dias: [2, 4], hora: "19:00", nivel: "kids",          mod: "volei",     prof: "p2" },
    { dias: [2, 4], hora: "20:00", nivel: "iniciante",     mod: "volei",     prof: "p2" },
    { dias: [2, 4], hora: "21:00", nivel: "intermediario", mod: "volei",     prof: "p2" },
    { dias: [2, 4], hora: "20:00", nivel: "iniciante",     mod: "futevolei", prof: "p3" },
    { dias: [2, 4], hora: "21:00", nivel: "iniciante",     mod: "futevolei", prof: "p3" },
    { dias: [2, 4], hora: "22:00", nivel: "iniciante",     mod: "futevolei", prof: "p3" },
  ],
  duracaoTurmaMin: 60, // CONFIRMAR: duração de cada treino

  niveis: {
    kids:          { nome: "Kids",          desc: "Para crianças" },
    iniciante:     { nome: "Iniciante",     desc: "Para quem está começando" },
    intermediario: { nome: "Intermediário", desc: "Para quem já joga" },
    personal:      { nome: "Personal",      desc: "Treino individual" },
  },

  destaques: [
    {
      titulo: "Torneio interno",
      texto: "O último foi no dia 22/11, com chaves masculina e mista de iniciantes. Inscrição gratuita, troféu e brinde.",
      foto: "img/feed/torneio-interno.webp",
    },
    {
      titulo: "GR Burger",
      texto: "Burger artesanal dentro da arena, para depois do treino.",
      foto: "img/feed/burger-arena.webp",
    },
    {
      titulo: "Uniforme oficial",
      texto: "A camisa da GR Sports está à venda na arena.",
      foto: "img/feed/uniformes.webp",
    },
  ],

  galeria: [
    "bicicleta-muro", "turma-arena", "cabeceio", "campeoes-dupla", "treino-noite-1", "maos-bola",
    "kids", "estrela", "torneio-minas", "galera", "rede", "trofeus-noite", "bicicleta-2",
    "turma-feminina", "premiacao", "garoto-bola", "treino-noite-3", "abraco", "voleio",
    "turma-areia", "campeoes-1", "grafite", "placa-gr", "treino-noite-2",
  ],
};
