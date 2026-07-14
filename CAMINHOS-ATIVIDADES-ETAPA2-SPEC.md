# CAMINHOS PARA A META — Etapa 2: as 90 atividades (spec oficial da Kamylla, 2026-07-13)

> Cadastrar EXATAMENTE 90 atividades (30 Crianças + 30 Adolescentes + 30 Adultos e idosos)
> usando a infraestrutura pronta (types/caminhos-meta.ts, lib/caminhos-meta.ts). NÃO
> reformular arquitetura/telas/mecânica. Mapeamento de modos da spec → interno:
> organizar→`ordenar` · identificar ação desnecessária→`intruso` · escolher prioridades→
> `prioridade` · completar o plano→`completar` · corrigir uma ordem→`corrigir` ·
> reorganizar após mudança→`reorganizar` · resolver um imprevisto→`problema` ·
> plano alternativo→`plano_alternativo`.

## REGRAS GERAIS (todas as atividades)

1. Biblioteca = classificação interna do painel do terapeuta (nunca exibida ao paciente); sem limite/bloqueio por idade; terapeuta pode escolher qualquer atividade p/ qualquer paciente. 2. SEM imagens (cartões só texto + áudio opcional). 3. Ordenação: embaralhar as ações a cada execução (a tela já faz) SEM alterar a ordem correta cadastrada. 4. Linguagem simples, objetiva, concreta; sem ironia/metáfora/ambiguidade. 5. Toda atividade tem: id, título, biblioteca, categoria, nível, modo, meta, instrução, ações, tipo de correção, ordem principal OU dependências, 3 níveis de dica, feedback correto/parcial/incorreto, explicação funcional, leitura em voz alta (acessibilidade.audioAcoes true), ativo. 6. DICAS (gerar por atividade): D1 orientação geral ("Pense no que precisa acontecer primeiro para alcançar a meta." ou equivalente); D2 uma relação obrigatória sem entregar tudo; D3 apoio direto (primeira ação ou alteração principal). 7. FEEDBACK específico: correto explica POR QUE a organização alcança a meta; parcial aponta o que revisar sem apagar; incorreto orienta reconsiderar uma relação específica. 8. Atividades com imprevisto registram: plano original, obstáculo, recursos, restrições, solução correta, ações que devem mudar, explicação da adaptação. 9. PROIBIDO: banho, troca de roupa, banheiro, nudez, violência, armas, álcool, drogas, automedicação, fogo por crianças, atravessar bloqueios, ações ilegais, desconhecidos, dados pessoais, tarefas domésticas perigosas, instruções médicas, conteúdo humilhante/discriminatório. 10. Mais de uma ordem válida → correção `dependencias`; todas as posições obrigatórias → `ordem_exata`. 11. NÃO inventar etapas que mudem a lógica definida abaixo. 12. Categoria interna: mapear para a união fechada do type (rotina|escola|comunidade|trabalho|organizacao|planejamento|autonomia) mais próxima da categoria textual da spec.

---

## BIBLIOTECA CRIANÇAS (ids cm_c01..cm_c30)

**C01 Guardar os materiais de escrita** · organização escolar · N1 · ordenar · Meta: Guardar os materiais de escrita depois de uma atividade. · ordem_exata: 1 Juntar os lápis e as canetas → 2 Colocar os materiais no estojo → 3 Fechar o estojo → 4 Guardar o estojo no lugar.

**C02 Guardar um jogo de tabuleiro** · organização · N1 · ordenar · Meta: Guardar corretamente um jogo depois de brincar. · ordem_exata: 1 Juntar todas as peças → 2 Conferir se nenhuma peça ficou na mesa → 3 Colocar as peças dentro da caixa → 4 Fechar a caixa → 5 Guardar a caixa no lugar.

**C03 Organizar os livros usados** · organização · N1 · ordenar · Meta: Guardar os livros utilizados durante uma atividade. · ordem_exata: 1 Juntar os livros usados → 2 Fechar os livros → 3 Levar os livros até a estante → 4 Colocar os livros no lugar indicado.

**C04 Preparar o material de desenho** · atividade escolar · N1 · ordenar · Meta: Preparar os materiais para fazer um desenho. · dependencias — Ações: Escolher a folha de papel; Pegar os lápis de cor; Colocar os materiais sobre a mesa; Começar o desenho. Precedências: folha→começar; lápis→começar; materiais na mesa→começar.

**C05 Regar uma planta** · rotina funcional · N1 · ordenar · Meta: Regar uma planta e guardar os materiais. · ordem_exata: 1 Pegar o regador → 2 Colocar água no regador → 3 Levar o regador até a planta → 4 Regar a planta → 5 Guardar o regador.

**C06 Lavar as mãos** · higiene segura (permitida: lavar mãos ok) · N2 · ordenar · Meta: Lavar e secar as mãos. · ordem_exata: 1 Abrir a torneira → 2 Molhar as mãos → 3 Colocar sabonete → 4 Esfregar as mãos → 5 Enxaguar → 6 Fechar a torneira → 7 Secar as mãos.

