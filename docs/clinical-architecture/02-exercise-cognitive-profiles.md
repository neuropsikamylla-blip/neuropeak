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

# Adendo — Lote B (Memória)

As 13 fichas abaixo acrescentam o Lote B sem modificar as fichas nem a matriz do Lote A. Categoria e subdomínio atuais continuam transcritos de `docs/architecture/CANONICAL_EXERCISES.md`; domínio principal e valores resultam da mecânica executável. O perfil basal considera o nível inicial. Mudanças internas de apresentação em Letras em Sequência e Sequência de Itens são modificadores de nível, não seletores de modalidade. Restaurante e Supermercado são os únicos exercícios deste lote com seletor Visual · Visual + áudio · Somente áudio.

## 13. Span Numérico Auditivo Direto

1. **Nome oficial:** Span Numérico Auditivo Direto.
2. **ID técnico:** `span-numerico`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Operacional.
5. **Objetivo funcional aparente:** reter uma sequência de números apresentados oralmente e reproduzi-la na mesma ordem.
6. **Resumo da mecânica real:** cada tentativa sorteia dígitos de 1 a 9, sem repetição até que a extensão ultrapasse o conjunto disponível, e reproduz os arquivos gravados de `/exercises/audio/numeros/*.m4a` um a um. Durante cada fala, a tecla que contém exatamente o número pronunciado acende no painel; marcadores também mostram quantos itens já foram apresentados. Terminada a sequência, o mesmo teclado fica interativo. A resposta é validada automaticamente ao atingir a extensão esperada, e a próxima tentativa ajusta essa extensão conforme o tipo de acerto ou erro. A sessão termina pelo número prescrito de tentativas. Embora a configuração declare permissão e penalidade de repetição, a interface executável não oferece ação de replay e o estado de repetição nunca é ativado.
7. **Resposta exigida do paciente:** tocar, sem apagar ou corrigir, todos os dígitos na mesma ordem em que foram falados.
8. **Unidade básica da tarefa:** codificação audiovisual sequencial de uma série de dígitos, seguida de reprodução serial imediata.
9. **Domínio principal:** **armazenamento verbal de curto prazo**.
10. **Domínios secundários:** memória operacional verbal; processamento auditivo sequencial; sequenciamento; manutenção de meta; atenção seletiva; armazenamento visuoespacial de curto prazo como apoio possível do realce das teclas.
11. **Demandas instrumentais:** audição suficiente para fala gravada; reconhecimento de algarismos; visão do teclado e do realce; uso de mouse ou toque; coordenação visuomotora. O reconhecimento dos números e o ato de tocar não são, por si, os alvos de treino.
12. **Estratégias possíveis:** repetição subvocal; agrupamento; ritmo; associação do som à posição da tecla; ensaio mental da série; monitoramento da quantidade de respostas pelos marcadores.
13. **Perfil basal 0–3:** armazenamento verbal de curto prazo — **3**; memória operacional verbal — **2**; processamento auditivo sequencial — **2**; sequenciamento — **2**; manutenção de meta — **1**; atenção seletiva — **1**; armazenamento visuoespacial de curto prazo — **1**.
14. **Modificadores nos níveis avançados:** a extensão cresce de uma série curta até dez dígitos; somente no teto aparece repetição de um dígito, não adjacente ao anterior. A fala não acelera nas séries maiores. O aumento da extensão amplia retenção, ensaio e monitoramento serial, sem introduzir transformação da ordem, regra alternante ou distratores externos.
15. **Processos pouco ou não recrutados:** manipulação mental, atualização contínua de informação, rotação mental, planejamento, resolução de problemas, memória episódica, atenção dividida e pressão temporal de resposta.
16. **Risco de confundir requisito da tarefa com alvo de treino:** audição, conhecimento de algarismos e precisão de toque podem reduzir o desempenho sem representar falha de memória. Mais importante, o `flashKey` revela visualmente a identidade de cada estímulo em sincronia com a fala; portanto, o desempenho não sustenta a interpretação de retenção auditiva pura.
17. **Impacto da modalidade:** não há seletor: o áudio é intrínseco e obrigatório. Contudo, a apresentação implementada é **audiovisual**, porque a tecla correspondente acende durante cada gravação. O realce pode facilitar a codificação, permitir uma estratégia espacial e reduzir a dependência exclusiva de discriminação auditiva.
18. **Impacto da leitura assistiva:** não se aplica. As gravações são o próprio estímulo a memorizar, não leitura de instrução nem recurso assistivo. Uma eventual repetição seria nova exposição ao conteúdo memorizando e precisaria ser distinguida de acessibilidade.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se o realce visual deve permanecer; se o construto será registrado como auditivo ou audiovisual; se replay deve existir e como uma repetição altera a interpretação; e se o subdomínio atual “Memória Operacional” deve ser mantido quando o perfil basal é reprodução direta sem transformação.

## 14. Span Numérico Auditivo Inverso

1. **Nome oficial:** Span Numérico Auditivo Inverso.
2. **ID técnico:** `span-numerico-inverso`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Operacional.
5. **Objetivo funcional aparente:** reter números apresentados oralmente, inverter mentalmente sua ordem e reproduzir a série do último para o primeiro.
6. **Resumo da mecânica real:** usa o mesmo gerador, gravações e teclado do span direto, inclusive o acendimento sincronizado da tecla falada. Após o último número, uma fileira de marcadores gira e o marcador de início muda de lado; os dígitos não reaparecem. O paciente então deve tocar a sequência invertida. A validação, a adaptação da extensão e o encerramento por número prescrito de tentativas são compartilhados com o modo direto; o replay declarado na configuração também não aparece na interface executável.
7. **Resposta exigida do paciente:** tocar todos os dígitos na ordem contrária à apresentação, sem apoio para desfazer entradas.
8. **Unidade básica da tarefa:** codificação audiovisual de uma série, transformação da ordem e reprodução serial inversa.
9. **Domínio principal:** **manipulação mental**.
10. **Domínios secundários:** memória operacional verbal; armazenamento verbal de curto prazo; processamento auditivo sequencial; sequenciamento; manutenção de meta; armazenamento visuoespacial de curto prazo como apoio possível do realce.
11. **Demandas instrumentais:** audição da fala gravada; reconhecimento visual de algarismos; compreensão da regra “ordem inversa”; uso de mouse ou toque; coordenação visuomotora.
12. **Estratégias possíveis:** repetição subvocal; recitação regressiva; agrupamento em blocos e inversão dos blocos; ensaio mental; associação som–posição; uso da virada dos marcadores como pista de direção; autorregulação antes de iniciar a resposta.
13. **Perfil basal 0–3:** manipulação mental — **3**; memória operacional verbal — **3**; armazenamento verbal de curto prazo — **2**; processamento auditivo sequencial — **2**; sequenciamento — **2**; manutenção de meta — **2**; armazenamento visuoespacial de curto prazo — **1**.
14. **Modificadores nos níveis avançados:** o crescimento da extensão amplia simultaneamente armazenamento e transformação serial; no teto pode haver um dígito repetido não adjacente. A regra continua sempre inversa e a apresentação não acelera nas séries maiores. A virada visual dos marcadores permanece como pista abstrata de direção, mas não fornece a ordem dos dígitos.
15. **Processos pouco ou não recrutados:** atualização contínua, alternância de regra, planejamento de múltiplos passos, resolução de problemas, memória episódica, rotação mental espacial e atenção dividida.
16. **Risco de confundir requisito da tarefa com alvo de treino:** dificuldade auditiva, reconhecimento numérico e toque afetam a resposta, mas não são manipulação mental. Inversamente, classificá-lo como simples retenção apagaria a operação que o separa do direto. O acendimento da tecla impede interpretar o resultado como memória auditiva pura.
17. **Impacto da modalidade:** não há seletor e o áudio é obrigatório, mas o estímulo é audiovisual pelo `flashKey`. O apoio visual pode favorecer codificação espacial; a transformação inversa, porém, continua necessária porque nenhum dígito é reapresentado durante a resposta.
18. **Impacto da leitura assistiva:** não se aplica. O áudio constitui o estímulo, e uma repetição futura seria repetição do conteúdo que deveria ser mantido, não mera leitura de instrução.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** como separar armazenamento e manipulação nos resultados; se o realce e a animação de virada facilitam de forma clinicamente desejada; se o construto deve ser chamado auditivo ou audiovisual; e se replay pode ser permitido sem alterar a interpretação.

## 15. Matriz Espacial

1. **Nome oficial:** Matriz Espacial.
2. **ID técnico:** `matriz-espacial`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Visuoespacial.
5. **Objetivo funcional aparente:** reter uma sequência de posições em uma grade e reproduzi-la na ordem apresentada.
6. **Resumo da mecânica real:** o nível inicial usa uma grade 4×4 e sorteia duas células distintas. Elas acendem uma de cada vez, cada qual acompanhada pelo mesmo bipe sem informação de posição. Depois do desaparecimento dos realces, o paciente toca células ainda não usadas até completar a extensão, quando a resposta é comparada com a sequência. A extensão seguinte é ajustada por tentativa; o tamanho da grade depende da dificuldade recebida no início. A sessão termina quando o critério global de tempo ativo é verificado ao final de uma tentativa. Há uma mudança importante: no próprio ID direto, `difficulty >= 6` ativa resposta inversa para toda a sessão.
7. **Resposta exigida do paciente:** tocar células distintas na mesma ordem em que acenderam no perfil basal; quando o componente é iniciado em dificuldade 6 ou superior, tocá-las em ordem inversa.
8. **Unidade básica da tarefa:** apresentação serial de posições, retenção imediata e reprodução por toques em uma grade.
9. **Domínio principal:** **armazenamento visuoespacial de curto prazo**.
10. **Domínios secundários:** memória operacional visuoespacial; sequenciamento; percepção de posição; orientação atencional; manutenção de meta; integração visuoespacial.
11. **Demandas instrumentais:** visão suficiente para localizar o brilho; uso de mouse ou toque; precisão visuomotora; percepção da grade. O bipe é um sinal temporal uniforme, não uma pista auditiva de qual célula acendeu.
12. **Estratégias possíveis:** codificação por trajetória; agrupamento por linha, coluna ou quadrante; nomeação verbal de posições; ensaio mental; reconstrução de um caminho; monitoramento dos marcadores de resposta.
13. **Perfil basal 0–3:** armazenamento visuoespacial de curto prazo — **3**; memória operacional visuoespacial — **2**; sequenciamento — **2**; percepção de posição — **2**; orientação atencional — **1**; manutenção de meta — **1**; integração visuoespacial — **1**.
14. **Modificadores nos níveis avançados:** a extensão adaptativa pode crescer até nove posições e a grade inicial passa de 4×4 a 5×5 ou 6×6 conforme a dificuldade recebida. A partir de dificuldade inicial 6, este mesmo componente exige ordem inversa, acrescentando manipulação mental e elevando memória operacional; isso não é apenas aumento quantitativo do perfil direto. As células sorteadas continuam sem repetição dentro da sequência.
15. **Processos pouco ou não recrutados:** memória verbal obrigatória, processamento auditivo sequencial de conteúdo, busca visual entre distratores, pressão temporal de resposta, planejamento, tomada de decisão cotidiana e memória episódica.
16. **Risco de confundir requisito da tarefa com alvo de treino:** precisão do toque e percepção do brilho não são memória. O som simultâneo não transforma a tarefa em memória auditiva. Sobretudo, resultados do ID `matriz-espacial` iniciado em dificuldade alta não representam a mesma mecânica direta do perfil basal, pois o código muda a regra para inversa.
17. **Impacto da modalidade:** não se aplica; não há seletor. O bipe fixo acompanha cada flash, mas não identifica posição nem cria uma modalidade auditiva equivalente.
18. **Impacto da leitura assistiva:** não se aplica; o conteúdo a memorizar é espacial e não há recurso de leitura assistiva.
19. **Confiança:** **moderado**, porque a mecânica basal é clara, mas o mesmo ID muda automaticamente para resposta inversa conforme a dificuldade inicial.
20. **Questões que precisam de decisão clínica humana:** se o ID direto deve algum dia executar a regra inversa; se resultados diretos e inversos podem ser agregados; se o tamanho da grade deve ser interpretado separadamente da extensão; e se o feedback, que indexa posições pela ordem direta mesmo quando `reverse` está ativo, deve ser considerado confiável para orientação do paciente.

## 16. Matriz Espacial Inversa

