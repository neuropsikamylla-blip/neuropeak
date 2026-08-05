# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 21:45
A análise está aprovada.
Antes de registrar essa política como regra permanente, faça dois ajustes.
1. Justificativa da ferramenta
Não afirme que o pg_dump é superior à Supabase CLI.
A recomendação deve ser baseada em critérios arquitetônicos.
Adote como justificativa:
pg_dump é a ferramenta oficial do PostgreSQL;
independe do fornecedor;
é amplamente documentada;
funciona mesmo que o banco deixe de estar hospedado no Supabase;
fornece um procedimento estável e de longo prazo para o projeto.
Evite desqualificar a Supabase CLI. Apenas explique por que pg_dump será o padrão adotado.
2. Política permanente de backup
Não exigir restauração completa de teste para absolutamente toda alteração de schema.
Diferencie dois cenários.
Alterações aditivas de baixo risco, por exemplo:
novas colunas opcionais;
novos índices;
novos enums;
novas tabelas sem migração de dados.
Nesses casos, exigir obrigatoriamente:
backup lógico imediatamente anterior;
validação da integridade do arquivo gerado.
Alterações destrutivas ou migrações de dados, por exemplo:
DROP;
ALTER COLUMN;
remoção de colunas;
conversão de tipos;
updates em massa;
migração de dados existentes.
Nesses casos, manter obrigatória:
geração do backup;
restauração de teste do backup antes da alteração em produção.
Atualize o procedimento operacional, o RUNBOOK e o CLAUDE.md com essa distinção.
Não executar nenhuma alteração no banco ainda.

## 04/08/2026 21:57
A política está aprovada.
Peço apenas um refinamento na classificação de risco.
Não classifique genericamente "enum" como alteração de baixo risco.
A classificação deve considerar o impacto real da alteração, e não apenas o tipo do objeto.
Exemplos:
Nível 1 (aditivo)
nova coluna opcional;
novo índice;
nova tabela;
novo enum ainda não utilizado;
nova coluna utilizando um enum recém-criado, sem conversão de dados existentes.
Nível 2 (estrutural ou migração)
alteração de enum existente;
conversão de coluna existente para enum;
alteração de tipo de coluna;
DROP;
ALTER COLUMN;
remoção de colunas;
UPDATE ou DELETE em massa;
qualquer migração de dados existentes.
A regra permanente deve continuar baseada na leitura do SQL gerado (prisma migrate diff --script) e, principalmente, no impacto efetivo da alteração.
O objetivo é evitar que, no futuro, alguém interprete "enum = baixo risco" como uma regra geral quando isso só é verdadeiro para enums novos e sem migração de dados.
Depois desse ajuste, considero a política operacional consolidada.

## 04/08/2026 22:03
A política operacional de backup está consolidada e aprovada.

Antes de iniciar o pg_dump e a implantação da T1, quero registrar uma nova decisão clínica sobre a prescrição. Não implementar ainda.

==================================================
DECISÃO ARQUITETÔNICA — ORDEM PRESCRITA X ORDEM REAL DE EXECUÇÃO
==================================================

O paciente realizará o treino em casa e poderá escolher por qual exercício começar, de forma semelhante ao Cogmed.

O plano pode apresentar uma ordem sugerida ou uma organização visual definida pelo terapeuta, mas essa ordem não deve ser tratada automaticamente como a ordem real de execução.

Portanto, precisamos distinguir:

1. ORDEM SUGERIDA
- organização proposta pelo terapeuta;
- útil para apresentação e orientação;
- pode ser seguida ou não pelo paciente.

2. ORDEM REAL
- sequência efetivamente escolhida pelo paciente durante a sessão;
- só pode ser conhecida após a execução;
- deverá ser registrada futuramente no histórico da sessão.

==================================================
IMPACTO SOBRE OS ALERTAS ATUAIS
==================================================

Alertas que dependem de consecutividade ou posição não podem ser apresentados como fatos da futura execução quando o paciente possui liberdade de escolha.

Reavaliar especialmente:

- HIGH_FATIGUE_ADJACENT;
- HIGH_INTERFERENCE_ADJACENT;
- PLANNING_WINDOW_ADJACENT;
- HIGH_FATIGUE_POSITION;
- OUTSIDE_BEST_POSITION;
- atividade pouco indicada para o encerramento;
- qualquer regra baseada em “início”, “meio”, “fim”, “sequência” ou “consecutivo”.

Exemplos problemáticos:

- “Fadiga alta em sequência”;
- “Interferência alta em sequência”;
- “Planejamento consecutivo”;
- “Atividade pouco indicada para o encerramento”;
- “Posição preferencial”.

Essas afirmações só são válidas se:

- a ordem for obrigatória e controlada pelo sistema; ou
- forem calculadas posteriormente sobre a ordem realmente executada.

Se a ordem for apenas sugerida, o máximo que pode aparecer na prescrição é algo como:

- “Na ordem sugerida, estes exercícios aparecem consecutivamente”;
- “Caso o paciente siga esta ordem, poderá haver maior concentração de fadiga”;

e mesmo assim precisamos avaliar se isso realmente ajuda ou apenas gera ruído.

==================================================
O QUE CONTINUA VÁLIDO NA PRESCRIÇÃO
==================================================

Análises independentes da ordem continuam potencialmente úteis:

- duração estimada do conjunto;
- quantidade de exercícios com alta fadiga;
- composição por domínio;
- sobreposição de processos cognitivos;
- concentração de treino;
- carga total, quando houver referência clínica validada;
- presença de múltiplos exercícios com características semelhantes.

A observação clínica sobre sobreposição em planejamento permanece útil:

- Estacionamento Lógico;
- Jogo das Torres;
- recrutamento de processos de planejamento semelhantes;
- possibilidade de concentração intencional em plano focal.

==================================================
PRINCÍPIO DE INTERFACE
==================================================

A tela da prescrição não deve expor todas as regras internas do motor.

Ela deve responder apenas:

“Existe algo neste conjunto de exercícios que merece atenção clínica antes de salvar?”

Não mostrar métricas técnicas sem tradução clínica, por exemplo:

- “carga basal 11 / referência 10” como dado principal;
- códigos ou escalas internas;
- repetições da mesma informação;
- afirmações sobre posição que talvez não se concretizem.

O motor pode continuar calculando dados internamente, mas a interface deve apresentar somente informações que:

- sejam verdadeiras;
- sejam clinicamente interpretáveis;
- possam mudar ou qualificar uma decisão do terapeuta;
- não presumam comportamento futuro do paciente.

==================================================
ANÁLISE OBRIGATÓRIA
==================================================

Antes de qualquer código, responder:

1. Hoje o paciente pode escolher livremente o primeiro exercício e os seguintes?
2. A ordem prescrita é tecnicamente obrigatória em algum ponto do runtime?
3. Quais alertas atuais dependem da ordem planejada?
4. Quais deles deixam de ser válidos se a ordem for livre?
5. Quais podem permanecer apenas como análise da “ordem sugerida”?
6. Quais devem sair completamente da prescrição e migrar futuramente para a análise da execução real?
7. Quais informações atuais são apenas métricas internas sem tradução clínica útil?
8. Quais observações realmente ajudam o terapeuta a revisar a composição?
9. Como reduzir o bloco atual para um conjunto pequeno de insights clinicamente relevantes?
10. Quais arquivos e documentos seriam afetados numa futura implementação?

Criar um documento arquitetônico novo.

Não alterar código.
Não alterar interface.
Não tocar no banco.
Não interromper a T1 já aprovada.
Não iniciar implementação.
Pare após apresentar a análise.
