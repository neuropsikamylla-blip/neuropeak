# REFINO — LOTE B: taxonomia, linguagem e agrupamento dos alertas

Base: commit `0f9bea5` (lote A). Não commitar.

## O princípio que governa este lote

O NeuroPeak é plataforma de **TREINO cognitivo**, não instrumento de avaliação. Princípios de
contaminação de teste **não** valem como regra universal de treino.

Em treino: dois exercícios podem trabalhar o mesmo domínio **de propósito** · uma sessão pode ser
ampla ou focal · concentração em memória operacional, atenção ou planejamento é **decisão clínica
legítima** · sobreposição **não** é automaticamente combinação ruim.

**O sistema informa; não corrige nem reprova a escolha do terapeuta.** Todos os alertas seguem
consultivos e **nunca** bloqueiam salvamento.

## PROIBIÇÕES

**Não alterar:** exercícios · progressão adaptativa · nível · banco · migrations · APIs ·
protocolos e durações · formato persistido · modalidade · dose legada · experiência do paciente ·
**`package.json`** · **`vitest.config.ts`**.

**Não instalar dependências.** **Não** reintroduzir o slider de nível. **Não** iniciar tutorial,
modo autoguiado ou fase nova.

**Não apagar as ocorrências individuais do núcleo** — rastreabilidade, testes, relatórios e análises
futuras dependem delas. O agrupamento é **exclusivamente de apresentação**.

**Não inventar novos riscos clínicos.**

**O botão de salvar não muda.** Os **378 testes atuais** não podem quebrar, salvo os que afirmam
literalmente a linguagem antiga que este lote substitui.

## Arquivos permitidos

- **alterar** `lib/prescription/types.ts` · `presentation.ts` · `validation.ts` (só severidade/
  categoria, **não** as condições de disparo) · `catalog.ts` (só se necessário para a categoria)
- **alterar** `components/plano/prescription/PrescriptionSummary.tsx` e criar componentes em
  `components/plano/prescription/`
- **alterar/criar** testes em `lib/prescription/`

Se precisar tocar em algo fora da lista, **parar e explicar**.

## 1. Três níveis visuais, no lugar de um bloco só

Hoje tudo cai em "Revisão recomendada". Reorganizar em:

1. **REVISÃO DO PLANO**
2. **OBSERVAÇÕES CLÍNICAS**
3. **INFORMAÇÕES**

### Revisão do plano — só condições objetivas

`SESSION_ABOVE_TARGET` · `SESSION_SAFE_MAX_EXCEEDED` · `LOAD_AT_CAP` · `LOAD_OVER_CAP` ·
`HIGH_FATIGUE_COUNT` · `HIGH_FATIGUE_ADJACENT` · `HIGH_INTERFERENCE_ADJACENT` ·
`PLANNING_WINDOW_COUNT` · `PLANNING_WINDOW_ADJACENT`.

Linguagem consultiva: *"Carga elevada para a duração escolhida."* · *"Duração estimada acima da
sessão prescrita."* · *"Há atividades de fadiga alta em sequência."*

**Nunca:** "plano inválido" · "combinação errada" · "não pode" · bloqueio.

### Observações clínicas

`DECLARED_BAD_COMBINATION` **inteiro** desce para cá — os 41 pares do catálogo.

**Justificativa medida, para não haver dúvida:** o disparo atual é por **presença no plano**, não por
adjacência — dois exercícios em pontas opostas já alertavam. Dos 41 pares, só **6** têm fadiga alta
bilateral e **5** interferência alta bilateral, e esses casos **já são cobertos** por
`HIGH_FATIGUE_ADJACENT` / `HIGH_INTERFERENCE_ADJACENT` / `HIGH_FATIGUE_COUNT`, que continuam
intactos. **Nenhum sinal objetivo se perde.**

`COGNITIVE_CONCENTRATION` também é observação, não revisão.

### Informações

`SESSION_BELOW_TARGET` · `SESSION_RANGE_PARTIAL` · `OUTSIDE_BEST_POSITION` ·
`OPEN_POSITION_NOT_ELIGIBLE` · `CLOSE_POSITION_NOT_ELIGIBLE` · `AUDITORY_ONLY_ADJACENT`.

## 2. Linguagem — o que sai e o que entra

