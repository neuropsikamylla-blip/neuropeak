# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 09:45
Vamos realizar uma etapa de refinamento clínico e de UX na área de prescrição do terapeuta.

A versão atual da dose por protocolo está aprovada e deve permanecer funcional.

Esta etapa possui três objetivos:

1. retirar o ajuste rotineiro de nível da prescrição;
2. melhorar o espaçamento e a hierarquia visual da janela “Ajustar”;
3. corrigir a filosofia e a apresentação dos alertas clínicos.

Não iniciar tutoriais, modo autoguiado ou qualquer outra fase.

==================================================
PRINCÍPIOS GERAIS
==================================================

O NeuroPeak é uma plataforma de TREINO COGNITIVO.

Não é instrumento de avaliação psicológica.

Não utilizar princípios de contaminação de teste como se fossem regras universais de treino.

Em treino cognitivo:

- dois exercícios podem trabalhar o mesmo domínio intencionalmente;
- uma sessão pode ser ampla ou focal;
- concentração em memória operacional, atenção, planejamento ou outra função pode ser uma decisão clínica legítima;
- sobreposição cognitiva não significa automaticamente combinação ruim;
- o sistema deve informar o terapeuta, não corrigir ou reprovar sua escolha.

Todos os alertas continuam consultivos.

Nunca bloquear salvamento.

==================================================
PARTE 1 — CONFIGURAÇÕES DE NÍVEL
==================================================

Hoje o botão “Ajustar” apresenta:

CONFIGURAÇÕES DE NÍVEL

Configuração de nível — revisão futura

Nível inicial
3 / 10

Essa configuração não deve permanecer como parte rotineira da prescrição.

O nível pertence ao sistema adaptativo e ao histórico de desempenho do paciente, não à dose prescrita pelo terapeuta.

Para o fluxo habitual:

- o paciente inicia no nível inicial definido pela mecânica;
- o exercício progride automaticamente conforme o desempenho;
- o paciente retoma do ponto alcançado;
- o terapeuta acompanha a evolução;
- o terapeuta não precisa escolher um nível toda vez que prescreve ou edita o plano.

Portanto:

1. Remover da janela “Ajustar”:
   - seção “Configurações de nível”;
   - slider de nível inicial;
   - texto “revisão futura”.

2. Não apagar, migrar ou alterar:
   - nível já salvo;
   - progresso existente;
   - histórico;
   - regra adaptativa;
   - startLevel legado;
   - nível atual do paciente.

3. Apenas deixar de expor esse controle no fluxo rotineiro de prescrição.

4. Novos planos não devem redefinir o nível ao serem salvos.

5. Planos antigos com `level` ou `startLevel` devem manter esses campos intactos.

6. Não implementar ainda uma nova tela de redefinição.

Registrar como futura funcionalidade separada:

REDEFINIR NÍVEL

Essa ação futura deverá:

- ficar na área de evolução/histórico do paciente, não no botão “Ajustar”;
- ser utilizada apenas em casos específicos;
- mostrar o nível atual e o novo;
- exigir confirmação;
- preservar o histórico;
- nunca rebaixar ou reiniciar silenciosamente.

Nesta etapa, apenas remover o controle da prescrição e proteger os dados existentes.

==================================================
PARTE 2 — JANELA “AJUSTAR”
==================================================

A estrutura conceitual está aprovada:

1. Dose do treino
2. Modalidade e variantes
3. Assistência
4. Preferências de execução

A seção de nível será removida.

O painel está visualmente comprimido. Refinar sem redesenhar completamente.

Objetivos:

- aumentar o respiro vertical;
- melhorar a leitura;
- manter o painel clínico e discreto;
- evitar textos colados;
- não aumentar excessivamente a altura total.

Nos cartões Breve, Padrão e Estendido:

- manter nome;
- manter unidade real;
- manter estimativa;
- manter descrição;
- manter destaque do selecionado.

Ajustar os espaçamentos aproximadamente assim:

- mais espaço entre nome e quantidade;
- mais espaço entre quantidade e descrição;
- mais espaço antes das observações de exposição;
- mais espaço antes do aviso do Breve;
- padding interno um pouco maior;
- separação mais clara entre os três protocolos.

Não alterar:

- valores de unidades;
- durações;
- protocolos;
- seleção padrão;
- cálculo da sessão;
- dose legada.

Aviso do Breve:

Manter o conteúdo clínico aprovado, mas reduzir o peso visual.

Texto:

“Treino válido em dose reduzida. O desempenho desta sessão pode não ser suficiente, isoladamente, para atualizar o nível adaptativo.”

Apresentar como informação clínica discreta, não como alerta de erro:

- fundo neutro ou azul/cinza discreto;
- menor contraste que um alerta;
- opcionalmente ícone informativo;
- não usar aparência de advertência grave.

Manter as unidades reais do catálogo:

- séries;
- rodadas;
- tentativas;
- desafios completos;
- demais unidades específicas.

Não usar “blocos” genericamente.

Modalidade:

Manter:

- Visual;
- Visual e áudio;
- Somente áudio.

Manter o recálculo de duração quando houver multiplicador definido.

Assistência:

Para repetição de áudio, substituir o texto atual por algo mais claro:

“Repetir o áudio reapresenta o conteúdo auditivo. Não altera a dose prescrita nem a estimativa atual.”

Não chamar automaticamente de acessibilidade quando o áudio repetido for o próprio conteúdo que deveria ser memorizado.

==================================================
PARTE 3 — ANÁLISE E ALERTAS DO PLANO
==================================================

O problema atual é conceitual:

`DECLARED_BAD_COMBINATION` está tratando sobreposição de processos como combinação desfavorável.

Isso é inadequado para treino cognitivo.

A seção atual “REVISÃO RECOMENDADA” mistura:

- problemas objetivos da sessão;
- fadiga;
- duração;
- carga;
- semelhança de exercícios;
- concentração intencional de um domínio;
- posição preferencial;
- simples informações.

Reorganizar em três níveis visuais:

1. REVISÃO DO PLANO
2. OBSERVAÇÕES CLÍNICAS
3. INFORMAÇÕES

Não usar “Revisão recomendada” como bloco único para tudo.

==================================================
3.1 — REVISÃO DO PLANO
==================================================

Manter nesta categoria apenas condições objetivas que realmente justificam revisar a composição:

- duração acima da faixa;
- excesso importante;
- carga basal acima da referência heurística;
- quantidade elevada de atividades de fadiga alta;
- fadiga alta consecutiva;
- interferência alta consecutiva;
- excesso de janelas de planejamento;
- janelas de planejamento consecutivas;
- outras incompatibilidades objetivas já aprovadas na arquitetura.

Essas mensagens devem continuar consultivas.

Exemplos de linguagem:

“Carga elevada para a duração escolhida.”

“Duração estimada acima da sessão prescrita.”

“Há atividades de fadiga alta em sequência.”

Nunca:

- “plano inválido”;
- “combinação errada”;
- “não pode”;
- bloqueio de salvar.

==================================================
3.2 — OBSERVAÇÕES CLÍNICAS
==================================================

Semelhança de processo, modalidade ou estratégia deve ir para esta categoria, quando realmente for útil.

Não classificar como erro.

Não usar:

- “combinação desfavorável”;
- “contaminação”;
- “reduz a comparabilidade”;
- “considere manter apenas uma”;
- “separe obrigatoriamente”.

Usar linguagem neutra, por exemplo:

“Os exercícios recrutam processos cognitivos semelhantes.”

“Há concentração de treino auditivo-verbal nesta sessão.”

“Ambas as atividades utilizam mapeamentos entre cor e resposta.”

“Há alta sobreposição de controle inibitório e alternância de regras.”

Complemento padrão:

“Essa concentração pode ser intencional em um plano focal. Caso o objetivo seja maior variedade, considere intercalar outro tipo de atividade.”

