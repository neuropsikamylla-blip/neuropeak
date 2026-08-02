# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 02/08/2026 01:02
Quero implementar a FASE 3 do exercício existente “Informação em Foco”.

As fases anteriores devem estar concluídas:

FASE 1:
- catálogo central corrigido;
- atributos coerentes;
- unidades corretas;
- correspondência entre imagens e produtos;
- validação das questões;
- progresso corrigido.

FASE 2:
- cartões com imagem e quadro funcional;
- ampliação das embalagens;
- tipos variados de pergunta;
- situações do cotidiano;
- feedback por tentativa;
- regras contra repetição;
- responsividade e acessibilidade.

A FASE 3 deve implementar:

1. dificuldade adaptativa;
2. progressão e regressão controladas;
3. registro detalhado dos erros;
4. continuidade entre sessões;
5. relatório de desempenho para o profissional;
6. testes completos do mecanismo adaptativo.

NÃO recrie o exercício.
NÃO crie uma segunda versão.
NÃO altere novamente o catálogo dos produtos.
NÃO substitua imagens.
NÃO modifique marcas, pesos, volumes ou atributos fixos.
NÃO altere o padrão visual aprovado na Fase 2.
NÃO transforme o exercício em jogo com pontos, moedas, troféus ou premiações.
NÃO realizar diagnóstico automático.

==================================================
1. OBJETIVO DA FASE 3
==================================================

A dificuldade deve se ajustar ao desempenho do paciente sem provocar mudanças bruscas.

O sistema deve observar:

- acerto ou erro;
- acerto na primeira tentativa;
- quantidade de tentativas;
- tempo de resposta;
- tipo de pergunta;
- quantidade de condições;
- campos envolvidos;
- uso da ampliação da embalagem;
- condição ignorada no erro;
- nível de ajuda necessário;
- sequência recente de desempenho.

A adaptação deve ocorrer pela complexidade cognitiva da tarefa, e não por:

- fonte menor;
- baixo contraste;
- imagens menores;
- excesso de informações desorganizadas;
- alternativas absurdas;
- redução da acessibilidade.

==================================================
2. PRESERVAR A ESTRUTURA EXISTENTE
==================================================

Antes de implementar, identifique:

- sistema atual de níveis;
- armazenamento de progresso;
- estrutura de sessão;
- quantidade de questões por sessão;
- regras atuais de avanço;
- dados já registrados;
- relatórios existentes.

Utilize a estrutura existente sempre que ela for adequada.

Não criar um segundo sistema de níveis concorrente.

Caso existam regras antigas incompatíveis com esta fase, refatore-as de forma centralizada e informe as alterações ao final.

==================================================
3. DIMENSÕES DE DIFICULDADE
==================================================

A dificuldade deve ser controlada por dimensões independentes.

A. QUANTIDADE DE PRODUTOS

Mais fácil:
- 3 produtos.

Mais difícil:
- 4 produtos.

Não aumentar além de 4 sem validação clínica específica, pois o excesso pode prejudicar a legibilidade.

B. QUANTIDADE DE CAMPOS VISÍVEIS

Mais fácil:
- 3 campos.

Intermediário:
- 4 ou 5 campos.

Mais difícil:
- 5 ou 6 campos.

C. QUANTIDADE DE CONDIÇÕES

Mais fácil:
- uma condição.

Intermediário:
- duas condições.

Mais difícil:
- três condições.

D. SEMELHANÇA DOS DISTRATORES

Mais fácil:
- distratores claramente diferentes.

Intermediário:
- um distrator atende parcialmente ao pedido.

Mais difícil:
- todos os distratores atendem a pelo menos uma condição;
- apenas um atende ao conjunto completo.

E. TIPO DE QUESTÃO

Progressão sugerida:

1. localização direta;
2. comparação simples;
3. duas condições;
4. validade ou conservação;
5. situação do cotidiano;
6. ingredientes ou alergênicos;
7. três condições;
8. leitura direta da embalagem.

F. ORGANIZAÇÃO DOS CAMPOS