**C07 Preparar a mochila** · organização escolar · N2 · ordenar · Meta: Preparar a mochila para o próximo dia de aula. · ordem_exata: 1 Verificar quais atividades haverá → 2 Separar os materiais necessários → 3 Colocar os materiais na mochila → 4 Conferir se está faltando alguma coisa → 5 Fechar a mochila.

**C08 Fazer uma tarefa escolar** · escola · N2 · ordenar · Meta: Realizar e guardar uma tarefa escolar. · ordem_exata: 1 Ler a instrução da tarefa → 2 Separar os materiais necessários → 3 Fazer a atividade → 4 Revisar as respostas → 5 Guardar a tarefa no local indicado.

**C09 Preparar um lanche frio** · alimentação segura · N2 · ordenar · Meta: Preparar um lanche que não precisa de fogão ou forno. · ordem_exata: 1 Lavar as mãos → 2 Separar o prato e os ingredientes → 3 Montar o lanche → 4 Colocar o lanche no prato → 5 Guardar os ingredientes restantes.

**C10 Entrar em uma aula on-line** · tecnologia e escola · N2 · ordenar · Meta: Entrar em uma aula on-line no horário correto. · ordem_exata: 1 Verificar o horário da aula → 2 Ligar o dispositivo → 3 Abrir o aplicativo indicado → 4 Selecionar a atividade → 5 Entrar na aula.

**C11 Guardar os brinquedos** · organização · N3 · intruso · Meta: Guardar os brinquedos depois de brincar. · dependencias + intrusa — Úteis (ordem): 1 Juntar os brinquedos → 2 Separar os brinquedos por tipo → 3 Colocar os brinquedos nas caixas → 4 Guardar as caixas no lugar. Intrusa: "Começar a assistir a um vídeo".

**C12 Preparar uma atividade de leitura** · escola · N3 · intruso · Meta: Preparar-se para ler um livro. · dependencias + intrusa — Úteis: Escolher o livro; Sentar-se em um local adequado; Abrir o livro; Começar a leitura (precedências em cadeia). Intrusa: "Abrir um jogo no celular".

**C13 Preparar o material para uma aula** · escola · N3 · intruso · Meta: Separar os materiais pedidos pelo professor. · ordem_exata + intrusa: 1 Ler a lista de materiais → 2 Procurar os materiais → 3 Colocar os materiais sobre a mesa → 4 Conferir a lista → 5 Guardar os materiais na mochila. Intrusa: "Colocar um brinquedo que não foi pedido".

**C14 Montar um quebra-cabeça** · lazer e organização · N3 · intruso · Meta: Organizar o espaço e montar um quebra-cabeça. · dependencias + intrusa — Úteis: Abrir a caixa; Separar as peças; Procurar peças que combinam; Montar o quebra-cabeça; Guardar as peças depois da atividade. Intrusa: "Esconder algumas peças".

**C15 Preparar a mochila sem distrações** · organização escolar · N3 · intruso · Meta: Preparar a mochila somente com itens relacionados à aula. · dependencias + intrusa — Úteis: Conferir o horário; Separar os cadernos; Colocar o estojo; Colocar a garrafa de água; Fechar a mochila (fechar por último). Intrusa: "Colocar um prato usado dentro da mochila".

**C16 Cinco minutos para sair para a escola** · prioridade · N4 · prioridade · Meta: Escolher as três ações mais importantes antes de sair para a escola. · Instrução: Escolha as três ações que devem ser feitas primeiro. Essenciais (3): Colocar os materiais na mochila; Pegar o estojo; Pegar a garrafa de água. Opcionais: Escolher um adesivo para o caderno; Organizar novamente todos os livros da estante. Irrelevante: Começar a assistir a um filme.

**C17 Começar a tarefa de casa** · prioridade escolar · N4 · prioridade · Meta: Escolher as ações mais importantes para começar a tarefa. Essenciais (3): Ler a atividade; Separar os materiais; Colocar o dispositivo em modo silencioso. Opcionais: Escolher a cor da caneta; Organizar todos os objetos do quarto. Irrelevante: Abrir um jogo antes de começar.

**C18 Preparar uma apresentação** · escola · N4 · prioridade · Meta: Escolher as quatro ações mais importantes antes de uma apresentação escolar. Essenciais (4): Revisar o conteúdo; Conferir se o arquivo abre; Praticar a apresentação; Guardar uma cópia do arquivo. Opcionais: Trocar novamente a cor do título; Escolher um desenho decorativo. Irrelevante: Assistir a vídeos sem relação com o trabalho.

**C19 Visitar a biblioteca** · comunidade e escola · N5 · completar · Meta: Organizar uma visita à biblioteca para retirar um livro. · ordem_exata; plano com lacuna na posição 4: 1 Verificar o horário da biblioteca → 2 Separar o cartão da biblioteca → 3 Ir até a biblioteca → 4 ___ → 5 Registrar a retirada do livro → 6 Levar o livro. Correta: "Procurar o livro desejado". Alternativas incorretas (opções): "Guardar o cartão antes de chegar"; "Voltar para casa sem procurar o livro".

