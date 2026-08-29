# Spec — Dupla Tarefa: reconstrução da interface (UI/UX + responsividade)

Data: 2026-08-29
Arquivo ÚNICO a alterar: `components/exercises/attention/DualTask.tsx`
Origem: pedido da Kamylla com mockup (desktop + celular).

---

## 0. INVARIANTE DURO — a lógica NÃO muda

Está PROIBIDO alterar qualquer coisa fora da camada visual. Continuam **idênticos**,
byte a byte na semântica:

- `LEVELS`, `levelOf`, `TOTAL_SHAPES`, `BLOCK_SIZE`, `ALL_KINDS`, `COLORS`, `COLOR_HEX`,
  `KIND_LABEL`, `COLOR_LABEL`, `pick`
- `blockTarget`, `targetOf`, `isTargetFor`, `makeDistractor`, `buildShapeSequence`, `buildDigitSequence`
- todos os `useState`/`useRef`/`useEffect` do componente `DualTask`
- os dois loops (forma e dígito), `finishSession`, `handleShapeTap`, `handleEqualTap`
- o objeto enviado em `onComplete` (exerciseId, score, accuracy, metadata — tudo igual)
- os tempos (`shapeMs`, `digitMs`, 320ms, 420ms, 500ms, 700ms, 160ms, 3000ms do aviso)

Pode mudar SOMENTE: o JSX do `return`, o componente `InstrucaoBloco` (que será substituído),
o helper de render `ShapeSvg` (apenas para aceitar tamanho fluido) e o objeto de paleta `pal`.

Se para atingir o visual parecer necessário mexer em lógica: **NÃO mexa** e registre o ponto
no relatório final.

---

## 1. O que a tela deve virar

Quatro faixas verticais, de cima para baixo, **num só fluxo**:

1. **Cabeçalho compacto** — botão voltar · título "Dupla Tarefa" · chip "Nível N" · progresso
2. **Faixa de instruções** — três linhas curtas com ícone
3. **UM painel principal integrado** — estímulo em cima, divisória finíssima, número + IGUAL embaixo
4. **Rodapé de uma linha** — "Mantenha o foco nas duas tarefas."

**PROIBIDO** no texto da tela: as palavras "SUPERIOR", "INFERIOR", "Em cima", "Embaixo",
"N-back". Some também o rótulo `SUPERIOR`/`INFERIOR — N-back {n}` que existe hoje. A tela
tem de parecer **um exercício só**, não dois cards empilhados.

---

## 2. Cabeçalho

Uma linha no desktop, duas no celular (usar `flex-wrap`):

- **Botão voltar**: quadrado ~40×40 (`h-10 w-10`), cantos `rounded-xl`, fundo branco,
  borda fina, ícone `ArrowLeft` do lucide-react (size 18). `aria-label="Voltar"`.
  Ação: `router.push("/inicio")` usando `useRouter` de `next/navigation`. É a única
  importação nova de comportamento permitida.
- **Título**: "Dupla Tarefa", `text-lg sm:text-xl font-bold tracking-tight`.
- **Chip de nível**: `Nível {Math.round(difficulty)}`, pílula `rounded-full px-2.5 py-0.5
  text-xs font-semibold`, azul suave (fundo `#EFF6FF`, texto `#2563EB`, borda `#DBEAFE`).
- **Progresso**: rótulo "Seu progresso" (`text-xs`, cinza) + a barra canônica
  `<ExerciseProgressBar progressPct={progressPct} theme={theme} />` + a porcentagem que ela
  já desenha. A barra tem `marginBottom: 14` inline embutido — compense envolvendo-a num
  `<div style={{ marginBottom: -14 }} className="flex-1 min-w-0">` para o cabeçalho ficar
  compacto. NÃO reescrever a ExerciseProgressBar (é peça canônica compartilhada).
  No desktop o bloco de progresso fica à direita, `sm:max-w-[340px] sm:flex-1`; no celular
  ele quebra para a segunda linha ocupando `w-full`.

---

## 3. Faixa de instruções (substitui `InstrucaoBloco`)

Card único: fundo branco, `border` fina `#E5E9F0`, `rounded-2xl`, sombra quase nula
(`0 1px 2px rgba(15,23,42,0.04)`), padding `px-4 py-3 sm:px-5 sm:py-4`, `space-y-2 sm:space-y-2.5`.

Três linhas, cada uma `flex items-start gap-3`, texto `text-[13px] sm:text-sm leading-snug`:

1. Ícone = `<ShapeSvg color={t.color} kind={t.kind} size={18} />` (o alvo REAL do índice
   corrente, via `targetOf`, como já é hoje) · texto:
   `Toque somente no ` + **`{forma} {cor}`** em negrito na cor do alvo (`COLOR_HEX`) + `.`
   Forma e cor em **minúsculas** — use `KIND_LABEL[...].toLowerCase()` e
   `COLOR_LABEL[...].toLowerCase()` (fica "triângulo verde", como no mockup).
