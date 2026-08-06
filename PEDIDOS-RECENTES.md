# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 22:45
Ótimo.
Antes da validação visual, quero congelar quatro decisões da T1:
1.
Não criar automaticamente pacientes técnicos nas próximas conversões.
Sempre utilizar um paciente de teste já existente, salvo autorização explícita.
2.
Remover qualquer emoji do framework do tutorial.
Utilizar apenas texto ou ícones discretos da própria interface.
3.
A preparação deve permanecer extremamente objetiva.
Ela explica apenas:
o que acontecerá;
como responder;
como iniciar.
Estratégias cognitivas, dicas de memorização ou orientações terapêuticas não pertencem à preparação.
4.
A tentativa guiada não deve ser definida por um número fixo.
Ela deve utilizar a menor unidade válida da mecânica clínica de cada exercício.
No Span Direto isso corresponde hoje a 2 dígitos, mas o framework deve permanecer genérico.
Depois dessas quatro correções, faço a validação visual do Span Numérico Auditivo Direto.

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
