# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 20:05
Finalizamos uma etapa importante da arquitetura da prescrição.

Antes de abrir qualquer nova fase estrutural, quero voltar o foco para aquilo que realmente determina a qualidade clínica da plataforma: os exercícios.

A partir deste momento, vamos trabalhar exercício por exercício.

O objetivo não é apenas corrigir bugs.

Quero revisar profundamente:

- objetivo cognitivo;
- validade clínica do treino;
- mecânica;
- progressão;
- adaptação de dificuldade;
- feedback ao paciente;
- tutorial;
- interface;
- motivação ao longo das sessões;
- sensação de evolução;
- métricas registradas;
- quais indicadores realmente importam para o terapeuta;
- quais dados serão usados futuramente na evolução clínica.

A cada exercício quero seguir este fluxo:

1. análise do exercício atual;
2. identificar limitações clínicas e de UX;
3. propor melhorias;
4. validar a arquitetura antes de qualquer código;
5. implementar;
6. testar;
7. publicar;
8. passar para o próximo exercício.

Não abrir novas frentes arquitetônicas em paralelo.

Vamos evoluir um exercício por vez, até que os 34 estejam no padrão clínico e de experiência que buscamos.

Primeiro exercício da próxima etapa: Tutorial e experiência inicial de execução.

Não implementar ainda.

Quero primeiro uma análise completa do fluxo atual do tutorial, da entrada do paciente no exercício, do início da sessão e da experiência de primeira utilização, tomando como referência também as observações que fizemos sobre o Cogmed.

Ao final, apresente apenas a análise e aguarde minha validação.

## 04/08/2026 20:32
A análise está aprovada. Vamos consolidar as decisões antes de implementar.

==================================================
DECISÕES — TUTORIAL E ENTRADA NO EXERCÍCIO
==================================================

1. MEMÓRIA DO TUTORIAL

A informação de que o tutorial foi concluído deve ser armazenada no banco, por:

- paciente;
- exercício.

Não usar localStorage como fonte principal.

Motivo:

- o paciente pode trocar de dispositivo;
- pode treinar parte em casa e parte na clínica;
- o terapeuta precisa ter um estado consistente;
- a experiência não pode depender do navegador utilizado.

O localStorage poderá existir apenas como apoio técnico temporário, nunca como fonte de verdade.

Antes de implementar, analisar a modelagem mínima necessária e o impacto sobre banco, API e compatibilidade.

==================================================
2. PRIMEIRA UTILIZAÇÃO
==================================================

Na primeira vez que o paciente abrir determinado exercício:

- apresentar o tutorial automaticamente;
- o tutorial deve ser obrigatório antes do treino real;
- ao concluir o tutorial, retornar para a tela de preparação ou oferecer “Começar treino”.

O tutorial não pode:

- contar como tentativa clínica;
- alterar nível;
- alterar progressão;
- registrar pontuação;
- interferir nas métricas do exercício;
- ser contabilizado como parte da dose prescrita.

==================================================
3. UTILIZAÇÕES SEGUINTES
==================================================

Depois que o tutorial daquele exercício já tiver sido concluído, o paciente deve encontrar uma tela de preparação simples:

NOME DO EXERCÍCIO

Nível atual, quando aplicável.

[ Começar ]

[ Como funciona ]

“Começar” inicia imediatamente o treino real.

“Como funciona” abre novamente o tutorial completo por escolha do paciente.

O tutorial nunca deve reaparecer automaticamente depois de concluído, salvo se:

- o terapeuta futuramente redefinir esse estado;
- houver uma mudança incompatível na mecânica do exercício;
- existir uma nova versão do tutorial que exija reapresentação.

Não implementar ainda redefinição pelo terapeuta, mas deixar a arquitetura preparada para isso.

==================================================
4. ESTRUTURA GLOBAL DO TUTORIAL
==================================================

Todos os exercícios deverão seguir um único fluxo:

