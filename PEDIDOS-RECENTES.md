# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 08/09/2026 20:08
<task-notification>
<task-id>bmwt6vdgg</task-id>
<tool-use-id>toolu_01SD4WZ1TXmPPkNbfT3G8cAN</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/af26ae96-821d-4dce-abd1-d20a017fa7f8/tasks/bmwt6vdgg.output</output-file>
<status>completed</status>
<summary>Background command "Disparar Codex na fatia A" completed (exit code 0)</summary>
</task-notification>