Mais fácil:
- campos em posições estáveis.

Intermediário:
- pequena variação controlada.

Mais difícil:
- ordem variável, mas ainda organizada.

Não embaralhar os campos de forma caótica.

G. PROXIMIDADE DOS VALORES

Mais fácil:

- 100 g;
- 500 g;
- 1 kg.

Mais difícil:

- 400 g;
- 450 g;
- 500 g;
- 550 g.

Os valores devem continuar plausíveis e compatíveis com os produtos.

H. COMPLEXIDADE DA SITUAÇÃO

Mais fácil:
- contexto curto;
- uma condição.

Intermediário:
- duas condições.

Mais difícil:
- até três condições.

Não dificultar criando textos longos.

==================================================
4. ALTERAR APENAS UMA DIMENSÃO POR VEZ
==================================================

Ao aumentar a dificuldade, não modificar simultaneamente:

- número de produtos;
- número de campos;
- quantidade de condições;
- semelhança dos distratores;
- tipo de pergunta.

Aumentar somente uma dimensão por etapa.

Exemplo correto:

Antes:
- 3 produtos;
- 4 campos;
- uma condição.

Depois:
- 3 produtos;
- 4 campos;
- duas condições.

Exemplo inadequado:

Antes:
- 3 produtos;
- 3 campos;
- uma condição.

Depois:
- 4 produtos;
- 6 campos;
- três condições;
- leitura direta da embalagem.

Mudanças bruscas não permitem identificar qual fator provocou o erro.

==================================================
5. REGRA DE PROGRESSÃO
==================================================

Utilizar como referência principal:

- 3 acertos consecutivos permitem avanço;
- o avanço deve ocorrer em apenas uma dimensão;
- priorizar acertos na primeira tentativa;
- não avançar apenas porque o paciente acertou depois de várias tentativas;
- não avançar quando os acertos forem excessivamente demorados em relação ao próprio padrão recente.

Regra sugerida:

Avançar uma etapa quando houver:

- 3 acertos consecutivos;
- pelo menos 2 desses acertos na primeira tentativa;
- ausência de erro crítico nas últimas 3 questões;
- desempenho estável no nível atual.

Erro crítico:

- selecionar opção que não atende a nenhuma condição;
- ignorar repetidamente a mesma condição;
- responder de forma impulsiva em tempo extremamente curto;
- errar mesmo após o feedback processual.

Não utilizar apenas tempo como critério de avanço.

==================================================
6. REGRA DE REGRESSÃO
==================================================

Reduzir uma dimensão quando houver:

- 2 erros nas últimas 3 questões;
- 3 erros no mesmo bloco;
- repetição do mesmo tipo de erro;
- incapacidade de integrar duas ou três condições;
- necessidade frequente de segunda tentativa.

Ao reduzir:

- alterar somente uma dimensão;
- preservar os demais parâmetros;
- retornar à última configuração estável;
- não reiniciar a sessão;
- não mostrar ao paciente mensagens como “você voltou de nível”.

A interface deve continuar neutra.

==================================================
7. EVITAR OSCILAÇÃO DE NÍVEL
==================================================

Implemente uma regra de estabilidade para evitar:

avança → erra → volta → acerta → avança.

Use histerese adaptativa.

Exemplo:

- após avançar, manter a nova configuração por pelo menos 2 questões válidas;
- não regredir por apenas um erro isolado;
- depois de regressão, exigir nova sequência estável antes de avançar;
- registrar o motivo de cada mudança.

Cada alteração deve gerar um registro semelhante a:

{
  "fromLevel": 3,
  "toLevel": 4,
  "changedDimension": "requiredConditions",
  "previousValue": 1,
  "newValue": 2,
  "reason": "threeConsecutiveCorrect",
  "questionIndex": 6
}

==================================================
8. PERFIL DE DIFICULDADE
==================================================

Não representar dificuldade apenas por um número único.

Criar um perfil semelhante a:

