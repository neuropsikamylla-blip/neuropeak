# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 00:15
A análise de parâmetros e dose está validada.

Vamos implementar agora apenas os passos 1 a 5 da ordem segura:

1. Tipos e categorias de parâmetros.
2. Leitura e preservação da dose legada.
3. Gravação real do protocolo no plano.
4. Apresentação dos protocolos, indicações e avisos.
5. Substituição dos controles livres pelo seletor Breve / Padrão / Estendido.

NÃO implementar nesta etapa:

- redefinição de nível;
- leitura de histórico do paciente;
- reformulação de Caminhos para a Meta;
- reformulação de Ordem da História;
- carga dinâmica;
- fórmula de fadiga dinâmica;
- dose personalizada em novos planos;
- mudanças nos exercícios;
- mudanças na progressão adaptativa.

==================================================
1. MODELO DE PARÂMETROS
==================================================

Implementar formalmente as categorias:

- DOSE_PARAMETER
- DIFFICULTY_PARAMETER
- ASSISTIVE_PARAMETER
- VARIANT_PARAMETER
- ADMINISTRATIVE_PARAMETER

Implementar:

- BREVE
- PADRAO
- ESTENDIDO
- LEGACY_CUSTOM_DOSE

Regras:

- protocolo é o único controle de dose para novos planos;
- LEGACY_CUSTOM_DOSE existe somente para compatibilidade;
- variante pode modificar duração quando houver multiplicador explícito no catálogo;
- isso não transforma a variante em parâmetro de dose.

==================================================
2. LEITURA DE PLANOS LEGADOS
==================================================

Atualizar a leitura legada para reconhecer:

- trials;
- séries ou unidades históricas equivalentes;
- quantidade salva nas configurações antigas.

Nos dois spans:

- preservar exatamente 10, 15, 20 ou 30 tentativas;
- classificar como LEGACY_CUSTOM_DOSE;
- não converter automaticamente;
- não arredondar;
- não alterar execução;
- não alterar progressão;
- não apagar o campo antigo.

Para Caminhos para a Meta:

- preservar atividadesSelecionadas;
- marcar como configuração legada/provisória;
- não reinterpretar como protocolo definitivo;
- não alterar a execução atual.

==================================================
3. ESTIMATIVA DE DURAÇÃO LEGADA
==================================================

Não inventar fórmula quando não houver base segura.

Quando a dose legada puder ser estimada de maneira fundamentada:

- calcular a faixa;
- marcar o resultado como aproximado.

Quando não houver regra segura:

mostrar:

“Duração aproximada — configuração anterior.”

A interface deve distinguir:

- duração calculada por protocolo atual;
- duração aproximada de dose legada.

Nenhuma alteração automática no plano ao apenas abrir a tela.

==================================================
4. GRAVAÇÃO DOS NOVOS PLANOS
==================================================

Atualizar `lib/exercise-plan.ts` para gravar explicitamente o protocolo selecionado.

Para novos planos, salvar algo conceitualmente equivalente a:

- dose.protocol = BREVE | PADRAO | ESTENDIDO

Não depender de valores implícitos ou fallback silencioso.

Ao criar um novo exercício no plano:

- selecionar PADRAO por padrão;
- persistir PADRAO explicitamente;
- a duração exibida deve responder imediatamente ao protocolo escolhido.

Garantir que:

- mudar Breve → Padrão → Estendido atualize a duração;
- o resumo da sessão seja recalculado;
- carga basal permaneça igual;
- fadiga basal permaneça igual;
- a exposição maior ou menor apareça apenas como observação qualitativa.

==================================================
5. NOVA INTERFACE DE AJUSTE
==================================================

Remover de novos planos:

- seletor livre de 10 / 15 / 20 / 30 tentativas;
- número livre de séries;
- número livre de blocos;
- slider indiscriminado de nível inicial.

No botão “Ajustar”, mostrar primeiro:

PROTOCOLO DE TREINO

BREVE

Texto orientativo:

“Dose reduzida. Pode ser útil para introdução à atividade, menor tolerância à fadiga, retorno após pausa ou sessões com maior variedade de exercícios.”

PADRÃO

Texto orientativo:

“Dose habitual recomendada para a maioria dos treinos, equilibrando duração, repetição e adaptação.”

ESTENDIDO

Texto orientativo:

“Dose ampliada para treino focal, maior familiaridade com a tarefa ou sessões com menor número de exercícios. Pode aumentar a fadiga.”

Mostrar em cada opção:

- quantidade interna de unidades;
- duração estimada;
- observação sobre progressão adaptativa, quando aplicável.

Exemplo:

Padrão
8 séries
Estimativa: 6–7 min

Não mostrar tentativas ou séries como campo editável.

==================================================
6. PLANOS LEGADOS NA INTERFACE
==================================================

Quando o exercício possuir LEGACY_CUSTOM_DOSE, mostrar:

“Configuração anterior de dose”

Exibir o valor preservado, por exemplo:

“15 tentativas”

Disponibilizar:

- Manter configuração atual;
- Converter para Breve;
- Converter para Padrão;
- Converter para Estendido.

A conversão:

- só ocorre após ação explícita;
- deve mostrar antes o que mudará;
- deve exigir confirmação;
- substitui a dose antiga pelo protocolo escolhido;
- não altera nível, progresso ou histórico.

