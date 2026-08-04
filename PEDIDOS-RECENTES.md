# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 13:28
Vamos iniciar um novo refinamento de UX na tela de montagem do plano do terapeuta.

A arquitetura clínica, os protocolos, os alertas e o núcleo de prescrição já estão aprovados e não devem ser reabertos.

O problema agora é de densidade visual e foco de tarefa.

Hoje a mesma tela tenta exibir simultaneamente:

- biblioteca de exercícios;
- exercícios já incluídos;
- painel de ajuste;
- resumo de duração;
- carga;
- fadiga;
- interferência;
- revisão do plano;
- observações clínicas;
- informações adicionais.

Isso deixa a tela poluída, com textos pequenos e excesso de informação concorrendo pela atenção do terapeuta.

O objetivo desta etapa é criar uma interface com painéis retráteis e informações progressivamente expansíveis, sem alterar regras clínicas.

Não iniciar tutorial, modo autoguiado ou qualquer outra fase.

==================================================
PRINCÍPIO DE UX
==================================================

A tela deve apoiar dois modos de trabalho:

1. MONTAGEM DO PLANO
   - foco na biblioteca e escolha de exercícios;

2. REVISÃO DO PLANO
   - foco no resumo, carga, duração, alertas e exercícios já incluídos.

O terapeuta deve conseguir alternar entre esses focos sem sair da página.

Não mostrar todas as informações detalhadas ao mesmo tempo.

Utilizar divulgação progressiva:

- resumo primeiro;
- detalhes somente quando solicitados.

==================================================
PARTE 1 — PAINÉIS RETRÁTEIS
==================================================

A tela possui duas áreas principais:

A. Área esquerda:
- biblioteca de exercícios;
- categorias;
- subdomínios;
- busca;
- filtros;
- lista de exercícios disponíveis.

B. Área direita:
- plano em construção;
- resumo da sessão;
- revisão do plano;
- observações clínicas;
- exercícios selecionados;
- ajustes.

Implementar recolhimento independente das duas áreas.

==================================================
1.1 — RECOLHER A BIBLIOTECA
==================================================

Criar uma ação discreta para recolher a área esquerda.

Quando recolhida:

- a biblioteca deixa de ocupar a largura principal;
- permanece uma aba/lingueta lateral fina;
- a aba deve indicar “Exercícios”;
- usar seta coerente com a direção de abertura;
- ao clicar, a biblioteca volta;
- o painel do plano expande e utiliza o espaço liberado.

Exemplo conceitual:

[ > Exercícios ]

Não remover conteúdo nem estado dos filtros.

Ao reabrir, preservar:

- categoria selecionada;
- subdomínio;
- busca;
- filtros;
- posição de rolagem, quando tecnicamente viável.

==================================================
1.2 — RECOLHER O PAINEL DO PLANO
==================================================

Criar uma ação discreta para recolher a área direita.

Quando recolhida:

- o painel do plano vira uma aba/lingueta lateral;
- a aba deve indicar “Plano”;
- a biblioteca expande para ocupar o espaço;
- os exercícios já selecionados continuam preservados;
- nenhum cálculo é perdido;
- salvar continua possível após reabrir.

Exemplo conceitual:

[ Plano < ]

==================================================
1.3 — COMPORTAMENTO DOS PAINÉIS
==================================================

Permitir os seguintes estados:

- ambos abertos;
- biblioteca recolhida;
- plano recolhido.

Não permitir que os dois fiquem recolhidos simultaneamente, salvo se houver uma justificativa clara e aprovada antes.

Ao recolher um painel:

- animar de forma curta e discreta;
- sem efeitos chamativos;
- sem perder estado;
- sem recarregar a página.

Persistir a preferência do terapeuta localmente:

- se deixou a biblioteca recolhida, manter assim ao voltar;
- se deixou o plano recolhido, manter assim ao voltar;
- usar armazenamento local, não banco, salvo necessidade técnica comprovada.

Responsividade:

- em telas menores, usar comportamento equivalente a drawer;
- não deixar a interface inutilizável em notebooks;
- manter navegação por teclado e foco acessível.

==================================================
PARTE 2 — RESUMO DO PLANO MAIS LIMPO
==================================================

O painel de revisão continua correto clinicamente, mas mostra detalhes demais de imediato.

Transformar os blocos em resumos escaneáveis.

Hoje um alerta pode exibir:

- título;
- explicação;
- lista completa de exercícios;
- sugestão;
- justificativa.

Na visualização inicial, mostrar apenas:

- título;
- dado principal;
- contagem;
- gravidade/categoria;
- ação “Ver detalhes”.

Exemplos:

CARGA ELEVADA PARA A DURAÇÃO
69 / referência 10
[Ver detalhes]

MUITAS ATIVIDADES DE FADIGA ALTA
12 atividades
[Ver exercícios]

JANELAS DE PLANEJAMENTO
6 atividades
[Ver detalhes]

FADIGA ALTA EM SEQUÊNCIA
4 sequências
[Ver sequências]

Ao expandir, mostrar:

- explicação completa;
- exercícios envolvidos;
- sugestão clínica;
- justificativa;
- ocorrências individuais, quando aplicável.

==================================================
PARTE 3 — AGRUPAMENTO VISUAL
==================================================

Manter a taxonomia atual:

1. Revisão do plano
2. Observações clínicas
3. Informações

Por padrão:

- exibir todos os títulos dos grupos;
- mostrar apenas os itens resumidos;
- não deixar todos os detalhes abertos.

Quando houver muitos itens em um grupo:

- mostrar inicialmente os mais relevantes;
- incluir “Ver todas as observações”;
- preservar acesso a tudo;
- não apagar ocorrências.

Sugestão de limite inicial:

- Revisão do plano: mostrar até 4 itens resumidos;
- Observações clínicas: mostrar até 3 grupos resumidos;
- Informações: mostrar 1 bloco agrupado.

Se houver mais, exibir contagem:

“Ver mais 5 revisões”
“Ver mais 8 observações”

Não tratar esse limite como perda de informação.

==================================================
PARTE 4 — HIERARQUIA DO PAINEL DIREITO
==================================================

Organizar visualmente o painel direito nesta ordem:

1. Cabeçalho “Plano em construção”
2. Duração e frequência
3. Resumo da sessão
4. Revisão do plano
5. Observações clínicas
6. Informações
7. Exercícios selecionados
8. Salvar plano
9. Visualizar plano

Aplicar separação visual clara entre:

- resumo;
- análise;
- exercícios incluídos;
- ações finais.

Evitar que tudo pareça um único bloco contínuo.

==================================================
PARTE 5 — TIPOGRAFIA E DENSIDADE
==================================================

A interface atual força letras pequenas para caber todo o conteúdo.

Não diminuir mais a fonte.

Preferir:

- menos conteúdo visível simultaneamente;
- mais largura quando um painel estiver recolhido;
- textos resumidos;
- detalhes expansíveis.

Garantir legibilidade:

- títulos de alerta claramente maiores que o corpo;
- dados principais destacados;
- listas completas só no estado expandido;
- espaçamento consistente;
- contraste suficiente.

Não transformar a tela em dashboard de métricas.

Manter aparência clínica, sóbria e elegante.

==================================================
PARTE 6 — JANELA “AJUSTAR”
==================================================

A janela “Ajustar” continua aprovada conceitualmente.

Nesta etapa, não redesenhar a dose novamente.

Apenas garantir que:

- ao abrir Ajustar, o cartão tenha espaço suficiente;
- o painel direito possa expandir quando a biblioteca estiver recolhida;
- Breve/Padrão/Estendido permaneçam legíveis;
- detalhes de modalidade, assistência e preferências não comprimam a dose;
- nenhum texto seja cortado de forma inadequada.

Caso o painel direito esteja estreito:

- priorizar expansão do painel;
- não reduzir fonte;
- não esconder dados clínicos essenciais.

==================================================
PARTE 7 — EXERCÍCIOS SELECIONADOS
==================================================

A lista de exercícios já incluídos também deve poder ser compactada visualmente.

Cada exercício, no estado fechado, deve mostrar apenas:

- nome;
- protocolo;
- duração;
- carga;
- fadiga;
- botão Ajustar;
- remover;
- controle de ordem.

Descrição completa, perfil cognitivo, modalidade e demais informações ficam em “Ver detalhes”.

Não abrir ajustes de vários exercícios simultaneamente por padrão.

Ao abrir Ajustar em um exercício:

- fechar automaticamente o ajuste anteriormente aberto, ou
- permitir apenas um ajuste aberto por vez.

Escolher a solução mais simples e consistente com o código atual.

==================================================
PARTE 8 — ESTADO E SEGURANÇA
==================================================