Não recomendar automaticamente retirar um exercício.

==================================================
3.3 — COMBINAÇÕES QUE NÃO DEVEM SER DESFAVORÁVEIS
==================================================

Remover como combinação desfavorável, no mínimo:

- Span Numérico Auditivo Direto + Span Numérico Auditivo Inverso;
- Letras em Sequência + Span Numérico Auditivo Direto;
- N-Back + Span Numérico Auditivo Inverso;
- Matriz Espacial + Matriz Espacial Inversa;
- Matriz Espacial Inversa + Matriz com Rotações;
- Cubos + Matriz Espacial;
- Cubos + Matriz com Rotações;
- Jogo da Memória + Matriz Espacial;
- Cubos + Jogo da Memória;
- Jogo da Memória + Sequência de Itens;
- Letras em Sequência + Lista com Distração;
- Lista com Distração + N-Back;
- Lista com Distração + Restaurante;
- Supermercado + Restaurante;
- Supermercado + Sequência de Itens;
- Supermercado + Informação em Foco;
- Compra Multifuncional + Informação em Foco.

Esses pares podem representar concentração legítima do domínio treinado.

Caso seja útil descrevê-los, usar somente “Observações clínicas”, sem recomendação de exclusão.

==================================================
3.4 — OUTRAS DECLARED_BAD_COMBINATION
==================================================

Auditar todas as regras atuais de `DECLARED_BAD_COMBINATION`.

Aplicar esta regra:

Similaridade ou sobreposição, isoladamente, NÃO pode gerar “Revisão do plano”.

Se a justificativa for apenas:

- dois exercícios treinam a mesma função;
- usam estímulos semelhantes;
- exigem busca visual;
- exigem memória verbal;
- exigem planejamento;
- trabalham controle inibitório;
- usam conteúdo de produtos;
- usam regras diretas/inversas;
- recrutam processos espaciais semelhantes;

então:

- remover como alerta de revisão;
- ou converter em observação clínica neutra;
- nunca sugerir manter apenas uma atividade.

Só manter como revisão quando houver uma justificativa objetiva e clinicamente defensável de:

- fadiga;
- interferência alta;
- impossibilidade temporal;
- sequência operacional problemática;
- risco real de execução;
- incompatibilidade documentada que não seja mera sobreposição.

Não inventar novos riscos clínicos.

==================================================
3.5 — POSIÇÃO PREFERENCIAL
==================================================

“Atividade fora da posição preferencial” deve permanecer apenas como informação discreta.

Não repetir dezenas de cartões extensos.

Agrupar visualmente, por exemplo:

“13 atividades estão fora de sua posição preferencial.”

Permitir expandir para ver:

- exercício;
- posição recomendada;
- justificativa.

Não apresentar como erro.

Não bloquear.

==================================================
3.6 — AGRUPAMENTO E REDUÇÃO DO PAREDÃO
==================================================

O núcleo pode continuar retornando ocorrências individuais para rastreabilidade.

A camada de apresentação deve agrupar ocorrências semelhantes.

Exemplos:

FADIGA ALTA EM SEQUÊNCIA

Em vez de vários cartões repetidos:

“Há 4 sequências de atividades com fadiga alta.”

Ao expandir, listar os pares.

SOBREPOSIÇÃO EXECUTIVA

Agrupar pares relacionados em uma única observação, quando possível.

POSIÇÃO PREFERENCIAL

Agrupar todas as ocorrências num único bloco expansível.

Apresentação inicial:

- mostrar no máximo os alertas mais relevantes;
- usar “Ver todas as observações” quando houver muitas;
- evitar uma coluna interminável;
- não apagar os dados individuais do núcleo.

==================================================
3.7 — TÍTULOS
==================================================

Substituir títulos genéricos repetidos como:

“Combinação que merece revisão”

por títulos informativos:

- “Concentração de treino verbal”
- “Sobreposição executiva”
- “Mapeamento cor–resposta semelhante”
- “Fadiga alta em sequência”
- “Planejamento consecutivo”
- “Carga elevada para a duração”
- “Duração acima da faixa prescrita”

