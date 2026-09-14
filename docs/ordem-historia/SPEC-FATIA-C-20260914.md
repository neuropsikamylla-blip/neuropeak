# Ordem da História — FATIA C: a dificuldade sobe DENTRO da sessão

> Spec para o Codex. Depende das Fatias A e B aplicadas (v3.28.1 no ar).
> **Você NÃO commita.** Deixe no diff. Revisão, prova e commit são do VP.

## O que a Kamylla relatou, e por que isto existe

Ela testou em produção e disse: *"eu acertei umas 5 histórias e ela permaneceu com 4 desenhos, onde
entra a progressão de dificuldade"*.

**Ela está certa, e o código confirma.** Em `OrdemHistoria.tsx`, `tier` é uma `const` calculada UMA
vez, na montagem, a partir da prop `difficulty`:

```ts
const startLevel = Math.min(10, effStage);
const tier = tierForLevel(startLevel);   // nunca muda durante a sessão
```

O nível só muda **entre** sessões, no servidor. E a escada é grossa: níveis 1-2 = 4 cenas, 3-5 = 5,
6-8 = 6, 9-10 = 8. Começando no nível 1, são **duas sessões inteiras** com ≥85% só para ver a
primeira história de 5 cenas.

Isso contraria o padrão da própria plataforma. O **Cubo Corsi** — o modelo que ela mandou replicar —
guarda o nível num ref que **sobe durante a sessão** (`CuboCorsi.tsx:297`, comentário no código:
*"dificuldade ATUAL (sobe durante a sessão)"*).

## Decisões dela, tomadas em 14/set

1. **Subir dentro da sessão, reutilizando `nextLevelPerTrial`** (`lib/adaptive-trial.ts`), o mesmo
   que o Cubo e a Matriz usam. **Não invente regra nova** — a seção 15 da espec dela é explícita:
   *"não implemente thresholds arbitrários se o projeto já possui uma regra global"*.
2. **Descer só quando errar muito de primeira.** Resolver depois de corrigir **mantém** o nível —
   errar e consertar é aprendizado, não fracasso.

---

## 1. O veredito de cada história

`nextLevelPerTrial(level, verdict, min, max)` aceita `"correta"` (+1), `"erro-leve"` (mantém) e
`"erro-grave"` (−1). A Fatia B já registra tudo o que é preciso para classificar.

| situação | veredito | efeito |
|---|---|---|
| resolvida **100% na 1ª confirmação** (`resolvidaDePrimeira`) | `"correta"` | **+1** |
| `acertoPrimeira < 0.5` (menos da metade das cenas no lugar na 1ª tentativa) | `"erro-grave"` | **−1** |
| qualquer outro caso — inclusive resolver depois de corrigir | `"erro-leve"` | mantém |

Extraia a classificação como **função pura**, em `lib/ordem-historia/tentativas.ts`:

```ts
/** Veredito da história para a escada interna, no vocabulário de lib/adaptive-trial.ts. */
export function vereditoDaHistoria(r: Pick<RegistroHistoria, "resolvidaDePrimeira" | "acertoPrimeira">): TrialVerdict;
```

Limites: **1 a 10**. O nível interno **nunca** pode chegar a 11 ou 12 — esses são os desafios
"Encontre o Intruso" e "Descubra o que falta", que se desbloqueiam **entre** sessões, pela regra que
já existe em `calculateStoryTrailProgression`. Não toque nessa regra.

Nos modos **intruso** e **falta**, a escada interna **não se aplica**: a sessão inteira é do desafio.

## 2. Onde o nível vive, e a armadilha do pré-carregamento

Hoje `tier` é `const`. Passe a guardá-lo num ref (`curLevelRef`), iniciado em `startLevel`, mais um
`maxLevelRef` com o máximo alcançado. `buildOrdem` passa a receber o tier de
`tierForLevel(curLevelRef.current)` **no momento de montar a rodada**.

⚠️ **A armadilha, e ela é real:** `startRound()` já monta a PRÓXIMA rodada em `pendingRef` para
pré-carregar as imagens — ou seja, a próxima história é escolhida **antes** de a atual ser
respondida, e portanto com o tier ANTIGO. Se o nível subir e você usar o `pendingRef` como está, o
paciente continuará vendo a faixa velha por mais uma história, e a subida parecerá não ter
acontecido — **exatamente a queixa dela, só que um passo adiante**.

**Faça assim:** ao fechar a história e recalcular o nível, compare
`tierForLevel(anterior) !== tierForLevel(novo)`. Se a faixa mudou, **descarte o `pendingRef` e monte
de novo** com o tier novo. Se a faixa não mudou, aproveite o pré-carregamento como hoje. Assim o
ganho de desempenho se mantém na maioria das rodadas e se perde só na troca de faixa, que é rara.

