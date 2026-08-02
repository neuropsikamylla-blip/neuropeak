# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 02/08/2026 19:18
salve tudo pois irei trocar de conta para continuarmos desse mesmo lugar

## 02/08/2026 19:23
Confirmando a decisão clínica:

Os exercícios Span Numérico Auditivo Direto e Span Numérico Auditivo Inverso já são auditivos por definição. O áudio é intrínseco e obrigatório na mecânica desses exercícios.

Portanto:

- não criar seletor de modalidade para os spans;
- não propor versão visual;
- não propor versão visual + áudio;
- não tratá-los como “só visual” na documentação.

Classificação correta dos dois spans:

- modalidade configurável: não;
- canal sensorial intrínseco: auditivo;
- áudio intrínseco à tarefa: sim;
- leitura assistiva: apenas para textos instrucionais, separada do áudio dos números.

A seleção Visual / Visual + áudio / Somente áudio continua restrita exclusivamente a:

1. Restaurante;
2. Supermercado;
3. Caminhos para a Meta;
4. Agentes Focus;
5. Compra Multifuncional.

Nenhum outro exercício deverá receber esse seletor sem nova decisão clínica explícita.

Corrija somente a documentação e prossiga com a auditoria considerando essa regra.

## 02/08/2026 19:29
Vamos consolidar definitivamente o catálogo de exercícios antes de iniciar a implementação da nova arquitetura.

A partir deste momento, considere como fonte única de verdade apenas os exercícios clínicos ativos.

DECISÕES DEFINITIVAS

1. O catálogo oficial possui exatamente 34 exercícios clínicos.

2. Remova do catálogo canônico qualquer:
- alias;
- modo separado;
- definição histórica;
- exercício órfão;
- exercício legado;
- exercício descontinuado.

3. O exercício `desafio-cidade` NÃO fará mais parte da arquitetura atual.

Ele será completamente reformulado futuramente como um novo exercício.

Portanto:

- remover da lista canônica;
- remover das contagens;
- remover da documentação da auditoria;
- não utilizá-lo na classificação de carga;
- não utilizá-lo na classificação de duração;
- não utilizá-lo na engine de prescrição;
- não utilizá-lo em exemplos.

Caso exista código relacionado, apenas documente sua localização.

NÃO o remova do código nesta etapa.

Marque-o apenas como:

REMOVED_FROM_CURRENT_CATALOG

Ele será tratado futuramente como um exercício novo.

4. Os aliases antigos também não fazem mais parte da arquitetura conceitual.

Mantenha apenas uma referência técnica, caso ainda existam no código.

Não devem aparecer em:

- inventário;
- documentação clínica;
- classificação;
- tabelas;
- relatórios.

5. A partir deste momento, toda a documentação deverá utilizar exclusivamente os 34 exercícios ativos.

6. Atualize todos os documentos criados anteriormente para remover referências a:

- aliases;
- modos contabilizados como exercícios;
- desafio-cidade;
- exercícios legados.

7. Gere uma lista canônica definitiva contendo apenas:

- ID técnico;
- nome oficial;
- categoria cognitiva;
- domínio principal;
- modalidades (quando existirem);
- status = ACTIVE.

Nenhum outro exercício deve aparecer.

Ao final, apresente apenas:

- lista final dos 34 exercícios;
- confirmação de que não existem mais exercícios legados na documentação;
- confirmação de que todas as próximas análises utilizarão exclusivamente essa lista.

Não implemente alterações no código.
Não remova arquivos do projeto.
Não faça commits.
Apenas limpe a documentação e a arquitetura conceitual. 8. A lista canônica deve manter exatamente os nomes oficiais abaixo.

Esses passam a ser a nomenclatura padrão do projeto.

Qualquer alias, tradução antiga ou nome técnico diferente deverá permanecer apenas internamente quando necessário para compatibilidade, nunca na interface nem na documentação clínica.

Lista oficial:

1. Span Numérico Auditivo Direto
2. Cores e Palavras
3. Agentes Focus
4. Span Numérico Auditivo Inverso
5. Matriz Espacial
6. Matriz Espacial Inversa
7. Jogo da Memória
8. Conecta Números
9. Caminhos para a Meta
10. Informação em Foco
11. Rastreamento de Objetos
12. Dupla Tarefa
13. Tempo de Reação
14. Certo ou Errado
15. Semáforo
16. Busca Rápida
17. Jogo das Torres
18. Labirinto
19. Ordem da História
20. Compra Multifuncional
21. Alternância de Regras
22. Grade Dedutiva
23. Letras em Sequência
24. Sequência de Itens
25. Matriz com Rotações
26. Lista com Distração
27. Restaurante
28. Supermercado
29. N-Back
30. Cubos
31. Vigilância
32. Identificação de Símbolos
33. Estacionamento Lógico
34. Investigadores da Situação Social

9. Atualize toda a documentação criada durante a auditoria para utilizar exclusivamente esses nomes oficiais.

10. Caso algum ID técnico utilize outro nome, mantenha o ID apenas por compatibilidade interna, mas utilize sempre o nome oficial em:

- documentação;
- relatórios;
- tabelas;
- classificação;
- carga cognitiva;
- duração;
- interface planejada;
- engine de prescrição.

11. Gere ao final uma tabela de correspondência contendo:

- ID técnico;
- Nome oficial;
- Alias antigos (se existirem);
- Status (ACTIVE).

Essa tabela passa a ser a referência oficial do projeto para todos os desenvolvimentos futuros. Dos 34 nomes, só vejo dois que ainda valem uma reflexão antes de "congelar":
Agentes Focus — eu gosto mais do que "Focus Agentes", porque soa natural em português e preserva a marca "Focus".
Alternância de Regras — eu ainda prefiro esse nome a "Task Switching". Na sua mecânica, o paciente alterna regras de resposta (cor, forma, número etc.), não tarefas completamente distintas. Para um paciente, "Alternância de Regras" comunica melhor o que acontece no exercício.
Os outros nomes eu manteria exatamente como estão. E vc está fazendo tudo isso com o opus? vc deveria estar usando o codex nao? pois minha janela caiu de 100% para 69%
