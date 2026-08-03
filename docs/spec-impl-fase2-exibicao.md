# IMPLEMENTAÇÃO — FASE 2: exibição consultiva na área do terapeuta

Fase 1 (`lib/prescription/`) está **aprovada e congelada** — é a fonte. Não alterar seus 7 módulos
existentes, exceto para **acrescentar** `presentation.ts` e seu teste.

Não commitar.

## PROIBIÇÕES

**Não alterar:** APIs · banco · migrations · páginas do paciente · `lib/adaptive.ts` ·
`ExerciseWrapper.tsx` · rotas de sessão · comportamento dos exercícios · **`package.json`** ·
**`vitest.config.ts`**.

**Não instalar dependências.** Não adicionar jsdom, happy-dom nem Testing Library.

**Somente leitura e apresentação:** não alterar o formato salvo, não converter dados antigos, não
apagar campos, não mexer em níveis ou progresso. O terapeuta continua salvando no formato atual.

**Não implementar controles de dose** — nesta fase o terapeuta só visualiza.

Se for tecnicamente necessário tocar em arquivo fora da lista permitida, **parar e explicar** em vez
de fazer.

## Arquivos permitidos

- **criar** `lib/prescription/presentation.ts` + `presentation.test.ts`
- **criar** `lib/prescription/__tests__/save-button-guard.test.ts` (teste estático)
- **criar** componentes auxiliares em `components/plano/prescription/`
- **alterar** `app/(therapist)/pacientes/[id]/plano/page.tsx` ·
  `components/plano/PlanBuilderSidebar.tsx` · `components/plano/ExerciseCard.tsx` ·
  `components/plano/ExerciseRow.tsx`

## 1. `lib/prescription/presentation.ts` — TODA a lógica de apresentação

Funções **puras**, sem React. Os componentes só consomem o resultado.

Deve conter:

- **Tradução dos 18 alertas**: para cada código, `titulo` · `mensagem` (aceitando os dados do alerta:
  exercícios envolvidos, valores) · `sugestao` (quando houver) · `gravidadeVisual`.
- **Gravidade visual consultiva**: `informativo` · `atencao` · `revisao_recomendada`. Derivar da
  `severity` do núcleo mais o código — **sem alterar `blocksSave`**, que continua `false` sempre.
- **Agrupamento** dos alertas por gravidade, para a UI renderizar em bloco.
- **Rótulos dos modelos**: `CONTINUOUS_TIMED` → "Por tempo" · `CLOSED_PROTOCOL` → "Por protocolo" ·
  `PLANNING_WINDOW` → "Janela de planejamento" · `FIXED_HIGH_FATIGUE` → "Duração fixa".
- **Rótulos dos estados**: "Abaixo do esperado" · "Dentro do esperado" · "Acima do esperado" ·
  "Excesso importante".
- **Formatação da faixa**: `"27–33 min"` (travessão, não hífen).
- **Formatação de carga**: `"Carga basal: 8 / referência 10"` + o texto auxiliar
  `"Referência consultiva; não determina se o plano é válido."`
- **Resumos de fadiga e interferência** em texto ("2 moderadas · 1 alta", omitindo os zerados).
- **Marcador de plano legado / parâmetro indefinido** — discreto, sem erro técnico.
- **Textos auxiliares e tooltips.**

⚠️ **Nenhum código técnico pode chegar ao terapeuta.** O objeto devolvido pode carregar o `code`
internamente, mas nada em `titulo`/`mensagem`/`sugestao` pode conter `HIGH_FATIGUE_ADJACENT` ou
similar.

## 2. Componentes — casca fina

### `PlanBuilderSidebar.tsx`

**Remover** `const totalMinutes = items.reduce((sum, ex) => sum + (ex.estimatedMinutes ?? 0), 0)` —
é a estimativa genérica do "~7 min".

Passar a exibir, a partir do interpretador:

1. duração prescrita (20/30/40, ou o valor atual quando legado/personalizado);
2. **faixa estimada** (`Estimativa: 27–33 min`);
3. **estado** com rótulo amigável e destaque proporcional (neutro/atenção discreta/mais evidente
   sem alarme);
4. **carga basal + referência**, com o texto de que é consultiva;
5. **fadiga** (baixa/moderada/alta);
6. **interferência** (baixa/moderada/alta);
7. os **alertas agrupados** por gravidade, com título, mensagem, exercícios e sugestão.

**O botão de salvar continua exatamente como está**: `disabled={saving || items.length === 0}`.
Não acrescentar nenhuma condição. Sem selo de "plano válido", sem linguagem de aprovação.

### `ExerciseCard.tsx` e `ExerciseRow.tsx`

Exibir de forma **compacta**: modelo em texto amigável · duração estimada ou protocolo · carga basal ·
fadiga · modalidade **só quando aplicável**. Prioridade visual: nome → duração/protocolo → carga e
fadiga compactos → o resto atrás de "Ver detalhes".

**Não** adicionar controles de alteração. Manter os controles existentes intactos.

### Estado vazio

Sem exercícios: duração 0, estado "Abaixo do esperado", **sem alertas confusos**, e uma orientação
para adicionar exercícios.

### Planos legados

Interpretar pela camada legada; marcador discreto só quando algum parâmetro não puder ser
determinado; **nunca** erro técnico; **não modificar dados ao abrir a tela**.

## 3. Testes puros (`lib/prescription/presentation.test.ts`)

1. tradução dos 18 alertas · 2. títulos e mensagens em português · 3. gravidade consultiva ·
4. rótulos dos 4 modelos · 5. rótulos dos 4 estados · 6. formatação das faixas · 7. carga e
referência · 8. resumos de fadiga e interferência · 9. plano vazio · 10. plano legado ·
11. **ausência de código técnico** no conteúdo apresentado (varredura por `/[A-Z]{3,}_[A-Z_]+/` nos
textos visíveis) · 12. **os 18 códigos têm configuração de apresentação** (iterar sobre o tipo, não
sobre uma lista escrita à mão) · 13. nenhum alerta com comportamento bloqueante.

## 4. Teste estático do botão de salvar

`lib/prescription/__tests__/save-button-guard.test.ts` — lê o **código-fonte** dos componentes
alterados com `node:fs` e **falha** se o `disabled` do botão de salvar depender de: alertas · carga ·
fadiga · interferência · estado da sessão · resultado do interpretador.

**Permitido** continuar desabilitando por razão técnica existente: `saving`, ausência de paciente,
lista vazia, dados obrigatórios ausentes.

⚠️ **O teste não pode ser superficial.** Deve localizar de fato a expressão `disabled` do botão de
salvar e inspecionar seus identificadores — não um `includes("blocksSave")` que passaria sempre.
Documentar no próprio teste por que ele é confiável e o que ele não cobre.

## 5. Provas a rodar

```
npx tsc --noEmit     # exit 0
npx vitest run       # 296 atuais + os novos, TODOS passando
npm run build        # a tela precisa compilar
```

⚠️ Os **296 testes atuais não podem quebrar**.

## Entrega

Arquivos criados · alterados · o que cada componente passou a exibir · nº de testes novos ·
confirmação de que o `disabled` do botão não mudou · e a **lista dos cenários que precisam de
validação visual manual** (plano vazio, dentro, acima, excesso importante, fadiga alta consecutiva,
planejamento consecutivo, plano legado), já que não há teste de renderização nesta fase.
