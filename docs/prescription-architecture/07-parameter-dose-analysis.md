# Análise: quais parâmetros ajustáveis alteram a dose clínica

> Análise arquitetônica pedida por ela em 03/ago/2026, ao encontrar que os parâmetros ajustáveis do
> painel não movem duração, carga nem fadiga. **Nada implementado** — este documento existe para ela
> decidir a regra única.

## 1. O que está quebrado, com prova

A tela salva os ajustes como `{ id, settings }` (`buildPlanExercises`, `lib/exercise-plan.ts:69`).
O leitor os preserva em `clinicalParameters` (`legacy.ts`), mas quem decide a duração é
`normalizeDose`, que **só olha `object.dose` ou `settings.protocol`** — e a tela **nunca grava
nenhum dos dois**. A dose resolve sempre para `undefined`, e `doseMinutes` (`duration.ts:16`) cai no
protocolo PADRÃO.

Prova executada:

| Plano | Estimativa exibida |
|---|---|
| `span-numerico` com `trials: 10` | 6–7 min |
| `span-numerico` com `trials: 30` | **6–7 min** |
| `span-numerico` sem ajuste nenhum | 6–7 min |
| `ordem-historia` sem desafios | 9–12 min |
| `ordem-historia` com os 2 desafios liberados | **9–12 min** |

E o que o leitor guarda: `{"exerciseId":"span-numerico","order":1,"clinicalParameters":{"trials":30}}`
— o parâmetro chega, é armazenado e **ninguém o consome**.

**Não é o defeito de um parâmetro: é a ausência do vínculo inteiro.** Nenhum ajuste do painel tem
hoje caminho até duração, carga ou fadiga.

## 2. Inventário real dos parâmetros ajustáveis

Levantado de `components/plano/ExerciseCard.tsx` e `components/therapist/CaminhosMetaConfig.tsx`.
São **cinco painéis distintos**, não um só:

| Painel | Exercícios | Controles oferecidos |
|---|---:|---|
| Focus | 1 | `startLevel` 1–5 · `feedback` leve/normal/intenso · `autoAdvance` sim/não |
| Spans | 2 | `trials` **10/15/20/30** · `allowReplay` sim/não |
| Caminhos para a Meta | 1 | `atividadesSelecionadas` (lista explícita de atividades) |
| Ordem da História | 1 | nível 1–10 · `unlockIntruso` · `unlockFalta` |
| Genérico | 29 | nível inicial 1–10 (slider) |

## 3. Classificação por natureza

### Grupo A — SÃO a dose clínica (mudam a quantidade de unidades)

| Parâmetro | Exercícios | Por quê |
|---|---:|---|
| `trials` | 2 | É literalmente o `unitCount` do protocolo, com outro nome |
| `atividadesSelecionadas` | 1 | A quantidade de atividades escolhidas **é** a quantidade de unidades |
| `unlockIntruso` · `unlockFalta` | 1 | Cada desafio liberado acrescenta conteúdo à mesma sessão |

Estes **precisam** mover duração, carga e fadiga. Hoje não movem nada.

### Grupo B — mudam a dificuldade, não a quantidade

`startLevel` / nível inicial — **30 exercícios** (29 no slider 1–10, mais o Focus em 1–5).

O efeito depende do modelo de execução:

| Modelo | Nº | Efeito do nível sobre a duração |
|---|---:|---|
| `CONTINUOUS_TIMED` | 7 | **Nenhum** — o tempo é fixo; muda só a intensidade |
| `FIXED_HIGH_FATIGUE` | 4 | **Nenhum** — duração fixa por desenho |
| `PLANNING_WINDOW` | 6 | **Nenhum no teto** — a janela é limite de segurança; nível alto consome mais dela |
| `CLOSED_PROTOCOL` | 17 | **Indireto** — o nº de unidades é fixo, mas o tempo *por* unidade cresce com o nível |

⚠️ A linha do `CLOSED_PROTOCOL` é **inferência da mecânica** (uma sequência de 8 dígitos leva mais
tempo que uma de 3), **não medição**. Antes de virar fórmula, precisa de dados reais de sessão.

