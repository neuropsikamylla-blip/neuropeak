# Perfis cognitivos dos exercícios — Lote A

Este documento cobre **somente os 12 exercícios do Lote A (Atenção e Velocidade)**. Os demais exercícios do catálogo serão analisados nos lotes seguintes.

As fichas foram derivadas da leitura do componente executável, das bibliotecas associadas, da geração de estímulos e da condição de encerramento. Nome oficial, categoria e subdomínio atuais são transcritos de `docs/architecture/CANONICAL_EXERCISES.md`; eles não foram usados para inferir o perfil. Os valores seguem a escala de importância mecânica definida em `01-cognitive-domain-taxonomy.md` e descrevem apenas o **perfil basal**. Modificadores avançados são qualitativos e não constituem prescrição.

## 1. Agentes Focus

1. **Nome oficial:** Agentes Focus.
2. **ID técnico:** `focus-agents`.
3. **Categoria atual:** Atenção.
4. **Subdomínio atual:** Atenção Sustentada.
5. **Objetivo funcional aparente:** localizar, entre personagens visualmente concorrentes, aquele que satisfaz um critério previamente apresentado.
6. **Resumo da mecânica real:** antes de cada rodada, um comando textual, acompanhado quando aplicável por amostras visuais de cor/acessório/objeto, define um ou dois alvos. O paciente confirma com “OK”; o comando então some e os personagens aparecem espalhados em duas dimensões, com deriva contínua e sem sobreposição intencional. No perfil inicial, o critério é uma cor e há um alvo. O toque em um personagem encerra a rodada; em comandos de dois alvos, o primeiro correto permanece marcado e a rodada continua até o segundo, um distrator ou o fim da janela. A implementação ativa mantém todos os personagens no campo (`cai = false`); o ramo de queda existe no arquivo, mas não participa da mecânica atual. O exercício prossegue por rodadas até o temporizador ativo da sessão ser verificado ao final de uma delas.
7. **Resposta exigida do paciente:** tocar no personagem que satisfaz integralmente o comando; quando houver dois alvos, tocar em ambos, sem selecionar distratores.
8. **Unidade básica da tarefa:** apresentação e retenção de um comando, seguida de uma busca visual e uma ou duas seleções.
9. **Domínio principal:** **busca visual**.
10. **Domínios secundários:** atenção seletiva; controle de distração; armazenamento verbal de curto prazo; armazenamento visuoespacial de curto prazo; manutenção de meta; discriminação visual; varredura espacial; figura-fundo; velocidade de busca.
11. **Demandas instrumentais:** visão de cores, formas, acessórios e lateralidade; leitura do comando no modo visual; uso de mouse ou toque; precisão visuomotora para selecionar personagens móveis. Essas demandas não equivalem, por si, a treino de linguagem ou velocidade motora.
12. **Estratégias possíveis:** repetição subvocal do comando; conversão do comando em imagem mental; busca por um atributo saliente e confirmação dos demais; varredura sistemática; eliminação de personagens incompatíveis; marcação mental do primeiro alvo em comandos duplos; autorregulação antes do toque.
13. **Perfil basal 0–3:** busca visual — **3**; atenção seletiva — **2**; controle de distração — **2**; armazenamento verbal de curto prazo — **2**; manutenção de meta — **2**; discriminação visual — **2**; varredura espacial — **2**; armazenamento visuoespacial de curto prazo — **1**; figura-fundo — **1**; velocidade de busca — **1**.
14. **Modificadores nos níveis avançados:** o aumento de personagens amplia busca visual e varredura; o movimento mais rápido aumenta rapidez perceptiva e pressão temporal; distratores que compartilham parte do critério aumentam comparação e controle de distração; comandos por acessório, conjunção de atributos e lateralidade aumentam discriminação e manutenção do critério; dois alvos elevam memória operacional verbal e monitoramento do que já foi encontrado; a correção explícita de uma regra abandonada eleva flexibilidade cognitiva e alternância de regra; critérios negativos elevam controle inibitório. A janela por alvo se estreita ao longo dos passos. O modo de queda não é modificador vigente porque está desativado por uma constante local.
15. **Processos pouco ou não recrutados:** memória episódica, memória prospectiva, planejamento, resolução de problemas, tomada de decisão cotidiana, processamento auditivo sequencial no modo visual e raciocínio dedutivo. Atenção sustentada não é uma exigência relevante da unidade discreta de busca e não pode ser inferida pelo simples tempo total da atividade.
16. **Risco de confundir requisito da tarefa com alvo de treino:** reconhecer cores e acessórios e tocar com precisão são requisitos perceptivomotores, não os alvos clínicos por definição. A retenção do comando não deve ser apagada pelo rótulo “atenção”. Inversamente, a presença de movimento e de um temporizador não transforma toda a tarefa em treino de rapidez. As etapas chamadas internamente de “memoriaTrabalho”, “flexibilidade” e “inibicao” são rótulos de telemetria; a classificação aqui deriva das operações implementadas.
17. **Impacto da modalidade:** o seletor Visual · Visual + áudio · Somente áudio foi aprovado, mas **ainda não está implementado**; a análise a seguir é projeção e pressupõe que os personagens e a resposta continuem visuais. **Perfil comum:** em qualquer modo, o paciente codifica um critério, mantém esse critério após o início da cena, busca os personagens e compara atributos. **Visual:** o comando escrito e as amostras visuais favorecem leitura, armazenamento verbal e memória visual do critério; a memória auditiva não é necessária. **Visual + áudio:** acrescenta codificação auditivo-verbal e pode aumentar atenção dividida ou interferência quando o paciente tenta acompanhar simultaneamente texto e fala. Porém, a redundância audiovisual pode **facilitar**, e não dificultar, a codificação quando as duas fontes são sincronizadas e congruentes; o áudio pode compensar dificuldade de leitura. **Somente áudio:** elimina a leitura do conteúdo do comando e reduz as pistas visuais de codificação; aumenta armazenamento verbal auditivo e a conversão entre descrição auditiva e busca visual. A memória visual do comando perde apoio, enquanto discriminação dos personagens continua necessária. Repetições, sincronização e permanência de ícones precisam ser definidas antes de estimar atenção dividida e interferência.
18. **Impacto da leitura assistiva:** no código atual, `playTTS` fala o **comando da rodada** apenas no caminho acionado pelo ID legado auditivo; não há fala das instruções gerais, e o controle de repetição mencionado no tutorial não aparece no render atual. Falar a instrução geral apenas reduziria a barreira de acesso, sem mudar o alvo. Falar o comando é diferente: trata-se de **conteúdo da própria tarefa**, que precisa ser mantido depois do “OK”, portanto pode reduzir a exigência de leitura e acrescentar apoio auditivo. Repeti-lo depois da apresentação funcionaria como nova exposição ao conteúdo que deveria ser retido e poderia alterar memória verbal e desempenho; esse uso deve ser registrado separadamente da modalidade projetada.
19. **Confiança:** **alto** para a mecânica atual; **moderado** para os efeitos de modalidade, por serem projeção ainda sem contrato implementado.
20. **Questões que precisam de decisão clínica humana:** qual processo deve ocupar o rótulo clínico principal frente ao subdomínio atual; se e quando o comando pode ser repetido; o que exatamente some em Somente áudio; se ícones visuais permanecem; como registrar facilitação audiovisual; se comandos de dois alvos, negação e mudança de regra devem permanecer no mesmo perfil ou ser reportados separadamente; e se a inconsistência entre o tutorial e a ausência do botão de áudio deve invalidar registros atuais desse recurso.