**C20 Fazer um trabalho escolar** · planejamento escolar · N5 · corrigir · Meta: Corrigir a organização de um trabalho escolar. · ordem_exata: 1 Ler o tema → 2 Procurar informações → 3 Organizar as informações → 4 Fazer o trabalho → 5 Revisar → 6 Entregar. Apresentar inicialmente com "Fazer o trabalho" e "Procurar informações" INVERTIDAS.

**C21 A sala da atividade mudou** · adaptação escolar · N6 · reorganizar · Meta: Chegar à sala correta para participar da atividade. Plano inicial: 1 Verificar o horário → 2 Ir até a sala 2 → 3 Entrar na atividade. Mudança: aviso informa que a atividade será na sala 5. Alteração correta: substituir "Ir até a sala 2" por "Ir até a sala 5". (imprevisto ativo; acoesQueDevemMudar=[ir até a sala 2]; solucao=[ir até a sala 5])

**C22 O lápis quebrou** · resolução de problemas · N7 · problema · Meta: Continuar uma atividade de escrita. Plano inicial: usar o lápis para completar a atividade. Obstáculo: o lápis quebrou. Recurso: existe outro lápis apontado dentro do estojo. Solução: "Pegar o outro lápis e continuar a atividade". Incorretas: "Parar toda a atividade"; "Tentar escrever com o lápis quebrado sem procurar outro".

**C23 A folha da atividade não está na pasta** · resolução de problemas · N7 · problema · Meta: Realizar a atividade enviada pelo professor. Obstáculo: a folha impressa não está na pasta. Recurso: o professor disponibilizou a mesma atividade no aplicativo da escola. Solução: "Abrir a atividade no aplicativo". (incorretas coerentes: "Desistir da atividade"; "Esperar sem avisar ninguém")

**C24 Começou a chover** · flexibilidade · N7 · plano_alternativo · Meta: Participar de uma atividade recreativa. Plano inicial: fazer a atividade no pátio. Obstáculo: começou a chover. Recurso: a escola preparou uma sala coberta para a mesma atividade. Solução: "Realizar a atividade na sala coberta". (incorretas: "Ficar no pátio na chuva"; "Cancelar a atividade")

**C25 O livro não está disponível** · flexibilidade escolar · N7 · plano_alternativo · Meta: Ler o livro indicado para a atividade. Obstáculo: o exemplar não está na estante. Recurso: a biblioteca possui uma cópia digital autorizada. Solução: "Solicitar acesso à cópia digital". (incorretas: "Desistir da leitura"; "Levar outro livro qualquer sem avisar")

**C26 A internet parou de funcionar** · flexibilidade escolar · N7 · plano_alternativo · Meta: Continuar uma atividade de estudo. Obstáculo: a internet parou. Recurso: o conteúdo necessário já está impresso. Solução: "Usar o conteúdo impresso para continuar a atividade". (incorretas: "Parar de estudar"; "Ficar esperando a internet voltar sem fazer nada")

**C27 A entrada habitual está fechada** · segurança e flexibilidade · N7 · problema · Meta: Entrar no local da atividade com segurança. Obstáculo: a entrada habitual está fechada. Recurso: um funcionário informa que a entrada lateral está aberta e sinalizada. Solução: "Usar a entrada lateral indicada". PROIBIDA como opção correta: atravessar a entrada fechada (use como incorreta: "Tentar atravessar a entrada fechada" + "Voltar para casa sem avisar ninguém").

**C28 Um integrante do grupo faltou** · trabalho em grupo · N7 · reorganizar · Meta: Concluir uma atividade em grupo. Obstáculo: um integrante faltou. Recurso: o professor orientou dividir as tarefas desse integrante entre os presentes. Solução: "Redistribuir as tarefas entre os integrantes presentes". (incorretas: "Cancelar a atividade"; "Deixar as tarefas dele sem fazer")

**C29 Mudança de sala e de material** · flexibilidade avançada · N8 · plano_alternativo · Meta: Participar de uma atividade escolar. Plano inicial: Ir à sala 3; Usar folhas azuis. 1ª mudança: atividade transferida para a sala 6. 2ª mudança: folhas azuis acabaram; professor liberou folhas brancas. Solução (2 ações): "Ir para a sala 6" + "Utilizar as folhas brancas". acoesQueDevemMudar = [ir à sala 3, usar folhas azuis].

**C30 Preparar o estande da feira** · flexibilidade avançada · N8 · plano_alternativo · Meta: Preparar um estande para uma feira escolar. Plano inicial: Levar o cartaz impresso; Organizar o estande no espaço 4. 1ª mudança: estande transferido para o espaço 7. 2ª mudança: o cartaz foi danificado. Recursos: arquivo do cartaz salvo; impressora disponível com supervisão do responsável. Solução (3): "Ir para o espaço 7" + "Solicitar a impressão de uma nova cópia do cartaz" + "Organizar o estande no novo espaço".

---

## BIBLIOTECA ADOLESCENTES (ids cm_a01..cm_a30)

