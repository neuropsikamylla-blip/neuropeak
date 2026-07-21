# Investigadores da Situação Social — Documento Técnico de Arquitetura

> **Módulo:** Habilidades Sociais / Cognição Social (novo, 6º domínio do NeuroPeak).
> **Exercício:** Investigadores da Situação Social (id provisório: `investigadores-sociais`).
> **Natureza:** instrumento de **treino cognitivo mediado por profissional**. NÃO é chatbot,
> NÃO faz psicoterapia, NÃO interpreta o paciente, NÃO faz mediação clínica automatizada.
> **Papel da IA:** apenas **autoria de conteúdo offline** — gera histórias ilustradas
> preenchendo um schema fixo, com validação automática + revisão humana antes de publicar.
> Em runtime nenhuma IA roda: o app apresenta casos já validados e compara respostas a um
> **gabarito fixo definido por especialistas**.
> **Documento de arquitetura — não contém histórias nem exemplos narrativos.**

Alinhamento com a plataforma (arquivos reais a tocar na implementação): `types/index.ts`
(`Domain`), `lib/domain-taxonomy.ts`, `lib/scoring.ts`, `lib/adaptive.ts`, `prisma/schema.prisma`
(`Session`, `ExerciseConfig`), `app/(patient)/treino/[exercicio]/page.tsx` (switch + `EXERCISE_DEFINITIONS`),
`components/exercises/TutorialBase.tsx`, `components/exercises/useExerciseEngine.ts`, `lib/tts.ts`.

---

## 1. Conceito do exercício

O paciente assume o papel de **investigador** de uma cena social ilustrada. A cada caso ele
**observa** uma situação apresentada em quadros (sequência de imagens com narração), **coleta
pistas sociais** (expressão facial, tom, linguagem corporal, contexto) e responde a uma
**cadeia de perguntas em camadas** que sobem do concreto (o que aconteceu) ao abstrato (o que
cada pessoa pensa, sente, pretende, e qual a melhor ação social).

O exercício é estruturado como **investigação guiada**, não como quiz de opinião: cada item
pontuável tem **gabarito fechado**, construído por especialistas, com distratores plausíveis.
Itens que envolvem nuance genuína são marcados como **itens de discussão mediada** — registrados
para o profissional conduzir, **nunca pontuados nem interpretados pelo software**.

Princípio central (herdado do padrão da Compra Multifuncional): **o app não resolve a tarefa
pelo paciente**. Nenhuma resposta é revelada antes de o paciente responder; o feedback objetivo
e a explicação vêm **depois** da resposta. O nível de andaime (dicas, destaque de pistas)
diminui com a progressão.

---

## 2. Objetivos clínicos

- Treinar **cognição social** de forma estruturada, gradual e mensurável, com mediação profissional.
- Desenvolver **reconhecimento e diferenciação emocional** a partir de pistas observáveis.
- Fortalecer **teoria da mente** (1ª e 2ª ordem) e **tomada de perspectiva**.
- Ensinar a **separar fatos de interpretações** — reduzindo distorções de leitura social.
- Treinar **inferência social** e antecipação de consequências.
- Trabalhar **compreensão de regras sociais** e **julgamento de adequação** sem moralização.
- Exercitar **resolução de problemas sociais** (gerar e avaliar opções de ação).
- Apoiar **generalização** para o cotidiano via tarefas de casa e ponte com a vida real,
  conduzida pelo profissional.

**Fora do escopo (explícito):** diagnóstico, avaliação normativa, rotulação, interpretação
clínica automática, aconselhamento. O software é ferramenta de treino; o juízo clínico é do profissional.

---

## 3. Objetivos cognitivos

- **Atenção seletiva e sustentada** a pistas sociais relevantes; filtragem de distratores.
- **Memória de trabalho social** (manter estados, crenças e objetivos de ≥2 personagens).
- **Funções executivas**: inibição de resposta impulsiva/egocêntrica, flexibilidade para trocar
  de perspectiva, monitoramento da própria resposta.
- **Raciocínio inferencial e abdutivo** (da pista à causa mental provável).
- **Velocidade de processamento social** (medida por latência, sem penalizar nos níveis iniciais).
- **Metacognição**: distinguir "o que vejo" de "o que concluo".

---

## 4. Público-alvo

Três faixas com a **mesma arquitetura** e parametrização distinta (ver §18):

