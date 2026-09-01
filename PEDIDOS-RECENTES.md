# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 31/08/2026 22:57
Perfeito. Concordo com os três pontos técnicos.

1. **Mínimo teórico:** vamos abandonar a fórmula fixa como fonte do sistema e calcular o menor caminho por busca em largura (BFS) entre a configuração inicial e a configuração-alvo. Pode usar isso inclusive para a Torre clássica, assim temos uma única lógica para todos os tipos de problema. O mínimo calculado pela BFS será o valor usado para eficiência e validação das configurações.

2. **Reinícios:** retire o limite rígido de 2 reinícios. O reinício passa a ser comportamento registrado, não uma trava. Quero saber quantas vezes o paciente reiniciou e em que momento, porque isso entra na análise do desempenho. Não deve aparecer “você só pode reiniciar X vezes” nem impedir um novo reinício.
   Importante: isso é diferente da segunda tentativa após CONCLUIR o problema. Depois que concluiu e recebeu o feedback do mínimo, continua valendo no máximo **uma nova tentativa opcional daquele mesmo problema**, para evitar repetição até decorar a solução.

3. **Contador de movimentos:** SIM, retirar da tela durante a execução. O paciente não vê movimentos realizados, mínimo, eficiência nem cronômetro enquanto resolve. Tudo continua sendo contado internamente. Após concluir, aí sim mostramos quantos movimentos ele utilizou e o menor caminho possível.

4. **Discos:** SIM. Teto rotineiro em **5 discos**.
   **6 discos somente nas fases avançadas**, quando fizer sentido pela progressão. Não quero 7 ou 8 discos. Quero aumentar a dificuldade principalmente pela estrutura e novidade dos problemas, e não transformar o exercício em uma sequência enorme de movimentos.

5. **Desfazer:** confirmado, NÃO construir botão de desfazer. Se o paciente quiser corrigir a estratégia, deve fazer isso pelos próprios movimentos da Torre. Quero apenas registrar internamente reversões/correções de caminho quando forem identificáveis.

6. **Abandono/Supabase:** concordo em separar essa etapa. Não faça alteração estrutural no banco junto com as demais. Antes da mudança necessária para registrar abandono/tentativas incompletas, faça o backup pelo procedimento já utilizado no projeto e só então mexa no Supabase.

7. **Regra da v3.0.0:** revogar especificamente a regra de que “reinício custa o mínimo” ou de que é obrigatório atingir o mínimo para sucesso/progressão. O botão Reiniciar, o registro e os testes feitos continuam. O que cai é apenas essa penalização/regra rígida.

Então pode seguir pela Prioridade 1 com essas decisões fechadas.

E quero preservar um princípio em todas as próximas alterações:

**o paciente precisa resolver o problema, e não jogar contra o placar.**

O sistema registra tudo nos bastidores; a interface durante a execução deve deixar o raciocínio o mais limpo possível.

## 31/08/2026 23:49
pode seguir preciso que vc termine para eu corrigir outro

## 31/08/2026 23:50
nao, eu quero que vc TERMINE o TORRE para eu seguir