**A01 Organizar os arquivos de um trabalho** · organização escolar · N1 · ordenar · ordem_exata: 1 Localizar os arquivos → 2 Criar uma pasta com o nome do trabalho → 3 Mover os arquivos para a pasta → 4 Conferir se todos os arquivos foram incluídos → 5 Salvar uma cópia. Meta: Organizar os arquivos de um trabalho escolar.

**A02 Preparar o espaço de estudo** · estudo · N1 · ordenar · dependencias — Ações: Retirar objetos que não serão utilizados; Separar os materiais de estudo; Colocar os materiais sobre a mesa; Iniciar a atividade. Precedências: retirar→colocar na mesa; separar→iniciar; colocar na mesa→iniciar. Meta: Preparar um espaço adequado para estudar.

**A03 Preparar os materiais para um curso** · organização · N1 · ordenar · ordem_exata: 1 Verificar a lista de materiais → 2 Separar os itens necessários → 3 Conferir os itens → 4 Colocar os itens na bolsa → 5 Fechar a bolsa. Meta: Preparar os materiais para participar de um curso.

**A04 Preparar uma bolsa para atividade esportiva** · organização · N2 · ordenar · dependencias — Ações (cadeia): Consultar a lista da atividade → Separar os itens solicitados → Colocar os itens na bolsa → Conferir a lista → Fechar a bolsa. Meta: Preparar os materiais solicitados para uma atividade esportiva.

**A05 Entregar um trabalho digital** · escola e tecnologia · N2 · ordenar · ordem_exata: 1 Concluir o trabalho → 2 Revisar o conteúdo → 3 Conferir o nome do arquivo → 4 Salvar uma cópia → 5 Enviar pelo canal indicado → 6 Conferir a confirmação de envio. Meta: Finalizar e entregar um trabalho digital.

**A06 Realizar uma pesquisa escolar** · planejamento escolar · N2 · ordenar · ordem_exata: 1 Ler o tema → 2 Definir o que precisa ser pesquisado → 3 Consultar fontes adequadas → 4 Registrar as informações → 5 Organizar o conteúdo → 6 Revisar. Meta: Realizar uma pesquisa escolar.

**A07 Organizar uma reunião de trabalho em grupo** · trabalho em grupo · N2 · ordenar · dependencias — Ações: Verificar a disponibilidade dos participantes → Definir o horário → Informar o horário ao grupo → Preparar os materiais → Participar da reunião (preparar materiais pode trocar com informar; disponibilidade→horário→informar→participar; preparar→participar). Meta: Organizar uma reunião para realizar um trabalho.

**A08 Planejar o transporte para um curso** · comunidade · N2 · ordenar · ordem_exata: 1 Verificar o endereço → 2 Consultar as opções de transporte → 3 Conferir os horários → 4 Escolher uma opção adequada → 5 Sair com antecedência → 6 Seguir até o local. Meta: Planejar o deslocamento para chegar a um curso no horário.

**A09 Preparar uma atividade voluntária** · comunidade · N2 · ordenar · dependencias — Ações: Confirmar o horário; Verificar quais materiais serão necessários; Separar os materiais; Conferir o endereço; Chegar ao local combinado (verificar materiais→separar; tudo→chegar). Meta: Preparar-se para participar de uma atividade voluntária.

**A10 Organizar documentos para uma inscrição** · autonomia · N2 · ordenar · ordem_exata: 1 Ler a lista de documentos → 2 Localizar os documentos → 3 Conferir a validade e a legibilidade → 4 Organizar os documentos → 5 Entregar ou enviar pelo canal indicado. Meta: Preparar documentos para realizar uma inscrição.

**A11 Plano de estudo com uma distração** · estudo · N3 · intruso · dependencias + intrusa — Úteis: Definir o conteúdo → Separar o material → Estudar o conteúdo → Fazer uma revisão → Registrar as dúvidas. Intrusa: "Abrir vídeos sem relação com o conteúdo". Meta: Organizar uma sessão de estudo.

**A12 Preparar uma aula on-line** · tecnologia · N3 · intruso · ordem_exata + intrusa: 1 Verificar o horário → 2 Carregar o dispositivo → 3 Conferir a conexão → 4 Abrir o aplicativo → 5 Entrar na aula. Intrusa: "Abrir um jogo antes da aula". Meta: Preparar-se para uma aula on-line.

**A13 Preparar uma candidatura para estágio** · preparação profissional · N3 · intruso · ordem_exata + intrusa: 1 Ler os requisitos da vaga → 2 Preparar o currículo → 3 Revisar o currículo → 4 Preencher as informações solicitadas → 5 Enviar a candidatura → 6 Conferir a confirmação. Intrusa: "Enviar um arquivo sem relação com a candidatura". Meta: Enviar uma candidatura para uma vaga de estágio.

**A14 Preparar-se para uma prova** · prioridade escolar · N4 · prioridade · Essenciais (4): Conferir os conteúdos da prova; Organizar um horário de estudo; Estudar os conteúdos; Revisar os pontos de dificuldade. Opcionais: Trocar a capa do caderno; Reorganizar todos os arquivos antigos. Irrelevante: Assistir a uma série durante o horário de estudo. Meta: Escolher as quatro ações mais importantes para preparar-se para uma prova.