| Faixa | Contextos temáticos | Ilustração | Duração-alvo | Ordem de ToM tratada |
|---|---|---|---|---|
| Crianças (≈6–11) | casa, escola, brincadeira | simples, expressões nítidas | 5–8 min | até 1ª ordem (níveis baixos) |
| Adolescentes (≈12–17) | escola, amizades, digital/redes | realista, ambíguo controlado | 7–10 min | 1ª e 2ª ordem |
| Adultos (≈18+) | trabalho, família, convivência | realista | 8–12 min | 1ª e 2ª ordem, ironia |

**Perfil TEA (transversal a todas as faixas):** modo com **suportes explícitos** — pistas
destacadas e nomeadas, linguagem literal, previsibilidade de fluxo, sem cronômetro nos níveis
iniciais, ironia/ambiguidade só liberadas em níveis altos e com ensino explícito prévio.
É um **modo de apresentação**, não uma faixa separada.

---

## 5. Estrutura completa do exercício

Camadas de composição:

1. **Módulo** (Habilidades Sociais) → contém exercícios; este é o primeiro.
2. **Exercício** (`investigadores-sociais`) → configurável pelo profissional (faixa, foco, nível, modo).
3. **Sessão** → sequência de N **casos** (histórias), dosada por tempo/quantidade; grava `Session`.
4. **Caso** (SocialCase) → uma história ilustrada + suas camadas de pergunta (unidade de conteúdo validada).
5. **Camada de pergunta** → um item tipado com gabarito ou marcado como discussão mediada.
6. **Item** → uma pergunta com formato de resposta específico (§11).

Papéis:

- **Motor puro** (`lib/social/investigador-social.ts`): seleção de casos por nível/faixa/foco,
  verificação contra gabarito, cálculo de indicadores, feedback progressivo, escada adaptativa.
  Sem React, testável — mesmo padrão de `lib/compra-missoes.ts`.
- **Banco de casos** (`data/social-casos/…`): casos gerados por IA na autoria, **validados** pelo
  schema e revisados por profissional. Versionados. Nenhuma geração em runtime.
- **Componente** (`components/exercises/social/InvestigadoresSociais.tsx`): apresentação, coleta,
  telas, integração com `useTimedProgress` e `TutorialBase`.

---

## 6. Fluxo de telas

```
[Config do profissional] → [Tutorial-réplica] → [ Loop de casos ] → [Resumo da sessão] → [Relatório]

Loop de um caso:
  1. Abertura do caso (título neutro, contexto, objetivo do investigador)
  2. História em quadros (3–5 painéis ilustrados + narração/áudio opcional; pistas realçáveis)
  3. Coleta de observação (o que dá para ver — fatos)
  4. Perguntas em camadas (uma por vez; feedback objetivo só APÓS responder)
        camada Fato → Emoção → Perspectiva/ToM → Fato×Interpretação → Inferência → Regra/Julgamento → Resolução
  5. [modo consultório] Tela de discussão mediada (itens abertos; pausa para o profissional)
  6. Fechamento do caso (síntese objetiva do que foi respondido; sem juízo sobre a pessoa)
  → próximo caso ou fim por tempo/quantidade
```

Regras de fluxo:

- **Uma pergunta por vez**; não é possível voltar e alterar resposta já confirmada (registra a 1ª intenção).
- **Feedback só depois de confirmar** cada item; nunca antes.
- **Pistas** podem ser realçadas a pedido (nível baixo: sempre visíveis; nível alto: sob demanda,
  com custo no indicador de autonomia).
- **Modo casa** oculta os itens de discussão mediada obrigatória e simplifica o fechamento.

---

## 7. Progressão dos níveis

Sete níveis, escalando **um construto social por vez** (paralelo à escada pedagógica da Compra):

| Nível | Construto dominante | Personagens | Contexto | Ambiguidade | ToM |
|---|---|---|---|---|---|
| 1 | Emoções básicas em contexto explícito | 1 | explícito | nenhuma | — |
| 2 | Emoção + causa; inferência simples | 2 | explícito | mínima | — |
| 3 | Perspectiva / desejo-crença (ToM 1ª ordem) | 2 | claro | baixa | 1ª |
| 4 | Falsa crença + Fato × Interpretação | 2 | claro | controlada | 1ª |
| 5 | Emoções mistas/ambíguas; ToM 2ª ordem | 2–3 | parcial | média | 2ª |
| 6 | Normas implícitas, mal-entendidos, ironia | 3 | implícito | alta | 2ª |
| 7 | Dilema social; múltiplas perspectivas; consequências | 3+ | implícito | alta | 2ª + integração |

