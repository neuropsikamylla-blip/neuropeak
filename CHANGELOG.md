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

## [2.32.1] — 2026-07-13

- **Caminhos para a Meta — correções da auditoria completa das 90 atividades:**
  - **Leitura em voz alta por cartão:** cada cartão de ação (acervo, plano, descartadas)
    e cada alternativa do imprevisto ganhou um botão-falante discreto — o recurso
    estava previsto desde a Etapa 1 (`onFalarCartao`), mas nunca havia sido ligado.
    Respeita a opção "áudio" prescrita pelo terapeuta.
  - **Restrições dos imprevistos (Adolescentes):** 8 atividades (A22–A25, A27–A30)
    tinham o campo "Atenção/restrições" vazio na tela de mudança; preenchido com a
    restrição derivada do próprio obstáculo (padrão já usado em Crianças e Adultos).
  - Auditoria completa (estrutural + comportamental com o motor real) registrada:
    90/90 válidas, respostas corretas/parciais/incorretas verificadas em todas,
    adaptação × perseveração verificadas nos 30 imprevistos, zero conteúdo sensível.

## [2.32.0] — 2026-07-13

- **Caminhos para a Meta — Etapa 2: catálogo oficial com as 90 atividades.**
  - **90 atividades cadastradas** conforme a spec da terapeuta
    (`CAMINHOS-ATIVIDADES-ETAPA2-SPEC.md`): 30 Crianças (cm_c01–cm_c30), 30
    Adolescentes (cm_a01–cm_a30) e 30 Adultos e idosos (cm_ad01–cm_ad30), em
    `data/caminhos-meta/{criancas,adolescentes,adultos-idosos}.ts`. As 3 atividades
    provisórias [EXEMPLO] foram removidas.
  - Todas com: níveis 1–8, os 8 modos (ordenar, intruso, prioridade, completar,
    corrigir, reorganizar, problema, plano alternativo), 3 dicas graduais, feedback
    específico (correto/parcial/incorreto + explicação funcional), bloco de imprevisto
    completo nos modos de mudança (30 atividades) e leitura em voz alta.
  - Catálogo inteiro disponível no painel do terapeuta (busca/filtros), misturável
    entre bibliotecas, sem bloqueio por idade; apresentação embaralhada preservando a
    correção cadastrada.
- **Tela do paciente — fidelidade à spec (3 ajustes):**
  - **Imprevisto com múltiplas mudanças (nível 8):** quando a solução exige mais de uma
    ação (ex.: mudar de sala E de material), a fase do imprevisto passa a permitir
    seleção múltipla com botão "Confirmar escolha" (antes, um toque respondia na hora e
    era impossível acertar).
  - **Modo completar/corrigir fiéis ao cadastro:** a lacuna do plano e o par
    apresentado invertido agora são os definidos em cada atividade
    (`lacunaAcaoId`/`ordemInicial`), não mais derivados genericamente pela tela.
  - **Modo prioridade:** o número de escolhas passa a vir dos essenciais da própria
    atividade (3 a 6 conforme o cadastro), não mais fixo em 3.
- Testes: suíte atualizada para o catálogo oficial (90/90 validadas por
  `validarAtividade`; 73 testes no total).

## [2.31.1] — 2026-07-13

- **Bichinho (dragão e monstrinho) — página principal:**
  - **Estado estável:** o personagem fica com UMA imagem/estado por vez (se está feliz,
    continua feliz) — acabou a troca aleatória de poses com o passar do tempo.
  - **Necessidade só ao concluir exercício:** ao terminar um treino, o bichinho pode
    ficar com fome ("{nome} está com fome! Que tal dar um lanche?"); o paciente escolhe
    alimentá-lo (o estado volta ao normal) ou seguir para outro exercício. Um novo
    treino pode gerar nova necessidade.
  - **Reação a ótimo desempenho:** piscadinha breve (alguns segundos, 1x) quando o
    último exercício teve ótimo desempenho — reação do personagem, não um comando.
  - **Comandos:** removidos "Dançar" e "Acenar" do monstrinho (não têm arte própria —
    dançar caía no mesmo desenho do pular). O dragão mantém "Dançar" (tem animação
    própria de dança).

## [2.31.0] — 2026-07-13

Ajustes clínicos após aplicação com paciente (feedback da terapeuta):