## 2. Conecta Números

1. **Nome oficial:** Conecta Números.
2. **ID técnico:** `trilha-visual`.
3. **Categoria atual:** Atenção.
4. **Subdomínio atual:** Atenção Seletiva.
5. **Objetivo funcional aparente:** localizar números espalhados e conectá-los em ordem crescente.
6. **Resumo da mecânica real:** a rodada gera números consecutivos, começando em 1, distribuídos aleatoriamente em uma grade espacial com pequenas variações de posição. O paciente deve tocar no próximo número esperado. Acertos acrescentam o ponto ao caminho e desabilitam o número já usado; toques fora da ordem apenas incrementam erros e não alteram o próximo esperado. A rodada termina quando o maior número é alcançado e é considerada correta com no máximo um erro. Após o feedback, outra disposição é gerada; o encerramento da sessão é verificado entre rodadas.
7. **Resposta exigida do paciente:** tocar sucessivamente 1, 2, 3 e assim por diante até completar a sequência.
8. **Unidade básica da tarefa:** localizar e selecionar o próximo número de uma sequência crescente dentro de um arranjo visual.
9. **Domínio principal:** **busca visual**.
10. **Domínios secundários:** sequenciamento; atenção seletiva; varredura espacial; manutenção de meta; monitoramento; percepção de posição; discriminação visual; velocidade de busca.
11. **Demandas instrumentais:** reconhecimento visual de algarismos, visão do campo completo, uso de mouse ou toque e coordenação visuomotora. Reconhecer algarismos é requisito de acesso e não demonstra, isoladamente, treino de linguagem ou cálculo.
12. **Estratégias possíveis:** varredura sistemática por linhas ou quadrantes; busca antecipada do número seguinte; uso do caminho desenhado e do esmaecimento dos itens já tocados; repetição subvocal da sequência; desaceleração deliberada antes do toque.
13. **Perfil basal 0–3:** busca visual — **3**; sequenciamento — **2**; atenção seletiva — **2**; varredura espacial — **2**; manutenção de meta — **2**; monitoramento — **1**; percepção de posição — **1**; discriminação visual — **1**; velocidade de busca — **1**.
14. **Modificadores nos níveis avançados:** mais números ampliam o campo, a extensão da sequência e a necessidade de cobrir regiões sem omissão; o painel se alonga e a distribuição passa a usar mais linhas/colunas, aumentando varredura espacial. A interface não introduz regra alternante, distratores de outra classe nem prazo próprio por rodada. A mudança dinâmica relevante é quantitativa — extensão e densidade da sequência — e não um novo processo executivo.
15. **Processos pouco ou não recrutados:** atenção dividida, atenção alternada, alternância de regra, controle inibitório, memória episódica, processamento auditivo, rotação mental, planejamento e tomada de decisão. Armazenamento visuoespacial é pouco necessário porque números tocados e caminho permanecem visíveis.
16. **Risco de confundir requisito da tarefa com alvo de treino:** conhecimento da ordem numérica é pré-requisito; não se deve concluir que a tarefa treina cálculo. O desenho de uma linha e o ato de tocar não são raciocínio visuoespacial ou velocidade de processamento por si. A sessão temporizada não basta para atribuir atenção sustentada.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade neste exercício.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva implementada. A instrução escrita não é o conteúdo sequencial que precisa ser encontrado.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se o domínio clínico principal deve permanecer atenção seletiva ou ser registrado como busca visual; qual papel atribuir ao conhecimento numérico prévio; e se erros fora de ordem sem reinício representam suficientemente o monitoramento pretendido.

## 3. Informação em Foco

1. **Nome oficial:** Informação em Foco.
2. **ID técnico:** `informacao-em-foco`.
3. **Categoria atual:** Atenção.
4. **Subdomínio atual:** Atenção Seletiva.
5. **Objetivo funcional aparente:** localizar, comparar e integrar informações escritas de produtos para escolher a alternativa que atende a uma pergunta ou situação cotidiana.
6. **Resumo da mecânica real:** cada atividade mostra três ou quatro produtos comparáveis, com imagens e campos textuais gerados a partir de catálogo e de um snapshot estável de preço/validade. A pergunta pode exigir localização de um valor, comparação de extremos, uma ou mais condições, validade, conservação, ingredientes, alérgenos, uma situação cotidiana ou leitura direta de frase impressa na embalagem. Há exatamente uma resposta válida. O paciente toca em um cartão; no primeiro erro recebe explicação e pista sem revelação, podendo tentar novamente; no segundo erro, ou após acerto, a resposta é revelada. O paciente avança manualmente, e o temporizador da sessão é verificado após a questão resolvida.
7. **Resposta exigida do paciente:** ler a pergunta e os dados relevantes, comparar os cartões e tocar no produto que satisfaz integralmente o critério.
8. **Unidade básica da tarefa:** uma questão com conjunto de produtos, um a três critérios e seleção de uma alternativa.
9. **Domínio principal:** **atenção seletiva**.
10. **Domínios secundários:** busca visual; comparação; compreensão textual; leitura; manutenção de meta; memória operacional verbal; varredura espacial; tomada de decisão; tomada de decisão cotidiana nos itens situacionais.
11. **Demandas instrumentais:** leitura visual de perguntas, rótulos e valores; percepção de imagens e pequenos campos; distinção de números, datas e unidades; uso de mouse ou toque; eventual ampliação da embalagem. A decodificação básica é requisito, enquanto localizar e integrar informação escrita faz parte do alvo funcional desta mecânica.
12. **Estratégias possíveis:** PARE–LEIA–PROCURE–CONFIRA–RESPONDA; sublinhado mental dos critérios; varredura campo a campo; comparação em pares; eliminação de alternativas que falham em uma condição; categorização por família de produto; uso da ampliação; releitura e autorregulação após a pista.
13. **Perfil basal 0–3:** atenção seletiva — **3**; busca visual — **2**; comparação — **2**; compreensão textual — **2**; leitura — **2**; manutenção de meta — **2**; memória operacional verbal — **1**; varredura espacial — **1**; tomada de decisão — **1**.
14. **Modificadores nos níveis avançados:** mais produtos e campos aumentam busca e comparação; duas ou três condições elevam memória operacional verbal, manutenção de meta e monitoramento; valores próximos e distratores que atendem parcialmente aos critérios aumentam controle de distração e eliminação de hipóteses; ordem variável dos campos reduz apoio espacial previsível; questões de situação acrescentam tomada de decisão cotidiana e integração de contexto; leitura direta da embalagem aumenta leitura, figura-fundo e discriminação visual, pois a informação-alvo é removida do quadro auxiliar. A mecânica não cria prazo por questão.
15. **Processos pouco ou não recrutados:** tempo de reação simples, pressão temporal por item, controle inibitório como supressão de resposta automática, alternância de regra, planejamento, rotação mental, memória episódica e processamento auditivo sequencial. O feedback com segunda tentativa apoia autocorreção, mas a resposta errada inicial é explicada pela interface, não detectada autonomamente.
16. **Risco de confundir requisito da tarefa com alvo de treino:** baixa alfabetização, visão reduzida e dificuldade com datas/unidades podem reduzir o desempenho sem refletir atenção seletiva. Em contrapartida, chamar toda leitura de “instrumental” apagaria que localizar e integrar texto funcional é parte explícita da tarefa. Comparar preços ou datas não significa treino de uso funcional de dinheiro. A seleção de um produto cotidiano também não implica autonomia funcional ampla.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade neste exercício. Os tipos internos “quadro”, “situação” e “leituraEmbalagem” são formatos de questão, não modalidades Visual/áudio.
18. **Impacto da leitura assistiva:** o botão atual fala somente `questao.pergunta`. **Instrução geral:** o tutorial e a estratégia não são falados pelo recurso atual; se fossem, isso seria acessibilidade de entrada. **Conteúdo da tarefa:** nas questões de quadro, a pergunta falada repete o critério que deve orientar a busca e pode reduzir leitura e manutenção verbal, mas não lê valores dos cartões. Nas questões situacionais, a pergunta costuma ser genérica; contexto e “Pedido”, que contêm as condições relevantes, não são falados. Nas questões de embalagem, a pergunta falada repete a frase que deve ser localizada, mas a embalagem continua visual. **Repetição de conteúdo a memorizar:** a pergunta permanece visível e não há fase de memorização seguida de ocultação; ouvir novamente funciona como apoio à leitura e ao critério, não como modalidade auditiva nem como teste de retenção. O uso ainda pode mudar a comparabilidade entre execuções e deve ser registrado.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** qual peso clínico dar à leitura funcional versus atenção seletiva; se tipos de quadro, situação e embalagem precisam de resultados separados; como interpretar uso de pista e ampliação; se a leitura assistiva deve incluir contexto/pedido ou permanecer limitada à pergunta; e como controlar o efeito de alfabetização, familiaridade com rótulos e conhecimento de produtos.

