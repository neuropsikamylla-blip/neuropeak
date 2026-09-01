# Spec — Torres, fatia 5 (motor): BFS, tipos de problema e banco pré-validado

Data: 2026-08-31
Arquivos: **apenas novos**, em `lib/torres/`. **Não toque em nenhum componente.**
Fonte: `docs/torres/ESPEC-JOGO-DAS-TORRES-KAMYLLA-20260831.md`, seções **2, 14–20, 37–43**.

---

## 0. Por que este motor existe

Hoje o mínimo vem de `optimalMoves(n) = 2^n − 1`. Isso **só vale para a torre clássica** (tudo
numa haste → outra haste). No instante em que existir destino variável ou configuração inicial
variável, essa fórmula fica **errada** — e a eficiência (`movimentos ÷ mínimo`, seção 10) sairia
falsa, corrompendo o índice clínico e a progressão.

Decisão dela, 31/ago/2026:

> *"vamos abandonar a fórmula fixa como fonte do sistema e calcular o menor caminho por busca em
> largura (BFS)... Pode usar isso inclusive para a Torre clássica, assim temos uma única lógica
> para todos os tipos de problema."*

## 1. Representação

Com 3 hastes e `n` discos, um estado é a haste de cada disco: `posicao[i] ∈ {0,1,2}` para o disco
`i` (1 = menor). O espaço tem exatamente `3^n` estados — 3 discos: 27; 4: 81; 5: 243; 6: 729.
**Minúsculo.** Uma BFS varre isso instantaneamente.

Escolha a representação que preferir (array de hastes, ou array indexado por disco), mas
**documente-a** e mantenha uma função de conversão para o formato que o componente já usa
(`State = number[][]`, três pilhas com o disco maior embaixo).

## 2. `lib/torres/estado.ts`

- `validarConfiguracao(estado, nDiscos)`: toda pilha em ordem decrescente de baixo para cima
  (nenhum disco maior sobre um menor), todos os discos presentes exatamente uma vez, hastes
  válidas. Devolve erro descritivo, não `boolean` mudo.
- `movimentosPossiveis(estado)`: os movimentos legais a partir do estado.
- `aplicarMovimento(estado, de, para)`: novo estado, sem mutar o original.

## 3. `lib/torres/minimo.ts` — o coração

```ts
export function menorCaminho(inicial: Estado, alvo: Estado, nDiscos: number): {
  minimo: number;        // número de movimentos do caminho mais curto
  caminho: Movimento[];  // um caminho ótimo (útil para validar e para testes)
} | null;                // null se não houver caminho (não deve acontecer com 3 hastes)
```

BFS sobre o grafo de estados. Requisitos:
- **exata** — nada de heurística;
- determinística (mesma entrada, mesma saída) — ordene os vizinhos de forma fixa;
- valide as duas configurações antes de buscar e **falhe alto** se inválidas.

### Prova obrigatória de que a BFS está certa

O teste **precisa** conferir a BFS contra a fórmula fechada no caso em que ela é válida:
para `n` de 1 a 6, torre completa na haste 0 → haste 2, `menorCaminho` tem de devolver
**exatamente `2^n − 1`**. Se divergir em um único caso, o motor está errado e nada mais importa.

Prove também: o `caminho` devolvido tem comprimento igual a `minimo`; aplicá-lo ao estado inicial
chega ao alvo; e todo movimento do caminho é legal.

## 4. `lib/torres/tipos.ts` — os cinco tipos (seções 15–19)

```ts
export type TipoProblema = "A" | "B" | "C" | "D" | "E";
```

- **A — clássica:** tudo na haste 0 → haste 2.
- **B — destino variável:** tudo numa haste → outra haste que não a padrão.
- **C — configuração inicial variável:** discos distribuídos; alvo = torre completa numa haste.
- **D — alvo diferente:** configuração-alvo arbitrária (não precisa ser torre completa).
- **E — problema novo após aprendizagem:** não é um tipo geométrico distinto, e sim um **papel na
  sequência** (uma configuração estruturalmente diferente logo depois de várias clássicas).
  Modele-o como marcação/uso na sequência, não como geometria nova — e **diga no relatório** como
  resolveu isso.

## 5. `lib/torres/banco.ts` — problemas pré-validados (seções 42–43)

Ela foi explícita: *"NÃO gerar configurações totalmente aleatórias sem validação"* e *"ideal:
pré-calcular as configurações e o caminho mínimo."*

```ts
export interface Problema {
  id: string;                    // estável, legível: "C4-03"
  discos: number;                // 3 a 5 (6 só nas fases avançadas)
  tipo: TipoProblema;
  inicial: Estado;
  alvo: Estado;
  minimo: number;                // vindo da BFS, nunca de fórmula
  fase: 1 | 2 | 3 | 4 | 5 | 6;   // seção 39
  categoria: "P" | "RP" | "F" | "M";  // seção 42
}

export const BANCO: readonly Problema[];
```

**Teto de discos: 5.** Seis só em problemas marcados para a fase 6 — decisão dela: *"Não quero 7
ou 8 discos."* Nunca gere 7 ou 8.

Distribua os problemas pelas seis fases da seção 39 (1: 3 discos clássica; 2: 4 clássica com
destinos diferentes; 3: 4 com configurações iniciais diferentes; 4: alternando tipos; 5: 5 discos
misturado; 6: 5–6 avançado). Quantidade: o bastante para não repetir dentro de uma sessão de
11 min — estime e justifique no relatório; não invente centenas.

### Teste do banco — este é o que protege o resto

Percorrer **todos** os problemas e provar, contando (não amostrando):
- `inicial` e `alvo` válidos, e **diferentes** entre si;
- `minimo` idêntico ao que `menorCaminho` devolve (nenhum número escrito à mão);
- `minimo > 0` e — sanidade clínica — nenhum problema com mínimo absurdo para a fase;
- `id` único em todo o banco;
- **nenhum problema com mais de 5 discos fora da fase 6**, e nenhum com 7 ou 8 em lugar nenhum;
- cada fase tem pelo menos um problema, e as fases que a seção 39 descreve como variadas contêm
  mais de um tipo.

## 6. Fora do escopo, de propósito

**Não integre isto na tela.** Nada de tocar `TorreHanoi.tsx`, nada de mudar o exercício. Esta
fatia entrega o motor testado; a integração é a próxima, e vai junto com a tela inicial de cada
problema (seção 45) e o objetivo em miniatura (seção 46).

## 7. Prova

```
npx tsc --noEmit          # exit 0, sem pipe
npm run test              # base: 57 arquivos / 772 testes
```
**NÃO rodar `npm run build`** (dev server dela no ar na 3000).

## 8. Relatório

A representação escolhida e por quê; como modelou o Tipo E; quantos problemas o banco tem, por
fase e por tipo, e como estimou esse número; a saída da comparação BFS × `2^n − 1`; e qualquer
ponto em que a espec dela esbarrou em impossibilidade geométrica.