**A15 Pouco tempo antes de sair** · prioridade · N4 · prioridade · Essenciais (4): Conferir o horário; Pegar os documentos necessários; Pegar as chaves; Verificar o caminho. Opcionais: Reorganizar uma gaveta; Trocar o papel de parede do celular. Irrelevante: Começar um filme. Meta: Escolher as ações essenciais antes de sair para um compromisso.

**A16 Organizar uma feira escolar** · planejamento · N4 · prioridade · Essenciais (5): Definir o tema; Dividir as tarefas; Preparar os materiais; Revisar a apresentação; Conferir o local e o horário. Opcionais: Alterar detalhes decorativos; Criar um segundo título. Irrelevante: Assistir a vídeos sem relação com a feira. Meta: Escolher as ações essenciais para organizar uma apresentação em uma feira escolar.

**A17 Completar a entrega de um projeto** · planejamento escolar · N5 · completar · ordem_exata; lacuna na posição 3: 1 Finalizar o projeto → 2 Revisar → 3 ___ → 4 Enviar pelo canal solicitado → 5 Conferir a confirmação. Correta: "Salvar uma cópia do arquivo". (incorretas: "Apagar o arquivo original"; "Enviar sem revisar de novo")

**A18 Fazer uma cópia de segurança** · tecnologia · N5 · corrigir · ordem_exata: 1 Localizar o arquivo → 2 Conferir se é a versão atual → 3 Copiar o arquivo → 4 Salvar em outro local seguro → 5 Abrir a cópia para verificar. Apresentar inicialmente "Salvar em outro local" ANTES de "Copiar o arquivo".

**A19 Preparar uma saída de um dia** · autonomia · N5 · prioridade · Essenciais (5): Documento necessário; Telefone carregado; Informação do endereço; Meio de pagamento definido; Garrafa de água, quando apropriado. Opcionais: Livro; Fones de ouvido. Irrelevante: Levar objetos sem relação com a atividade e que dificultem o transporte. Meta: Escolher os itens essenciais para uma saída de um dia.

**A20 Organizar uma semana de estudos** · planejamento · N5 · ordenar · dependencias — Ações: Conferir todas as datas → Identificar a atividade com prazo mais próximo → Dividir tarefas maiores em partes → Distribuir as tarefas pelos dias disponíveis → Reservar um momento para revisão → Conferir o plano. (datas→identificar→distribuir; dividir→distribuir; distribuir→conferir plano; reservar→conferir plano). Meta: Organizar uma semana de estudos considerando datas de entrega.

**A21 O caminho habitual está fechado** · flexibilidade · N6 · reorganizar · Meta: Chegar ao curso no horário. Plano inicial: utilizar o caminho habitual. Mudança: a rua está fechada. Recurso: o aplicativo de mapas mostra uma rota alternativa segura. Solução: "Substituir o caminho habitual pela rota alternativa indicada". acoesQueDevemMudar=[utilizar o caminho habitual].

**A22 O telefone está com pouca bateria** · resolução de problemas · N7 · problema · Meta: Utilizar o telefone durante um compromisso. Obstáculo: bateria quase acabando. Recursos: tomada segura; carregador disponível; tempo antes de sair. Solução: "Conectar o telefone ao carregador antes de sair". (incorretas: "Sair com o telefone descarregando"; "Desligar o telefone e não avisar ninguém")

**A23 A internet está indisponível** · flexibilidade e tecnologia · N7 · plano_alternativo · Meta: Entregar um trabalho dentro do prazo. Obstáculo: internet de casa indisponível. Recursos: telefone com dados móveis; arquivo pronto. Solução: "Utilizar os dados móveis para enviar o arquivo". (incorretas: "Esperar a internet voltar e perder o prazo"; "Desistir da entrega")

**A24 O local está fechado** · comunidade · N7 · plano_alternativo · Meta: Comprar um material necessário para uma atividade. Obstáculo: a loja planejada está fechada. Recurso: outra loja aberta na mesma região com o material. Solução: "Ir à outra loja indicada". (incorretas: "Voltar para casa sem o material"; "Ficar esperando a loja abrir")

**A25 Um participante do grupo faltou** · trabalho em grupo · N7 · reorganizar · Meta: Concluir uma apresentação em grupo. Obstáculo: um participante faltou. Recursos: conteúdo dele disponível; professor permitiu redistribuir. Solução: "Redistribuir a apresentação entre os participantes presentes". (incorretas: "Cancelar a apresentação"; "Apresentar sem a parte dele")

**A26 O prazo foi antecipado** · prioridade e flexibilidade · N7 · reorganizar · Meta: Entregar um projeto dentro do novo prazo. Mudança: prazo antecipado. Ações: Concluir a parte obrigatória; Revisar os pontos principais; Enviar dentro do prazo; Fazer melhorias opcionais; Alterar elementos decorativos. Solução (ordem): 1 Priorizar a parte obrigatória → 2 Revisar os pontos principais → 3 Enviar dentro do prazo → 4 Deixar melhorias opcionais para depois (opcionais/decorativas = tipo opcional/desnecessaria).

