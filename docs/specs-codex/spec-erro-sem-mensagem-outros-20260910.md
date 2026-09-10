# Spec — "erro sem mensagem" nos cinco exercícios restantes

Data: 2026-09-10
Fecha o *"decidir depois"* aberto por ela em 28/ago. Levantamento e justificativa caso a caso em
`docs/feedback/ERRO-SEM-MENSAGEM-OUTROS-7-20260910.md` — **leia antes**.

## A regra dela, de 28/ago — e o erro de leitura a evitar

> *"eu quis dizer MENSAGEM de ERRO. **é importante mostrar o ERRO**... mas aquela MENSAGEM ERRO
> (igual do cubos) não quero."*

⚠️ **O conserto NÃO é apagar o texto.** O que sai é **a palavra que julga**; o que fica é **a
informação**. O modelo é o Cubo Corsi: o rótulo **nomeia o conteúdo** (*"Era esta a sequência"*),
nunca o resultado. Apagar e deixar a tela muda perde informação clínica que o paciente precisa.

⛔ **NÃO toque em `AntesDepois.tsx` (Sequência Temporal) nem em `DesafioCidade.tsx`.** Ali a palavra
"errado" é **enunciado da tarefa** e **conteúdo de história**. Mexer destrói o exercício.
⛔ **NÃO mude mecânica, pontuação, progressão ou dosagem.** Isto é texto e sinal visual.
⛔ **NÃO remova o retorno imediato** de nenhum: em tarefa de velocidade ele faz parte do que se mede.

## Os cinco

### 1. Stroop — `components/exercises/executive/StroopTask.tsx:367`
Hoje: `✓ Correto` / `✗ Quase lá`.
⚠️ *"Quase lá"* é **literalmente** uma das frases que ela proibiu no princípio de 09/ago.
**Logo abaixo já existe a explicação da regra** (`item.rule === "COR" ? ...`), que é a informação.
**Faça:** remover a linha avaliativa; **preservar** a explicação da regra, que passa a ser o retorno.

### 2. Identificação de Símbolos — `processing/IdentificacaoSimbolos.tsx:231`
Hoje: `Correto! ✅` / `Incorreto ❌` — julgamento puro, **sem informação nenhuma**.
**Faça:** aplicar o modelo do Cubo — destacar **o símbolo que era** e **o que foi tocado**, com
rótulo que nomeia o conteúdo (ex.: *"Era este o símbolo"*). Sem "Correto"/"Incorreto".

### 3. Desafio Orçamento — `executive/DesafioOrcamento.tsx:355`
Hoje: `Orçamento respeitado!` / `Tente de novo na próxima`.
⚠️ Repare na assimetria: a primeira **nomeia o que aconteceu** e está certa; a segunda é **consolo**
e não diz nada.
**Faça:** trocar a segunda pelo fato correspondente — *"Orçamento excedido"* ou equivalente que
**nomeie o resultado**, não o esforço. Mantenha a primeira.

### 4. Semáforo — `processing/Semaforo.tsx:395`
Hoje: `✓ Certo!` / `✗ Errado!`.
⚠️ **Leitura conservadora, e o VP registra por quê:** é tarefa de tempo de reação, e o retorno
imediato faz parte do que o exercício **mede**. Retirar poderia mudar o construto.
**Faça:** remover **apenas as palavras** — ficam o glifo (`✓` / `✗`) e a cor, no mesmo lugar e com
o mesmo tempo. A informação permanece; o julgamento verbal sai.
⚠️ **Não** mexa nas cores nem no tempo de exibição: em exercício de semáforo, cor é conteúdo.

### 5. Estacionamento — `executive/EstacionamentoLogico.tsx:613`
Hoje: `Perfeito!` / `Quase perfeito!` / `Quase lá`.
⚠️ **Isto não é mensagem de erro: é julgamento de EFICIÊNCIA.** O precedente certo é a **Torre**,
onde ela decidiu que *"o paciente precisa resolver o problema, e não jogar contra o placar"* e a
tela de conclusão passou a **informar em vez de cobrar**.
**Faça:** trocar os três adjetivos por um **fato**, no estilo da Torre — nomear que o desafio foi
resolvido e, se já existir na tela, o número de movimentos ao lado do mínimo, **sem adjetivo**.
Não invente número que a tela não tenha.

## Provas

```
npx tsc --noEmit          # exit 0
npm run test              # base: 82 arquivos / 1062 testes — não pode cair
```
**NÃO rodar `npm run build`.** Sem `node_modules` no lab, **declare**.

Testes obrigatórios:
- varredura nos **cinco** arquivos: nenhuma ocorrência de `Errado`, `Incorreto`, `Quase lá`,
  `Quase perfeito`, `Tente de novo`, `Perfeito!` como **texto de tela**;
- ⛔ **e a contraprova, que é o teste mais importante desta fatia:** `AntesDepois.tsx` e
  `DesafioCidade.tsx` **continuam contendo** a palavra "errado", porque ali ela é conteúdo. Se este
  teste passar a falhar, alguém varreu demais e quebrou um exercício;
- Stroop **preserva** a explicação da regra;
- Desafio Orçamento **preserva** a mensagem do caso bem-sucedido;
- Semáforo **preserva** o glifo e a cor.

## Relatório

O texto exato que entrou no lugar de cada um; e a confirmação de que Sequência Temporal e Desafio
Cidade não foram tocados.
