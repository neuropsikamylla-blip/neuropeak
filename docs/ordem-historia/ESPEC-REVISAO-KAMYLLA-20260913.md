# Revisão completa — "Ordem da História" · espec escrita por Kamylla, 13/set/2026

> Transcrição ÍNTEGRA do pedido dela. É a fonte da verdade do épico.
> A leitura técnica e a auditoria ficam em documentos separados.

Quero revisar este exercício de forma mais profunda, tanto na progressão cognitiva quanto na
experiência de uso.

**Importante:** não vou enviar imagens adicionais. Trabalhe exclusivamente com o código, dados,
histórias e assets que já existem no projeto. Não gere imagens novas e não substitua os assets atuais
nesta etapa.

Antes de alterar gabaritos ou conteúdo das histórias, faça uma auditoria completa da implementação
atual.

## 1. PRIMEIRO: AUDITORIA DO EXERCÍCIO

Antes de modificar qualquer `correctOrder`, história ou regra de progressão, identifique:

- todas as histórias atualmente existentes;
- ID/nome de cada história;
- quantidade de cenas de cada uma;
- IDs das cenas;
- `correctOrder` atual;
- ordem em que são apresentadas;
- regra usada atualmente para classificá-las como fácil/médio/difícil;
- como ocorre a progressão entre histórias;
- como o exercício persiste o progresso do paciente;
- como é calculada a barra global;
- como o feedback verde/laranja é determinado;
- se existe diferença entre índice do array, ID da cena e posição correta;
- se a ordem inicial é randomizada e de que forma;
- como tentativas, erros e acertos são registrados.

Quero especificamente verificar se a correção está comparando:

**cena escolhida + posição atual** com **posição correta daquela cena**

e não confundindo ID interno, índice do array ou número visual apresentado no cartão.

## 2. VERIFICAR POSSÍVEIS GABARITOS INCONSISTENTES

Há pelo menos uma história que merece atenção: **a história do cinema**.

Pelas cenas, a sequência esperada parece ser algo equivalente a:

comprar ingresso → entrar/chegar ao cinema → comprar pipoca → assistir ao filme

Em uma execução, essa sequência aparentemente coerente recebeu feedback parcial de erro.

Portanto, localize essa história no projeto e verifique:

- IDs das cenas;
- ordem cadastrada;
- `correctOrder`;
- randomização;
- comparação usada na correção;
- eventual diferença entre número visual e ID interno.

**Não assuma que o gabarito está errado. Descubra a causa.**

Se o ambiente não permitir interpretar visualmente determinado asset, não invente o significado da
imagem. Nesse caso, reporte apenas a inconsistência estrutural encontrada nos dados.

Faça essa mesma verificação em todas as histórias.

Caso alguma história tenha duas sequências semanticamente plausíveis, não altere automaticamente.
Apenas sinalize.

## 3. REMOVER A INFORMAÇÃO TÉCNICA DO TOPO

Atualmente aparece algo como: `Nível 1 · 4 cenas · fácil`

Remover completamente essa linha da interface. Não quero apresentar ao paciente:

- número do nível;
- quantidade de cenas;
- "fácil", "médio" ou "difícil".

Manter a barra global de progresso. A dificuldade deve aumentar silenciosamente por meio da própria
tarefa. Isso deixa o exercício menos escolarizado e menos parecido com um jogo infantil.

## 4. PROGRESSÃO DE DIFICULDADE REAL

Quero que a progressão seja baseada na demanda cognitiva da história, e não apenas em um rótulo.

A dificuldade deve considerar simultaneamente:

- quantidade de cenas;
- proximidade visual e semântica entre etapas;
- quantidade de pistas explícitas;
- clareza do começo e do desfecho;
- necessidade de inferir causalidade;
- quantidade de etapas intermediárias;
- semelhança entre eventos consecutivos;
- necessidade de planejamento antes de movimentar;
- possibilidade de mais de uma cena parecer inicialmente plausível;
- distância temporal entre causa e consequência.

### Progressão conceitual desejada

**Inicial:** 4 cenas; começo e final muito evidentes; sequência cotidiana clara; diferenças grandes
entre as cenas; causalidade explícita.

**Intermediária:** 5 cenas; mais etapas intermediárias; cenas semanticamente mais próximas; menos
pistas óbvias; necessidade de pensar no que depende do quê.