- **Estacionamento Lógico:** volta a regra clássica — mover um carro = **1 movimento**
  (independe da distância; não pune quem "pensa com a mão"). A contagem por quadradinho
  fica SÓ nos níveis difíceis (dificuldade ≥ 10), com aviso na tela explicando a regra
  avançada. "Melhor solução" agora usa a régua da regra vigente (novo solver de
  movimentos). Sessão passa de ~7 para **~11 minutos** (tempo de planejar).
- **Torre de Hanói:** sessão também passa para ~11 minutos.
- **Focus Agents / Chuva — escada de 10 níveis:** até o nível 4, MENOS personagens na
  tela (pacientes com dificuldade); do 5 ao 8, um pouco mais de distratores; **níveis
  9-10: mais velocidade e multi-pedido (2 e depois 3 alvos)**. Tamanho dos personagens
  padrão em todos os níveis (cache forçado ?v=11 contra imagens antigas em aparelhos).
  **Comando curto:** "Azul com luva", "Vermelho com skate", "Amarelo com bola de futebol
  à direita" (sem o "Ache o agente").
- **Supermercado:** o áudio fala **somente os itens** (sem "sua lista de compras") e
  nomes encurtados onde não há confusão: Molho de tomate, Biscoito, Bolacha, Protetor,
  Pizza, Pipoca. ("Álcool em gel" mantido: colidiria com o item "Álcool".)

## [2.30.0] — 2026-07-13

- **Caminhos para a Meta — Bloco 3 (fecha a Etapa 1):**
  - **Painel do terapeuta** na prescrição (modal "Configurar" no card do exercício):
    catálogo de atividades com busca e filtros (biblioteca/nível/modo/categoria), badges
    (intrusa, imprevisto, tipo de correção, ordens alternativas), preview read-only
    (meta/ações/dicas/feedbacks), seleção e ordenação da sequência misturando bibliotecas,
    e opções da sessão (rodadas, ordem fixa/aleatória, dicas, áudio, tentativas, desfazer,
    feedback imediato/final) — persistidas no plano e aplicadas na tela do paciente.
  - **Relatório funcional** (`lib/caminhos-report.ts`): corretas/parciais/incorretas,
    dicas por nível, revisões, adaptação após mudança, perseveração, desempenho por
    modo/biblioteca, evolução contra o próprio histórico e observações FUNCIONAIS
    (sem rótulos depreciativos, sem diagnóstico) — no perfil do paciente e no PDF.

## [2.29.0] — 2026-07-13

- **NOVO MÓDULO: "Caminhos para a Meta"** (substitui a mecânica do Sequência Temporal;
  exerciseId interno `antes-depois` preservado p/ histórico) — Etapa 1 da spec:
  - **Fundação:** estrutura de dados completa pronta p/ 90 atividades (3 bibliotecas:
    crianças/adolescentes/adultos-idosos — rótulos só p/ o terapeuta, sem bloqueio por
    idade); motor de correção com ordem exata E relações de dependência (ordem
    funcionalmente válida = correta), resposta parcial, imprevistos com detecção de
    perseveração, 8 indicadores; 32 testes automatizados (68/68 no total).
  - **Tela do paciente:** meta sempre visível; tocar-para-ordenar + arrastar (pointer)
    + botões ↑/↓; desfazer/refazer/limpar; dicas graduais (3 níveis); feedback
    correta/parcial/incorreta (parcial destaca só o que revisar, sem apagar o plano);
    área "Não faz parte do plano"; 8 modos (ordenar, intruso, prioridade, completar,
    corrigir, reorganizar, problema, plano alternativo — os 3 últimos em 2 fases com
    card de mudança/obstáculo); áudio opcional (TTS); autosave com "continuar de onde
    parou"; acessível (teclado/aria); responsivo; visual claro neutro adulto, sem imagens.
  - **3 atividades provisórias** marcadas [EXEMPLO] (1 por biblioteca) para testar a
    infraestrutura — as 90 definitivas entram na Etapa 2.
  - Spec oficial em `CAMINHOS-PARA-A-META-SPEC.md`. Painel do terapeuta e relatório
    (Bloco 3) na sequência.

## [2.28.3] — 2026-07-12

- **Focus Agents — pipa e guarda-chuva roxos substituídos:** as versões anteriores
  estavam cortadas; entraram as novas artes da terapeuta, normalizadas no padrão do
  elenco (boneco no tamanho padrão, item inteiro no quadro — verificado com margens).
  Cache `?v=9`→`?v=10`.

## [2.28.2] — 2026-07-12