## 3. O que é reportado no fim

Hoje: `difficulty: reportLevel` (o nível em que COMEÇOU). Passe a reportar o **máximo alcançado**,
como o Cubo faz (`CuboCorsi.tsx:341`, `difficulty: reached`), **somente no modo ordem**:

```ts
difficulty: sessionMode === "ordem" ? maxLevelRef.current : reportLevel,
```

Nos modos intruso (11) e falta (12), continua sendo `reportLevel` — mexer ali desregularia o
desbloqueio dos desafios.

Acrescente ao `metadata`, sem remover nada do que já existe:

```ts
startedLevelSession: number,   // nível em que a sessão começou
reachedLevel: number,          // máximo alcançado
levelPath: number[],           // o nível de CADA história, na ordem em que foram jogadas
```

`levelPath` é o que deixa o terapeuta ver a escada real da sessão. Guarde o nível **no momento em que
a história foi montada**, não no fim.

⚠️ **Não toque em `lib/adaptive.ts`.** A progressão entre sessões continua exatamente como está: o
servidor lê `data.difficulty` e aplica `calculateStoryTrailProgression`. A única mudança é **qual
número** chega lá.

## 4. Testes obrigatórios

Em `lib/ordem-historia/tentativas.test.ts` (acrescente, não substitua):

1. `vereditoDaHistoria` nos três casos, **incluindo as fronteiras**: `acertoPrimeira` exatamente
   `0.5` é `"erro-leve"` (não desce); `0.499` é `"erro-grave"`; resolvida de primeira é `"correta"`
   mesmo com `acertoPrimeira` 1.
2. **A escada composta**, com `nextLevelPerTrial` de verdade (importe-o, não reimplemente): partindo
   do nível 1, três histórias certas de primeira levam ao nível 4; e a partir do 4, duas histórias
   com menos da metade certa devolvem ao 2.
3. **O teto e o piso**: a escada nunca passa de 10 nem desce abaixo de 1, por mais acertos ou erros
   seguidos (rode 30 de cada).
4. **A prova que importa para o relato dela**: começando no nível 1, uma sequência de 5 histórias
   certas de primeira **muda de faixa** — `tierForLevel` do nível final não pode ser `"faceis"`.
   Exporte `tierForLevel` do componente (ou mova-a para `lib/ordem-historia/`) para poder testá-la;
   se mover, mantenha o comportamento idêntico.

Em `lib/ordem-historia/interface.test.ts`, prove **por posição** que:
5. `tier` **não** é mais uma `const` derivada só de `startLevel` — a fonte do tier na montagem da
   rodada é `curLevelRef.current`.
6. O descarte do `pendingRef` na troca de faixa existe: dentro da função que fecha a história, há uma
   comparação de `tierForLevel` entre o nível anterior e o novo.

## Fronteiras — o que esta fatia NÃO faz

- ❌ mexer em `lib/adaptive.ts`, nos limiares entre sessões ou no desbloqueio dos desafios;
- ❌ mudar a regra da acurácia (continua sendo a da **1ª tentativa** — Fatia B);
- ❌ mexer nos modos intruso e falta, além do `difficulty` reportado descrito no item 3;
- ❌ mexer em `data/historias.ts`, nos gabaritos ou em qualquer imagem;
- ❌ mostrar o nível na tela. Ele **continua invisível** para o paciente — a Fatia A tirou essa linha
  de propósito, e a seção 3 da espec dela é explícita. A dificuldade sobe **em silêncio**.

## Regras da casa

- **Você não commita.** Nem `git add`.
- **Não instale nada.** O clone não tem `node_modules`: `tsc`, `vitest` e `npm` **não rodam aqui**.
  **Não finja ter rodado teste.** Prove com `node` puro o que der e declare o resto.
- Interface 100% pt-BR com acentuação correta; linguagem clínica, nunca de software.
- Se algo aqui divergir do código, **PARE e relate** em vez de adivinhar.

## Critério de pronto

1. `vereditoDaHistoria` exportada e testada, fronteiras incluídas.
2. A escada interna funcionando com `nextLevelPerTrial`, presa entre 1 e 10, só no modo ordem.
3. O `pendingRef` descartado quando a faixa muda.
4. `difficulty` reportado = máximo alcançado no modo ordem; `metadata` com os 3 campos novos.
5. O nível continua invisível na tela.
6. `RELATORIO-CODEX.md` com o que fez, o que decidiu, o que não conseguiu provar e as divergências.