**Intermediária avançada:** 6 cenas; eventos consecutivos visualmente semelhantes; maior exigência de
planejamento; relações causais menos explícitas; começo/fim ainda identificáveis, mas meio da
narrativa mais difícil.

**Avançada:** 6 ou mais cenas, somente se já existirem assets adequados; necessidade real de
raciocínio temporal e causal; etapas intermediárias que não podem ser resolvidas apenas por aparência;
histórias nas quais o paciente precisa analisar a narrativa completa antes de agir.

Não aumentar a dificuldade simplesmente aumentando o número de imagens. Quero aumento real da demanda
de: **sequenciamento temporal + planejamento + raciocínio causal**.

## 5. USAR AS HISTÓRIAS EXISTENTES ANTES DE CRIAR QUALQUER COISA

Faça um inventário das histórias existentes e classifique-as internamente por dificuldade.

**Não criar novas histórias nem novas imagens agora.**

Se já houver material suficiente, reorganize a sequência de apresentação aproveitando o banco
existente.

Se o banco atual não for suficiente para uma progressão adequada, apenas informe:

- quantas histórias faltariam;
- quantas cenas seriam ideais;
- qual tipo de demanda cognitiva estaria faltando.

Não gerar assets automaticamente.

## 6. NÃO MOSTRAR "FÁCIL / MÉDIO / DIFÍCIL" AO PACIENTE

Esses níveis podem continuar existindo internamente para organização e adaptação, mas não devem
aparecer na interface. Para o paciente, a experiência deve parecer contínua. A barra de progresso deve
comunicar avanço suficiente.

## 7. TORNAR O EXERCÍCIO MAIS INTERESSANTE SEM MUDAR SUA ESSÊNCIA

Quero que ele continue sendo um exercício de ordenação temporal, mas com uma experiência mais dinâmica
e menos repetitiva. Implemente melhorias dentro da mecânica existente:

**Arrastar cartões.** Melhorar a sensação de drag-and-drop:

- cartão sobe levemente ao ser segurado;
- sombra discreta durante o arraste;
- espaço de destino fica evidente;
- os demais cartões se reorganizam suavemente;
- pequena animação de encaixe ao soltar;
- área de toque confortável no celular;
- não depender exclusivamente daquele pequeno ícone de "pontinhos" para conseguir arrastar.

O cartão inteiro deve poder ser usado para movimentação, desde que isso não conflite com alguma
interação já existente.

## 8. RANDOMIZAÇÃO INICIAL MAIS INTELIGENTE

Verifique como as cenas são embaralhadas atualmente. Quero evitar:

- história aparecer já correta por acaso;
- duas execuções consecutivas começarem praticamente iguais;
- níveis iniciais serem resolvidos por uma troca óbvia de apenas duas cenas repetidamente.

A randomização deve produzir uma ordem realmente desorganizada, mas sem alterar a resposta correta.
Não quero randomização artificialmente impossível ou frustrante. Apenas garantir variedade.

## 9. FEEDBACK APÓS "CONFIRMAR ORDEM"

Quero manter o princípio:

- verde + ✓ = cena exatamente na posição correta
- laranja = cena ainda em posição incorreta

Mas valide tecnicamente se é isso que está acontecendo hoje.

Quando houver erro:

- não revelar imediatamente a sequência correta;
- indicar apenas quais posições estão corretas e quais ainda precisam ser revistas;
- permitir nova tentativa.

Quero que o paciente ainda precise raciocinar. Não transformar a correção em resposta automática.

## 10. ACERTOS NA PRIMEIRA TENTATIVA PRECISAM TER MAIS PESO

Para progressão e registro clínico, diferencie:

- resolução correta na primeira tentativa;
- resolução após feedback parcial;
- número de reorganizações;
- número de confirmações;
- tempo total.

O tempo pode ser registrado como métrica, mas não deve ser usado para pressionar o paciente
visualmente. Este exercício não deve virar uma prova de velocidade.

**Prioridade: precisão e planejamento.**

## 11. TENTATIVA SEGUINTE APÓS FEEDBACK

Analise qual abordagem é melhor com a arquitetura atual:

**Opção preferida:** quando o paciente confirma e existem posições corretas, manter essas posições
claramente verdes enquanto ele reorganiza as demais.