**A27 O arquivo principal não abre** · flexibilidade tecnológica · N7 · problema · Meta: Apresentar um trabalho digital. Obstáculo: o arquivo principal não abre. Recurso: cópia em PDF salva em outro local. Solução: "Abrir e utilizar a cópia em PDF". (incorretas: "Cancelar a apresentação"; "Insistir no arquivo que não abre")

**A28 A reunião mudou de local** · adaptação · N7 · reorganizar · Meta: Participar de uma reunião de projeto. Plano inicial: ir para a sala de estudos. Mudança: a reunião será na biblioteca. Solução: "Substituir o local anterior pela biblioteca e seguir para o novo local". acoesQueDevemMudar=[ir para a sala de estudos].

**A29 Mudança de horário e de caminho** · flexibilidade avançada · N8 · plano_alternativo · Meta: Chegar ao curso. Plano inicial: Sair às 14h; Utilizar a Rua Central. 1ª mudança: o curso começará 30 minutos mais cedo. 2ª mudança: a Rua Central está fechada. Recursos: é possível sair 30 min mais cedo; existe um desvio sinalizado. Solução (2): "Atualizar o horário de saída" + "Utilizar o desvio sinalizado".

**A30 Projeto com duas mudanças** · flexibilidade avançada · N8 · plano_alternativo · Meta: Concluir uma apresentação de projeto. Plano inicial: Apresentar na sala multimídia; Utilizar os materiais próprios do grupo. 1ª mudança: sala multimídia indisponível; escola indicou sala alternativa. 2ª mudança: parte do material não chegou; escola disponibilizou materiais equivalentes. Solução (3): "Transferir a apresentação para a sala indicada" + "Utilizar os materiais equivalentes disponíveis" + "Conferir a apresentação antes do início".

---

## BIBLIOTECA ADULTOS E IDOSOS (ids cm_ad01..cm_ad30)

**AD01 Organizar documentos para uma consulta** · organização documental · N1 · ordenar · ordem_exata: 1 Ler a lista de documentos solicitados → 2 Localizar os documentos → 3 Conferir se estão legíveis → 4 Colocar os documentos em uma pasta → 5 Levar a pasta ao compromisso. SEM orientações médicas. Meta: Preparar os documentos solicitados para uma consulta.

**AD02 Preparar uma lista de compras** · autonomia · N1 · ordenar · ordem_exata: 1 Verificar os produtos disponíveis → 2 Identificar o que está faltando → 3 Registrar os itens → 4 Revisar a lista → 5 Levar a lista para a compra. Meta: Criar uma lista com os produtos necessários.

**AD03 Organizar o espaço de trabalho** · organização · N1 · ordenar · dependencias — Ações: Retirar objetos desnecessários; Separar os materiais que serão utilizados; Colocar os materiais em local acessível; Iniciar a atividade (retirar→colocar; separar→colocar; colocar→iniciar). Meta: Preparar um espaço para realizar uma atividade.

**AD04 Preparar uma reunião on-line** · tecnologia · N2 · ordenar · ordem_exata: 1 Conferir o horário → 2 Ligar o dispositivo → 3 Verificar a conexão → 4 Abrir o aplicativo → 5 Selecionar a reunião → 6 Entrar. Meta: Entrar em uma reunião on-line.

**AD05 Organizar contas domésticas** · organização financeira · N2 · ordenar · dependencias — Ações: Reunir as contas → Conferir as datas → Separar as contas por vencimento → Identificar quais precisam de atenção primeiro → Guardar os comprovantes depois do pagamento realizado pelo meio escolhido pelo usuário. SEM orientação financeira específica. Meta: Organizar contas para pagamento.

**AD06 Preparar materiais para um curso** · educação · N2 · ordenar · ordem_exata: 1 Consultar a lista → 2 Localizar os materiais → 3 Conferir os materiais → 4 Colocar os itens em uma bolsa → 5 Fechar a bolsa → 6 Levar os materiais. Meta: Preparar os materiais solicitados para um curso.

**AD07 Planejar uma ida ao mercado** · autonomia · N2 · ordenar · ordem_exata: 1 Verificar o que está faltando → 2 Fazer uma lista → 3 Definir o meio de pagamento → 4 Conferir o horário do mercado → 5 Ir ao mercado → 6 Procurar os produtos → 7 Conferir a lista → 8 Realizar o pagamento → 9 Levar as compras. Meta: Planejar uma ida ao mercado.

**AD08 Organizar arquivos digitais** · tecnologia · N2 · ordenar · ordem_exata: 1 Localizar os arquivos → 2 Criar uma pasta → 3 Nomear a pasta → 4 Mover os arquivos → 5 Conferir se foram movidos → 6 Salvar uma cópia quando necessário. Meta: Organizar arquivos digitais em uma pasta.

