# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 02/08/2026 21:08
<task-notification>
<task-id>bu3nvlndd</task-id>
<tool-use-id>toolu_01LaHfxvRDmzo5sDvApePqo6</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bu3nvlndd.output</output-file>
<status>completed</status>
<summary>Background command "Aguardar o lote B" completed (exit code 0)</summary>
</task-notification>

## 02/08/2026 22:30
Revendo a Fase 1, acredito que a estrutura principal está correta.

Minha decisão clínica é manter cada exercício organizado pelo seu DOMÍNIO e SUBDOMÍNIO PRINCIPAL, exatamente como está hoje.

Entretanto, reconheço que praticamente todos os exercícios treinam processos cognitivos secundários.

Portanto, não quero mover exercícios entre categorias.

Quero acrescentar um PERFIL COGNITIVO ASSOCIADO para cada exercício.

Exemplo:

- Caminhos para a Meta:
  Principal: Planejamento.
  Associados: Flexibilidade Cognitiva, Memória Operacional e Organização Sequencial.

- Compra Multifuncional:
  Principal: Autonomia.
  Associados: Funções Executivas, Atenção Seletiva, Memória Operacional e Velocidade de Processamento.

- Restaurante:
  Principal: Memória Operacional.
  Associados: Atenção Sustentada, Controle Inibitório e Flexibilidade Cognitiva.

O domínio principal continua sendo o responsável pela organização visual do catálogo.

Os perfis associados servirão para a futura engine de prescrição, cálculo de carga cognitiva e recomendações clínicas.

Ou seja, não quero reorganizar o catálogo. Quero enriquecer o perfil cognitivo de cada exercício.

## 02/08/2026 22:33
Decisões clínicas para aplicar o perfil associado aos 34 exercícios:

==================================================
1. CATALOG DOMAIN × MECHANICAL PRIMARY
==================================================

Aceito a separação entre o domínio usado para organizar o catálogo e o processo predominante identificado na mecânica real.

Manter conceitualmente:

- catalogDomain
- catalogSubdomain
- mechanicalPrimary
- associatedCognitiveProfiles

O catálogo permanece exatamente como está visualmente.

catalogDomain e catalogSubdomain:

- organizam a interface;
- representam a finalidade clínica escolhida para apresentar o exercício;
- não devem ser alterados automaticamente pela análise mecânica.

mechanicalPrimary:

- representa a operação cognitiva predominante exigida pela mecânica atual;
- é informativo;
- deve ser derivado do código real;
- será utilizado como uma das bases da futura análise de carga, duração e prescrição.

Entretanto, a engine não deve utilizar apenas mechanicalPrimary.

Ela deverá futuramente considerar o perfil completo:

- mechanicalPrimary;
- domínios associados;
- intensidade dos domínios finos;
- modificadores do nível;
- modalidade;
- duração;
- interferência;
- pressão temporal.

Portanto, o fato de o terapeuta visualizar um exercício em determinada categoria não obriga a mecânica a ter exatamente o mesmo processo como predominante.

Essa diferença não deve ser tratada como erro por si só.

==================================================
2. CAMINHOS PARA A META
==================================================

Não corrigir artificialmente a matriz atual para incluir Flexibilidade Cognitiva.

A análise atual descreve corretamente a versão que existe hoje:

- organização;
- sequenciamento;
- ordenação temporal;
- monitoramento.

O exercício será reformulado para se tornar um treino efetivo de Planejamento.

Portanto, registrar:

profileStatus: PROVISIONAL_PROFILE

catalogSubdomain:
- Planejamento e Flexibilidade

mechanicalPrimary atual:
- Organização

associatedCognitiveProfiles atuais:
- Organização Sequencial;
- Ordenação Temporal;
- Monitoramento Executivo;
- Memória Operacional, caso sustentado pela matriz.

Não incluir Flexibilidade Cognitiva como associada apenas porque ela está no nome do subdomínio do catálogo.

Flexibilidade Cognitiva só deverá entrar quando a nova mecânica realmente exigir, por exemplo:

- mudança de estratégia;
- revisão do plano após nova informação;
- existência de mais de uma rota possível;
- adaptação diante de impedimentos;
- troca entre critérios;
- abandono de uma estratégia ineficiente;
- replanejamento.

Depois da reformulação, o perfil cognitivo de Caminhos para a Meta deverá ser reavaliado integralmente.

