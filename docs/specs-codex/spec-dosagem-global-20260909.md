# Spec — dosagem global: alvo, tolerância, teto e a barra sem porcentagem

Data: 2026-09-09
Base: `docs/progresso/AUDITORIA-BARRA-DOSAGEM-20260909.md`, **aprovada por ela**, com nove decisões
fechadas. Cobre as **etapas 1, 2 e 3** do plano. A etapa 4 é o portão de aprovação **dela**.

## ⛔ Proibições

- **NÃO migre os 31 exercícios restantes.** Só os **3 pilotos** desta spec. Migração em massa antes
  do portão dela é violação direta da decisão 9.
- **NÃO quebre `useTimedProgress`**: 34 exercícios dependem dele hoje. Ele continua funcionando
  **exatamente** como está para quem não foi migrado.
- **NÃO use `if (exerciseId === "x")`** em lugar nenhum. Decisão 4 dela: tudo por configuração.
- **NÃO crie tabela nem coluna.** Se achar que precisa, **PARE e relate**.
- **NÃO devolva a barra de PROGRESSO DA SOLUÇÃO à Torre.** Ela foi removida por decisão dela e
  continua inexistente. A barra nova é **temporal** e não sabe nada sobre discos, movimentos,
  mínimo da BFS, eficiência ou reinícios.

---

## 1. `lib/exercise-dosage.ts` (novo) — a configuração

```ts
export interface DosagemBloco {
  targetDurationSec: number;
  maxDurationSec: number;
}
/** Fixa, ou calculada a partir da dificuldade — decisão 2 dela. */
export type ConfiguracaoDosagem = DosagemBloco | ((difficulty: number) => DosagemBloco);
```

**Padrão da plataforma:** `{ targetDurationSec: 480, maxDurationSec: 600 }` — 8 e 10 minutos.

**Tolerância por natureza da tarefa**, e é isto que gera o teto quando não houver valor explícito:
- **problema estruturado** (longo, um raciocínio por vez): alvo **+ 120 s**;
- **por tentativas** (curtas e repetidas): alvo **+ 60 s** — palavras dela: *"não precisa da mesma
  janela de 2 minutos dos problemas longos"*.

Exporte isso como duas funções nomeadas, não como número solto no meio do mapa.

**O mapa de exceções**, com o motivo de cada uma escrito ao lado:

| exerciseId | dosagem | por quê |
|---|---|---|
| `tempo-reacao` | 300 / 360 | tarefa curta deliberada (já era 5 min) |
| `semaforo` | 300 / 360 | idem |
| `informacao-em-foco` | 360 / 420 | dose curta deliberada (já era 6 min) |
| `stroop-task` | **função** da dificuldade | ver abaixo |

**Stroop** — decisão 2 dela, literal: a função resolve **o par**. Mantenha o alvo atual
(`≤2 → 4 min · ≤5 → 5 · ≤8 → 6 · senão 7`) e o teto em **alvo + 60 s**, porque é tarefa por
tentativas. Mova `stroopDurationMin` de dentro do componente para cá.

**Todo o resto**, incluindo **Torre, Estacionamento, Vigilância, Cubo Corsi e a Grade**, usa o
padrão 480/600. ⚠️ Torre e Estacionamento estavam em **11 min**: caem para 8/10 por decisão
explícita dela. Deixe isso comentado no código, com a data, para ninguém "restaurar" depois.

---

## 2. A barra perde a porcentagem — decisão 7

Em `ExerciseProgressBar.tsx`, **remova o `<span>{progressPct}%`** e o espaço que ele ocupa. A barra
passa a ocupar a largura inteira. Nada mais muda: mesma altura, mesmo raio, mesma cor por tema.

Acrescente a prop opcional `emTolerancia?: boolean`. Quando verdadeira, a barra fica **cheia** e
**discreta** — sem alarme, sem cor de alerta, sem texto. Item 12 dela: *"não precisa aparecer nenhum
aviso alarmante"*.

⚠️ **A barra nunca recua.** Já é assim no `reportProgress` do wrapper; garanta também aqui.

---

## 3. Separar bloco × sessão — decisão 6

Hoje, em `ExerciseWrapper.tsx:88-92`:

```
sessionProgress = (sessionCompleted + innerPct / 100) / sessionTotal
```

O progresso **do bloco** (`innerPct`) alimenta a barra **do dia**. Ela proibiu.

**Passa a ser:** `progressoDaSessao = sessionCompleted / sessionTotal` — **só exercícios
concluídos**. `innerPct` deixa de entrar nessa conta e serve apenas ao bloco.

E **remova o `{sessionProgress}%`** do widget do dia (`ExerciseWrapper.tsx:363`): é o mesmo tipo de
progresso, e a decisão 7 vale para ele também.

---

## 4. `useBlocoDeTreino` (novo, em `useExerciseEngine.ts`)

`useTimedProgress` **fica como está**. O hook novo vive ao lado.

```ts
useBlocoDeTreino(exerciseId: string, difficulty?: number)
```

Lê a dosagem da configuração e devolve:

| membro | o que faz |
|---|---|
| `begin()` | começa o bloco. **Nunca** no tutorial — decisão 18 da auditoria |
| `progressPct` | `min(100, decorrido / alvo)`, em saltos de 10% como hoje |
| `emTolerancia()` | passou do alvo, não chegou ao teto |
| `atingiuTeto()` | chegou ao `maxDurationSec` |
| `podeIniciarNovoDesafio()` | **`false` depois do alvo** — itens 6, 8 e 20 dela |
| `elapsedSec()`, `finish()` | como hoje |

⚠️ Mantenha o **tempo ATIVO** com a pausa de 15 s (`IDLE_MS`) que já existe: instrução parada não
consome dose.