1. **Nome oficial:** Matriz Espacial Inversa.
2. **ID técnico:** `matriz-espacial-inversa`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Visuoespacial.
5. **Objetivo funcional aparente:** reter uma sequência de posições e reproduzi-la do último local apresentado para o primeiro.
6. **Resumo da mecânica real:** um wrapper chama o mesmo componente da Matriz Espacial com `alwaysReverse=true` e corrige apenas o ID do resultado. Células distintas acendem serialmente em uma grade; após o desaparecimento dos realces, o paciente deve tocar todas em ordem contrária. A resposta completa é então classificada, a extensão se ajusta e o encerramento é verificado entre tentativas.
7. **Resposta exigida do paciente:** tocar células distintas na ordem inversa à apresentação, sem poder selecionar novamente uma célula já tocada.
8. **Unidade básica da tarefa:** codificação serial de posições, inversão mental da sequência e reprodução espacial.
9. **Domínio principal:** **manipulação mental**.
10. **Domínios secundários:** memória operacional visuoespacial; armazenamento visuoespacial de curto prazo; sequenciamento; percepção de posição; manutenção de meta; orientação atencional; integração visuoespacial.
11. **Demandas instrumentais:** visão do realce, percepção espacial da grade, compreensão da regra inversa, uso de mouse ou toque e precisão visuomotora.
12. **Estratégias possíveis:** codificar uma trajetória e percorrê-la mentalmente ao contrário; agrupamento por quadrantes; nomeação de posições; ensaio mental; começar deliberadamente pelo último estímulo; monitoramento dos toques já realizados.
13. **Perfil basal 0–3:** manipulação mental — **3**; memória operacional visuoespacial — **3**; armazenamento visuoespacial de curto prazo — **2**; sequenciamento — **2**; percepção de posição — **2**; manutenção de meta — **2**; orientação atencional — **1**; integração visuoespacial — **1**.
14. **Modificadores nos níveis avançados:** a sequência pode crescer até nove posições, e a grade definida pela dificuldade inicial passa de 4×4 a 5×5 ou 6×6. Mais posições ampliam armazenamento, inversão e monitoramento serial; a regra permanece inversa em todos os níveis e as posições não se repetem dentro da tentativa.
15. **Processos pouco ou não recrutados:** memória verbal obrigatória, atualização contínua, alternância de regra, processamento auditivo de conteúdo, busca visual entre distratores, planejamento e memória episódica.
16. **Risco de confundir requisito da tarefa com alvo de treino:** localização visual e toque são requisitos instrumentais. Descrevê-la apenas como memória visuoespacial apagaria a inversão deliberada que a separa da versão direta. O bipe uniforme não representa memória auditiva.
17. **Impacto da modalidade:** não se aplica; não há seletor e o som fixo não carrega identidade espacial.
18. **Impacto da leitura assistiva:** não se aplica; não há conteúdo textual a memorizar nem recurso assistivo.
19. **Confiança:** **moderado**, devido à inconsistência do realce de feedback compartilhado, que compara a posição do toque com a ordem direta mesmo quando a validação correta usa a ordem inversa.
20. **Questões que precisam de decisão clínica humana:** como separar armazenamento e manipulação no resultado; se o feedback visual inverso precisa ser desconsiderado até revisão futura; se extensão e tamanho da grade devem ser reportados separadamente; e se a proibição de repetir uma célula é adequada ao construto pretendido.

## 17. Jogo da Memória

1. **Nome oficial:** Jogo da Memória.
2. **ID técnico:** `jogo-memoria`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Visuoespacial.
5. **Objetivo funcional aparente:** aprender e recuperar as associações entre símbolos e posições para encontrar todos os pares.
6. **Resumo da mecânica real:** no perfil inicial, quatro pares de símbolos são embaralhados em oito posições e todas as cartas ficam visíveis durante uma fase prévia de memorização. Em seguida, viram para baixo. O paciente abre duas por vez: pares permanecem revelados e são retirados da busca; não pares voltam a esconder-se depois de breve exposição. A rodada termina com sucesso ao encontrar todos os pares ou com falha quando os desencontros ultrapassam o orçamento calculado para aquela quantidade de pares. Duas rodadas consecutivas com o mesmo resultado alteram a quantidade de pares, e o encerramento global é verificado ao fim de cada rodada.
7. **Resposta exigida do paciente:** escolher duas posições por vez, procurando símbolos idênticos e evitando repetir combinações que já falharam.
8. **Unidade básica da tarefa:** recuperação de uma associação símbolo–posição para formar um par, dentro de uma rodada com múltiplas escolhas.
9. **Domínio principal:** **memória operacional visuoespacial**.
10. **Domínios secundários:** armazenamento visuoespacial de curto prazo; atualização de informação; aprendizagem por repetição; percepção de posição; discriminação visual; comparação; busca visual; monitoramento; formação de estratégia.
11. **Demandas instrumentais:** visão e reconhecimento dos símbolos; discriminação de detalhes; exploração espacial; uso de mouse ou toque; precisão visuomotora.
12. **Estratégias possíveis:** varredura sistemática na exposição inicial; agrupamento por linhas ou quadrantes; associação verbal de símbolo e posição; atualização do mapa após cada abertura; evitar combinações já testadas; priorizar pares conhecidos; autorregulação diante do limite de erros.
13. **Perfil basal 0–3:** memória operacional visuoespacial — **3**; armazenamento visuoespacial de curto prazo — **2**; atualização de informação — **2**; percepção de posição — **2**; discriminação visual — **2**; comparação — **2**; aprendizagem por repetição — **1**; busca visual — **1**; monitoramento — **1**; formação de estratégia — **1**.
14. **Modificadores nos níveis avançados:** a quantidade pode crescer de quatro para até nove pares, alterando o número de posições e a organização da grade; a fase inicial de exposição permanece. Mais cartas ampliam a necessidade de mapear identidades e posições, atualizar revelações e controlar combinações já testadas. Os pares encontrados continuam visíveis, oferecendo apoio externo progressivo.
15. **Processos pouco ou não recrutados:** manipulação da ordem, processamento auditivo, rotação mental, atenção dividida, pressão temporal por escolha, planejamento de múltiplos passos obrigatório, leitura e tomada de decisão cotidiana.
16. **Risco de confundir requisito da tarefa com alvo de treino:** discriminar símbolos e tocar cartas são requisitos perceptivomotores. A exposição inicial de todo o tabuleiro e a permanência de pares encontrados apoiam a memória; por isso, o resultado não representa recuperação sem pistas. Familiaridade desigual com símbolos também pode afetar a codificação.
17. **Impacto da modalidade:** não se aplica; não há seletor e a tarefa é visual.
18. **Impacto da leitura assistiva:** não se aplica; não há conteúdo textual nem leitura assistiva.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se a fase prévia de exposição deve ser interpretada separadamente da aprendizagem por reabertura; se terminar a rodada ao ultrapassar o orçamento de erros mede adequadamente o objetivo; se identidade e posição precisam de métricas distintas; e quanto os pares já visíveis devem contar como facilitação.

## 18. Letras em Sequência

1. **Nome oficial:** Letras em Sequência.
2. **ID técnico:** `letras-sequencia`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Operacional.
5. **Objetivo funcional aparente:** reter unidades verbais apresentadas em série e reconstruí-las na ordem solicitada.
6. **Resumo da mecânica real:** no nível inicial, três letras distintas aparecem visualmente, uma por vez. Depois, surge um teclado embaralhado com as letras da série e dois distratores; cada opção pode ser usada uma vez, e a resposta é avaliada ao completar o número esperado. A progressão mistura mudanças de extensão, direção, tipo de estímulo e forma de apresentação: surgem resposta inversa, sílabas e níveis falados por síntese de voz. A próxima tentativa é ajustada pelo tipo de erro, e o encerramento global é verificado após a resposta.
7. **Resposta exigida do paciente:** tocar as letras ou sílabas da sequência na mesma ordem no perfil basal; em níveis específicos, na ordem inversa.
8. **Unidade básica da tarefa:** apresentação serial de unidades verbais, retenção e reconstrução por escolha entre alvos e distratores.
9. **Domínio principal:** **armazenamento verbal de curto prazo**.
10. **Domínios secundários:** memória operacional verbal; sequenciamento; atenção seletiva; controle de distração; manutenção de meta; discriminação visual; manipulação mental nos níveis inversos; processamento auditivo sequencial nos níveis falados.
11. **Demandas instrumentais:** reconhecimento de letras e sílabas; leitura dos botões na resposta; visão no perfil basal; audição nos níveis falados; uso de mouse ou toque e coordenação visuomotora. Alfabetização e familiaridade grafêmica afetam o acesso sem constituir treino amplo de linguagem.
12. **Estratégias possíveis:** repetição subvocal; agrupamento; ritmo; formação de uma palavra ou padrão sonoro; ensaio mental; eliminação dos dois distratores; recitação regressiva nos níveis inversos; comparação da resposta montada com a série lembrada.
13. **Perfil basal 0–3:** armazenamento verbal de curto prazo — **3**; memória operacional verbal — **2**; sequenciamento — **2**; atenção seletiva — **1**; controle de distração — **1**; manutenção de meta — **1**; discriminação visual — **1**.
14. **Modificadores nos níveis avançados:** a série cresce; a partir do nível 4 aparecem tentativas inversas, acrescentando manipulação mental; a partir do nível 6 o material passa a sílabas e alguns níveis apresentam somente fala durante a codificação; nos dois níveis finais, sílabas voltam a ser visuais, inversas e apresentadas mais rapidamente. Assim, direção e canal não crescem de modo monotônico: o nível 6 é falado e direto, os seguintes alternam combinações. Os dois distratores permanecem.
15. **Processos pouco ou não recrutados:** memória visuoespacial de posições, atualização contínua, aprendizagem episódica, planejamento, resolução de problemas, atenção dividida e tomada de decisão cotidiana.
16. **Risco de confundir requisito da tarefa com alvo de treino:** ler letras/sílabas e tocar botões são requisitos; não autorizam concluir treino de linguagem geral. Também não se deve descrever todo o exercício como inverso ou auditivo: essas operações aparecem apenas em faixas específicas da progressão.
17. **Impacto da modalidade:** não há seletor configurável. A alternância visual–auditiva é imposta pelo nível; nos níveis falados, o estímulo não aparece como texto durante a codificação, mas a resposta continua escrita. Isso muda memória visual, memória auditiva e o remapeamento som–grafema dentro do mesmo ID.
18. **Impacto da leitura assistiva:** não se aplica. A síntese de voz dos níveis auditivos é a própria forma de apresentação do conteúdo, não leitura assistiva. Falar novamente a série seria nova exposição ao material memorizando.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se perfis direto/inverso, visual/auditivo e letra/sílaba podem ser agregados; se mudanças simultâneas de canal e conteúdo permitem interpretação longitudinal; como controlar diferenças de alfabetização e discriminação fonológica; e se a síntese de voz deve ser clinicamente padronizada.

## 19. Sequência de Itens

1. **Nome oficial:** Sequência de Itens.
2. **ID técnico:** `sequencia-itens`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Operacional.
5. **Objetivo funcional aparente:** reter a identidade e a ordem de uma série de itens cotidianos e reconstruí-la entre alternativas.
6. **Resumo da mecânica real:** no nível inicial, três figuras distintas aparecem visualmente uma por vez. Depois, uma grade reúne os itens apresentados e dois distratores; o paciente monta a sequência por toques e cada figura só pode ser escolhida uma vez. A resposta completa determina o ajuste da próxima tentativa. Em níveis intermediários, a apresentação muda para nomes falados sem a figura; em outros, volta a ser visual e passa a selecionar itens de uma mesma categoria ampla, enquanto aumentam extensão, quantidade de distratores e rapidez de exposição. O encerramento global é verificado após cada sequência.
7. **Resposta exigida do paciente:** selecionar as figuras correspondentes na mesma ordem da apresentação, inclusive quando os itens foram apresentados apenas pelo nome falado.
8. **Unidade básica da tarefa:** codificação serial de identidades de itens, retenção e reconstrução visual ordenada entre distratores.
9. **Domínio principal:** **armazenamento visuoespacial de curto prazo**.
10. **Domínios secundários:** memória operacional visuoespacial; sequenciamento; discriminação visual; atenção seletiva; controle de distração; comparação; memória operacional verbal e processamento auditivo sequencial nos níveis falados.
11. **Demandas instrumentais:** reconhecimento visual de objetos; familiaridade com seus nomes; visão e discriminação de figuras; audição nos níveis falados; uso de mouse ou toque e precisão visuomotora.
12. **Estratégias possíveis:** nomeação verbal das figuras; agrupamento por categoria; construção de uma narrativa; repetição subvocal; ensaio mental da ordem; eliminação de distratores; comparação item a item; uso das categorias animal/objeto como pista.
13. **Perfil basal 0–3:** armazenamento visuoespacial de curto prazo — **3**; memória operacional visuoespacial — **2**; sequenciamento — **2**; discriminação visual — **2**; atenção seletiva — **1**; controle de distração — **1**; comparação — **1**.
14. **Modificadores nos níveis avançados:** aumentam a extensão e os distratores; em alguns níveis, alvos e parte dos distratores pertencem à mesma categoria ampla, ampliando discriminação e interferência; os níveis 6 a 8 substituem as figuras da codificação por nomes falados, elevando memória verbal auditiva e o pareamento palavra–imagem; os níveis finais voltam ao visual, com mais itens semelhantes e exposição mais breve. A ordem de resposta permanece direta.
15. **Processos pouco ou não recrutados:** manipulação inversa, atualização contínua, rotação mental, planejamento, resolução de problemas, atenção dividida e tomada de decisão cotidiana.
16. **Risco de confundir requisito da tarefa com alvo de treino:** reconhecer e nomear figuras é requisito semântico/perceptivo, não alvo garantido. A nomeação espontânea pode transformar uma apresentação visual em estratégia verbal. Nos níveis auditivos, dificuldade lexical ou auditiva pode parecer déficit de memória de itens.
17. **Impacto da modalidade:** não há seletor. A apresentação muda internamente com o nível: visual no perfil basal e nos níveis finais, auditiva em níveis intermediários; a resposta é sempre visual. Essa mudança altera o código de retenção e exige remapeamento transmodal quando o item foi ouvido.
18. **Impacto da leitura assistiva:** não se aplica; a fala interna dos níveis auditivos é estímulo de tarefa. Os nomes não são uma leitura assistiva das figuras visíveis, pois a figura-alvo fica oculta durante essa apresentação.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se níveis visuais e auditivos devem gerar perfis separados; como controlar familiaridade e nomeabilidade das imagens; se a semelhança por apenas duas categorias é clinicamente suficiente; e se desempenho transmodal deve ser distinguido de memória visual direta.