**Proibido em texto visível:** "combinação desfavorável" · "contaminação" · "reduz a
comparabilidade" · "considere manter apenas uma" · "separe obrigatoriamente" · "combinação que
merece revisão".

**Padrão das observações** — descrever, nunca prescrever exclusão:

> "Os exercícios recrutam processos cognitivos semelhantes."
> "Há concentração de treino auditivo-verbal nesta sessão."
> "Ambas as atividades utilizam mapeamentos entre cor e resposta."
> "Há alta sobreposição de controle inibitório e alternância de regras."

**Complemento padrão, em toda observação de sobreposição:**

> "Essa concentração pode ser intencional em um plano focal. Caso o objetivo seja maior variedade,
> considere intercalar outro tipo de atividade."

⚠️ As `reason` do catálogo contêm linguagem proibida ("contaminação", "reduz a comparabilidade",
"reduz a validade"). **Não editar o catálogo.** A camada de apresentação deve **traduzir ou
suprimir** essas frases — o `reason` cru **não pode** chegar à tela. Se não houver tradução segura
para um par, exibir só a frase neutra genérica mais o complemento padrão.

### Títulos informativos, não genéricos

Trocar "Combinação que merece revisão" por títulos que digam o que é:
"Concentração de treino verbal" · "Sobreposição executiva" · "Mapeamento cor–resposta semelhante" ·
"Fadiga alta em sequência" · "Planejamento consecutivo" · "Carga elevada para a duração" ·
"Duração acima da faixa prescrita".

Derivar o título do **conteúdo real** do par (domínio/macro envolvido), não de uma lista fixa que
finja saber mais do que os dados. Quando não der para especializar, usar um título neutro honesto
como "Processos cognitivos semelhantes".

**Nenhum código técnico na tela** — a varredura `/[A-Z]{3,}_[A-Z_]+/` continua valendo.

## 3. Agrupamento — matar o paredão

O núcleo continua devolvendo **todas** as ocorrências. A apresentação agrupa as semelhantes:

- **Fadiga alta em sequência:** um bloco — *"Há 4 sequências de atividades com fadiga alta."* —
  expansível com os pares.
- **Interferência alta em sequência:** idem.
- **Sobreposição / observações clínicas:** agrupar pares relacionados numa observação quando
  possível.
- **Posição preferencial:** **um único bloco expansível** — *"13 atividades estão fora de sua posição
  preferencial."* — que abre mostrando exercício, posição recomendada e justificativa. Nunca dezenas
  de cartões.

Apresentação inicial: mostrar os mais relevantes e oferecer **"Ver todas as observações"** quando
houver muitas. Evitar coluna interminável. **Não** apagar dado individual.

## 4. Testes

1. Span Direto + Inverso **não** gera revisão;
2. Matriz Espacial + Inversa **não** gera revisão;
3. Letras em Sequência + Span Direto **não** gera revisão;
4. sessão focal em memória operacional salva sem mensagem de combinação desfavorável;
5. sobreposição aparece como observação neutra quando aplicável;
6. **nenhuma** mensagem visível contém "combinação desfavorável";
7. **nenhuma** sugestão visível contém "manter apenas uma";
8. **nenhum** texto visível contém "contaminação", "reduz a comparabilidade" ou "reduz a validade"
   — varredura sobre os 41 pares do catálogo;
9. duração excessiva continua em revisão;
10. carga elevada continua em revisão;
11. fadiga alta consecutiva continua em revisão;
12. planejamento consecutivo continua em revisão/atenção;
13. posição preferencial vira **informação agrupada**;
14. as ocorrências individuais continuam no resultado do núcleo (contagem antes/depois);
15. nenhum alerta bloqueia salvamento;
16. o slider de nível continua ausente;
17. trocar protocolo continua atualizando a duração;
18. modalidade continua funcionando.

## 5. Provas

```
npx tsc --noEmit     # exit 0
npx vitest run       # 378 atuais + novos, TODOS passando
npm run build        # exit 0
```

## Entrega

Arquivos alterados · diff resumido · a lista de códigos em cada um dos três níveis · como os títulos
são derivados · como o agrupamento reduz o paredão (nº de cartões antes/depois num plano com os 34
exercícios) · nº de testes novos · confirmação de que o núcleo continua devolvendo as ocorrências
individuais. Não commitar.
