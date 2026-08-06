# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 23:07
Pare a validação do tutorial.

O paciente técnico COGZD3DRU existe e aparece no painel, mas o login retorna:

“ID de paciente ou PIN incorretos.”

Investigue exclusivamente a credencial desse paciente de teste.

Quero evidência objetiva:

1. Confirmar que o código COGZD3DRU existe no banco de produção.
2. Confirmar qual campo é usado no login:
   - patientCode;
   - userId;
   - outro identificador.
3. Comparar o fluxo de criação manual de paciente com o script paciente-teste-t1.mjs.
4. Verificar se o PIN exibido no painel corresponde ao hash salvo no banco.
5. Testar o bcrypt.compare com:
   - PIN exibido;
   - hash armazenado.
6. Confirmar se o script gravou pin e pinPlain nos campos corretos.
7. Verificar se há normalização de código ou PIN no endpoint de login.
8. Identificar o primeiro ponto exato em que a autenticação falha.

Não crie outro paciente.
Não altere tutorial.
Não publique correção por hipótese.

Se o problema estiver apenas no PIN do paciente técnico, proponha a correção mínima:
- gerar novo PIN pelo fluxo oficial da aplicação;
- manter o mesmo paciente e o mesmo código;
- não alterar nenhum dado clínico.

Pare após apresentar a causa raiz.

## 05/08/2026 23:11
A causa raiz ficou comprovada.
Não quero criar outro paciente e não quero usar a estratégia de limpar o patientCode.
Faça a correção mínima:
corrija o script paciente-teste-t1.mjs para reutilizar o gerador oficial de patientCode;
atualize apenas o patientCode do paciente técnico já existente para um código válido no formato oficial da aplicação;
mantenha o mesmo id, o mesmo PIN e todos os demais dados exatamente como estão;
não altere nenhum dado clínico;
depois execute um teste completo de login usando esse mesmo paciente e comprove que a autenticação passou;
somente depois voltamos à validação do tutorial do Span Direto.
Não crie um novo paciente. Não altere a T1. Não publique nenhuma outra mudança além dessa correção.

## 05/08/2026 23:17
A validação visual revelou um defeito importante na demonstração do Span Direto.

Hoje a demonstração apenas reproduz os números por áudio e logo avança. Isso demonstra o estímulo, mas não demonstra como o paciente deve responder.

A demonstração precisa reproduzir a tarefa inteira, como no Cogmed:

Exemplo:

1. o sistema fala 2;
2. o sistema fala 3;
3. o teclado fica disponível;
4. uma seta/cursor visual se desloca até o número 2 e simula o clique;
5. depois se desloca até o número 3 e simula o clique;
6. somente após os dois cliques a demonstração termina;
7. aparece “Agora é sua vez”;
8. inicia a tentativa guiada com uma nova sequência.

Regras:

- usar o mesmo teclado do exercício real;
- a seta deve ser discreta, clara e animada;
- o número clicado deve receber exatamente o mesmo feedback visual do treino real;
- não exibir a sequência escrita durante a escuta;
- os números só ficam visíveis porque fazem parte do teclado real;
- a demonstração deve executar a resposta automaticamente;
- a tentativa guiada continua sendo respondida pelo paciente;
- não criar Session;
- não alterar nenhuma métrica clínica;
- não converter o Span Inverso;
- não alterar a progressão clínica.

Antes de publicar, apresente o fluxo visual implementado e pare para nova validação.
