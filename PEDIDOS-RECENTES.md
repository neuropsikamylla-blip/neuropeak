# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 16:23
PROPOSTA ARQUITETÔNICA — SESSÃO COMO UNIDADE PRINCIPAL

Não implementar ainda.

Quero primeiro uma análise arquitetônica completa, baseada no código real e nos documentos atuais da prescrição.

A nova direção conceitual é esta:

==================================================
1. PRINCÍPIO CENTRAL
==================================================

A unidade clínica principal da prescrição passa a ser a SESSÃO.

O terapeuta define:

- duração da sessão;
- exercícios;
- ordem;
- protocolo de cada exercício;
- frequência semanal.

O sistema não escolhe automaticamente quais exercícios ficam em Breve, Padrão ou Estendido.

Essa decisão continua sendo do terapeuta, porque depende:

- do objetivo clínico;
- da tolerância do paciente;
- da fadiga observada;
- da evolução;
- da prioridade daquele exercício;
- do julgamento profissional.

O sistema deve:

- calcular;
- resumir;
- alertar;
- mostrar consequências da composição;

mas não substituir a decisão clínica.

==================================================
2. DURAÇÕES DA SESSÃO
==================================================

A duração da sessão passa a funcionar por faixas-alvo.

BREVE

- alvo: 20 minutos;
- faixa esperada: 18–22 minutos.

PADRÃO

- alvo: 35 minutos;
- faixa esperada: 32–38 minutos.

EXTENSO

- alvo: 50 minutos;
- faixa esperada: 46–54 minutos.

Essas faixas representam variação natural entre pacientes.

Não gerar alerta quando a estimativa permanecer dentro da faixa esperada.

Acima da faixa:

- gerar observação ou revisão consultiva;
- nunca bloquear salvamento.

Abaixo da faixa:

- informar discretamente;
- não considerar automaticamente inadequado;
- o terapeuta pode deliberadamente prescrever uma sessão menor.

==================================================
3. PROTOCOLOS DOS EXERCÍCIOS
==================================================

Cada exercício continua possuindo:

- Breve;
- Padrão;
- Estendido.

O terapeuta escolhe manualmente o protocolo de cada exercício.

O sistema não redistribui doses automaticamente.

O sistema não troca protocolos sem ação explícita.

O protocolo Breve precisa continuar sendo uma dose válida de treino.

Ele não pode existir apenas para “fazer caber” a sessão.

Reavaliar, em fase posterior, se as unidades internas de cada Breve realmente constituem dose mínima clinicamente útil.

Não recalibrar agora.

==================================================
4. TEMPO INDIVIDUAL DOS EXERCÍCIOS
==================================================

A duração estimada individual deixa de ocupar a linha principal do card.

Na visualização compacta do exercício, mostrar prioritariamente:

- nome;
- protocolo selecionado;
- carga;
- fadiga;
- Ajustar;
- remover;
- ordem.

A duração individual permanece disponível em:

- “Ver detalhes”;
- janela “Ajustar”;
- cálculo interno da sessão.

Não apagar nem deixar de calcular o tempo individual.

Apenas reduzir sua prioridade visual.

==================================================
5. CABEÇALHO DA SESSÃO
==================================================

O topo do plano deve futuramente comunicar:

SESSÃO PRESCRITA

Tipo: Padrão

Alvo: 35 min

Estimativa atual: aproximadamente 34 min

Estado: Dentro da faixa esperada

Faixa esperada: 32–38 min

Outro exemplo:

SESSÃO PRESCRITA

Tipo: Padrão

Alvo: 35 min

Estimativa atual: aproximadamente 43 min

Estado: Acima da faixa esperada

A interface deve deixar claro que:

- 35 min é alvo;
- 32–38 min é faixa esperada;
- não é necessário fechar exatamente em 35:00.

==================================================
6. AUTONOMIA DO TERAPEUTA
==================================================

O terapeuta pode deliberadamente:

- manter cinco exercícios em 35 minutos;
- aumentar para 50 minutos;
- utilizar uma sessão focal;
- manter exercícios de alta prioridade;
- aceitar uma estimativa um pouco acima;
- reduzir protocolos conforme tolerância;
- aumentar protocolos conforme evolução.

O sistema deve informar:

- duração;
- carga;
- fadiga;
- interferência;
- composição;

mas não deve decidir sozinho quais exercícios reduzir, remover ou ampliar.

Não criar otimizador automático de protocolos.

Não criar recomendação automática de substituição.

Não criar IA prescritor.

==================================================
7. RELAÇÃO COM O HISTÓRICO DO PACIENTE
==================================================

