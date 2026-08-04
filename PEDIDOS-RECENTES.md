# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## ⏱️ DURAÇÃO CONTÍNUA DA SESSÃO ENTREGUE E PUBLICADA (04/ago/2026) — `6fcd831`, v2.72.0

**Commits:** implementação = `a6b686d` · análise de prescrição × execução = `5ed7580` · release = `6fcd831`.

### O que mudou

O motor passa a respeitar a **duração exata escolhida pelo terapeuta**. Antes, a interface aceitava de
**10 a 90 minutos** e o núcleo modelava só **20 | 30 | 40**, com a função **`nearestTarget`** arredondando
entre os dois — uma sessão de **45 min** era avaliada contra a faixa de **40** e ainda recebia o **marcador de
parâmetro não determinado** só por não ser um dos três valores.

- **`targetDurationBounds`** deriva a faixa **por percentual**: **piso 0,9 · teto 1,1 · máximo 1,2** do alvo.
  A fórmula **não é nova**: as faixas aprovadas na **Fase 2** já eram exatamente isso, apenas escritas como
  **tabela**. Por isso **20, 30 e 40 saem idênticos** a **18–22**, **27–33** e **36–44**, **sem exceção nem
  arredondamento**;
- **`nearestTarget` removido**; **`TargetMinutes` deixou de ser união literal** e a validação passou para a
  **fronteira**, em **`isTarget`**, na **mesma faixa de 10 a 90** que a interface já aceitava;
- **nenhuma duração é marcada como legada** só por não ser 20, 30 ou 40; o marcador continua para **id
  desconhecido** e **parâmetro irresolúvel**;
- **comparações de fronteira com tolerância**, para o **ruído binário** (`25 × 1,1` dá `27,500000000000004`)
  **não deslocar um estado**. Os valores exibidos saem limpos: **22,5–27,5 · 23,4–28,6 · 31,5–38,5 ·
  33,3–40,7 · 40,5–49,5 · 45–55**.

### ⚠️ Carga e fadiga NÃO foram interpoladas — decisão dela

Fora de **20/30/40**, os **quatro alertas que dependem de tabela clínica** (**`LOAD_AT_CAP`**,
**`LOAD_OVER_CAP`**, **`HIGH_FATIGUE_COUNT`**, **`PLANNING_WINDOW_COUNT`**) **não são emitidos** e
**`loadReference` fica indefinido**. **Carga, fadiga e interferência continuam calculadas e visíveis** —
**some a comparação, não o dado**. Verificado: **20 min devolve referência 7**, **30 devolve 10**,
**40 devolve 13** e **emitem** os alertas; **26, 35 e 45** devolvem **referência indefinida** e **não emitem
nenhum dos quatro**.

### Roteamento

Codex **`gpt-5.6-sol`, esforço xhigh, lab `durcont3`**. **Dois disparos anteriores falharam** — o primeiro
**travou** (ver incidente abaixo) e o segundo **parou corretamente** porque a spec do VP citava **`isTarget`**
sem listar **`legacy.ts`** entre os arquivos permitidos; o **Codex pediu autorização em vez de improvisar**,
e a **spec foi corrigida em `9b63eac`**.

**Consertos pós-colheita — Claude Opus 5 xhigh (exceção 1 da regra 8):** **quatro testes novos afirmavam
valores que contradizem o catálogo** — **`deductive-grid` é ALTA em fadiga mas MODERADA em interferência**,
**`tempo-reacao` é MODERADA nos dois eixos**, e o **teste de faixa derivada proibia uma string que aparecia
legitimamente como estimativa**. **O código estava certo nos quatro casos.**

### 🚨 Incidente de operação RESOLVIDO — causa identificada

**Vários disparos do Codex nesta sessão travaram**, ficando com o **log parado em 2 linhas** e **zero arquivos
escritos**. Cruzando os **oito disparos**, o padrão ficou claro: **TODO disparo que travou tinha o `rodar`
encadeado logo após o `preparar`** ou **após um `git commit` na mesma invocação**; **TODO disparo isolado
funcionou**. A **spec vai ao Codex por stdin**, e o **comando anterior da cadeia consome esse stdin**, deixando
o Codex **esperando uma entrada que já foi engolida**.

