# Spec — Labirinto: o painel para de carimbar o tempo esgotado

Data: 2026-08-31
Arquivo ÚNICO: `components/exercises/executive/Labirinto.tsx`
Origem: `docs/auditoria-aviso-omissao/AUDITORIA-AVISO-OMISSAO-2026-08-31.md`, achado A3.
Modelos já executados: commits `dee21e1`, `10a5050`, `43b42b3`. **Leia `43b42b3` antes de começar.**

---

## 0. A regra

Regra dela, 31/ago/2026: *"nao precisa avisar é treino"* — **o app não comenta o que o paciente
deixou de fazer.** Sai o carimbo da NÃO-ação; o dado e o feedback de quem AGIU ficam.

## 1. O caso

Quando o tempo do labirinto esgota, `finishMaze(false)` (chamado **só** pelo efeito
`elapsed >= timeLimit`, linha ~793 — confirme com `grep -n "finishMaze("`) abre o painel de
relatório. Nele, duas coisas carimbam a não-ação:

1. **O título** (linha ~1017): `{report.solved ? "🎉 Saída!" : "⏰ Tempo!"}`, o segundo em
   vermelho `#f87171`.
2. **A frase de recomendação** (linha ~998):
   `const rec = !report.solved ? "Tente planejar a rota antes de andar — observe o caminho inteiro." : ...`
   — que além de carimbar, é **dica depois da instrução**, proibida por outra regra dela.

## 2. O que fazer, e o que NÃO fazer

**O painel FICA.** Ele é a tela de transição entre labirintos: o paciente precisa do botão
"Próximo labirinto →" para seguir. Não o remova, não o encurte, não mexa no botão.

**As MÉTRICAS FICAM** — eficiência em %, movimentos, becos, retornos, colisões, pontuação. Isso é
**conteúdo**, não carimbo. O modelo da casa é o Cubo Corsi: o rótulo nomeia o conteúdo, nunca o
resultado.

**Faça exatamente duas mudanças, ambas apenas no ramo `!report.solved`:**

1. **O título "⏰ Tempo!" não aparece.** Quando `report.solved === true`, o "🎉 Saída!" verde
   continua **idêntico** — é feedback de ação, ele chegou à saída. Quando `false`, não se
   renderiza título nenhum: o painel começa direto no número da eficiência. Não invente um título
   substituto ("Fim do tempo", "Encerrado", "Este labirinto"): qualquer texto ali volta a comentar
   o que ele não fez. Cuide para o espaçamento não ficar com um buraco onde o título estava —
   ajuste a margem do bloco seguinte se necessário, sem mexer no caso `solved`.
2. **A recomendação do ramo `!solved` sai.** Em `rec`, o ramo `!report.solved` passa a não produzir
   frase, e a linha que a renderiza não aparece nesse caso. **Os outros ramos de `rec` ficam
   intactos** ("Ótimo planejamento!", "Evite os becos", "Muitos movimentos extras", "Bom! Tente
   usar ainda menos movimentos") — todos pressupõem que ele resolveu, isto é, agiu.

## 3. O que NÃO pode mudar

- `finishMaze` e sua lógica; `solved: false` continua entrando em `mazeMetricsRef`/`mazeResults`,
  movendo a adaptação e virando a acurácia da sessão. **A medida não se toca.**
- `timeLimit`, `elapsed`, a geração do labirinto, `mazeScore`, `effLabel`, `isTimeUp`.
- O botão "Próximo labirinto →" e o fluxo de transição.
- O caso `report.solved === true`, em absolutamente nada.

## 4. Prova de aceite

```
npx tsc --noEmit          # exit 0, capture o exit code SEM pipe
npm run test              # todos passam (base: 56 arquivos / 762 testes)
```

**NÃO rodar `npm run build`** — o dev server dela está no ar na porta 3000.

Cole no relatório:
- `grep -n "Tempo!\|Tente planejar a rota" components/exercises/executive/Labirinto.tsx` → **zero linhas**.
- `grep -n "Saída!" components/exercises/executive/Labirinto.tsx` → **continua existindo**.
- `grep -n "solved: false\|solved," components/exercises/executive/Labirinto.tsx` → o registro intacto.

## 5. Relatório

O que mudou, e a confirmação explícita de que o ramo `solved === true` está byte a byte igual.
Diga como resolveu o espaçamento do título ausente.
