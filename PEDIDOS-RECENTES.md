# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 🚀 FASE 2b ENTREGUE E PUBLICADA (03/ago/2026) — descrição curta de volta à linha principal (`e98d069`, v2.68.0)

Continuação direta da Fase 2 abaixo. Ela **aprovou tecnicamente a Fase 2** e tomou três decisões:

1. **A descrição do exercício NÃO pode sumir da linha principal** da biblioteca — na Fase 2 ela tinha
   ido inteira para dentro de "Ver detalhes". Volta **curta, em uma linha, truncada**, sem inchar o cartão.
2. **O agrupamento visual dos alertas fica para a FASE 3, explicitamente.** O **núcleo dos 18 alertas
   NÃO muda** e continua devolvendo **todas as ocorrências individuais** — rastreabilidade, testes,
   relatórios e análises futuras dependem disso. O agrupamento será **exclusivamente de apresentação**.
   Exemplos dela: juntar as ocorrências de "fadiga alta em sequência" num grupo só, com os pares
   envolvidos; agrupar as interferências altas; consolidar as posições pouco recomendadas num grupo
   de organização da sessão.
3. **Publicar esta versão** para validação visual dela **antes de qualquer Fase 3**.

### O que entrou

- **Linha principal de cada exercício:** nome oficial · **descrição em uma linha truncada** (texto
  completo no `title` do hover) · modelo/dose/duração · etiquetas de carga e fadiga · "Ver detalhes".
- **Dentro de "Ver detalhes", rotulados:** descrição completa · perfil cognitivo · modelo de execução ·
  protocolo · carga/fadiga/interferência · modalidade quando aplicável.
- **`lib/prescription/presentation.ts`** ganhou dois campos: **`protocolLabel`** e
  **`cognitiveProfileLabel`**, derivados de `protocols.PADRAO`, `mechanicalPrimary` e
  `associatedCognitiveProfiles`.
- **`ExerciseCard`** passou a receber a prop **`description`** (não recebia); **`PlanBuilderSidebar`** a repassa.

### Roteamento (regra 8)

Codificação no **Codex `gpt-5.6-sol`, esforço high, lab `fase2b`**, spec em
`docs/spec-impl-fase2b-descricao.md` (`8eefc2d`). **Escopo respeitado** — só os 6 arquivos permitidos.
Dois consertos pós-colheita do **Claude Opus 5 xhigh (exceção 1 da regra 8)**: removido um dicionário
de reacentuação que era **código morto** (o catálogo já entrega português acentuado, então as chaves
sem acento nunca casavam) e corrigido o **teste sintético** que o sustentava, que usava o identificador
`ATENCAO_SUSTENTADA`, formato inexistente no catálogo real.

### Provas (repositório real)

`npx tsc --noEmit` exit 0 · `npx vitest run` **333/333** (eram 330 → **+3**) · `npm run build` exit 0.

### ✅ Publicação confirmada por evidência

`https://neuropeak-5jyl.vercel.app/api/version` → `{"appVersion":"2.68.0","buildId":"dpl_3qKhboJuMhC9w6tZTqC147b9AjVg"}` ·
`/api/health` → `{"ok":true}` · `git merge-base --is-ancestor a6f61f0 e98d069` confirmou que o commit
da Fase 2 está contido no deploy.

### ⏸️ PRÓXIMO PASSO — PARADO aguardando a validação visual dela; **NÃO iniciar a Fase 3**

Em `https://neuropeak-5jyl.vercel.app`, conferir com olho humano: **plano vazio · dentro do esperado ·
acima do esperado · excesso importante · fadiga alta consecutiva · planejamento consecutivo · plano
legado · descrição curta dos exercícios** — e, em **todos** os cenários com alertas, confirmar que o
botão **"Salvar plano"** continua disponível.

**Dois pontos que o VP quer que ela olhe:**

- **(a)** no **Caminhos para a Meta** o perfil sai como *"Organização · também recruta: organização e
  sequenciamento"* — redundância que vem do **dado congelado da Fase 1**, não da apresentação.
- **(b)** na linha principal aparece *"Por protocolo · Protocolo padrão · 6 min"* — modelo e dose
  **repetem a palavra protocolo**.
```

## COMO PROVEI

- `git log --oneline -3 &amp;&amp; git show e98d069 --stat &amp;&amp; node -p "require('./package.json').version"` → exit 0. Confirma o commit `e98d069` ("feat(prescricao): descrição curta na linha principal + perfil e protocolo nos detalhes (v2.68.0)"), a spec em `8eefc2d`, os **7 arquivos** tocados (os 6 de código/teste + `package.json`) e `package.json` em **2.68.0**. Os fatos do despacho batem com o repositório.
- `git status --porcelain &amp;&amp; git diff --stat` → exit 0. Saída: `M PROGRESSO.md` e `PROGRESSO.md | 59 +++++`, 1 arquivo, 59 inserções, 0 remoções. Nenhum outro arquivo alterado; nada staged, nada commitado.
- Posicionamento verificado pelo próprio diff: bloco inserido antes do cabeçalho da Fase 2, que segue intacto logo abaixo.

## O QUE NÃO FIZ

- Não commitei e não dei push (é do VP).
- Não alterei nenhum outro arquivo — nem código, nem `ESTADO-DO-PROJETO.md`, nem docs, nem memória.
- Não reexecutei `tsc`, `vitest`, `build` nem as chamadas a `/api/version` e `/api/health`: as provas registradas são as que o despacho trouxe do VP, não evidência colhida por mim nesta tarefa. Se o VP quiser reconfirmação independente dessas quatro provas, é um despacho novo.
- Não iniciei nem preparei nada da Fase 3.</result>
<usage><subagent_tokens>26668</subagent_tokens><tool_uses>4</tool_uses><duration_ms>63993</duration_ms></usage>
</task-notification>