Não exibir códigos técnicos.

==================================================
TESTES
==================================================

Criar ou atualizar testes para provar:

1. Span Direto + Inverso não gera revisão.
2. Matriz Espacial + Inversa não gera revisão.
3. Letras em Sequência + Span Direto não gera revisão.
4. Sessão focal em memória operacional pode ser salva sem mensagens de combinação desfavorável.
5. Sobreposição cognitiva aparece, quando aplicável, como observação neutra.
6. Nenhuma mensagem visível contém “combinação desfavorável”.
7. Nenhuma sugestão visível contém “manter apenas uma”.
8. Duração excessiva continua em revisão.
9. Carga elevada continua em revisão consultiva.
10. Fadiga alta consecutiva continua em revisão.
11. Planejamento consecutivo continua como ponto de atenção/revisão consultiva.
12. Posição preferencial aparece como informação agrupada.
13. Ocorrências individuais continuam disponíveis no resultado do núcleo.
14. Nenhum alerta bloqueia o salvamento.
15. O slider de nível não aparece na janela Ajustar.
16. Abrir e salvar plano antigo não altera level/startLevel.
17. Trocar protocolo continua atualizando a duração.
18. Modalidade continua funcionando.
19. Todos os testes existentes continuam passando.
20. Build e TypeScript sem erros.

==================================================
VALIDAÇÃO VISUAL
==================================================

Validar manualmente:

1. Exercício com Breve/Padrão/Estendido.
2. Exercício com modalidade.
3. Exercício com repetição de áudio.
4. Plano focal em memória operacional.
5. Plano com Span Direto + Inverso.
6. Plano com Matriz Direta + Inversa.
7. Plano com duração excessiva.
8. Plano com fadiga alta consecutiva.
9. Plano com várias posições preferenciais.
10. Plano teste com os 34 exercícios.

Na validação com 34 exercícios:

- carga e duração devem continuar alertando;
- o painel não deve virar um paredão de combinações desfavoráveis;
- observações semelhantes devem estar agrupadas;
- Salvar plano deve continuar disponível.

==================================================
ESCOPO
==================================================

Pode alterar:

- núcleo e apresentação dos alertas;
- componentes do resumo da prescrição;
- componentes da janela Ajustar;
- testes correspondentes.

Não alterar:

- exercícios;
- progressão adaptativa;
- nível atual do paciente;
- banco;
- migrations;
- APIs, salvo necessidade técnica comprovada e previamente explicada;
- protocolos e durações já aprovados;
- formato persistido dos planos;
- modalidade;
- dose legada;
- experiência do paciente.

Antes de implementar, faça uma leitura do código real e apresente:

1. quais regras atuais de combinação serão removidas;
2. quais virarão observações clínicas;
3. quais continuarão como revisão objetiva;
4. quais arquivos serão alterados.

Depois implemente em lotes seguros:

Lote A:
- nível e refinamento visual do Ajustar.

Lote B:
- taxonomia, linguagem e agrupamento dos alertas.

Ao final de cada lote:

- rodar TypeScript;
- rodar suíte completa;
- rodar build;
- revisar o diff;
- confirmar escopo.

Depois publicar para validação visual.

Não iniciar tutoriais.

Não iniciar nova fase.

Pare após a publicação e aguarde minha validação.

## 04/08/2026 09:58
<task-notification>
<task-id>b4vwqd82v</task-id>
<tool-use-id>toolu_011TVKbi8HCpntygb8QctL9N</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/b4vwqd82v.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o lote A" completed (exit code 0)</summary>
</task-notification>

## 04/08/2026 13:01
<task-notification>
<task-id>bpxlkgzv4</task-id>
<tool-use-id>toolu_01WYDK8h5PGtAWhJ1xkpmRyu</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bpxlkgzv4.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o lote B" completed (exit code 0)</summary>
</task-notification>
