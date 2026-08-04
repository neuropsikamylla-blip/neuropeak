# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 03/08/2026 23:52
Encontramos uma inconsistência arquitetônica. Os parâmetros ajustáveis (tentativas, repetições, nível inicial etc.) alteram a dose clínica do exercício, mas o painel continua exibindo a duração, carga basal e fadiga do protocolo original. Isso quebra a consistência da prescrição.
Antes de continuar a implementação, precisamos definir uma regra única:
Todo parâmetro ajustável que modifica a dose clínica deve atualizar automaticamente duração estimada, carga basal e fadiga da sessão; ou
Esses parâmetros deixam de ser livres e passam a ser derivados exclusivamente do protocolo (Breve, Padrão ou Estendido).
Não implemente ainda. Faça primeiro uma análise arquitetônica indicando quais parâmetros realmente modificam a dose clínica de cada exercício e quais são apenas configurações que não alteram carga, duração ou fadiga.

## 04/08/2026 00:01
A análise confirmou a inconsistência. Vamos adotar uma terceira via, com as decisões abaixo.

Ainda NÃO implemente.

Primeiro atualize a arquitetura e produza uma especificação objetiva de implementação.

==================================================
1. REGRA CENTRAL DA DOSE
==================================================

Para NOVOS planos, o terapeuta não escolherá diretamente:

- número de tentativas;
- número de séries;
- número de rodadas;
- número de blocos.

Ele escolherá apenas:

- BREVE;
- PADRÃO;
- ESTENDIDO.

Cada protocolo define internamente a quantidade de unidades, conforme o catálogo de prescrição de cada exercício.

A duração exibida deverá sempre corresponder ao protocolo escolhido.

Não oferecer dose personalizada para novos planos nesta etapa.

O objetivo é preservar:

- previsibilidade de duração;
- coerência da sessão;
- consistência entre interface e motor;
- validade mínima da progressão;
- simplicidade para o terapeuta.

==================================================
2. INDICAÇÃO DOS PROTOCOLOS
==================================================

Além do nome, mostrar ao terapeuta uma explicação breve:

BREVE

Indicado para:

- primeiro contato com o exercício;
- baixa tolerância à fadiga;
- necessidade de introdução gradual;
- sessões curtas;
- composição com maior número de exercícios;
- pacientes com dificuldade de permanência;
- retorno após interrupção prolongada.

Aviso:

- em alguns exercícios, o protocolo breve pode produzir treino válido, mas não fornecer unidades suficientes para decisão adaptativa robusta;
- essa limitação deve aparecer quando aplicável.

PADRÃO

Indicado para:

- uso habitual;
- maioria das prescrições;
- treino com dose suficiente para adaptação;
- equilíbrio entre intensidade, duração e variedade;
- acompanhamento regular.

Deve ser a opção selecionada por padrão em novos planos.

ESTENDIDO

Indicado para:

- treino focal de um domínio;
- paciente já familiarizado com o exercício;
- boa tolerância à tarefa;
- sessão mais longa;
- menor quantidade de exercícios na sessão;
- necessidade clínica de maior repetição ou consolidação.

Aviso:

- pode aumentar fadiga;
- deve ser considerado junto à composição total da sessão;
- não significa automaticamente maior eficácia.

Esses textos são orientativos, não diagnósticos e não substituem o julgamento do terapeuta.

==================================================
3. SPANS
==================================================

Eliminar a inconsistência entre:

- painel atual: 10 / 15 / 20 / 30 tentativas;
- arquitetura: 4 / 8 / 12 séries.

Para novos planos, utilizar exclusivamente os valores definidos nos protocolos do catálogo.

O terapeuta vê:

- Breve;
- Padrão;
- Estendido.

Não vê nem altera diretamente o número de tentativas.

A quantidade interna pode aparecer em “Ver detalhes”, por exemplo:

- Breve — 4 séries;
- Padrão — 8 séries;
- Estendido — 12 séries.

Não alterar esses valores nesta etapa sem nova validação clínica.

==================================================
4. PLANOS ANTIGOS COM 10, 15, 20 OU 30 TENTATIVAS
==================================================

Não migrar, arredondar nem substituir automaticamente.

