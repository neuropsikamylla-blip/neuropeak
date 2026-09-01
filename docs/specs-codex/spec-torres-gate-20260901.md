# Spec — Torres: fases 1 e 2 como gate, e a fase que se perdia entre sessões

Data: 2026-09-01
Arquivos: `lib/torres/selecao.ts`, `lib/torre-hanoi.ts`, `components/exercises/executive/TorreHanoi.tsx` e os testes.
**PROIBIDO tocar:** `lib/torres/minimo.ts`, `estado.ts`, `banco.ts`. Ela foi explícita: *"não mexer
no restante da arquitetura"*.

---

## 1. O bug que precisa ser consertado JUNTO (achado em 01/set/2026)

`TorreHanoi.tsx:581` envia `difficulty: maxDiscs` — o número de DISCOS. E a linha 314 lê a mesma
coisa como FASE: `faseDaDificuldade(difficulty)`.

Como o mapeamento é `d≤2→1, d≤4→2, 5→3, 6→4, 7→5, 8→6, 9→7, ≥10→8`, um paciente que chega à
**fase 5** jogando problemas de 4 discos grava `difficulty: 4` e, na sessão seguinte, **volta para
a fase 2**. Quem chega à fase 8 (6 discos) volta para a fase 4. **O progresso de fase não
sobrevive à sessão** — e a paciente ficaria justamente presa nas fases iniciais, o oposto do que
ela quer.

**Conserto:** criar em `selecao.ts` o inverso, e usá-lo no `onComplete`:

```ts
export function dificuldadeDaFase(fase: Fase): number;
```

Precisa satisfazer, para TODA fase de 1 a 8: `faseDaDificuldade(dificuldadeDaFase(f)) === f`.
**Teste essa ida-e-volta para as oito**, não para uma.

Em `TorreHanoi.tsx`, `difficulty` no `onComplete` passa a ser `dificuldadeDaFase(faseAlcançada)`,
onde "fase alcançada" é a fase em que a sessão terminou. Mantenha `maxDiscs` no metadata (é
informação clínica legítima) — o que muda é só o campo `difficulty`, que governa a retomada.

## 2. O gate das fases 1 e 2

Palavras dela, 01/set/2026:

> *"elas são fases de aquisição/consolidação da regra, e não fases para permanência prolongada...
> O mesmo problema pode ser repetido quando necessário para aprender/consolidar a regra, mas
> depois de demonstrar domínio suficiente o sistema deve avançar para a fase seguinte, porque a
> repetição excessiva transforma a tarefa em reprodução de sequência conhecida em vez de
> planejamento."*

E, sobre o critério: *"se concluir com compreensão das regras e sem dificuldade importante, pode
avançar; se tiver dificuldade, repetir em outra oportunidade; **não exigir mínimo de
movimentos**"*.

Hoje o avanço usa `deveSubirDeNivel(ef)` = `ef <= 1.40` em todas as fases. Nas fases 1 e 2 isso
**exige quase o mínimo**, contrariando a instrução dela.

**Crie em `lib/torre-hanoi.ts`:**

```ts
export interface DesempenhoPuzzle {
  eficiencia: number;
  reinicios: number;
  invalidos: number;
}

export function deveAvancarDeFase(fase: number, d: DesempenhoPuzzle): boolean;
```

Regra:
- **Fases 1 e 2 (gate de aquisição):** avança se **resolveu sem dificuldade importante**. Não se
  exige eficiência boa; exige-se que não haja sinal de que ele ainda não pegou a regra. Use como
  sinais de dificuldade importante: eficiência **acima de 2,0** (mais que o dobro do mínimo),
  **mais de 1 reinício**, ou **mais de 3 movimentos inválidos**. Sem nenhum desses sinais, avança.
  Documente no código que os limiares são **parâmetros do programa, não norma clínica** — a
  própria espec dela diz isso das faixas de eficiência, e vale aqui.
- **Fases 3 em diante:** continua exatamente como hoje, `deveSubirDeNivel(ef)` (`ef <= 1.40`).
  **Não altere `deveSubirDeNivel`**; `deveAvancarDeFase` a chama nesse caso.

Em `TorreHanoi.tsx`, a decisão de subir de fase passa a usar `deveAvancarDeFase(fase, {...})` com
a eficiência daquele puzzle, os reinícios daquele puzzle (`restartsThisPuzzle`) e os inválidos
daquele puzzle (`invalidMoves`).

## 3. O que NÃO muda

- `eficiencia`, `faixaEficiencia`, `deveSubirDeNivel` (a função continua existindo e sendo usada).
- O cálculo de `accuracy` da sessão e o metadata (fora o `difficulty`, item 1).
- BFS, banco, seleção, registro, segunda tentativa, abandono, a tela.
- Nada é mostrado ao paciente sobre gate, fase ou limiar. Isso é mecânica interna.

## 4. Prova

```
npx tsc --noEmit          # exit 0, capture o exit code SEM pipe
npm run test              # base: 62 arquivos / 849 testes
```
**NÃO rodar `npm run build`** — o dev server dela está no ar na porta 3000.

Testes obrigatórios, provando por contagem e não por caso único:
- ida-e-volta `faseDaDificuldade(dificuldadeDaFase(f)) === f` para as **oito** fases;
- nas fases 1 e 2, uma eficiência **ruim mas não péssima** (ex.: 1,8) **avança** — é o ponto todo
  da instrução dela, "não exigir mínimo";
- nas fases 1 e 2, cada sinal de dificuldade importante **sozinho** segura o avanço (eficiência
  2,5; 2 reinícios; 4 inválidos) — teste os três separadamente;
- na fase 3, eficiência 1,8 **não** avança (o critério apertado continua valendo lá);
- um teste que percorra as 8 fases e conte quantas avançam com um mesmo desempenho mediano,
  denunciando se alguém afrouxar o critério das fases altas por engano.

## 5. Relatório

O mapeamento inverso escolhido; os limiares do gate e por quê; e a confirmação de que
`deveSubirDeNivel` continua intacta e usada nas fases 3+.
