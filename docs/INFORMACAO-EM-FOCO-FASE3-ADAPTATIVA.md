# Informação em Foco — FASE 3: dificuldade adaptativa, registro e relatório

> Spec da Kamylla, recebida em 02/ago/2026. **Executar só depois das Fases 1 e 2.**
> Ela depende de peças que a Fase 2 cria (modal de ampliação, tipos de pergunta,
> situações do cotidiano) e de dados que a Fase 1 estabiliza.

**Proibido:** recriar o exercício · segunda versão · alterar catálogo, imagens, marcas, pesos,
volumes ou atributos fixos · mudar o visual aprovado na Fase 2 · pontos, moedas, troféus,
premiação · diagnóstico automático.

## 1. Objetivo

A dificuldade se ajusta ao desempenho **sem mudança brusca**, observando: acerto/erro · acerto na
1ª tentativa · nº de tentativas · tempo de resposta · tipo de pergunta · nº de condições · campos
envolvidos · uso da ampliação · condição ignorada no erro · nível de ajuda · sequência recente.
A adaptação vem da **complexidade cognitiva** — nunca de fonte menor, contraste pior, imagem
menor, desorganização, alternativa absurda ou perda de acessibilidade.

## 2. Preservar a estrutura existente

Antes de implementar, identificar: sistema de níveis atual, armazenamento de progresso, estrutura
de sessão, nº de questões, regras de avanço, dados já registrados, relatórios existentes.
**Não criar um segundo sistema de níveis concorrente**; refatorar de forma centralizada o que for
incompatível e informar ao final.

## 3. Dimensões de dificuldade (independentes)

| Dimensão | Mais fácil | Intermediário | Mais difícil |
|---|---|---|---|
| A. Produtos | 3 | — | 4 (não passar de 4 sem validação clínica) |
| B. Campos visíveis | 3 | 4–5 | 5–6 |
| C. Condições | 1 | 2 | 3 |
| D. Semelhança dos distratores | claramente diferentes | um parcialmente correto | todos atendem ≥1 condição, só um atende ao conjunto |
| E. Tipo de questão | localização → comparação → duas condições → validade/conservação → situação → ingredientes/alergênicos → três condições → leitura da embalagem |
| F. Ordem dos campos | estável | variação pequena | variável mas organizada (nunca caótica) |
| G. Proximidade dos valores | 100 g · 500 g · 1 kg | — | 400 · 450 · 500 · 550 g |
| H. Complexidade da situação | contexto curto, 1 condição | 2 condições | até 3 (nunca texto longo) |

## 4. Uma dimensão por vez

Ao subir, mudar **apenas uma** entre produtos, campos, condições, semelhança dos distratores e tipo
de pergunta. Mudança brusca impede saber qual fator causou o erro.

## 5. Progressão

Avançar uma etapa quando houver: **3 acertos consecutivos** · pelo menos **2 na primeira
tentativa** · nenhum **erro crítico** nas últimas 3 · desempenho estável no nível atual.
Não avançar por acerto após várias tentativas, nem por acerto muito demorado para o próprio padrão
recente. Tempo isolado nunca é critério.

**Erro crítico:** escolher opção que não atende a nenhuma condição · ignorar repetidamente a mesma
condição · responder em tempo extremamente curto · errar mesmo depois do feedback processual.

## 6. Regressão

Reduzir **uma** dimensão quando houver: 2 erros nas últimas 3 questões · 3 erros no mesmo bloco ·
repetição do mesmo tipo de erro · incapacidade de integrar 2–3 condições · necessidade frequente de
2ª tentativa. Ao reduzir: preservar as demais dimensões, voltar à última configuração estável, não
reiniciar a sessão e **nunca** dizer ao paciente "você voltou de nível". Interface neutra.

## 7. Anti-oscilação (histerese)

Depois de avançar, manter a configuração por ao menos 2 questões válidas · não regredir por um erro
isolado · depois de regredir, exigir nova sequência estável antes de subir · registrar o motivo de
cada mudança:

```json
{ "fromLevel": 3, "toLevel": 4, "changedDimension": "requiredConditions",
  "previousValue": 1, "newValue": 2, "reason": "threeConsecutiveCorrect", "questionIndex": 6 }
```

## 8. Perfil de dificuldade (não um número só)

```json
{ "level": 4, "productCount": 4, "visibleFieldCount": 5, "requiredConditionCount": 2,
  "distractorSimilarity": "moderate", "fieldOrderVariation": "controlled",
  "dailySituationEnabled": true, "directPackageReadingEnabled": false }
```