Preservar exatamente o valor salvo.

Classificar internamente como:

LEGACY_CUSTOM_DOSE

Comportamento:

- o plano antigo continua abrindo;
- continua executando com a quantidade original;
- a duração deve ser estimada conforme a dose legada, quando houver regra segura;
- não apagar o valor;
- não converter silenciosamente para Breve, Padrão ou Estendido;
- não alterar progressão nem histórico.

Ao editar um exercício legado, mostrar aviso discreto:

“Este exercício utiliza uma configuração anterior de dose.”

Oferecer ao terapeuta duas ações:

- Manter configuração atual;
- Converter para Breve, Padrão ou Estendido.

A conversão deve ser explícita e nunca automática.

Caso ainda não exista fórmula segura para estimar a duração de uma dose legada, mostrar:

“Duração aproximada — configuração anterior.”

Não inventar precisão.

==================================================
5. NÍVEL INICIAL
==================================================

O nível inicial não é dose.

Entretanto, ele não deve permanecer como um controle livre em toda edição do plano.

Nova regra:

PACIENTE SEM HISTÓRICO NO EXERCÍCIO

- permitir definir o nível inicial;
- utilizar preferencialmente uma recomendação automática;
- o terapeuta pode ajustar manualmente quando necessário.

PACIENTE COM HISTÓRICO

- mostrar o nível atual alcançado;
- informar que haverá retomada automática;
- não mostrar o slider rotineiro de nível inicial;
- não sobrescrever progresso ao salvar o plano.

Caso o terapeuta queira alterar o nível:

- utilizar ação separada “Redefinir nível”;
- mostrar nível atual e novo nível;
- explicar o impacto;
- exigir confirmação;
- preservar o histórico anterior;
- nunca rebaixar silenciosamente.

O nível pode alterar a dificuldade e o tempo por unidade, mas não deve modificar a duração estimada enquanto não houver dados empíricos suficientes para uma fórmula confiável.

Registrar essa limitação explicitamente.

==================================================
6. REPETIÇÃO DE ÁUDIO
==================================================

`allowReplay` não é dose.

Classificar como:

ASSISTIVE_PARAMETER

A repetição:

- não altera a quantidade prescrita;
- não altera automaticamente a duração estimada;
- não altera automaticamente a carga basal;
- deve ser registrada;
- pode alterar a comparabilidade e a demanda de memória.

Diferenciar:

- áudio intrínseco da tarefa;
- leitura assistiva de instrução;
- repetição de conteúdo que deveria ser memorizado.

Não criar fórmula de carga para repetição nesta etapa.

Apenas manter o parâmetro separado e registrar seu uso.

==================================================
7. CAMINHOS PARA A META
==================================================

O exercício permanece PROVISIONAL_PROFILE e será reformulado.

Não utilizar `atividadesSelecionadas` como quantidade livre de dose definitiva.

Na arquitetura futura:

- o protocolo define quantas unidades serão apresentadas;
- o terapeuta poderá escolher quais categorias ou tipos de atividade são elegíveis;
- escolher categorias não deve alterar o número total de unidades do protocolo;
- o motor seleciona as unidades dentro das categorias permitidas.

Exemplo conceitual:

- Breve: poucas unidades;
- Padrão: quantidade habitual;
- Estendido: maior número de unidades.

Os valores exatos serão reavaliados após a reformulação.

Não implementar essa mudança agora.

==================================================
8. ORDEM DA HISTÓRIA
==================================================

`unlockIntruso` e `unlockFalta` não devem controlar livremente a duração total.

Eles devem ser tratados como:

VARIANT_ELIGIBILITY

Ou seja:

- definem quais tipos de desafio podem aparecer;
- não aumentam automaticamente o número total de unidades;
- o protocolo continua definindo a quantidade da sessão;
- quando ativados, os desafios entram na amostragem das unidades prescritas.

Assim:

- Breve, Padrão e Estendido controlam a dose;
- Intruso e Falta controlam a variedade da tarefa.

Caso a mecânica atual não permita essa separação, documentar a alteração necessária, sem implementar ainda.

==================================================
9. OUTROS PARÂMETROS ADMINISTRATIVOS
==================================================

