# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O QUE MUDOU

Nada. Nenhuma alteração permanente foi feita por mim. As duas edições de injeção foram desfeitas e verificadas por hash SHA-256.

**Ressalva importante, que não é obra minha:** o hook de checkpoint automático dela commitou sozinho às **16:00:51**, criando `8f8356c checkpoint automatico (salvamento de seguranca)` com os 9 arquivos da fatia 3 (incl. `colheita-focus-tut-f3-20260811.md`). Não fui eu — `git reflog` não tem nenhum commit meu. Verifiquei que esse commit capturou o estado **original correto**, anterior às minhas injeções: `git show HEAD:lib/tutorial/definitions/focus-agents.tsx | shasum -a 256` = `e163de13…`, idêntico ao backup que tirei antes de tocar em qualquer coisa. **Nenhuma injeção vazou para o histórico.** Mas fica o alerta: o commit `8f8356c` contém código que não compila.

---

## COMO PROVEI

### 1. Provas obrigatórias

| Comando | Exit | Resultado |
|---|---|---|
| `npm run test` | **0** | **699 passed (699)** em **50 arquivos** |
| `npx tsc --noEmit` | **2** | **2 erros TS18047** (acima) |
| `npm run lint` | **0** | **0 errors, 10 warnings** |
| `npm run build` | **1** | **Failed to compile** (mesmo erro) |

**Delta de testes: +14 (685 → 699), +1 arquivo (49 → 50).** Origem exata, medida:
- 13 do `lib/tutorial/focus-agents.test.ts` novo (contei os 13 no reporter verbose).
- **+1** de `lib/tutorial/span-reference.test.ts` (96 testes hoje): a entrada `"lib/tutorial/definitions/focus-agents.tsx"` no array `arquivosDoFramework` do `it.each` de emoji gera um caso a mais. Confirmado por `diff` contra `fbd0e00` — as duas únicas linhas alteradas no arquivo são essa e `"focus-agents"` (esta dentro de um array de asserção, não gera teste).
- `estimulo-continuo.test.ts` foi alterado, mas só em número/rótulo de teste existente e numa entrada de array dentro de `for` — 0 testes novos. Fecha 13+1=14.

`npm run lint` e `npm run build` reportam exatamente as mesmas 10 warnings, nenhuma nova em `focus-agents.tsx`.

### 2. Verificações pontuais — todas CONFIRMADAS

**(a)** Tudo bate, com as linhas:
- `data-tutorial-ok` no botão do `CommandCard`: **linha 95**.
- Ordem dos alvos na `run()`: `setTargetSelector("[data-tutorial-ok]")` na **linha 258**, `setTargetSelector(\`[data-focus-character="${target.uid}"]\`)` na **linha 269**. Mesmo fluxo sequencial com `await` entre elas (253-280): a ordem é de execução, não só de texto.
- `DemoPointer` **fora** de `showScene`: renderizado nas **linhas 312-321**, dentro de `{scene &amp;&amp; (...)}`. Os blocos `{scene &amp;&amp; showScene &amp;&amp; (...)}` terminam na linha 308.
- `data-demo-pointer-start`: **exatamente 1 atributo JSX**, na **linha 294** (`&lt;span data-demo-pointer-start …&gt;`, filho direto da arena). A outra das 2 ocorrências textuais é a **linha 216**, `useState("[data-demo-pointer-start]")` — o seletor entre colchetes, esperado. `grep -nE "&lt;[^&gt;]*data-demo-pointer-start"` retorna só a 294. Não sobrou nenhum dentro do `MovingCharacters`.

**(b)** Nenhum comentário JSX em posição inválida. Existem exatamente 3, todos em posição de *children*: **177** (dentro de `&lt;button&gt;`), **292-293** e **309-311** (dentro do `&lt;div&gt;` da arena). A prova forte é o tsc: 2 erros, ambos `TS18047`, zero `TS1xxx` — um `{/* */}` fora de elemento seria erro de parse e o compilador nem chegaria à checagem semântica.

**(c)** `components/exercises/attention/FocusAgents.tsx`: `grep -n "function Tutorial\|const DEMO\|instrucoes"` retorna **exit 1, zero linhas** — os três sumiram. `begin()` na **linha 164**, dentro de `useEffect(() =&gt; { begin(); }, [begin])` (163-165), com `begin` vindo de `useTimedProgress()` (linha 131).

**(d)** `lib/tutorial/definitions/focus-agents.tsx` está na lista `arquivosDoFramework` do teste "T1 congelada — 2. sem emoji no framework do tutorial" (**`lib/tutorial/span-reference.test.ts:607`**) e o caso passa:
```
✓ lib/tutorial/span-reference.test.ts &gt; T1 congelada — 2. sem emoji no framework do tutorial &gt; lib/tutorial/definitions/focus-agents.tsx não contém emoji
```

### 3. Prova por injeção — o teste prova ausência

| Estado | Comando | Exit | Saída decisiva |
|---|---|---|---|
| 1. `setTargetSelector("[data-tutorial-ok]");` removida | `npx vitest run lib/tutorial/focus-agents.test.ts -t "demonstra o clique no OK…"` | **1** | `AssertionError: expected -1 to be greater than -1` |
| 2. Restaurado; `z-10` → `z-30` no `CommandCard` | mesmo comando | **1** | `AssertionError: expected '"use client";…' not to match /absolute inset-0 z-30/` |
| 3. Tudo restaurado | mesmo comando | **0** | `Tests 13 passed (13)` |

O teste falha pelos dois motivos independentes — não é asserção decorativa.

**Restauração verificada por hash**, não por leitura:
- `lib/tutorial/definitions/focus-agents.tsx` = `e163de13a45477d4877ac66c391131fa0bca5333e14564f000b9555f6d1a2cdb` — idêntico ao backup pré-injeção e ao conteúdo em `HEAD`.
- `lib/tutorial/focus-agents.test.ts` = `a1611df4dff18451c4dc82231e996eee78f3ceadc765a0617075ff15b4db8deb` — intocado.
- `git status --porcelain` **vazio**; `git stash list` vazio; suíte completa re-rodada no estado final: **exit 0, 699/699, 50 arquivos**.

Backups em `/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/96bb9a4b-9318-45ec-b426-399a26293ad5/scratchpad/orig/`; logs de cada prova em `.../scratchpad/{test,tsc,lint,build,inj1,inj2,inj3}.log`.

---

## O QUE NÃO FIZ

- **Não commitei e não dei push.** O commit `8f8356c` é do hook de checkpoint automático dela, disparado às 16:00:51 — está no `git reflog` como `commit:` sem autoria minha, e o VP decide o que fazer com ele.
- **Não corrigi o erro de tipo** da linha 267, como instruído. A correção é sua.
- Não toquei em `PROGRESSO.md`, em configuração, nem em hooks.
- **Não validei nada visualmente em navegador.** O comportamento em tela (o cursor de fato partir do canto, subir até o OK, o clique aparecer sobre o cartão e o ponteiro perseguir o personagem em deriva) permanece **DESCONHECIDO por evidência direta** — o que provei é a estrutura do código e a ordem no roteiro, por leitura e por injeção. Ressalva que pesa aqui: o `z-10` do cartão contra o `z-20` do cursor eu confirmei só por leitura de classe; sobreposição real depende de contexto de empilhamento, que só a tela mostra.
- Não investiguei se o mesmo padrão `function run()` sem narrowing existe em outras definitions do framework — fora do despacho.</result>
<usage><subagent_tokens>62357</subagent_tokens><tool_uses>32</tool_uses><duration_ms>356152</duration_ms></usage>
</task-notification>
