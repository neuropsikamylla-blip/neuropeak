# PROGRESSO — NeuroPeak

> Checkpoint de contexto para continuidade entre sessões. Atualizado automaticamente.
> 👉 Visão geral e handoff para o próximo Claude: **`ESTADO-DO-PROJETO.md`** (leia primeiro).

## 🚧 EM ANDAMENTO (02/ago/2026) — Informação em Foco: FASE 1 + FASE 2

**Pedido dela (02/ago):** mandou a FASE 2 dizendo *"Antes de iniciar, verifique se a Fase 1 foi
realmente aplicada no código. Caso ainda existam bloqueadores estruturais, informe-os objetivamente,
corrija-os conforme as regras já definidas na Fase 1 e depois prossiga."*

**Verificação: a FASE 1 NÃO estava aplicada** (só a spec existia). Bloqueadores medidos no código:
`lib/informacao-foco.ts:315` sorteia `lactose` para qualquer produto · `:335` sorteia `sabor` ·
peso/volume/unidades/validade inventados por questão (margarina muda de 500 g para 800 g) · sem
snapshot de sessão · sem histórico anti-repetição · sem `directPackageReadingEnabled`.

**Passos (cada um termina com prova rodada + commit):**
- **F1.1** Catálogo com atributos FIXOS, lendo o conteúdo impresso nas 73 embalagens (o que não der
  para ler vira `revisar: true` e sai das perguntas de conteúdo). *Prova:* relatório de auditoria +
  teste de coerência por categoria.
- **F1.2** Campos aplicáveis por categoria (`null` quando não se aplica) + faixas de preço plausíveis.
- **F1.3** Gerador passa a LER o catálogo (fim do sorteio de atributo). *Prova:* 500×/nível sem
  atributo contraditório, uma resposta correta.
- **F1.4** Snapshot de sessão (preço/validade estáveis) + histórico anti-repetição.
- **F1.5** Progresso 0/10/…/100 + validação obrigatória antes de exibir.
- **F2.1** ProductCard novo (imagem 150–175 px, botão Ampliar sem selecionar o cartão, quadro funcional).
- **F2.2** Campos por nível + ordem previsível no inicial.
- **F2.3** Modal de ampliação acessível (Escape, foco contido, teclado).
- **F2.4** Modalidades: 70% quadro · 10% leitura direta da embalagem · 20% situação do cotidiano.
- **F2.5** Feedback pedagógico em 2 tentativas + destaque só depois da resposta.
- **F2.6** Distribuição da sessão de 10 + responsividade + acessibilidade.
- **F3.x** FASE 3 (spec recebida 02/ago, `docs/INFORMACAO-EM-FOCO-FASE3-ADAPTATIVA.md`): adaptativo
  por DIMENSÃO (produtos · campos · condições · semelhança dos distratores · tipo · ordem dos campos ·
  proximidade dos valores), 3 acertos↑ com 2 na 1ª tentativa / 2 erros em 3↓, histerese anti-oscilação,
  classificação do erro pela condição ignorada, uso do zoom, continuidade pelo ÚLTIMO NÍVEL ESTÁVEL,
  relatório profissional por campo e por tipo (linguagem descritiva, sem diagnóstico), controles do
  profissional. **Depende da Fase 2** (modal de ampliação e tipos de pergunta) e da Fase 1 (dados).

**Estado em 02/ago 01h:** F1.1 FEITA (catálogo de 73 produtos com atributos fixos lidos das
embalagens, 9 testes, relatório de auditoria). Próxima: F1.3.

## 🔒 FECHAMENTO DA SESSÃO (01→02/ago/2026) — v2.59.0 → **v2.63.1**, tudo em produção

**Estado real ao fechar:** git limpo · local = produção = **2.63.1** · **205 testes** (16 arquivos) ·
`tsc` 0 · build OK · imagens conferidas visualmente uma a uma.

**O que foi entregue hoje**
1. **Informação em Foco — catálogo 50 → 73 produtos com fundo TRANSPARENTE** (v2.60.0–2.60.2).
   As 80 imagens dela: 50 já eram as fontes do que estava no jogo · 20 viraram produto novo ·
   7 repetidas (regra dela: produto igual, só um) · 3 regeradas por marca real. Motor: marca virou
   dado do produto, nomes únicos por questão, "Conteúdo" só em líquido e "Peso" só em sólido.
2. **Vigilância** (v2.61.0–2.63.0): alvos regerados por ela (ΔE Lab caiu de 46/25/33 para 19/13/23),
   **8 pares** (entraram verde musgo e vinho), escada dos 10 níveis reordenada pela dificuldade
   MEDIDA, e **sessão por TEMPO (~8 min) com linha de progressão**, sem tela de fim de bloco.
3. **Specs gravadas** (nada iniciado): Fase 1 e Fase 2 do Informação em Foco, em `docs/`.

**Decisões dela registradas**
- Produto repetido: mantém só um. · Marca real não entra (ela regera com marca fictícia).
- Sessão por TEMPO com barra é o padrão do projeto (Estacionamento, Torre, Vigilância…), e a
  dificuldade sobe com os acertos. Nada de tela de "resultado do bloco" no meio.
- A rabiola ondulada das pipas novas é **intencional** — não uniformizar.

**Próximo passo (abrir com `claude --continue`)**
**FASE 1 do Informação em Foco** — `docs/INFORMACAO-EM-FOCO-FASE1-CORRECAO-ESTRUTURAL.md`, fatia 1
(catálogo com atributos fixos, lendo o conteúdo impresso nas 73 embalagens). Raiz já localizada:
`lib/informacao-foco.ts:315` (lactose) e `:335` (sabor) sorteiam atributo para qualquer produto.
Depois: Fase 2 (cartões/situações) só após ela testar 10 questões; Fase 3 (adaptativa) por último.

**Nada ficou por salvar.** Único ponto em aberto, por escolha: `PEDIDOS-LOG.md` e
`PEDIDOS-RECENTES.md` (gerados pelo gancho) seguem **fora do versionamento** — se ela quiser que
entrem no repo, é só dizer.

## ✅ CONCLUÍDO (2026-08-02, madrugada) — Vigilância: 8 pares, alvos regerados e SESSÃO POR TEMPO (v2.61.0 → v2.63.0)

**Terceira rodada (v2.63.0) — regra dela:** *"vigilancia nao é por exercicio... segue a mesma regra do estacionamento, torre (é por tempo e tem a linha de progressao) tem de ter uns 7 a 10 min"* + *"vamos aumentando a dificuldade com os acertos"*.
- **`useTimedProgress(8 min)`** + **linha de progressão** no topo (tempo ATIVO: só corre com o paciente interagindo).
- **Fim de bloco silencioso:** saiu a tela "Bloco concluído" (com botões Continuar/Encerrar). Agora avalia, sobe de nível quando merece e emenda o bloco seguinte sem interromper — mesmo princípio aplicado no Focus.
- **Quem encerra é o tempo**, e sempre DEPOIS do feedback da tentativa: a barra nunca corta o paciente no meio de uma decisão.
- **Dificuldade sobe com os acertos** (já era assim no motor, agora roda contínuo): degrau de exposição por tentativa (`adaptar`) + nível visual a cada bloco de 12 (`avaliarBloco`).