A arquitetura futura poderá usar dados do paciente para informar o terapeuta, por exemplo:

- queda de desempenho após determinado tempo;
- fadiga relatada;
- aumento de erros no final da sessão;
- estabilidade em sessões mais longas;
- adesão;
- interrupções;
- tempo real de execução.

Mas essas informações devem ser consultivas.

Não implementar isso agora.

A decisão permanece com o profissional.

==================================================
8. ALERTAS
==================================================

Reavaliar os estados de duração atuais considerando as novas faixas:

Breve:
- dentro: 18–22 min.

Padrão:
- dentro: 32–38 min.

Extenso:
- dentro: 46–54 min.

Antes de propor novos limites de atenção ou excesso importante, analisar o impacto sobre:

- SESSION_BELOW_TARGET;
- SESSION_ABOVE_TARGET;
- SESSION_RANGE_PARTIAL;
- SESSION_SAFE_MAX_EXCEEDED;
- tetos de carga;
- mensagens visíveis;
- testes existentes.

Não alterar ainda.

Apenas documentar quais regras precisarão ser revistas.

==================================================
9. COMPATIBILIDADE
==================================================

Preservar:

- planos antigos de 20, 30 e 40 minutos;
- protocolos já salvos;
- doses legadas;
- níveis;
- progresso;
- histórico;
- frequência;
- exercícios;
- ordem;
- modalidade;
- parâmetros assistivos.

Não migrar automaticamente planos antigos para 20/35/50.

A análise deve propor como diferenciar:

- plano legado com duração anterior;
- nova sessão Breve/Padrão/Extenso;
- sessão personalizada, caso necessário.

Não implementar migração.

==================================================
10. ANÁLISE OBRIGATÓRIA
==================================================

Antes de qualquer código, responder:

1. Quais módulos atuais tratam 20/30/40 como duração da sessão.

2. Quais tipos, fórmulas, alertas e testes dependem dessas três durações.

3. Quais partes podem ser reutilizadas sem alteração.

4. Quais partes precisariam ser modificadas para 20/35/50.

5. Como preservar planos antigos sem conversão silenciosa.

6. Como diferenciar protocolo da sessão e protocolo do exercício sem confundir a interface nem os tipos.

7. Se os nomes Breve/Padrão/Extenso em ambos os níveis geram ambiguidade.

8. Se recomenda nomes diferentes para:
   - duração da sessão;
   - dose do exercício.

9. Como o cabeçalho da sessão deveria ser estruturado.

10. Como ocultar a duração individual da linha principal sem perder transparência clínica.

11. Quais arquivos seriam alterados numa futura implementação.

12. Qual seria a ordem segura de implementação.

13. Quais decisões clínicas ainda precisam ser validadas antes do código.

==================================================
11. PONTO CRÍTICO DE NOMENCLATURA
==================================================

Avaliar com atenção se usar:

- Breve / Padrão / Extenso para a sessão;

e simultaneamente:

- Breve / Padrão / Estendido para cada exercício;

pode confundir o terapeuta.

Não renomear ainda.

Apresentar opções claras de nomenclatura.

Exemplo possível:

SESSÃO
- 20 min;
- 35 min;
- 50 min.

DOSE DO EXERCÍCIO
- Breve;
- Padrão;
- Estendida.

Ou outra solução mais clara.

Quero recomendação justificada, não alteração automática.

==================================================
12. BASE DOCUMENTAL
==================================================

Use como referência os documentos atuais da arquitetura de prescrição e o código real.

Não reabra:

- taxonomia cognitiva;
- classificação dos 34 exercícios;
- carga basal;
- fadiga;
- interferência;
- modalidades;
- compatibilidade legada;
- progressão adaptativa.

Esta análise deve se limitar à relação entre:

- duração da sessão;
- dose dos exercícios;
- apresentação do tempo;
- alertas de duração;
- compatibilidade.

==================================================
13. ENTREGA
==================================================

Criar um documento arquitetônico novo, sem alterar os documentos aprovados anteriores.

O documento deve conter:

- diagnóstico do modelo atual;
- nova proposta;
- diferenças entre sessão e exercício;
- alternativas de nomenclatura;
- impacto técnico;
- impacto clínico;
- impacto de UX;
- compatibilidade;
- riscos;
- decisões pendentes;
- ordem segura de implementação.

Não alterar código.

Não alterar interface.

Não alterar banco.

Não criar migration.

Não publicar.

Não iniciar implementação.

Ao final, pare e apresente a análise para validação.

## 04/08/2026 16:38
APROVAÇÃO DO PRIMEIRO PASSO TÉCNICO — DURAÇÃO CONTÍNUA DA SESSÃO