- **Chuva do Foco — variedade REAL entre comandos:** além de nunca repetir o comando,
  o comando seguinte agora não repete a COR nem a CARACTERÍSTICA do anterior (acabou o
  "verde com X" → "verde com Y"). Provado em simulação: 200 trocas seguidas com 0
  repetições de comando, 0 de cor e 0 de característica consecutivas.

## [2.28.1] — 2026-07-12

- **Chuva do Foco — 2 regras duras:**
  - **Nunca repete comando:** o mesmo comando não sai duas vezes seguidas (proibição
    absoluta) e o jogo evita repetir qualquer comando já usado na sessão — só recomeça o
    ciclo quando o repertório do nível esgota.
  - **Ninguém cai mais rápido, NUNCA:** removida a antiga "2ª chance acelerada" (era ela
    que fazia um agente "cortar a tela" mais rápido que todos). O alvo que escapa volta
    ao topo na MESMA velocidade dos demais; a 2ª escapada continua contando omissão.

## [2.28.0] — 2026-07-12

- **Conecta Números (trilha-visual) — bug do clique + tutorial:**
  - **Bug corrigido:** ao tocar num número ele "pulava" do lugar e o toque não registrava
    (precisava clicar 2×). Causa: o whileTap do framer-motion sobrescrevia o transform de
    posicionamento. Agora o posicionamento fica num wrapper estático e a animação de
    toque no botão interno — 1 toque, 1 registro.
  - **Tutorial em UMA etapa** (eram 2 quase iguais) e agora é **réplica exata do jogo**:
    mesmo painel, mesmas células (54 px), mesmas cores e linhas.
- **Chuva do Foco — alvo imprevisível** (a pedido): o alvo agora entra em posição
  ALEATÓRIA (um canto, o meio, outro canto — não mais no "maior vão", que era previsível)
  e em momento variável (nem sempre logo após o desbloqueio).

## [2.27.2] — 2026-07-12

- **Chuva do Foco — corrige os "acelerados":** com a chuva contínua, o ALVO do comando
  anterior que sobrevivia à troca continuava marcado como alvo — se estava na 2ª chance,
  caía 1,4-1,7× mais rápido para sempre (os agentes "ultrapassando os outros"), e ao
  chegar embaixo podia marcar omissão no comando novo. Agora, ao abrir o próximo comando,
  todos os sobreviventes são rebaixados a distratores comuns (isTarget/passCount limpos).
  Única velocidade diferente que resta: a 2ª chance do alvo ATUAL (por design).

## [2.27.1] — 2026-07-12

- **Span Numérico Auditivo — 2 correções:** (1) no inverso, as bolinhas giravam DUAS
  vezes (a fileira da fase de resposta nascia reta e animava de novo); agora nasce já
  virada — gira só uma vez, no fim da fala. (2) A sequência não repete mais números
  (embaralha 1-9 e usa os N primeiros; provado em 500 sequências de 8 dígitos).

## [2.27.0] — 2026-07-12

