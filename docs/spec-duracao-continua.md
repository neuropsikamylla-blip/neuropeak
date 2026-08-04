# IMPLEMENTAÇÃO — duração contínua da sessão

Base: v2.71.0, commit `f0acd2d`. Análise que originou isto:
`docs/prescription-architecture/09-session-as-primary-unit.md`.

**Passo isolado.** O motor passa a respeitar a duração exata escolhida pelo terapeuta, sem arredondar
para 20/30/40. **Nada mais.**

Não commitar.

## PROIBIÇÕES

**Não implementar:** presets 20/35/50 · nova nomenclatura de sessão · redistribuição automática de
protocolos · alteração de protocolos dos exercícios · recalibração de carga, fadiga ou planejamento ·
mudança visual ampla · migração de planos · qualquer decisão automática sobre dose.

**Não alterar:** interface visual · banco · migrations · APIs · protocolos · doses · exercícios ·
carga basal · fadiga · interferência · progressão · experiência do paciente · **`package.json`** ·
**`vitest.config.ts`**.

**Não instalar dependências.** **Não** converter valor salvo. **Não** alterar formato persistido.

Os **405 testes atuais** não podem quebrar, salvo os que afirmem literalmente o arredondamento que
esta mudança remove.

## Arquivos permitidos

- **alterar** `lib/prescription/types.ts` · `duration.ts` · `load.ts` · `validation.ts` ·
  `interpreter.ts` · `presentation.ts`
- **alterar/criar** testes em `lib/prescription/`

Se precisar tocar em algo fora da lista, **parar e explicar**.

## 1. O problema

`TargetMinutes = 20 | 30 | 40` (`types.ts:7`), mas a interface é um
`<input type="number" min={10} max={90}>` e o banco guarda `Int` livre. A ponte é `nearestTarget`
(`presentation.ts:868`), que **arredonda**: 45 min é avaliado contra a faixa de 40, e o plano ganha
o marcador de parâmetro não determinado só por não ser um dos três valores.

## 2. A fórmula — aprovada por ela

```
piso   = alvo × 0,9
teto   = alvo × 1,1
máximo = alvo × 1,2
```

**Prova de preservação** — os três pontos aprovados saem exatos, sem arredondamento nem exceção:

| Alvo | piso | teto | máximo |
|---:|---:|---:|---:|
| 20 | 18 | 22 | 24 |
| 30 | 27 | 33 | 36 |
| 40 | 36 | 44 | 48 |

Os estados continuam decididos pelo **extremo superior** da estimativa, exatamente como hoje
(`durationState`): `< piso` → ABAIXO · `≤ teto` → DENTRO · `≤ máximo` → ACIMA · `> máximo` →
EXCESSO_IMPORTANTE.

⚠️ **Não arredondar o resultado da fórmula.** 26 min dá piso 23,4 e teto 28,6 — usar esses valores.
A formatação decimal em português já existe em `formatMinutesRange`.

⚠️ Comparações de ponto flutuante: `20 × 1.1` pode não dar exatamente `22` em binário. Usar uma
tolerância pequena (ex.: `1e-9`) nas comparações de fronteira, ou arredondar a **comparação**, nunca
o valor exibido. **As 12 fronteiras aprovadas precisam continuar passando.**

## 3. `TargetMinutes` deixa de ser união literal

Passa a ser `number`, com a validação na fronteira: `isTarget` (`legacy.ts:18`) aceita a mesma faixa
que a interface já aceita — **10 a 90**, inteiro. Fora disso, cai no padrão como hoje.

⚠️ Isso **perde a proteção de compilação** que impedia um valor inválido. Compensar com validação
explícita e teste.

**Remover `nearestTarget`.** `presentLegacyPlan` passa a usar a duração pedida diretamente.

⚠️ Hoje `presentLegacyPlan` marca o plano como legado quando `exactTarget === false`, isto é, quando
a duração não é 20/30/40. **Isso tem de sair:** nenhuma duração é legada só por não ser um dos três
valores. O marcador continua existindo para id desconhecido e parâmetro irresolúvel.