Até lá:

- não utilizar seu mechanicalPrimary atual como definição definitiva;
- não utilizar sua carga futura como definitiva;
- não utilizá-lo como exercício-modelo para a engine de prescrição.

==================================================
3. RESTAURANTE
==================================================

Não corrigir a matriz apenas para incluir Atenção Sustentada ou Flexibilidade Cognitiva.

Manter o que a mecânica atual sustenta.

MechanicalPrimary:

- Memória Operacional Verbal, ou o equivalente fino já definido na matriz.

Perfis associados devem derivar dos processos realmente encontrados, como:

- Atenção Seletiva;
- Controle de Distração;
- Controle Inibitório;
- Sequenciamento;
- Manipulação Mental;
- Monitoramento;

conforme as pontuações reais da matriz.

Não incluir Atenção Sustentada apenas porque o exercício dura vários minutos.

Atenção Sustentada só deve entrar como associada se a mecânica exigir manutenção estável de vigilância ou prontidão ao longo do tempo, e não apenas execução sucessiva de rodadas.

Não incluir Flexibilidade Cognitiva apenas porque existem ordens:

- direta;
- inversa;
- com exclusão.

Essas condições podem aumentar:

- manipulação mental;
- atualização;
- controle inibitório;
- manutenção de regra.

Elas só representam Flexibilidade Cognitiva se o paciente precisar alternar, adaptar ou trocar ativamente entre regras ou estratégias durante a execução.

Portanto, para Restaurante, manter a análise atual e não ampliar os rótulos de forma artificial.

==================================================
4. REGRA PARA DIVERGÊNCIAS
==================================================

Quando houver divergência entre:

- finalidade clínica desejada;
- categoria do catálogo;
- mecânica atual;

não alterar a matriz para fazê-las coincidir.

Registrar separadamente:

- o que o exercício pretende treinar;
- o que sua versão atual realmente exige;
- o que ainda depende de reformulação.

A matriz deve continuar sendo descritiva da mecânica real.

Não deve ser prescritiva nem aspiracional.

==================================================
5. VOCABULÁRIO MACRO
==================================================

A proposta de criar uma camada macro derivada dos aproximadamente 60 domínios finos está aprovada.

Entretanto, não misturar processos cognitivos com finalidade funcional na mesma lista.

Separar em duas estruturas:

A. cognitiveMacroProfiles
B. functionalClinicalTags

==================================================
6. COGNITIVE MACRO PROFILES
==================================================

Utilizar os seguintes macros cognitivos:

ATENÇÃO

1. Atenção Seletiva
2. Atenção Sustentada
3. Atenção Dividida
4. Atenção Alternada
5. Busca e Rastreamento Visual

MEMÓRIA

6. Memória Operacional Verbal
7. Memória Operacional Visuoespacial
8. Armazenamento de Curto Prazo
9. Atualização e Manipulação Mental

FUNÇÕES EXECUTIVAS

10. Controle Inibitório
11. Flexibilidade Cognitiva
12. Planejamento
13. Organização e Sequenciamento
14. Monitoramento Executivo e Manutenção de Meta
15. Resolução de Problemas e Tomada de Decisão

VELOCIDADE E PERCEPÇÃO

16. Velocidade de Processamento
17. Tempo de Reação
18. Percepção e Processamento Visuoespacial

LINGUAGEM E RACIOCÍNIO

19. Linguagem, Leitura e Processamento Auditivo
20. Raciocínio Lógico e Dedutivo

Esses macros são usados para:

- perfil cognitivo associado;
- cálculo futuro de sobreposição;
- sequenciamento;
- balanceamento;
- engine de prescrição.

==================================================
7. FUNCTIONAL CLINICAL TAGS
==================================================

Manter separadamente marcadores clínico-funcionais:

- Autonomia Funcional;
- Cognição Social;
- Atividades Instrumentais da Vida Diária;
- Tomada de Decisão Cotidiana;
- Organização da Rotina;
- Uso Funcional de Dinheiro;
- Compreensão de Situações Sociais.

Esses marcadores:

- não substituem os processos cognitivos;
- não entram automaticamente como mechanicalPrimary;
- descrevem a aplicação funcional ou o contexto da atividade;
- podem ser utilizados pela futura engine para selecionar exercícios conforme o objetivo terapêutico.

Exemplo:

Compra Multifuncional

catalogDomain:
- Desenvolvimento Funcional