2. Ícone = `<Hash size={18} strokeWidth={2.5} />` azul · texto:
   `Toque em ` + **IGUAL** (negrito azul) + ` quando o número for igual ao ` + **{referência}** + `.`
   A referência continua vindo de `bottomStrong(spec.nback)`: "ANTERIOR" (n=1) ou
   "de DUAS posições atrás" (n=2) — mas escreva em caixa normal: "anterior" / "de duas
   posições atrás", em negrito.
3. Ícone = `<Clock size={18} />` cinza · texto: `Ritmo: ` + **{spec.speedLabel}** + `.`
   (some a cauda "— fica mais rápido conforme você evolui", o mockup pede compacto).

Quando `ruleAlert !== null`, o card ganha `ring-1 ring-amber-300` (era `ring-2 ring-amber-400`;
mais discreto, mas continua sinalizando).

---

## 4. Painel principal — UM só

Um `div` com `rounded-2xl`, `border` fina `#E5E9F0`, fundo levemente acinzentado
(`#F6F8FB` no tema claro), sombra `0 1px 2px rgba(15,23,42,0.04)`, `overflow-hidden`,
`flex flex-col`, `flex-1 min-h-0`, e `position: relative` (o aviso de regra é filho absoluto dele).

### 4.1 Área do estímulo (parte de cima)

- `flex-1 min-h-[150px] sm:min-h-[220px]`, `flex items-center justify-center`,
  `px-4 py-5 sm:py-8`, `cursor-pointer`, `onPointerDown={handleShapeTap}` (mesmo handler).
- Sem card interno, sem borda própria: é o próprio painel. O feedback de acerto/erro/omissão
  passa a ser só uma mudança MUITO leve de fundo, sem borda grossa:
  - hit → `background: rgba(22,163,74,0.07)`
  - falso alarme → `rgba(239,68,68,0.07)`
  - omissão → `rgba(245,158,11,0.07)`
  - normal → transparente
  com `transition-colors`.
- O símbolo de feedback (`✓ ✕ ⏱`) continua existindo, com as mesmas cores e a mesma
  `AnimatePresence`, mas em tamanho fluido: `style={{ fontSize: "clamp(38px, 9vh, 64px)" }}`.

### 4.2 Tamanho fluido da forma — sem JS de medição

Trocar a assinatura de `ShapeSvg` para aceitar tamanho CSS:

```
function ShapeSvg({ color, kind, size = 90 }: { color: ShapeColor; kind: ShapeKind; size?: number | string })
```

Reescrever o SVG com **viewBox fixo `"0 0 100 100"`** e coordenadas proporcionais
equivalentes às atuais (circle: cx=50 cy=50 r=42; square: x=12 y=12 w=76 h=76 rx=8;
diamond: 50,8 92,50 50,92 8,50; triangle: 50,12 90,86 10,86), passando `width={size}`
`height={size}`. `preserveAspectRatio` fica no padrão — assim a forma nunca distorce.
Manter `stroke="rgba(0,0,0,0.12)"` e `strokeWidth={2}`.

O estímulo grande usa uma caixa que **nunca estoura a área**, sem ResizeObserver:

```
<motion.div ... style={{ width: "min(52%, 190px)", height: "min(72%, 190px)" }}>
  <ShapeSvg color={...} kind={...} size="100%" />
</motion.div>
```

Assim ele encolhe junto com a arena no celular e para de crescer no desktop.
As animações `initial/animate/exit` de escala continuam iguais.

### 4.3 Divisória

Exatamente **uma** linha `height: 1px`, `background: #E9EDF3` (no escuro,
`rgba(255,255,255,0.08)`), largura ~92% centralizada (`mx-auto w-[92%]`). Nada mais —
sem sombra, sem margem grande.

### 4.4 Área do número (parte de baixo)

- `px-4 py-4 sm:py-6`, `flex flex-col items-center gap-2 sm:gap-3`.
- Rótulo `Número atual`, `text-[11px] sm:text-xs`, cinza (`#64748B`), `text-center`.
- Abaixo, uma linha `flex items-center justify-center gap-3 sm:gap-4` — **lado a lado
  também no celular** (é requisito explícito dela):
  - **Card do número**: `bg-white`, borda fina `#E5E9F0`, `rounded-2xl`,
    `shadow-[0_1px_3px_rgba(15,23,42,0.06)]`, tamanho
    `w-[clamp(64px,18vw,88px)] h-[clamp(64px,18vw,88px)]`, número centralizado
    `font-black` com `fontSize: "clamp(30px,7vw,44px)"`, `tabular-nums`.
    Mantém a `AnimatePresence`/`motion.div` com `key={digitKey}` e a animação atual.
    Feedback do dígito: hit → borda `#16A34A` + fundo `rgba(22,163,74,0.08)`;
    falso alarme → borda `#EF4444` + fundo `rgba(239,68,68,0.08)`.
  - **Botão IGUAL**: `bg-blue-600` (`#2563EB`), texto branco `font-black`
    `text-base sm:text-lg tracking-wide`, `rounded-2xl`,
    altura igual à do card (`h-[clamp(64px,18vw,88px)]`), largura
    `w-[clamp(120px,34vw,190px)]`, `shadow-[0_1px_3px_rgba(37,99,235,0.25)]`,
    `active:bg-blue-700`, `style={{ touchAction: "none" }}`, `onPointerDown={handleEqualTap}`,
    e a opacidade 50% quando `equalPressed` — tudo como hoje.