**AD09 Preparar itens para uma saída de um dia** · autonomia · N2 · ordenar · dependencias — Ações: Conferir o compromisso; Verificar o endereço; Separar documentos necessários; Separar telefone e chaves; Conferir se os itens estão disponíveis; Sair no horário planejado (conferir compromisso primeiro; sair por último; separações→conferir itens→sair). Meta: Preparar os itens necessários para uma saída.

**AD10 Preparar documentos para um atendimento** · organização documental · N2 · ordenar · ordem_exata: 1 Verificar quais documentos foram solicitados → 2 Localizar os documentos → 3 Conferir os dados → 4 Organizar os documentos → 5 Levar ou enviar pelo canal oficial indicado. NÃO solicitar/exibir dados reais. Meta: Preparar documentos para um atendimento bancário ou administrativo.

**AD11 Organizar contas sem distrações** · organização · N3 · intruso · dependencias + intrusa — Úteis: Reunir as contas → Conferir os vencimentos → Colocar em ordem de data → Identificar as mais próximas → Guardar os documentos organizados. Intrusa: "Começar a assistir a um programa antes de terminar". Meta: Organizar contas por data.

**AD12 Preparar uma reunião on-line sem distrações** · tecnologia · N3 · intruso · ordem_exata + intrusa: 1 Conferir o horário → 2 Carregar o dispositivo → 3 Verificar a internet → 4 Abrir o aplicativo → 5 Entrar na reunião. Intrusa: "Abrir um vídeo sem relação com a reunião". Meta: Preparar-se para uma reunião on-line.

**AD13 Realizar uma compra planejada** · autonomia · N3 · intruso · ordem_exata + intrusa: 1 Conferir a lista → 2 Procurar os produtos → 3 Verificar se todos foram localizados → 4 Ir ao caixa → 5 Realizar o pagamento → 6 Levar as compras. Intrusa: "Abandonar a lista e escolher apenas produtos não planejados". Meta: Comprar os produtos registrados em uma lista.

**AD14 Organizar as tarefas da manhã** · prioridade · N4 · prioridade · Essenciais (4): Conferir o horário do compromisso; Separar os documentos necessários; Verificar o caminho; Pegar as chaves e o telefone. Opcionais: Organizar uma estante; Alterar a decoração de uma mesa. Irrelevante: Iniciar uma atividade longa sem relação com o compromisso. Meta: Escolher as tarefas essenciais antes de um compromisso.

**AD15 Preparar-se para um atendimento** · prioridade · N4 · prioridade · Essenciais (5): Conferir o horário; Separar os documentos; Verificar o endereço; Definir o transporte; Sair com antecedência adequada. Opcionais: Organizar arquivos antigos; Limpar uma gaveta. Irrelevante: Começar uma atividade que impeça a saída no horário. Meta: Escolher as ações mais importantes antes de sair para um atendimento.

**AD16 Planejar uma viagem curta** · planejamento · N4 · prioridade · Essenciais (6): Definir o destino; Conferir as datas; Verificar o transporte; Verificar onde ficará; Separar documentos necessários; Confirmar as informações. Opcionais: Escolher um livro; Organizar fotografias antigas. Irrelevante: Realizar uma tarefa sem relação com a viagem. Meta: Escolher as ações essenciais para planejar uma viagem curta.

**AD17 Enviar uma encomenda** · comunidade · N5 · completar · ordem_exata; lacuna na posição 4: 1 Separar o objeto → 2 Embalar o objeto → 3 Identificar o destinatário → 4 ___ → 5 Realizar o envio pelo serviço escolhido → 6 Guardar o comprovante. Correta: "Levar a encomenda ao ponto de atendimento". (incorretas: "Guardar a encomenda em casa"; "Enviar sem embalar")

**AD18 Entrar em um atendimento on-line** · tecnologia · N5 · corrigir · ordem_exata: 1 Conferir o horário → 2 Ligar o dispositivo → 3 Verificar a internet → 4 Abrir o aplicativo → 5 Selecionar o atendimento → 6 Entrar. Apresentar inicialmente "Entrar" ANTES de "Abrir o aplicativo".

**AD19 Organizar um cômodo em pouco tempo** · prioridade · N5 · prioridade · Essenciais (4): Retirar objetos que bloqueiam a passagem; Guardar os objetos fora do lugar; Organizar a área onde a visita será recebida; Conferir se o espaço está seguro. Opcionais: Reorganizar todos os armários; Separar fotografias antigas. Irrelevante: Iniciar uma reforma no mesmo momento. Meta: Escolher as ações essenciais para organizar um espaço antes de receber uma visita.

**AD20 Organizar os compromissos da semana** · planejamento · N5 · ordenar · dependencias — Ações: Reunir as informações dos compromissos → Conferir datas e horários → Identificar conflitos → Registrar os compromissos → Ajustar os conflitos → Revisar a agenda. (reunir→conferir→identificar; registrar após conferir; identificar→ajustar; ajustar→revisar; registrar→revisar). Meta: Organizar os compromissos de uma semana.