## 9. Progressão de referência (níveis 1–8)

1. 3 produtos · 3 campos · 1 condição · localização direta · distratores bem diferentes · campos estáveis.
2. 3 · 4 campos · 1 condição · localização e comparação simples · valores moderadamente próximos.
3. 3 · 4 campos · 2 condições · um distrator parcialmente correto.
4. 4 · 4–5 campos · 2 condições · distratores semanticamente semelhantes.
5. 4 · 5 campos · situação do cotidiano com 2 condições · variação controlada dos campos.
6. 4 · 5–6 campos · validade, conservação, ingredientes ou alergênicos · distratores parciais.
7. 4 · 5–6 campos · 3 condições · situações funcionais · valores mais próximos.
8. 4 · até 6 campos · combinação de modalidades · leitura direta autorizada · 3 condições · distratores de alta semelhança.

Leitura direta **não** pode ser requisito permanente de todas as questões do nível 8.

## 10. Tempo de resposta

Registrar: tempo até a 1ª seleção · tempo total da questão · tempo no modal de ampliação · tempo
após o feedback · mediana da sessão. Usar **mediana e faixa interquartil**, comparando com o
histórico do próprio paciente — nunca com outros usuários. Resposta rápida não é desempenho
superior sem checar acerto e impulsividade.

## 11. Resposta impulsiva

Marcar `possibleImpulsiveResponse: true` quando a seleção for muito rápida, a questão tiver 2–3
condições, a alternativa atender só à primeira e os outros campos forem ignorados.
**Nunca** classificar o paciente. No relatório, linguagem descritiva: *"Ocorreram respostas muito
rápidas em questões com múltiplas condições."*

## 12. Classificação dos erros

Por critério ignorado: preço · peso · volume · validade · lactose · glúten · açúcar · conservação ·
ingrediente · alergênico · confundiu unidade · escolheu o maior em vez do menor · atendeu só
parcialmente · erro de leitura direta · resposta muito rápida · resposta muito demorada.

```json
{ "questionId": "q-018", "questionType": "twoConditions",
  "requiredFields": ["content", "price"], "correctProductId": "product-55",
  "selectedProductId": "product-56", "attempt": 1,
  "ignoredConditions": ["productType"], "matchedConditions": ["content"],
  "errorCategory": "partialConditionMatch", "responseTimeMs": 8200, "usedPackageZoom": false }
```

## 13. Tentativas

Registrar separadamente acerto na 1ª tentativa · acerto após feedback · erro após a 2ª. Acerto na
1ª pesa mais; acerto após feedback mostra aprendizagem mas não equivale; erro após a 2ª pode gerar
redução. Sem pontuação visível ao paciente.

## 14. Uso da ampliação

Registrar se abriu, quantas vezes, tempo total, se acertou depois, se abriu vários produtos e se a
questão era de leitura direta ou de quadro. **Zoom não é erro** e não penaliza.

## 15–16. Continuidade e calibração

Salvar ao fim: nível inicial e final · maior nível · **último nível estável** · perfil final ·
acurácia · acertos na 1ª · erros após feedback · tempo mediano · campos com mais erros · tipos mais
difíceis · nº de ampliações · data.
Na sessão seguinte: começar no **último nível estável** (nunca do 1, nunca no pico não consolidado),
confirmar nas 2 primeiras questões sem avisar o paciente, preservar preferências e acessibilidade.
Intervalo longo entre sessões: redução cautelosa de **uma** dimensão, sem apagar histórico.

## 17. Duração

Preservar a estrutura existente. Por tempo: não interromper questão no meio — termina a atual e
encerra. Por quantidade: manter o número definido, sem questões extras por causa da adaptação.

## 18. Composição da sessão

~20% consolidação (mesma habilidade, um pouco mais fácil) · ~60% no nível atual · ~20% desafio
(uma dimensão acima). Sem desafio quando houver sequência recente de erros.

## 19–21. Relatório do profissional

Data e duração · nível inicial/final/maior/último estável · total de questões · acertos · acertos na
1ª · acertos após feedback · erros finais · precisão · tempo mediano · nº de ampliações ·
desempenho **por tipo de pergunta** · desempenho **por campo** · erros mais frequentes · mudanças de
dificuldade · questões descartadas na validação. Nunca só uma pontuação.

