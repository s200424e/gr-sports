# Área do aluno · GR Sports

Página: `.../gr-sports/aluno/`. Ela não tem login. Mande o link no grupo dos alunos.
O nome e a turma de cada aluno ficam salvos só no celular dele.

## Pegar com o dono (em `dados-aluno.js` e `../js/dados.js`)
- **WhatsApp da GR** (`whatsapp` em `../js/dados.js`). Sem ele, as mensagens vão pelo Direct do Instagram.
- **Chave Pix** e o nome do recebedor como aparece no banco (`pix`). Sem ela, o botão vira "Pedir dados do Pix".
- **Dia de vencimento** da mensalidade (`vencimentoDia`).
- **Link do grupo** dos alunos no WhatsApp (`grupoWhatsApp`).
- **Combinados**: os que estão lá são sugestões. Ele confirma, tira ou troca.

## Planilha de avisos (o dono atualiza pelo celular)
1. Crie uma planilha no Google Planilhas com a conta da GR.
2. Importe `modelo-avisos.csv` (Arquivo > Importar) ou copie a primeira linha:
   `Data | Tipo | Título | Texto | Até | Turmas`
3. Vá em Arquivo > Compartilhar > **Publicar na Web**. Escolha a aba e o formato **CSV** e clique em Publicar.
4. Copie o link gerado e cole em `planilhaCSV` no `dados-aluno.js`. Publique a página.

### Como o dono preenche
| Coluna | O que escrever |
| --- | --- |
| Data | `25/11/2026` ou `25/11` |
| Tipo | `Sem treino` (chuva, feriado), `Aviso`, `Horário` (mudança) ou `Evento` (torneio, festa) |
| Título | A frase principal. Ex.: "Choveu forte: sem treino hoje" |
| Texto | Detalhes (opcional) |
| Até | Até quando o aviso aparece (opcional). Sem data, um aviso fica 7 dias |
| Turmas | Só para "Sem treino": `19h, 20h` cancela só essas. Vazio cancela o dia todo |

- **Sem treino** no dia de hoje: as turmas aparecem riscadas como "Cancelada" no topo da página.
- **Evento** vai para a Agenda, com contagem de dias.
- Aviso com data futura só aparece no dia. "Sem treino" e "Evento" aparecem antes.
- O Google leva até 5 minutos para atualizar a planilha publicada.
- Enquanto `planilhaCSV` está vazio, a página mostra avisos de exemplo e uma faixa "Modo demonstração".