{
  "level": 4,
  "productCount": 4,
  "visibleFieldCount": 5,
  "requiredConditionCount": 2,
  "distractorSimilarity": "moderate",
  "fieldOrderVariation": "controlled",
  "dailySituationEnabled": true,
  "directPackageReadingEnabled": false
}

O número do nível pode permanecer para a interface interna, mas o sistema precisa conhecer quais dimensões estão ativas.

==================================================
9. CONFIGURAÇÃO SUGERIDA DE PROGRESSÃO
==================================================

Utilize esta progressão como referência, adaptando-a ao sistema atual.

NÍVEL 1

- 3 produtos;
- 3 campos;
- uma condição;
- localização direta;
- distratores claramente diferentes;
- campos em posição estável.

NÍVEL 2

- 3 produtos;
- 4 campos;
- uma condição;
- localização e comparação simples;
- valores moderadamente próximos.

NÍVEL 3

- 3 produtos;
- 4 campos;
- duas condições;
- um distrator parcialmente correto.

NÍVEL 4

- 4 produtos;
- 4 ou 5 campos;
- duas condições;
- distratores semanticamente semelhantes.

NÍVEL 5

- 4 produtos;
- 5 campos;
- situações do cotidiano com duas condições;
- variação controlada dos campos.

NÍVEL 6

- 4 produtos;
- 5 ou 6 campos;
- validade, conservação, ingredientes ou alergênicos;
- distratores que atendem parcialmente às condições.

NÍVEL 7

- 4 produtos;
- 5 ou 6 campos;
- três condições;
- situações funcionais;
- valores mais próximos.

NÍVEL 8

- 4 produtos;
- até 6 campos;
- combinação de modalidades;
- leitura direta da embalagem autorizada;
- três condições;
- distratores de alta semelhança.

Não utilizar leitura direta da embalagem como requisito permanente em todas as questões do nível mais alto.

==================================================
10. TEMPO DE RESPOSTA
==================================================

Registrar o tempo de resposta, mas não utilizá-lo isoladamente para determinar desempenho.

Registrar:

- tempo até a primeira seleção;
- tempo total da questão;
- tempo gasto no modal de ampliação;
- tempo após receber feedback;
- mediana de tempo da sessão.

Evitar média simples quando houver valores extremos.

Utilizar preferencialmente:

- mediana;
- faixa interquartil;
- comparação com o próprio histórico do paciente.

Não comparar automaticamente o paciente com outros usuários.

Não considerar resposta muito rápida como desempenho superior sem verificar acerto e impulsividade.

==================================================
11. DETECÇÃO DE RESPOSTA IMPULSIVA
==================================================

Registrar como possível resposta impulsiva quando:

- a seleção ocorre em tempo extremamente curto;
- a questão possui duas ou três condições;
- a alternativa escolhida atende somente à primeira condição;
- o paciente ignora os outros campos.

Não classificar automaticamente o paciente como impulsivo.

Registrar apenas:

possibleImpulsiveResponse: true

O relatório deve usar linguagem descritiva:

“Ocorreram respostas muito rápidas em questões com múltiplas condições.”

Não utilizar linguagem diagnóstica.

==================================================
12. CLASSIFICAÇÃO DOS ERROS
==================================================

Cada erro deve ser classificado conforme o critério ignorado.

Exemplos:

- ignorou preço;
- ignorou peso;
- ignorou volume;
- ignorou validade;
- ignorou lactose;
- ignorou glúten;
- ignorou açúcar;
- ignorou conservação;
- ignorou ingrediente;
- ignorou alergênico;
- confundiu unidade;
- escolheu o maior em vez do menor;
- escolheu opção que atendia apenas parcialmente;
- erro de leitura direta da embalagem;
- resposta extremamente rápida;
- resposta após tempo prolongado.

Exemplo de registro:

{
  "questionId": "q-018",
  "questionType": "twoConditions",
  "requiredFields": [
    "content",
    "price"
  ],
  "correctProductId": "product-55",
  "selectedProductId": "product-56",
  "attempt": 1,
  "ignoredConditions": [
    "productType"
  ],
  "matchedConditions": [
    "content"
  ],
  "errorCategory": "partialConditionMatch",
  "responseTimeMs": 8200,
  "usedPackageZoom": false
}