Regra de composição: **ao introduzir um construto novo, alivie os demais** (menos personagens,
contexto mais explícito) — a carga sobe só na dimensão que está sendo treinada.

---

## 8. Habilidades cognitivas treinadas (mapa item → habilidade)

Cada tipo de item alimenta indicadores de uma ou mais habilidades cognitivas:

| Tipo de item (§11) | Habilidade cognitiva primária |
|---|---|
| Observação/Fato | atenção seletiva, leitura de contexto |
| Emoção | reconhecimento emocional, discriminação perceptual |
| Causa da emoção | inferência causal |
| Perspectiva/ToM 1ª ordem | tomada de perspectiva, MT social |
| Falsa crença | ToM, inibição do próprio conhecimento |
| ToM 2ª ordem | MT social, raciocínio recursivo |
| Fato × Interpretação | metacognição, monitoramento |
| Inferência/Consequência | raciocínio abdutivo, antecipação |
| Regra social / Julgamento | compreensão normativa, flexibilidade |
| Resolução de problema social | planejamento, geração/avaliação de opções |

---

## 9. Habilidades sociais treinadas

Reconhecimento emocional · cognição social · teoria da mente (1ª/2ª ordem) · leitura de
contexto · tomada de perspectiva · inferência social · julgamento social · compreensão de
regras sociais · diferenciação fato/interpretação · resolução de problemas sociais.

Cada uma é um **eixo de relatório** (§12–13): o desempenho é reportado por eixo, permitindo ao
profissional ver perfil e evolução por habilidade, não só um escore global.

---

## 10. Estrutura fixa que TODAS as histórias deverão seguir

Schema canônico do **Caso Social**. A IA de autoria preenche exatamente estes campos; a validação
(§16) rejeita qualquer caso que não satisfaça os invariantes. Nenhum campo é opcional salvo indicado.

```ts
interface SocialCase {
  id: string;
  versao: number;                       // versionamento de conteúdo
  faixa: "crianca" | "adolescente" | "adulto";
  nivel: 1|2|3|4|5|6|7;
  contexto: "casa"|"escola"|"amizade"|"trabalho"|"rua"|"digital";
  tema: string;                         // rótulo curto, não-sensível

  personagens: Personagem[];            // 1–4; nomes neutros/diversos
  quadros: Quadro[];                    // 3–5 painéis na ordem narrativa
  situacaoCentral: string;             // o "problema social" a investigar (curto, factual)

  pistas: Pista[];                      // ≥1 pista observável por emoção/estado relevante
  fatos: string[];                      // afirmações verificáveis pela cena
  interpretacoes: string[];             // afirmações plausíveis MAS não verificáveis

  camadas: ItemPergunta[];              // perguntas ordenadas por camada (§11)
  habilidadesAlvo: EixoSocial[];        // eixos que este caso exercita
  ordemToM: 0|1|2;                      // maior ordem de teoria da mente exigida
  contemIronia: boolean;
  autoria: { geradoPorIA: boolean; revisadoPor: string; aprovadoEm: string };
}

interface Personagem {
  id: string; nome: string; papel: string;
  emocao: EmocaoRotulo;                 // estado emocional-alvo (rótulo do vocabulário fixo)
  intensidade: 1|2|3;
  objetivo: string;                     // o que quer
  sabe: string[];                       // informações que possui  }  → base de ToM/
  naoSabe: string[];                    // informações que ignora   }    falsa crença
}

interface Quadro {
  ordem: number;
  imagemRef: string;                    // asset ilustrado validado
  narracao: string;                     // texto literal do quadro (áudio via lib/tts.ts, opcional)
  pistasVisiveis: string[];             // ids de Pista destacáveis neste quadro
}

interface Pista {
  id: string;
  tipo: "expressao"|"tom"|"corpo"|"contexto"|"fala";
  descricao: string;                    // objetiva, observável
  apontaPara: string;                   // personagem/estado que a pista evidencia
}
```

Vocabulário fixo (enums controlados, definidos por especialistas — a IA escolhe **dentro** deles):