## 4. Rastreamento de Objetos

1. **Nome oficial:** Rastreamento de Objetos.
2. **ID técnico:** `mot`.
3. **Categoria atual:** Atenção.
4. **Subdomínio atual:** Atenção Dividida.
5. **Objetivo funcional aparente:** manter a identidade de vários alvos enquanto eles se movem entre objetos visualmente idênticos.
6. **Resumo da mecânica real:** uma arena apresenta várias bolas; duas ou mais são inicialmente douradas. Após a fase de memorização, todas ficam visualmente iguais e se movem, rebatendo em bordas e colidindo entre si. Quando o movimento para, o paciente deve selecionar exatamente a quantidade de alvos indicada e confirmar. A rodada registra quantos alvos verdadeiros foram selecionados, mostra a posição correta e inicia outra rodada; o encerramento da sessão é verificado depois da confirmação.
7. **Resposta exigida do paciente:** acompanhar mentalmente as bolas inicialmente marcadas e, ao final, tocar nas posições correspondentes antes de confirmar.
8. **Unidade básica da tarefa:** codificação de alvos, rastreamento simultâneo durante o movimento e identificação final.
9. **Domínio principal:** **rastreamento visual**.
10. **Domínios secundários:** atenção dividida; memória operacional visuoespacial; armazenamento visuoespacial de curto prazo; atualização de informação; controle de distração; orientação atencional; percepção de posição; atenção sustentada; relações espaciais.
11. **Demandas instrumentais:** visão do campo inteiro e do destaque inicial; percepção de movimento; uso de mouse ou toque; coordenação visuomotora para selecionar posições finais. A velocidade do clique não integra o critério de acerto da rodada.
12. **Estratégias possíveis:** ensaio mental das trajetórias; atribuição de rótulos espaciais; agrupamento dos alvos; alternância rápida do olhar entre eles; uso de relações relativas com bordas ou outras bolas; contagem das seleções; revisão antes de confirmar.
13. **Perfil basal 0–3:** rastreamento visual — **3**; atenção dividida — **2**; memória operacional visuoespacial — **2**; atualização de informação — **2**; controle de distração — **2**; orientação atencional — **2**; percepção de posição — **2**; armazenamento visuoespacial de curto prazo — **2**; atenção sustentada — **1**; relações espaciais — **1**.
14. **Modificadores nos níveis avançados:** o aumento do número de alvos eleva atenção dividida, memória operacional visuoespacial e monitoramento; mais bolas ampliam interferência e controle de distração; maior velocidade aumenta atualização contínua das posições; colisões e cruzamentos aumentam a necessidade de preservar identidade apesar da proximidade. A tarefa não acrescenta regras verbais nem resposta sob prazo na fase de identificação.
15. **Processos pouco ou não recrutados:** leitura, processamento auditivo, memória verbal, raciocínio dedutivo, planejamento, tomada de decisão cotidiana, controle inibitório e alternância de regra.
16. **Risco de confundir requisito da tarefa com alvo de treino:** tocar em várias bolas não define atenção dividida por si; ela é relevante porque várias identidades precisam ser acompanhadas simultaneamente. O destaque inicial recruta armazenamento visuoespacial, mas o alvo principal é manter identidades durante o movimento, não recordar uma cena estática. A precisão do toque não deve ser tratada como velocidade de processamento.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade neste exercício.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva implementada e o material a acompanhar é visual.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se o relatório deve separar falhas de rastreamento, troca de identidade e seleção final; se “atenção dividida” deve permanecer como subdomínio ou aparecer apenas como processo secundário; e como interpretar estratégias de agrupamento versus rastreamento individual.

## 5. Dupla Tarefa