Não mostrar números corretos novos nem entregar a solução. A primeira tentativa continua registrada
separadamente para fins de desempenho.

Se tecnicamente fizer sentido bloquear temporariamente os cartões já corretos durante a correção,
**me informe antes de implementar**, porque isso altera a demanda da segunda tentativa.

**Não decidir silenciosamente.**

## 12. EVITAR TENTATIVA E ERRO INFINITA

Quero permitir correção, mas não quero que o paciente simplesmente fique clicando em "Confirmar"
repetidamente até descobrir a resposta por eliminação.

Verifique a melhor forma de evitar isso sem punir o paciente. A primeira resposta deve ser a principal
medida de desempenho. Tentativas posteriores servem como treino/correção.

**Não adicionar limite rígido de tentativas sem antes me informar.**

## 13. CONCLUSÃO DE UMA HISTÓRIA

Quando a sequência estiver 100% correta, usar uma conclusão visual curta e elegante:

- todas as bordas passam para verde;
- ✓ discreto;
- pequena transição;
- mensagem curta, por exemplo `Sequência correta`.

Não quero: confete excessivo; animações infantis; efeitos exagerados; telas demoradas entre histórias.

Após um intervalo curto, avançar naturalmente para a próxima.

## 14. VARIAR O TIPO DE RACIOCÍNIO ENTRE HISTÓRIAS

Ao classificar o banco atual, tente alternar histórias de naturezas diferentes. Exemplos de tipos
cognitivos:

- **procedural** — uma atividade que exige etapas específicas;
- **temporal** — acontecimentos que simplesmente precisam respeitar antes/depois;
- **causal** — um evento provoca ou possibilita o seguinte;
- **objetivo/desfecho** — várias ações precisam ocorrer para chegar a um resultado.

Isso ajuda a evitar que o paciente aprenda apenas um padrão superficial do exercício. Não precisa
apresentar esses nomes na tela. São categorias internas.

## 15. PROGRESSÃO ADAPTATIVA

Antes de criar qualquer nova regra, procure o sistema global de progressão dos demais exercícios.
Quero reutilizar a infraestrutura do projeto. **Não criar um sistema isolado apenas para "Ordem da
História".**

A lógica conceitual deve considerar desempenho recente. Por exemplo: bom desempenho consistente →
avançar; desempenho intermediário → permanecer na faixa; dificuldade recorrente → oferecer tarefas
ligeiramente menos exigentes.

Mas não implemente thresholds arbitrários se o projeto já possui uma regra global. Primeiro descubra e
reaproveite o padrão existente.

## 16. NÃO REPETIR HISTÓRIAS DESNECESSARIAMENTE

Se houver histórias suficientes dentro da mesma faixa de dificuldade, variar o conteúdo antes de
repetir uma história recém-realizada.

Repetição pode existir quando clinicamente útil ou quando necessária pelo banco disponível, mas não
quero uma sequência perceptivelmente repetitiva. Verifique se o projeto já registra histórias
recentemente utilizadas.

## 17. LAYOUT

O conteúdo principal deve continuar centralizado. A hierarquia visual deve ser:

instrução curta → cartões → Confirmar Ordem

O botão não precisa ficar perdido no extremo inferior da tela se houver muito espaço vazio. Quero que
o conjunto pareça uma unidade. Em telas grandes, aproximar visualmente o botão dos cartões sem deixar
a interface apertada. No celular, adaptar naturalmente.

## 18. BOTÃO "CONFIRMAR ORDEM"

Ele deve ficar ativo quando houver uma organização válida das cenas. Melhorar estados visuais:
padrão; hover desktop; pressionado; desabilitado; processamento; feedback.

Evitar mudança brusca ou ambígua de cor.

## 19. INSTRUÇÃO DURANTE O EXERCÍCIO

Não precisa explicar toda a regra em cada história. Algo curto é suficiente: *"Arraste as cenas para a
ordem em que a história aconteceu."* ou equivalente. Evitar textos grandes durante a tarefa.

## 20. TUTORIAL

O tutorial completo deve ser útil na primeira utilização, mas não quero uma tela extensa interrompendo
todas as sessões. Verifique como o projeto controla tutorial visto/não visto.

Idealmente: primeira utilização → tutorial; utilizações seguintes → entrar diretamente no exercício.