- `EmocaoRotulo`: conjunto fechado por faixa (níveis básicos: alegria, tristeza, raiva, medo,
  surpresa, nojo; níveis altos acrescentam: vergonha, orgulho, ciúme, frustração, alívio,
  constrangimento, decepção, empatia — liberadas por nível).
- `EixoSocial`: os 10 eixos da §9.

---

## 11. Estrutura das perguntas

Cada `ItemPergunta` é tipado, ordenado por camada, e classificado como **pontuável** (gabarito
fechado) ou **discussão mediada** (registrado, não pontuado).

```ts
interface ItemPergunta {
  id: string;
  camada: CamadaPergunta;               // ver ordem abaixo
  tipo: TipoItem;                       // OBSERVACAO_FATO | EMOCAO | CAUSA_EMOCAO |
                                        // PERSPECTIVA | FALSA_CRENCA | TOM_2A_ORDEM |
                                        // FATO_OU_INTERPRETACAO | INFERENCIA |
                                        // REGRA_SOCIAL | RESOLUCAO | DISCUSSAO_ABERTA
  enunciado: string;
  formato: FormatoResposta;             // escolhaUnica | multiplaSelecao | classificar |
                                        // ordenar | escolherExpressao | escala | abertaRegistrada
  opcoes?: Opcao[];                     // com distratores plausíveis quando aplicável
  gabarito?: Gabarito;                  // ausente ⇒ item de discussão mediada
  eixos: EixoSocial[];                  // eixos que este item alimenta
  andaime?: { dica1: string; dica2: string; };  // dicas progressivas (§ feedback)
}

interface Gabarito {
  correta: string | string[];          // chave fechada
  aceitaveis?: string[];               // respostas também corretas (parcial), se houver
  distratorErroTipo?: Record<string, ErroSocialTipo>; // mapeia cada distrator a um tipo de erro
}
```

**Ordem canônica das camadas por caso** (subconjunto conforme o nível):
`Fato → Emoção → Causa → Perspectiva(ToM) → [Falsa crença] → [ToM 2ª ordem] →
Fato×Interpretação → Inferência → Regra/Julgamento → Resolução → [Discussão mediada]`.

Regras dos itens:

- Todo item pontuável tem **exatamente uma chave** (ou conjunto explícito de aceitáveis).
- **Distratores** são plausíveis e cada um mapeado a um **tipo de erro social** (`ErroSocialTipo`:
  egocentrismo, super-interpretação, confundir fato com interpretação, erro de perspectiva,
  leitura emocional trocada, ignorar contexto, generalização) — isto alimenta o relatório de padrões.
- Itens `DISCUSSAO_ABERTA` **não têm gabarito**, usam `abertaRegistrada`, e existem só no modo
  consultório para o profissional mediar. Nunca são pontuados, corrigidos ou interpretados pelo app.
- `escolherExpressao` usa grade de faces do vocabulário fixo; `classificar` é o formato canônico
  do item **Fato × Interpretação** (arrastar afirmações para "Fato" ou "Interpretação").

---

## 12. Estrutura do feedback ao profissional

Dois níveis. **Descritivo e quantitativo apenas** — sem interpretação clínica, sem rótulo, sem
sugestão diagnóstica ou terapêutica.

**A) Relatório de sessão** (por execução):
- Escore objetivo global (0–100) e **por eixo social** (§9) — visualização em radar.
- Latência mediana por camada; total de casos e itens; nível trabalhado / alcançado.
- **Mapa de erros por tipo** (`ErroSocialTipo`) — onde o paciente tropeça, sem juízo de valor.
- **Registro dos itens de discussão mediada** (respostas abertas transcritas/selecionadas), como
  material de sessão — claramente separados dos itens pontuados.
- Uso de andaime (dicas/realce de pistas) — proxy de autonomia.
- Casos sinalizados para retomar.

**B) Relatório longitudinal** (entre sessões):
- Evolução por eixo ao longo do tempo (linha por eixo).
- **Generalização por contexto** (§15): desempenho comparado entre casa/escola/trabalho/digital.
- Consistência (variância entre sessões) e tendência.
- Nível estável alcançado por construto.
- **Índice de Cognição Social (ICS)** — composto opcional, ponderado por eixo, exibido como
  indicador de treino (nunca como escore normativo/diagnóstico).