1. Demonstração
2. Sua vez
3. Validação
4. Conclusão

DEMONSTRAÇÃO

- o sistema executa um exemplo real;
- utiliza os mesmos componentes e regras visuais do exercício;
- não usar animação meramente ilustrativa que diverge do jogo;
- texto mínimo;
- sem explicações longas.

SUA VEZ

- o paciente realiza uma única tentativa guiada;
- dificuldade inicial simples;
- objetivo apenas de confirmar compreensão;
- não representa o nível clínico do paciente.

VALIDAÇÃO

Se acertar:

“Você entendeu como funciona.”

[ Começar treino ]

Se errar:

- apresentar orientação curta;
- repetir somente a tentativa guiada;
- não reiniciar todo o tutorial;
- não registrar o erro como desempenho clínico;
- não reduzir nível.

==================================================
5. PADRÃO DE ETAPAS
==================================================

O tutorial global deverá ter uma única sequência lógica.

Os exercícios que hoje possuem duas ou três etapas precisam ser auditados.

Não reduzir mecanicamente todos para “um slide”.

A regra correta é:

- uma demonstração contínua;
- uma tentativa guiada;
- uma conclusão.

Caso a mecânica realmente possua decisões distintas, elas devem ocorrer dentro dessa mesma demonstração, sem obrigar o paciente a atravessar vários tutoriais separados.

Não manter tutoriais repetitivos apenas porque foram implementados historicamente em mais de uma etapa.

==================================================
6. TELA TEXTUAL DE INSTRUÇÕES
==================================================

A tela atual com:

- lista numerada;
- cenário funcional;
- estratégias;
- botão “Iniciar”;

não deve continuar como etapa obrigatória antes de todo treino.

Evitar a sequência atual:

instruções textuais
→ tutorial interativo
→ treino.

Isso duplica explicações e aumenta a carga cognitiva antes da tarefa.

A futura tela “Como funciona” poderá reunir:

- tutorial demonstrativo;
- explicação textual opcional;
- cenário funcional;
- estratégias.

Mas o paciente não deve ser obrigado a ler essas informações em todas as sessões.

==================================================
7. RESULTADO E PERCEPÇÃO DE EVOLUÇÃO
==================================================

A tela final precisa comunicar evolução sem utilizar comparação punitiva.

Quando houver subida de nível:

“Você avançou para o nível X.”

Quando mantiver o nível:

“Treino concluído. Você manteve seu nível.”

Quando a sessão tiver maior dificuldade ou eventual redução adaptativa:

“Treino concluído. Hoje esta atividade exigiu mais esforço.”

Não usar:

- “você piorou”;
- “você regrediu”;
- “seu desempenho caiu” como mensagem principal ao paciente;
- mensagens que incentivem competição com sessões anteriores.

A informação técnica completa permanece disponível ao terapeuta.

A comunicação ao paciente deve reforçar:

- conclusão;
- esforço;
- continuidade;
- progressão quando existente.

==================================================
8. TELA DE PREPARAÇÃO
==================================================

Padronizar uma tela global antes do início de cada exercício.

Mostrar somente o necessário:

- nome oficial do exercício;
- nível atual, quando aplicável;
- botão “Começar”;
- botão “Como funciona”.

Não mostrar excesso de métricas antes do treino.

Não mostrar recorde como elemento principal.

Não mostrar carga, fadiga, protocolo clínico ou dados destinados ao terapeuta.

==================================================
9. FRAMEWORK GLOBAL
==================================================

Não corrigir os 34 exercícios individualmente antes de definir o framework.

Primeiro criar uma arquitetura reutilizável que controle:

- tela de preparação;
- estado de tutorial concluído;
- demonstração;
- tentativa guiada;
- validação;
- conclusão;
- início do treino;
- reabertura voluntária do tutorial.

Cada exercício deverá fornecer apenas sua lógica específica, por exemplo:

- demonstração real;
- tentativa guiada;
- regra de validação;
- mensagens específicas estritamente necessárias.

Não permitir que cada exercício volte a inventar seu próprio fluxo.

==================================================
10. IMPLEMENTAÇÃO EM FASES
==================================================

Antes do código, apresentar uma proposta em fases:

FASE T1
- modelagem do estado “tutorial concluído”;
- contrato global;
- tela de preparação;
- nenhuma conversão dos exercícios ainda.

FASE T2
- implementar o framework;
- converter 1 ou 2 exercícios-piloto representativos;
- validar experiência e persistência.

Sugestão de pilotos:
- um exercício simples e visual;
- um exercício auditivo ou operacionalmente complexo.

FASE T3
- converter os exercícios restantes em lotes seguros;
- auditar os tutoriais com 2 ou 3 etapas;
- garantir réplica real da mecânica.

FASE T4
- padronizar tela de resultado e comunicação de evolução.

Não iniciar todas as fases de uma vez.

==================================================
11. ANÁLISE OBRIGATÓRIA ANTES DO CÓDIGO
==================================================

Antes de implementar, responder:

1. Onde e como armazenar tutorial concluído por paciente e exercício.
2. Se já existe entidade ou tabela adequada que possa ser estendida.
3. Se será necessária migration.
4. Quais APIs precisarão ler e gravar esse estado.
5. Como versionar o tutorial para reapresentá-lo após mudança relevante de mecânica.
6. Como garantir que o tutorial não altere progressão nem métricas.
7. Quais componentes atuais podem ser reutilizados.
8. Quais tutoriais não são réplicas reais da mecânica.
9. Quais exercícios possuem 1, 2 ou 3 etapas.
10. Quais dois exercícios são os melhores pilotos e por quê.
11. Quais arquivos seriam alterados na Fase T1.
12. Quais testes serão necessários.
13. Quais decisões clínicas ainda dependem da minha validação.

Não implementar ainda.

Criar um documento arquitetônico novo, preservar os documentos anteriores e parar para minha validação.

## 04/08/2026 20:52
A análise está aprovada, com as seguintes decisões.

==================================================
1. MODELAGEM E ROTA
==================================================

Aprovo utilizar ExerciseConfig, que já possui a granularidade correta por paciente e exercício.

Adicionar futuramente:

- tutorialCompletedAt;
- tutorialVersion.

Aprovo uma rota específica para conclusão do tutorial.

Não utilizar /api/sessions para registrar tutorial.

A rota do tutorial não poderá tocar:

- Session;
- currentDifficulty;
- lastAttemptAt;
- totalAttempts;
- progressão;
- achievements;
- alertas;
- métricas clínicas;
- dose realizada.

A separação deve ser garantida por arquitetura e testes.

==================================================
2. PACIENTES ATUAIS
==================================================

Pacientes que já possuem histórico real naquele exercício não devem ser obrigados a rever automaticamente o tutorial após a migration.

Na transição inicial:

- se o paciente já tiver totalAttempts > 0 ou evidência equivalente de execução real naquele exercício, considerar o tutorial conhecido;
- se nunca tiver executado o exercício, tutorial obrigatório no primeiro acesso;
- todos continuam podendo acessar “Como funciona” voluntariamente.

Essa inferência pelo histórico será utilizada somente na transição inicial.

Depois da migration, a fonte de verdade passa a ser:

- tutorialCompletedAt;
- tutorialVersion.

Não continuar inferindo indefinidamente pelo número de tentativas.

Documentar claramente como será feito o backfill, sem alterar:

- tentativas;
- níveis;
- progresso;
- datas de treino;
- sessões anteriores.

==================================================
3. VERSIONAMENTO
==================================================

Cada tutorial terá uma versão explícita.

O tutorial será considerado concluído quando:

tutorialVersion concluída pelo paciente
=
versão atual exigida pelo exercício.

