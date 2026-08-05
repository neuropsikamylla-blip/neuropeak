# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 13:49
O cronograma está aprovado, com duas decisões adicionais.

1. MODALIDADE CONFIGURÁVEL

O tutorial deve acompanhar a modalidade prescrita para aquele exercício.

A demonstração e a tentativa guiada precisam reproduzir:

- os mesmos estímulos;
- a mesma forma de resposta;
- a mesma lógica de interação;
- as mesmas regras relevantes;

da modalidade que o paciente realmente executará.

Não utilizar tutorial visual genérico quando a modalidade prescrita exigir outra forma de interação.

Quando duas modalidades diferirem apenas em aparência, a estrutura do tutorial pode ser compartilhada, mas o conteúdo demonstrativo deve refletir a modalidade ativa.

2. CONVIVÊNCIA DURANTE A TRANSIÇÃO

Aprovo a convivência temporária dos dois formatos.

Durante a conversão em lotes:

- exercício convertido utiliza o novo framework;
- exercício ainda não convertido mantém o tutorial atual;
- nenhum exercício pode ficar sem fluxo de entrada;
- a publicação de um lote não pode alterar o comportamento dos exercícios dos lotes seguintes.

O novo framework só passa a controlar um exercício depois que:

- demonstração;
- tentativa guiada;
- validação;
- persistência;
- acesso posterior por “Começar” e “Como funciona”;

estiverem completos e testados para aquele exercício.

A divisão aprovada é:

- T1.0 — backup, banco e implantação da fundação;
- T1.1 — framework + Conecta Números + Span Numérico Auditivo Direto;
- T1.2 — grupo visual simples;
- T1.3 e T1.4 — fusão dos tutoriais com múltiplas etapas;
- T1.5 — criação dos tutoriais inexistentes;
- T1.6 — Span Inverso e auditoria dos casos auditivos;
- T1.7 — cinco tutoriais próprios, com Vigilância por último.

Antes de iniciar T1.0:

- conclua e publique os ajustes finais da Fase 1;
- confirme a versão publicada;
- não misture alterações da Fase 1 com banco ou tutorial.

Depois disso, iniciar T1.0 pelo backup validado, conforme o procedimento já aprovado.

Não iniciar conversão de exercícios antes da fundação estar aplicada e validada.

## 05/08/2026 13:51
<task-notification>
<task-id>bsqei3n3a</task-id>
<tool-use-id>toolu_01Tj5g48PY35CMMu5AznMGqB</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bsqei3n3a.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o encerramento da Fase 1" completed (exit code 0)</summary>
</task-notification>

## 05/08/2026 13:57
Pare imediatamente a implementação da T1.

Encontramos um bug funcional que bloqueia o uso clínico.

Comportamento observado:

- crio um plano;
- adiciono exercícios;
- salvo;
- tudo parece correto;
- saio da página;
- volto para analisar o mesmo plano;
- todos os exercícios desapareceram.

Não implemente nenhuma correção ainda.

Primeiro faça uma investigação completa e apresente evidências.

Quero descobrir exatamente onde ocorre a perda dos exercícios.

Analise todo o fluxo:

1. criação do plano;
2. salvamento;
3. persistência das relações TrainingPlan ↔ exercícios;
4. update do plano;
5. leitura do plano na tela de análise;
6. carregamento após recarregar a página.

Para cada etapa informe:

- qual função executa;
- qual API é chamada;
- qual SQL/Prisma é executado;
- quais tabelas são alteradas;
- onde os exercícios ainda existem;
- em que momento desaparecem.

Quero evidências, não hipóteses.

Se possível, execute o fluxo completo em ambiente de desenvolvimento e identifique o primeiro ponto em que o estado diverge do esperado.

Não corrija nada antes de localizar exatamente a origem do problema.
