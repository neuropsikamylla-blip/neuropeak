# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 04/08/2026 05:26
<task-notification>
<task-id>bwv4pav74</task-id>
<tool-use-id>toolu_01EMEmuQqyKWw9s8B7hWCTyJ</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bwv4pav74.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o lote 2 sem interromper" completed (exit code 0)</summary>
</task-notification>

## 04/08/2026 09:06
Pode publicar esta versão para validação visual.

Faça o bump de versão, publique na Vercel e confirme:

- appVersion;
- buildId;
- health check;
- commit publicado;
- que a entrega do Lote 2 está contida no deploy.

Não iniciar nenhuma nova fase.

Depois da publicação, vou validar principalmente:

1. A janela “Ajustar” com as cinco seções:
   - Dose do treino;
   - Modalidade e variantes;
   - Assistência;
   - Configurações de nível;
   - Preferências de execução.

2. Se Breve, Padrão e Estendido estão claros e visualmente equilibrados.

3. Se a duração da sessão muda imediatamente ao trocar o protocolo.

4. Se as unidades aparecem corretamente:
   - séries;
   - rodadas;
   - tentativas;
   - desafios completos.

5. Se o aviso do Breve está claro e não faz o protocolo parecer inadequado.

6. Se o plano legado preserva a dose antiga e oferece conversão explícita.

7. Se Caminhos para a Meta aparece como provisório sem esconder o valor preservado.

8. Se a janela ficou visualmente pesada ou extensa demais.

9. Se o botão Salvar plano continua funcionando normalmente.

Não alterar código durante a publicação, salvo ajuste estritamente necessário para o deploy.

Após publicar, pare e aguarde minha validação visual.