## 20. Matriz com Rotações

1. **Nome oficial:** Matriz com Rotações.
2. **ID técnico:** `padroes-rotacao`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Visuoespacial.
5. **Objetivo funcional aparente:** reter posições em uma matriz e indicar onde elas ficam depois de uma rotação do tabuleiro.
6. **Resumo da mecânica real:** no perfil inicial, duas posições distintas de uma grade 3×3 acendem uma por vez. Em seguida, a matriz vazia gira visualmente 90° no sentido horário; uma barra de orientação sai da borda superior e reaparece na borda correspondente. Com o tabuleiro novamente desenhado sem os alvos, o paciente marca um conjunto de posições, pode desmarcá-las e confirma. A ordem dos toques não importa: a rodada exige o conjunto exato de posições transformadas. O nível adapta grade, quantidade e ângulo; o encerramento global é verificado depois da confirmação.
7. **Resposta exigida do paciente:** tocar todas e somente as posições resultantes da rotação indicada e confirmar o conjunto.
8. **Unidade básica da tarefa:** codificação de um padrão espacial, transformação rotacional e reconstrução do padrão resultante.
9. **Domínio principal:** **rotação mental**.
10. **Domínios secundários:** manipulação mental; memória operacional visuoespacial; armazenamento visuoespacial de curto prazo; percepção de posição; relações espaciais; integração visuoespacial; manutenção de meta; monitoramento.
11. **Demandas instrumentais:** visão do brilho, da grade e do marcador de orientação; percepção espacial; uso de mouse ou toque; precisão visuomotora. Os bipes são iguais para todas as posições e não codificam localização.
12. **Estratégias possíveis:** imaginar o giro de cada posição; acompanhar linhas, colunas e cantos; usar a barra de borda como âncora; codificar o padrão como forma; transformar coordenadas mentalmente; verificar o número de marcações; eliminar posições incompatíveis.
13. **Perfil basal 0–3:** rotação mental — **3**; memória operacional visuoespacial — **3**; manipulação mental — **2**; armazenamento visuoespacial de curto prazo — **2**; percepção de posição — **2**; relações espaciais — **2**; integração visuoespacial — **2**; manutenção de meta — **1**; monitoramento — **1**.
14. **Modificadores nos níveis avançados:** a grade cresce de 3×3 a 6×6; o padrão passa de duas para até sete posições; entram rotações de 180° e 270° e, nos níveis finais, um intervalo vazio após o giro. O nível corrente controla grade, quantidade, ângulo e intervalo. A velocidade CSS do giro também acompanha o nível, mas o agendamento dos flashes e da espera do giro usa faixas capturadas da dificuldade inicial, e os campos `showMs` da tabela não são consumidos pela apresentação; portanto, a progressão temporal declarada e a executada não coincidem integralmente.
15. **Processos pouco ou não recrutados:** memória verbal obrigatória, processamento auditivo de conteúdo, sequenciamento da resposta, atenção dividida, planejamento de ações, tomada de decisão cotidiana e memória episódica.
16. **Risco de confundir requisito da tarefa com alvo de treino:** tocar a grade e ver a animação são requisitos de acesso. A rotação não é totalmente sem apoio externo: o tabuleiro vazio gira e o marcador de borda explicita a nova orientação. Por outro lado, como os alvos somem antes do giro, o paciente ainda precisa mantê-los e transformá-los; classificá-la apenas como memória visual apagaria essa operação.
17. **Impacto da modalidade:** não se aplica; não há seletor. O som é feedback uniforme e não cria uma representação auditiva do padrão.
18. **Impacto da leitura assistiva:** não se aplica; o conteúdo espacial não é textual.
19. **Confiança:** **moderado**, pela divergência entre parâmetros temporais declarados e temporização efetivamente usada.
20. **Questões que precisam de decisão clínica humana:** se rotação mental ou memória operacional visuoespacial deve rotular o principal; quanto a animação e a barra de orientação devem facilitar; se os diferentes ângulos precisam de resultados separados; e como interpretar sessões cujo nível muda sem que toda a temporização acompanhe essa mudança.

## 21. Lista com Distração

1. **Nome oficial:** Lista com Distração.
2. **ID técnico:** `lista-distracao`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Operacional.
5. **Objetivo funcional aparente:** manter uma lista verbal durante uma atividade interveniente e recuperar seus itens depois.
6. **Resumo da mecânica real:** no perfil inicial, três palavras aparecem simultaneamente por uma janela de memorização. A lista some e uma miniatividade é apresentada: escolher o maior entre dois números, contar estrelas ou tocar uma cor nomeada. Qualquer botão avança, independentemente de estar correto; a miniatividade interfere, mas não é pontuada nem validada. Depois, o paciente escolhe os três itens da lista em uma grade que contém dois distratores. No início, a ordem não é considerada; em níveis específicos, passa a ser exigida. A rodada se ajusta após sequências de resultados, e o encerramento global é verificado depois da recuperação.
7. **Resposta exigida do paciente:** ler e reter a lista, produzir pelo menos uma resposta na miniatividade e então selecionar os itens-alvo; quando indicado, respeitar a ordem original.
8. **Unidade básica da tarefa:** retenção de uma lista verbal através de uma tarefa interveniente, seguida de reconhecimento ou reconstrução.
9. **Domínio principal:** **memória operacional verbal**.
10. **Domínios secundários:** armazenamento verbal de curto prazo; controle de distração; atenção alternada; atualização do foco entre etapas; atenção seletiva; comparação; sequenciamento nos níveis que exigem ordem; manutenção de meta.
11. **Demandas instrumentais:** leitura das palavras e instruções; reconhecimento de números e cores; visão para contar estrelas; uso de mouse ou toque; coordenação visuomotora. A correção das respostas distratoras não é requisito efetivo, porque o código aceita qualquer alternativa.
12. **Estratégias possíveis:** repetição subvocal durante a interferência; agrupamento semântico; formação de história; categorização; ensaio mental; retorno deliberado à lista após a miniatividade; eliminação dos distratores; reconstrução serial quando a ordem é solicitada.
13. **Perfil basal 0–3:** memória operacional verbal — **3**; armazenamento verbal de curto prazo — **2**; controle de distração — **2**; atenção alternada — **2**; manutenção de meta — **2**; atenção seletiva — **1**; comparação — **1**; atualização — **1**.
14. **Modificadores nos níveis avançados:** crescem o número de palavras, os distratores e a quantidade de miniatividades intervenientes; alguns níveis exigem a ordem original e outros voltam ao reconhecimento sem ordem, de modo não monotônico. A exigência serial amplia sequenciamento, mas não implica inverter ou reorganizar a lista. O tipo de miniatividade é sorteado e sua precisão continua sem validação.
15. **Processos pouco ou não recrutados:** manipulação inversa, rotação mental, planejamento, memória episódica contextual, aprendizagem por repetição, pressão temporal de resposta e tomada de decisão cotidiana. Comparação numérica, contagem e discriminação de cor não são alvos treinados de forma verificável, pois toda alternativa avança.
16. **Risco de confundir requisito da tarefa com alvo de treino:** leitura pode limitar a codificação sem ser o alvo. A aparência de três miniatividades cognitivas não autoriza atribuir treino de cálculo, contagem ou seleção de cor, já que o sistema ignora a correção dessas respostas. A interferência é central; a precisão do distrator, não.
17. **Impacto da modalidade:** não se aplica; não há seletor e a lista é visual/textual.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva. Ler em voz alta as palavras seria repetição do próprio conteúdo a memorizar e alteraria o código de retenção, não apenas o acesso à instrução.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se as respostas distratoras deveriam ser validadas para sustentar interpretação de dupla tarefa; se níveis com e sem ordem devem ser agregados; como controlar alfabetização; e se o principal deve enfatizar resistência à interferência ou manutenção verbal.

## 22. Restaurante

1. **Nome oficial:** Restaurante.
2. **ID técnico:** `restaurante-ordem`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Operacional.
5. **Objetivo funcional aparente:** lembrar um pedido associado a uma mesa e montar a bandeja correta entre itens concorrentes.
6. **Resumo da mecânica real:** no perfil inicial, uma cena mostra uma pessoa e um pedido de dois itens distintos. O conteúdo permanece até o fim da janela de memorização ou até o paciente indicar que já memorizou. Na bancada, os dois itens aparecem misturados a quatro distratores; o paciente preenche uma bandeja e confirma. A validação exige os itens corretos, sem ordem no perfil basal. Em níveis posteriores há mais pessoas e itens, ordem, atualização do pedido e duas mesas apresentadas em sequência, das quais uma é chamada. Um som ambiente de restaurante começa por padrão e pode ser silenciado. O encerramento global é verificado depois do feedback de cada rodada.
7. **Resposta exigida do paciente:** selecionar na bancada os itens do pedido da mesa chamada e montar a bandeja; quando indicado, respeitar a ordem e a versão atualizada.
8. **Unidade básica da tarefa:** codificação de um pedido ligado a uma mesa, retenção após ocultação e reconstrução entre distratores.
9. **Domínio principal:** **memória operacional verbal**.
10. **Domínios secundários:** armazenamento verbal de curto prazo; armazenamento visuoespacial de curto prazo; atenção seletiva; controle de distração; comparação; busca visual; manutenção de meta; memória operacional visuoespacial; atualização de informação nos níveis com mudança; sequenciamento nos níveis com ordem.
11. **Demandas instrumentais:** leitura dos nomes e, conforme modo, audição da fala; reconhecimento visual de alimentos; visão da cena; uso de mouse ou toque; coordenação visuomotora. Familiaridade com os itens e o ruído ambiente podem afetar o desempenho.
12. **Estratégias possíveis:** repetição subvocal; associação pessoa–pedido; agrupamento por tipo de alimento; criação de narrativa; conversão do pedido em imagens; ensaio mental; eliminação de distratores; marcação da ordem; substituição deliberada da versão antiga após uma atualização.
13. **Perfil basal 0–3:** memória operacional verbal — **3**; armazenamento verbal de curto prazo — **2**; armazenamento visuoespacial de curto prazo — **2**; atenção seletiva — **2**; controle de distração — **2**; comparação — **2**; busca visual — **1**; manutenção de meta — **1**; memória operacional visuoespacial — **1**.
14. **Modificadores nos níveis avançados:** aumentam pessoas, itens e distratores; a ordem passa de irrelevante a obrigatória; três pessoas exigem ligar itens ao pedido mostrado na cena; o nível 9 acrescenta troca, inclusão ou remoção de item e exige atualizar a representação, suprimindo a versão antiga; o nível 10 apresenta duas mesas e só depois informa qual deve ser servida, aumentando associação de fonte, seleção e interferência entre listas. Essas mudanças introduzem operações qualitativas além do simples aumento do pedido.
15. **Processos pouco ou não recrutados:** uso funcional de dinheiro, cálculo, planejamento de atividade cotidiana, resolução de problemas aberta, tomada de decisão cotidiana com consequências, memória prospectiva e velocidade de processamento como alvo. O cenário funcional não basta para inferir autonomia funcional.
16. **Risco de confundir requisito da tarefa com alvo de treino:** reconhecer alimentos, ler e tocar são requisitos. A ambientação de restaurante não transforma a seleção fechada em treino amplo de atendimento, planejamento ou autonomia. Ordem e atualização não pertencem ao perfil basal e não devem ser projetadas retroativamente sobre todos os resultados.
17. **Impacto da modalidade:** **perfil comum:** em todos os modos, o pedido some antes da bancada, a resposta é visual e apresenta fotos com nomes, e a seleção ocorre entre distratores; cena, pessoas e mesa permanecem visuais. **Visual:** exibe foto e nome de cada item, favorecendo leitura, memória visual e recodificação verbal; a memória auditiva do pedido não é necessária. **Visual + áudio:** mantém os mesmos itens visuais e acrescenta narração, podendo recrutar atenção dividida ou produzir interferência se o paciente tenta acompanhar fontes desalinhadas; quando congruentes e sincronizadas, a redundância audiovisual pode facilitar codificação e compensar dificuldade de leitura. **Somente áudio:** oculta as linhas de itens durante o pedido e exige memória verbal auditiva, mas conserva cena, nomes das pessoas, número da mesa e resposta visual com fotos e texto; portanto, não é uma tarefa auditiva pura. O botão “Ouvir” permite repetir o pedido durante a fase de memorização. O som ambiente pode interferir em todos os modos, especialmente nos que usam fala, embora possa ser silenciado. Na atualização avançada, o texto da mudança continua visível mesmo em Somente áudio.
18. **Impacto da leitura assistiva:** não há leitura assistiva separada. A narração pertence ao modo escolhido. Falar uma instrução geral reduziria apenas a barreira de acesso; narrar o pedido atual é apresentação de **conteúdo da tarefa**; usar “Ouvir” de novo é **repetição do conteúdo que deveria ser memorizado** e pode facilitar a retenção. Esses eventos precisam ser diferenciados na interpretação.
19. **Confiança:** **alto** para a mecânica; **moderado** para chamar Somente áudio de perfil auditivo, porque permanecem apoios visuais e texto na atualização.
20. **Questões que precisam de decisão clínica humana:** quantas repetições do pedido são aceitáveis e como registrá-las; se o ruído ambiente deve ser padronizado; se Somente áudio deve ocultar também nomes de pessoas e texto de atualização; como registrar facilitação audiovisual; e se ordem, atualização e seleção entre duas mesas precisam de resultados separados.