functionalClinicalTags:
- Autonomia Funcional;
- Uso Funcional de Dinheiro;
- Tomada de Decisão Cotidiana.

mechanicalPrimary:
- Resolução de Problemas, conforme a análise atual.

associatedCognitiveProfiles:
- Memória Operacional;
- Atenção Seletiva;
- Controle Inibitório;
- Planejamento;
- Velocidade de Processamento;

somente quando sustentados pela matriz.

==================================================
8. REGRA DE DERIVAÇÃO DOS ASSOCIADOS
==================================================

Um macro cognitivo poderá entrar como associado quando:

- agregar pelo menos um domínio fino com valor 2 ou 3;
- não for equivalente ao mechanicalPrimary;
- representar uma demanda cognitiva relevante e recorrente;
- não for apenas uma exigência instrumental;
- não tiver sido inferido apenas pelo nome, duração ou categoria do exercício.

Ordenar os associados por:

1. maior intensidade fina;
2. quantidade de domínios finos relevantes dentro do macro;
3. centralidade na mecânica;
4. persistência ao longo dos níveis.

Mostrar no máximo quatro perfis cognitivos associados por exercício na camada resumida.

A estrutura detalhada pode preservar todos os domínios finos no JSON.

Não forçar quatro associados.

Um exercício poderá ter:

- um;
- dois;
- três;
- quatro;

conforme a mecânica real.

==================================================
9. NÃO USAR RÓTULOS AMPLOS PARA ESCONDER DIVERGÊNCIAS
==================================================

Não utilizar um rótulo macro mais amplo apenas para incluir um processo que a matriz não encontrou.

Exemplos:

- não converter sequenciamento automaticamente em Flexibilidade Cognitiva;
- não converter duração em Atenção Sustentada;
- não converter ordem inversa automaticamente em Flexibilidade;
- não converter leitura em Linguagem como alvo de treino;
- não converter movimentos rápidos em Velocidade de Processamento;
- não converter atividade cotidiana automaticamente em Autonomia Funcional como processo cognitivo.

O macro deve resumir os domínios finos, não substituí-los.

==================================================
10. CAMADA RESUMIDA POR EXERCÍCIO
==================================================

Para cada exercício, criar conceitualmente:

{
  "catalogDomain": "",
  "catalogSubdomain": "",
  "mechanicalPrimary": "",
  "associatedCognitiveProfiles": [],
  "functionalClinicalTags": [],
  "instrumentalDemands": [],
  "profileStatus": "FINALIZED_PROFILE | PROVISIONAL_PROFILE"
}

Não alterar código nesta etapa.

Aplicar essa estrutura apenas na documentação e no JSON clínico.

==================================================
11. STATUS DOS PERFIS
==================================================

Neste momento:

Caminhos para a Meta:
- PROVISIONAL_PROFILE

Demais exercícios:
- FINALIZED_PROFILE

Isso poderá ser revisto quando eu informar que outro exercício passará por reformulação estrutural.

==================================================
12. APLICAÇÃO AOS 34
==================================================

Pode despachar ao Codex e aplicar a camada macro aos 34 exercícios com as regras acima.

Antes de concluir, verificar:

- nenhum exercício foi movido de lugar no catálogo;
- nenhum mechanicalPrimary foi alterado para coincidir artificialmente com o catálogo;
- Caminhos para a Meta permanece provisório;
- Restaurante não ganhou Atenção Sustentada ou Flexibilidade sem sustentação mecânica;
- Autonomia Funcional e Cognição Social ficaram separadas dos macros cognitivos;
- nenhum exercício recebeu obrigatoriamente quatro associados;
- a matriz fina original foi preservada;
- a nova camada macro foi derivada da matriz e não a substituiu.

Ao final, apresentar:

1. Tabela dos 34 com:
   - catalogDomain;
   - catalogSubdomain;
   - mechanicalPrimary;
   - associados;
   - tags funcionais;
   - status.

2. Exercícios em que catalogSubdomain e mechanicalPrimary não coincidem.

3. Exercícios com menos de dois perfis associados.

4. Exercícios com quatro perfis associados.

5. Exercícios provisórios.

6. Qualquer macro que não tenha sido utilizado.

7. Qualquer domínio fino que não tenha encontrado macro correspondente.

Não iniciar carga cognitiva ainda.

Após aplicar e revisar, pare e aguarde validação clínica.
