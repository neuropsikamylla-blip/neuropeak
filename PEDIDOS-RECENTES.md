# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O QUE NÃO FIZ

- **Não commitei.** Mas registro o fato desagradável: o **hook de checkpoint automático** dela varreu a árvore às 15:56:30 e criou `95e89e5 checkpoint automatico (salvamento de seguranca)` levando junto `PROGRESSO.md` (+ os dois `PEDIDOS-*.md`). Não foi ato meu e não tenho como impedi-lo; se você queria o `PROGRESSO.md` num commit descritivo seu, ele já está dentro do checkpoint — decida se refaz a mensagem no seu próximo commit.
- Não rodei `npm run build` (proibido no despacho), nem `npm run lint`.
- Não toquei em `lib/grade/`, em `components/`, nem em nenhum código; não editei o `registro-roteamento.md` em linha antiga; não mexi em configuração.
- Não abri nem analisei `~/codex-lab/saida-grade-f3-20260903.txt` — só medi o tamanho para provar que o disparo está vivo. Leitura de colheita é sua.
- Não verifiquei o banco de produção (a ressalva sobre `ExerciseAttempt` entrou no PROGRESSO como ressalva, não como fato).</result>
<usage><subagent_tokens>52544</subagent_tokens><tool_uses>22</tool_uses><duration_ms>257563</duration_ms></usage>
</task-notification>

## 03/09/2026 16:06
<task-notification>
<task-id>by6f38701</task-id>
<tool-use-id>toolu_013vJLK1xGqrBxcq1UUmsgdJ</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/af26ae96-821d-4dce-abd1-d20a017fa7f8/tasks/by6f38701.output</output-file>
<status>completed</status>
<summary>Background command "Disparar Codex na Fase 3 da Grade Dedutiva" completed (exit code 0)</summary>
</task-notification>

## 03/09/2026 16:42
Fase 3 tecnicamente aprovada, mas NÃO quero avançar ainda para instrumentação/adaptação definitiva.
Primeiro precisamos validar a experiência real da interface.
1. Não altere mais a mecânica agora.
Quero abrir e testar a Grade em desktop e mobile antes de fechar o UX.
2. Mantenha a fórmula atual de accuracy explicitamente PROVISÓRIA.
Não quero transformá-la em métrica definitiva. Na Fase 6 vamos reconstruir a decisão adaptativa usando múltiplos indicadores de processo, e não apenas tentativas de conclusão incorreta.
3. Preserve a separação que você corrigiu entre:
atribuição realizada quando a relação ainda não estava determinada;
atribuição realizada quando o estado já estava contraditório.
Não voltar a misturar os dois.
4. Dosagem: um único problema por sessão NÃO é o desenho final.
A Grade precisa caber no framework temporal da plataforma e permitir uma sequência de problemas dentro da sessão, porque futuramente precisamos conseguir fazer:
problema misto → focalizado → transferência
quando houver tempo.
Antes de alterar, audite como os demais exercícios encerram por tempo/progresso e proponha como integrar a Grade ao mesmo framework.
5. Tutorial: não quero o 3×3 obrigatório em toda sessão.
Ele deve funcionar como aquisição da mecânica, preferencialmente na primeira utilização. Depois disso, o paciente deve entrar diretamente no treino real.
Audite como a plataforma registra tutorial já realizado e proponha a integração antes de mudar.
6. Solver: não otimizar ainda por suposição.
Faça benchmark da interação no maior tamanho planejado, especialmente 5 posições × 6 categorias, porque hoje há duas buscas por clique.
Quero tempos reais antes de decidir se precisa cache, incremental solving ou outra otimização.
7. Próximo passo imediato:
não mexer em Fase 4 ainda.
Primeiro eu vou abrir a Grade e avaliar:
legibilidade;
tamanho da grade;
funcionamento dos selects;
pistas;
pistas riscadas;
duplicidade em âmbar;
Verificar raciocínio;
Concluir;
desktop;
mobile.
Depois da revisão visual, fechamos a interface e seguimos. e abre ela aqui pra eu ver