## 4. Carga, fadiga e planejamento — a parte delicada

`LOAD_REFERENCE` (7/10/13), `HIGH_FATIGUE_CAP` (1/2/2) e `PLANNING_WINDOW_CAP` (1/2/2) são
**heurísticas clínicas discretas** aprovadas por ela para 20, 30 e 40. **Proibido interpolar.**

**Estratégia aprovada por ela — a conservadora:**

- duração **∈ {20, 30, 40}** → comportamento **idêntico** ao de hoje;
- **qualquer outra duração** → os alertas que dependem dessas tabelas **não são emitidos**, e o
  resultado informa que **não há referência clínica definida para aquela duração**.

Os **quatro** alertas afetados, e só eles:

| Alerta | Tabela |
|---|---|
| `LOAD_AT_CAP` | `LOAD_REFERENCE` |
| `LOAD_OVER_CAP` | `LOAD_REFERENCE` |
| `HIGH_FATIGUE_COUNT` | `HIGH_FATIGUE_CAP` |
| `PLANNING_WINDOW_COUNT` | `PLANNING_WINDOW_CAP` |

**Continuam normalmente** (não dependem de duração): `HIGH_FATIGUE_ADJACENT` ·
`HIGH_FATIGUE_POSITION` · `HIGH_INTERFERENCE_ADJACENT` · `PLANNING_WINDOW_ADJACENT` ·
`AUDITORY_ONLY_ADJACENT` · `COGNITIVE_CONCENTRATION` · `DECLARED_BAD_COMBINATION` · os de posição ·
os **quatro de duração**, que passam a usar a faixa derivada.

⚠️ **Carga, fadiga e interferência continuam calculadas e exibidas.** O que some é a **comparação
com a referência**, não o dado. `interpretPlan` devolve `loadReference` — passa a ser **opcional**;
quando ausente, a apresentação mostra a carga sem o "/ referência N" e acrescenta, discreto:

> "Referência clínica ainda não definida para esta duração."

⚠️ Não inventar texto alarmante. Não é erro nem impedimento — é ausência de referência aprovada.

## 5. Testes

1. **26 não é tratado como 30** — faixa 23,4–28,6, não 27–33;
2. **35 não é tratado como 30 nem 40** — faixa 31,5–38,5;
3. **37 não é tratado como 40** — faixa 33,3–40,7;
4. **45 não é tratado como 40** — faixa 40,5–49,5;
5. **20 preserva 18–22**, **30 preserva 27–33**, **40 preserva 36–44** — valores exatos;
6. as **12 fronteiras aprovadas** continuam passando (17,9 / 18 / 22 / 22,1 / 24 / 24,1 e
   equivalentes de 30 e 40);
7. fronteiras de **25, 35 e 50** nos quatro estados, testando o valor exato e os vizinhos;
8. duração fora de {20,30,40} **não emite** os quatro alertas dependentes de tabela;
9. duração fora de {20,30,40} **emite normalmente** os demais alertas aplicáveis;
10. duração **∈ {20,30,40}** emite os quatro alertas exatamente como hoje;
11. plano com duração não-padrão **não** recebe marcador de legado só por isso;
12. planos antigos continuam abrindo; id desconhecido continua marcando;
13. nenhum protocolo, dose legada, nível ou progresso é alterado;
14. nenhum alerta bloqueia salvamento; `canSave` segue `true`;
15. `isTarget` aceita 10–90 e rejeita fora disso.

## 6. Provas

```
npx tsc --noEmit     # exit 0
npx vitest run       # 405 atuais + novos, TODOS passando
npm run build        # exit 0
```

## Entrega

Arquivos alterados · diff resumido · a tabela de faixas para 20, 25, 26, 30, 35, 37, 40, 45 e 50 ·
prova de que 26/35/37/45 **não** foram arredondados · prova de que 20/30/40 preservaram o
comportamento aprovado · como ficou o texto quando não há referência de carga · nº de testes novos ·
limitações restantes. Não commitar. Não publicar.