A análise foi validada.

Vamos implementar apenas o primeiro passo técnico isolado: eliminar o arredondamento interno da duração da sessão para 20/30/40 e fazer o motor respeitar exatamente o valor escolhido pelo terapeuta.

Não implementar ainda:

- novos presets 20/35/50;
- nova nomenclatura de sessão;
- redistribuição automática de protocolos;
- alteração dos protocolos dos exercícios;
- recalibração de carga, fadiga ou planejamento;
- mudança visual ampla;
- migração de planos;
- IA prescritor;
- qualquer decisão automática sobre a dose dos exercícios.

==================================================
1. PRINCÍPIO
==================================================

A duração escolhida pelo terapeuta deve ser tratada como valor real da sessão.

Exemplos:

- 26 minutos devem ser tratados como 26;
- 35 minutos devem ser tratados como 35;
- 37 minutos devem ser tratados como 37;
- 45 minutos devem ser tratados como 45;
- 50 minutos devem ser tratados como 50.

Não arredondar para 20, 30 ou 40.

Remover a dependência de `nearestTarget` para a interpretação da duração.

==================================================
2. DURAÇÃO PERSONALIZADA
==================================================

A duração da sessão continua sendo livre dentro dos limites atuais da interface.

Preservar:

- mínimo atual;
- máximo atual;
- planos de 20 minutos;
- planos de 30 minutos;
- planos de 40 minutos;
- qualquer outro valor válido já salvo.

Nenhuma duração deve ser classificada como legada apenas por não ser 20, 30 ou 40.

Não converter valores existentes.

Não alterar o formato persistido.

==================================================
3. FAIXA ESPERADA
==================================================

Criar uma função contínua para derivar a faixa esperada a partir da duração escolhida.

Antes de implementar, apresente a fórmula exata proposta e prove que ela preserva os pontos já aprovados:

- 20 min → 18–22;
- 30 min → 27–33;
- 40 min → 36–44.

A função também deve produzir faixas coerentes para:

- 25;
- 26;
- 35;
- 37;
- 45;
- 50 minutos.

Não usar arredondamento para um alvo vizinho.

A fórmula deve ser simples, determinística e transparente.

Se a solução mais coerente for uma margem percentual de ±10%, documentar explicitamente e mostrar os valores resultantes.

Não inventar regras complexas.

==================================================
4. ESTADOS DE DURAÇÃO
==================================================

Preservar os quatro estados atuais:

- ABAIXO;
- DENTRO;
- ACIMA;
- EXCESSO_IMPORTANTE.

Recalcular os estados usando a duração real escolhida e a faixa derivada para aquele valor.

Não alterar ainda a filosofia dos estados.

Não alterar mensagens visíveis nesta etapa, salvo o necessário para remover referência incorreta a 20/30/40.

==================================================
5. EXCESSO IMPORTANTE
==================================================

Antes de alterar o limite de excesso importante, verificar como ele é calculado atualmente.

A implementação deve preservar o comportamento aprovado nos pontos de 20, 30 e 40 minutos.

Não criar um novo percentual sem documentar.

Apresentar a fórmula final utilizada para:

- limite inferior;
- limite superior da faixa esperada;
- teto seguro;
- excesso importante.

Mostrar exemplos para 20, 25, 30, 35, 40, 45 e 50 minutos.

==================================================
6. CARGA, FADIGA E PLANEJAMENTO
==================================================

Não interpolar automaticamente:

- referência de carga;
- limite de fadiga alta;
- limite de janelas de planejamento.

Essas referências continuam sendo heurísticas clínicas discretas.

Nesta etapa, escolher a estratégia técnica mais conservadora para sessões fora de 20/30/40:

- manter uma referência existente de forma explicitamente provisória; ou
- não emitir esses alertas quando não houver referência clínica aprovada.

Não arredondar silenciosamente a duração para obter essas referências.

Antes de implementar essa parte, documentar qual estratégia será usada e por quê.

Minha preferência é:

- não inventar referência;
- não exibir falsa precisão;
- registrar “referência clínica ainda não definida para esta duração”, se necessário;
- manter o cálculo bruto de carga, fadiga e planejamento disponível.

==================================================
7. COMPATIBILIDADE
==================================================

Garantir que:

- planos antigos abrem normalmente;
- 20/30/40 preservam exatamente o comportamento de duração já aprovado;
- outras durações deixam de ser reinterpretadas como alvo vizinho;
- nenhuma dose de exercício muda;
- nenhum protocolo muda;
- nenhum nível muda;
- nenhum progresso muda;
- nenhuma frequência muda;
- nenhuma modalidade muda;
- nenhuma ordem muda.

