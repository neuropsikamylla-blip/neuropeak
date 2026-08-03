# Decisões clínicas e de arquitetura

As prioridades abaixo indicam impacto em uma futura implementação. Elas não impedem a leitura da
arquitetura, não são alertas de sessão e não autorizam preencher respostas por inferência técnica.

## Bloqueantes aprovadas — 03/ago/2026

As quatro decisões que bloqueavam a implementação foram **APROVADAS** por ela em 03/ago/2026.
Não há bloqueante restante.

1. **APROVADA — Faixas de duração em quatro estados.** Para 20 min: abaixo `< 18`, dentro do
   esperado `18–22`, atenção `> 22 até 24` e `EXCESSO_IMPORTANTE` `> 24`; para 30 min: `< 27`,
   `27–33`, `> 33 até 36` e `> 36`; para 40 min: `< 36`, `36–44`, `> 44 até 48` e `> 48`.
   São estimativas operacionais, não limites clínicos, e nunca bloqueiam o salvamento.
2. **APROVADA — Margem de fechamento por modelo.** `CONTINUOUS_TIMED`: 0,5 min;
   `CLOSED_PROTOCOL`: 1 min; `PLANNING_WINDOW`: 3 min; `FIXED_HIGH_FATIGUE`: 0, além das
   transições. Não se inicia nova unidade depois do tempo-base. Nos 3 min de planejamento, o teto
   é de segurança, não obrigação: desafio não concluído encerra com segurança, preserva métricas e
   progresso adaptativo, sem erro, penalização, redução ou bloqueio de subida automáticos.
3. **APROVADA — Fadiga alta como recomendação.** Máximo recomendado de 1 em 20 min e 2 em 30/40
   min; sugerir baixa ou moderada entre duas altas e evitar alta no fechamento, mas permitir salvar
   e executar normalmente quando o terapeuta a mantiver.
4. **APROVADA — Tetos de carga basal como heurística pura.** Referências de **7** (20 min),
   **10** (30 min) e **13** (40 min). **Não** significam sessão válida, inválida, autorização,
   proibição nem segurança garantida: duas sessões com a mesma soma podem receber alertas
   diferentes. A leitura considera conjuntamente carga basal · fadiga · interferência · sequência ·
   modalidade · modelo de execução · concentração de tarefas semelhantes · planejamento consecutivo.
   Nenhum teto bloqueia salvamento.

## Também aprovado em 03/ago (não era bloqueante)

- **Caminhos para a Meta provisório.** Mantém `PROVISIONAL_PROFILE`, com duração,
   carga e modelo provisórios, até a reformulação para planejamento. Não deve calibrar outros
   exercícios.

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

1. **Posição preferencial:** confirmar se sair de `bestPosition`, mantendo `canOpen`/`canClose`,
   deve permanecer informativo em todos os casos ou subir para atenção em qualificadores específicos.
2. **Faixa parcialmente sobreposta:** confirmar se uma estimativa que apenas intersecta a faixa-alvo
   deve permanecer informativa ou receber atenção.

## Contagem

| Prioridade | Decisões pendentes |
|---|---:|
| Bloqueante | 0 |
| Importante | 4 |
| Refinamento | 2 |