==================================================
13. PRIMEIRA E SEGUNDA TENTATIVA
==================================================

Registrar separadamente:

- acerto na primeira tentativa;
- acerto após feedback;
- erro após segunda tentativa.

Para adaptação:

- acerto na primeira tentativa tem maior peso;
- acerto após feedback demonstra aprendizagem, mas não deve ser tratado como desempenho idêntico;
- erro após segunda tentativa pode gerar redução de dificuldade.

Não utilizar pontuação visível para o paciente.

==================================================
14. USO DA AMPLIAÇÃO
==================================================

Registrar:

- se abriu a imagem;
- quantas vezes abriu;
- tempo total de ampliação;
- se acertou depois da ampliação;
- se abriu imagens de vários produtos;
- se a questão era de leitura direta ou quadro funcional.

O uso do zoom não deve ser considerado erro.

Em questões de leitura direta da embalagem, utilizar a ampliação pode ser uma estratégia adequada.

Não penalizar automaticamente.

==================================================
15. CONTINUIDADE ENTRE SESSÕES
==================================================

Salvar ao final da sessão:

- nível inicial;
- nível final;
- maior nível alcançado;
- último nível estável;
- perfil de dificuldade final;
- acurácia;
- acertos na primeira tentativa;
- erros após feedback;
- tempo mediano;
- campos com mais erros;
- tipos de pergunta com mais dificuldade;
- quantidade de ampliações;
- data da sessão.

Na sessão seguinte:

- iniciar do último nível estável ou da regra de continuidade já existente;
- não reiniciar automaticamente no nível 1;
- não iniciar diretamente no pico mais alto se ele não foi consolidado;
- preservar as preferências e acessibilidade.

Utilizar uma questão inicial de calibração apenas quando necessário.

==================================================
16. CALIBRAÇÃO NO INÍCIO DA SESSÃO
==================================================

Quando houver histórico recente:

- iniciar no nível estável anterior;
- usar as primeiras 2 questões para confirmar a adequação;
- não apresentar mensagem de “teste de nível” ao paciente.

Quando não houver histórico:

- iniciar no nível inicial definido pelo profissional ou no padrão do exercício.

Quando houver longo intervalo entre sessões:

- permitir uma redução cautelosa de uma dimensão;
- não apagar o histórico;
- não voltar automaticamente ao nível mais baixo.

==================================================
17. DURAÇÃO DA SESSÃO
==================================================

Preservar a duração e a quantidade de questões já configuradas.

Caso o exercício funcione por tempo:

- não interromper uma questão no meio;
- finalizar a questão atual antes de encerrar;
- calcular progresso com base na estrutura existente.

Caso funcione por quantidade:

- preservar a quantidade definida;
- não adicionar questões extras por causa da adaptação.

A adaptação deve ocorrer dentro da sessão existente.

==================================================
18. COMPOSIÇÃO ADAPTATIVA DA SESSÃO
==================================================

Manter variedade.

Mesmo em níveis altos, não usar apenas questões difíceis.

Sugestão para uma sessão:

- aproximadamente 20% de consolidação;
- aproximadamente 60% no nível atual;
- aproximadamente 20% de desafio controlado.

Questões de consolidação:

- mesma habilidade;
- complexidade ligeiramente menor.

Questões de desafio:

- apenas uma dimensão acima.

Não usar desafio quando o paciente apresentar sequência recente de erros.

==================================================
19. RELATÓRIO PARA O PROFISSIONAL
==================================================

Criar ou atualizar uma tela de relatório da sessão.

Apresentar:

- data e duração;
- nível inicial e final;
- maior nível alcançado;
- último nível estável;
- total de questões;
- acertos;
- acertos na primeira tentativa;
- acertos após feedback;
- erros finais;
- precisão geral;
- tempo mediano;
- quantidade de ampliações;
- desempenho por tipo de pergunta;
- desempenho por campo;
- erros mais frequentes;
- mudanças de dificuldade;
- questões descartadas pela validação.

