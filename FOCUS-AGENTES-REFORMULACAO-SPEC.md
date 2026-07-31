# Focus Agentes — Reformulação (spec da Kamylla, 31/jul/2026)

Reformular o exercício de **atenção visual** (Focus Agentes) para treinar percepção/busca
visual, atenção seletiva, velocidade de processamento, controle inibitório e discriminação
de atributos. **Não depender de expressões faciais.** Manter identidade visual (fundo
azul-escuro/roxo, tipografia branca, barra de progresso, tela cheia), personagens e ilustrações.

## Requisitos (18 seções)

1. **Sem emoções** nos comandos (nada de alegre/triste/raiva). Arquivos ficam no projeto, mas não são usados.
2. **Personagens 30–40% maiores**; acessórios visíveis; nada cortado pela barra nem fora da tela; sem sobreposição. Etapas iniciais ≤6; intermediárias 7–8; avançadas 9–10.
3. **Não escapam**: ao tocar a borda mudam de direção, nunca somem; sair da tela não é erro. **Remover** "capture antes que escape 2 vezes".
4. **Comando sempre visível** na barra do topo (texto + amostra de cor + ícone do acessório + botão de áudio). **Sem modal "Começar" por rodada** — após responder, auto-avança com feedback curto (800–1200 ms). Botão "Começar" só no início da atividade/bloco.
5. **Nova tela de instruções** (título "Como jogar", subtítulo, comando demonstrativo "Toque no personagem azul com fone", 5 bullets, botão "Começar").
6. **Etapas de dificuldade**: (1) um atributo · (2) dois atributos · (3) distratores semelhantes · (4) lateralidade "lado direito/esquerdo da imagem" · (5) inibição (negativos). Frases de exemplo por etapa na spec.
7. **Movimento progressivo**: parado → muito lento → lento → moderado. Nunca rápido em personagens pequenos. Direções/velocidades variadas, sem trajetórias imprevisíveis.
8. **Uma variável por vez** (nº personagens, velocidade, nº atributos, semelhança de distratores, negativos, tempo). Não subir tudo junto.
9. **Adaptativo por BLOCOS de 8**: sobe se ≥80% e tempo na faixa e ≤2 erros seguidos; mantém 60–79%; reduz <60% ou 3 erros seguidos (baixando 1 variável, prioridade: velocidade → nº personagens → comando). **Remover** "a cada 3 acertos sobe".
10. **Feedback específico** por atributo (acerto: "Correto!"/"Acertou a cor e o acessório"; erro: "A cor estava certa, mas faltava o fone", "O alvo era amarelo, não laranja"…). Destacar brevemente o alvo correto após erro (sem confundir com nova rodada). Sem textos longos.
11. **Acessibilidade** (painel do profissional): movimento on/off; velocidade baixa/média/adaptativa; nº máx personagens; áudio; tempo de resposta on/off; negativos on/off; lateralidade on/off; tamanho; contraste; pausa entre rodadas. Botão de áudio sempre. Área de toque ligeiramente maior que a imagem, sem sobrepor.
12. **Distribuição segura**: fora da barra, sem cortar, sem sobrepor, margens mínimas, não concentrar num canto, alvo variando esquerda/centro/direita e equilibrado nos dois lados.
13. **Resultado do bloco**: acertos, erros, precisão %, tempo mediano, melhor sequência, nível — não só estrelas.
14. **Registros do profissional**: corretas/incorretas/omissões, tempo, erros de cor/acessório/objeto/lateralidade/negativo, posição do alvo, velocidade, nº personagens, nível.
15. **Tags dos personagens** derivadas do nome de arquivo (`{cor, acessorios[], objeto, ladoObjeto, expressao:null}`). Não gerar comandos incompatíveis com as tags.
16. **Validar antes de cada rodada**: exatamente 1 satisfaz o comando; ninguém mais é interpretável como correto; alvo visível; atributos distinguíveis; ≥1 distrator semelhante; comando bate com as tags; direita/esquerda relativas à imagem; sem sobreposição. Ambígua → descarta e gera outra.
17. **Preservar** identidade visual; melhorar legibilidade/hierarquia/tamanho/clareza/acessibilidade/fluidez.
18. **Aceitação**: sem emoção como alvo; personagens maiores; comando visível; sem modal por rodada; não escapam; sem ambiguidade; progressão por etapas; 1 variável por vez; feedback específico; áudio repetível; resultados com precisão+tempo; profissional reduz movimento/complexidade; funciona em desktop e tablet.

## Roster (levantado do disco)
6 cores (amarelo, azul, laranja, roxo, verde, vermelho) × 24 variações = 144 PNGs em
`public/exercises/agentes-personagens/`. Variações úteis (sem as 3 emoções): base, bone,
fone, oculos, oculos_escuro, chapeu, gorro, coroa, luva, fone_bone, oculos_bone,
oculos_fone, balao, guarda_chuva, pipa, skate, skate_bermuda, basquete_dir/esq, futebol_dir/esq.

## Plano de FASES
- **FASE 1 (FEITA)** — Fundação de dados/lógica, testada: `lib/focus/roster.ts` (tags §15) +
  `lib/focus/commands.ts` (gerador das 5 etapas §6, validação de alvo único §16, feedback
  específico §10, critério estruturado p/ métricas §14). 9 testes verdes.
- **FASE 2** — Reescrever o componente `FocusAgents.tsx`: layout (personagens maiores §2,
  distribuição segura §12, não escapam §3), comando sempre visível §4, tela de instruções §5,
  feedback específico §10, auto-avanço.
- **FASE 3** — Adaptativo por blocos de 8 §9 + resultado do bloco §13 + registros §14.
- **FASE 4** — Painel de acessibilidade §11 + áudio dos comandos + contraste.

O `generateCommand.ts` antigo (emoções, "escape 2x", "3 acertos sobe") será **substituído**
pelo novo `lib/focus/*` neste exercício.
