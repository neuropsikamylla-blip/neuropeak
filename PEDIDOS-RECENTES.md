# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 02/08/2026 19:44
Eu faria apenas um último "cleanup" antes de seguirmos para a arquitetura de carga cognitiva. Esse comando encerra definitivamente a organização do catálogo, padroniza os nomes, remove o legado da documentação clínica e cria um documento canônico que será a referência oficial do projeto.

```text
Estamos encerrando a fase de organização do catálogo de exercícios.

Esta é a última etapa de limpeza antes de iniciarmos a arquitetura de carga cognitiva, duração e engine de prescrição.

NÃO implemente funcionalidades novas.

NÃO altere algoritmos.

NÃO altere progressão.

NÃO altere banco de dados.

NÃO faça migrations.

NÃO altere a interface.

NÃO faça commits automáticos.

Apenas consolide definitivamente a arquitetura documental do catálogo.

==========================================================
1. FONTE ÚNICA DE VERDADE
==========================================================

A partir deste momento existe apenas UMA lista oficial de exercícios.

Ela contém exatamente 34 exercícios clínicos ativos.

Qualquer documentação futura deverá utilizar exclusivamente essa lista.

Não utilizar:

- aliases;
- modos como exercícios;
- exercícios órfãos;
- exercícios legados;
- nomes antigos;
- nomes provisórios.

Esses poderão aparecer apenas em documentação técnica de compatibilidade.

Nunca na documentação clínica.

==========================================================
2. LISTA OFICIAL
==========================================================

Utilize exatamente estes nomes:

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

==========================================================
3. PADRONIZAÇÃO DOS NOMES
==========================================================

Substitua em toda a documentação:

Focus Agentes
Focus Agents
→ Agentes Focus

Task Switching
→ Alternância de Regras

Nunca utilizar nomes antigos novamente.

Os IDs técnicos podem permanecer inalterados.

==========================================================
4. JUSTIFICATIVAS DOS NOMES
==========================================================

Crie um documento explicando por que alguns nomes diferem dos IDs internos.

Registrar obrigatoriamente:

Cubos

- ID técnico permanece cubo-corsi.
- O nome exibido é Cubos.
- Não utilizamos "Corsi" porque é o nome de um teste neuropsicológico padronizado.
- O aplicativo é de treinamento cognitivo.

Cores e Palavras

- ID técnico permanece stroop-task.
- O nome exibido é Cores e Palavras.
- Não utilizamos "Stroop" porque esse é o nome de um teste neuropsicológico.

Alternância de Regras

- ID técnico permanece task-switching.
- O paradigma científico é Task Switching.
- O exercício executado pelo paciente consiste na alternância das regras de resposta.
- Portanto "Alternância de Regras" representa melhor o treino.

Agentes Focus

- Mantemos "Focus" como identidade do exercício.
- A nomenclatura oficial passa a ser Agentes Focus.

==========================================================
5. DESAFIO DA CIDADE
==========================================================

O exercício desafio-cidade deixa oficialmente de fazer parte da arquitetura atual.

Não pertence mais ao catálogo.

Não pertence mais à documentação clínica.

Não pertence mais às análises de:

- carga;
- duração;
- prescrição;
- categorias.

Não removê-lo do código.

Apenas classificá-lo como:

REMOVED_FROM_CURRENT_CATALOG

Ele será reconstruído futuramente como um novo exercício.

==========================================================
6. MODALIDADES
==========================================================

Somente estes cinco exercícios possuem modalidade configurável:

- Restaurante
- Supermercado
- Caminhos para a Meta
- Agentes Focus
- Compra Multifuncional

As modalidades possíveis são:

- Visual
- Visual + áudio
- Somente áudio

Nenhum outro exercício poderá receber esse seletor sem nova decisão clínica.

Span Numérico Auditivo Direto e Inverso permanecem:

- auditivos por definição;
- sem seletor de modalidade.

==========================================================
7. LEITURA ASSISTIVA
==========================================================

Registrar definitivamente que:

Leitura assistiva

≠

Modalidade do exercício.

Leitura assistiva é acessibilidade.

Modalidade altera a forma cognitiva de apresentação da tarefa.

Essa distinção deverá permanecer em toda a arquitetura.

==========================================================
8. LEGACY IDS
==========================================================

Substitua o termo "Alias" por:

Legacy IDs

Criar uma única tabela contendo:

- ID técnico;
- Nome oficial;
- Legacy IDs;
- Status.

Os Legacy IDs existirão apenas para compatibilidade.

Nunca deverão aparecer para terapeuta nem paciente.

==========================================================
9. DOCUMENTO CANÔNICO
==========================================================

Criar um novo documento fora da pasta de auditoria:

docs/architecture/CANONICAL_EXERCISES.md

Esse documento passa a ser a Constituição dos exercícios do projeto.

Deve conter:

OBJETIVO

Este documento é a única fonte oficial de exercícios do sistema.

Todos os novos exercícios deverão ser registrados aqui.

Não utilizar nomes técnicos na interface.

Não utilizar Legacy IDs na documentação clínica.

Os IDs técnicos permanecem apenas para compatibilidade.

Qualquer alteração de nome deverá ser aprovada antes da implementação.

Depois incluir a tabela completa contendo:

- ID técnico;
- Nome oficial;
- Categoria;
- Domínio cognitivo principal;
- Modalidade configurável (sim/não);
- Status ACTIVE.

==========================================================
10. LIMPEZA DA DOCUMENTAÇÃO
==========================================================

Atualizar todos os documentos criados anteriormente para utilizar exclusivamente:

- os 34 exercícios oficiais;
- os nomes oficiais;
- a nomenclatura Agentes Focus;
- a nomenclatura Alternância de Regras;
- Legacy IDs em vez de Alias.

Remover da documentação clínica:

- exercícios antigos;
- exercícios órfãos;
- aliases;
- modos tratados como exercícios;
- referências ao desafio-cidade.

==========================================================
11. RELATÓRIO FINAL
==========================================================

Ao terminar apresentar:

1. Confirmação de que existem exatamente 34 exercícios ACTIVE.

2. Confirmação de que toda a documentação utiliza apenas os nomes oficiais.

3. Confirmação de que Focus Agentes, Focus Agents e Task Switching não aparecem mais na documentação clínica.

4. Confirmação de que desafio-cidade foi removido da arquitetura clínica e permanece apenas documentado como REMOVED_FROM_CURRENT_CATALOG.

5. Confirmação de que somente cinco exercícios possuem modalidade configurável.

6. Confirmação de que Legacy IDs aparecem apenas na tabela de compatibilidade.

7. Confirmação de que CANONICAL_EXERCISES.md passa a ser a única fonte oficial do catálogo.

Após isso, considerar encerrada definitivamente a fase de organização do catálogo e aguardar autorização para iniciar a arquitetura de carga cognitiva, duração dos exercícios e engine de prescrição.
```

Esse comando deixa o projeto com uma base arquitetural limpa e consistente antes de partir para a próxima etapa.

## 02/08/2026 20:50
Pode concluir os três lotes normalmente.
Ao final, antes de qualquer commit ou implementação, apresente a documentação consolidada e um relatório único.
Depois faremos uma revisão clínica global dos 34 exercícios antes de iniciar a fase de carga cognitiva.

## 02/08/2026 21:08
<task-notification>
<task-id>bu3nvlndd</task-id>
<tool-use-id>toolu_01LaHfxvRDmzo5sDvApePqo6</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bu3nvlndd.output</output-file>
<status>completed</status>
<summary>Background command "Aguardar o lote B" completed (exit code 0)</summary>
</task-notification>