Não mostrar somente uma pontuação geral.

==================================================
20. DESEMPENHO POR CAMPO
==================================================

Apresentar uma tabela semelhante:

| Campo | Questões | Acertos iniciais | Acertos após feedback | Erros |
|------|----------|------------------|------------------------|-------|
| Peso | 5 | 4 | 1 | 0 |
| Preço | 4 | 2 | 1 | 1 |
| Validade | 3 | 1 | 1 | 1 |
| Lactose | 2 | 2 | 0 | 0 |

Também apresentar:

- percentual de acerto;
- tempo mediano;
- quantidade de vezes que o campo foi ignorado.

Não interpretar automaticamente os resultados como déficit cognitivo.

==================================================
21. DESEMPENHO POR TIPO DE QUESTÃO
==================================================

Registrar separadamente:

- localização direta;
- comparação;
- duas condições;
- três condições;
- situação do cotidiano;
- validade;
- conservação;
- ingredientes;
- alergênicos;
- leitura da embalagem.

Exemplo:

{
  "twoConditions": {
    "presented": 5,
    "firstAttemptCorrect": 2,
    "correctAfterFeedback": 2,
    "finalErrors": 1,
    "medianResponseTimeMs": 14300
  }
}

==================================================
22. LINGUAGEM DO RELATÓRIO
==================================================

Usar linguagem descritiva.

Exemplos adequados:

- “Apresentou maior número de erros em questões que combinavam preço e quantidade.”
- “Necessitou de feedback em três questões com duas condições.”
- “O tempo de resposta foi maior em tarefas de validade.”
- “Utilizou a ampliação da embalagem em quatro questões.”

Não utilizar:

- “possui déficit de atenção”;
- “apresenta TDAH”;
- “tem prejuízo executivo”;
- “é impulsivo”;
- “possui transtorno de memória”.

O relatório do exercício não constitui avaliação diagnóstica.

==================================================
23. VISUALIZAÇÃO DO HISTÓRICO
==================================================

Criar histórico longitudinal simples.

Mostrar por sessão:

- data;
- nível estável;
- precisão;
- acerto inicial;
- tempo mediano;
- campos com maior dificuldade.

Evitar gráficos excessivamente complexos.

Não comparar pacientes entre si.

Não utilizar ranking.

==================================================
24. DADOS PARA O PACIENTE
==================================================

Ao paciente, mostrar apenas feedback neutro e funcional.

Pode mostrar:

- sessão concluída;
- quantidade de atividades realizadas;
- mensagem breve de encerramento.

Não mostrar:

- classificação clínica;
- comparação com outros pacientes;
- rótulos de dificuldade;
- “você regrediu”;
- “desempenho ruim”;
- pontuação competitiva;
- moedas;
- troféus;
- estrelas.

==================================================
25. CONTROLE DO PROFISSIONAL
==================================================

Permitir ao profissional:

- definir nível inicial;
- manter adaptação automática ativa ou inativa;
- limitar nível máximo;
- limitar tipos de pergunta;
- habilitar ou desabilitar leitura direta da embalagem;
- selecionar duração ou quantidade, conforme estrutura existente;
- visualizar relatório;
- reiniciar progressão somente por ação explícita.

Não mostrar esses controles ao paciente.

==================================================
26. REGISTRO DAS ALTERAÇÕES ADAPTATIVAS
==================================================

Salvar cada alteração:

{
  "timestamp": "2026-08-02T10:30:00",
  "questionIndex": 6,
  "direction": "increase",
  "dimension": "visibleFieldCount",
  "from": 4,
  "to": 5,
  "reason": "stablePerformance"
}

Registrar também quando uma alteração foi considerada, mas bloqueada:

{
  "direction": "increase",
  "dimension": "requiredConditionCount",
  "blocked": true,
  "reason": "recentLevelChange"
}

==================================================
27. PRIVACIDADE E SEGURANÇA DOS DADOS
==================================================

