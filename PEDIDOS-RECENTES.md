# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 16:51
Mande este comando:

```text
APROVAÇÃO DO PRIMEIRO PASSO TÉCNICO — DURAÇÃO CONTÍNUA DA SESSÃO

A análise foi validada.

Vamos implementar apenas o primeiro passo técnico isolado: eliminar o arredondamento interno da duração da sessão para 20/30/40 e fazer o motor respeitar exatamente o valor escolhido pelo terapeuta.

Não implementar ainda:

- novos presets 20/35/50;
- nova nomenclatura de sessão;
- redistribuição automática de protocolos;
- alteração dos protocolos dos exercícios;
- recalibração de carga, fadiga ou planejamento;
- mudança visual ampla;
- migração de planos;
- IA prescritor;
- qualquer decisão automática sobre a dose dos exercícios.

==================================================
1. PRINCÍPIO
==================================================

A duração escolhida pelo terapeuta deve ser tratada como valor real da sessão.

Exemplos:

- 26 minutos devem ser tratados como 26;
- 35 minutos devem ser tratados como 35;
- 37 minutos devem ser tratados como 37;
- 45 minutos devem ser tratados como 45;
- 50 minutos devem ser tratados como 50.

Não arredondar para 20, 30 ou 40.

Remover a dependência de `nearestTarget` para a interpretação da duração.

==================================================
2. DURAÇÃO PERSONALIZADA
==================================================

A duração da sessão continua sendo livre dentro dos limites atuais da interface.

Preservar:

- mínimo atual;
- máximo atual;
- planos de 20 minutos;
- planos de 30 minutos;
- planos de 40 minutos;
- qualquer outro valor válido já salvo.

Nenhuma duração deve ser classificada como legada apenas por não ser 20, 30 ou 40.

Não converter valores existentes.

Não alterar o formato persistido.

==================================================
3. FAIXA ESPERADA
==================================================

Criar uma função contínua para derivar a faixa esperada a partir da duração escolhida.

Antes de implementar, apresente a fórmula exata proposta e prove que ela preserva os pontos já aprovados:

- 20 min → 18–22;
- 30 min → 27–33;
- 40 min → 36–44.

A função também deve produzir faixas coerentes para:

- 25;
- 26;
- 35;
- 37;
- 45;
- 50 minutos.

Não usar arredondamento para um alvo vizinho.

A fórmula deve ser simples, determinística e transparente.

Se a solução mais coerente for uma margem percentual de ±10%, documentar explicitamente e mostrar os valores resultantes.

Não inventar regras complexas.

==================================================
4. ESTADOS DE DURAÇÃO
==================================================

Preservar os quatro estados atuais:

- ABAIXO;
- DENTRO;
- ACIMA;
- EXCESSO_IMPORTANTE.

Recalcular os estados usando a duração real escolhida e a faixa derivada para aquele valor.

Não alterar ainda a filosofia dos estados.

Não alterar mensagens visíveis nesta etapa, salvo o necessário para remover referência incorreta a 20/30/40.

==================================================
5. EXCESSO IMPORTANTE
==================================================

Antes de alterar o limite de excesso importante, verificar como ele é calculado atualmente.

A implementação deve preservar o comportamento aprovado nos pontos de 20, 30 e 40 minutos.

Não criar um novo percentual sem documentar.

Apresentar a fórmula final utilizada para:

- limite inferior;
- limite superior da faixa esperada;
- teto seguro;
- excesso importante.

Mostrar exemplos para 20, 25, 30, 35, 40, 45 e 50 minutos.

==================================================
6. CARGA, FADIGA E PLANEJAMENTO
==================================================

Não interpolar automaticamente:

- referência de carga;
- limite de fadiga alta;
- limite de janelas de planejamento.

Essas referências continuam sendo heurísticas clínicas discretas.

Nesta etapa, escolher a estratégia técnica mais conservadora para sessões fora de 20/30/40:

- manter uma referência existente de forma explicitamente provisória; ou
- não emitir esses alertas quando não houver referência clínica aprovada.

Não arredondar silenciosamente a duração para obter essas referências.

Antes de implementar essa parte, documentar qual estratégia será usada e por quê.

Minha preferência é:

- não inventar referência;
- não exibir falsa precisão;
- registrar “referência clínica ainda não definida para esta duração”, se necessário;
- manter o cálculo bruto de carga, fadiga e planejamento disponível.

==================================================
7. COMPATIBILIDADE
==================================================

Garantir que:

- planos antigos abrem normalmente;
- 20/30/40 preservam exatamente o comportamento de duração já aprovado;
- outras durações deixam de ser reinterpretadas como alvo vizinho;
- nenhuma dose de exercício muda;
- nenhum protocolo muda;
- nenhum nível muda;
- nenhum progresso muda;
- nenhuma frequência muda;
- nenhuma modalidade muda;
- nenhuma ordem muda.

==================================================
8. TESTES OBRIGATÓRIOS
==================================================

Criar ou atualizar testes para provar:

1. 26 não é tratado como 30.
2. 35 não é tratado como 30 ou 40.
3. 37 não é tratado como 40.
4. 45 não é tratado como 40.
5. 20 preserva 18–22.
6. 30 preserva 27–33.
7. 40 preserva 36–44.
8. As fronteiras exatas de ABAIXO/DENTRO/ACIMA/EXCESSO_IMPORTANTE funcionam para 25, 35 e 50.
9. Planos antigos continuam abrindo.
10. Nenhum protocolo de exercício é alterado.
11. Nenhuma dose legada é alterada.
12. Nenhum nível ou progresso é alterado.
13. O núcleo continua retornando todos os alertas aplicáveis.
14. Nenhum alerta bloqueia salvamento.
15. TypeScript sem erros.
16. Suíte completa passando.
17. Build passando.

==================================================
9. ESCOPO
==================================================

Pode alterar apenas:

- tipos e funções de duração;
- interpretação da duração da sessão;
- testes correspondentes;
- documentação técnica desta mudança.

Não alterar:

- interface visual;
- banco;
- migrations;
- APIs, salvo necessidade técnica comprovada e explicada antes;
- protocolos;
- doses;
- exercícios;
- carga basal;
- fadiga;
- interferência;
- planejamento;
- progressão;
- experiência do paciente.

==================================================
10. ENTREGA
==================================================

Antes de implementar, apresentar:

1. fórmula proposta;
2. exemplos para 20, 25, 26, 30, 35, 37, 40, 45 e 50;
3. estratégia para carga/fadiga/planejamento fora de 20/30/40;
4. arquivos que serão alterados.

Depois implementar em um lote isolado.

Ao final apresentar:

- arquivos alterados;
- diff resumido;
- testes;
- build;
- provas das fronteiras;
- prova de que 26, 35, 37 e 45 não foram arredondados;
- prova de que 20/30/40 preservaram o comportamento aprovado;
- limitações restantes.

Não publicar automaticamente.

Pare para validação.
```

## 04/08/2026 16:51
Perfeito. Pode concluir esse lote normalmente.

Quando terminar:

- rode TypeScript;
- rode a suíte completa;
- rode o build;
- confirme que 26, 35, 37 e 45 não foram arredondados;
- confirme que 20, 30 e 40 preservaram o comportamento anterior;
- confirme que nenhuma interface, protocolo, nível, progresso ou plano foi alterado;
- não publique ainda;
- pare para minha validação.

## 04/08/2026 17:17
<task-notification>
<task-id>bndeg951y</task-id>
<tool-use-id>toolu_016K7hjmX2yjMEGDoGEmQiaM</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bndeg951y.output</output-file>
<status>completed</status>
<summary>Background command "Vigiar o progresso do Codex" completed (exit code 0)</summary>
</task-notification>