1. **Nome oficial:** Dupla Tarefa.
2. **ID técnico:** `dual-task`.
3. **Categoria atual:** Atenção.
4. **Subdomínio atual:** Atenção Dividida.
5. **Objetivo funcional aparente:** responder a dois fluxos simultâneos: detectar uma conjunção de forma e cor e reconhecer repetições numéricas N-back.
6. **Resumo da mecânica real:** dois loops assíncronos permanecem ativos ao mesmo tempo. No painel superior, formas coloridas aparecem sucessivamente; o paciente deve tocar na arena somente quando a forma e a cor correspondem à regra. No painel inferior, dígitos aparecem em outro ritmo; o botão “IGUAL” deve ser pressionado quando o atual repete o de uma ou duas posições atrás. Ausência de resposta a alvos conta como omissão e toques em não alvos contam como falsos positivos. Em configurações avançadas, a regra superior muda por blocos e há um aviso. O primeiro loop que detecta o fim do temporizador encerra os dois e consolida resultados separados.
7. **Resposta exigida do paciente:** monitorar simultaneamente os dois painéis e executar duas respostas independentes — tocar na arena superior para o alvo visual e no botão inferior para a correspondência N-back.
8. **Unidade básica da tarefa:** monitoramento concorrente de dois fluxos, cada um com seu próprio estímulo, regra, janela de resposta e possibilidade de omissão.
9. **Domínio principal:** **atenção dividida**.
10. **Domínios secundários:** memória operacional verbal; atualização de informação; atenção sustentada; atenção seletiva; controle de distração; controle inibitório; manutenção de meta; tempo de reação de escolha; velocidade de processamento; pressão temporal; discriminação visual; atualização.
11. **Demandas instrumentais:** visão de cores, formas e dígitos; leitura das regras e rótulos de botão; uso de mouse ou toque em duas regiões; velocidade motora suficiente para as janelas dos dois fluxos. O tempo do movimento não deve ser confundido com a rapidez da decisão.
12. **Estratégias possíveis:** repetição subvocal da janela numérica; agrupamento rítmico; varredura alternada entre painéis; priorização temporária do estímulo que acabou de mudar; codificação verbal da conjunção-alvo; manutenção de duas metas; autorregulação para não tocar em correspondências parciais.
13. **Perfil basal 0–3:** atenção dividida — **3**; memória operacional verbal — **3**; atualização de informação — **3**; atenção sustentada — **2**; atenção seletiva — **2**; controle de distração — **2**; controle inibitório — **2**; manutenção de meta — **2**; tempo de reação de escolha — **2**; velocidade de processamento — **2**; pressão temporal — **2**; discriminação visual — **2**; atualização — **2**.
14. **Modificadores nos níveis avançados:** o encurtamento das janelas dos dois fluxos aumenta pressão temporal e velocidade de decisão; a passagem de 1-back para 2-back amplia a janela mantida e a atualização de informação; a mudança do alvo superior entre blocos acrescenta alternância de regra e flexibilidade cognitiva, além de exigir substituição da meta ativa. Distratores com apenas a cor ou apenas a forma corretas mantêm controle de distração e inibição de respostas parciais.
15. **Processos pouco ou não recrutados:** planejamento, resolução de problemas, memória episódica, memória prospectiva, processamento auditivo, rotação mental, tomada de decisão cotidiana e cognição social.
16. **Risco de confundir requisito da tarefa com alvo de treino:** a sequência numérica é uma subtarefa de memória operacional central, não mero “distrator” da atenção. A resposta superior não é reação simples, pois exige decisão sobre uma conjunção e a opção de não responder. Alternar o olhar entre painéis é uma possível estratégia, mas não substitui o fato de que os fluxos avançam simultaneamente.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade neste exercício.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva implementada. Ler as regras e o botão é uma demanda instrumental inicial, enquanto o fluxo N-back é visual.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** como ponderar os dois fluxos quando um fica sem eventos antes do outro; se os resultados devem gerar perfis separados além da média; se N-back visual de dígitos deve ser clinicamente codificado como memória operacional verbal; e se o aviso de mudança de regra fornece apoio suficiente para interpretar a alternância avançada.

## 6. Vigilância

1. **Nome oficial:** Vigilância.
2. **ID técnico:** `vigilancia`.
3. **Categoria atual:** Atenção.
4. **Subdomínio atual:** Atenção Sustentada.
5. **Objetivo funcional aparente:** detectar rapidamente qual de oito pipas difere das demais e indicar a região em que ela estava após o conjunto desaparecer.
6. **Resumo da mecânica real:** após um ponto de fixação, oito pipas aparecem simultaneamente em posições ao redor do centro; sete usam uma variante e uma usa a outra. Não há modelo reapresentado durante o jogo: a diferente deve ser identificada pela comparação do conjunto. As pipas somem, e o paciente toca na região onde estava a diferente. A resposta é classificada pela posição mais próxima, com tolerância espacial; o feedback reapresenta o alvo na posição correta. Toda tentativa contém um alvo. Exposição, resposta e feedback se repetem em blocos, e o encerramento ocorre após concluir a tentativa em andamento quando o temporizador ativo se esgota.
7. **Resposta exigida do paciente:** identificar durante a breve exposição a pipa discrepante, reter sua posição e tocar na região correspondente depois que os estímulos somem.
8. **Unidade básica da tarefa:** exposição simultânea de um conjunto com um item discrepante, retenção espacial breve e localização por toque.
9. **Domínio principal:** **rapidez perceptiva**.
10. **Domínios secundários:** discriminação visual; armazenamento visuoespacial de curto prazo; atenção seletiva; controle de distração; orientação atencional; percepção de posição; figura-fundo; integração visuoespacial; atenção sustentada.
11. **Demandas instrumentais:** acuidade e visão de cor/forma suficientes para distinguir os pares de pipas; percepção do fundo; uso de mouse ou toque e localização visuomotora aproximada. A precisão fina do cursor não é exigida porque a classificação usa regiões.
12. **Estratégias possíveis:** comparação do item discrepante com o padrão majoritário; varredura circular; fixação central com atenção periférica; codificação da posição por direção verbal; associação da posição a um relógio; ensaio visuoespacial até a tela de resposta.
13. **Perfil basal 0–3:** rapidez perceptiva — **3**; discriminação visual — **3**; armazenamento visuoespacial de curto prazo — **3**; atenção seletiva — **2**; controle de distração — **2**; orientação atencional — **2**; percepção de posição — **2**; figura-fundo — **1**; integração visuoespacial — **1**; atenção sustentada — **1**.
14. **Modificadores nos níveis avançados:** a exposição progressivamente mais breve aumenta rapidez perceptiva; pares com diferenças de tom menores ou diferenças estruturais específicas alteram discriminação visual; fundo mais complexo aumenta figura-fundo e controle de distração; arranjos expandidos ou irregulares alteram orientação, varredura e codificação da posição. O número de pipas e a presença de um alvo em toda tentativa permanecem constantes.
15. **Processos pouco ou não recrutados:** tempo de reação simples, tempo de reação de escolha como resposta motora rápida, atenção dividida, alternância de regra, planejamento, memória verbal, memória episódica, leitura e processamento auditivo. A resposta espacial não tem janela própria e sua rapidez não controla a progressão.
16. **Risco de confundir requisito da tarefa com alvo de treino:** apesar do nome e do subdomínio atual, não é uma tarefa clássica de vigilância com eventos raros ou tentativas sem alvo. A repetição em sessão não basta para tornar atenção sustentada central. Discriminar rapidamente a diferença e reter sua localização são operações centrais distintas; um erro pode ocorrer em qualquer uma delas. A velocidade de exposição não deve ser confundida com velocidade motora de apontar.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade neste exercício.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva implementada e o conteúdo crítico é visuoespacial.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se o subdomínio atual deve ser revisto; se respostas adjacentes devem ser interpretadas separadamente de falhas de detecção; se diferenças por cor e por estrutura devem ter perfis próprios; e se rapidez perceptiva ou discriminação visual deve ser o domínio principal adotado clinicamente.