### Rodada anterior (v2.62.0) — 8 pares

**Segunda rodada (v2.62.0):** ela regerou também o **terracota** e mandou **2 pares novos** — **P07 verde musgo** e **P08 vinho**. ΔE Lab final: P04 22,8 · P01 19,3 · P03 **14,3** (era 19,4) · P07 13,8 · P02 13,0 · P08 11,3. **Escada dos 10 níveis refeita:** os 6 pares de tom entram em ordem de dificuldade medida (níveis 1-6), os 2 mais difíceis (P02, P08) voltam com arranjo irregular (7-8), laços no 9 e faixa diagonal no 10. `PIPA_V=3`. **A rabiola ondulada dos pares novos é INTENCIONAL — ela pediu assim** (os antigos têm rabiola reta). Não "uniformizar" achando que é defeito.

### Primeira rodada (v2.61.0)

**Pedido dela:** *"vigilancia percebi que a pipa está mto diferente... atualizei as pipas ALVOS verifica"*.

- **Ela tinha razão, e dá para medir.** ΔE Lab entre o corpo do alvo e o do distrator:
  Ameixa **46,3 → 19,3** · Azul ardósia **25,3 → 13,0** · Verde sálvia **33,3 → 22,8**. Os alvos
  antigos eram de outra família de cor (ameixa quase branco contra rosa escuro) — o alvo saltava aos
  olhos e o exercício perdia a função de vigilância.
- **Formato:** as 3 imagens novas vieram com o **xadrez de transparência achatado** (fundo
  quadriculado gravado como pixel). Removido por limiar (o xadrez fica em `dif` 2–11, a pipa passa de
  30) + `fill_holes`; alfa real restaurado, 400×600 RGBA como as demais. ⚠️ Se der para exportar PNG
  com transparência de verdade, é melhor — mas dá para consertar assim.
- **Escada de níveis reordenada pela dificuldade REAL** (`lib/vigilancia-dados.ts`): P04 (22,8) →
  P03 (19,4) → P01 (19,3) → P02 (13,0). Antes começava em 19,3, **caía para o par mais difícil no
  nível 3** e terminava no mais fácil nos níveis 7-8. `dificuldadeVisual` e `deltaELab` gravados no
  `pipas_manifest.json`.
- **`PIPA_V=2`** (cache-bust) porque o arquivo mudou mantendo o nome — sem isso o navegador serviria
  a pipa antiga.
- **Pendente:** o par **P03 (terracota)** não foi regerado por ela (segue o alvo de 31/jul). Por
  coincidência o ΔE dele (19,4) ficou coerente com os novos, então está usável — mas, se ela quiser
  uniformizar o critério, é o próximo a regerar.
- Backup das pipas antigas: `~/neuropeak-asset-backups/vigilancia-pipas-bak-20260802`.

## ⏭️ PRÓXIMAS TAREFAS — Informação em Foco em 3 FASES (specs dela gravadas, NADA iniciado)

**Sequência definida por ela — não inverter:**
1. **FASE 1 — correção estrutural** (`docs/INFORMACAO-EM-FOCO-FASE1-CORRECAO-ESTRUTURAL.md`):
   estabilizar produtos, unidades, dados e geração das perguntas.
2. **FASE 2 — cartões, etiquetas, ampliação e situações do cotidiano**
   (`docs/INFORMACAO-EM-FOCO-FASE2-CARTOES-E-SITUACOES.md`, recebida 02/ago): quadro funcional,
   embalagem maior (145–175 px), modal de ampliação, 3 modalidades (70% quadro · 10% leitura direta
   da embalagem · 20% situação do cotidiano), campos por dificuldade, distratores parciais,
   distribuição da sessão de 10, feedback processual. **Só depois da Fase 1 concluída E testada por
   ela numa sessão inteira de 10 questões** — senão as situações do cotidiano só reaproveitam dados errados.
3. **FASE 3 — dificuldade adaptativa**, ajustada depois de observar sessões completas.

**Detalhe da FASE 1 (a próxima a executar):** spec de 19 seções + plano em 5 fatias.