Não registrar textos desnecessários ou informações pessoais dentro dos eventos de desempenho.

Utilizar IDs internos.

Não incluir nome completo do paciente em logs técnicos.

Respeitar o sistema de autenticação e permissões já existente.

Relatórios individuais devem ser acessíveis somente ao profissional autorizado.

==================================================
28. VALIDAÇÃO DA ADAPTAÇÃO
==================================================

Antes de aplicar uma mudança, validar:

1. se há dados suficientes;
2. se a mudança não ocorreu recentemente;
3. se a questão seguinte possui dados válidos;
4. se apenas uma dimensão será modificada;
5. se a mudança preserva acessibilidade;
6. se existe exatamente uma resposta correta;
7. se os produtos são coerentes;
8. se não haverá repetição;
9. se o novo perfil respeita o limite definido pelo profissional.

Se a validação falhar:

- manter a dificuldade;
- registrar o motivo;
- gerar outra questão.

==================================================
29. TESTES OBRIGATÓRIOS
==================================================

Criar testes para:

- 3 acertos consecutivos causando avanço;
- apenas uma dimensão sendo alterada;
- um erro isolado não causando regressão;
- 2 erros em 3 questões causando regressão;
- bloqueio de oscilação;
- continuidade entre sessões;
- início no último nível estável;
- acerto após feedback registrado separadamente;
- classificação do critério ignorado;
- uso do zoom registrado;
- tempo mediano calculado corretamente;
- resposta rápida não sendo tratada automaticamente como superior;
- limite máximo definido pelo profissional;
- adaptação desativada;
- questão inválida não sendo exibida;
- relatório calculado corretamente;
- ausência de linguagem diagnóstica;
- permissão de acesso ao relatório.

==================================================
30. SIMULAÇÕES AUTOMATIZADAS
==================================================

Crie simulações de perfis de desempenho.

PERFIL A — ALTO DESEMPENHO

- respostas corretas;
- maioria na primeira tentativa;
- tempos estáveis.

Resultado esperado:

- progressão gradual;
- apenas uma dimensão por vez;
- sem saltos.

PERFIL B — DESEMPENHO OSCILANTE

- acertos e erros alternados.

Resultado esperado:

- manutenção do nível;
- ausência de avanço e regressão constantes.

PERFIL C — DIFICULDADE PERSISTENTE

- 2 erros em 3 questões;
- erros no mesmo critério.

Resultado esperado:

- redução de uma dimensão;
- questões de consolidação;
- sem reiniciar a sessão.

PERFIL D — RESPOSTAS MUITO RÁPIDAS E INCORRETAS

Resultado esperado:

- registro de possível resposta impulsiva;
- ausência de diagnóstico;
- manutenção ou redução controlada.

PERFIL E — USO FREQUENTE DE AMPLIAÇÃO

Resultado esperado:

- registro do uso;
- ausência de penalização automática;
- análise separada em leitura direta da embalagem.

==================================================
31. CRITÉRIOS DE ACEITAÇÃO
==================================================

A Fase 3 estará concluída quando:

1. a dificuldade se adaptar ao desempenho;
2. apenas uma dimensão mudar por vez;
3. três acertos estáveis permitirem avanço;
4. dois erros em três questões permitirem regressão controlada;
5. um erro isolado não provocar regressão;
6. não houver oscilação constante;
7. acerto inicial e acerto após feedback forem separados;
8. erros forem classificados por condição;
9. tempo de resposta for registrado corretamente;
10. uso da ampliação for registrado sem penalização;
11. o último nível estável for salvo;
12. a próxima sessão continuar adequadamente;
13. o profissional puder limitar a adaptação;
14. o relatório mostrar desempenho por campo;
15. o relatório mostrar desempenho por tipo;
16. não houver diagnóstico automático;
17. não houver ranking ou gamificação;
18. questões inválidas continuarem bloqueadas;
19. acessibilidade e responsividade forem preservadas;
20. todos os testes e simulações forem aprovados.

==================================================
32. ENTREGA FINAL
==================================================

Ao concluir, apresente:

1. arquivos modificados;
2. mecanismo adaptativo criado;
3. dimensões de dificuldade;
4. regras de avanço;
5. regras de regressão;
6. mecanismo contra oscilação;
7. estrutura de continuidade entre sessões;
8. eventos registrados;
9. classificação dos erros;
10. estrutura do relatório;
11. controles disponíveis ao profissional;
12. testes executados;
13. simulações executadas;
14. resultados dos testes;
15. limitações encontradas;
16. pendências manuais.

Não considere a Fase 3 concluída apenas por criar níveis numerados.

É obrigatório implementar:

- adaptação por dimensão;
- estabilidade;
- classificação dos erros;
- continuidade entre sessões;
- relatório profissional;
- controles clínicos;
- testes e simulações.

## 02/08/2026 08:49
Estamos no caminho certo. Continue exclusivamente a Fase 1.
Não implemente ainda nenhuma parte visual da Fase 2 e nem a adaptação da Fase 3.
Quero primeiro estabilizar completamente o motor do exercício.
Continue a F1.3 seguindo estas diretrizes:
Conclua todos os geradores de questões utilizando exclusivamente os dados oficiais do catálogo, nunca informações sorteadas ou texto extraído das imagens.
Implemente os seguintes geradores:
Localização direta
Comparação
Duas condições
Três condições
Validade
Conservação
Ingredientes
Alergênicos
Situação do cotidiano (quando os dados do catálogo permitirem)
Importante
Não quero que exista um sistema de pontuação ou pesos fixos de tipos de pergunta.
Este é um treino cognitivo clínico, não um jogo.
O objetivo é treinar funções cognitivas como:
atenção seletiva;
atenção sustentada;
leitura funcional;
velocidade de processamento;
memória de trabalho;
controle inibitório.
A dificuldade deve aumentar apenas pela complexidade cognitiva da tarefa, nunca por um sistema de pontuação.
Exemplo:
Nível inicial:
localizar uma informação.
Nível intermediário:
comparar informações.
Nível avançado:
integrar duas ou três condições simultaneamente.
A função cognitiva treinada permanece a mesma; apenas aumenta a carga cognitiva.
Organização dos geradores
Quero que os geradores sejam independentes da dificuldade.
Cada gerador deve apenas saber construir corretamente uma questão.
A dificuldade será controlada depois por parâmetros como:
quantidade de produtos;
quantidade de campos visíveis;
número de condições;
semelhança entre distratores;
proximidade dos valores;
necessidade de integrar informações.
Não quero um gerador diferente para cada nível.
Quero um único gerador parametrizado.
Validação obrigatória
Antes de qualquer questão ser exibida, validar obrigatoriamente:
os produtos pertencem à categoria correta;
todos os atributos vêm do catálogo;
as unidades são compatíveis;
existe exatamente uma resposta correta;
os distratores são plausíveis;
não há atributos incompatíveis;
a pergunta não foi utilizada recentemente;
a situação do cotidiano corresponde aos produtos apresentados.
Se qualquer validação falhar:
descartar a questão;
gerar outra automaticamente.
Testes
Depois de concluir os geradores, execute pelo menos:
500 sessões simuladas por nível;
milhares de questões geradas automaticamente;
validar que nunca ocorram situações como:
chá com lactose;
lasanha sabor chocolate;
leite em gramas;
azeite em gramas;
duas respostas corretas;
nenhuma resposta correta;
produtos incompatíveis;
repetição excessiva da mesma pergunta.
Antes de iniciar a Fase 2
Quando a F1.3 estiver concluída, me entregue:
arquitetura final do gerador;
tipos de questões implementados;
regras de validação;
cobertura dos testes;
exemplos reais de questões geradas automaticamente;
confirmação de que todo o exercício já utiliza o novo gerador, e não mais o sistema antigo.
Somente depois dessa validação iniciaremos a Fase 2.

## 02/08/2026 09:52
dei uma olhada agora e parece que está ok, não testei ela inteira, mas pare ok! podemos ir para fase 2
