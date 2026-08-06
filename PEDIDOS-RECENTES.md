# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 21:57
A validação mostrou que a infraestrutura da T1 está funcionando, mas nenhum exercício ainda foi convertido para o novo framework.
O Span Numérico Auditivo Direto e o Span Numérico Auditivo Inverso continuam utilizando apenas a antiga tela de instruções. Isso não será considerado o tutorial da T1.
A partir deste momento vamos mudar a estratégia.
Não vamos converter os 34 exercícios ainda.
Primeiro vamos construir e validar o padrão definitivo do framework utilizando apenas um exercício.
O Span Numérico Auditivo Direto será o exercício de referência da T1.
Quero que ele represente exatamente como deverá funcionar o tutorial de todos os demais exercícios.
O fluxo deverá ser:
Preparação
informações essenciais para iniciar;
apenas explicar a interação;
não ensinar estratégias cognitivas.
↓
Tutorial
demonstração utilizando exatamente a mecânica real;
tentativa guiada;
feedback;
possibilidade de repetir apenas a tentativa guiada em caso de erro;
encerramento do tutorial.
↓
Treino
início da primeira tentativa clínica;
sem qualquer influência do tutorial em Session, currentDifficulty, totalAttempts, lastAttemptAt, pontuação ou qualquer métrica clínica.
Além disso:
a preparação deixa de ser chamada de tutorial;
preparação e tutorial passam a ser duas etapas diferentes;
toda a arquitetura criada para esse exercício deverá ser reutilizada pelos demais.
Ainda não converter o Span Inverso nem qualquer outro exercício.
Quero primeiro validar visualmente e funcionalmente o Span Direto.
Depois de aprovado, ele passa a ser o padrão oficial da T1 e então converteremos os exercícios por grupos de interação (áudio, clique, arrastar, planejamento etc.), reutilizando o mesmo framework.

## 05/08/2026 22:03
Continue exatamente do bloco EM ANDAMENTO registrado no PROGRESSO.md e da especificação:

docs/T1-SPAN-DIRETO-EXERCICIO-DE-REFERENCIA.md

Não reabra decisões já aprovadas.

Implemente somente o Span Numérico Auditivo Direto como exercício de referência da T1.

O fluxo obrigatório é:

Preparação
→ demonstração com a mecânica real de áudio
→ tentativa guiada
→ feedback e repetição em caso de erro
→ confirmação de conclusão
→ treino clínico real

Regras:

- não converter o Span Inverso;
- não converter nenhum outro exercício;
- não alterar a mecânica clínica ou a progressão do Span nesta etapa;
- não criar Session durante o tutorial;
- não alterar currentDifficulty, totalAttempts, lastAttemptAt, pontuação, acurácia ou métricas clínicas;
- não exibir os números escritos durante a apresentação auditiva;
- a tentativa guiada deve usar dificuldade abaixo da clínica;
- ao concluir, gravar tutorialSource = PATIENT;
- segunda abertura deve pular o tutorial automaticamente.

Antes de publicar:

- revisar o diff;
- rodar prisma validate e generate;
- rodar TypeScript;
- rodar a suíte completa;
- rodar o build;
- provar o isolamento clínico comparando os dados antes e depois;
- parar para minha validação visual antes de converter qualquer outro exercício.

## 05/08/2026 22:24
Use um paciente técnico de teste exclusivo para a validação do Span Numérico Auditivo Direto.

Não utilizar paciente real e não alterar o registro BACKFILL existente.

O paciente de teste deve começar sem ExerciseConfig para span-numerico, para que o tutorial seja exibido naturalmente.

Quando o Codex concluir:

1. revise o diff linha a linha;
2. confirme que os outros 33 exercícios permanecem inalterados;
3. rode todos os gates;
4. publique somente o Span Direto convertido;
5. não converta o Span Inverso;
6. pare para minha validação visual.

Na validação, quero confirmar:

- Preparação;
- demonstração real por áudio;
- tentativa guiada;
- feedback;
- repetição apenas da tentativa guiada em caso de erro;
- transição clara para o treino;
- segunda abertura sem tutorial;
- nenhuma alteração em Session, currentDifficulty, totalAttempts, lastAttemptAt, pontuação, acurácia ou progressão.

Não execute nenhuma escrita em paciente real.
