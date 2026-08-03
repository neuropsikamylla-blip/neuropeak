# FASE 2 — LOTE 1: parâmetros de prescrição dos 34 exercícios

**Só arquitetura e documentação.** Não alterar código, exercícios, níveis, banco, migrations,
interface, catálogo, modalidades ou engine. Não commitar. **Não projetar a engine de sugestão
automática/IA** — isso é fase posterior por decisão dela.

## Fontes CONGELADAS (usar, nunca revisar)

- `docs/architecture/CANONICAL_EXERCISES.md` — os 34, nomes oficiais, modalidades.
- `docs/clinical-architecture/02-exercise-cognitive-profiles.md` — mecânica real, modificadores.
- `docs/clinical-architecture/cognitive-matrix.json` — matriz fina 0–3.
- `docs/clinical-architecture/05-associated-cognitive-profiles.md` + `associated-profiles.json` —
  `mechanicalPrimary`, macros associados, tags funcionais.

**Proibido rediscutir** taxonomia, perfis, `mechanicalPrimary`, associados, categorias, catálogo ou
nomenclatura. São dados de entrada.

Ler o código só quando um parâmetro exigir fato que a Fase 1 não registrou (ex.: como o exercício
encerra hoje). Não alterar nada.

## Escopo deste lote: os 12 parâmetros, para os 34

Criar `docs/prescription-architecture/01-exercise-prescription-parameters.md` com uma ficha por
exercício, na ordem do `CANONICAL_EXERCISES.md`.

### 1. Modelo de execução (escolher UM, justificar)

`CONTINUOUS_TIMED` · `CLOSED_PROTOCOL` · `PLANNING_WINDOW` · `FIXED_HIGH_FATIGUE`

Critério: o que acontece se a sessão for cortada no meio? Se não perde nada → contínuo. Se perde
uma série que a progressão precisa fechar → protocolo fechado. Se destrói o trabalho de resolução →
janela de planejamento. Se a exposição longa degrada o dado por fadiga → fixo/alta fadiga.

### 2. Unidade mínima válida (justificar)

A menor unidade clinicamente interpretável: tentativa · rodada · série · bloco · desafio completo ·
fase. É ela que a política de encerramento respeita.

### 3. Política de encerramento

Ao atingir o limite: termina imediatamente · termina a rodada · termina o bloco · termina o desafio ·
não inicia outro. Ser explícito sobre o caso "o limite chegou no meio da unidade".

### 4. Protocolos BREVE · PADRÃO · ESTENDIDO

Para cada um: **quantidade de unidades · duração estimada · validade clínica** (o que esse protocolo
permite concluir e o que não permite). O BREVE precisa dizer francamente se é suficiente para
progressão ou serve só como manutenção/aquecimento.

### 5. Carga cognitiva BASAL (1 · 2 · 3, justificar)

Só a basal — configuração padrão, nível médio. **Não calcular carga dinâmica.**

### 6. Modificadores de carga

Listar o que aumenta: velocidade · quantidade de estímulos · memória exigida · interferência ·
dupla tarefa · mudança de regra · semelhança dos distratores · planejamento · modalidade. Usar os
modificadores que a Fase 1 já registrou em cada ficha. **Não calcular pesos ainda.**

### 7. Duração clínica: mínima útil · padrão · máxima recomendada

⚠️ **Nunca o mesmo valor para todos** — justificar cada faixa pela mecânica (quantas unidades cabem,
quanto dura uma unidade, quando o retorno decai).

### 8. Fadiga: baixa · moderada · alta (explicar)

### 9. Interferência: baixa · moderada · alta

### 10. Retomada após interrupção

Retoma exatamente de onde parou · do início do bloco · um nível abaixo · outra estratégia.
Coerente com o modelo de execução e com a unidade mínima.

### 11. Elegibilidade na sessão

Pode abrir? Pode fechar? Melhor no início, meio ou fim? Existe combinação ruim (com quais
exercícios, e por quê)?

### 12. Modalidade — SÓ estes cinco

Restaurante · Supermercado · Caminhos para a Meta · Agentes Focus · Compra Multifuncional.
Impacto de cada modo (visual · visual+áudio · só áudio) **na duração e na carga**. Nos demais,
escrever "não se aplica". Lembrar: visual+áudio **não** é automaticamente mais difícil.

## Regras que a Fase 1 deixou e valem aqui

- **Caminhos para a Meta** é `PROVISIONAL_PROFILE` — marcar seus parâmetros como provisórios e
  **não usar como referência** para outros exercícios.
- **Nunca inflar rótulo:** duração não vira fadiga alta por si; mais tempo de tela não é
  interferência.
- Divergência entre categoria do catálogo e mecânica **não é erro** — os parâmetros seguem a
  mecânica.

## Entregável

`docs/prescription-architecture/01-exercise-prescription-parameters.md` — 34 fichas com os 12
parâmetros + uma **tabela-resumo** ao fim (exercício · modelo · unidade mínima · carga basal ·
duração padrão · fadiga · interferência).

E `docs/prescription-architecture/prescription-parameters.json` — mesma informação estruturada,
um objeto por exercício, com `exerciseId`, `officialName` e os 12 campos.

Ao terminar: listar em uma linha por exercício — nome, modelo de execução e carga basal. Não
commitar.
