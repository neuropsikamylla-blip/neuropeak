# UX — LOTE A: painéis retráteis e layout responsivo

Base: v2.70.0, commit `cdca65f`. **Só UI.** A arquitetura clínica, os protocolos, os alertas e o
núcleo de prescrição estão aprovados e **não se reabrem**.

Não commitar.

## PROIBIÇÕES

**Não alterar:** núcleo clínico · regras de alerta · protocolos · durações · carga · fadiga ·
interferência · exercícios · progressão · nível · banco · migrations · APIs · formato persistido ·
modalidade · dose legada · experiência do paciente · **`package.json`** · **`vitest.config.ts`**.

**Não instalar dependências.** **Não** reintroduzir o slider de nível. **Não** iniciar tutorial,
modo autoguiado ou fase nova. **Não** mexer no conteúdo dos alertas — isso é o lote B.

**O botão de salvar não muda.** Os **395 testes atuais** não podem quebrar.

Recolher ou expandir painel **não pode**: alterar exercícios · mudar protocolos · mudar ordem ·
recalcular · salvar automaticamente · apagar filtros · alterar progresso · tocar no nível · mudar o
formato persistido.

## Arquivos permitidos

- **alterar** `app/(therapist)/pacientes/[id]/plano/page.tsx` ·
  `components/plano/PlanBuilderSidebar.tsx` · `components/plano/ExerciseCard.tsx`
- **criar** componentes em `components/plano/` (ex.: `CollapsiblePanel.tsx`) e um hook de
  preferência em `lib/` ou `components/plano/`
- **alterar/criar** testes em `lib/prescription/` ou `lib/`

Se precisar tocar em algo fora da lista, **parar e explicar**.

## 1. O layout hoje

`page.tsx:229` tem `grid grid-cols-1 lg:grid-cols-2 gap-5 items-start`. Coluna esquerda =
biblioteca (`DomainTabs`, `SubdomainTabs`, `ExerciseSearch`, `ExerciseTable`); coluna direita =
`<div className="lg:sticky lg:top-6">` com `PlanBuilderSidebar`. **50/50 fixo, sem recolhimento.**

## 2. Dois modos de trabalho

A tela deve apoiar **montagem** (foco na biblioteca) e **revisão** (foco no resumo e alertas), com
alternância **sem sair da página**.

### 2.1 Recolher a biblioteca

Ação discreta que recolhe a coluna esquerda. Recolhida:

- deixa de ocupar a largura principal; sobra uma **lingueta lateral fina** escrita **"Exercícios"**;
- seta coerente com a direção de abertura (ex.: `[ > Exercícios ]`);
- clicar reabre;
- **o painel do plano expande e ocupa o espaço liberado.**

### 2.2 Recolher o painel do plano

Simétrico. Recolhido: lingueta **"Plano"** (ex.: `[ Plano < ]`), a biblioteca expande, os exercícios
selecionados continuam preservados, nenhum cálculo se perde, e salvar continua possível ao reabrir.

### 2.3 Estados permitidos

**ambos abertos** · **biblioteca recolhida** · **plano recolhido**.

⚠️ **Os dois recolhidos ao mesmo tempo é proibido.** Recolher um quando o outro já está recolhido
deve **reabrir o outro** (ou ignorar a ação) — nunca deixar a tela vazia. **Isso precisa de teste.**

Animação **curta e discreta**, sem efeito chamativo, sem perder estado, sem recarregar a página.

## 3. Persistência — e a armadilha da hidratação

Guardar a preferência em **`localStorage`**, chave **`np-plano-paineis`** (padrão do projeto, como
`np-parking-recent`). **Não** usar banco.

⚠️ **`localStorage` não existe no servidor.** Ler no primeiro render causa **mismatch de
hidratação** no Next.js. O estado precisa:

1. **iniciar no padrão** (ambos abertos), igual no servidor e no cliente;
2. ser **aplicado num `useEffect`** depois da montagem;
3. **nunca** ser lido direto no corpo do componente nem no inicializador do `useState`.

Envolver o acesso em `try/catch` — `localStorage` lança em modo restrito. Falha de leitura ou valor
corrompido **cai no padrão**, sem quebrar a tela.

Extrair isso num hook (ex.: `usePanelPreference`) com **lógica pura testável separada** da parte
React: uma função que valide/normalize o valor lido do storage, testável sem DOM. **Os testes deste
projeto rodam em `environment: "node"`, sem jsdom** — então o que for testado tem de ser puro.

## 4. Preservação de estado ao recolher

Ao reabrir a biblioteca, preservar: **categoria selecionada · subdomínio · busca · filtros** e, se
tecnicamente viável, a **posição de rolagem**.

⚠️ Isso significa **não desmontar** o conteúdo ao recolher, ou manter o estado no componente pai. Se
optar por desmontar para ganhar desempenho, o estado dos filtros já vive em `page.tsx` e sobrevive —
**confirmar isso e declarar na entrega qual caminho foi usado.**

## 5. Responsividade e acessibilidade

- Em telas menores, comportamento equivalente a **drawer**;
- **não** deixar a interface inutilizável em notebook (largura intermediária, ~1280px);
- **navegação por teclado**: a lingueta é `<button>` real, focável, com `aria-expanded` e
  `aria-controls`; foco visível; nada de `div` clicável.

## 6. Ajuste: um por vez

Hoje o `open` é `useState` **local** de cada `ExerciseCard` (`:44`), então vários ajustes abrem
juntos. Passar a permitir **apenas um aberto por vez**: subir o estado para o pai
(`PlanBuilderSidebar` guarda o id do cartão aberto e passa `open` + `onToggleOpen` para cada
`ExerciseCard`).

Abrir um ajuste **fecha o anterior**. Abrir/fechar ajuste **não** altera dose, protocolo, ordem nem
qualquer dado.

## 7. Testes (puros — sem jsdom)

1. a lógica de estado dos painéis nunca produz "ambos recolhidos" — testar as transições a partir dos
   três estados válidos;
2. valor válido do storage é restaurado; valor corrompido, ausente ou inválido cai no padrão;
3. a lógica de "um ajuste por vez": abrir B com A aberto resulta em só B aberto; fechar o aberto
   resulta em nenhum;
4. um teste estático (nos moldes do `save-button-guard`) provando que o `localStorage` **não** é lido
   no inicializador de `useState` — falhar se aparecer `useState(` com `localStorage` na mesma
   expressão;
5. o `disabled` do botão de salvar continua inalterado (o guard existente já cobre — **não editar**).

## 8. Provas

```
npx tsc --noEmit     # exit 0
npx vitest run       # 395 atuais + novos, TODOS passando
npm run build        # exit 0
```

## Entrega

Arquivos criados e alterados · diff resumido · como ficou o grid nos três estados · o caminho
escolhido na seção 4 (desmontar ou não) · como a hidratação foi evitada · confirmação de que só UI
mudou · nº de testes novos. Não commitar.