Persistência: agregados em `Session.metadata`; nível corrente em `ExerciseConfig.currentDifficulty`;
itens abertos e erros por tipo em `Session.metadata` estruturado. Relatórios reaproveitam o pipeline
de PDF existente (`app/api/reports`).

---

## 13. Indicadores de desempenho

| Indicador | Definição | Uso |
|---|---|---|
| Acurácia por eixo | % de itens pontuáveis corretos por `EixoSocial` | perfil e evolução |
| Latência por camada | tempo mediano de resposta por camada | velocidade de processamento social |
| Índice Fato×Interpretação | acurácia específica no item de classificação | distorção de leitura |
| Ordem de ToM alcançada | maior ordem respondida com acurácia estável | marco de teoria da mente |
| Erros por tipo | distribuição em `ErroSocialTipo` | direciona mediação |
| Autonomia | 1 − (uso de dicas/realces) | andaime necessário |
| Consistência | 1 − variância entre sessões | estabilidade do ganho |
| Transferência | acurácia em contexto/tema não treinado | generalização (§15) |
| ICS | composto ponderado dos eixos | acompanhamento de treino |

Todos os indicadores são **objetivos e derivados de gabarito fechado** ou de tempo — nenhum
depende de interpretação semântica em runtime.

---

## 14. Critérios para evolução de dificuldade

Reaproveita o motor adaptativo (`lib/adaptive.ts`, caminho `progressionV2`), com **critério duplo**:

- **Sobe de nível** quando, no construto dominante do nível atual, a **acurácia por eixo-âncora
  ≥ limiar** (proposta: ≥ 80% para eixos-âncora Emoção e ToM; ≥ 70% para os demais) por **≥2 casos
  consecutivos**, **sem regressão** nos eixos já consolidados.
- **Mantém** quando acurácia intermediária (consolidação).
- **Rebaixa** após **2 casos abaixo do piso** (proposta: < 50%) no construto dominante.
- **Trava de segurança clínica:** só habilita ironia/ToM 2ª ordem (níveis 5–6) após consolidar a
  1ª ordem — evita saltar andaime.
- Nível é por **eixo** quando o profissional escolhe foco; é pelo construto dominante quando o
  foco é "investigação completa".

Parametrizável pelo profissional (pode fixar nível, desligar auto-progressão para trabalho manual).

---

## 15. Critérios de generalização

- **Variação sistemática** de contexto (`casa/escola/amizade/trabalho/rua/digital`), tema,
  personagens e configuração de pistas — o mesmo construto reaparece em superfícies diferentes.
- **Casos de transferência:** marcados como contexto/tema **não treinado** recentemente; sua
  acurácia isolada é o indicador de Transferência (§13).
- **Prática espaçada:** reapresentação do mesmo construto com intervalos crescentes.
- **Ponte com a vida real (mediada):** tarefas de casa prescritas pelo profissional com registro
  estruturado de aplicação; o app fornece o gancho (checklist/registro), **não** avalia o relato.
- **Critério de generalização atingida:** desempenho estável (≥ limiar) do construto em **≥3
  contextos distintos** e em pelo menos um caso de transferência.

---

## 16. Regras obrigatórias que todas as histórias deverão seguir

1. Preencher **integralmente o schema** da §10; falhar qualquer campo obrigatório = rejeição.
2. Conter **pistas observáveis** suficientes: cada emoção/estado exigido por um item pontuável
   deve ter **≥1 `Pista`** correspondente na cena (validação por rastreabilidade item→pista).
3. Todo item pontuável tem **gabarito único e defensável** apenas com base na cena (nada de
   "adivinhar" além do apresentado).
4. Manter **coerência interna** entre quadros, pistas, `sabe/naoSabe` e gabaritos (checagem lógica
   de falsa crença/2ª ordem por regras).
5. Respeitar **faixa etária**: vocabulário, tema, complexidade e emoções liberadas por nível.
6. **Diversidade e representatividade** neutras e respeitosas (gênero, etnia, corpo, contexto
   socioeconômico) sem estereótipo.
7. Linguagem **clara e literal** por padrão; ambiguidade só **intencional** e **apenas nos níveis
   que a treinam** (5–7), nunca nos itens pontuáveis de níveis baixos.
