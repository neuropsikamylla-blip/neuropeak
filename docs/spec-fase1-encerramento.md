# FASE 1 — ajustes finais e encerramento

Base: v2.74.0, commit `b44c773`. **Sistema em produção.** Só apresentação. Não commitar.

## ⛔ PROIBIÇÕES

**Não alterar:** `validation.ts` · núcleo · cálculos · fórmulas · regras de disparo · banco · APIs ·
migrations · exercícios · progressão · nível · doses · **`catalog.ts`** · **`package.json`** ·
**`vitest.config.ts`**.

**Nenhuma funcionalidade nova.** Os **491 testes atuais** não podem quebrar, salvo os que afirmem
literalmente um texto substituído aqui.

## Arquivos permitidos

`lib/prescription/presentation.ts` · testes em `lib/prescription/` ·
`components/plano/prescription/PrescriptionSummary.tsx` (só se houver texto morto a remover).

## 1. Planejamento prolongado

| | |
|---|---|
| Título | **`Planejamento prolongado`** — mantém |
| Mensagem hoje | `6 exercícios exigem planejamento prolongado.` |
| **Mensagem nova** | **`6 exercícios do plano exigem raciocínio sustentado até a solução.`** |

O número é **dinâmico**, conforme o plano.

## 2. Demanda elevada — uma frase só

Hoje são duas frases citando duração duas vezes. Passa a:

> **`12 dos 34 exercícios são potencialmente fatigantes, e a demanda total está acima do previsto para uma sessão de 40 minutos.`**

Dinâmicos: **quantidade de fatigantes** · **total de exercícios do plano** · **meta real da sessão**.

⚠️ Quando **não** houver referência de carga válida (duração fora de 20/30/40), a segunda oração
**não aparece** — a frase termina em "potencialmente fatigantes.". **Nunca** exibir carga numérica,
carga basal ou referência interna.

## 3. Sobreposição de processos — regra única

⛔ **A cascata atual de `declaredObservation` é uma taxonomia não aprovada e deve ser substituída
inteira.** Saem: `Mapeamento cor–resposta semelhante` · `Concentração de treino verbal` ·
`Concentração de busca visual` · `Sobreposição executiva` · `Concentração em <processo>` ·
`Processos cognitivos semelhantes` · `Concentração cognitiva do plano`.

### A regra

**Há um processo cognitivo principal claramente sustentado pelos exercícios envolvidos?**

- **Sim** → título **`Sobreposição em <processo>`**
- **Não** → título **`Sobreposição de processos cognitivos`**

O processo vem de `sharedCognitiveProcesses(definitions)` — os macros cognitivos que os exercícios
compartilham, que **já são taxonomia clínica aprovada** (Fase 1 da arquitetura clínica). **Não
derivar título do texto do `reason`**, que é justamente a lógica interna do motor.

**Critério objetivo:** existe processo principal quando `sharedCognitiveProcesses` devolve **pelo
menos um** processo compartilhado. Usar o primeiro.

⛔ **Não inventar categoria.** Se o processo compartilhado não existir na taxonomia, cai no genérico.

### A mensagem

Deve informar **quatro** coisas: quais exercícios · quais processos semelhantes recrutam · que a
concentração pode ser intencional em plano focal · que o terapeuta pode mantê-la conforme o objetivo.

**Textos aprovados por ela, a reproduzir exatamente quando o caso ocorrer:**

> **Sobreposição em planejamento**
> "Estacionamento Lógico e Jogo das Torres recrutam processos de planejamento semelhantes. Essa
> concentração pode ser intencional em um plano focal."

> **Sobreposição em controle inibitório**
> "Cores e Palavras e Semáforo recrutam controle inibitório e associações entre estímulo e resposta
> semelhantes. Essa concentração pode ser intencional em um plano focal."

> **Sobreposição de processos cognitivos**
> "Span Numérico Auditivo Direto e Letras em Sequência recrutam processos verbais e de memória
> operacional semelhantes. Essa concentração pode ser intencional em um plano focal."