**REGRA PERMANENTE:** disparar **`lab.sh rodar` sempre em invocação própria, nunca encadeado**. E **armar um
vigia a cada disparo** — um **loop em segundo plano** que avisa quando o **log cresce** (saudável) ou quando
passam **15 a 25 minutos sem progresso** (travado), para o **VP descobrir sozinho** em vez de depender de ela
perguntar.

### Provas (repositório real)

`npx tsc --noEmit` exit 0 · `npx vitest run` **453/453** em **34 arquivos** (eram **405** → **+48**) ·
`npm run build` exit 0 · **`canSave` true**.
**Escopo:** só **`lib/prescription/`** — **nenhum componente, banco, API, migration, protocolo, dose, nível ou
progresso tocado**.

### ✅ Publicação confirmada por evidência

`/api/version` → `{"appVersion":"2.72.0","buildId":"dpl_B1txCkhzVnFtdq5wA6NaTaSWNggi"}` · `/api/health` →
`{"ok":true}` · `git merge-base` confirmou que **`a6b686d` está contido em `6fcd831`**.

### 🧭 Decisão arquitetônica registrada em `5ed7580` (`10-prescription-execution-real-time.md`), aprovada por ela

A **duração-alvo é META ESTIMADA, não cronômetro de interrupção**. Os **três tempos ficam formalmente
separados**: **duração-alvo prescrita**, **duração estimada** e **duração real**. **Tempo acima ou abaixo da
estimativa é dado clínico, não erro.**

### Conclusão da análise do runtime, aprovada por ela — NÃO HÁ CORREÇÃO NECESSÁRIA

A **duração-alvo não interrompe a execução**; **`sessionDuration` nunca chega ao lado do paciente**; o
**paciente pode concluir todos os exercícios prescritos**; os **exercícios temporizados encerram ENTRE
unidades**, **preservando a tentativa em andamento**, conforme a **`terminationPolicy` aprovada na Fase 2**.
**DECISÃO EXPLÍCITA DELA:** **não remover nem alterar `isTimeUp()`** dos exercícios **`CONTINUOUS_TIMED`**.

### 🔎 Achado a preservar

**`Session.duration` guarda TEMPO ATIVO, não tempo de relógio** — **`elapsedSec` devolve `activeMs/1000`**, e
**`activeMs` só acumula com interação nos últimos 15 segundos**. O **dado existente mede engajamento, não
permanência**; **pausa e interrupção não são registradas em lugar nenhum**.

### 📌 Fase futura separada, NÃO INICIADA — "Execução e histórico das sessões"

Deverá **distinguir**: **duração-alvo prescrita**, **duração estimada**, **tempo ativo**, **tempo total
decorrido**, **pausas**, e **conclusão integral ou parcial**.

**NÃO IMPLEMENTAR AINDA (lista explícita dela):** **tempo de parede** · **pausas** · **sessão como entidade de
execução** · **histórico de sessões** · **comparação estimado × realizado** · **alterações de banco** ·
**alterações no runtime** · **presets 20/35/50**.

### ⏸️ PRÓXIMO PASSO — PARADO. Nenhuma fase nova iniciada.
```

---

**O QUE MUDOU**

- `/Users/kamyllahonorio/neuropeak/PROGRESSO.md`: bloco novo inserido no topo, imediatamente após as 5 linhas de cabeçalho e antes do bloco `## 🪟 REFINO DE UX ... v2.71.0`. Estilo seguiu o dos blocos existentes: título com emoji + caixa alta + data + hash de release + versão, linha de commits com separador `·`, subseções `###`, negrito nos dados decisivos, alertas com ⚠️/🚨, provas em bloco próprio, publicação com ✅, e fecho `### ⏸️ PRÓXIMO PASSO`. Único ajuste editorial: "versus" grafado como `×`, convenção já usada no arquivo ("estimado × realizado" segue o padrão de "prescrição × execução").