**AD21 A rua habitual está fechada** · flexibilidade · N6 · reorganizar · Meta: Chegar a um compromisso. Plano inicial: passar pela rua habitual. Mudança: a rua está fechada. Recurso: existe um desvio oficial sinalizado. Solução: "Utilizar o desvio oficial". PROIBIDO como correta: atravessar o bloqueio (use como incorreta). acoesQueDevemMudar=[passar pela rua habitual].

**AD22 Um produto não está disponível** · flexibilidade cotidiana · N7 · problema · Meta: Comprar um produto para uma atividade. Obstáculo: o produto planejado não está disponível. Recurso: a lista informa um produto substituto equivalente e permitido. Solução: "Escolher o substituto indicado". SEM medicamentos. (incorretas: "Voltar sem nenhum produto"; "Levar um produto diferente que não é equivalente")

**AD23 O dispositivo está com pouca bateria** · tecnologia · N7 · problema · Meta: Participar de um atendimento on-line. Obstáculo: pouca bateria. Recursos: carregador disponível; tempo antes do atendimento. Solução: "Conectar o dispositivo ao carregador". (incorretas: "Participar sem carregar e ficar sem bateria"; "Cancelar o atendimento")

**AD24 O local do compromisso mudou** · adaptação · N7 · reorganizar · Meta: Comparecer ao compromisso correto. Plano inicial: ir para o endereço A. Mudança: mensagem oficial informa que será no endereço B. Solução: "Atualizar o endereço e seguir para o endereço B". acoesQueDevemMudar=[ir para o endereço A].

**AD25 O transporte foi cancelado** · flexibilidade · N7 · plano_alternativo · Meta: Chegar a um compromisso no horário. Obstáculo: o transporte planejado foi cancelado. Recurso: outra linha disponível, horário compatível, mesma direção. Solução: "Utilizar a linha alternativa indicada". (incorretas: "Desistir do compromisso"; "Esperar o transporte cancelado")

**AD26 Falta de energia durante uma atividade** · resolução de problemas · N7 · plano_alternativo · Meta: Informar o responsável por uma reunião sobre a impossibilidade de continuar pelo computador. Obstáculo: falta de energia. Recursos: telefone carregado; contato do responsável disponível. Solução: "Usar o telefone para comunicar a situação". NÃO orientar manipular instalações elétricas. (incorretas: "Mexer no quadro de energia"; "Não avisar ninguém")

**AD27 Um documento impresso não foi encontrado** · flexibilidade documental · N7 · problema · Meta: Apresentar um documento em um atendimento. Obstáculo: a cópia impressa não foi encontrada. Recursos: o serviço aceita cópia digital (informado previamente); cópia digital salva no dispositivo. Solução: "Apresentar a cópia digital pelo canal aceito". (incorretas: "Desistir do atendimento"; "Discutir com o atendente")

**AD28 O ponto de atendimento está fechado** · comunidade · N7 · plano_alternativo · Meta: Realizar um atendimento administrativo. Obstáculo: o ponto planejado está fechado. Recurso: aviso oficial informa outro ponto aberto no mesmo dia. Solução: "Ir ao ponto alternativo informado". (incorretas: "Voltar para casa e perder o prazo"; "Ficar esperando o ponto fechado abrir")

**AD29 Mudança no tempo e no transporte** · flexibilidade avançada · N8 · plano_alternativo · Meta: Participar de uma atividade comunitária. Plano inicial: Ir a pé; Participar na área externa. 1ª mudança: chuva forte; atividade transferida para área coberta. 2ª mudança: trajeto a pé bloqueado temporariamente; existe transporte até a entrada alternativa. Solução (3): "Utilizar o transporte disponível" + "Entrar pelo acesso alternativo" + "Participar na área coberta".

**AD30 Evento com mudança de local e equipe** · flexibilidade avançada · N8 · plano_alternativo · Meta: Ajudar na organização de um evento comunitário. Plano inicial: Organizar o evento no salão principal; Dividir as tarefas entre quatro voluntários. 1ª mudança: salão principal indisponível; autorizado o salão secundário. 2ª mudança: um voluntário não poderá comparecer; tarefas podem ser redistribuídas entre os três presentes. Solução (4): "Transferir a atividade para o salão secundário" + "Redistribuir as tarefas essenciais entre os três voluntários" + "Retirar ou adiar tarefas opcionais" + "Conferir o novo plano antes do início".

---

## VALIDAÇÃO OBRIGATÓRIA (entrega)
1-3) exatamente 30/30/30 por biblioteca; 4-5) sem duplicatas, ids únicos; 6-8) todas com nível, modo e correção; 9-10) embaralhar na apresentação preservando a ordem cadastrada (a tela já faz); 11) 3 dicas em todas; 12) feedback correto/parcial/incorreto em todas; 13-14) problemas com solução sustentada pelo enunciado, sem recurso não informado; 15) sem imagens; 16) sem bloqueio por idade; 17-18) todas no painel do terapeuta, misturáveis; 19-20) treino domiciliar + registro corretos.
Entregar tabela: biblioteca × quantidade × níveis contemplados × modos × com imprevisto × com intrusa × com prioridades.