**Forma geral:** `<Exercício A> e <Exercício B> recrutam <processos> semelhantes. Essa concentração
pode ser intencional em um plano focal.` — e a sugestão existente completa com a opção de manter
conforme o objetivo clínico.

⚠️ Com **muitos** exercícios envolvidos, não listar todos na mensagem: usar formulação que caiba, com
os nomes disponíveis na expansão. **Sem contagem na mensagem principal** (decisão da v2.73.0).

## 4. "Concentração cognitiva do plano"

Substituído pela regra da seção 3. O sufixo "do plano" **não** volta em nenhum título.

## 5. Texto morto

Confirmar se **`Nada a revisar aqui.`** (grupo vazio, `PrescriptionSummary.tsx:94`) é renderizado em
algum cenário real. Se um grupo sem insight nunca é renderizado, **remover** a função e o texto.

**Manter** apenas **`Nada a revisar neste plano.`**, exibido **somente** quando não houver insight
nenhum.

## 6. Princípio de linguagem — vale para tudo acima

**Linguagem da Neuropsicologia, não do software.**

**Permanecem:** memória operacional · planejamento · atenção seletiva · controle inibitório ·
flexibilidade cognitiva · fadiga · interferência.

**Saem:** carga basal · referência interna · janela de planejamento · parâmetros · heurística ·
regra interna · indicador interno.

⛔ **Não simplificar conceito clínico correto para popularizar a linguagem.** O público é formado
por psicólogos e neuropsicólogos: a terminologia da Neuropsicologia e da Psicologia Cognitiva é o
vocabulário deles, não um obstáculo.

⚠️ **Regra permanente da plataforma, agora no `CLAUDE.md`:** se uma informação não puder ser
traduzida para um conceito clínico compreensível pelo terapeuta, **ela não aparece na interface** —
permanece apenas internamente.

⚠️ Os 8 títulos internos (`Regra interna do plano`, `Indicador interno do plano`) pertencem a alertas
ocultos e **hoje não vazam** — confirmado em 7 cenários. **Manter ocultos**; se for trivial, dar-lhes
texto neutro, mas **sem** criar exibição nova.

## 7. Testes

1. mensagem de planejamento **não** contém "planejamento prolongado" (não repete o título);
2. mensagem de planejamento traz o número dinâmico correto;
3. demanda elevada em **uma** frase, citando a duração **uma vez**, com meta real;
4. demanda elevada sem referência de carga **não** menciona demanda total;
5. título de sobreposição é `Sobreposição em <processo>` **ou** `Sobreposição de processos
   cognitivos` — **nenhum outro**;
6. os três textos aprovados da seção 3 aparecem **exatamente** nos pares citados;
7. nenhum título contém: "Mapeamento cor–resposta", "Concentração de treino verbal", "Concentração
   de busca visual", "Sobreposição executiva", "Concentração cognitiva", "Processos cognitivos
   semelhantes";
8. varredura nos **34** exercícios combinados dois a dois: todo título de sobreposição começa com
   "Sobreposição";
9. `Nada a revisar aqui.` não existe mais, se confirmado como morto;
10. `Nada a revisar neste plano.` só com zero insights;
11. nenhum texto visível contém os termos internos da seção 6;
12. o núcleo continua devolvendo **66** ocorrências no plano de 34;
13. `canSave` true.

⚠️ Testes que importam `.tsx` quebram a coleta (`jsx: preserve`, `environment: node`). Usar
**verificação estática do fonte**.

## 8. Provas

```
npx tsc --noEmit     # exit 0
npx vitest run       # 491 + novos, TODOS passando
npm run build        # exit 0
```

## Entrega

Arquivos alterados · diff resumido · **todos os títulos de sobreposição possíveis**, varridos sobre
os 34 combinados dois a dois · os três textos aprovados reproduzidos · confirmação de que
`validation.ts` e o núcleo estão intactos · nº de testes novos. Não commitar.