- **Span Numérico Auditivo (Direto e Inverso) — painel novo estilo referência:** teclado
  3×3 (1-9, sem o 0; sequências não sorteiam mais 0) em paleta azul-clara do app (teclas
  brancas, fundo claro, luz ativa #4F8FEA). Na APRESENTAÇÃO, a tecla do número falado
  PISCA no painel em sincronia com a voz (nos dois exercícios); as bolinhas preenchem
  conforme a fala. No INVERSO, ao fim da fala as bolinhas fazem a animação de VIRAR —
  dica sutil da ordem inversa, sem mostrar números (o anel que marca o início passa para
  o outro lado). Resposta clicando no próprio painel, sem dica de texto.
- **Chuva do Foco — tamanho e densidade padrão em todos os níveis** (decisão da
  terapeuta): a progressão agora é só velocidade + comandos mais complexos (parecidos ↑,
  multi-alvo nos níveis altos).

## [2.26.0] — 2026-07-12

- **Chuva do Foco — ciclo de tarefa completo (modelo da terapeuta):** cada comando é UMA
  tarefa com UMA resposta: acertou → próximo comando; **errou → a tarefa acaba na hora**
  e vai para o próximo comando (antes deixava continuar procurando). Progressão: 3 acertos
  seguidos → **sobe** 1 nível; **2 falhas seguidas → desce** 1 nível (piso 1) — o nível
  novo vale a partir do comando seguinte. O card do próximo comando mostra "Não foi dessa
  vez" quando a tarefa anterior falhou.

## [2.25.6] — 2026-07-12

- **Chuva do Foco — velocidade uniforme SEMPRE + menos buracos:** (1) alguns agentes
  ultrapassavam os outros quando o nível subia (os novos entravam com a velocidade nova e
  os antigos guardavam a antiga); agora a velocidade é calculada por quadro para TODOS —
  o nível/velocidade só muda entre comandos (3 tarefas certas → sobe → vale a partir do
  próximo comando), nunca no meio da tarefa; única exceção continua sendo a 2ª chance do
  alvo (mais rápida, por design). (2) A regra de distância mínima adiava spawns demais e
  criava buracos: faixa de entrada estreitada (1,2×altura) e limiar 0,8×largura.

## [2.25.5] — 2026-07-12

- **Chuva do Foco — espaçamento correto (calibrado pela tela real):** a densidade estava
  calculada para monitores grandes e na tela da terapeuta resultava em só ~6 agentes
  (buracos). Recalibrada ~2,4× mais densa (MacBook ~15-24, celular ~5-8). E distância
  mínima DURA no nascimento: se não há vaga a ≥0,95×largura de quem entrou há pouco, o
  spawn é adiado 150 ms — nunca nasce um em cima do outro.

## [2.25.4] — 2026-07-12

- **Focus Agents — tamanho REALMENTE padronizado (causa raiz):** a normalização anterior
  igualava o QUADRO (personagem+item), então quem segura pipa/guarda-chuva/skate ficava
  com o boneco menor. Renormalizadas as 144 imagens pelo BONECO (âncora no rosto, pés
  fixos): boneco do mesmo tamanho em todas — itens (coroa, balão, guarda-chuva, skate)
  sobressaem do quadro naturalmente. Verificado em mosaico com linhas-guia (cabeça e pés
  coincidem). Cache `?v=8`→`?v=9`; boneco na tela = 100 px em todos.

## [2.25.3] — 2026-07-12

- **Chuva do Foco — a tela nunca esvazia:** a arena era LIMPA a cada comando resolvido e
  re-enchia devagar — na prática, boa parte do tempo a tela ficava vazia (até 100% vazia
  logo após o card). Agora a chuva é contínua de verdade: os agentes em queda ficam
  congelados atrás do card e seguem como distratores do próximo comando (com dupla
  garantia de que nenhum deles bate a regra nova — verificado, 0 conflitos), e o
  preenchimento inicial é ~3× mais rápido até a tela povoar.

## [2.25.2] — 2026-07-12

- **Cubo Corsi — ajustes finos (a pedido):** virada de ~80% (a face acesa fica quase de
  frente mantendo um resto de 3D — desvio 9-13°, provado por cálculo), bordas/estrutura
  mais finas (gap 5%→3,2%, contorno 1,5→1 px) e cubo maior (proporção 0,46→0,52 + 540).

## [2.25.1] — 2026-07-12

- **HOTFIX Cubo Corsi:** o cubo renderizava como "placa" achatada — causa: sombra via
  CSS `filter` no elemento 3D (filter achata o preserve-3d). Sombra refeita como elipse
  separada no chão; alerta em comentário no código para nunca repetir.

## [2.25.0] — 2026-07-12

- **Cubo Corsi — visual novo (paleta clara estilo referência) + maior:** estrutura
  #9EBEDD, bordas #82A9CF, placas #F7FBFF (topo/lados com leve gradação), luz ativa
  #4F8FEA, fundo #F4F7FB e sombra suave (~10% preto). Cubo maior (430→500 no jogo,
  380 no tutorial). Paleta fornecida pela terapeuta.
- **Chuva do Foco — alvo demora mais a entrar:** caem ≥7 distratores (e ≥2,6 s) antes
  do alvo aparecer — mais tempo de busca ativa/vigilância antes do estímulo (é treino).

## [2.24.11] — 2026-07-12

- **Chuva do Foco — movimento consistente e organizado:** todos os agentes agora caem na
  MESMA velocidade do nível (antes cada um tinha velocidade aleatória 0,55–1,45× — uns
  alcançavam os outros, abriam buracos e parecia desorganizado). A entrada continua
  ritmada (1 por vez) e o espalhamento vem das posições horizontais; balanço leve mantido.

## [2.24.10] — 2026-07-12

- **Chuva do Foco — mais estímulos na tela** (a pedido, com exemplo): densidade sobe para
  ~16 agentes no nível 1 até ~24 no nível 7 (desktop), mantendo o fluxo ritmado (sem
  rajada/vácuo) e o espalhamento.

## [2.24.9] — 2026-07-12

