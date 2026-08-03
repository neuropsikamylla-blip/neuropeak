# Decisões clínicas pendentes

As prioridades abaixo indicam impacto em uma futura implementação. Elas não impedem a leitura da
arquitetura, não são alertas de sessão e não autorizam preencher respostas por inferência técnica.

> **Registro de 03/ago:** a margem de fechamento por modelo de execução foi validada por ela e
> permanece definida no documento 02; portanto, deixou de ser uma decisão pendente.

## Bloqueante

1. **Faixas de sessão e limite máximo:** aprovar ou ajustar os envelopes e limites de atenção do
   documento 02 antes de transformá-los em alertas de produção.
2. **Fadiga alta:** confirmar os tetos por duração, a vedação no fechamento e a exigência de uma
   atividade intermediária entre duas exposições altas.
3. **Caminhos para a Meta:** reformular o exercício e então substituir seus parâmetros provisórios;
   até lá, eles não servem de referência clínica para outros exercícios.

## Importante

1. **Concentração cognitiva:** confirmar as duas condições propostas para combinar
   `mechanicalPrimary` e macros associados em um único alerta descritivo.
2. **Janelas de planejamento:** confirmar os limites por duração, em especial se duas janelas devem
   continuar sendo o teto também em 40 minutos.
3. **Alcance de `badCombinations`:** decidir se o par deve alertar em qualquer posição da mesma
   sessão ou somente quando adjacente.
4. **Exposição semanal:** definir se existem limiares clínicos de atenção para carga, fadiga ou
   interferência multiplicadas pela frequência; até essa decisão, a projeção fica apenas informativa.

## Refinamento

1. **Posição preferencial:** confirmar se sair de `bestPosition`, mantendo `canOpen`/`canClose`, deve
   permanecer informativo em todos os casos ou subir para atenção em qualificadores específicos.
2. **Faixa parcialmente sobreposta:** confirmar se uma estimativa que apenas intersecta a faixa-alvo
   deve permanecer informativa ou receber atenção.

## Contagem

| Prioridade | Decisões pendentes |
|---|---:|
| Bloqueante | 3 |
| Importante | 4 |
| Refinamento | 2 |