### 4.5 Aviso de REGRA ALTERADA

Continua igual em conteúdo e tempo. Só o visual fica mais sóbrio: pílula
`rounded-full px-3 py-1.5`, fundo `#FEF3C7`, texto `#92400E`, borda `1px solid #FCD34D`,
`text-xs font-bold`, ícone `AlertTriangle` size 16. Posição: `absolute top-2 left-1/2
-translate-x-1/2 z-20`, dentro do painel principal.

---

## 5. Rodapé

Uma linha só, centralizada, `text-[11px] sm:text-xs` cinza, com `<Sparkles size={14} />`
à esquerda: **"Mantenha o foco nas duas tarefas."** (substitui o `Brain` + "Divida sua
atenção entre as duas tarefas!"). Remover a importação `Brain` se ficar sem uso.

---

## 6. Estrutura de altura e responsividade

O palco passa a preencher a altura:

```
<ExerciseStage width="medio" backgroundClassName={pal.bg} fill>
  <div className="h-full flex flex-col gap-3 sm:gap-4">
    {/* cabeçalho  — shrink-0 */}
    {/* instruções — shrink-0 */}
    {/* painel     — flex-1 min-h-0 */}
    {/* rodapé     — shrink-0 */}
  </div>
</ExerciseStage>
```

⚠️ **Lição registrada no projeto (Vigilância, 28/ago/2026):** quem usa `flex-1` por dentro
PRECISA da prop `fill` no `ExerciseStage`, senão a cadeia tem altura automática, o `flex-1`
resolve para zero e a arena some. `fill` é obrigatório aqui.

Regras de responsividade a respeitar:
- Nada pode transbordar horizontalmente: nenhuma largura fixa em px maior que a tela,
  `min-w-0` onde houver flex com texto.
- No celular (≤640px) o conjunto deve caber sem rolagem numa tela de 667px de altura:
  cabeçalho ~56px + instruções ~104px + painel (mínimo 150px de arena + ~110px da base)
  + rodapé ~22px + gaps. Se faltar, encolha primeiro os paddings verticais, nunca a
  legibilidade do texto das instruções.
- No desktop a largura máxima continua sendo a do palco `medio` (960px) — não inventar
  outra largura.

---

## 7. Paleta por tema (os três temas continuam funcionando)

`theme` é `"CLINICAL" | "COLORFUL" | "GAMIFIED"`. Reescreva o objeto `pal` cobrindo os três.
Referência visual do mockup = tema claro.

- **Claro (CLINICAL / COLORFUL)**: fundo do palco muito claro (`#FAFBFD` no CLINICAL;
  mantenha o gradiente atual no COLORFUL), painéis brancos, painel principal `#F6F8FB`,
  bordas `#E5E9F0`, texto forte `#0F172A`, texto fraco `#64748B`, ação azul `#2563EB`,
  verde apenas na instrução do alvo (via `COLOR_HEX`).
- **GAMIFIED**: equivalentes escuros (fundo `bg-gray-950`, painel `#0F1622`/gray-900,
  bordas `rgba(255,255,255,0.08)`, texto `#E5E7EB`/`#9CA3AF`, azul `#3B82F6`). O botão
  IGUAL continua azul nos três temas.

Estilo geral: minimalista, clínico, premium. Bordas de 1px, sombras quase invisíveis,
cantos arredondados, zero emoji, zero decoração infantil. Verde **só** na instrução do
alvo; azul é a única cor de ação.

---

## 8. Prova de aceite (rode e cole a saída no relatório)

```
npx tsc --noEmit          # exit 0
npm run test              # todos passam
npm run lint              # sem erro novo
```

NÃO rodar `npm run build` (o dev server dela pode estar no ar; os dois disputam `.next`).

Confira também, por leitura do arquivo final:
- `grep -n "SUPERIOR\|INFERIOR\|Em cima\|Embaixo\|N-back" components/exercises/attention/DualTask.tsx`
  → **zero linhas** de texto de interface (comentário de código pode citar, texto visível não).
- `git diff` não toca em nenhuma das funções listadas na seção 0.

## 9. Relatório final

Liste: o que mudou por seção, qualquer ponto onde o visual pedido esbarrou na lógica
(e você preferiu não mexer), e a saída literal dos três comandos.