**Raiz confirmada no código:** os atributos do produto são sorteados por questão em vez de virem do
cadastro — `lib/informacao-foco.ts:315` joga `lactose` em qualquer produto (por isso "chá de camomila
contém lactose") e `:335` sorteia `sabor` entre morango/uva/laranja/chocolate para qualquer produto
(por isso "lasanha sabor chocolate", "pão de forma sabor morango"). Peso/volume/validade idem. A
v2.60.0 corrigiu só a metade das unidades ("Conteúdo" em líquido, "Peso" em sólido).

**Não começar sem ler a spec.** A fatia 1 exige LER o conteúdo impresso em cada uma das 73
embalagens (trabalho visual, só o Claude faz) — o que não der para confirmar vira `revisar: true` e
sai das perguntas sobre conteúdo, nunca se inventa o dado.

**Ordem combinada com ela:** terminar a Fase 1 → ela testa uma sessão inteira de 10 questões →
só então historinhas do cotidiano, dificuldade e melhorias visuais.

## ✅ CONCLUÍDO (2026-08-01, tarde) — Informação em Foco: catálogo 50 → 73 produtos com FUNDO TRANSPARENTE (v2.60.2)

**Pedido dela (palavras dela):** *"na verdade são 80 imagens, vamos integrar as 80 imagens no informação em foco, lembrando fundo transparente ok?"*

**Entregue e publicado (produção `2.60.2-dpl_H2n8PBo9fh251MdbHFHFq61Abz1E`; 205 testes, tsc 0, build OK):**
- **73 PNG 360×360 RGBA com alfa real** em `public/exercises/informacao-foco-produtos/` — as **50 antigas refeitas** (eram opacas, fundo branco: no tema GAMIFIED viravam um quadrado branco no cartão escuro) + **20 novas**.
- **Destino das 80 imagens da pasta dela:** 50 já eram as fontes dos produtos que estavam no jogo · 20 viraram produto novo · 7 eram produto REPETIDO (decisão dela: "produto igual, mantém só 1" — azeite, farinha de trigo, açúcar refinado, aveia, 2ª pasta de amendoim, 2ª geleia, 2º mel) · 3 fora por marca REAL.
- **Técnica do recorte** (script em `docs/scripts/recorte-fundo-branco.py`): contorno por **bordas (Canny 8/24)** somado ao núcleo colorido (`dif > 18`) → fechamento 9×9 → `fill_holes` (devolve o branco interno) → abertura 5×5 (solta a sombra) → maior corpo → erosão 1 px → antialias. Se a imagem já vier com alfa (ela mandou 3 assim), o alfa dela é respeitado. ⚠️ **Duas tentativas reprovaram antes**: flood fill com tolerância alta e núcleo puro `dif>18` COMEM a parte branca da embalagem (adoçante, leite semidesnatado, biscoito sem açúcar, suco de laranja) — quem pegou foi a Kamylla, olhando. Conferência VISUAL das imagens é obrigatória neste tipo de trabalho.
- **Motor (`lib/informacao-foco.ts`):** `Produto.marca` deixou de ser derivada do nome (a marca é dado do produto); `modelos()` nunca põe dois cartões de mesmo nome na mesma questão; **"Conteúdo" (mL/L) só em líquido e "Peso" (g/kg) só em sólido** (antes um pacote de arroz podia aparecer com "1 litro"); nível 4 monta as cenas a partir do catálogo. `CATALOGO` exportado.
- **6 testes de integridade novos** (imagem existe em disco, PNG RGBA, marca por produto, **nomes únicos e catálogo = 73**, campo coerente com o estado). 205 testes no total.

**✅ RESOLVIDO no mesmo dia — as 3 embalagens de marca real:** ela regerou com marca fictícia (gelatina **Doce Flora**, fermento **Casa Nobre**, leite em pó **Vale do Campo**) e foram integradas (v2.60.2) → catálogo em **73**. Ao recortar apareceu um caso novo: a gelatina veio com **fundo CREME, não branco**, e o método deixava mancha — o script passou a **amostrar a cor do fundo nas bordas** em vez de assumir branco.

<details><summary>Plano original (passos e provas)</summary>

**Fatos medidos antes de começar** (pasta `~/Downloads/Informação em foco`, 80 PNG):
- 20 arquivos `31_…50_` = produtos NOVOS (pasta de amendoim, azeite, mel, geleia, farinha de trigo, açúcar refinado, adoçante, café torrado, achocolatado, leite em pó, aveia fina, chia, linhaça, 2 vinagres, sal rosa, mix de pimentas, ervas finas, gelatina, fermento).
- 50 arquivos `ChatGPT…14:4x` = as ORIGINAIS dos 50 produtos já integrados (nada novo).
- 10 arquivos `ChatGPT…17:18` = produtos NOVOS (pasta de amendoim NutriVale, geleia Frutallis, mel Melora, farinha de mandioca, polvilho doce, goma de tapioca, chocolate 70%, chá verde, molho barbecue, shoyu).
- ⇒ **30 produtos novos** (50 → **80 no catálogo**) e as 80 imagens precisam ficar transparentes.
- Estado atual das imagens do jogo: `public/exercises/informacao-foco-produtos/*.png` são RGBA 360×360 mas **100% opacas** (fundo branco) — no tema GAMIFIED o cartão é escuro (`bg-[#0D2547]`), então o fundo branco vira um quadrado feio. É exatamente o que ela apontou.

**Passos (cada um termina com prova + commit):**
1. **Recorte com alfa real** — pipeline PIL: remove o fundo branco conectado às bordas (inclui a sombra), preserva partes brancas internas da embalagem, normaliza em 360×360 RGBA. *Pronto quando:* verificação automática (cantos com alpha 0, área do produto preservada, 80/80 arquivos) **+ conferência visual minha** das 80 sobre fundo escuro, sem buraco na embalagem nem sobra de fundo.
2. **Catálogo (`lib/informacao-foco.ts`)** — +30 modelos com marca fictícia, categoria, estado e flags coerentes (lactose/açúcar/alérgeno). *Pronto quando:* teste novo de integridade (toda imagem do catálogo existe em disco, nome único, marca definida) + `npm run test` verde + `npx tsc --noEmit` 0.
3. **Exibição** — cartão renderiza o PNG transparente nos 3 temas; bump de versão + `npm run build`. *Pronto quando:* build OK e versão nova no `package.json`.
4. **Publicação** — push na `main` e conferência de `/api/version` em produção.

**Regra do trabalho:** as imagens originais dela ficam intocadas em `~/Downloads/Informação em foco`; o que for sobrescrito em `public/` tem backup datado antes (feito: `~/neuropeak-asset-backups/informacao-foco-produtos-bak-20260801`).

</details>

## Checkpoint (2026-08-01) — Unificação + reescritas: Informação em Foco · Vigilância · Focus · Compra · Dupla Tarefa (v2.47.2 → v2.59.0)

**Sessão longa de refinamento guiado pela Kamylla (ela testava em produção e devolvia ajustes).** Tudo em produção, git limpo, `local = ar = 2.59.0`, **199 testes** (16 arquivos), tsc 0, build OK.

### Decisões de design que valem para TODO o projeto (memória `principio-sem-dica-apos-instrucao`)
- **Depois da instrução, NENHUMA dica ao paciente.** Comando/alvo não fica visível durante a execução (senão vira busca guiada e não treina memória de trabalho/percepção). Focus: barra "ALVO" removida + card com botão **OK**. Vigilância: modelo da pipa só no tutorial, nunca a cada rodada.
- **Cor não pode entregar a resposta** — valores dos cartões em tom neutro; destaque só no feedback, depois de responder.
- **Sessão por TEMPO (~5-7 min), não por nº fixo de questões.**
- **Adaptativo por sequência: 3 acertos ↑ / 3 erros ↓**, silencioso — sem tela de "resultado do bloco" interrompendo.
- **Imagens reais, não emoji**, sempre que houver acervo. **Estímulos não podem ser ambíguos entre si** (óculos de grau × escuros nunca na mesma cena).

### 1. INFORMAÇÃO EM FOCO — NOVO, unifica 2 exercícios (v2.54.0 → v2.59.0) ✅
- **Unifica "Caça Informação" (`caca-item-barato`) + "Mudança de Regras" (`mudanca-regras`)** num só (`informacao-em-foco`, attention/seletiva). Os antigos **saíram do menu** (taxonomia), redirecionam no switch e em `EXERCISE_ALIASES` (`lib/exercise-plan.ts`) — inclusive nos **planos já salvos** do paciente (era por isso que continuavam aparecendo no Início). Ícone herdado do Caça Informação.
- `lib/informacao-foco.ts` (motor PURO, 9 testes rodando 500×/nível): 4 níveis (localizar → comparar → duas condições → situações funcionais), tipos variados (preço/peso/volume/unidades/validade/lactose/açúcar/conservação/sabor/alérgeno), **validação de resposta única**, distratores plausíveis, **balanceamento de posição**.
- Componente: mecânica única (tocar no cartão), tutorial **PARE→LEIA→PROCURE→CONFIRA→RESPONDA**, feedback que ensina onde achar o dado, pista na 1ª errada (2 tentativas), sem auto-avanço.
- **Catálogo 14 → 50 produtos com embalagem real** (imagens que a Kamylla gerou), com slug + **marca fictícia** (`MARCAS`) em `/exercises/informacao-foco-produtos/`. Cartão: imagem grande + nome + marca + campos em linhas. Sem OCR: dados continuam gerados pela lógica.

### 2. VIGILÂNCIA — reescrita completa (v2.55.0 → v2.56.0) ✅
- Era um CPT de letras A/X → virou **8 pipas (7 iguais + 1 diferente)** com **resposta por REGIÃO espacial** (não precisa tocar em cima).
- `lib/vigilancia.ts` (motor PURO, 13 testes): escada de 15 degraus de exposição; adaptativo (2 acertos aceleram / 1 erro mantém / 2 erros desaceleram / 3 erros voltam ao estável); classificação espacial (exata/aproximada = certo, adjacente/distante = erro); contrabalanceamento das 8 posições; ponto estável; bloco de 12.
- **Assets dela** (`~/Desktop/Exercicio Vigilancia`): 6 pares de pipas (tom / nº de laços / orientação) + 4 fundos → `/exercises/vigilancia/` com manifests JSON.
- **v2.56.0 (correção importante):** NÃO reapresentar o modelo a cada rodada. Tutorial de 2 telas + fluxo automático (fixação → pipas piscam → somem → clique na região) + linha-guia no cursor.

### 3. FOCUS AGENTES (v2.51.1 → v2.58.0) ✅
- **Delay das imagens resolvido:** preload das 144 imagens no mount (PNG mantido — WebP ficou maior).
- Personagens **sempre espalhados em 2D** (a queda em linha concentrava numa faixa); mais movimento com a dificuldade.
- **Comando com botão OK** + barra "ALVO" removida; **sem tela de resultado do bloco**; **adaptativo 3↑/3↓**; **não repete o comando anterior**; **óculos de grau × escuros nunca na mesma cena**.

### 4. COMPRA MULTIFUNCIONAL (v2.49.0 → v2.51.0) ✅
- **Layout de 2 painéis** (história sobre fundo temático | missão) conforme mockup dela.
- **Jornadas por LOCAIS nos 6 temas** (`ROTEIRO` em `lib/compra-missoes.ts`): cada missão passeia por lugares coerentes e o fundo alterna por cena — resolveu "só neve, fica repetitivo" e "viajar ao frio e comprar leite".
- **18 fundos aquarela** (`/exercises/compra-fundos/`). Itens com **imagem real** (`IMG_BUSCA` em `data/compra-itens.ts`; resolveu o gorro com cara de boné → `touca.png`). **Auto-avanço ao acertar**. Modo "Variado" **não repete o tema anterior**. Opções de resposta só nos níveis 1-3.

### 5. DUPLA TAREFA (v2.52.0) ✅
- Alvo agora é **CONJUNÇÃO forma+cor: só o TRIÂNGULO VERDE** (era "círculo verde"). Distratores testam as 2 dimensões; losango adicionado. Validado nos 7 casos exigidos.
- Bloco de instruções redesenhado (ícones lucide, sem emoji), layout do mockup, **aviso "REGRA ALTERADA"** nos níveis 8-10.

### 6. TEMPO DE REAÇÃO (v2.48.1) ✅
- **Velocidade proporcional ao nº de alvos** (+40% de travessia por alvo extra) — com 2-3 balões ficava impossível.
- **Uma direção por leva** (sem misturar lados) + **distratores azul-esverdeados** com aviso no tutorial.

### 7. MOT (v2.48.0) ✅
- Arena finalmente maior: passou a medir `window.innerWidth/innerHeight` direto (o `clientWidth` do wrapper vinha travado pequeno); bolas menores e mais espaçadas.

### Pendências para a próxima sessão
1. **Informação em Foco:** integrar as **20 imagens restantes** (mel, geleia, adoçante, chia, linhaça, vinagres, sal rosa, ervas… em `~/Downloads/Informação em foco` — precisam virar produtos novos no catálogo); **Fase 2** = painel de config do profissional (~40 opções), relatório detalhado por categoria, custo-benefício (off por padrão), acessibilidade completa, confirmação de impulsividade.
2. **Vigilância — Fase 3:** salvamento/retomada individual (não voltar ao nível 1), registro por tentativa, precisão técnica (`performance.now`), relatório profissional, config, calibração formal.
3. **Focus — Fases 3/4:** registros detalhados do profissional e painel de acessibilidade (spec de 18 seções).
4. **Compra Multifuncional:** gerar embalagens variadas (vários leites/iogurtes) se ela quiser comparações do mesmo tipo.
5. **Aguardando teste dela** em tudo que subiu hoje (ela valida em produção e devolve ajustes).

---

## Checkpoint (2026-07-12) — Sessão de reformas: Focus Chuva · Cubo Corsi · Span Auditivo · Perf de imagens (v2.17.1 → v2.27.1)

**Modelo de operação (CORRIGIDO em 01/ago/2026):** a sessão **orquestra em Opus 5, esforço xhigh FIXO** — padrão definido pela Kamylla, **não negociável**; nunca baixar modelo/esforço (fatiar o trabalho, sim). O que vale do método: verificar TUDO com evidência própria (probes, geometria, build, produção) antes de aceitar; loop de devolução até passar. Memória: `modelo-operacao-opus5-xhigh`. ⚠️ O texto original deste checkpoint dizia "Fable orquestra" — **estava errado** (veio de uma sessão cujo orquestrador era outro modelo) e foi corrigido; a memória antiga foi apagada.

### 1. Performance de imagens (v2.17.1-2.17.3) ✅
- Todas as pastas de imagem usadas otimizadas: 421→110 MB (historias 193→51, pet 136→7…); 1530 PNGs verificados vs backup (0 perda de alfa). Backups em `~/neuropeak-asset-backups/`.
- Cache 7 dias p/ `/exercises|/pet|/petimg|/skilltree` (next.config.js) — ⚠️ trocar imagem mantendo nome = usar cache-bust (`AGENT_V` etc.).
- Restaurante: preload da cena com prioridade, plaquinha vidro translúcido; repo: ~486 MB de matéria-prima removida do versionamento (backup + .gitignore).

### 2. Restaurante — som ambiente (v2.18.x) ✅
- Gravação REAL de restaurante (domínio público/Wikimedia) em loop sem emenda 74s, ganho 0.20 (bem baixo, distrator de fundo), botão 🔊/🔇. Arquivo: `audio/ambience-restaurante-real.m4a`.

### 3. FOCUS AGENTS — épico "Chuva de Agentes" (v2.19-2.27) ✅ APROVADO ("agora ficou muito bom")
- **Modo Foco = FocusRain.tsx** (queda vertical); Inibição/Alternância/Desafio seguem na arena (intocados, guard `mode==="foco"`).
- **Ciclo da tarefa (modelo da Kamylla):** card com comando + botão Começar → chuva cai (distratores 1º; alvo NUNCA antes de ≥7 distratores e ≥2,6 s) → 1 toque decide: acertou→próximo card · errou→tarefa ACABA na hora→próximo card (nota "Não foi dessa vez") · alvo escapa 2×→omissão. **3 acertos seguidos = SOBE nível · 2 falhas seguidas = DESCE nível (piso 1)** — nível/velocidade novos valem só a partir do comando seguinte.
- **Comandos:** SÓ combinados (cor+feature, 102 regras; "Ache o agente amarelo com skate", 1 linha no card); multi-alvo N5-6=2, N7=3 ("…e o vermelho de bermuda"); comando SOME durante a busca (memória de trabalho).
- **Física:** velocidade UNIFORME calculada por quadro (ninguém ultrapassa; exceção = 2ª chance do alvo, mais rápida); chuva CONTÍNUA (fallers ficam entre comandos, congelam atrás do card; `ruleOk`+cull garantem 0 conflito com o novo comando); entrada ritmada (fallMs/maxC) + distância mínima no nascimento (0.8×CHAR_SIZE, banda 1.2×CHAR_H).
- **Calibração FINAL (decisão dela):** tamanho (CHAR_SIZE=100) e densidade (areaPerAgent=42000) PADRÃO em todos os níveis; progressão = só velocidade (fallMs 7200→3900) + comandos mais complexos (nearFrac 0.90→1.0 + multi-alvo).
- **Elenco:** 144 imagens (42 base + 102 features da Kamylla: futebol/basquete±lado, skate/bermuda, óculos-escuro, balão/pipa/guarda-chuva, chapéu/coroa/gorro, alegria/tristeza/raiva, luva). Símbolos e cinza REMOVIDOS. Imagens NORMALIZADAS PELO BONECO (360px fixos em canvas 360×540, âncora rosto→pés) — boneco na tela = CHAR_SIZE. Cache `?v=9`.
- **Pendente (único degrau):** comando com correção ("à esquerda… não, à direita").

### 4. CUBO CORSI — redesign completo (v2.24.4-2.25.2) ✅
- **Ciclo:** cubo VIRA primeiro (1,1 s, ease-in-out sem overshoot) → face ~80% de frente (desvio 9-13°, provado por geometria) → peça PISCA de frente (0,85 s) → volta suave ao canto. TODA peça faz o ciclo (mesma face repetida também). Tutorial usa o MESMO ciclo (pose controlada — antes truncava).
- **Visual (paleta da Kamylla, estilo Cogmed):** estrutura #9EBEDD, bordas #82A9CF (finas, 1px, gap 3,2%), placas #F7FBFF, luz #4F8FEA, fundo #F4F7FB, sombra = ELIPSE separada no chão (⚠️ NUNCA `filter` no elemento 3D — achata o preserve-3d; já quebrou 1×).
- Cubo maior: S=0.52×size, size 540 (jogo) / 380-420 (tutorial).

### 5. SPAN NUMÉRICO AUDITIVO (Direto+Inverso) — redesign (v2.27.0-2.27.1) ✅
- Painel 3×3 (1-9, SEM 0) estilo referência, paleta azul-clara (luz #4F8FEA); sequência sorteia 1-9 SEM repetição (shuffle+slice).
- Apresentação: tecla do número falado PISCA em sincronia com o áudio (ambos os modos); bolinhas preenchem na fala.
- INVERSO: bolinhas VIRAM 1× ao fim da fala (rotate 180, anel marca o início→vai pro outro lado) — dica sutil sem números; fileira do input nasce já virada (fix do giro duplo).
- Resposta clicando no painel, sem dica de texto. Tema claro em tudo (Ready/feedback).

### Lições/regras de trabalho (memória `licao-regressoes-visuais`)
- NUNCA `filter/drop-shadow` em elemento 3D. Mudança em coisa APROVADA = verificação visual/geométrica ANTES de publicar. Normalizar personagens pelo BONECO, não pelo bbox. `tsc` via pipe esconde o exit code (usar `npx tsc --noEmit; echo $?`).

### Pendências para a próxima sessão
1. Focus: degrau "comando com correção" ("…não, à direita").
2. Focus: replicar a chuva (ou decidir) p/ Inibição/Alternância/Desafio — hoje seguem na arena antiga.
3. Compra Multifuncional: redesign cognitivo pendente (spec em COMPRA-MULTIFUNCIONAL-REDESIGN.md).
4. Skate azul: Kamylla mencionou versão corrigida fora da pasta do projeto — se reaparecer, lembrar que o jogo lê `public/exercises/agentes-personagens/` (e subir AGENT_V).
5. Dívida técnica: docs/DIVIDA-TECNICA.md e BACKLOG.md.

---

## Checkpoint (2026-07-10) — Auditoria completa v2 + documentação · Fases 0-2 concluídas

**Sessão de auditoria + documentação. Regra: código-fonte intocável; escritas restritas a relatório de auditoria, docs, PROGRESSO.md e BACKLOG.md. Sem commit/push sem ordem explícita.**

**Fases 1-2 concluídas — relatório em `docs/auditoria/AUDITORIA-2026-07-10.md`.** 5 dimensões auditadas em Opus (Correção em 2 passadas por causa do volume; Segurança precisou de 3 tentativas por falha de saída estruturada, entregue em markdown; nenhuma dimensão ficou sem cobertura). **55 findings brutos → 54 ativos** (GER-003 consolidado em CORR-004). Verificação adversarial dos 8 P1: **8 CONFIRMADOS, 0 refutados**, mas 6 rebaixados por mitigadores reais. Placar final verificado: **0 P0 · 1 P1 · 27 P2 · 26 P3**. Único P1: **SEC-001** (sem rate limiting no login por PIN — brute-force de credencial clínica). Eixos principais: (a) fidelidade da métrica clínica dos exercícios (CORR-001/004/008/009/013/014/015…), (b) acesso/segurança (SEC-001/002/003), (c) dívida arquitetural (ARQ-001 metadados triplicados; ARQ-002 pet/skill só em localStorage; ARQ-003/004 exercícios órfãos) e supply chain (GER-001 db:seed quebrado; GER-002 deps não usadas). Descoberta relevante: **next instalado é 15.5.18** (não o 15.3.9 do package.json) → CVE-2025-29927 não se aplica. Nada corrigido (auditoria só propõe). Avaliação geral: base saudável (tsc 0, 24 testes, build ok, isolamento multi-tenant consistente, baseline de 30/05 intacto); trabalho recomendado lidera por SEC-001 + bloco de fidelidade clínica.

**Fase 0 — inventário (tudo medido em 2026-07-10):**
- Versão: 2.11.1 (`package.json:3`). Código: ~40.8k linhas TS/TSX — app/ 52 arq (7.353 l), components/ 102 (27.214, sendo 47 .tsx em exercises/), lib/ 31 (29+2 testes; 3.570 l), data/ 7 (2.096), types/ 3 (585), prisma/schema.prisma (156 l).
- Verificações executadas: `npm run test` → 24/24 OK (vitest 4.1.7); `npx tsc --noEmit` → exit 0; `npm run lint` → 5 warnings/0 errors; `npm run build` → OK nesta sessão.
- Superfície externa: 22 rotas em `app/api/**/route.ts` (autoprotegidas; middleware NÃO cobre /api) + `middleware.ts` com 12 prefixos por role + cron `0 8 * * *` UTC (`vercel.json`). Auth: NextAuth v4 JWT 8h, providers `therapist-login` e `patient-pin` (`lib/auth.ts`).
- Fluxo central: `app/(patient)/treino/[exercicio]/page.tsx` (37 exercícios lazy via switch) → `ExerciseWrapper` (instructions→exercise→results) → `POST /api/sessions` → progressão server-side em `lib/adaptive.ts` (progressionV2 genérica, story-trail, dual-task, legado) → upsert `ExerciseConfig` + achievements + alerts.
- Persistência: banco é fonte-da-verdade (Session/ExerciseConfig); localStorage só caches (np_session_dia, XP jornada, pet, np-focus-day).
- Sinais levantados pelos scouts (A CONFIRMAR na Fase 1/2, não são findings ainda): página `/admin` sem checagem server-side de ADMIN_EMAIL (APIs subjacentes protegem); `reset-password`/`redeem-license` fora do `withApiHandler`; `useAdaptiveLevel` sem importadores; `calculateDomainScore` cobre 4 dos 5 domínios (functional fora); percentis/NORMATIVE_BENCHMARKS documentados mas inexistentes no código; CSP com unsafe-inline/unsafe-eval; PIN retornado em claro na criação de paciente; `app/auth/` e `components/reports/` vazias.
- Docs da raiz (ciclo 2026-05-30/06-03) gravemente defasadas: versões 1.9.5/1.16.6 vs 2.11.1; "4 domínios" vs 5 reais (`types/index.ts:4`); ids inexistentes citados (associacao-pares, decisao-rapida, atencao-*); contagens erradas (attention 11 vs 8; memory 9 vs 15; "~36 componentes" vs 47). Reescrita prevista na Fase 3.

**Plano de fases:** F1 = 5 auditores independentes (CORRETUDE/SEGURANÇA/ARQUITETURA/PERFORMANCE/GERAL; ondas ≤3; finding padronizado P0–P3 com evidência e confiança) → F2 = verificação adversarial de todo P0/P1 + consolidação em `docs/auditoria/AUDITORIA-2026-07-10.md` (sem corrigir nada) → F3 = docs derivadas do código real (CLAUDE.md, README.md, docs/ARCHITECTURE.md, docs/ADR/, docs/DIVIDA-TECNICA.md, CHANGELOG.md, PROGRESSO/BACKLOG) → F4 = validação independente das docs.

**Fase 3 concluída (docs derivadas do código real, tudo medido):** `CLAUDE.md` reescrito (145 l, <200) · `README.md` novo · `CHANGELOG.md` novo · `docs/ARCHITECTURE.md` (385 l, agente Opus) · `docs/ADR/ADR-001..008` + índice (agente Opus) · `docs/DIVIDA-TECNICA.md` (54 findings por ID) · `BACKLOG.md` reescrito · `ARCHITECTURE.md` da raiz virou stub → aponta para `docs/ARCHITECTURE.md`. Inventário-base: 39 exercícios (switch=EXERCISE_DEFINITIONS=39), 5 domínios, taxonomia mapeia 35, fantasma `atencao-dividida`, órfão `desafio-cidade`.

**Fase 4 concluída (validação independente por 2 doc-reviewer Opus, read-only).** Validador 1 (CLAUDE/README/ARCHITECTURE): **0 bloqueadores** — CLAUDE e README APROVADOS; ARCHITECTURE com 4 menores (linhas TS/TSX 40.933→40.8k, schema 157→156, "~37 componentes"→39, "componente fantasma"→"id fantasma/componente órfão") — **todos corrigidos**. Validador 2 (ADRs/DIVIDA/CHANGELOG/BACKLOG): 1 bloqueador + 3 menores — o bloqueador era o CHANGELOG atribuir o RLS à auditoria de 05-30; na verdade o RLS foi habilitado em ação separada de 2026-06-02 (PROGRESSO.md:27), então **corrigido atribuindo ao evento certo** (não removido); menores (452 commits "no total", CORR-004 "(consolida GER-003)" na Dívida, afirmação de linhas do BACKLOG suavizada) — **todos corrigidos**. Contagens 1 P1/27 P2/26 P3/54 batem entre auditoria, Dívida e Backlog; 24 âncoras das ADRs verificadas; testes/tsc/lint reexecutados pelos validadores e confirmados. **Documentação declarada pronta.** Nenhum código foi tocado em toda a sessão.

---

## Checkpoint (2026-06-02) — RLS habilitado no banco de produção

**Contexto:** Supabase enviou alerta de segurança (`rls_disabled_in_public` + `sensitive_columns_exposed`) em 31/05. Causa: o Prisma cria as tabelas no schema `public` e nunca habilita RLS, mas o Supabase expõe esse schema via API REST (PostgREST) pública — sem RLS, qualquer um com URL+`anon` poderia ler/editar tudo. Mitigação prévia (não-defesa): o app **não** expõe `anon`/URL no client (zero `NEXT_PUBLIC_SUPABASE_*`); supabase-js só roda server-side com `service_role`, e só para storage de CRP. Toda query de dado é via Prisma.

**Correção aplicada (via SQL Editor do Supabase, role `postgres`, prod):** `ENABLE ROW LEVEL SECURITY` em todas as 10 tabelas do `public` (Achievement, Alert, ExerciseConfig, LicenseCode, PasswordResetToken, Patient, Session, TherapeuticSession, TrainingPlan, User) — **sem políticas e sem FORCE**. Verificação `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public'` retornou `rowsecurity = true` nas 10. O Prisma continua acessando porque conecta como **dono** das tabelas (ignora RLS sem FORCE); a API `anon` vira deny-all.

**⚠️ Pendências relacionadas:**
- **Validação funcional do app** após o RLS (login + dashboard carrega pacientes + salvar sessão) — confirmar que o role do app realmente bypassa RLS. Rollback de emergência se quebrar: `... DISABLE ROW LEVEL SECURITY`.
- **RLS não cobre a `service_role`** (ela ignora RLS). A rotação de `service_role key` + senha do banco (exposição de 30/05) **continua pendente** — adiada por decisão do usuário.
- Incidente de processo: dois blocos SQL quase idênticos (ENABLE/DISABLE) na mesma mensagem causaram execução acidental do DISABLE primeiro (sem dano — tabelas já estavam sem RLS). Corrigido na sequência.

---

## Estado atual (2026-05-30)

**Versão:** 1.9.5 (`699a34a`) — sincronizada com `origin/main` após `git pull`.
**Atividade:** Auditoria completa + correção de quase todo o backlog (sessão ultracode — workflow + agentes). Status detalhado em `AUDITORIA-2026-05-30.md`.

### Backlog — fechamento da sessão ultracode (2026-05-30)

**✅ RESOLVIDO e validado (tsc + lint + build + 24 testes, todos exit 0). 5 commits LOCAIS (NÃO pushed): 28fdc32, ce147db, 964f646, e9bb59f, 1b3060d.**
- Backend/segurança/qualidade: SEC-04 (CRP gate server-side), SEC-06 (images host), SEC-07 (timingSafeEqual+fail-closed), SEC-09 (security headers/CSP), QUAL-01 (health), QUAL-02 (error boundaries), QUAL-03 (.env.example), QUAL-04 (email hardcoded), QUAL-05 (middleware matcher), BUG-04 (adesão÷0), CSPRNG (randomInt), REL-04 (mailer), REL-05 (CRP upload), DUP-03/04 (helpers), LINT-01 (ESLint8 + fix useId condicional).
- Exercícios: PERF-01 (FocusAgents rAF), PERF-03 (MOT rAF), REL-03 (timers cleanup), BUG-06 (race NBack), DUP-02 (TTS — parcial), ARCH-01+DEAD-01 (dead code).
- TEST-01 (Vitest, 24 testes, regressão de BUG-01/BUG-04). A11Y-01 (aria-labels). BUG-05 avaliado e descartado (não era bug).

**⏸️ DEFERIDO (não são fixes seguros — justificativa honesta):**
- **DUP-01** (tokens de tema em ~30 exercícios): NÃO é refactor "mesmas strings" — os exercícios HOJE divergem no tema; consolidar = unificar visual = mudança de DESIGN + regressão visual garantida. É projeto de design dedicado + smoke test, não fix cego.
- ~~**PERF-02** (over-fetch dashboard)~~ → ✅ **RESOLVIDO 2026-05-30**: `dashboard/page.tsx` agora usa `$queryRaw` com window function (`ROW_NUMBER() OVER (PARTITION BY patientId ORDER BY completedAt DESC) <= 20`) — top-20 sessões por paciente em vez do histórico inteiro. Equivale ao `.slice(0,20)` que o código já fazia (sem regressão). Validado: tsc 0 + eslint 0 + build 0 + query no banco real (`ok=true`, nomes de coluna e window function corretos). Ganho atual ~zero (1 paciente/6 sessões), preventivo contra crescimento sem limite.
- **ARCH-02** (quebrar god-files de ~1150 linhas): refatoração estrutural de alto risco / zero valor funcional em produção. Pular.

**✅ SCHEMA-01 — APLICADO NO BANCO DE PRODUÇÃO (2026-05-30):**
- Código: FKs `TherapeuticSession.patient/therapist` (`onDelete: Cascade`) + `Patient.therapist` (`onDelete: Restrict`) no `schema.prisma` (commit `641bff5`). Validado: prisma generate + tsc + build, todos 0.
- Banco (Supabase prod, via SQL Editor): diagnóstico (score/accuracy/difficulty 0 fora; 3 `TherapeuticSession` órfãs de paciente deletado) → `DELETE` das 3 órfãs → `BEGIN/COMMIT` criando 2 FKs (`ON DELETE CASCADE`) + 3 CHECK (`session_score_range` 0–100, `session_accuracy_range` 0–1, `session_difficulty_range` 1–10).
- Verificação independente: `pg_get_constraintdef` confirmou as 6 constraints + `Patient.therapist` = `RESTRICT` (= schema). Banco 100% alinhado com `schema.prisma` → `db push` futuro não mexe nas FKs (só as CHECK ficam fora do schema — reaplicar se houver `db push`).
- Impacto no código verificado (benigno): create de TherapeuticSession usa therapistId/patientId comprovadamente existentes; delete de paciente agora cascateia (corrige o bug das órfãs); não há rota que delete terapeuta.

**✅ SEC-08 — EXECUTADO (2026-05-30):** `NEXTAUTH_SECRET` rotacionado via Vercel CLI (conta `neuropsikamylla-blip`, projeto `neuropeak-5jyl`). Secret forte (64 chars, `openssl rand -base64 48`) em Production; redeploy `vercel --prod` → `dpl_8zMx8EV4KWW2Vr8UJex4mcH2m8wd` (READY, aliado a `neuropeak-5jyl.vercel.app`); verificado por buildId novo + `/api/health ok`. Secret fraco (`…2024`) eliminado de todos os ambientes. **Preview ficou sem o secret** (CLI não-interativo não cria preview "all branches"; resolver na web se previews forem usados — não é risco de segurança).

**🔧 OPERACIONAL (restante):**
- **SUP-02**: nodemailer CVE moderate — sem fix disponível; monitorar.

**⚠️ Antes de push/deploy:** smoke test visual dos exercícios com animação (MOT, FocusAgents — PERF-01/03 trocaram o mecanismo de animação; build não pega regressão visual).

> A 1ª auditoria (skill `/auditor`) rodou em execução única (sem dispatch de sub-agentes) e só amostrou os exercícios. A 2ª rodada (5 agentes via ferramenta `Agent`) encontrou **6 críticos + 9 altos NOVOS** não detectados antes — incluindo IDORs sistêmicos e SEC-02 no `sessions/route.ts` (arquivo que eu havia editado para o fix A1 sem notar o IDOR de THERAPIST).

---

## Auditoria — sessão 2026-05-30

Auditoria completa das 5 dimensões (correctness, architecture, security, performance, general)
sobre toda a base (~149 arquivos). Cada achado Crítico/Alto foi **verificado lendo o código real**
antes de corrigir (regra: zero suposições como fatos).

### ✅ Corrigido nesta sessão (código puro, sem migração, tsc limpo)

| ID | Severidade | Arquivo | Correção |
|----|-----------|---------|----------|
| C1+A4 | Crítico/Alto | `app/api/therapeutic-sessions/[id]/route.ts` | Ownership check (GET+PATCH) + allowlist Zod (anti mass-assignment) + paciente não recebe `therapistNotes` |
| A1 | Alto | `app/api/sessions/route.ts` | `score: z.number().min(0).max(100)` (era sem teto) |
| A2 | Alto | `app/api/patients/[id]/route.ts` | GET com `select` restrito por role — paciente só recebe `id/birthDate/theme/exerciseConfigs`, nunca dados clínicos |
| A3 | Alto | `app/(patient)/treino/[exercicio]/page.tsx` | Bug: `dateOfBirth` → `birthDate` (campo não existia; `patientAge` era sempre `undefined`) |
| M6 | Médio | `app/api/patients/route.ts` | Decremento de licença em `$transaction` com `updateMany` condicional (anti race) |

**Validação:** `npx tsc --noEmit` → exit 0. **Ainda NÃO commitado nem deployado.**

### ⏳ Pendente de DECISÃO do usuário (envolvem migração de banco / mudança de produto)

- **C2 (Crítico)** — `pinPlain` (PIN em texto plano) em `schema.prisma:42`, gravado em `patients/route.ts:83`
  e exibível em `PatientCredentials.tsx`. Remover exige migração Prisma (drop column) + decisão de UX
  (como o terapeuta passa o PIN ao paciente). **Não tocar sem aval.**
- **M5 (Médio)** — `TherapeuticSession` sem FK/relação (`patientId`/`therapistId` são strings soltas);
  `Patient.therapist` sem `onDelete`. Exige migração de schema.
- **A1-completo** — recalcular score no servidor (refatoração; `lib/scoring.ts` roda no cliente hoje).

### 📋 Achados não corrigidos (menor severidade — backlog)

M1 (sem rate limit em auth), M2 (comparação não time-safe de segredos), M3 (`Math.random()` em PIN/código),
M4 (`images.remotePatterns: "**"`), B1 (componente órfão `AtencaoDividida.tsx`), B2 (shuffle enviesado em
`selectTargets.ts`), B3 (timezone em reports), B4 (XSS baixo em mailer), B5 (`.gitignore` sem `.env`),
B6 (scoring acoplado cliente/servidor), B7 (admin por e-mail).

---

## Próximos passos (revisados após auditoria completa)

Prioridade por bloco — ver `AUDITORIA-2026-05-30.md` para detalhes/IDs:
1. ✅ **CONCLUÍDO (2026-05-30) — Bloco crítico de código puro:** SEC-01/02/03 (3 IDORs multi-tenant fechados: GET/POST therapeutic-sessions + POST sessions THERAPIST), BUG-01 (`hasConsecutiveDays` corrigido com locale en-CA — comprovado por execução), SUP-01 (Next.js 15.3.9→15.5.18 via `npm audit fix`, CVE HIGH resolvido). Validado: `tsc` exit 0 + `npm run build` exit 0 + `npm audit` 0 high. **Não commitado (acumulando).**
1b. ✅ **CONCLUÍDO — Bugs clínicos de exercício:** BUG-02 (DeductiveGrid — múltiplos "yes" por pessoa impedidos na raiz no `cycleCellState`) e BUG-03 (DesafioCidade — nível inicial clampado ao teto real de cada ambiente via `MAX_LVL`). Validados tsc+build.
2. **C2 ✅ CONCLUÍDO COMPLETAMENTE (2026-05-30):** pinPlain removido do código (commit 59b8539) + coluna dropada do Supabase de produção via `ALTER TABLE "Patient" DROP COLUMN IF EXISTS "pinPlain"`. PINs em texto plano eliminados de todas as camadas (código + banco). SEC-04 (CRP gate server-side) e A1-completo (score server-side) seguem pendentes.
3. **Rede de proteção:** REL-02 ✅ CONCLUÍDO (transações + claim atômico em redeem-license, reset-password, therapeutic-sessions POST, patients PATCH). REL-01 ✅ CONCLUÍDO: helper `lib/api-handler.ts` (`withApiHandler`) em TODAS as 20 rotas que fazem I/O (try/catch + logging padronizado). Só `auth/[...nextauth]` (gerenciado) e `version` (sem I/O) ficaram de fora, com justificativa. Mapa de cobertura: 0 faltas. TEST-01 (Vitest p/ lib/) e LINT-01 (ESLint) ainda pendentes. Validado: tsc + build exit 0.
4. **Backlog médio/baixo:** ver relatório.
5. Subir: commit + push (e deploy Vercel se aprovado) — **com aval humano**. Decisão: acumular até fechar os críticos.

## Performance — FocusAgents (2026-05-30)

Refatoração de `components/exercises/attention/FocusAgents.tsx` (frente paralela ao redesign visual):

- **PERF-01 ✅ CONCLUÍDO** — Loop de queda dos "fallers" migrado de `setInterval(~TICK_MS, ~20fps)` +
  `setFallerPositions` por tick (que re-renderizava SceneBg/HUD/órbitas ~20x/s) para
  `requestAnimationFrame` + mutação direta de `node.style.transform` via `Map<uid, HTMLDivElement>`
  (callback ref). Padrão idêntico ao já aplicado em `MOT.tsx` (PERF-03). Detalhes:
  - Física viva em `fallersRef`; base renderizada (top px / left %) capturada em `fallerBaseRef` no
    início do play; transform = delta sobre a base. Helper puro `fallerXPct(f, y)` compartilhado entre
    render e rAF (garante paridade exata; X depende do Y via `xBase + xAmp*sin(y/xFreq...)`).
  - Velocidade normalizada por `dt/TICK_MS` (com clamp de dt a 100ms) → física idêntica ao interval
    antigo independente da taxa de frames do rAF. **Crítico**: sem isso a queda triplicaria a 60fps.
  - `setState` só em eventos discretos: init de round, mudança de passagem do alvo (`setTargetPass`,
    agora disparado só na transição via `targetPassRef`), timeout e `handleResult`.
  - `transform` omitido do style durante `playing` (rAF controla); zerado no feedback. `handleResult`
    e o ramo de timeout fazem `setFallerPositions([...fallersRef.current])` para congelar na posição
    real e evitar "salto" dos agentes na transição playing→feedback.
  - Cleanup: `stopFallAnimation` agora faz `cancelAnimationFrame`; o useEffect de unmount já o chama.
- **DUP-02 ✅ JÁ RESOLVIDO** — FocusAgents já consumia `playTTS`/`cancelTTS` de `@/lib/tts` (não havia
  Web Speech local; `speakFn` é só um wrapper que respeita `forceMode === "visual"`). Nada alterado.
- **Validação:** `npx tsc --noEmit` exit 0 + `eslint` no arquivo exit 0. Build NÃO rodado (orquestrador
  roda depois com NEXTAUTH_URL setada). Comportamento preservado: física/velocidade/posições, hit-test
  por agente, fluxo de comandos, TTS e visual — verificados por trace matemático do delta de transform.

## Notas importantes

- App clínico (LGPD): dados sensíveis de pacientes. Achados de segurança têm peso real.
- A skill `auditor` não conseguiu usar dispatch de sub-agentes neste ambiente; auditoria foi
  feita em execução direta + verificação manual de cada Crítico/Alto.
- `package-lock.json` tinha alteração local espúria (descartada — usuário nunca editou o app localmente).