O nível pertence à **carga dinâmica**, que ela deliberadamente adiou na Fase 2 ("não implementar
carga dinâmica — é fase posterior"). A carga **basal** é intensidade por minuto e, por definição
dela, não muda com o nível.

### Grupo C — não são dose

| Parâmetro | Exercícios | Natureza |
|---|---:|---|
| `feedback` | 1 | Apresentação |
| `autoAdvance` | 1 | Governa a progressão **entre** sessões, não a dose desta |
| `allowReplay` | 2 | Condição de administração — ver ressalva abaixo |

⚠️ **`allowReplay` não é neutro clinicamente.** Permitir repetir o áudio muda o construto medido:
com repetição, observa-se menos retenção e mais compreensão. Não entra em duração/carga/fadiga, mas
merece registro clínico próprio — é uma condição de administração, e duas sessões com e sem replay
não são comparáveis.

## 4. A colisão que decide a questão

O painel dos spans oferece **10, 15, 20 ou 30 tentativas**.
Os protocolos definem **4 (Breve) · 8 (Padrão) · 12 (Estendido) séries**.

**Nenhum valor do painel coincide com nenhum protocolo.** São dois vocabulários para a mesma
grandeza, criados em épocas diferentes, e é daí que nasce a inconsistência que ela viu.

Consequência de cada caminho:

- **Opção 1 pura (tudo livre recalcula):** `trials: 30` são 2,5× o Estendido → ~22 min num exercício
  cujo Estendido é 9 min. A estimativa passaria a ser correta, mas o terapeuta pode montar doses que
  a arquitetura nunca validou clinicamente. E exigiria **carga dinâmica**, que ela adiou — o painel
  exibiria número de carga com aparência de precisão sem o modelo por trás.
- **Opção 2 pura (tudo derivado do protocolo):** os quatro valores do painel morrem e viram três.
  Mas também **mataria** `atividadesSelecionadas` do Caminhos para a Meta, que é escolha clínica
  legítima de conteúdo, e o `startLevel`, que é a espinha da progressão adaptativa de 30 exercícios.

## 5. Recomendação — terceira via, dividida por natureza

Nenhuma das duas opções serve inteira, porque elas tratam "parâmetro ajustável" como categoria
única, e o inventário mostra três naturezas diferentes.

1. **Grupo A passa a ser dose de verdade.** O painel deixa de oferecer números soltos e passa a
   oferecer **Breve · Padrão · Estendido**, com os valores do catálogo (4/8/12 séries), mais a opção
   explícita **"personalizado: N unidades"**. Escolher qualquer um grava `dose` no plano — e aí
   duração, carga e fadiga recalculam sozinhas, porque o motor já sabe fazer isso.
2. **Grupo B fica fora da estimativa, e o painel diz isso.** O nível não altera a dose; alimenta a
   carga dinâmica quando ela existir. Enquanto não existir, o painel deve declarar em texto que a
   estimativa não considera o nível — melhor um limite declarado que um número que finge.
3. **Grupo C nunca entra em duração, carga ou fadiga.** `allowReplay` ganha registro clínico próprio
   por alterar o construto.

Isso mantém a promessa da arquitetura — o que o painel mostra corresponde ao que será executado —
sem inventar carga dinâmica antes da hora, e sem tirar do terapeuta as escolhas clínicas reais.

## 6. O que esta análise NÃO resolve

- **Não mediu** o efeito real do nível sobre o tempo por unidade nos 17 `CLOSED_PROTOCOL`. Sem dados
  de sessão, qualquer fórmula seria chute.
- **Não decide** o que acontece com planos já salvos que tenham `trials: 15` ou `trials: 20` — valores
  que não existem em nenhum protocolo. Migrar, aproximar para o protocolo mais próximo ou preservar
  como dose personalizada é decisão dela.
- **Não define** a faixa aceitável de uma dose personalizada. Sem teto, o terapeuta pode prescrever
  40 séries; a arquitetura não tem hoje nada que diga se isso é clinicamente defensável.