8. **Imagem alinhada ao texto**: o que o gabarito exige deve estar visível na ilustração.
9. Distratores plausíveis, cada um **mapeado a um `ErroSocialTipo`**.
10. **Rastreabilidade de autoria**: `geradoPorIA`, revisor humano e data de aprovação preenchidos
    antes de publicar. Nenhum caso entra no banco sem revisão profissional.
11. Duração/quantidade de itens dentro da faixa-alvo (§4) para não exceder o tempo de sessão.

Pipeline de conteúdo: **IA gera → validador automático (invariantes 1–11) → revisão humana →
publicação versionada**. Runtime só consome casos aprovados.

---

## 17. Regras do que NUNCA deve acontecer nas histórias

- Violência gráfica, ferimentos, morte, abuso, negligência explícita, conteúdo sexual, uso de
  substâncias, autolesão, conteúdo assustador/traumático.
- Discriminação, preconceito, bullying **apresentado como aceitável**, estereótipos de qualquer grupo.
- **Moralização** ("o certo é...") ou lição de moral imposta; julgamento da **pessoa** (só da ação/adequação).
- Qualquer conteúdo que **rotule, diagnostique ou patologize** um personagem — ou o paciente.
- **Leitura de mente mágica**: exigir inferência sem pista observável que a sustente.
- **Ambiguidade sem gabarito** em item pontuável; dupla resposta correta não sinalizada.
- Ironia, sarcasmo cruel ou figuras de linguagem **em níveis/faixas não preparados** para elas.
- Temas sensíveis reais (religião, política partidária, tragédias reais, dados identificáveis).
- Nomes, marcas ou pessoas reais; qualquer conteúdo que peça dado pessoal do paciente.
- Qualquer texto do app que **interprete o paciente** ou emita juízo clínico. Feedback = objetivo.

---

## 18. Organização para crianças, adolescentes e adultos

Mesma arquitetura, parametrização por faixa (config do profissional). Difere em:

- **Bancos de casos separados por faixa** (`data/social-casos/{crianca,adolescente,adulto}`);
  o motor só sorteia da faixa configurada.
- **Vocabulário emocional** liberado por faixa×nível (crianças começam com o núcleo de 6 emoções).
- **Temas/contextos** apropriados (crianças: casa/escola/brincadeira; adolescentes: amizade/digital;
  adultos: trabalho/família/convivência).
- **Ilustração e narração** ajustadas (estilo, ritmo, densidade textual, áudio via `lib/tts.ts`).
- **Extensão**: nº de quadros, nº de itens e duração-alvo conforme §4.
- **Ordem de ToM/ironia** habilitada por faixa (crianças: teto no que a faixa comporta).

**Modo TEA (flag transversal):** pistas sempre nomeadas e destacadas, ensino explícito antes de
introduzir um construto, linguagem 100% literal, previsibilidade de fluxo, sem cronômetro nos
níveis baixos, ironia bloqueada até ensino prévio, opção de reduzir estímulos visuais. Implementado
como **modo de apresentação** (paralelo ao `PresentationConfig` já existente na plataforma), não
como conteúdo separado.

---

## 19. Sugestões de interface do aplicativo

- **Config do profissional** (tela inicial do exercício): faixa etária, foco (eixo específico ou
  investigação completa), nível inicial ou auto-progressão, modo (consultório × casa), modo TEA
  on/off, cronômetro on/off, áudio on/off. Mesmo padrão da config da Compra Multifuncional.
- **História em quadros**: leitor horizontal de painéis com narração e botão de re-ouvir; **pistas
  realçáveis** (toque para destacar/nomear a pista) — sempre visíveis nos níveis baixos.
- **Perguntas em camadas**: uma por tela, formato adequado ao tipo (grade de faces, arrastar para
  Fato/Interpretação, escolha única com cards, escala). Feedback objetivo aparece **após** confirmar.
- **Tela de discussão mediada** (só consultório): apresenta o item aberto e um espaço de registro;
  o app **não** avalia — apenas guarda para o relatório.
- **Fechamento do caso**: síntese factual do que foi respondido, sem juízo sobre a pessoa.
- **Painel do profissional**: acesso ao relatório de sessão e longitudinal (radar por eixo, mapa
  de erros, evolução), reaproveitando relatórios/PDF existentes.
- **Acessibilidade**: alto contraste, alvos grandes (compatível com controle remoto via Zoom —
  tudo por clique, sem gestos finos), leitura literal, sem dependência de cor isolada, sem
  fullscreen nativo / sem travar viewport (restrição já vigente na plataforma).