## 23. Supermercado

1. **Nome oficial:** Supermercado.
2. **ID técnico:** `desafio-supermercado`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Operacional.
5. **Objetivo funcional aparente:** memorizar uma lista de produtos e recuperá-la ao selecionar itens em uma prateleira com concorrentes.
6. **Resumo da mecânica real:** no perfil inicial, uma lista de dois produtos de categorias diferentes é apresentada e depois ocultada. A prateleira contém os dois alvos e oito distratores; o paciente pode adicionar ou remover produtos do carrinho e confirmar. A ordem não importa no início. A progressão aumenta itens e distratores, introduz concorrentes das mesmas categorias, ordem direta ou inversa e duas listas associadas a “mãe” e “avó”; quando há duas listas, somente uma é solicitada na fase de compra. A apresentação encerra por contador ou pelo botão “Já memorizei”, e o encerramento global é verificado após cada compra.
7. **Resposta exigida do paciente:** selecionar todos e somente os produtos da lista solicitada; em níveis ordenados, selecioná-los na sequência direta ou inversa especificada.
8. **Unidade básica da tarefa:** codificação de uma ou duas listas, ocultação, busca visual e reconstrução da lista-alvo entre distratores.
9. **Domínio principal:** **memória operacional verbal**.
10. **Domínios secundários:** armazenamento verbal de curto prazo; armazenamento visuoespacial de curto prazo; busca visual; atenção seletiva; controle de distração; comparação; manutenção de meta; memória operacional visuoespacial; categorização; manipulação mental nos níveis inversos.
11. **Demandas instrumentais:** leitura de nomes e instruções conforme o modo; audição da lista nos modos com fala; reconhecimento visual de produtos; familiaridade lexical e semântica; uso de mouse ou toque; coordenação visuomotora e exploração da prateleira.
12. **Estratégias possíveis:** repetição subvocal; agrupamento por categoria; criação de uma rota mental; associação pessoa–lista; conversão som–imagem; eliminação de produtos concorrentes; varredura sistemática; conferência do carrinho; ensaio regressivo nos níveis inversos.
13. **Perfil basal 0–3:** memória operacional verbal — **3**; armazenamento verbal de curto prazo — **2**; armazenamento visuoespacial de curto prazo — **2**; busca visual — **2**; atenção seletiva — **2**; controle de distração — **2**; comparação — **2**; manutenção de meta — **2**; memória operacional visuoespacial — **1**; categorização — **1**.
14. **Modificadores nos níveis avançados:** crescem lista e prateleira; distratores passam a compartilhar categorias com os alvos, ampliando discriminação e interferência semântica; a ordem direta acrescenta manutenção serial; a ordem inversa acrescenta manipulação mental; duas listas exigem codificação de fonte, manutenção paralela e seleção da lista indicada apenas na compra. As combinações não são monotônicas: há blocos de duas listas sem ordem antes da introdução da inversão.
15. **Processos pouco ou não recrutados:** cálculo, uso funcional de dinheiro, planejamento de compras com orçamento, tomada de decisão cotidiana, memória prospectiva e autonomia funcional ampla. O cenário de mercado não cria essas operações porque preços, recursos e consequências não participam da regra.
16. **Risco de confundir requisito da tarefa com alvo de treino:** reconhecimento e nomeação de produtos, leitura e toque podem limitar o desempenho. A aparência cotidiana não autoriza inferir treino de compra real. Busca visual e familiaridade semântica contribuem materialmente e não devem ser registradas como se todo erro fosse de memória.
17. **Impacto da modalidade:** **perfil comum:** a resposta sempre usa prateleira visual com fotos, e os itens selecionados aparecem no carrinho com seus nomes; a instrução de qual lista e ordem também permanece escrita. **Visual:** mostra fotos e nomes na memorização e na prateleira, recrutando leitura, memória visual e recodificação verbal. **Visual + áudio:** mantém fotos e nomes e acrescenta fala; pode recrutar atenção dividida ou interferência, mas a redundância audiovisual congruente pode facilitar codificação e compensar leitura. **Somente áudio:** fala os nomes e esconde seus rótulos durante a memorização e nas prateleiras, aumentando memória auditiva e o pareamento nome–imagem; porém as fotos dos produtos continuam visíveis durante a própria memorização, e os nomes aparecem no carrinho após a seleção. Logo, a codificação continua audiovisual e a memória visual não é eliminada. O botão de repetição permite ouvir novamente enquanto a lista está em apresentação.
18. **Impacto da leitura assistiva:** não há recurso separado de leitura assistiva; a fala pertence à modalidade. A instrução escrita que indica pessoa e ordem não é narrada pelo mesmo fluxo. Narrar instrução geral teria efeito de acesso; narrar a lista é apresentação de conteúdo; “Ouvir de novo” repete material que deve ser memorizado. Esses três usos não são equivalentes.
19. **Confiança:** **alto** para a mecânica; **moderado** para a interpretação do rótulo Somente áudio, pois fotos e alguns textos permanecem.
20. **Questões que precisam de decisão clínica humana:** se Somente áudio deve ocultar as fotos durante a memorização e os nomes do carrinho; se pessoa, ordem e instruções também precisam de áudio; como registrar repetição e facilitação audiovisual; se duas listas e ordem inversa devem ter resultados separados; e como controlar familiaridade cultural com produtos visualmente semelhantes.

## 24. N-Back

1. **Nome oficial:** N-Back.
2. **ID técnico:** `nback`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Operacional.
5. **Objetivo funcional aparente:** atualizar continuamente a referência mantida e decidir se cada letra corresponde à apresentada N posições antes.
6. **Resumo da mecânica real:** cada bloco começa mostrando N letras de preparação e depois apresenta 14 letras ativas, uma por vez. Para cada estímulo, o paciente deve escolher “IGUAL” ou “DIFERENTE” em relação à letra de N posições atrás; omissão dentro da janela conta como erro. O gerador cria correspondências em aproximadamente parte substancial das tentativas e impede que um não alvo coincida acidentalmente com a referência. Dois blocos com bom desempenho elevam N; desempenho muito baixo o reduz. A sessão termina quando o critério global é atingido entre blocos, portanto um bloco iniciado é concluído antes da verificação final.
7. **Resposta exigida do paciente:** responder em toda letra ativa se ela é igual ou diferente da referência N-back antes que a janela se encerre.
8. **Unidade básica da tarefa:** atualização de uma janela móvel de letras, comparação com a referência e escolha binária.
9. **Domínio principal:** **atualização de informação**.
10. **Domínios secundários:** memória operacional verbal; atualização executiva; comparação; atenção sustentada; manutenção de meta; tempo de reação de escolha; pressão temporal; sequenciamento; controle de distração por itens intervenientes; monitoramento.
11. **Demandas instrumentais:** reconhecimento visual de letras e rótulos dos botões; leitura; uso de mouse ou toque; velocidade e coordenação motora suficientes para responder na janela. Ler letras é requisito, não treino de linguagem.
12. **Estratégias possíveis:** janela mental deslizante; repetição subvocal; agrupamento por posição; marcação mental da referência; comparação explícita; descarte deliberado de itens antigos; ritmo; monitoramento de omissões; preparação dos dois botões.
13. **Perfil basal 0–3:** atualização de informação — **3**; memória operacional verbal — **3**; atualização — **2**; comparação — **2**; atenção sustentada — **2**; manutenção de meta — **2**; tempo de reação de escolha — **2**; pressão temporal — **2**; sequenciamento — **1**; controle de distração — **1**; monitoramento — **1**.
14. **Modificadores nos níveis avançados:** N pode crescer de 1-back a 4-back, aumentando a distância da referência e a quantidade de itens intervenientes que precisam ser atualizados e descartados. A extensão do bloco, o conjunto de letras e a janela de resposta permanecem constantes; a mudança qualitativa é a defasagem da comparação, não uma regra nova.
15. **Processos pouco ou não recrutados:** memória visuoespacial, rotação mental, planejamento, resolução de problemas, alternância de regra, processamento auditivo, memória episódica e tomada de decisão cotidiana.
16. **Risco de confundir requisito da tarefa com alvo de treino:** alfabetização, visão, velocidade motora e compreensão dos botões podem produzir erros ou omissões. A resposta é de escolha, não tempo de reação simples. O simples tempo total da atividade não fundamenta atenção sustentada; aqui ela é atribuída porque cada bloco contém uma sequência contínua de eventos que requer resposta e atualização em todos os itens.
17. **Impacto da modalidade:** não se aplica; não há seletor e os estímulos são visuais.
18. **Impacto da leitura assistiva:** não se aplica. Falar cada letra criaria um segundo canal de estímulo e poderia facilitar ou interferir na atualização; não seria apoio neutro à instrução.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se atualização de informação ou memória operacional verbal deve rotular o principal; se resultados devem ser separados por N; como interpretar omissões versus escolhas incorretas; e se a proporção de correspondências e a conclusão integral do último bloco são adequadas ao uso clínico pretendido.

## 25. Cubos

1. **Nome oficial:** Cubos.
2. **ID técnico:** `cubo-corsi`.
3. **Categoria atual:** Memória.
4. **Subdomínio atual:** Memória Visuoespacial.
5. **Objetivo funcional aparente:** reter uma sequência de posições distribuídas em faces de um cubo e reproduzi-la no mesmo objeto.
6. **Resumo da mecânica real:** o objeto tem doze células clicáveis em três faces visíveis. Para cada item da sequência, o cubo sai da vista isométrica, gira até deixar quase frontal a face relevante, acende uma célula com um bipe uniforme, apaga e volta à vista isométrica antes do próximo item. No perfil inicial são dois itens; uma célula não se repete imediatamente, mas pode reaparecer mais tarde. Na resposta, o cubo permanece em vista isométrica e o paciente toca a sequência completa na mesma ordem. A extensão se ajusta por tentativa e o encerramento global é verificado depois da resposta.
7. **Resposta exigida do paciente:** tocar, na vista isométrica estável, as células correspondentes na mesma ordem em que foram mostradas sob diferentes orientações do cubo.
8. **Unidade básica da tarefa:** codificação serial de posição e face, remapeamento de orientação e reprodução visuoespacial.
9. **Domínio principal:** **memória operacional visuoespacial**.
10. **Domínios secundários:** armazenamento visuoespacial de curto prazo; manipulação mental; rotação mental; relações espaciais; percepção de posição; constância perceptiva; integração visuoespacial; sequenciamento; orientação atencional; manutenção de meta.
11. **Demandas instrumentais:** percepção de profundidade e orientação das faces; visão do realce; uso de mouse ou toque; precisão visuomotora. O bipe tem frequência fixa e não identifica célula ou face.
12. **Estratégias possíveis:** nomear face e quadrante; construir uma trajetória tridimensional; converter cada posição em rótulo verbal; ensaio mental; acompanhar as rotações; remapear a face frontal para a vista isométrica; agrupar itens por face; monitorar a quantidade de toques.
13. **Perfil basal 0–3:** memória operacional visuoespacial — **3**; armazenamento visuoespacial de curto prazo — **2**; manipulação mental — **2**; rotação mental — **2**; relações espaciais — **2**; percepção de posição — **2**; constância perceptiva — **2**; integração visuoespacial — **2**; sequenciamento — **2**; orientação atencional — **1**; manutenção de meta — **1**.
14. **Modificadores nos níveis avançados:** a extensão cresce de duas para até nove posições; a sequência pode retornar a uma célula já usada desde que não seja repetição imediata. O número de faces e o ritmo de giro permanecem. Séries maiores ampliam retenção serial, remapeamento entre orientações e monitoramento, sem introduzir ordem inversa ou regra alternante.
15. **Processos pouco ou não recrutados:** memória verbal obrigatória, processamento auditivo de conteúdo, atualização contínua no sentido de N-back, busca visual entre distratores, planejamento, pressão temporal de resposta, memória episódica e tomada de decisão cotidiana.
16. **Risco de confundir requisito da tarefa com alvo de treino:** percepção 3D e precisão de toque podem limitar a execução. Classificá-lo apenas pelo rótulo histórico de tarefa espacial apagaria que cada posição é mostrada com uma face quase frontal, mas deve ser respondida no cubo isométrico; essa mudança recruta constância perceptiva, relações espaciais e remapeamento/rotação, além da retenção serial.
17. **Impacto da modalidade:** não se aplica; não há seletor. O bipe uniforme marca o momento do flash, mas não oferece código auditivo para a posição.
18. **Impacto da leitura assistiva:** não se aplica; o estímulo espacial não é textual.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** quanto do desempenho deve ser atribuído a armazenamento serial versus remapeamento tridimensional; se resultados precisam separar trocas de face e repetições na mesma face; se a animação de giro facilita orientação ou adiciona interferência; e se o nome clínico deve explicitar que não se trata de aplicação padronizada de um teste neuropsicológico.