- **Cubo Corsi — ordem certa e virada mais rápida:** agora o cubo **VIRA primeiro** e a
  peça **pisca de frente** para o paciente (antes acendia e depois virava). Virada
  1,6 s → **1,1 s** (rápida e fluida, sem truncar). Jogo e tutorial no mesmo ciclo.

## [2.24.8] — 2026-07-12

- **Chuva do Foco — fluxo contínuo (sem "vácuo"):** os agentes entravam em rajada até o
  teto e caíam como um bloco, deixando um vazio enorme na tela até saírem. Agora a entrada
  é ritmada (1 agente a cada `fallMs/maxC` ms) — sempre há agentes distribuídos na vertical.
- **Cubo Corsi — fluido, maior e tutorial corrigido:** virada 2,75 s → **1,6 s** (estava
  lentificado) com pausas menores (0,5 s antes, 0,7 s de frente); cubo maior (360→430 no
  jogo, 300→340 no tutorial); e o TUTORIAL agora controla a pose com o mesmo ciclo do jogo
  — antes a virada era interrompida no meio (truncada) quando a peça apagava.

## [2.24.7] — 2026-07-12

- **Cubo Corsi — TODA peça acesa faz a virada completa:** antes, peças seguidas na mesma
  face não giravam nada (parecia "truncado, virando pouco"). Agora todo item da sequência
  faz o ciclo inteiro: acende na vista de canto → 1 s → vira de frente (2,75 s, luz acesa
  na trajetória toda) → 1 s de frente → apaga → volta suave à vista de canto → próxima
  peça. Movimento sempre visível e fluido, como especificado.

## [2.24.6] — 2026-07-12

- **Cubo Corsi — face acesa vira INTEIRA para a tela:** removido o resíduo de 12°;
  a face acesa agora termina a 0° (totalmente de frente para o paciente). Verificado
  por cálculo (desvio 0° nas 3 faces).

## [2.24.5] — 2026-07-12

- **Cubo Corsi — face acesa agora vira DE FRENTE para o centro:** as poses estavam
  geometricamente tortas (a face acesa terminava 16-34° fora do centro). Corrigido por
  cálculo: topo=rotateX(-78°), esquerda=rotateX(-12°), direita=rotateX(-12°)+rotateY(-90°)
  — as 3 faces terminam a 12° uniformes do centro (resíduo proposital para manter o
  aspecto 3D). Verificado matematicamente (normal · eixo do espectador).

## [2.24.4] — 2026-07-12

- **Cubo Corsi — viradas lentas e naturais:** a rotação do cubo era brusca (0,85 s).
  Agora: a peça ACENDE antes e permanece acesa durante toda a virada; pausa de 1 s;
  o cubo gira em ~2,75 s com ease-in-out simétrico (acelera e desacelera progressivamente,
  sem tranco/overshoot); pausa de 1 s ao terminar; só então apaga. O paciente consegue
  acompanhar visualmente toda a trajetória. Flashes na mesma face seguem como antes.
  Cubo, luzes, cores, câmera e lógica intactos.

## [2.24.3] — 2026-07-12

- **Focus Agents — tamanho padronizado + Chuva menos amontoada:**
  - **Personagens padronizados:** as 144 imagens tinham larguras diferentes (341-410px)
    → renderizavam de 88 a 132px ("um grande, outro pequeno"). Normalizadas todas para
    360×540 com o personagem em tamanho consistente (variação ±3%). Cache `?v=7`→`?v=8`.
  - **Chuva menos amontoada:** densidade reduzida (teto 20→16, ~13-16 no desktop).
  - **Clique mais confiável:** profundidade por posição (quem está mais embaixo fica na
    frente) — na sobreposição o clique pega o agente da frente, reduzindo "clico e dá errado".
  - **Alvo mais atrás:** agora exige ≥4 distratores e ≥1,2 s antes do alvo aparecer.

## [2.24.2] — 2026-07-12

- **Chuva do Foco — menos amontoado, sem sobrepor:** agentes 92→88px; densidade reduzida
  (teto 26→20, mais área por agente → ~18-20 no desktop); balanço horizontal menor
  (22-56px→10-26px, evita derivar um por cima do outro); espalhamento melhor no spawn
  (banda maior + 16 candidatos de posição). Expressão continua legível.

## [2.24.1] — 2026-07-12

- **Chuva do Foco — agentes um pouco maiores (80→92px):** para ler a EXPRESSÃO do rosto
  (feliz/triste/raiva), que no tamanho anterior era um detalhe sutil demais. O agente
  feliz sempre esteve no jogo (verificado: 6 imagens + roster + comandos); o problema era
  só de legibilidade no tamanho pequeno.