- **Temas visuais**: respeitar os 3 temas do app (CLINICAL/COLORFUL/GAMIFIED).

---

## 20. Como transformar este exercício em treino cognitivo de longo prazo

- **Banco de casos crescente e versionado**, alimentado pelo pipeline IA→validação→revisão, com
  cobertura balanceada de eixos × níveis × contextos × faixas (dashboard de cobertura de conteúdo).
- **Prática espaçada e intercalação** de construtos, com o motor priorizando eixos mais fracos e
  reintroduzindo os já consolidados em intervalos crescentes.
- **Trilha de progressão por eixo**, integrável à jornada/gamificação existente do app.
- **Índice de Cognição Social (ICS) longitudinal** como bússola de treino do profissional (nunca
  escore normativo).
- **Prescrição adaptativa**: o profissional prescreve foco e dose; a auto-progressão ajusta o
  nível dentro do foco; tarefas de casa reforçam generalização com registro estruturado.
- **Generalização como meta de primeira classe**: métricas de transferência guiam quando ampliar
  contextos e quando avançar de nível.
- **Base para novos exercícios do módulo**: o schema `SocialCase` e o motor de verificação são
  reutilizáveis para futuros exercícios de Habilidades Sociais (ex.: foco em resolução de conflito,
  em normas contextuais, em prosódia/tom), consolidando um **módulo** — não um exercício isolado.

---

## Anexo A — Impacto na plataforma (checklist de implementação)

- `types/index.ts`: adicionar `"social"` a `Domain`; tipos do módulo em `types/` ou no motor.
- `lib/domain-taxonomy.ts`: novo domínio `social` ("Habilidades Sociais") com subdomínios por eixo;
  registrar `investigadores-sociais` em `EXERCISE_DEFINITIONS`.
- `app/(patient)/treino/[exercicio]/page.tsx`: `case "investigadores-sociais"` no switch + lazy import.
- `lib/social/investigador-social.ts` (+ testes): motor puro (seleção, verificação, indicadores,
  feedback, adaptação). Padrão de `lib/compra-missoes.ts`.
- `data/social-casos/**`: bancos por faixa; **schema validado** (Zod) + validador de invariantes (§16).
- `lib/scoring.ts`: política de score do domínio social (itens pontuáveis → 0–100 por eixo; itens de
  discussão **fora** do score). Decidir se `calculateDomainScore` passa a cobrir `social`.
- `lib/adaptive.ts`: parâmetros do critério duplo por eixo (§14).
- `prisma`: nenhum modelo novo obrigatório — usar `Session.metadata` (estruturado) e `ExerciseConfig`.
  Avaliar índice/relatório dedicado se o volume justificar.
- `components/exercises/social/…`: componente + telas; `TutorialBase` réplica; `useTimedProgress`.
- Config do profissional: seletor no padrão `PresentationConfig` (faixa/foco/nível/modo/TEA/cronômetro).
- Relatórios: estender `app/api/reports` para os eixos sociais (radar, mapa de erros, longitudinal).

## Anexo B — Governança de IA e conteúdo (não-negociável)

1. IA atua **apenas na autoria offline**, preenchendo `SocialCase` dentro dos enums fixos.
2. **Todo caso passa por validação automática + revisão humana profissional** antes de publicar.
3. **Runtime é 100% determinístico**: sem IA, sem geração, sem interpretação — só apresentação de
   caso aprovado e comparação com gabarito fixo.
4. O app **nunca** produz juízo clínico, diagnóstico ou interpretação sobre o paciente. Todo
   texto ao profissional é objetivo e descritivo; a leitura clínica é humana.

## Anexo C — Decisões que dependem de você (antes de implementar)

1. **Rótulo do domínio**: "Habilidades Sociais" (proposto) vs "Cognição Social".
2. **Limiares de progressão** (§14): confirmar 80%/70% e pisos de rebaixamento.
3. **Vocabulário emocional por faixa×nível**: validar a lista fechada de emoções liberadas.
4. **Pontuação**: confirmar que `functional`-style (itens abertos fora do score) atende, e se o
   domínio `social` deve entrar em `calculateDomainScore`.
5. **Origem das ilustrações**: pipeline/estilo dos assets dos quadros.
6. **Prioridade de faixa** para o primeiro banco de casos (crianças, adolescentes ou adultos).