## 7. Tempo de Reação

1. **Nome oficial:** Tempo de Reação.
2. **ID técnico:** `tempo-reacao`.
3. **Categoria atual:** Velocidade de Processamento.
4. **Subdomínio atual:** Tempo de Reação.
5. **Objetivo funcional aparente:** responder rapidamente a balões verdes em movimento, evitando balões de outras cores.
6. **Resumo da mecânica real:** levas de balões atravessam a área por uma única direção de cada vez. No começo dos níveis iniciais, a leva contém apenas um alvo verde, o que se aproxima de reação simples. Após acertos, a própria sessão acrescenta mais alvos e distratores; o paciente então precisa distinguir o verde-alvo de outras cores e não tocar nos distratores. Um alvo tocado registra resposta correta; distrator tocado ou alvo que sai da tela registra erro. Quando todos os alvos da leva são resolvidos, outra leva aparece. O encerramento é verificado ao registrar resultados depois do temporizador da sessão.
7. **Resposta exigida do paciente:** tocar nos balões do verde-alvo antes que saiam do campo e abster-se de tocar nas demais cores.
8. **Unidade básica da tarefa:** detecção/interceptação de um ou mais alvos móveis dentro de uma leva com presença variável de distratores.
9. **Domínio principal:** **tempo de reação de escolha**.
10. **Domínios secundários:** tempo de reação simples no trecho basal; pressão temporal; atenção seletiva; discriminação visual; controle de distração; controle inibitório; rapidez perceptiva; rastreamento visual; orientação atencional; velocidade de processamento.
11. **Demandas instrumentais:** visão de cores, percepção de movimento, alcance visuomotor, velocidade e precisão do toque ou mouse. A latência registrada combina decisão e execução motora, portanto não isola velocidade cognitiva.
12. **Estratégias possíveis:** manter o olhar na faixa de entrada; antecipar a trajetória; confirmar o matiz antes do toque; priorizar o alvo mais próximo da saída; distribuir o olhar quando houver vários alvos; conter respostas a tons semelhantes.
13. **Perfil basal 0–3:** tempo de reação simples — **3**; pressão temporal — **3**; rapidez perceptiva — **2**; rastreamento visual — **1**; orientação atencional — **1**; velocidade de processamento — **1**.
14. **Modificadores nos níveis avançados:** após os primeiros acertos, múltiplos alvos e distratores convertem a operação em tempo de reação de escolha, com atenção seletiva e controle inibitório relevantes; tons azul-esverdeados aumentam discriminação fina e interferência; travessias mais rápidas ampliam pressão temporal; a direção passa de fixa a alternada entre levas, elevando orientação atencional; vários alvos simultâneos acrescentam rastreamento e distribuição de atenção. Assim, “reação simples” descreve apenas o trecho basal inicial, não a sessão implementada como um todo.
15. **Processos pouco ou não recrutados:** memória operacional, memória episódica, planejamento, raciocínio lógico, compreensão textual, alternância de regra, tomada de decisão cotidiana e processamento auditivo.
16. **Risco de confundir requisito da tarefa com alvo de treino:** chamar todo o exercício de reação simples ignora que a mecânica introduz seleção alvo/não alvo. Por outro lado, nos primeiros ensaios dos níveis iniciais realmente não há escolha perceptiva relevante. A velocidade do toque e características do dispositivo influenciam diretamente a latência e não equivalem a velocidade de processamento pura. Movimento do estímulo não torna o rastreamento o alvo principal.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade neste exercício.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva implementada e a regra crítica é uma associação visual simples após o tutorial.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se os ensaios basais simples e os ensaios posteriores de escolha devem ser reportados separadamente; como controlar diferenças motoras e de dispositivo; se tons próximos devem formar um indicador perceptivo próprio; e qual processo deve prevalecer no rótulo clínico principal.

## 8. Certo ou Errado

1. **Nome oficial:** Certo ou Errado.
2. **ID técnico:** `certo-ou-errado`.
3. **Categoria atual:** Velocidade de Processamento.
4. **Subdomínio atual:** Resposta Rápida.
5. **Objetivo funcional aparente:** julgar se uma conduta cotidiana é adequada ou inadequada em temas de segurança, saúde, higiene, trânsito e relações sociais.
6. **Resumo da mecânica real:** uma frase descreve uma conduta do cotidiano, acompanhada por um emoji. O paciente escolhe “CERTO” ou “ERRADO”. A frase permanece visível até a resposta e não há prazo por item. Após a escolha, a interface informa a resposta esperada e mostra uma explicação; outra situação aparece depois do feedback. A idade, quando fornecida, filtra cenários infantis ou adolescentes, e a dificuldade apenas aumenta a probabilidade editorial de cenários marcados como menos óbvios. O encerramento da sessão é verificado depois da resposta.
7. **Resposta exigida do paciente:** compreender a situação e selecionar uma das duas avaliações normativas.
8. **Unidade básica da tarefa:** julgamento binário de uma afirmação sobre conduta cotidiana.
9. **Domínio principal:** **tomada de decisão cotidiana**.
10. **Domínios secundários:** compreensão textual; inferência; julgamento social; resolução de situações sociais; velocidade de decisão; manutenção de meta.
11. **Demandas instrumentais:** leitura da frase e dos botões, visão do emoji, uso de mouse ou toque. Alfabetização e acesso ao texto são requisitos fortes, mas não tornam linguagem o único alvo.
12. **Estratégias possíveis:** identificar o risco ou consequência; recuperar regra social/de segurança conhecida; imaginar o resultado da conduta; eliminar a opção incompatível; comparar com experiência prévia; pausar antes de responder; aprender com a explicação em repetições futuras.
13. **Perfil basal 0–3:** tomada de decisão cotidiana — **3**; compreensão textual — **2**; inferência — **2**; julgamento social — **1**; resolução de situações sociais — **1**; velocidade de decisão — **1**; manutenção de meta — **1**.
14. **Modificadores nos níveis avançados:** a implementação não encurta uma janela por item, não aumenta o número de alternativas e não muda a regra. O único modificador de dificuldade é a ponderação para cenários com maior `hardness`, atributo editorial que representa menor obviedade. Filtros etários mudam o conteúdo e a familiaridade, não a estrutura cognitiva. O perfil pode se deslocar para inferência e julgamento social conforme o cenário, mas isso não é garantido de forma paramétrica.
15. **Processos pouco ou não recrutados:** tempo de reação simples, pressão temporal por item, busca visual, rastreamento visual, memória operacional visuoespacial, alternância de regra, planejamento e processamento auditivo. Controle inibitório não é identificável apenas porque há duas opções opostas.
16. **Risco de confundir requisito da tarefa com alvo de treino:** classificá-la como velocidade de processamento porque a latência é registrada ignora que a resposta depende principalmente de conhecimento adquirido e julgamento. Leitura, escolaridade, normas culturais e familiaridade com saúde/segurança podem dominar o desempenho. Muitos itens têm resposta baseada em **memória semântica**, processo ainda ausente da taxonomia autorizada; não devem ser interpretados como medida pura de decisão ou cognição social. O emoji também pode oferecer uma pista desigual.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade neste exercício.
18. **Impacto da leitura assistiva:** não se aplica no código atual. Caso seja adicionada apenas para a frase, reduziria a barreira de leitura, mas não forneceria o conhecimento necessário ao julgamento.
19. **Confiança:** **moderado**, porque a mecânica é clara, mas o processo dominante varia com conteúdo, conhecimento prévio e critérios editoriais de `hardness`.
20. **Questões que precisam de decisão clínica humana:** se o exercício deve permanecer em Velocidade de Processamento; como validar cultural e clinicamente cada julgamento; como controlar conhecimento prévio e alfabetização; se memória semântica deve entrar na taxonomia; se cenários sociais, médicos e de segurança exigem perfis ou bancos separados; e se a explicação produz aprendizagem por repetição que deva ser distinguida do julgamento inicial.