## [2.24.0] — 2026-07-12

- **Chuva do Foco — múltiplos alvos (degrau final da progressão):** nos níveis altos o
  comando pede mais de um personagem — níveis 1-4: 1 alvo; 5-6: 2 alvos; 7: 3 alvos.
  Ex.: "Ache o agente azul de gorro e o vermelho de bermuda". O paciente tem que achar e
  tocar TODOS antes do próximo card; cada alvo com sua 2ª chance; distratores nunca batem
  nenhuma pista; sobe de nível só com o comando resolvido limpo (todos capturados, sem
  erro/omissão). Mesmo fluxo card → Começar → busca. Verificado: N1-4=1/N5-6=2/N7=3,
  0 distrator que engana, alvos distintos, textos em uma linha.

## [2.23.7] — 2026-07-12

- **Chuva do Foco — comando em uma linha, só combinados, mais denso:** (1) o texto do
  comando no card fica em UMA linha (sem quebrar), a caixa se ajusta; (2) só comandos
  COMBINADOS de 2 pistas ("Ache o agente amarelo com skate") — acabaram os de 1 atributo;
  (3) mais distratores na tela (teto 20→26) mantendo o espalhamento por distância máxima
  (não amontoa). Queda e "quase idênticos" mantidos.

## [2.23.6] — 2026-07-11

- **Chuva do Foco — corrige "de skate" ambíguo:** o comando "de skate" só aceitava o skate
  de calça, e o de bermuda entrava como distrator — mas os dois têm skate, então clicar no
  de bermuda dava "errado" injustamente. Agora "de skate" aceita QUALQUER skate (calça ou
  bermuda); a distinção fina fica só no comando explícito "de skate de bermuda". Verificado:
  0 distratores que batem a regra.

## [2.23.5] — 2026-07-11

- **Chuva do Foco — comando some na busca (memória de trabalho):** o comando aparece só
  no card (antes do "Começar"); durante a busca ele SOME da tela — o paciente procura de
  memória. Adiciona carga de memória de trabalho ao treino.

## [2.23.4] — 2026-07-11

- **Chuva do Foco — bem mais difícil (a pedido, nas 4 frentes):** (1) distratores quase
  idênticos ao alvo (nearFrac 0,90→1,0 — discriminação fina, não dá pra bater o olho);
  (2) queda mais rápida (fallMs 7200→3900, mantendo legível); (3) mais agentes na tela
  (teto 14→20); (4) comandos combinados (2 pistas: "azul de gorro") desde o nível 1 e
  únicos do nível 3+ (antes só do 3). Sobe de nível a cada 3 acertos (era 4).

## [2.23.3] — 2026-07-11

- **Focus Agents — força atualização das imagens (cache):** carimbo `?v=6`→`?v=7` nas
  imagens dos agentes (FocusRain + FocusAgents). Resolve versões ANTIGAS presas no cache
  do navegador — ex.: o skate aparecia "deitado" (versão velha) mesmo com a nova "em pé"
  no projeto, e o clique caía como erro por não bater com o personagem deslocado. Roster
  confirmado 100% sincronizado com a pasta (144 imagens = 144 agentes, 0 órfãos).

## [2.23.2] — 2026-07-11

- **Chuva do Foco — espalhamento reforçado:** os agentes ainda caíam meio alinhados;
  agora as velocidades de queda variam bem mais (0,55–1,45×), a entrada é bem escalonada
  (alturas variadas) e o balanço horizontal é mais amplo — caem espalhados/misturados,
  sem fileira.

## [2.23.1] — 2026-07-11

- **Chuva do Foco — texto e movimento:** comandos agora dizem "Ache o **agente** …"
  (ex.: "Ache o agente com raiva"). E os agentes deixaram de cair em fileira: velocidades
  de queda variadas (misturam na vertical — uns mais altos, outros mais baixos), entrada
  escalonada e um **balanço horizontal** suave (parecem se movimentar, não caem em linha reta).

## [2.23.0] — 2026-07-11

- **Chuva do Foco — fluxo com card + "Começar", e atributos combinados:**
  - **Card por comando:** cada comando abre um card central ("Ache o azul de gorro") com
    botão **Começar**; a chuva só cai depois de apertar (dá tempo de ler). Ao achar e tocar
    o alvo → próximo card. Erro não troca o comando; omissão vai pro próximo.
  - **Alvo nunca é o primeiro a cair:** caem ≥3 distratores (e ≥0,9 s) antes do alvo aparecer.
  - **Menos denso e mais lento** (a pedido): teto de 14 na tela + espalhamento que evita
    sobreposição; queda mais lenta (dá tempo de procurar).
  - **Atributos combinados** (níveis 3+): "Ache o azul de gorro", "o vermelho com a bola de
    futebol à direita" — busca por conjunção (2 pistas), com distratores que compartilham
    exatamente 1 atributo. 125 comandos no total.

