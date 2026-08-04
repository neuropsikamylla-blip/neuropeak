# UX — LOTE B: cartões resumidos, detalhes sob demanda, menos densidade

Base: o lote A (painéis retráteis) já commitado. **Só UI.** A arquitetura clínica, os protocolos, os
alertas e o núcleo de prescrição estão aprovados e **não se reabrem**.

Não commitar.

## PROIBIÇÕES

**Não alterar:** núcleo clínico · **regras de alerta** · protocolos · durações · carga · fadiga ·
interferência · exercícios · progressão · nível · banco · migrations · APIs · formato persistido ·
modalidade · dose legada · experiência do paciente · **`package.json`** · **`vitest.config.ts`**.

**Não instalar dependências.** **Não** iniciar tutorial, modo autoguiado ou fase nova. **Não**
reintroduzir o slider de nível. **Não** redesenhar a dose de novo.

**Não apagar ocorrência nenhuma.** Limitar o que aparece de início **não é** perder informação: tudo
continua acessível por expansão, e o núcleo segue devolvendo tudo.

⚠️ **Proibido diminuir fonte.** A tela hoje força letra pequena para caber tudo. A saída é **mostrar
menos de uma vez**, não encolher texto. Se algo não couber, resumir ou expandir sob demanda.

**O botão de salvar não muda.** Os testes atuais não podem quebrar, salvo os que afirmem
literalmente um formato de exibição que este lote substitui.

## Arquivos permitidos

- **alterar** `components/plano/prescription/PrescriptionSummary.tsx` ·
  `components/plano/ExerciseCard.tsx` · `components/plano/PlanBuilderSidebar.tsx` ·
  `lib/prescription/presentation.ts` (**só** para expor dado já calculado — contagem, dado
  principal —, **nunca** para mudar regra, severidade ou disparo)
- **criar** componentes em `components/plano/prescription/`
- **alterar/criar** testes em `lib/prescription/`

Se precisar tocar em algo fora da lista, **parar e explicar**.

## 1. Alerta resumido — divulgação progressiva

Hoje cada alerta despeja título, explicação, lista de exercícios, sugestão e justificativa de uma vez.

**No estado fechado, mostrar só:** título · **dado principal** · contagem · categoria · ação de
expandir.

Alvo visual:

```
CARGA ELEVADA PARA A DURAÇÃO
69 / referência 10
[Ver detalhes]

MUITAS ATIVIDADES DE FADIGA ALTA
12 atividades
[Ver exercícios]

FADIGA ALTA EM SEQUÊNCIA
4 sequências
[Ver sequências]
```

**Ao expandir:** explicação completa · exercícios envolvidos · sugestão clínica · justificativa ·
ocorrências individuais quando houver.

O **dado principal** deve sair de valor **já calculado** pelo núcleo (carga e referência, nº de
atividades, nº de sequências, faixa de duração). **Não recalcular nada aqui** e **não inventar
métrica**. Quando um alerta não tiver dado numérico natural, omitir a linha — **nunca** preencher
com texto genérico só para ter o que mostrar.

O rótulo da ação acompanha o conteúdo: "Ver exercícios" quando são exercícios, "Ver sequências"
quando são pares, "Ver detalhes" no resto.

## 2. Limites iniciais por grupo

A taxonomia continua: **Revisão do plano · Observações clínicas · Informações**.

Por padrão: **todos os títulos de grupo aparecem**, os itens vêm **resumidos**, e **nenhum detalhe
começa aberto**.

| Grupo | Itens visíveis de início |
|---|---:|
| Revisão do plano | 4 |
| Observações clínicas | 3 |
| Informações | 1 bloco agrupado |

Havendo mais, botão com **contagem explícita**: *"Ver mais 5 revisões"* · *"Ver mais 8 observações"*.
A contagem tem de bater com o que está oculto — **testar**.

## 3. Hierarquia do painel direito

Ordem obrigatória:

1. Cabeçalho "Plano em construção" · 2. Duração e frequência · 3. Resumo da sessão ·
4. Revisão do plano · 5. Observações clínicas · 6. Informações · 7. Exercícios selecionados ·
8. Salvar plano · 9. Visualizar plano

Separação visual clara entre **resumo** · **análise** · **exercícios incluídos** · **ações finais**.
Não pode parecer um bloco contínuo — mas também **não** virar dashboard de métricas. Aparência
clínica, sóbria, elegante.

## 4. Legibilidade

- título de alerta **claramente maior** que o corpo;
- **dado principal destacado**;
- listas completas só no estado expandido;
- espaçamento consistente e contraste suficiente.

## 5. Exercícios selecionados — compactar

No estado fechado, cada exercício mostra **apenas**: nome · protocolo · duração · carga · fadiga ·
botão Ajustar · remover · controle de ordem.

Descrição completa, perfil cognitivo, modalidade e o resto vão para **"Ver detalhes"**.

⚠️ A regra de **um ajuste aberto por vez** veio do lote A — **não desfazer**.

## 6. Testes

1. o resumo expõe a contagem correta de cada alerta agrupado;
2. "Ver mais" tem contagem igual ao número de itens ocultos;
3. limitar a exibição **não** reduz o que o núcleo devolve — comparar contagem do núcleo antes e
   depois da apresentação;
4. num plano com os **34 exercícios**, o número de cartões de primeiro nível respeita os limites
   (Revisão ≤ 4 + botão · Observações ≤ 3 + botão · Informações = 1);
5. as ocorrências individuais continuam acessíveis no objeto apresentado;
6. posição preferencial agrupada continua acessível;
7. nenhum alerta bloqueia salvamento;
8. trocar protocolo continua recalculando a duração;
9. abrir "Ajustar" não altera dose;
10. nenhum dado de nível é tocado;
11. a linguagem proibida do lote anterior continua ausente dos textos visíveis.

## 7. Provas

```
npx tsc --noEmit     # exit 0
npx vitest run       # todos, incluindo os do lote A
npm run build        # exit 0
```

## Entrega

Arquivos criados e alterados · diff resumido · como ficou um alerta fechado e aberto (texto exato) ·
o dado principal escolhido para cada tipo de alerta · nº de cartões de primeiro nível num plano com
34 exercícios · confirmação de que nenhuma ocorrência foi apagada e de que a fonte não diminuiu em
lugar nenhum · nº de testes novos. Não commitar.