## 9. Semáforo

1. **Nome oficial:** Semáforo.
2. **ID técnico:** `semaforo`.
3. **Categoria atual:** Velocidade de Processamento.
4. **Subdomínio atual:** Tempo de Reação.
5. **Objetivo funcional aparente:** escolher rapidamente entre avançar e parar de acordo com a cor do semáforo sinalizado.
6. **Resumo da mecânica real:** três semáforos piscam como aviso; depois, um deles é destacado e acende verde, vermelho ou amarelo. O paciente deve tocar “AVANÇAR” para verde e “PARAR” para vermelho ou amarelo. Se não responder enquanto o sinal está ativo, a implementação envia `pressedAdvance = false`: isso conta como correto em sinais de parar e errado em sinais verdes. Em configurações iniciais, os outros semáforos ficam apagados; posteriormente podem exibir cores concorrentes. Após algumas rodadas, a posição física dos dois botões se inverte periodicamente. A rodada termina por resposta ou fim da janela do sinal, e o temporizador da sessão é verificado após o feedback.
7. **Resposta exigida do paciente:** discriminar a cor do semáforo-alvo e selecionar um de dois botões segundo a associação verde–avançar / vermelho ou amarelo–parar.
8. **Unidade básica da tarefa:** um aviso, um sinal-alvo e uma decisão visuomotora entre duas respostas.
9. **Domínio principal:** **tempo de reação de escolha**.
10. **Domínios secundários:** rapidez perceptiva; atenção seletiva; discriminação visual; velocidade de decisão; pressão temporal; manutenção de meta; orientação atencional.
11. **Demandas instrumentais:** visão de cores, leitura ou reconhecimento dos botões, localização do semáforo destacado, uso de mouse ou toque e velocidade motora. A inversão dos botões aumenta a dependência de localização e leitura da resposta.
12. **Estratégias possíveis:** antecipar a chegada do sinal durante o piscar; localizar primeiro o contorno destacado; verbalizar “verde avança, outros param”; conferir a posição atual dos botões antes de responder; inibir o hábito motor de responder sempre no mesmo lado.
13. **Perfil basal 0–3:** tempo de reação de escolha — **3**; rapidez perceptiva — **2**; atenção seletiva — **2**; discriminação visual — **2**; velocidade de decisão — **2**; pressão temporal — **2**; manutenção de meta — **2**; orientação atencional — **1**.
14. **Modificadores nos níveis avançados:** a janela do sinal se estreita, aumentando pressão temporal; semáforos não alvo passam a mostrar cores, ampliando controle de distração; a inversão periódica dos botões reduz apoio de uma resposta motora espacial fixa e aumenta monitoramento do mapeamento atual. A regra semântica não muda, portanto a inversão espacial não deve ser registrada automaticamente como alternância de regra.
15. **Processos pouco ou não recrutados:** tempo de reação simples, memória operacional complexa, planejamento, raciocínio lógico, memória episódica, processamento auditivo, atenção dividida e tomada de decisão cotidiana. Como os dois tipos de sinal têm resposta motora, a mecânica não é um go/no-go puro.
16. **Risco de confundir requisito da tarefa com alvo de treino:** associar verde a “ir” pode sugerir resposta simples ou inibição, mas há discriminação e escolha entre dois botões em cada tentativa. Ler os botões, sobretudo após a troca de posição, é demanda instrumental; não é linguagem como alvo. A omissão ser registrada como “PARAR” cria uma assimetria: ausência de resposta pode ser considerada correta em dois terços das classes de cor e não representa necessariamente uma decisão válida.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade neste exercício.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva implementada. Falar o rótulo do botão durante a janela alteraria a seleção de resposta e não seria mero apoio à instrução.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se omissão em vermelho/amarelo deve contar como acerto; se resultados devem separar cor, escolha e posição do botão; quanto a associação cultural verde–avançar facilita a resposta; e se a inversão espacial pretende medir monitoramento motor ou flexibilidade cognitiva.

## 10. Busca Rápida

1. **Nome oficial:** Busca Rápida.
2. **ID técnico:** `corrida-tempo`.
3. **Categoria atual:** Velocidade de Processamento.
4. **Subdomínio atual:** Resposta Rápida.
5. **Objetivo funcional aparente:** localizar rapidamente, em uma grade de objetos, todos os itens que pertencem — ou não pertencem — à categoria indicada.
6. **Resumo da mecânica real:** cada rodada apresenta uma regra de categoria e uma grade de imagens. No modo direto, alguns itens pertencem à categoria-alvo e os demais são distratores; no modo de exclusão, os itens da categoria indicada são os que devem ser evitados e todo o restante é alvo. O paciente toca nos alvos; acertos são retirados visualmente, enquanto erros permanecem e reduzem o tempo disponível da rodada. A rodada termina quando todos os alvos são encontrados ou quando o contador chega ao fim. Quantidade de itens/alvos, proximidade semântica dos distratores e regra variam com a progressão. Quando o temporizador global é atingido entre rodadas, a interface apresenta um resumo e aguarda “Concluir”.
7. **Resposta exigida do paciente:** identificar a categoria da regra, varrer a grade e tocar em todos e somente os itens válidos antes do encerramento da rodada.
8. **Unidade básica da tarefa:** busca categorial de múltiplos alvos em uma grade sob contador regressivo.
9. **Domínio principal:** **velocidade de busca**.
10. **Domínios secundários:** busca visual; categorização; pressão temporal; atenção seletiva; controle de distração; varredura espacial; manutenção de meta; velocidade de processamento; discriminação visual; percepção de forma; controle inibitório no modo de exclusão.
11. **Demandas instrumentais:** reconhecimento visual de objetos, leitura da categoria/regra, uso de mouse ou toque, coordenação e velocidade motora. Conhecer os objetos e categorias é requisito semântico que pode limitar a busca.
12. **Estratégias possíveis:** varredura por linhas ou quadrantes; categorização rápida; confirmação do objeto antes do toque; busca por protótipos; eliminação dos itens de categorias incompatíveis; no modo de exclusão, reformulação verbal “tudo menos X”; priorização de regiões ainda não examinadas; autorregulação diante da penalidade por erro.
13. **Perfil basal 0–3:** velocidade de busca — **3**; busca visual — **3**; pressão temporal — **3**; categorização — **2**; atenção seletiva — **2**; controle de distração — **2**; varredura espacial — **2**; manutenção de meta — **2**; velocidade de processamento — **2**; discriminação visual — **1**; percepção de forma — **1**.
14. **Modificadores nos níveis avançados:** mais itens e alvos aumentam cobertura de busca e monitoramento de omissões; menos tempo reforça pressão temporal; categorias semanticamente próximas elevam categorização e controle de distração; o modo de exclusão acrescenta controle inibitório, negação da regra e seleção de um conjunto mais amplo; a alternância entre modo direto e exclusão entre rodadas eleva flexibilidade cognitiva e alternância de regra. A penalidade por erro pode favorecer confirmação e autorregulação.
15. **Processos pouco ou não recrutados:** tempo de reação simples, memória episódica, manipulação mental, planejamento de múltiplos passos, processamento auditivo, rotação mental e tomada de decisão cotidiana. Os itens cotidianos não transformam a tarefa em autonomia funcional.
16. **Risco de confundir requisito da tarefa com alvo de treino:** velocidade do toque e qualidade do dispositivo influenciam quantos itens são coletados. Reconhecimento de objetos e conhecimento de categorias — próximo de memória semântica, ainda não autorizada na matriz — podem ser confundidos com busca visual. “Não pertence” exige inibição/negação apenas no modo avançado, não no perfil basal. O uso de imagens de produtos não implica leitura funcional.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade neste exercício.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva implementada. Falar a categoria poderia reduzir a leitura instrumental, mas não resolveria a categorização visual dos itens.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se o modo de exclusão deve ter perfil e resultado separados; como controlar familiaridade semântica com objetos; se penalidade temporal mistura impulsividade e capacidade motora; e se velocidade de busca ou busca visual deve ser o rótulo clínico principal.

