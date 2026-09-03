# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 03/09/2026 16:06
<task-notification>
<task-id>by6f38701</task-id>
<tool-use-id>toolu_013vJLK1xGqrBxcq1UUmsgdJ</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/af26ae96-821d-4dce-abd1-d20a017fa7f8/tasks/by6f38701.output</output-file>
<status>completed</status>
<summary>Background command "Disparar Codex na Fase 3 da Grade Dedutiva" completed (exit code 0)</summary>
</task-notification>

## 03/09/2026 16:42
Fase 3 tecnicamente aprovada, mas NÃO quero avançar ainda para instrumentação/adaptação definitiva.
Primeiro precisamos validar a experiência real da interface.
1. Não altere mais a mecânica agora.
Quero abrir e testar a Grade em desktop e mobile antes de fechar o UX.
2. Mantenha a fórmula atual de accuracy explicitamente PROVISÓRIA.
Não quero transformá-la em métrica definitiva. Na Fase 6 vamos reconstruir a decisão adaptativa usando múltiplos indicadores de processo, e não apenas tentativas de conclusão incorreta.
3. Preserve a separação que você corrigiu entre:
atribuição realizada quando a relação ainda não estava determinada;
atribuição realizada quando o estado já estava contraditório.
Não voltar a misturar os dois.
4. Dosagem: um único problema por sessão NÃO é o desenho final.
A Grade precisa caber no framework temporal da plataforma e permitir uma sequência de problemas dentro da sessão, porque futuramente precisamos conseguir fazer:
problema misto → focalizado → transferência
quando houver tempo.
Antes de alterar, audite como os demais exercícios encerram por tempo/progresso e proponha como integrar a Grade ao mesmo framework.
5. Tutorial: não quero o 3×3 obrigatório em toda sessão.
Ele deve funcionar como aquisição da mecânica, preferencialmente na primeira utilização. Depois disso, o paciente deve entrar diretamente no treino real.
Audite como a plataforma registra tutorial já realizado e proponha a integração antes de mudar.
6. Solver: não otimizar ainda por suposição.
Faça benchmark da interação no maior tamanho planejado, especialmente 5 posições × 6 categorias, porque hoje há duas buscas por clique.
Quero tempos reais antes de decidir se precisa cache, incremental solving ou outra otimização.
7. Próximo passo imediato:
não mexer em Fase 4 ainda.
Primeiro eu vou abrir a Grade e avaliar:
legibilidade;
tamanho da grade;
funcionamento dos selects;
pistas;
pistas riscadas;
duplicidade em âmbar;
Verificar raciocínio;
Concluir;
desktop;
mobile.
Depois da revisão visual, fechamos a interface e seguimos. e abre ela aqui pra eu ver

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
