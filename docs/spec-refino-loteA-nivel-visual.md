# REFINO — LOTE A: sair o nível, respirar o "Ajustar"

Base: v2.69.0, commit `1150f60`. A dose por protocolo está **aprovada e deve continuar funcionando**.

Não commitar.

## PROIBIÇÕES

**Não alterar:** exercícios · progressão adaptativa · nível atual do paciente · banco · migrations ·
APIs · protocolos e durações aprovados · formato persistido dos planos · modalidade · dose legada ·
experiência do paciente · **`package.json`** · **`vitest.config.ts`**.

**Não instalar dependências.**

**Não mexer nos alertas** — taxonomia e linguagem são o lote B.

**Não implementar** tela de redefinição de nível, tutorial, modo autoguiado ou qualquer fase nova.

**O botão de salvar não muda:** `disabled={saving || items.length === 0}`.
`save-button-guard.test.ts` e `library-coverage.test.ts` passam **sem edição**.

Os **375 testes atuais não podem quebrar.**

## Arquivos permitidos

- **alterar** `components/plano/ExerciseCard.tsx` ·
  `components/plano/prescription/ProtocolDoseSection.tsx` ·
  `components/plano/prescription/PrescriptionSection.tsx` ·
  `components/plano/PlanBuilderSidebar.tsx` · `app/(therapist)/pacientes/[id]/plano/page.tsx`
- **alterar/criar** testes em `lib/prescription/`

Se precisar tocar em algo fora da lista, **parar e explicar**.

## 1. Tirar o nível da prescrição rotineira

O nível pertence ao sistema adaptativo e ao histórico do paciente, **não** à dose que o terapeuta
prescreve. O paciente começa no nível da mecânica, progride sozinho e retoma de onde parou.

**Remover da janela "Ajustar":**

- a seção **"Configurações de nível"** inteira;
- o **slider** de nível inicial;
- o texto **"Configuração de nível — revisão futura"**.

⚠️ **Remover é só deixar de EXIBIR.** É proibido:

- apagar, migrar ou zerar `level` / `startLevel` já salvos;
- alterar progresso, histórico ou a regra adaptativa;
- redefinir nível ao salvar um plano novo;
- tocar em `startLevel` legado.

Um plano antigo que tenha `{ level: 4 }` continua com `{ level: 4 }` depois de abrir, editar outro
campo e salvar. **Isso precisa de teste.**

Se `onLevel` ficar sem uso na cadeia de props, **não** removê-lo das interfaces sem confirmar que
nada mais o chama — preservar o caminho de dados existente é mais importante que limpar assinatura.
Se sobrar prop não usada, deixar comentário explicando por que ficou.

Após a mudança, o painel do Focus mantém `feedback` e `autoAdvance` em **"Preferências de execução"**,
e o `startLevel` 1–5 do Focus **também sai da tela** (é nível, mesma regra).

## 2. Respiro visual — refinar, não redesenhar

A estrutura aprovada permanece, agora com **quatro** seções:

1. Dose do treino · 2. Modalidade e variantes · 3. Assistência · 4. Preferências de execução

Objetivos: mais respiro vertical · leitura mais fácil · continuar clínico e discreto · sem textos
colados · **sem inflar demais a altura total**.

Nos cartões **Breve · Padrão · Estendido**, manter nome, unidade real, estimativa, descrição e o
destaque do selecionado, ajustando:

- mais espaço entre **nome** e **quantidade**;
- mais espaço entre **quantidade** e **descrição**;
- mais espaço antes das **observações de exposição**;
- mais espaço antes do **aviso do Breve**;
- **padding interno** um pouco maior;
- **separação mais clara** entre os três cartões.

⚠️ **Não alterar:** valores de unidades · durações · protocolos · seleção padrão · cálculo da sessão ·
dose legada. Isto é espaçamento e hierarquia, **não** lógica.

⚠️ **Nenhuma seção começa recolhida.**

## 3. Aviso do Breve — mesmo texto, menos peso

Texto **inalterado**:

> "Treino válido em dose reduzida. O desempenho desta sessão pode não ser suficiente, isoladamente,
> para atualizar o nível adaptativo."

Hoje ele usa a paleta âmbar de advertência. Passar a **informação clínica discreta**:

- fundo neutro ou azul/cinza discreto;
- **menor contraste** que um alerta;
- ícone informativo opcional;
- **nunca** aparência de advertência grave.

O terapeuta não pode ler isso como "o Breve é inadequado".

## 4. Assistência — texto novo

Substituir o texto atual da repetição de áudio por **exatamente**:

> "Repetir o áudio reapresenta o conteúdo auditivo. Não altera a dose prescrita nem a estimativa
> atual."

⚠️ **Não** chamar de acessibilidade: nos spans o áudio repetido **é o próprio conteúdo que deveria
ser memorizado**.

## 5. Testes

1. `level` e `startLevel` sobrevivem a abrir → editar outro campo → reconstruir o plano;
2. plano novo **não** grava `level` nem `startLevel`;
3. trocar protocolo continua mudando a duração da sessão;
4. modalidade continua recalculando a duração;
5. dose legada continua preservada e convertendo só por ação explícita;
6. um teste estático (nos moldes do `save-button-guard`) provando que **o slider de nível não existe
   mais** em `ExerciseCard.tsx` — procurar `type="range"` e a string "Configurações de nível" no
   fonte e falhar se aparecerem.

## 6. Provas

```
npx tsc --noEmit     # exit 0
npx vitest run       # 375 atuais + os novos, TODOS passando
npm run build        # exit 0
```

## Entrega

Arquivos alterados · diff resumido · confirmação de que nenhum dado de nível é apagado ou reescrito ·
descrição do espaçamento aplicado · nº de testes novos. Não commitar.