Uma alteração apenas visual ou textual não deve obrigar reapresentação.

Somente uma mudança relevante da mecânica, da regra de resposta ou da forma de interação poderá aumentar a versão obrigatória.

Não criar aumento automático de versão por deploy.

A versão deverá ser definida explicitamente no catálogo ou contrato do tutorial.

==================================================
4. EXERCÍCIOS CONTINUOUS_TIMED
==================================================

Para exercícios cronometrados, “Sua vez” não significa executar o protocolo completo.

Utilizar uma micro-unidade guiada representativa da mecânica.

Exemplos:

- Vigilância: sequência curta contendo um alvo;
- Informação em Foco: uma questão completa;
- Tempo de Reação: poucos estímulos;
- Rastreamento de Objetos: uma rodada curta;
- Cores e Palavras: pequeno bloco de respostas.

A unidade guiada deve apenas confirmar que o paciente compreendeu:

- qual estímulo observar;
- qual resposta emitir;
- quando responder;
- quando não responder, quando aplicável.

Ela não deve:

- usar a duração clínica do protocolo;
- consumir a dose prescrita;
- alterar nível;
- contar como tentativa;
- registrar precisão ou tempo de reação;
- entrar no histórico clínico;
- afetar progressão.

Se houver erro, repetir somente essa micro-unidade com uma orientação curta.

Não reiniciar toda a demonstração.

==================================================
5. EXERCÍCIOS SEM TUTORIAL
==================================================

Registrar explicitamente que 15 exercícios ainda não possuem tutorial.

Não criar os 15 de uma vez.

Primeiro implementar e validar o framework e os dois pilotos.

Após validação, converter os exercícios restantes em lotes, respeitando a mecânica específica de cada um.

Não transformar tutorial em animação genérica.

O tutorial deve reproduzir a regra real do exercício.

==================================================
6. TUTORIAIS FORA DO CONTRATO
==================================================

Os cinco tutoriais próprios — Agentes Focus, Informação em Foco, Vigilância, Cores e Palavras e Padrões com Rotação — devem ser auditados individualmente antes da conversão.

Não substituir automaticamente sua lógica pelo framework.

Em especial, preservar as decisões clínicas da Vigilância:

- o alvo é apresentado conforme a regra definida;
- não introduzir pistas durante o treino;
- não repetir informação que descaracterize o construto.

O framework deve controlar o fluxo global, mas permitir que cada exercício forneça sua demonstração real e sua unidade guiada específica.

==================================================
7. PILOTOS
==================================================

Aprovo os dois pilotos:

1. Conecta Números
- caso visual simples;
- já compartilha componentes com o jogo;
- valida o fluxo global com menor risco.

2. Span Numérico Auditivo Direto
- caso auditivo;
- atualmente sem tutorial;
- valida estímulo sonoro, repetição guiada e ausência de apoio visual indevido.

Os pilotos precisam provar:

- primeira utilização obrigatória;
- acesso seguinte direto à tela de preparação;
- botão “Como funciona”;
- persistência entre dispositivos;
- versionamento;
- tutorial sem impacto clínico;
- repetição apenas da tentativa guiada em caso de erro.

==================================================
8. PRÓXIMA ENTREGA
==================================================

Ainda não implementar.

Atualize o documento arquitetônico com estas decisões e apresente:

1. schema exato proposto;
2. estratégia de migration e backfill;
3. contrato TypeScript do framework;
4. formato da versão do tutorial;
5. contrato da micro-unidade guiada;
6. fluxo completo do Conecta Números;
7. fluxo completo do Span Numérico Auditivo Direto;
8. arquivos previstos para a Fase T1;
9. testes obrigatórios da Fase T1;
10. riscos que ainda dependem da minha decisão.

Também liste claramente as outras decisões clínicas pendentes mencionadas no documento que não apareceram no resumo da resposta.

Não implementar.
Não publicar.
Pare após a proposta detalhada da Fase T1.