## 11. Identificação de Símbolos

1. **Nome oficial:** Identificação de Símbolos.
2. **ID técnico:** `identificacao-simbolos`.
3. **Categoria atual:** Velocidade de Processamento.
4. **Subdomínio atual:** Busca Visual Rápida.
5. **Objetivo funcional aparente:** encontrar, entre símbolos concorrentes, aquele idêntico ao modelo que permanece visível.
6. **Resumo da mecânica real:** um símbolo-alvo é exibido acima de uma grade que contém o alvo e um conjunto variável de outros símbolos. O paciente toca em uma opção; a primeira seleção encerra a tentativa, gera feedback e leva à próxima. O número de distratores sobe ou desce conforme sequências de acertos/erros, e o encerramento da sessão é verificado após cada tentativa. Há uma inconsistência na inicialização: o primeiro `target` e o símbolo usado para criar as primeiras `options` são sorteados separadamente. Portanto, a primeira tentativa pode não conter o alvo mostrado; além disso, seu relógio de reação começa antes do tutorial. As tentativas posteriores usam o mesmo alvo na geração das opções.
7. **Resposta exigida do paciente:** comparar o modelo visível com as alternativas e tocar no símbolo idêntico.
8. **Unidade básica da tarefa:** pareamento visual de um modelo presente com uma opção em uma grade.
9. **Domínio principal:** **busca visual**.
10. **Domínios secundários:** comparação; discriminação visual; percepção de forma; atenção seletiva; controle de distração; varredura espacial; velocidade de busca; constância perceptiva; rapidez perceptiva; manutenção de meta.
11. **Demandas instrumentais:** acuidade visual para detalhes de glifos, exploração do campo, uso de mouse ou toque e coordenação visuomotora. Não há leitura linguística necessária, embora alguns glifos se pareçam com letras gregas.
12. **Estratégias possíveis:** comparação de traços diagnósticos; varredura sistemática; busca por saliência de forma; eliminação de símbolos incompatíveis; alternância visual entre modelo e candidato; desaceleração antes do toque.
13. **Perfil basal 0–3:** busca visual — **3**; comparação — **2**; discriminação visual — **2**; percepção de forma — **2**; atenção seletiva — **2**; controle de distração — **2**; varredura espacial — **2**; velocidade de busca — **1**; constância perceptiva — **1**; rapidez perceptiva — **1**; manutenção de meta — **1**.
14. **Modificadores nos níveis avançados:** somente o número de distratores e a densidade/organização da grade mudam de forma sistemática, ampliando busca, varredura e controle de distração. O modelo continua visível, não há janela por tentativa, regra alternante nem manipulação deliberada da semelhança entre símbolos; diferenças de similaridade ocorrem por sorteio do conjunto fixo.
15. **Processos pouco ou não recrutados:** armazenamento visuoespacial de curto prazo, memória operacional, pressão temporal por item, controle inibitório, planejamento, raciocínio lógico, leitura, processamento auditivo e tomada de decisão cotidiana.
16. **Risco de confundir requisito da tarefa com alvo de treino:** medir tempo de resposta e encerrar a sessão por temporizador não torna rapidez o alvo central de cada tentativa. Como o modelo permanece visível, a tarefa não é memória visual. A precisão do toque não é velocidade de processamento. A primeira tentativa inválida pode produzir erro e latência que parecem déficits cognitivos, quando decorrem da inicialização independente.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade neste exercício.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva implementada e o conteúdo é não verbal.
19. **Confiança:** **moderado**, devido à inconsistência objetiva da primeira tentativa; **alto** para a mecânica das tentativas seguintes.
20. **Questões que precisam de decisão clínica humana:** se a primeira tentativa e sua latência devem ser excluídas até correção futura; se busca visual ou discriminação visual deve ser o principal; se similaridade de símbolos precisa ser controlada para interpretação clínica; e se a ausência de prazo por tentativa é compatível com o subdomínio “Busca Visual Rápida”.

## 12. Cores e Palavras