==================================================
8. TESTES OBRIGATÓRIOS
==================================================

Criar ou atualizar testes para provar:

1. 26 não é tratado como 30.
2. 35 não é tratado como 30 ou 40.
3. 37 não é tratado como 40.
4. 45 não é tratado como 40.
5. 20 preserva 18–22.
6. 30 preserva 27–33.
7. 40 preserva 36–44.
8. As fronteiras exatas de ABAIXO/DENTRO/ACIMA/EXCESSO_IMPORTANTE funcionam para 25, 35 e 50.
9. Planos antigos continuam abrindo.
10. Nenhum protocolo de exercício é alterado.
11. Nenhuma dose legada é alterada.
12. Nenhum nível ou progresso é alterado.
13. O núcleo continua retornando todos os alertas aplicáveis.
14. Nenhum alerta bloqueia salvamento.
15. TypeScript sem erros.
16. Suíte completa passando.
17. Build passando.

==================================================
9. ESCOPO
==================================================

Pode alterar apenas:

- tipos e funções de duração;
- interpretação da duração da sessão;
- testes correspondentes;
- documentação técnica desta mudança.

Não alterar:

- interface visual;
- banco;
- migrations;
- APIs, salvo necessidade técnica comprovada e explicada antes;
- protocolos;
- doses;
- exercícios;
- carga basal;
- fadiga;
- interferência;
- planejamento;
- progressão;
- experiência do paciente.

==================================================
10. ENTREGA
==================================================

Antes de implementar, apresentar:

1. fórmula proposta;
2. exemplos para 20, 25, 26, 30, 35, 37, 40, 45 e 50;
3. estratégia para carga/fadiga/planejamento fora de 20/30/40;
4. arquivos que serão alterados.

Depois implementar em um lote isolado.

Ao final apresentar:

- arquivos alterados;
- diff resumido;
- testes;
- build;
- provas das fronteiras;
- prova de que 26, 35, 37 e 45 não foram arredondados;
- prova de que 20/30/40 preservaram o comportamento aprovado;
- limitações restantes.

Não publicar automaticamente.

Pare para validação.

## 04/08/2026 16:51
Mande este comando:

```text
APROVAÇÃO DO PRIMEIRO PASSO TÉCNICO — DURAÇÃO CONTÍNUA DA SESSÃO

A análise foi validada.

Vamos implementar apenas o primeiro passo técnico isolado: eliminar o arredondamento interno da duração da sessão para 20/30/40 e fazer o motor respeitar exatamente o valor escolhido pelo terapeuta.

Não implementar ainda:

- novos presets 20/35/50;
- nova nomenclatura de sessão;
- redistribuição automática de protocolos;
- alteração dos protocolos dos exercícios;
- recalibração de carga, fadiga ou planejamento;
- mudança visual ampla;
- migração de planos;
- IA prescritor;
- qualquer decisão automática sobre a dose dos exercícios.

==================================================
1. PRINCÍPIO
==================================================

A duração escolhida pelo terapeuta deve ser tratada como valor real da sessão.

Exemplos:

- 26 minutos devem ser tratados como 26;
- 35 minutos devem ser tratados como 35;
- 37 minutos devem ser tratados como 37;
- 45 minutos devem ser tratados como 45;
- 50 minutos devem ser tratados como 50.

Não arredondar para 20, 30 ou 40.

Remover a dependência de `nearestTarget` para a interpretação da duração.

==================================================
2. DURAÇÃO PERSONALIZADA
==================================================

A duração da sessão continua sendo livre dentro dos limites atuais da interface.

Preservar:

- mínimo atual;
- máximo atual;
- planos de 20 minutos;
- planos de 30 minutos;
- planos de 40 minutos;
- qualquer outro valor válido já salvo.

Nenhuma duração deve ser classificada como legada apenas por não ser 20, 30 ou 40.

Não converter valores existentes.

Não alterar o formato persistido.

==================================================
3. FAIXA ESPERADA
==================================================

Criar uma função contínua para derivar a faixa esperada a partir da duração escolhida.

Antes de implementar, apresente a fórmula exata proposta e prove que ela preserva os pontos já aprovados:

- 20 min → 18–22;
- 30 min → 27–33;
- 40 min → 36–44.

A função também deve produzir faixas coerentes para:

- 25;
- 26;
- 35;
- 37;
- 45;
- 50 minutos.

Não usar arredondamento para um alvo vizinho.

A fórmula deve ser simples, determinística e transparente.

Se a solução mais coerente for uma margem percentual de ±10%, documentar explicitamente e mostrar os valores resultantes.

Não inventar regras complexas.

==================================================
4. ESTADOS DE DURAÇÃO
==================================================

Preservar os quatro estados atuais:

- ABAIXO;
- DENTRO;
- ACIMA;
- EXCESSO_IMPORTANTE.

Recalcular os estados usando a duração real escolhida e a faixa derivada para aquele valor.

Não alterar ainda a filosofia dos estados.

Não alterar mensagens visíveis nesta etapa, salvo o necessário para remover referência incorreta a 20/30/40.

==================================================
5. EXCESSO IMPORTANTE
==================================================

Antes de alterar o limite de excesso importante, verificar como ele é calculado atualmente.

A implementação deve preservar o comportamento aprovado nos pontos de 20, 30 e 40 minutos.

Não criar um novo percentual sem documentar.

Apresentar a fórmula final utilizada para:

- limite inferior;
- limite superior da faixa esperada;
- teto seguro;
- excesso importante.

Mostrar exemplos para 20, 25, 30, 35, 40, 45 e 50 minutos.

==================================================
6. CARGA, FADIGA E PLANEJAMENTO
==================================================

Não interpolar automaticamente:

- referência de carga;
- limite de fadiga alta;
- limite de janelas de planejamento.

Essas referências continuam sendo heurísticas clínicas discretas.

Nesta etapa, escolher a estratégia técnica mais conservadora para sessões fora de 20/30/40:

- manter uma referência existente de forma explicitamente provisória; ou
- não emitir esses alertas quando não houver referência clínica aprovada.

Não arredondar silenciosamente a duração para obter essas referências.

Antes de implementar essa parte, documentar qual estratégia será usada e por quê.

Minha preferência é:

- não inventar referência;
- não exibir falsa precisão;
- registrar “referência clínica ainda não definida para esta duração”, se necessário;
- manter o cálculo bruto de carga, fadiga e planejamento disponível.

==================================================
7. COMPATIBILIDADE
==================================================

Garantir que:

- planos antigos abrem normalmente;
- 20/30/40 preservam exatamente o comportamento de duração já aprovado;
- outras durações deixam de ser reinterpretadas como alvo vizinho;
- nenhuma dose de exercício muda;
- nenhum protocolo muda;
- nenhum nível muda;
- nenhum progresso muda;
- nenhuma frequência muda;
- nenhuma modalidade muda;
- nenhuma ordem muda.

==================================================
8. TESTES OBRIGATÓRIOS
==================================================

Criar ou atualizar testes para provar:

1. 26 não é tratado como 30.
2. 35 não é tratado como 30 ou 40.
3. 37 não é tratado como 40.
4. 45 não é tratado como 40.
5. 20 preserva 18–22.
6. 30 preserva 27–33.
7. 40 preserva 36–44.
8. As fronteiras exatas de ABAIXO/DENTRO/ACIMA/EXCESSO_IMPORTANTE funcionam para 25, 35 e 50.
9. Planos antigos continuam abrindo.
10. Nenhum protocolo de exercício é alterado.
11. Nenhuma dose legada é alterada.
12. Nenhum nível ou progresso é alterado.
13. O núcleo continua retornando todos os alertas aplicáveis.
14. Nenhum alerta bloqueia salvamento.
15. TypeScript sem erros.
16. Suíte completa passando.
17. Build passando.

==================================================
9. ESCOPO
==================================================

Pode alterar apenas:

- tipos e funções de duração;
- interpretação da duração da sessão;
- testes correspondentes;
- documentação técnica desta mudança.

Não alterar:

- interface visual;
- banco;
- migrations;
- APIs, salvo necessidade técnica comprovada e explicada antes;
- protocolos;
- doses;
- exercícios;
- carga basal;
- fadiga;
- interferência;
- planejamento;
- progressão;
- experiência do paciente.

==================================================
10. ENTREGA
==================================================

Antes de implementar, apresentar:

1. fórmula proposta;
2. exemplos para 20, 25, 26, 30, 35, 37, 40, 45 e 50;
3. estratégia para carga/fadiga/planejamento fora de 20/30/40;
4. arquivos que serão alterados.

Depois implementar em um lote isolado.

Ao final apresentar:

- arquivos alterados;
- diff resumido;
- testes;
- build;
- provas das fronteiras;
- prova de que 26, 35, 37 e 45 não foram arredondados;
- prova de que 20/30/40 preservaram o comportamento aprovado;
- limitações restantes.

Não publicar automaticamente.

Pare para validação.
```