## [2.22.2] — 2026-07-11

- **Chuva do Foco — densidade adaptativa à tela:** a quantidade de agentes na tela era
  fixa (6→12) e ficava vazia em monitores grandes. Agora ADAPTA à área da tela (px² por
  agente): enche telas largas (~20-30) e mantém equilíbrio no celular (~5-8), ficando mais
  denso nos níveis altos. Spawn em tick rápido pra encher; teto de 30 por performance.

## [2.22.1] — 2026-07-11

- **Chuva do Foco — mais distratores (mais difícil):** densidade na tela subiu de 4→8
  para **6→12** agentes simultâneos (spawn mais rápido pra encher), e a fração de
  distratores "parecidos" subiu (0,75→0,95). Achar o alvo exige busca visual de verdade.

## [2.22.0] — 2026-07-11

- **Focus Agents / Chuva do Foco — mecânica corrigida ("acha 1, regra troca"):** agora
  cada comando tem UM alvo ("Ache o de chapéu") no meio de vários parecidos caindo (mesma
  família: chapéu/coroa/gorro/boné/sem; ou futebol-esq/dir e basquete; ou alegre/triste/
  raiva). Tocar no alvo → **novo comando na hora** (a regra muda a cada acerto — treina
  flexibilidade cognitiva). Tocar num parecido = erro (comando continua). Alvo que escapa
  = 2ª chance → omissão troca o comando. Regras vêm do roster real (23 comandos, todos com
  imagens válidas). Antes a regra ficava fixa e "capturava todos" — não era o desejado.

## [2.21.1] — 2026-07-11

- **Focus Agents / Chuva do Foco — mais agentes na tela:** a queda começava com só 2
  simultâneos; agora começa com **4** e cresce até **8** conforme o nível (spawn mais
  rápido pra encher a tela). Vira busca visual + velocidade de verdade, não "de 2 em 2".

## [2.21.0] — 2026-07-11

- **Focus Agents — elenco novo (102 personagens) + comandos ricos:** integração de 102
  imagens novas (17 tipos × 6 cores, transparentes, otimizadas 95 MB→2,5 MB): bolas de
  futebol e basquete **com lado** (esquerda/direita), skate e skate de bermuda, óculos
  escuro, balão/pipa/guarda-chuva, chapéu/coroa/gorro, e expressões alegria/tristeza/raiva
  + luva. Objetos antigos (bola/skate/basquete sem lado) removidos.
  - **Comandos novos no modo Foco:** "com bola de futebol à direita/esquerda", "de
    basquete à …", "de skate (de bermuda)", "que seguram balão/pipa/guarda-chuva", "de
    chapéu/coroa/gorro", "os alegres/tristes/com raiva", "de luva", "de óculos escuro",
    além de combos por cor. Distratores "parecidos" priorizam pares quase idênticos
    (futebol-esquerda vs futebol-direita, expressões entre si) — atenção seletiva fina.
  - Verificado: 23.145 personagens gerados nos 4 modos, 0 imagem faltando, 0 símbolo/cinza.
    Originais no backup externo.

## [2.20.1] — 2026-07-11

- **Focus Agents — símbolos e cor cinza removidos:** os crachás/símbolos (estrela, círculo,
  triângulo, raio) saíram do roster dos 4 modos (não leem bem em agentes pequenos) e o
  "cinza" fantasma (sem imagens) foi tirado da paleta. Removidas 168 imagens, limpeza da
  lógica de símbolo no gerador e nos dados; objetos (bola/skate/basquete) preservados.
  Verificado: 23.159 personagens gerados nos 4 modos, 0 símbolo, 0 cinza, 0 imagem 404.
  Backup das imagens fora do repositório.

## [2.20.0] — 2026-07-11