**COMO PROVEI**

- `git status --short` → exit 0, saída ` M PROGRESSO.md` (nenhum outro arquivo tocado, nenhum untracked criado).
- `git diff --stat` → exit 0, `1 file changed, 100 insertions(+)` — zero deleções, ou seja, nada do conteúdo anterior foi alterado ou perdido.
- `git diff -U0` → exit 0, cabeçalho de hunk único `@@ -5,0 +6,100 @@`, confirmando inserção pura começando na linha 6 (topo, após o cabeçalho); a cauda do diff mostra o bloco terminando logo antes do título da v2.71.0.
- `wc -l PROGRESSO.md` → exit 0, 1328 → 1428 linhas.
- `git cat-file -t` nos 4 hashes citados → exit 0 em todos; assuntos conferem: `a6b686d` = feat duração contínua, `5ed7580` = docs decisão, `6fcd831` = chore release v2.72.0, `9b63eac` = docs spec incluindo `legacy.ts`.
- Nenhum commit executado — `git status` continua acusando a modificação pendente para o VP.

**O QUE NÃO FIZ**

- Não commitei, não fiz push, não criei branch nem stash.
- Não toquei em nenhum arquivo além do `PROGRESSO.md` — nem `CLAUDE.md`, nem `ESTADO-DO-PROJETO.md`, nem `docs/`, nem código.
- Não re-executei as provas técnicas do despacho (`tsc`, `vitest`, `build`, `/api/version`, `/api/health`): foram transcritas como fato reportado pelo VP, não verificadas por mim nesta tarefa. Do lado das provas, o que verifiquei de forma independente foi apenas a existência e o assunto dos 4 commits citados.
- Não registrei nada no arquivo de roteamento nem em memória — o despacho pedia somente o bloco no `PROGRESSO.md`.</result>
<usage><subagent_tokens>30188</subagent_tokens><tool_uses>6</tool_uses><duration_ms>102310</duration_ms></usage>
</task-notification>

## 04/08/2026 20:05
Finalizamos uma etapa importante da arquitetura da prescrição.

Antes de abrir qualquer nova fase estrutural, quero voltar o foco para aquilo que realmente determina a qualidade clínica da plataforma: os exercícios.

A partir deste momento, vamos trabalhar exercício por exercício.

O objetivo não é apenas corrigir bugs.

Quero revisar profundamente:

- objetivo cognitivo;
- validade clínica do treino;
- mecânica;
- progressão;
- adaptação de dificuldade;
- feedback ao paciente;
- tutorial;
- interface;
- motivação ao longo das sessões;
- sensação de evolução;
- métricas registradas;
- quais indicadores realmente importam para o terapeuta;
- quais dados serão usados futuramente na evolução clínica.

A cada exercício quero seguir este fluxo:

1. análise do exercício atual;
2. identificar limitações clínicas e de UX;
3. propor melhorias;
4. validar a arquitetura antes de qualquer código;
5. implementar;
6. testar;
7. publicar;
8. passar para o próximo exercício.

Não abrir novas frentes arquitetônicas em paralelo.

Vamos evoluir um exercício por vez, até que os 34 estejam no padrão clínico e de experiência que buscamos.

Primeiro exercício da próxima etapa: Tutorial e experiência inicial de execução.

Não implementar ainda.

Quero primeiro uma análise completa do fluxo atual do tutorial, da entrada do paciente no exercício, do início da sessão e da experiência de primeira utilização, tomando como referência também as observações que fizemos sobre o Cogmed.

Ao final, apresente apenas a análise e aguarde minha validação.

## 04/08/2026 20:32
A análise está aprovada. Vamos consolidar as decisões antes de implementar.

==================================================
DECISÕES — TUTORIAL E ENTRADA NO EXERCÍCIO
==================================================

1. MEMÓRIA DO TUTORIAL