1. **Nome oficial:** Cores e Palavras.
2. **ID técnico:** `stroop-task`.
3. **Categoria atual:** Funções Executivas.
4. **Subdomínio atual:** Controle Inibitório.
5. **Objetivo funcional aparente:** selecionar a dimensão indicada — cor da tinta ou palavra escrita — diante de estímulos predominantemente incongruentes.
6. **Resumo da mecânica real:** em cada tentativa, uma palavra de cor é apresentada em uma tinta que geralmente nomeia outra cor. Um aviso visível escolhe aleatoriamente a regra “COR DA TINTA” ou “PALAVRA ESCRITA”. O paciente toca em um de cinco botões de cor antes que a barra da tentativa se esgote. Acerto ou erro gera imediatamente uma nova combinação; omissão conta como erro. A progressão interna, baseada em sequências de acertos, altera a proporção de incongruência, a probabilidade de cada regra e a janela de resposta. O temporizador da sessão é verificado ao fechar uma tentativa.
7. **Resposta exigida do paciente:** ler a regra atual, selecionar a dimensão relevante do estímulo e tocar no botão cujo nome corresponde à tinta ou à palavra.
8. **Unidade básica da tarefa:** seleção de uma entre duas dimensões conflitantes, seguida de escolha entre cinco respostas.
9. **Domínio principal:** **controle inibitório**.
10. **Domínios secundários:** atenção seletiva; alternância de regra; flexibilidade cognitiva; manutenção de meta; leitura; discriminação visual; tempo de reação de escolha; velocidade de decisão; pressão temporal; comparação.
11. **Demandas instrumentais:** leitura de palavras e do aviso de regra, visão de cores, distinção dos botões, uso de mouse ou toque e velocidade motora. Deficiência de visão cromática ou alfabetização altera o acesso à mecânica.
12. **Estratégias possíveis:** verbalizar a regra a cada tentativa; fixar primeiro o aviso de regra; focar a cor ou o significado conforme solicitado; desacelerar diante de conflito; bloquear a dimensão irrelevante; preparar o mapeamento dos cinco botões; monitorar mudanças de regra.
13. **Perfil basal 0–3:** controle inibitório — **3**; atenção seletiva — **3**; alternância de regra — **2**; flexibilidade cognitiva — **2**; manutenção de meta — **2**; leitura — **2**; discriminação visual — **2**; tempo de reação de escolha — **2**; velocidade de decisão — **2**; pressão temporal — **2**; comparação — **1**.
14. **Modificadores nos níveis avançados:** a proporção já majoritária de tentativas incongruentes aumenta ainda mais, reforçando interferência; a probabilidade da regra PALAVRA se aproxima do equilíbrio com COR, mas as trocas continuam aleatórias e não são agendadas como alternância obrigatória; a janela de resposta se estreita, elevando pressão temporal. A adaptação por acertos/erros move essas variáveis em conjunto por um nível efetivo interno.
15. **Processos pouco ou não recrutados:** planejamento, resolução de problemas, memória episódica, memória prospectiva, raciocínio visuoespacial, atenção dividida, processamento auditivo e tomada de decisão cotidiana. Memória operacional é leve porque a regra permanece visível em cada tentativa.
16. **Risco de confundir requisito da tarefa com alvo de treino:** classificá-la apenas pelo nome “Stroop” ocultaria a alternância entre duas regras implementada desde o início. Leitura é simultaneamente requisito, dimensão de resposta em tentativas PALAVRA e fonte de interferência em tentativas COR; isso não autoriza inferir treino amplo de linguagem. A escolha entre cinco botões impede classificá-la como tempo de reação simples. Velocidade motora e visão cromática também afetam a latência.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade neste exercício.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva implementada. Falar automaticamente a palavra ou a regra mudaria diretamente a interferência e a seleção de dimensão, portanto não seria um apoio neutro.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se resultados devem separar regras COR e PALAVRA, congruência e mudança/manutenção de regra; como acomodar visão cromática e alfabetização; se controle inibitório permanece o domínio principal diante da alternância aleatória; e se as variáveis que hoje mudam juntas precisam de interpretação independente em uma fase futura.

## Matriz consolidada do perfil basal

A matriz é esparsa: mostra apenas domínios com valor de 1 a 3. Demandas instrumentais e a proposta ainda não aprovada de memória semântica não entram nos valores.

| Exercício | Domínio principal | Perfil basal 0–3 (somente valores ≥ 1) | Confiança |
|---|---|---|---|
| Agentes Focus | busca visual | busca visual 3 · atenção seletiva 2 · controle de distração 2 · armazenamento verbal de curto prazo 2 · manutenção de meta 2 · discriminação visual 2 · varredura espacial 2 · armazenamento visuoespacial de curto prazo 1 · figura-fundo 1 · velocidade de busca 1 | alto; modalidade projetada: moderado |
| Conecta Números | busca visual | busca visual 3 · sequenciamento 2 · atenção seletiva 2 · varredura espacial 2 · manutenção de meta 2 · monitoramento 1 · percepção de posição 1 · discriminação visual 1 · velocidade de busca 1 | alto |
| Informação em Foco | atenção seletiva | atenção seletiva 3 · busca visual 2 · comparação 2 · compreensão textual 2 · leitura 2 · manutenção de meta 2 · memória operacional verbal 1 · varredura espacial 1 · tomada de decisão 1 | alto |
| Rastreamento de Objetos | rastreamento visual | rastreamento visual 3 · atenção dividida 2 · memória operacional visuoespacial 2 · atualização de informação 2 · controle de distração 2 · orientação atencional 2 · percepção de posição 2 · armazenamento visuoespacial de curto prazo 2 · atenção sustentada 1 · relações espaciais 1 | alto |
| Dupla Tarefa | atenção dividida | atenção dividida 3 · memória operacional verbal 3 · atualização de informação 3 · atenção sustentada 2 · atenção seletiva 2 · controle de distração 2 · controle inibitório 2 · manutenção de meta 2 · tempo de reação de escolha 2 · velocidade de processamento 2 · pressão temporal 2 · discriminação visual 2 · atualização 2 | alto |
| Vigilância | rapidez perceptiva | rapidez perceptiva 3 · discriminação visual 3 · armazenamento visuoespacial de curto prazo 3 · atenção seletiva 2 · controle de distração 2 · orientação atencional 2 · percepção de posição 2 · figura-fundo 1 · integração visuoespacial 1 · atenção sustentada 1 | alto |
| Tempo de Reação | tempo de reação de escolha | tempo de reação simples 3 · pressão temporal 3 · rapidez perceptiva 2 · rastreamento visual 1 · orientação atencional 1 · velocidade de processamento 1 | alto |
| Certo ou Errado | tomada de decisão cotidiana | tomada de decisão cotidiana 3 · compreensão textual 2 · inferência 2 · julgamento social 1 · resolução de situações sociais 1 · velocidade de decisão 1 · manutenção de meta 1 | moderado |
| Semáforo | tempo de reação de escolha | tempo de reação de escolha 3 · rapidez perceptiva 2 · atenção seletiva 2 · discriminação visual 2 · velocidade de decisão 2 · pressão temporal 2 · manutenção de meta 2 · orientação atencional 1 | alto |
| Busca Rápida | velocidade de busca | velocidade de busca 3 · busca visual 3 · pressão temporal 3 · categorização 2 · atenção seletiva 2 · controle de distração 2 · varredura espacial 2 · manutenção de meta 2 · velocidade de processamento 2 · discriminação visual 1 · percepção de forma 1 | alto |
| Identificação de Símbolos | busca visual | busca visual 3 · comparação 2 · discriminação visual 2 · percepção de forma 2 · atenção seletiva 2 · controle de distração 2 · varredura espacial 2 · velocidade de busca 1 · constância perceptiva 1 · rapidez perceptiva 1 · manutenção de meta 1 | moderado; tentativas seguintes: alto |
| Cores e Palavras | controle inibitório | controle inibitório 3 · atenção seletiva 3 · alternância de regra 2 · flexibilidade cognitiva 2 · manutenção de meta 2 · leitura 2 · discriminação visual 2 · tempo de reação de escolha 2 · velocidade de decisão 2 · pressão temporal 2 · comparação 1 | alto |
