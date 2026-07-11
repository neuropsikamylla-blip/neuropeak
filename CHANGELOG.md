# Changelog — NeuroPeak

Todas as mudanças notáveis do projeto. Formato inspirado em
[Keep a Changelog](https://keepachangelog.com/pt-BR/); versionamento em `package.json`
(**patch** = fixes/UI, **minor** = novos exercícios/fluxos).

Este changelog foi iniciado a partir do estado atual (2026-07-10, v2.11.1). O
histórico completo anterior está no log do Git (452 commits no total, a partir de `ef99025`).

## [Não lançado]

- Auditoria completa do código (5 dimensões + verificação adversarial) documentada em
  `docs/auditoria/AUDITORIA-2026-07-10.md`; dívida técnica em `docs/DIVIDA-TECNICA.md`.
  Documentação (CLAUDE.md, README.md, ARCHITECTURE.md, ADRs) reescrita a partir do
  código real.

## [2.17.1] — 2026-07-11

- **Imagens muito mais rápidas em todos os jogos:**
  - Otimização das imagens usadas pelo app: 421 MB → 110 MB (−74%; histórias 193→51 MB,
    pet 136→7 MB, descubra 33→15 MB, restaurante 19→9 MB, ícones 12→4 MB…). 1.530 PNGs
    verificados um a um contra o original: transparência 100% preservada, 0 corrompidos.
    Originais em backup fora do repositório (~/neuropeak-asset-backups/2026-07-11).
  - Cache de 7 dias para as imagens (`/exercises`, `/pet`, `/petimg`, `/skilltree`): as
    visitas seguintes carregam instantaneamente (antes o navegador re-baixava tudo a cada
    visita — `max-age=0`).
- **Restaurante:** pré-carrega as imagens da rodada (cenas, pratos e fundo da bancada) e
  só mostra o salão com a cena pronta ("Preparando o salão…" discreto, máx. 2,5 s) — o
  cronômetro de memorização e a narração só começam com a cena visível. Plaquinha do pedido
  e painel "Mudança no pedido" agora em vidro translúcido elegante (blur + tom quente).

## [2.17.0] — 2026-07-11

- **Estacionamento Lógico — contagem por quadradinho + regra rígida de treino:**
  - Cada **casa (quadradinho)** que um carro anda passa a contar como 1 movimento (antes, uma
    "puxada" inteira contava como 1). O "Melhor solução" agora é o mínimo de quadradinhos,
    calculado por um solver BFS; o movimento de saída do carro vermelho conta só até a casa
    de saída (não penaliza o empurrão extra).
  - Ao concluir: **exato** → "Perfeito!" e avança; **1 a mais** → avisa e deixa o paciente
    escolher seguir ou refazer; **2 ou mais a mais** → precisa refazer a fase (é treino).

## [2.16.0] — 2026-07-11

- **Estacionamento Lógico — tutorial prático:** o exercício (que caía direto no jogo) agora
  começa com uma **fase-tutorial guiada de 2 carros**, usando o arraste real. A instrução
  guia passo a passo (tirar o carro que bloqueia; depois deslizar o vermelho até a saída) e,
  ao resolver, mostra "Muito bem!" e um botão para começar o jogo de verdade. O tutorial não
  conta nas estatísticas/dificuldade.

## [2.15.2] — 2026-07-11

- **Jogo das Torres:** o disco desliza de forma suave ao trocar de torre — a animação
  deixou de "quicar" no fim (mola trocada por movimento com aceleração/desaceleração natural).

## [2.15.1] — 2026-07-11

- **Jogo das Torres — tutorial que ensina de verdade:** o tutorial agora é interativo — o
  paciente resolve um quebra-cabeça de **2 discos** guiado passo a passo (a torre certa fica
  destacada e só o toque correto é aceito). No 2º passo o disco grande vai **direto ao
  Destino**, ensinando na prática que o pino do meio é só um apoio. As torres do tutorial
  também ganharam o tom de madeira. O texto de instrução foi removido da tela de jogo
  (fica mais limpo; o tutorial explica).

## [2.15.0] — 2026-07-11

- **Jogo das Torres (Torre de Hanói):**
  - Tutorial mais claro: novo passo explica que o pino do meio é só um apoio e que dá para
    mover o disco **direto para o Destino** (antes muitos achavam que era obrigatório passar
    pelo pino auxiliar); textos revisados.
  - Torre (haste) mais grossa e em **tom de madeira**, e a coluna inteira ganhou uma zona
    tocável visível — mais fácil de acertar o clique/toque.

## [2.14.2] — 2026-07-11

- **Progresso do paciente:** a lista "Sessões recentes" passa a mostrar o **nome amigável**
  do exercício (ex.: "Busca Rápida") em vez do código técnico (ex.: "corrida-tempo").

## [2.14.1] — 2026-07-11

- **Itens menores da auditoria (P3):**
  - Exercícios de memória (Lista com Distração, Sequência de Itens, Letras/Sílabas,
    Padrões com Rotação): o cabeçalho durante o jogo passa a mostrar o **nível atual**, não
    o nível inicial fixo (CORR-017).
  - Login: comparação de senha/PIN roda em **tempo constante** mesmo quando a conta não
    existe, para não dar pra descobrir contas medindo a latência (SEC-005).
  - Relatório: nome do arquivo PDF sanitizado (remove aspas/acentos/caracteres especiais) (SEC-007).

## [2.14.0] — 2026-07-11

- **PIN do paciente visível para o terapeuta.** Antes o PIN só ficava com hash (login) e
  não podia ser consultado depois — era preciso gerar um novo toda vez. Agora o PIN é
  guardado também em forma legível (`Patient.pinPlain`) e mostrado na página do paciente
  (oculto por padrão, com botão de revelar/copiar), só para o terapeuta dono. PINs
  antigos (legado) continuam só com hash até gerar um novo uma vez. Requer a migração
  `prisma/migrations-manual/2026-07-11-pin-plain.sql` (aditiva, aplicada em produção).

## [2.13.0] — 2026-07-10

- **Correção: geração de relatório PDF (erro "Erro ao gerar relatório").** O
  `@react-pdf/renderer` falhava em produção com "Minified React error #31" — duas
  instâncias de React no ambiente do Next 15.5 (que usa React 19) enquanto o projeto
  estava em React 18. Correção: alinhamento para **React 19** (react/react-dom 19,
  suportado por todas as bibliotecas do projeto) + **@react-pdf/renderer v4**. Bug
  pré-existente (não introduzido pelas mudanças anteriores desta série). Diagnóstico
  reproduzido e validado no build de produção local.
- Ajuste de tipos para React 19: `MemorySymbol` deixa de anotar o namespace global `JSX`.

## [2.12.1] — 2026-07-10

- **Organização interna (correções da auditoria):**
  - Catálogo: 11 exercícios que apareciam com badge de tipo/dificuldade errado (caíam no
    padrão "Visual/Médio") passam a ter classificação própria; novo teste garante que todo
    exercício do catálogo tenha definição e badge (ARQ-001).
  - Removido o exercício-fantasma `atencao-dividida` da taxonomia (ARQ-004).
  - Código morto removido: `utils/validateCommand.ts`, `components/characters/AgentGrid.tsx`,
    `FallingAgentsDemo.tsx`, `components/exercises/attention/AtencaoDividida.tsx`, o hook
    `useAdaptiveLevel` sem uso e as pastas vazias `components/reports/` e `app/auth/` (ARQ-005/009).
  - Lista de pacientes: passa a trazer só as 30 sessões mais recentes por paciente (window
    function), em vez do histórico inteiro — evita crescimento sem limite do payload (PERF-001).
  - Painel de alertas: "marcar como lido" só atualiza a tela se o servidor confirmar; "marcar
    todos" não trava mais o botão em caso de falha (GER-008).

## [2.12.0] — 2026-07-10

- **Pet e Jornada salvos no servidor (ARQ-002):** o progresso do bichinho (tipo, carinho,
  nome, cor, acessório) e da árvore de habilidades passa a ser persistido no banco, além do
  cache local — não se perde ao trocar de aparelho ou limpar o navegador. Novo endpoint
  `/api/gamification` (paciente lê/salva o próprio estado); reconciliação com merge
  "nunca-perde-progresso" ao abrir as telas de pet/jornada. Requer a migração aditiva em
  `prisma/migrations-manual/2026-07-10-gamification.sql`.

## [2.11.5] — 2026-07-10

- **Robustez (correções da auditoria):**
  - Mundo Interior: o polling de 8s não sobrescreve mais uma resposta em gravação, evitando
    reverter/perder progresso em conexão instável (CORR-002).
  - `db:seed` corrigido: usa `tsx` (o script apontava para `ts-node`, ausente do projeto) (GER-001).
  - Remoção de dependências sem uso: `@auth/prisma-adapter`, `date-fns-tz`, `pg`, `@types/pg`;
    `@types/nodemailer` movido para devDependencies (GER-002).

## [2.11.4] — 2026-07-10

- **Alertas e regras do dia a dia (correções da auditoria):**
  - Alerta "faltou treinar" (MISSED_SESSION) agora é removido quando o paciente volta a
    treinar — antes nunca era limpo automaticamente (CORR-003).
  - Alerta de "queda de desempenho" (PERFORMANCE_DROP) deixa de se repetir a cada sessão:
    só cria um novo se não houver um não lido recente; a mensagem não atribui mais a queda
    a um exercício específico, pois a média cruza exercícios (CORR-004/GER-003).
  - Bloqueio "1x por dia" passa a usar o fuso de Brasília, consistente com a sequência de
    dias — antes usava o fuso do aparelho (GER-005).
  - Resgate de código de licença não rebaixa mais um terapeuta com acesso ilimitado para um
    número finito; o código é preservado com uma mensagem clara (GER-007).

## [2.11.3] — 2026-07-10

- **Fidelidade das pontuações (correções da auditoria):**
  - Vigilância: falso-alarme passa a contar no máximo 1 por estímulo (CORR-009).
  - Caça Informação: empates aceitam qualquer item correto; "mais conteúdo" compara só a
    mesma família de unidade, normalizando kg/L (CORR-014, CORR-015).
  - Compra Multifuncional: fim de tempo avalia a seleção real, não um conjunto vazio (CORR-008).
  - Grade Lógica (DeductiveGrid): erros deixam de ser contados em dobro na acurácia (CORR-013).
  - Desafio Supermercado: níveis 11–12 não são mais rebaixados para 10 (CORR-001).
  - Memória (Letras/Sílabas, Sequência de Itens, Lista com Distração, Padrões com Rotação):
    a subida de nível passa a valer já na rodada seguinte (CORR-011).

## [2.11.2] — 2026-07-10

- **Segurança:** rate limiting no login (terapeuta e paciente) contra força-bruta de PIN,
  por identificador e por IP, com bloqueio temporário (SEC-001).

## [2.11.1] — 2026-07-10

- **Busca Rápida:** as 251 imagens de itens normalizadas em quadro quadrado com objeto
  centralizado (~80%) e reotimizadas; cards com imagem menor e padding; validação de
  imagem antes da rodada (item sem foto é trocado, nunca placeholder); tutorial corrigido.

## [2.11.0] — 2026-07

- **Focus Agentes:** redesign cognitivo do modo Foco (ladder de níveis 1–7 por critérios).

## [2.10.x] — 2026-07

- **Focus Agentes:** novo elenco padronizado de 42 personagens; integração do roster
  completo (símbolos + objetos); correções de clique em sobreposição/aglomeração.

## [2.9.x] — 2026

- **Compra Multifuncional:** overhaul cognitivo (progressão + regras variadas); tela de
  jogo enxuta com memória automática. Correções de fundo residual em imagens de produtos.

## [2.8.x] — 2026

- **Busca Rápida:** rebuild do acervo (251 itens, 7 categorias, nova categoria Brinquedos).
- **Performance:** otimização do acervo de imagens (busca 289 MB → 6 MB; produtos 165 MB → 4 MB).

## [2.5.0 – 2.7.0] — 2026

- **Desafio Supermercado:** expansão do catálogo de produtos (+29, depois +34) com fundo
  removido; hortifrúti/higiene/limpeza refeitos; nova categoria lavanderia.

## [2.1.0 – 2.4.1] — 2026

- **Bichinho (pet):** área premium/lúdica, ciclo do dia, cena decorada.
- **Busca Rápida:** reforma cognitiva do ex-"Corrida contra o Tempo" (72 → 251 itens em imagem).

## Marcos anteriores

Versões 1.x cobriram a base da plataforma (autenticação dual, engine de exercícios,
scoring por faixa etária, geração de PDF, Mundo Interior, tema escuro navy) e a auditoria
de 2026-05-30 (`AUDITORIA-2026-05-30.md`), que corrigiu ~40 achados. Em 2026-06-02, ação
separada habilitou Row Level Security nas 10 tabelas do banco de produção (registro em
`PROGRESSO.md`). Detalhes no log do Git e nos documentos de progresso.

> Nota: a plataforma expõe `score`/dificuldade por domínio, mas não há cálculo de percentil
> normativo implementado no código (apenas o tipo `NormativeBenchmark`) — ver `docs/ARCHITECTURE.md`.