A informação de que o tutorial foi concluído deve ser armazenada no banco, por:

- paciente;
- exercício.

Não usar localStorage como fonte principal.

Motivo:

- o paciente pode trocar de dispositivo;
- pode treinar parte em casa e parte na clínica;
- o terapeuta precisa ter um estado consistente;
- a experiência não pode depender do navegador utilizado.

O localStorage poderá existir apenas como apoio técnico temporário, nunca como fonte de verdade.

Antes de implementar, analisar a modelagem mínima necessária e o impacto sobre banco, API e compatibilidade.

==================================================
2. PRIMEIRA UTILIZAÇÃO
==================================================

Na primeira vez que o paciente abrir determinado exercício:

- apresentar o tutorial automaticamente;
- o tutorial deve ser obrigatório antes do treino real;
- ao concluir o tutorial, retornar para a tela de preparação ou oferecer “Começar treino”.

O tutorial não pode:

- contar como tentativa clínica;
- alterar nível;
- alterar progressão;
- registrar pontuação;
- interferir nas métricas do exercício;
- ser contabilizado como parte da dose prescrita.

==================================================
3. UTILIZAÇÕES SEGUINTES
==================================================

Depois que o tutorial daquele exercício já tiver sido concluído, o paciente deve encontrar uma tela de preparação simples:

NOME DO EXERCÍCIO

Nível atual, quando aplicável.

[ Começar ]

[ Como funciona ]

“Começar” inicia imediatamente o treino real.

“Como funciona” abre novamente o tutorial completo por escolha do paciente.

O tutorial nunca deve reaparecer automaticamente depois de concluído, salvo se:

- o terapeuta futuramente redefinir esse estado;
- houver uma mudança incompatível na mecânica do exercício;
- existir uma nova versão do tutorial que exija reapresentação.

Não implementar ainda redefinição pelo terapeuta, mas deixar a arquitetura preparada para isso.

==================================================
4. ESTRUTURA GLOBAL DO TUTORIAL
==================================================

Todos os exercícios deverão seguir um único fluxo:

1. Demonstração
2. Sua vez
3. Validação
4. Conclusão

DEMONSTRAÇÃO

- o sistema executa um exemplo real;
- utiliza os mesmos componentes e regras visuais do exercício;
- não usar animação meramente ilustrativa que diverge do jogo;
- texto mínimo;
- sem explicações longas.

SUA VEZ

- o paciente realiza uma única tentativa guiada;
- dificuldade inicial simples;
- objetivo apenas de confirmar compreensão;
- não representa o nível clínico do paciente.

VALIDAÇÃO

Se acertar:

“Você entendeu como funciona.”

[ Começar treino ]

Se errar:

- apresentar orientação curta;
- repetir somente a tentativa guiada;
- não reiniciar todo o tutorial;
- não registrar o erro como desempenho clínico;
- não reduzir nível.

==================================================
5. PADRÃO DE ETAPAS
==================================================

O tutorial global deverá ter uma única sequência lógica.

Os exercícios que hoje possuem duas ou três etapas precisam ser auditados.

Não reduzir mecanicamente todos para “um slide”.

A regra correta é:

- uma demonstração contínua;
- uma tentativa guiada;
- uma conclusão.

Caso a mecânica realmente possua decisões distintas, elas devem ocorrer dentro dessa mesma demonstração, sem obrigar o paciente a atravessar vários tutoriais separados.

Não manter tutoriais repetitivos apenas porque foram implementados historicamente em mais de uma etapa.

==================================================
6. TELA TEXTUAL DE INSTRUÇÕES
==================================================

A tela atual com:

- lista numerada;
- cenário funcional;
- estratégias;
- botão “Iniciar”;

não deve continuar como etapa obrigatória antes de todo treino.

Evitar a sequência atual:

instruções textuais
→ tutorial interativo
→ treino.

Isso duplica explicações e aumenta a carga cognitiva antes da tarefa.

A futura tela “Como funciona” poderá reunir:

- tutorial demonstrativo;
- explicação textual opcional;
- cenário funcional;
- estratégias.

Mas o paciente não deve ser obrigado a ler essas informações em todas as sessões.

==================================================
7. RESULTADO E PERCEPÇÃO DE EVOLUÇÃO
==================================================

A tela final precisa comunicar evolução sem utilizar comparação punitiva.

Quando houver subida de nível:

“Você avançou para o nível X.”

Quando mantiver o nível:

“Treino concluído. Você manteve seu nível.”

Quando a sessão tiver maior dificuldade ou eventual redução adaptativa:

“Treino concluído. Hoje esta atividade exigiu mais esforço.”

Não usar:

- “você piorou”;
- “você regrediu”;
- “seu desempenho caiu” como mensagem principal ao paciente;
- mensagens que incentivem competição com sessões anteriores.

A informação técnica completa permanece disponível ao terapeuta.

A comunicação ao paciente deve reforçar:

- conclusão;
- esforço;
- continuidade;
- progressão quando existente.

==================================================
8. TELA DE PREPARAÇÃO
==================================================

Padronizar uma tela global antes do início de cada exercício.

Mostrar somente o necessário:

- nome oficial do exercício;
- nível atual, quando aplicável;
- botão “Começar”;
- botão “Como funciona”.

Não mostrar excesso de métricas antes do treino.

Não mostrar recorde como elemento principal.

Não mostrar carga, fadiga, protocolo clínico ou dados destinados ao terapeuta.

==================================================
9. FRAMEWORK GLOBAL
==================================================

Não corrigir os 34 exercícios individualmente antes de definir o framework.

Primeiro criar uma arquitetura reutilizável que controle:

- tela de preparação;
- estado de tutorial concluído;
- demonstração;
- tentativa guiada;
- validação;
- conclusão;
- início do treino;
- reabertura voluntária do tutorial.

Cada exercício deverá fornecer apenas sua lógica específica, por exemplo:

- demonstração real;
- tentativa guiada;
- regra de validação;
- mensagens específicas estritamente necessárias.

Não permitir que cada exercício volte a inventar seu próprio fluxo.

==================================================
10. IMPLEMENTAÇÃO EM FASES
==================================================

Antes do código, apresentar uma proposta em fases:

FASE T1
- modelagem do estado “tutorial concluído”;
- contrato global;
- tela de preparação;
- nenhuma conversão dos exercícios ainda.

FASE T2
- implementar o framework;
- converter 1 ou 2 exercícios-piloto representativos;
- validar experiência e persistência.

Sugestão de pilotos:
- um exercício simples e visual;
- um exercício auditivo ou operacionalmente complexo.

FASE T3
- converter os exercícios restantes em lotes seguros;
- auditar os tutoriais com 2 ou 3 etapas;
- garantir réplica real da mecânica.

FASE T4
- padronizar tela de resultado e comunicação de evolução.

Não iniciar todas as fases de uma vez.

==================================================
11. ANÁLISE OBRIGATÓRIA ANTES DO CÓDIGO
==================================================

Antes de implementar, responder:

1. Onde e como armazenar tutorial concluído por paciente e exercício.
2. Se já existe entidade ou tabela adequada que possa ser estendida.
3. Se será necessária migration.
4. Quais APIs precisarão ler e gravar esse estado.
5. Como versionar o tutorial para reapresentá-lo após mudança relevante de mecânica.
6. Como garantir que o tutorial não altere progressão nem métricas.
7. Quais componentes atuais podem ser reutilizados.
8. Quais tutoriais não são réplicas reais da mecânica.
9. Quais exercícios possuem 1, 2 ou 3 etapas.
10. Quais dois exercícios são os melhores pilotos e por quê.
11. Quais arquivos seriam alterados na Fase T1.
12. Quais testes serão necessários.
13. Quais decisões clínicas ainda dependem da minha validação.

Não implementar ainda.

Criar um documento arquitetônico novo, preservar os documentos anteriores e parar para minha validação.
