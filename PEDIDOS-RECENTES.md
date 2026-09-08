# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 03/09/2026 16:47
A interface está aprovada como direção. NÃO quero reconstruí-la.



Porém identifiquei um problema cognitivo importante no banco/problema mostrado.



O desafio “Encontros na biblioteca” está sendo resolvido como quatro mini-problemas independentes:



 pistas 1–2 resolvem Visitante; 

 3–4 resolvem Sala; 

 5–6 resolvem Tema; 

 7–8 resolvem Horário. 



Isso NÃO atende à arquitetura cognitiva definida.



Quero que os problemas reais exijam cruzamento entre categorias.



Por exemplo:



 Visitante ↔ Tema; 

 Visitante ↔ Sala; 

 Visitante ↔ Horário; 

 Sala ↔ Tema; 

 Sala ↔ Horário; 

 Tema ↔ Horário. 



A maioria das conclusões não deve ser obtida resolvendo cada linha separadamente.



Exemplos de pistas adequadas:



“Lia participou do encontro sobre Ciência.”



“A pessoa da Sala Acervo chegou imediatamente antes de Mauro.”



“O encontro das 15h aconteceu na Sala Mídia.”



“Nina não participou de História nem esteve na Sala Pesquisa.”



“Caio chegou depois da pessoa que esteve na Sala Leitura.”



“A pessoa que participou de Arte chegou exatamente antes do visitante que esteve na Sala Acervo.”



IMPORTANTE:



solução única é necessária, mas NÃO é critério suficiente para considerar um puzzle bom.



Quero acrescentar validação estrutural do problema.



O banco deve rejeitar puzzles em que as categorias possam ser resolvidas praticamente de forma independente.



Modele as categorias como um grafo:



 cada categoria = nó; 

 cada pista cruzada = conexão entre categorias. 



O conjunto de pistas de um problema real deve formar uma rede conectada.



Além disso, quero medir:



 quantidade de pistas intrategoria; 

 quantidade de pistas cross-category; 

 profundidade inferencial; 

 número de categorias envolvidas nas conclusões; 

 redundância; 

 conectividade do puzzle. 



Não quero transformar isso em números clínicos; são propriedades do problema.



Para o tutorial 3×3, a simplicidade atual pode permanecer.



Para o treino real, não.



Antes de produzir novos problemas, revise o banco atual e me diga quantos puzzles apresentam esse defeito de “categorias independentes”.



Não mexa na interface por causa disso. O problema agora é o desenho lógico dos puzzles. 



 ALTERAÇÃO NO “VERIFICAR RACIOCÍNIO”



Não quero mais o botão “Verificar raciocínio” com uso ilimitado.



O objetivo do exercício inclui monitoramento do próprio erro. Se o paciente puder conferir a grade a cada ação, ele pode começar a terceirizar esse monitoramento para o sistema.



Portanto, transformar a verificação em um recurso LIMITADO.



Regra inicial:



Tutorial:

verificação livre, pois o objetivo é aprender a mecânica.



Níveis iniciais:

máximo de 3 verificações por problema.



Níveis intermediários:

máximo de 2 verificações.



Níveis avançados:

máximo de 1 ou nenhuma verificação, de acordo com a progressão.



Esses valores devem ficar em constantes/configuração, não hardcoded espalhado pela interface, porque poderão ser recalibrados depois.



A interface pode mostrar discretamente:



Verificar raciocínio · 3



depois:



Verificar raciocínio · 2



etc.



Ou:



Verificar raciocínio (2 restantes)



Sem usar linguagem de punição.



Quando as verificações acabarem:



o botão fica indisponível/discreto.



NÃO mostrar:



“Você perdeu suas chances.”



O feedback da verificação continua mínimo.



Se houver incompatibilidade:



“Existe uma incompatibilidade na sua organização. Revise suas escolhas.”



Se NÃO houver incompatibilidade:



“Até aqui, sua organização é compatível com as pistas.”



Nunca informar:



 qual célula está errada; 

 qual pista foi violada; 

 qual categoria contém o problema; 

 qual resposta deveria ser colocada. 



Registrar cada solicitação de verificação, incluindo:



 puzzle; 

 número da ação; 

 tempo; 

 número da verificação usada; 

 quantas verificações restavam; 

 se o estado estava consistente ou inconsistente; 

 quantidade de contradições presentes naquele momento; 

 se houve correção posteriormente; 

 quantas ações até a correção; 

 tempo até a correção. 



Importante:



solicitar verificação quando o estado já estava correto também deve ser registrado como comportamento de processo, mas NÃO interpretado automaticamente como insegurança, ansiedade ou qualquer déficit.



A progressão futura poderá considerar uso de verificação como UM dos indicadores de autonomia de resolução, nunca isoladamente.



O princípio é:



quanto maior o domínio do exercício, menos suporte externo para detectar inconsistências.



Existe um botão ‘Verificar raciocínio’ para quando ele quiser conferir.”



trocaria 



“Existe um recurso limitado de ‘Verificar raciocínio’. Nos níveis iniciais o paciente possui até três verificações por problema, e essa ajuda é progressivamente reduzida conforme a dificuldade aumenta. A verificação informa apenas se a organização atual contém incompatibilidades, sem indicar onde elas estão.”

## 03/09/2026 17:02
<task-notification>
<task-id>b0uq491u0</task-id>
<tool-use-id>toolu_01LJKHNKouGPFMpcSw7PXWzz</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/af26ae96-821d-4dce-abd1-d20a017fa7f8/tasks/b0uq491u0.output</output-file>
<status>completed</status>
<summary>Background command "Disparar Codex na validação estrutural" completed (exit code 0)</summary>
</task-notification>

## 08/09/2026 18:47
Aprovo a proposta com os seguintes fechamentos antes da autoria dos problemas.
1. Pistas compostas
Quero suportar uma pista visual contendo múltiplas restrições atômicas.
Não criar um operador específico apenas para frases como:
“Nina não participou de História nem esteve na Sala Pesquisa.”
Generalizar clue para algo conceitualmente semelhante a:
{
  id,
  text,
  constraints: Constraint[]
}
Para o paciente continua sendo UMA pista.
Para o solver podem existir duas ou mais restrições.
No registro de processo quero preservar:
clueId;
constraintId;
qual restrição atômica foi violada.
Assim preservamos linguagem natural sem perder precisão lógica.
2. Horário como eixo
Aprovo.
Se o horário é uma sequência estrutural conhecida, como:
14h | 15h | 16h | 17h
ele deve ser usado como rótulo das colunas, e NÃO como categoria a ser descoberta.
A engine continua trabalhando internamente com posições 0..N-1.
Cada puzzle pode definir:
positionLabels.
Exemplos:
14h / 15h / 16h / 17h;
Mesa 1 / Mesa 2 / Mesa 3 / Mesa 4;
1º / 2º / 3º / 4º;
Posição 1 / Posição 2 / etc.
Isso libera a linha para um atributo cognitivamente real.
3. Régua estrutural
Concordo que devemos implementá-la ANTES de escrever os novos problemas.
Mas acrescento uma correção:
grafo conectado + grau mínimo ≥ 2 ainda não garante que não exista uma aresta crítica dividindo o problema em dois blocos.
Portanto quero também:
bridgeCount === 0
ou validação equivalente de que o grafo cross-category não possui pontes.
Critérios obrigatórios para problemas reais:
solução única;
grafo de categorias conectado;
grau mínimo de cada categoria ≥ 2;
nenhuma ponte no grafo;
predominância de restrições cross-category sobre intrategoria;
nenhuma categoria isomorfa/redundante ao eixo de posições;
nenhuma categoria resolvível de forma independente;
profundidade inferencial calculada;
redundância medida;
cobertura real de todas as categorias.
Com pistas compostas, calcular cross e intra pelas restrições atômicas, não apenas pelas frases visuais.
4. Escada
Aprovo como BANCO INICIAL:
tutorial 3×3: 1;
4×3: 4;
4×4: 4;
5×4: 4;
5×5: 4.
Total: 16 problemas reais + tutorial.
Mas registrar explicitamente que este é um seed bank para validação, não o banco definitivo da adaptação.
O motor adaptativo final exigirá posteriormente mais variedade por nível/operação para focalização e transferência sem repetição excessiva.
Não obrigar todos os puzzles avançados a usar simultaneamente todos os operadores complexos.
5. Puzzles atuais
Confirmado: REFAZER os três problemas reais atuais.
Não quero apenas adicionar pistas cross-category aos existentes.
O defeito é estrutural.
Pode preservar tema/nomenclatura quando útil, mas reconstruir as restrições do zero e submetê-las à nova régua.
O tutorial pode permanecer simples.
6. Ordem de trabalho
Agora:
implementar a régua;
criar testes adversariais para ela;
provar que Biblioteca/Museu atuais reprovam;
provar que puzzles estruturalmente bons passam;
somente depois iniciar autoria dos 16 novos problemas.
Não mexer na interface nesta etapa.
