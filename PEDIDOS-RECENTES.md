# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O QUE NÃO FIZ

- Não commitei e não dei push (é do VP).
- Não alterei nenhum outro arquivo — nem código, nem `ESTADO-DO-PROJETO.md`, nem docs, nem memória.
- Não reexecutei `tsc`, `vitest`, `build` nem as chamadas a `/api/version` e `/api/health`: as provas registradas são as que o despacho trouxe do VP, não evidência colhida por mim nesta tarefa. Se o VP quiser reconfirmação independente dessas quatro provas, é um despacho novo.
- Não iniciei nem preparei nada da Fase 3.</result>
<usage><subagent_tokens>26668</subagent_tokens><tool_uses>4</tool_uses><duration_ms>63993</duration_ms></usage>
</task-notification>

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