- **Focus Agents / modo Foco — nova mecânica "Chuva de Agentes":** o Foco deixou de ser
  busca numa arena flutuante e virou uma **queda vertical** — os agentes caem do topo e o
  paciente toca só os que batem com a regra (ex.: "os azuis"), deixando os outros caírem.
  A própria queda é o cronômetro (pressão de tempo perceptual). Alvo que escapa por baixo
  **volta 1× caindo mais rápido** (2ª chance); se escapar de novo, conta como omissão.
  Tocar num distrator = erro impulsivo (treina inibição). Poucos caindo por vez (2→4),
  acelerando com o nível. Componente isolado `FocusRain.tsx` — os outros 3 modos seguem
  100% na arena. Símbolos (crachás) excluídos do Foco (não leem bem em queda). Constantes
  de queda/spawn/2ª chance calibráveis.

## [2.19.1] — 2026-07-11

- **Focus Agents / modo Foco — recalibração "de elite"** (após teste): agentes menores
  (112→80 px, só no Foco → arena mais densa, clique preciso), movimento bem mais rápido
  (curva 1.0×→2.7×), sobe de nível a cada 2 acertos (era 3), relógio mais apertado
  (~6-7 s/rodada, era ~9 s), multidão maior (14→31 agentes), mais alvos com variação
  (2→6) e distratores mais parecidos (65→89%). Os outros 3 modos seguem intactos
  (mode-scoping das constantes). Tudo calibrável.

## [2.19.0] — 2026-07-11

- **Focus Agents — modo Foco endurecido (piloto de treino):** reforma do modo Foco para
  treinar de fato velocidade de processamento + atenção seletiva (os outros 3 modos
  seguem iguais). (1) Relógio apertado desde o nível 1, escalando com o nº de alvos
  (~8-9 s por rodada, antes 20 s). (2) Agora captura vários alvos (2→5 conforme o nível)
  e os distratores são "parecidos" — compartilham um atributo com a regra (mesma cor sem
  o acessório, ou o acessório em outra cor; ≥55% dos não-alvos), forçando conferir todos
  os atributos. (3) Rigor: errar ou estourar o tempo repete o mesmo nível (novo arranjo)
  em vez de facilitar, com feedback instrutivo do erro. Constantes calibráveis após teste.

## [2.18.2] — 2026-07-11

- **Restaurante:** volume do som ambiente reduzido mais um pouco (ganho 0.26 → 0.20),
  a pedido — fundo ainda mais discreto.

## [2.18.1] — 2026-07-11

- **Restaurante — som ambiente trocado por gravação real:** o burburinho sintetizado
  (que soava como "vento") deu lugar a uma gravação real de restaurante (conversas +
  talheres de verdade, domínio público). Processada em loop sem emenda de 74 s (crossfade
  equal-power) e normalizada; toca bem baixo (ganho 0.26 sobre RMS ~0.08) como distrator
  sutil de fundo, sem competir com a narração do pedido. Botão 🔊/🔇 mantido. Arquivos de
  áudio antigos (sintetizados) removidos.

## [2.18.0] — 2026-07-11

- **Restaurante — som ambiente de verdade:** a musiquinha sintetizada deu lugar a um
  burburinho de restaurante (murmúrio de conversas ao longe + talheres discretos), em
  volume bem baixo (0.09), tocando em loop contínuo de 60 s. Som 100% sintetizado em
  casa (sem direitos autorais), 706 KB, com botão 🔊/🔇 mantido.

## [2.17.3] — 2026-07-11

- **Restaurante — ajustes pós-feedback:**
  - Plaquinha do pedido agora com vidro de verdade (transparência 0.20 + blur 20px; a
    versão anterior somava com o gradiente escuro da cena e parecia opaca) — sombras de
    texto preservam a legibilidade. Painel "Mudança no pedido" também mais vítreo.
  - Correção de prioridade de carregamento: a cena da 1ª mesa baixa com prioridade máxima;
    o preload das ~55 fotos de pratos foi adiado (2 s) e passa a rodar em lotes de 8 —
    antes ele congestionava a fila e o fundo ficava esperando atrás. Com cache quente, a
    cena entra sem nem mostrar o spinner.

## [2.17.2] — 2026-07-11

- **Higiene do repositório:** remoção de ~486 MB de matéria-prima (imagens brutas nunca
  referenciadas pelo app) do versionamento: `historias-novas`, `Restaurante-bistro`,
  `icones novos`, `itens-novos` — seguindo o padrão já existente do `.gitignore`
  ("Personagem restaurante"). Certeza verificada em dupla checagem (análise de 8 vetores +
  agente adversarial com 12 vetores + histórico git completo: nenhuma referência, nunca).
  Arquivos preservados no disco local e em backup (`~/neuropeak-asset-backups/2026-07-11-materia-prima`,
  306 arquivos/612 MB, integridade conferida); o histórico do git também os retém.

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