Recolher ou expandir painéis não pode:

- alterar exercícios;
- mudar protocolos;
- mudar ordem;
- recalcular incorretamente;
- salvar automaticamente;
- apagar filtros;
- alterar progresso;
- tocar no nível;
- modificar o formato persistido do plano.

O botão Salvar plano continua habilitado pelas mesmas regras técnicas atuais.

Nenhum painel ou detalhe visual pode bloquear o salvamento.

==================================================
TESTES OBRIGATÓRIOS
==================================================

Criar ou atualizar testes para provar:

1. Biblioteca pode ser recolhida e reaberta.
2. Painel do plano pode ser recolhido e reaberto.
3. Estados dos exercícios selecionados permanecem intactos.
4. Filtros e busca permanecem intactos após recolher/reabrir.
5. Não é possível perder os dois painéis simultaneamente.
6. Preferência local é restaurada.
7. Alertas continuam disponíveis no estado expandido.
8. O resumo exibe contagens corretas.
9. “Ver mais” não apaga ocorrências.
10. Posição preferencial agrupada continua acessível.
11. Um plano com 34 exercícios não renderiza 66 cartões completos.
12. O núcleo continua devolvendo todas as ocorrências.
13. Salvar plano não é bloqueado.
14. Trocar protocolo continua recalculando duração.
15. Abrir Ajustar não altera dose.
16. Apenas um ajuste fica aberto por vez, se essa regra for adotada.
17. Nenhum dado de nível é tocado.
18. TypeScript sem erros.
19. Suíte completa passando.
20. Build passando.

==================================================
VALIDAÇÃO VISUAL
==================================================

Validar manualmente estes estados:

1. Ambos os painéis abertos.
2. Biblioteca recolhida.
3. Plano recolhido.
4. Plano com poucos exercícios.
5. Plano focal em memória operacional.
6. Plano com duração excessiva.
7. Plano com muitos alertas.
8. Plano teste com 34 exercícios.
9. Um exercício com Ajustar aberto.
10. Exercício com modalidade.
11. Exercício com assistência.
12. Notebook com largura intermediária.

Na validação com 34 exercícios:

- a interface deve continuar legível;
- os alertas devem aparecer resumidos;
- detalhes devem abrir sob demanda;
- o painel não pode parecer um artigo contínuo;
- a tipografia não deve precisar ser reduzida;
- Salvar plano deve continuar disponível.

==================================================
ESCOPO
==================================================

Pode alterar:

- layout da página do plano;
- componentes da biblioteca;
- componentes do painel do plano;
- PrescriptionSummary;
- ExerciseCard / ExerciseRow;
- componentes visuais de agrupamento e expansão;
- estado local de UI;
- testes correspondentes.

Não alterar:

- núcleo clínico;
- regras de alerta;
- protocolos;
- durações;
- carga;
- fadiga;
- interferência;
- exercícios;
- progressão;
- nível;
- banco;
- migrations;
- APIs;
- formato persistido;
- modalidade;
- dose legada;
- experiência do paciente.

Antes de implementar, faça uma leitura do código real e informe:

1. quais componentes controlam hoje as duas colunas;
2. onde fica o estado de expansão dos exercícios;
3. como o painel é responsivo;
4. quais arquivos serão alterados;
5. qual estratégia será usada para persistir o estado visual.

Depois implementar em dois lotes:

Lote A:
- painéis retráteis e layout responsivo.

Lote B:
- cartões resumidos, detalhes expansíveis e redução da densidade.

Ao final de cada lote:

- rodar TypeScript;
- rodar suíte completa;
- rodar build;
- revisar diff;
- confirmar que somente UI foi alterada.

Depois publicar para validação visual.

Não iniciar tutoriais.

Não iniciar nova fase.

Pare após publicar e aguarde minha validação.

## 04/08/2026 13:33
Perfeito. Pode seguir conforme planejado.

Não altere a arquitetura clínica nem as regras de prescrição. Conclua o Lote A, rode as provas e depois siga para o Lote B.

Após publicar os dois lotes juntos, pare para minha validação visual.

## 04/08/2026 13:45
Perfeito. Pode seguir conforme planejado.

Não altere a arquitetura clínica nem as regras de prescrição. Conclua o Lote A, rode as provas e depois siga para o Lote B.

Após publicar os dois lotes juntos, pare para minha validação visual.