Classificar como administrativos:

- feedback;
- autoAdvance;
- demais preferências de apresentação ou fluxo.

Esses parâmetros:

- não alteram a dose prescrita;
- não alteram duração estimada;
- não alteram carga basal;
- não alteram fadiga no cálculo atual.

Caso algum parâmetro tenha impacto temporal real, registrar como limitação, sem inventar fórmula.

==================================================
10. MODELO CONCEITUAL
==================================================

Separar formalmente:

DOSE_PARAMETERS

- protocol;
- legacyCustomDose, apenas para compatibilidade.

DIFFICULTY_PARAMETERS

- startLevel, somente na primeira prescrição ou redefinição explícita;
- nível adaptativo atual;
- parâmetros internos de dificuldade.

ASSISTIVE_PARAMETERS

- allowReplay;
- leitura assistiva;
- outras ajudas.

VARIANT_PARAMETERS

- categorias elegíveis;
- tipos de desafio;
- modalidade, nos cinco exercícios aplicáveis.

ADMINISTRATIVE_PARAMETERS

- feedback;
- autoAdvance;
- preferências de fluxo.

Um parâmetro só pode pertencer a uma dessas categorias, salvo justificativa explícita.

==================================================
11. INTERFACE FUTURA DO AJUSTE
==================================================

O botão “Ajustar” deverá mostrar prioritariamente:

PROTOCOLO

- Breve;
- Padrão;
- Estendido.

Para cada opção, mostrar:

- indicação clínica resumida;
- quantidade interna de unidades;
- duração estimada;
- observação sobre validade adaptativa, quando necessária.

Depois, mostrar apenas as configurações realmente aplicáveis:

- modalidade, nos cinco exercícios;
- repetição de áudio, quando aplicável;
- variantes clínicas, quando aplicável;
- nível inicial somente se não houver histórico;
- nível atual e retomada automática quando houver histórico.

Remover da prescrição nova:

- tentativas livres;
- séries livres;
- slider de nível inicial indiscriminado.

==================================================
12. CARGA E FADIGA
==================================================

Nesta etapa:

- protocolo altera duração e quantidade de unidades;
- carga basal continua sendo propriedade da mecânica padrão;
- fadiga continua sendo a classificação basal definida;
- não recalcular numericamente carga e fadiga por protocolo ainda.

Mostrar, contudo, que:

- protocolo Estendido aumenta exposição e pode aumentar fadiga;
- protocolo Breve reduz exposição;
- isso é um modificador qualitativo até existir fórmula dinâmica validada.

Não exibir falsa precisão, como alterar carga 2 para 3 automaticamente sem modelo aprovado.

==================================================
13. DOCUMENTAÇÃO
==================================================

Atualize:

docs/prescription-architecture/07-parameter-dose-analysis.md

Crie:

docs/prescription-architecture/08-dose-parameter-decisions.md

Deve conter:

- decisões aprovadas;
- classificação dos parâmetros;
- comportamento dos planos legados;
- indicação de Breve/Padrão/Estendido;
- regras de nível;
- regras de repetição;
- regras das variantes;
- limitações;
- especificação futura da interface.

Produza também uma tabela dos 34 exercícios com:

- exercício;
- protocolo Breve;
- protocolo Padrão;
- protocolo Estendido;
- unidade interna;
- parâmetros de dose antigos;
- parâmetros que permanecerão visíveis;
- parâmetros que serão removidos da prescrição nova;
- impacto no legado.

==================================================
14. RELATÓRIO FINAL
==================================================

Apresente:

1. Quais controles atuais serão removidos.
2. Quais permanecerão.
3. Quais aparecerão apenas em condições específicas.
4. Como os planos antigos serão preservados.
5. Quais exercícios possuem dose legada.
6. Quais exercícios possuem variantes.
7. Quais possuem assistência de áudio.
8. Quais decisões ainda dependem da reformulação do exercício.
9. Arquivos que uma futura implementação precisará alterar.
10. Ordem segura de implementação.

Não implementar.

Não alterar código.

Não alterar banco.

Não criar migration.

Não alterar interface.

Não alterar exercícios.

Depois pare e aguarde validação.

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