## Matriz consolidada do perfil basal — Lote B

A matriz mantém somente valores de 1 a 3. Mudanças de modalidade e operações que entram apenas em níveis posteriores permanecem descritas nas fichas, não são retroprojetadas para o perfil basal.

| Exercício | Domínio principal | Perfil basal 0–3 (somente valores ≥ 1) | Confiança |
|---|---|---|---|
| Span Numérico Auditivo Direto | armazenamento verbal de curto prazo | armazenamento verbal de curto prazo 3 · memória operacional verbal 2 · processamento auditivo sequencial 2 · sequenciamento 2 · manutenção de meta 1 · atenção seletiva 1 · armazenamento visuoespacial de curto prazo 1 | alto |
| Span Numérico Auditivo Inverso | manipulação mental | manipulação mental 3 · memória operacional verbal 3 · armazenamento verbal de curto prazo 2 · processamento auditivo sequencial 2 · sequenciamento 2 · manutenção de meta 2 · armazenamento visuoespacial de curto prazo 1 | alto |
| Matriz Espacial | armazenamento visuoespacial de curto prazo | armazenamento visuoespacial de curto prazo 3 · memória operacional visuoespacial 2 · sequenciamento 2 · percepção de posição 2 · orientação atencional 1 · manutenção de meta 1 · integração visuoespacial 1 | moderado |
| Matriz Espacial Inversa | manipulação mental | manipulação mental 3 · memória operacional visuoespacial 3 · armazenamento visuoespacial de curto prazo 2 · sequenciamento 2 · percepção de posição 2 · manutenção de meta 2 · orientação atencional 1 · integração visuoespacial 1 | moderado |
| Jogo da Memória | memória operacional visuoespacial | memória operacional visuoespacial 3 · armazenamento visuoespacial de curto prazo 2 · atualização de informação 2 · percepção de posição 2 · discriminação visual 2 · comparação 2 · aprendizagem por repetição 1 · busca visual 1 · monitoramento 1 · formação de estratégia 1 | alto |
| Letras em Sequência | armazenamento verbal de curto prazo | armazenamento verbal de curto prazo 3 · memória operacional verbal 2 · sequenciamento 2 · atenção seletiva 1 · controle de distração 1 · manutenção de meta 1 · discriminação visual 1 | alto |
| Sequência de Itens | armazenamento visuoespacial de curto prazo | armazenamento visuoespacial de curto prazo 3 · memória operacional visuoespacial 2 · sequenciamento 2 · discriminação visual 2 · atenção seletiva 1 · controle de distração 1 · comparação 1 | alto |
| Matriz com Rotações | rotação mental | rotação mental 3 · memória operacional visuoespacial 3 · manipulação mental 2 · armazenamento visuoespacial de curto prazo 2 · percepção de posição 2 · relações espaciais 2 · integração visuoespacial 2 · manutenção de meta 1 · monitoramento 1 | moderado |
| Lista com Distração | memória operacional verbal | memória operacional verbal 3 · armazenamento verbal de curto prazo 2 · controle de distração 2 · atenção alternada 2 · manutenção de meta 2 · atenção seletiva 1 · comparação 1 · atualização 1 | alto |
| Restaurante | memória operacional verbal | memória operacional verbal 3 · armazenamento verbal de curto prazo 2 · armazenamento visuoespacial de curto prazo 2 · atenção seletiva 2 · controle de distração 2 · comparação 2 · busca visual 1 · manutenção de meta 1 · memória operacional visuoespacial 1 | alto; interpretação de Somente áudio: moderado |
| Supermercado | memória operacional verbal | memória operacional verbal 3 · armazenamento verbal de curto prazo 2 · armazenamento visuoespacial de curto prazo 2 · busca visual 2 · atenção seletiva 2 · controle de distração 2 · comparação 2 · manutenção de meta 2 · memória operacional visuoespacial 1 · categorização 1 | alto; interpretação de Somente áudio: moderado |
| N-Back | atualização de informação | atualização de informação 3 · memória operacional verbal 3 · atualização 2 · comparação 2 · atenção sustentada 2 · manutenção de meta 2 · tempo de reação de escolha 2 · pressão temporal 2 · sequenciamento 1 · controle de distração 1 · monitoramento 1 | alto |
| Cubos | memória operacional visuoespacial | memória operacional visuoespacial 3 · armazenamento visuoespacial de curto prazo 2 · manipulação mental 2 · rotação mental 2 · relações espaciais 2 · percepção de posição 2 · constância perceptiva 2 · integração visuoespacial 2 · sequenciamento 2 · orientação atencional 1 · manutenção de meta 1 | alto |

# Adendo — Lote C (Executivas, Funcional e Social)

As nove fichas a seguir foram derivadas do componente executável, das bibliotecas de conteúdo e correção associadas, da geração ou seleção de problemas e da condição de encerramento. Mantêm a mesma escala e as mesmas distinções dos lotes anteriores. Os seletores Visual · Visual + áudio · Somente áudio de Caminhos para a Meta e Compra Multifuncional são tratados conforme o estado encontrado no código: em Caminhos, o componente atual oferece leitura assistiva por síntese de voz, mas não contém um contrato de modalidade em três vias; em Compra, o seletor está aprovado e ainda não foi implementado. Portanto, os efeitos desses três modos são projeções, não descrição de execuções atuais.

## 26. Caminhos para a Meta

1. **Nome oficial:** Caminhos para a Meta.
2. **ID técnico:** `antes-depois`.
3. **Categoria atual:** Funções Executivas.
4. **Subdomínio atual:** Planejamento e Flexibilidade.
5. **Objetivo funcional aparente:** estruturar ações cotidianas em um plano que alcance uma meta, distinguindo etapas necessárias, prioridades, intrusos e alternativas quando a situação muda.
6. **Resumo da mecânica real:** sem configuração prescrita, a sessão seleciona uma atividade ativa de menor nível de cada uma das três bibliotecas etárias. No perfil basal, são atividades textuais de ordenação: a meta e a instrução permanecem visíveis, quatro ou cinco cartões de ação começam embaralhados e o paciente os reorganiza por toque, arraste ou setas. A resposta é comparada com uma ordem exata ou com relações de precedência; um resultado parcial pode ser revisto, e há dicas graduais, desfazer/refazer e áudio sob demanda. A sessão avança após a conclusão de cada atividade e encerra quando acaba a lista montada ou quando o critério global é verificado entre atividades. Em atividades posteriores, o mesmo motor também seleciona prioridades, exclui intrusos, completa lacunas, corrige uma ordem pronta e apresenta uma segunda fase de imprevisto.
7. **Resposta exigida do paciente:** no basal, reordenar todos os cartões e confirmar; conforme o modo selecionado pelo conteúdo, escolher prioridades, deixar de fora ações irrelevantes, completar ou corrigir um plano e selecionar uma alternativa diante de uma mudança.
8. **Unidade básica da tarefa:** uma meta cotidiana acompanhada de um conjunto visível de ações que precisa ser estruturado e confirmado; em modos com imprevisto, acrescenta-se uma decisão de adaptação.
9. **Domínio principal:** **organização**.
10. **Domínios secundários:** sequenciamento; ordenação temporal ou funcional; planejamento; memória operacional verbal; compreensão verbal; raciocínio lógico; monitoramento; manutenção de meta; resolução de problemas; autonomia funcional simulada; flexibilidade cognitiva e controle inibitório apenas nos modos que efetivamente introduzem mudança, prioridade ou intruso.
11. **Demandas instrumentais:** leitura de meta, instrução e cartões no modo visual atual; visão do arranjo e dos marcadores de posição; uso de mouse, toque, arraste ou teclado; coordenação visuomotora. A leitura pode ser apoiada por áudio, e a destreza para arrastar não é domínio executivo treinado.
12. **Estratégias possíveis:** identificar primeiro a meta; procurar relações de pré-requisito; agrupar ações por etapa; montar início, meio e fim; antecipar consequências; eliminar ações que não contribuem; priorizar o indispensável; ensaio mental do plano; comparação com a meta; revisão sistemática antes de confirmar; autorregulação após feedback.
13. **Perfil basal 0–3:** organização — **3**; sequenciamento — **2**; planejamento — **2**; memória operacional verbal — **2**; compreensão verbal — **2**; leitura — **2**; raciocínio lógico — **2**; monitoramento — **2**; manutenção de meta — **2**; ordenação temporal — **2**; resolução de problemas — **1**; autonomia funcional — **1**.
14. **Modificadores nos níveis avançados:** mais ações e precedências ampliam integração verbal, sequenciamento e monitoramento; correção por dependências reduz a exigência de uma única ordem e aumenta avaliação de relações funcionais; intrusos e prioridades acrescentam controle de distração, seleção por relevância e inibição de ações atraentes porém inadequadas; completar e corrigir fornecem parte do plano como apoio externo, mas exigem detectar a lacuna ou o erro; imprevistos e planos alternativos introduzem resolução de problemas, flexibilidade cognitiva e supressão da estratégia que deixou de funcionar; duas mudanças ou múltiplas alternativas elevam atualização e comparação. As atividades são escolhidas por configuração, não pela prop `difficulty`, portanto o perfil da sessão depende diretamente do conjunto prescrito.
15. **Processos pouco ou não recrutados:** tempo de reação simples, rapidez perceptiva, atenção dividida, processamento auditivo sequencial no modo visual, rotação mental e memória episódica. Atenção sustentada não decorre do tempo total, pois a unidade é uma atividade discreta e autocadenciada.
16. **Risco de confundir requisito da tarefa com alvo de treino:** ler frases, arrastar cartões e conhecer rotinas cotidianas são requisitos de acesso e conhecimento prévio, não evidência isolada de planejamento. No basal, a rota é construída a partir de ações já fornecidas e visíveis; isso não equivale a gerar autonomamente um plano do zero. Os rótulos `habilidades` dos arquivos de conteúdo não substituem a análise da operação implementada, e cenários funcionais não comprovam transferência para autonomia real.
17. **Impacto da modalidade:** o catálogo declara Visual · Visual + áudio · Somente áudio, mas o componente atual não implementa uma chave de modalidade em três vias; a análise é projeção. **Perfil comum:** compreender a meta, avaliar relações entre ações, estruturar o plano e confirmar. **Visual:** texto e posição dos cartões permanecem disponíveis, favorecendo leitura, recodificação visual e consulta externa durante a organização. **Visual + áudio:** a fala congruente pode apoiar decodificação e compreensão; acompanhar simultaneamente voz e cartões pode acrescentar atenção dividida ou interferência, mas a redundância audiovisual também pode facilitar a execução. **Somente áudio:** se meta, instrução e ações forem apresentadas oralmente sem texto, aumentam processamento auditivo sequencial, armazenamento e memória operacional verbal; a resposta de ordenação ainda precisa de um contrato acessível, pois ocultar rótulos sem oferecer identificação equivalente inviabilizaria a mecânica. Repetição, permanência de cartões e sincronização precisam ser definidas antes de comparar os modos.
18. **Impacto da leitura assistiva:** no código atual, o botão do cabeçalho fala **meta + instrução**, e outro botão repete apenas a **meta**; isso apoia leitura de orientação geral, que continua visível. Cada cartão possui áudio sob demanda: aqui a fala alcança **conteúdo que faz parte da tarefa**, mas o texto também permanece disponível, de modo que ouvir novamente funciona como apoio à compreensão e à comparação, não como repetição de material oculto que deveria ser memorizado. Dicas, imprevistos e feedback também podem ser falados; como revelam relações ou alternativas, seu uso altera o apoio oferecido à resolução, ainda que não constitua modalidade. A configuração `audioHabilitado` é leitura assistiva e não equivale ao seletor projetado.
19. **Confiança:** **alto** para a mecânica e o áudio atuais; **moderado** para a projeção das modalidades.
20. **Questões que precisam de decisão clínica humana:** se organização ou planejamento deve rotular o domínio principal; quais modos podem compartilhar um resultado clínico; se bibliotecas etárias devem ter perfis separados; qual contrato define cada modalidade e a repetição do conteúdo; como registrar uso de áudio, dica e revisão; e até que ponto conhecimento prévio de rotinas deve ser controlado na interpretação.

## 27. Jogo das Torres