Apenas abrir ou salvar outro campo não pode converter a dose.

==================================================
7. CONTROLES QUE PERMANECEM
==================================================

Manter, quando aplicável:

- modalidade;
- repetição de áudio;
- feedback;
- autoAdvance;
- variantes clínicas.

Mas separá-los visualmente do protocolo.

Estrutura sugerida:

1. Dose do treino
2. Modalidade e variantes
3. Assistência
4. Preferências de execução

Para modalidade:

- pode modificar duração quando o catálogo possuir durationMultiplier;
- recalcular a faixa automaticamente;
- não alterar carga ou fadiga numericamente nesta etapa.

Para allowReplay:

- não tratar como dose;
- manter registrado;
- explicar que a repetição reapresenta o conteúdo auditivo;
- não recalcular duração, carga ou fadiga.

==================================================
8. NÍVEL
==================================================

Nesta etapa, não implementar a nova regra completa de nível com histórico.

Entretanto:

- remover o slider indiscriminado dos novos ajustes apenas se isso não quebrar planos atuais;
- não apagar valores antigos;
- não sobrescrever nível;
- não redefinir progresso;
- não criar um novo comportamento provisório.

Caso a remoção dependa de acesso ao histórico ainda inexistente:

- manter o controle atual temporariamente;
- marcar visualmente como “Configuração de nível — revisão futura”;
- documentar a dívida técnica;
- não fingir que a regra definitiva já foi implementada.

Prefira preservar comportamento a introduzir uma redefinição incorreta.

==================================================
9. CAMINHOS PARA A META E ORDEM DA HISTÓRIA
==================================================

Não reformular agora.

Caminhos para a Meta:

- manter PROVISIONAL_PROFILE;
- preservar configuração atual;
- não exibir protocolo como se fosse definitivo, caso os valores ainda sejam provisórios;
- indicar discretamente “Configuração provisória”.

Ordem da História:

- preservar unlockIntruso e unlockFalta;
- não fingir que atualmente são apenas variantes se ainda aumentam etapas;
- documentar na interface ou internamente que a separação dose × variedade será feita na reformulação.

==================================================
10. TESTES OBRIGATÓRIOS
==================================================

Criar testes para:

1. Novo plano grava PADRAO explicitamente.
2. Breve, Padrão e Estendido geram durações diferentes.
3. `trials: 10`, `15`, `20` e `30` são preservados.
4. Dose legada não é convertida ao abrir.
5. Dose legada não é convertida ao salvar outro campo.
6. Conversão só ocorre por ação explícita.
7. Modalidade recalcula duração quando possui multiplicador.
8. Modalidade não altera carga basal.
9. allowReplay não altera duração, carga ou fadiga.
10. Nenhum protocolo permite editar livremente a quantidade.
11. Planos antigos continuam abrindo.
12. Os testes existentes continuam passando.
13. Nenhum nível ou progresso é alterado.
14. Caminhos para a Meta e Ordem da História preservam o funcionamento atual.

==================================================
11. VALIDAÇÃO VISUAL
==================================================

Validar manualmente:

- novo Span Direto;
- novo Span Inverso;
- Span legado com 15 tentativas;
- conversão explícita de legado para Padrão;
- exercício comum em Breve/Padrão/Estendido;
- exercício com modalidade;
- exercício com allowReplay;
- Caminhos para a Meta;
- Ordem da História.

Confirmar que a duração da sessão muda imediatamente ao trocar o protocolo.

==================================================
12. ENTREGA
==================================================

Ao final apresentar:

1. Arquivos criados e alterados.
2. Diff resumido.
3. Resultado dos testes.
4. Exemplo real de Breve/Padrão/Estendido.
5. Exemplo real de plano legado preservado.
6. Exemplo de conversão explícita.
7. Prova de que nível e progresso não foram modificados.
8. Controles removidos.
9. Controles mantidos.
10. Limitações restantes.
11. Prints da nova janela “Ajustar”.

Não iniciar a implementação de nível com histórico.

Não reformular exercícios.

Não iniciar nova fase automaticamente.

Pare para validação visual.

## 04/08/2026 00:35
<task-notification>
<task-id>bzne5c4qu</task-id>
<tool-use-id>toolu_01FkAVFd8PxmoJnYrrFXMXbb</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bzne5c4qu.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o lote 1" completed (exit code 0)</summary>
</task-notification>

## 04/08/2026 00:41
Perfeito.

Pode concluir normalmente o Lote 2.

Na validação visual vou observar principalmente:

1. Se a janela "Ajustar" ficou simples e intuitiva para o terapeuta.

2. Se a diferença entre Breve, Padrão e Estendido é compreendida apenas lendo a interface, sem necessidade de documentação externa.

3. Se a troca do protocolo atualiza imediatamente a duração estimada da sessão.

4. Se os planos legados aparecem claramente identificados como configuração anterior, oferecendo apenas:
- Manter configuração atual;
- Converter para Breve;
- Converter para Padrão;
- Converter para Estendido.

Sem conversão automática.

5. Se a organização ficou nesta ordem:

- Dose do treino
- Modalidade e variantes
- Assistência
- Configurações de nível (temporariamente, até a futura revisão)

6. Se a interface continua limpa e não aumentou excessivamente a carga visual.

Depois da entrega vou validar visualmente antes de qualquer nova implementação.