⚠️ `progressPct` continua **derivado do tempo e de nada mais**. Nenhum acerto, erro, célula
preenchida ou disco no lugar pode movê-lo.

### Como o bloco termina

- **antes do alvo:** o exercício segue livre, inicia novos desafios;
- **no alvo:** termina o desafio em andamento; ao concluí-lo, encerra o bloco. **Não** inicia outro;
- **no teto:** encerra o bloco, mesmo com desafio aberto. O desafio aberto entra no registro como
  `interrompidoPeloFimDoBloco: true`. ⚠️ **NUNCA** como erro, fracasso ou abandono, e **preserve
  todos os dados já realizados nele** — item 7 dela.

---

## 5. Persistência da dose — decisão 8

Reaproveite a chave que já existe, **sem criar outra**:
`localStorage["np_session_" + YYYY-MM-DD]`, hoje `{ total, completed: string[] }`
(`app/(patient)/treino/[exercicio]/page.tsx:506`).

Acrescente `doses: Record<exerciseId, { decorridoMs: number }>`.

- ao montar, **restaura** o decorrido daquele exercício, naquele dia;
- grava a cada tick (a gravação é barata e o tick já existe);
- ⚠️ **quando o bloco termina normalmente, a dose daquele exercício é ZERADA.** É o que separa
  *recarregar no meio para reiniciar a dose* (proibido) de *fazer um segundo bloco de propósito*
  (legítimo, e o terapeuta pode querer). Deixe isso comentado.
- toda leitura e escrita em `try/catch`: `localStorage` falha em aba anônima, e falhar não pode
  derrubar o exercício.

Extraia a leitura/escrita para **funções puras testáveis** em `lib/` — a tela não mexe em storage.

---

## 6. Os TRÊS pilotos — e só eles

| piloto | arquivo | perfil | o que valida |
|---|---|---|---|
| **Semáforo** | `processing/Semaforo.tsx` | curto, 300/360 | exceção configurada + tolerância de 1 min |
| **Cubo Corsi** | `memory/CuboCorsi.tsx` | padrão, 480/600 | o caminho comum, e a subida de 7 → 8 min |
| **Torre de Hanói** | `executive/TorreHanoi.tsx` | longo, 480/600 | ⚠️ **a barra VOLTA**, agora temporal; e a queda de 11 → 8 min |

Nos três: trocar `useTimedProgress` por `useBlocoDeTreino`, respeitar `podeIniciarNovoDesafio()`
antes de montar o desafio seguinte, e renderizar `ExerciseProgressBar` no **topo da área do
exercício**, logo abaixo do cabeçalho, que é onde os outros 28 já a põem.

⚠️ **Torre:** ela removeu a barra em julho porque era **progresso da solução**. A que volta é
temporal. Deixe um comentário dizendo isso, com a data, para ninguém confundir de novo.

⚠️ Torre e Cubo Corsi têm testes próprios (`lib/torres/`, `lib/layout/palco.test.ts`). Se algum
reprovar, **PARE e relate** em vez de ajustar o teste.

---

## 7. Registro do bloco — item 21 dela

No `metadata` do `ExerciseResult` dos pilotos, um objeto `bloco`:
`exerciseId · iniciadoEm · targetDurationSec · maxDurationSec · duracaoRealSec ·
encerradoNoAlvo · encerradoNaTolerancia · encerradoNoTeto · desafioInterrompidoId`.

⚠️ Palavras dela: *"Não transformar automaticamente duração maior ou menor em indicador clínico."*
Nada de campo que julgue. **Nenhuma coluna nova de banco** — `metadata` é Json e já existe.

---

## 8. Provas

```
npx tsc --noEmit          # exit 0
npm run test              # base: 74 arquivos / 990 testes — NÃO PODE CAIR
```
**NÃO rodar `npm run build`.** Se não conseguir rodar no lab por falta de `node_modules`,
**declare** em vez de fingir.

Testes obrigatórios — são os 20 que ela listou, no que dá para provar sem JSX (extraia para funções
puras em `lib/`):

1. a dose começa em zero quando o treino real começa;
2. o tutorial **não** move a barra;
3. a barra progride com o tempo;
4. acerto **não** altera a barra · 5. erro **não** altera a barra;
6. reiniciar o desafio **não** zera a barra · 7. trocar de problema **não** zera a barra;
8. no alvo a barra está cheia · 9. depois do alvo ela **continua** cheia e não recua;
10. concluir depois do alvo encerra o bloco;
11. `podeIniciarNovoDesafio()` é **falso** depois do alvo;
12. o teto encerra o bloco;
13. desafio interrompido pelo teto **não** vira erro, e os dados dele sobrevivem;
14. exercício curto usa a **mesma** barra com tempos menores;
17. recarregar **restaura** a dose e não permite reiniciá-la; e **bloco concluído zera** a dose;
18. Torre usa progresso **temporal** · 20. progresso da **solução** da Torre continua **inexistente**
    — prove por varredura: `progressPct` da Torre não pode depender de disco, movimento ou mínimo;
19. a Grade **não** entra nesta fatia (segue sem relógio até a fatia dela);
- e mais: a configuração do Stroop devolve **o par** e o teto é alvo **+ 60 s**;
- Torre e Estacionamento resolvem para **480/600**, não 660.

(15 e 16 — desktop e mobile — são verificação visual dela, no portão da etapa 4.)

## 9. Relatório

O que virou função pura; como tratou o desafio interrompido pelo teto; a confirmação de que os
31 exercícios não migrados continuam idênticos; e a confirmação, item a item, de que a barra da
Torre não sabe nada sobre a solução.