1. **Nome oficial:** Jogo das Torres.
2. **ID técnico:** `torre-hanoi`.
3. **Categoria atual:** Funções Executivas.
4. **Subdomínio atual:** Planejamento.
5. **Objetivo funcional aparente:** alcançar uma configuração final por uma sequência de movimentos válidos, antecipando estados intermediários e usando um pino auxiliar.
6. **Resumo da mecânica real:** o perfil inicial apresenta três discos empilhados do maior para o menor no pino de origem. O paciente toca um pino para retirar seu disco superior e outro para depositá-lo; movimentos que colocariam disco maior sobre menor são rejeitados. A rodada termina quando todos os discos chegam ao pino de destino. Resolver é suficiente para avançar à tela de feedback, mas somente usar o número mínimo de movimentos é registrado como resultado ótimo e aumenta a quantidade de discos; uma solução não ótima mantém a mesma quantidade na rodada seguinte. A sessão é verificada apenas depois de um quebra-cabeça concluído.
7. **Resposta exigida do paciente:** selecionar sucessivamente pino de origem e pino de destino para mover um disco válido até reconstruir toda a torre no destino.
8. **Unidade básica da tarefa:** escolha de um movimento que transforma o estado atual do tabuleiro e preserva as regras, dentro de uma sequência orientada à configuração final.
9. **Domínio principal:** **planejamento**.
10. **Domínios secundários:** resolução de problemas; raciocínio visuoespacial; memória operacional visuoespacial; manipulação mental; sequenciamento; relações espaciais; organização; monitoramento; manutenção de meta; controle inibitório.
11. **Demandas instrumentais:** visão de tamanhos, posições e cores dos discos; compreensão da regra; uso de mouse ou toque; coordenação visuomotora para selecionar pinos. O número escrito no disco e a precisão do toque não são alvos cognitivos.
12. **Estratégias possíveis:** análise meios–fins; decomposição em submetas; liberar primeiro o maior disco; ensaio mental de movimentos; planejamento antecipado; uso deliberado do pino auxiliar; comparação com o estado-meta; contagem de movimentos; pausa antes de desfazer uma configuração útil.
13. **Perfil basal 0–3:** planejamento — **3**; resolução de problemas — **2**; raciocínio visuoespacial — **2**; memória operacional visuoespacial — **2**; manipulação mental — **2**; sequenciamento — **2**; relações espaciais — **2**; monitoramento — **2**; manutenção de meta — **2**; organização — **1**; controle inibitório — **1**.
14. **Modificadores nos níveis avançados:** o número de discos pode crescer até oito, ampliando a profundidade de submetas, a quantidade de estados intermediários e a necessidade de manter consequências futuras; a solução mínima cresce exponencialmente. A regra não muda, os estados permanecem visíveis e movimentos ilegais continuam bloqueados, oferecendo apoio externo constante. A progressão só ocorre após solução ótima, portanto mais discos representam maior profundidade de planejamento, não uma nova operação.
15. **Processos pouco ou não recrutados:** leitura, linguagem como alvo, atenção dividida, alternância de regra, processamento auditivo, rotação mental obrigatória, memória episódica e tempo de reação. Atenção sustentada não é atribuída apenas porque a solução pode exigir muitos movimentos.
16. **Risco de confundir requisito da tarefa com alvo de treino:** discriminar tamanhos e tocar pinos são requisitos perceptivomotores. A interface impede movimentos ilegais, então erros de regra não são observados como execução consumada. Resolver por tentativa e erro não prova planejamento antecipado, e contar movimentos mínimos não separa, sozinho, ensaio mental de aprendizagem da solução por repetição.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva no exercício. A regra é ensinada por texto e demonstração interativa no tutorial.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se desempenho deve distinguir resolução, optimalidade e trajetória de movimentos; quanto o bloqueio de movimentos ilegais deve ser considerado facilitação; se tentativas repetidas do mesmo número de discos medem aprendizagem de estratégia; e se planejamento ou resolução de problemas deve ser o rótulo clínico principal.

## 28. Labirinto

1. **Nome oficial:** Labirinto.
2. **ID técnico:** `labirinto`.
3. **Categoria atual:** Funções Executivas.
4. **Subdomínio atual:** Planejamento.
5. **Objetivo funcional aparente:** encontrar e executar uma rota até uma saída visível, evitando paredes, retornos e caminhos improdutivos.
6. **Resumo da mecânica real:** cada rodada gera um labirinto aleatório em grade, abre rotas adicionais e escolhe uma única célula de saída na borda, marcada por uma bandeira. O jogador começa no canto oposto e só pode mover-se para uma célula adjacente por toque, teclado, gesto ou controle direcional; paredes bloqueiam a tentativa, e células visitadas ficam marcadas. A rodada termina ao alcançar a saída ou quando a janela própria se encerra. O código calcula o menor caminho e registra movimentos extras, becos, retornos, repetições e colisões; o próximo tamanho sobe, mantém ou desce conforme solução e eficiência. A sessão é verificada após o relatório de cada labirinto.
7. **Resposta exigida do paciente:** deslocar o marcador, uma célula por vez, até a bandeira, escolhendo uma rota válida e revisando-a quando encontra bloqueios ou becos.
8. **Unidade básica da tarefa:** escolha de um deslocamento espacial adjacente que atualiza posição, rota explorada e distância prática até a saída.
9. **Domínio principal:** **planejamento**.
10. **Domínios secundários:** raciocínio visuoespacial; busca visual; memória operacional visuoespacial; relações espaciais; resolução de problemas; monitoramento; manutenção de meta; atenção sustentada; controle de distração; controle inibitório; velocidade de processamento como contribuição limitada pela janela da rodada.
11. **Demandas instrumentais:** visão das paredes estreitas, trilha, jogador e bandeira; percepção espacial da grade; uso de mouse, toque, gesto ou teclado; coordenação e direção motora. Colisões na parede e latência incluem controle do dispositivo e não isolam planejamento.
12. **Estratégias possíveis:** traçar visualmente uma rota antes de mover; varredura da saída para o início; dividir o campo em segmentos; manter pontos de decisão; evitar repetir células; usar a trilha visível; comparar alternativas em bifurcações; retornar deliberadamente ao último ponto útil; autorregular movimentos quando o caminho parece promissor mas não chega à meta.
13. **Perfil basal 0–3:** planejamento — **3**; raciocínio visuoespacial — **2**; busca visual — **2**; memória operacional visuoespacial — **2**; relações espaciais — **2**; resolução de problemas — **2**; monitoramento — **2**; manutenção de meta — **2**; atenção sustentada — **2**; controle de distração — **1**; controle inibitório — **1**; velocidade de processamento — **1**.
14. **Modificadores nos níveis avançados:** grades maiores ampliam cobertura visual, retenção de pontos de decisão e extensão da rota; mais aberturas e rotas falsas aumentam comparação de alternativas e controle de distração; mais corredores próximos da borda elevam a necessidade de confirmar a ligação real com a saída; a margem permitida sobre o menor caminho se estreita, aumentando monitoramento e planejamento antecipado. A adaptação de tamanho depende de eficiência, becos e movimentos extras, mas a bandeira e a trilha visitada continuam visíveis.
15. **Processos pouco ou não recrutados:** compreensão textual além da instrução, processamento auditivo, alternância de regra, memória verbal, rotação mental e memória episódica. A tarefa não mede tempo de reação simples: cada movimento é uma escolha espacial dependente do estado atual.
16. **Risco de confundir requisito da tarefa com alvo de treino:** enxergar paredes e comandar direções são requisitos instrumentais; dificuldade com gesto ou teclado pode gerar colisões sem representar falha de planejamento. A trilha externa reduz a necessidade de lembrar todas as posições visitadas. Além disso, chegar à saída por exploração reativa não demonstra necessariamente que a rota foi planejada antes do primeiro movimento.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva. A instrução geral não é conteúdo a memorizar.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se eficiência, becos, retornos e colisões devem formar indicadores separados; quanto a trilha de células visitadas deve contar como apoio; se a janela por labirinto deve integrar a interpretação clínica; e se exploração bem-sucedida, mas não eficiente, representa resolução de problemas suficiente.

## 29. Ordem da História

1. **Nome oficial:** Ordem da História.
2. **ID técnico:** `ordem-historia`.
3. **Categoria atual:** Funções Executivas.
4. **Subdomínio atual:** Raciocínio Lógico.
5. **Objetivo funcional aparente:** reconstruir a sucessão coerente de acontecimentos visuais e, em desafios posteriores, detectar uma cena intrusa ou inferir a cena ausente.
6. **Resumo da mecânica real:** no perfil inicial, quatro cenas de uma história são apresentadas simultaneamente em ordem embaralhada. O paciente arrasta os cartões até formar a sequência e confirma; cada posição é comparada com o índice correto, há feedback visual e começa outra história. O número de cenas cresce com o estágio. Em um desafio posterior, oito cenas incluem uma intrusa que precisa ser marcada e as sete restantes ordenadas. No desafio final, sete cenas já aparecem em ordem, seguidas de uma lacuna; o paciente escolhe entre três imagens a que completa a narrativa, com tentativas e dicas. A sessão usa um único modo conforme o estágio de entrada e verifica o encerramento entre rodadas.
7. **Resposta exigida do paciente:** no basal, arrastar todas as cenas para a ordem de começo a fim e confirmar; nos desafios, também excluir uma intrusa ou escolher a cena que preenche a lacuna.
8. **Unidade básica da tarefa:** estabelecer a posição temporal e causal de uma cena em relação às demais dentro de uma narrativa visual.
9. **Domínio principal:** **ordenação temporal**.
10. **Domínios secundários:** sequenciamento; raciocínio lógico; resolução de problemas; monitoramento; discriminação visual; memória operacional visuoespacial; manutenção de meta; organização; inferência; controle de distração e controle inibitório no desafio de intruso.
11. **Demandas instrumentais:** visão e interpretação de ilustrações; discriminação de detalhes entre cenas; uso de mouse, toque ou teclado para arrastar; coordenação visuomotora. A habilidade de arraste e familiaridade com convenções narrativas não são, por si, ordenação temporal.
12. **Estratégias possíveis:** localizar a cena inicial e a final; comparar mudanças de objetos, pessoas e resultados; formar pares antes–depois; construir uma cadeia causal; eliminar posições impossíveis; ensaio mental da narrativa; revisão sistemática das transições; no intruso, testar pertencimento ao mesmo enredo; na lacuna, comparar cada hipótese com o evento anterior.
13. **Perfil basal 0–3:** ordenação temporal — **3**; sequenciamento — **2**; raciocínio lógico — **2**; resolução de problemas — **2**; monitoramento — **2**; discriminação visual — **2**; memória operacional visuoespacial — **1**; manutenção de meta — **1**; organização — **1**.
14. **Modificadores nos níveis avançados:** mais cenas ampliam o número de relações temporais a integrar e a necessidade de monitorar transições; o modo intruso acrescenta seleção por coerência, controle de distração e inibição da cena excluída ao ordenar; o modo de lacuna reduz a manipulação da ordem, pois as cenas permanecem organizadas, mas aumenta inferência causal e comparação entre três continuidades; dicas e tentativas extras fornecem andaimes. Como o modo é fixado pelo estágio da sessão, esses desafios constituem perfis qualitativamente distintos, não apenas versões maiores da ordenação basal.
15. **Processos pouco ou não recrutados:** planejamento antecipado de ações cotidianas, memória episódica pessoal, processamento auditivo, atenção dividida, alternância de regra e tempo de reação. As cenas ficam visíveis, portanto não há retenção visuoespacial sem apoio.
16. **Risco de confundir requisito da tarefa com alvo de treino:** interpretar ilustrações, reconhecer scripts familiares e manipular cartões são requisitos. Uma sequência pode ser resolvida por conhecimento cultural do roteiro, não apenas por raciocínio temporal. O nome “história” não implica memória episódica, e arranjar cenas não deve ser classificado automaticamente como planejamento.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva. Os textos de instrução são gerais, enquanto o conteúdo ordenado é pictórico.
19. **Confiança:** **alto** para a mecânica; **moderado** para a equivalência clínica entre histórias, que depende do conteúdo visual.
20. **Questões que precisam de decisão clínica humana:** se os três modos devem ter resultados e perfis separados; como validar equivalência cultural e clareza causal das pranchas; quanto tentativas e dicas devem alterar a interpretação; e se posição correta por cena representa adequadamente sequências parcialmente coerentes.

## 30. Compra Multifuncional

