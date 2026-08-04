# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 04/08/2026 00:43
Perfeito.

Pode concluir normalmente o lote 2.

Apenas uma observação importante.

O aviso sobre validade adaptativa do protocolo Breve não deve aparecer por uma regra genérica do tipo “poucas unidades”.

Ele deve existir apenas quando isso estiver explicitamente documentado para aquele exercício no catálogo de prescrição.

Ou seja, a regra deve ser específica por exercício, não derivada automaticamente da quantidade de unidades.

Se ainda não houver essa informação validada para determinado exercício, prefiro não exibir esse aviso nesta etapa.

Outro ponto: a quantidade interna mostrada ao terapeuta deve utilizar a unidade real de cada exercício, e não a palavra “séries” de forma genérica.

Exemplos:

- Span: séries;
- Restaurante: pedidos, se essa for a unidade definida;
- Supermercado: listas ou rodadas, conforme o catálogo;
- Informação em Foco: rodadas;
- Jogo das Torres: desafios.

Utilize sempre a unidade já registrada no catálogo de prescrição. Não invente nem renomeie unidades nesta etapa.

Sobre a carga visual, concordo com sua decisão.

Não recolha automaticamente nenhuma seção antes da validação visual.

Primeiro quero ver a interface completa.

Depois decidiremos, com a tela aberta, quais seções permanecem expandidas por padrão e quais poderão iniciar recolhidas.

Prefiro tomar essa decisão observando a experiência real de uso, e não antecipadamente.

## 04/08/2026 00:45
Perfeito. Pode aplicar as três correções conforme descrito.

Apenas ajuste a linguagem do aviso do protocolo Breve.

Como os 34 exercícios possuem clinicalValidity indicando quantidade insuficiente para progressão, não quero que a interface apresente apenas “Insuficiente para progressão”, pois isso pode fazer o terapeuta interpretar que o protocolo Breve é inadequado ou que não produz treino útil.

Utilize uma mensagem neutra e clinicamente clara:

“Treino válido em dose reduzida. O desempenho desta sessão pode não ser suficiente, isoladamente, para atualizar o nível adaptativo.”

Essa mensagem deve deixar claro que:

- o protocolo Breve continua sendo uma opção válida de treino;
- ele pode ser indicado para introdução, menor tolerância, retorno após pausa ou maior variedade na sessão;
- a limitação se refere apenas à robustez da decisão adaptativa naquela execução;
- isso não representa erro, contraindicação ou perda do treino realizado.

Mantenha as unidades exatamente como estão registradas no catálogo nesta etapa:

- Span: séries;
- Restaurante: rodadas;
- Informação em Foco: tentativas;
- Supermercado: rodadas;
- Jogo das Torres: desafios completos.

Corrija também o protocolLabel para usar a unidade real de cada exercício, sem “blocos” genéricos.

Mantenha a quarta seção como “Configurações de nível” e feedback/autoAdvance em uma quinta seção.

Não recolha nenhuma seção antes da validação visual.

Pode concluir o lote 2 e parar para eu revisar a tela.