Por campo: `| Campo | Questões | Acertos iniciais | Acertos após feedback | Erros |` + % de acerto,
tempo mediano e quantas vezes o campo foi ignorado.

Por tipo: `{"twoConditions": {"presented":5,"firstAttemptCorrect":2,"correctAfterFeedback":2,"finalErrors":1,"medianResponseTimeMs":14300}}`

## 22. Linguagem

Descritiva: *"Apresentou mais erros em questões que combinavam preço e quantidade."* ·
*"Necessitou de feedback em três questões com duas condições."* ·
*"Utilizou a ampliação em quatro questões."*
**Proibido:** "déficit de atenção", "TDAH", "prejuízo executivo", "é impulsivo", "transtorno de
memória". O relatório não é avaliação diagnóstica.

## 23–24. Histórico e o que o paciente vê

Histórico longitudinal simples por sessão (data, nível estável, precisão, acerto inicial, tempo
mediano, campos difíceis). Sem gráfico complexo, sem comparar pacientes, sem ranking.
Ao paciente: só sessão concluída, quantas atividades e mensagem breve. Nada de classificação,
rótulo de dificuldade, "você regrediu", pontuação, moedas, troféus ou estrelas.

## 25. Controles do profissional

Nível inicial · adaptação automática on/off · nível máximo · tipos de pergunta permitidos ·
leitura direta on/off · duração ou quantidade · ver relatório · reiniciar progressão só por ação
explícita. Nada disso aparece para o paciente.

## 26. Registro das alterações

```json
{ "timestamp": "2026-08-02T10:30:00", "questionIndex": 6, "direction": "increase",
  "dimension": "visibleFieldCount", "from": 4, "to": 5, "reason": "stablePerformance" }
```
E também quando a mudança foi **bloqueada**:
```json
{ "direction": "increase", "dimension": "requiredConditionCount", "blocked": true, "reason": "recentLevelChange" }
```

## 27. Privacidade

Sem texto desnecessário ou dado pessoal nos eventos; usar IDs internos; nunca o nome completo em
log técnico; respeitar autenticação e permissões; relatório individual só para o profissional
autorizado.

## 28. Validação antes de adaptar

(1) há dados suficientes (2) a mudança não ocorreu há pouco (3) a próxima questão tem dados válidos
(4) só uma dimensão muda (5) acessibilidade preservada (6) exatamente uma resposta correta
(7) produtos coerentes (8) sem repetição (9) respeita o limite do profissional.
Falhou: mantém a dificuldade, registra o motivo, gera outra questão.

## 29. Testes obrigatórios

3 acertos → avanço · só uma dimensão muda · erro isolado não regride · 2 erros em 3 → regressão ·
bloqueio de oscilação · continuidade entre sessões · início no último estável · acerto após feedback
separado · classificação do critério ignorado · zoom registrado · mediana correta · resposta rápida
não vira "superior" · limite do profissional · adaptação desativada · questão inválida não exibida ·
relatório correto · ausência de linguagem diagnóstica · permissão de acesso.

## 30. Simulações de perfil

- **A. Alto desempenho** → progressão gradual, uma dimensão por vez, sem salto.
- **B. Oscilante** → mantém o nível, sem sobe-desce constante.
- **C. Dificuldade persistente** → reduz uma dimensão, consolida, não reinicia.
- **D. Rápido e incorreto** → registra possível resposta impulsiva, sem diagnóstico, mantém ou reduz.
- **E. Usa muito a ampliação** → registra sem penalizar, análise separada na leitura direta.

## 31. Critérios de aceitação

(1) adapta ao desempenho (2) uma dimensão por vez (3) 3 acertos estáveis sobem (4) 2 erros em 3
regridem (5) erro isolado não regride (6) sem oscilação (7) 1ª tentativa separada do pós-feedback
(8) erros classificados por condição (9) tempo registrado (10) zoom sem penalização (11) último
nível estável salvo (12) próxima sessão continua (13) profissional pode limitar (14) relatório por
campo (15) relatório por tipo (16) sem diagnóstico (17) sem gamificação (18) questão inválida
bloqueada (19) acessibilidade e responsividade preservadas (20) testes e simulações aprovados.

## 32. Entrega final

arquivos modificados · mecanismo adaptativo · dimensões · regras de avanço · regras de regressão ·
anti-oscilação · continuidade entre sessões · eventos registrados · classificação dos erros ·
estrutura do relatório · controles do profissional · testes · simulações · resultados · limitações ·
pendências manuais.