1. **Nome oficial:** Compra Multifuncional.
2. **ID técnico:** `compra-multifuncional`.
3. **Categoria atual:** Desenvolvimento Funcional.
4. **Subdomínio atual:** Autonomia.
5. **Objetivo funcional aparente:** resolver problemas numéricos e escolhas com restrições em narrativas de compra, dinheiro, quantidade e peso.
6. **Resumo da mecânica real:** antes da sessão, o paciente escolhe um tema e um foco de operação; por padrão, o tema varia e o foco percorre uma missão completa. Cada missão encadeia etapas visíveis de soma de preços, troco, orçamento, multiplicação, divisão, soma e limite de peso e seleção de itens sob uma ou mais regras. Nas etapas numéricas, os operandos e a cena permanecem visíveis e o paciente digita o resultado ou, nos níveis iniciais, pode usar uma de três respostas rápidas. Nas etapas de seleção, cartões mostram nome, preço e peso; o paciente escolhe itens, enquanto a interface exibe contagem e nomes, mas não calcula o total antes da confirmação. Erros recebem feedback progressivo e permitem nova tentativa. A etapa termina com acerto ou avanço após tentativas; a missão seguinte ajusta o nível conforme acertos de primeira, e o encerramento é verificado entre etapas.
7. **Resposta exigida do paciente:** calcular e inserir um valor numérico ou selecionar uma combinação de itens que satisfaça simultaneamente quantidade, categoria, orçamento e/ou peso.
8. **Unidade básica da tarefa:** um problema funcional escrito com dados visuais e uma resposta numérica ou combinatória validada após confirmação.
9. **Domínio principal:** **resolução de problemas**.
10. **Domínios secundários:** raciocínio lógico e quantitativo; uso funcional de dinheiro; memória operacional verbal; compreensão verbal; leitura; manutenção de meta; monitoramento; comparação; atenção seletiva; busca visual; organização; controle inibitório nas escolhas com restrições; autonomia funcional simulada.
11. **Demandas instrumentais:** leitura de narrativa, instrução, números, unidades e regras; reconhecimento visual dos itens; conhecimento de símbolos e operações aritméticas; uso de keypad, mouse ou toque; coordenação visuomotora. Escolaridade matemática e familiaridade com dinheiro e medidas podem limitar o desempenho sem representar autonomia global.
12. **Estratégias possíveis:** identificar a operação; separar dados relevantes; cálculo mental ou decomposição; agrupamento de parcelas; estimativa e conferência; eliminação de combinações inviáveis; selecionar primeiro categorias obrigatórias; comparar total com limite; manter uma lista de regras; revisar quantidade, preço e peso antes de confirmar; autorregulação após o feedback.
13. **Perfil basal 0–3:** resolução de problemas — **3**; raciocínio lógico — **2**; memória operacional verbal — **2**; compreensão verbal — **2**; leitura — **2**; manutenção de meta — **2**; monitoramento — **2**; autonomia funcional — **2**; atenção seletiva — **1**; busca visual — **1**; organização — **1**; controle inibitório — **1**.
14. **Modificadores nos níveis avançados:** números maiores ampliam cálculo e monitoramento; menor folga de orçamento ou peso aumenta comparação precisa; mais itens e distratores ampliam busca e eliminação de hipóteses; combinar preço e peso ou várias regras aumenta memória operacional verbal, manutenção de meta e controle inibitório; nas etapas finais dos níveis mais altos, uma janela de resposta passa a influenciar velocidade de processamento. O foco escolhido muda qualitativamente a sessão: soma alterna cálculo e orçamento; subtração alterna troco e capacidade restante; multiplicação e divisão repetem a operação com magnitudes variáveis; o foco completo percorre todas as operações e restrições. As respostas rápidas visuais desaparecem após os níveis iniciais, retirando um apoio de reconhecimento.
15. **Processos pouco ou não recrutados:** memória episódica, rotação mental, atenção dividida no modo visual atual, alternância de regra explícita e tempo de reação simples. A troca de operação entre etapas do foco completo é anunciada pelo enunciado, não uma alternância rápida de critério sobre o mesmo estímulo.
16. **Risco de confundir requisito da tarefa com alvo de treino:** cálculo, alfabetização, reconhecimento de unidades e domínio cultural de preços são requisitos fortes. O cenário de compra não demonstra execução autônoma de uma compra real, uso de pagamento ou generalização funcional. A cena temática pode ser decorativa em relação à operação numérica. Medir acerto de primeira mistura raciocínio, conhecimento escolar e uso do suporte de resposta rápida.
17. **Impacto da modalidade:** o seletor Visual · Visual + áudio · Somente áudio foi aprovado e **ainda não está implementado**; a análise é projeção. **Perfil comum:** compreender o problema, manter valores e regras, calcular ou comparar e produzir uma resposta. **Visual:** narrativa, operandos, regras e cartões permanecem consultáveis, favorecendo leitura, memória visual e apoio externo ao monitoramento. **Visual + áudio:** a fala pode apoiar leitura e codificação verbal; fontes congruentes podem facilitar pela redundância audiovisual, enquanto fala longa concorrendo com inspeção de itens pode acrescentar atenção dividida ou interferência. **Somente áudio:** ocultar o enunciado e os valores aumentaria processamento auditivo sequencial, armazenamento e memória operacional verbal e reduziria leitura e memória visual do conteúdo; contudo, etapas de seleção ainda precisam de identificação acessível dos itens e seus valores. Permanência, repetição, segmentação das regras e forma de resposta precisam ser definidas antes de estimar o perfil.
18. **Impacto da leitura assistiva:** não há leitura assistiva implementada no componente atual. Uma futura fala de tutorial ou instrução geral seria acessibilidade de entrada. Falar o enunciado, os operandos, preços, pesos ou regras seria apresentação de **conteúdo da tarefa**; repeti-los após a primeira apresentação forneceria nova exposição ao material usado no cálculo e na comparação, efeito que deve ser distinguido do simples áudio de orientação.
19. **Confiança:** **alto** para a mecânica atual; **moderado** para a projeção das modalidades.
20. **Questões que precisam de decisão clínica humana:** se o principal deve ser resolução de problemas, uso funcional de dinheiro ou autonomia; como separar desempenho por operação e por etapa numérica versus seleção; qual contrato define os três modos e a repetição; se respostas rápidas podem ser comparadas ao keypad; como controlar escolaridade matemática; e qual evidência é exigida antes de interpretar transferência funcional.

## 31. Alternância de Regras

1. **Nome oficial:** Alternância de Regras.
2. **ID técnico:** `task-switching`.
3. **Categoria atual:** Funções Executivas.
4. **Subdomínio atual:** Flexibilidade Cognitiva.
5. **Objetivo funcional aparente:** classificar estímulos por um critério ativo e substituir esse critério quando a regra muda entre blocos.
6. **Resumo da mecânica real:** a sessão gera blocos de quatro a seis cartas. Cada carta combina cor, número e forma; um banner visível define se a resposta deve considerar cor, paridade do número ou forma, com dois botões rotulados. A regra permanece constante dentro do bloco e muda obrigatoriamente entre blocos. As três primeiras mudanças recebem um aviso destacado antes da próxima carta; mudanças posteriores aparecem apenas pela troca do banner e dos rótulos. Cada toque é classificado, o tempo até a escolha é registrado e, após feedback breve, surge a próxima carta. A prop `difficulty` não altera cartas, tamanho dos blocos, regras nem ritmo.
7. **Resposta exigida do paciente:** aplicar a regra atualmente visível à carta e tocar a alternativa esquerda ou direita correspondente.
8. **Unidade básica da tarefa:** uma classificação binária por regra ativa; a primeira tentativa após cada troca é a unidade específica de alternância.
9. **Domínio principal:** **alternância de regra**.
10. **Domínios secundários:** flexibilidade cognitiva; controle inibitório; atenção seletiva; manutenção de meta; atualização da regra ativa; tempo de reação de escolha; velocidade de processamento; discriminação visual; memória operacional verbal; monitoramento.
11. **Demandas instrumentais:** visão de cor, forma e algarismos; leitura do banner e dos rótulos; conhecimento de par e ímpar; uso de mouse ou toque; velocidade motora. Paridade é conhecimento prévio, e a latência mistura decisão com execução do toque.
12. **Estratégias possíveis:** verbalizar a regra atual; ignorar atributos irrelevantes; recodificar os dois botões; conferir o banner antes de cada resposta; desacelerar após uma troca; comparar a carta somente pelo atributo-alvo; ensaio mental do mapeamento esquerda/direita; autorregulação após erro.
13. **Perfil basal 0–3:** alternância de regra — **3**; flexibilidade cognitiva — **2**; controle inibitório — **2**; atenção seletiva — **2**; manutenção de meta — **2**; tempo de reação de escolha — **2**; velocidade de processamento — **2**; discriminação visual — **2**; atualização — **2**; memória operacional verbal — **1**; monitoramento — **1**.
14. **Modificadores nos níveis avançados:** não há modificador por nível implementado. Dentro da sessão, o tamanho aleatório do bloco muda a previsibilidade temporal da troca; as três primeiras mudanças recebem um aviso adicional e as seguintes retiram esse apoio, aumentando monitoramento do banner. A regra nova nunca repete a anterior, mas o intervalo entre trocas permanece de quatro a seis respostas e os atributos continuam binários, salvo o conjunto de números usado para paridade.
15. **Processos pouco ou não recrutados:** planejamento, resolução de problemas abertos, memória episódica, atenção dividida, processamento auditivo, rotação mental e tempo de reação simples. Vários atributos na carta não constituem dupla tarefa, pois somente um critério deve orientar a resposta.
16. **Risco de confundir requisito da tarefa com alvo de treino:** reconhecer cor, forma, número e paridade são requisitos. Como a regra e os rótulos permanecem visíveis, armazenamento verbal é apoiado externamente. A média geral de tempo não isola custo de troca, e conflito entre atributos não é controlado explicitamente; portanto, controle inibitório não deve ser inferido apenas de toda carta multicaracterística.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva.
19. **Confiança:** **alto** para a mecânica; **moderado** para qualquer interpretação de progressão por dificuldade, pois ela não modifica a tarefa.
20. **Questões que precisam de decisão clínica humana:** se custo de troca deve usar latência, acurácia ou ambos; se tentativas congruentes e incongruentes precisam ser balanceadas; se os avisos iniciais devem ser comparados às trocas sem aviso; se as três regras podem ser agregadas; e se a ausência de modificador por nível invalida comparações longitudinais de dificuldade.

## 32. Grade Dedutiva

1. **Nome oficial:** Grade Dedutiva.
2. **ID técnico:** `deductive-grid`.
3. **Categoria atual:** Funções Executivas.
4. **Subdomínio atual:** Raciocínio Lógico.
5. **Objetivo funcional aparente:** combinar pistas afirmativas e negativas para atribuir, por exclusão, um valor único a cada pessoa.
6. **Resumo da mecânica real:** cada quebra-cabeça mostra três pessoas e três valores no perfil inicial, junto de duas a quatro pistas escritas. O paciente toca células para alternar vazio, sim e não; marcar sim em outra célula da mesma linha substitui um sim anterior, mas a grade não completa automaticamente todas as exclusões. O botão de confirmação só é liberado quando há um sim por pessoa. A resposta é comparada ao gabarito; células divergentes são destacadas e podem ser revistas até a solução correta. Depois de resolver, outro problema é selecionado do banco de dificuldade próximo, e a sessão é verificada entre problemas.
7. **Resposta exigida do paciente:** usar as pistas para marcar uma associação positiva por pessoa, registrar exclusões quando útil e confirmar uma correspondência completa um-para-um.
8. **Unidade básica da tarefa:** deduzir uma associação necessária pela combinação de pistas e exclusões já registradas na grade.
9. **Domínio principal:** **raciocínio dedutivo**.
10. **Domínios secundários:** raciocínio lógico; resolução de problemas; memória operacional verbal; organização; monitoramento; manutenção de meta; compreensão verbal; leitura; controle inibitório diante de hipóteses incompatíveis.
11. **Demandas instrumentais:** leitura de nomes, categorias e pistas; compreensão de negação, disjunção e exclusividade; visão da grade; uso de mouse ou toque; precisão para alternar estados. Alfabetização e domínio semântico dos enunciados podem limitar a dedução.
12. **Estratégias possíveis:** registrar primeiro as afirmações diretas; marcar negações; eliminar valores já atribuídos; procurar linha ou coluna com uma única alternativa; encadear consequências; testar hipótese e buscar contradição; varredura sistemática de linhas e colunas; revisar todas as pistas antes de confirmar.
13. **Perfil basal 0–3:** raciocínio dedutivo — **3**; raciocínio lógico — **2**; resolução de problemas — **2**; memória operacional verbal — **2**; organização — **2**; monitoramento — **2**; manutenção de meta — **2**; compreensão verbal — **2**; leitura — **2**; controle inibitório — **1**.
14. **Modificadores nos níveis avançados:** mais pistas e cadeias de negação ampliam integração verbal e monitoramento; enunciados com “ou” exigem manter alternativas até outra pista eliminá-las; grades de quatro por quatro aumentam o espaço de hipóteses e a quantidade de exclusões; problemas de dificuldade intermediária e avançada entram conforme o nível inicial. As pistas e marcações permanecem visíveis, oferecendo memória externa, e erros podem ser revistos sem limite próprio de tentativas.
15. **Processos pouco ou não recrutados:** memória episódica, atenção dividida, alternância de regra, planejamento de atividades, rotação mental, processamento auditivo e tempo de reação. Marcar a grade é uma ferramenta de organização, não velocidade motora.
16. **Risco de confundir requisito da tarefa com alvo de treino:** ler negações, conhecer vocabulário e manipular a grade são requisitos. O tema cotidiano dos atributos é decorativo e não implica autonomia. Alguns problemas podem ser resolvidos por uma afirmação direta e exclusão simples, enquanto outros exigem cadeias; agregá-los apenas pelo tamanho da grade pode esconder operações diferentes.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva.
19. **Confiança:** **moderado**, porque a operação é clara, mas a equivalência e a suficiência lógica de cada conjunto de pistas dependem de validação do banco.
20. **Questões que precisam de decisão clínica humana:** se o banco deve passar por validação formal de unicidade e equivalência; se afirmações diretas, negações e disjunções precisam de resultados separados; como interpretar revisões após células destacadas; e se raciocínio dedutivo ou resolução de problemas deve rotular o principal.

## 33. Estacionamento Lógico

1. **Nome oficial:** Estacionamento Lógico.
2. **ID técnico:** `estacionamento-logico`.
3. **Categoria atual:** Funções Executivas.
4. **Subdomínio atual:** Planejamento.
5. **Objetivo funcional aparente:** liberar um veículo-alvo por uma sequência de deslocamentos que remove bloqueios interdependentes.
6. **Resumo da mecânica real:** após um tutorial guiado, a rodada escolhe uma fase validada em uma grade seis por seis. O carro vermelho horizontal deve sair pela borda direita; os demais só deslizam ao longo da própria orientação e param antes de bordas ou veículos. O paciente arrasta um carro para uma nova posição, atualizando todo o estado. No perfil inicial, a solução mínima do banco exige cinco movimentos, embora a quantidade de veículos varie. A rodada termina quando o carro-alvo cruza a saída. Resolver no mínimo avança a dificuldade; resultados próximos podem ser repetidos ou aceitos, e resultados mais distantes exigem nova tentativa. Após uma sequência de resultados não ótimos, pode ser solicitado um modo guiado que destaca o próximo carro de uma solução mínima.
7. **Resposta exigida do paciente:** deslocar veículos em suas pistas para abrir espaço em uma cadeia de dependências e, ao final, arrastar o carro vermelho até a saída.
8. **Unidade básica da tarefa:** escolha de um veículo e de uma nova posição alcançável que modifica as possibilidades de movimentos seguintes.
9. **Domínio principal:** **planejamento**.
10. **Domínios secundários:** resolução de problemas; memória operacional visuoespacial; manipulação mental; raciocínio visuoespacial; relações espaciais; organização; monitoramento; manutenção de meta; sequenciamento; controle inibitório; busca visual.
11. **Demandas instrumentais:** visão de orientação, comprimento, posição e sobreposição dos veículos; percepção da saída e do carro-alvo; uso de mouse ou toque com arraste; coordenação e amplitude motora. O arraste contínuo e a imagem dos carros não são velocidade de processamento.
12. **Estratégias possíveis:** identificar bloqueadores diretos; trabalhar de trás para frente a partir da saída; decompor cadeias de bloqueio; ensaio mental de estados; liberar espaço temporário; evitar movimentos que fecham uma rota já aberta; contar transições entre veículos; manter submetas; comparar a posição atual com uma configuração anterior.
13. **Perfil basal 0–3:** planejamento — **3**; resolução de problemas — **2**; memória operacional visuoespacial — **2**; manipulação mental — **2**; raciocínio visuoespacial — **2**; relações espaciais — **2**; organização — **2**; monitoramento — **2**; manutenção de meta — **2**; sequenciamento — **2**; controle inibitório — **1**; busca visual — **1**.
14. **Modificadores nos níveis avançados:** o mínimo de movimentos cresce de cadeias curtas para sequências bem mais profundas, ampliando antecipação de estados e manutenção de submetas; a quantidade de veículos tende a ocupar uma faixa mais alta e aumenta interferência espacial; a dificuldade sobe após solução ótima e pode descer após resultados não ótimos consecutivos. O tabuleiro inteiro permanece visível, e cada veículo conserva seu único eixo. O modo guiado, quando acionado, reduz construção autônoma da estratégia ao indicar o próximo veículo e a direção.
15. **Processos pouco ou não recrutados:** rotação mental, leitura, linguagem como alvo, processamento auditivo, atenção dividida, alternância de regra, memória episódica e tempo de reação. Os carros não giram nem mudam de orientação.
16. **Risco de confundir requisito da tarefa com alvo de treino:** precisão do arraste, visão da grade e controle do dispositivo podem afetar movimentos sem representar planejamento. Resolver não implica solução ótima, e repetir a mesma fase pode refletir aprendizagem específica. A interface mantém o estado visível e bloqueia sobreposições, reduzindo armazenamento espacial puro e controle de regras físicas.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade.
18. **Impacto da leitura assistiva:** não se aplica; a instrução textual é geral e não há leitura assistiva.
19. **Confiança:** **alto**.
20. **Questões que precisam de decisão clínica humana:** se optimalidade deve ser requisito clínico ou indicador separado; como interpretar repetição obrigatória e aprendizagem da fase; quanto o modo guiado altera a comparabilidade; se planejamento e memória operacional visuoespacial devem ter métricas próprias; e se fases com igual mínimo de movimentos são clinicamente equivalentes.

## 34. Investigadores da Situação Social

1. **Nome oficial:** Investigadores da Situação Social.
2. **ID técnico:** `investigadores-sociais`.
3. **Categoria atual:** Desenvolvimento Funcional.
4. **Subdomínio atual:** Cognição Social.
5. **Objetivo funcional aparente:** interpretar emoções, contexto, perspectiva, intenção e regras sociais e escolher uma resposta interpessoal apoiada nas pistas da situação.
6. **Resumo da mecânica real:** o paciente escolhe uma faixa etária e recebe histórias dessa faixa ordenadas por proximidade do nível derivado da dificuldade. Cada item repete uma cena com personagens, descrição textual e contexto explícito e apresenta uma pergunta de escolha única sobre emoção, fato, perspectiva, regra ou solução. A resposta só é verificada após confirmação; um erro revela uma dica e também o texto da alternativa correta, sem segunda tentativa na mesma pergunta. Em seguida, a próxima pergunta da cena ou a próxima história é mostrada. A sessão encerra após percorrer o banco disponível da faixa ou quando o critério global é verificado ao fim de um caso. A implementação atual pontua apenas escolha única e escolha de expressão; há cinco histórias-semente jogáveis, distribuídas de forma desigual entre as faixas.
7. **Resposta exigida do paciente:** integrar descrição, contexto e expressão disponível, selecionar entre três interpretações ou condutas e confirmar uma alternativa.
8. **Unidade básica da tarefa:** uma pergunta sobre uma cena social, com pistas explícitas e três hipóteses de interpretação ou ação.
9. **Domínio principal:** **cognição social**.
10. **Domínios secundários:** reconhecimento de emoções; leitura de contexto; tomada de perspectiva; inferência social; interpretação de intenção; julgamento social; resolução de situações sociais; compreensão verbal; leitura; raciocínio lógico; memória operacional verbal; monitoramento; autonomia funcional simulada.
11. **Demandas instrumentais:** leitura da descrição, contexto, pergunta e opções; visão de expressões, personagens ou emojis; compreensão lexical e cultural; uso de mouse ou toque. Alfabetização, familiaridade cultural e percepção visual de expressão podem limitar a resposta sem constituir cognição social por si.
12. **Estratégias possíveis:** separar fato de interpretação; identificar pistas de rosto, corpo e contexto; comparar alternativas com evidências; gerar hipóteses alternativas; tomar a perspectiva de cada personagem; eliminar respostas absolutas ou sem apoio; categorizar emoção; antecipar consequência social; autorregular uma conclusão inicial.
13. **Perfil basal 0–3:** cognição social — **3**; compreensão verbal — **2**; leitura — **2**; resolução de problemas — **1**; raciocínio lógico — **1**; memória operacional verbal — **1**; monitoramento — **1**; discriminação visual — **1**; manutenção de meta — **1**; autonomia funcional — **1**.
14. **Modificadores nos níveis avançados:** o nível-alvo muda a ordem das histórias disponíveis, mas a biblioteca atual tem poucos casos e nem todas as faixas possuem mais de um nível; portanto, não há progressão paramétrica garantida. Eixos diferentes alteram o perfil: emoção favorece integração de expressão e contexto; fato versus interpretação e intenção elevam inferência e geração de hipóteses; regra e solução elevam julgamento e resolução social. Várias perguntas sobre a mesma cena reduzem a novidade e o feedback de uma pergunta pode orientar as seguintes. Formatos mais complexos previstos no motor não são usados pelo componente atual.
15. **Processos pouco ou não recrutados:** planejamento de múltiplos passos, alternância de regra, atenção dividida, velocidade de processamento, tempo de reação, processamento auditivo, rotação mental e memória episódica. A atividade registra latência, mas não impõe resposta rápida.
16. **Risco de confundir requisito da tarefa com alvo de treino:** a descrição verbal explicita muitas pistas que a imagem deveria sustentar, podendo permitir resposta por leitura literal. Escolher a alternativa editorialmente correta não equivale a comportamento social espontâneo nem prova generalização. Vocabulário, norma cultural e desejabilidade da opção podem dominar o desempenho. Os rótulos `habilidadeTreinada` e `eixo` orientam o conteúdo, mas não substituem validação clínica dos itens.
17. **Impacto da modalidade:** não se aplica; não há seletor de modalidade.
18. **Impacto da leitura assistiva:** não se aplica; não há leitura assistiva implementada. Se futuramente a cena e as opções forem faladas, isso apresentará conteúdo constitutivo da tarefa, não apenas instrução geral.
19. **Confiança:** **moderado**, porque a mecânica é clara, mas o banco é pequeno, desigual por faixa e ainda requer validação clínica e cultural.
20. **Questões que precisam de decisão clínica humana:** quais eixos e faixas estão clinicamente aprovados; se descrição textual deve nomear tão diretamente as pistas; se respostas socialmente desejáveis têm uma única leitura válida; como separar desempenho por eixo; se feedback entre perguntas do mesmo caso contamina itens seguintes; e que critério autoriza interpretar transferência para funcionamento social.

## Matriz consolidada do perfil basal — Lote C

| Exercício | Domínio principal | Perfil basal 0–3 (somente valores ≥ 1) | Confiança |
|---|---|---|---|
| Caminhos para a Meta | organização | organização 3 · sequenciamento 2 · planejamento 2 · memória operacional verbal 2 · compreensão verbal 2 · leitura 2 · raciocínio lógico 2 · monitoramento 2 · manutenção de meta 2 · ordenação temporal 2 · resolução de problemas 1 · autonomia funcional 1 | alto; modalidades projetadas: moderado |
| Jogo das Torres | planejamento | planejamento 3 · resolução de problemas 2 · raciocínio visuoespacial 2 · memória operacional visuoespacial 2 · manipulação mental 2 · sequenciamento 2 · relações espaciais 2 · monitoramento 2 · manutenção de meta 2 · organização 1 · controle inibitório 1 | alto |
| Labirinto | planejamento | planejamento 3 · raciocínio visuoespacial 2 · busca visual 2 · memória operacional visuoespacial 2 · relações espaciais 2 · resolução de problemas 2 · monitoramento 2 · manutenção de meta 2 · atenção sustentada 2 · controle de distração 1 · controle inibitório 1 · velocidade de processamento 1 | alto |
| Ordem da História | ordenação temporal | ordenação temporal 3 · sequenciamento 2 · raciocínio lógico 2 · resolução de problemas 2 · monitoramento 2 · discriminação visual 2 · memória operacional visuoespacial 1 · manutenção de meta 1 · organização 1 | alto; equivalência de conteúdo: moderado |
| Compra Multifuncional | resolução de problemas | resolução de problemas 3 · raciocínio lógico 2 · memória operacional verbal 2 · compreensão verbal 2 · leitura 2 · manutenção de meta 2 · monitoramento 2 · autonomia funcional 2 · atenção seletiva 1 · busca visual 1 · organização 1 · controle inibitório 1 | alto; modalidades projetadas: moderado |
| Alternância de Regras | alternância de regra | alternância de regra 3 · flexibilidade cognitiva 2 · controle inibitório 2 · atenção seletiva 2 · manutenção de meta 2 · tempo de reação de escolha 2 · velocidade de processamento 2 · discriminação visual 2 · atualização 2 · memória operacional verbal 1 · monitoramento 1 | alto; progressão por nível: moderado |
| Grade Dedutiva | raciocínio dedutivo | raciocínio dedutivo 3 · raciocínio lógico 2 · resolução de problemas 2 · memória operacional verbal 2 · organização 2 · monitoramento 2 · manutenção de meta 2 · compreensão verbal 2 · leitura 2 · controle inibitório 1 | moderado |
| Estacionamento Lógico | planejamento | planejamento 3 · resolução de problemas 2 · memória operacional visuoespacial 2 · manipulação mental 2 · raciocínio visuoespacial 2 · relações espaciais 2 · organização 2 · monitoramento 2 · manutenção de meta 2 · sequenciamento 2 · controle inibitório 1 · busca visual 1 | alto |
| Investigadores da Situação Social | cognição social | cognição social 3 · compreensão verbal 2 · leitura 2 · resolução de problemas 1 · raciocínio lógico 1 · memória operacional verbal 1 · monitoramento 1 · discriminação visual 1 · manutenção de meta 1 · autonomia funcional 1 | moderado |
