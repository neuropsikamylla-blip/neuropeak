# Padronização Cogmed → NeuroPeak — mapa comparativo e proposta

> Análise feita em 15/jul/2026 a partir do material licenciado da Kamylla (Manual do
> Tutor Cogmed 2021/Pearson, livretos de treinamento JM/QM/RM e modelos de Relatório
> Final adulto/criança). **Limite:** aproveitamos os PRINCÍPIOS OPERACIONAIS do método
> (regras adaptativas, dosagem, métricas, acompanhamento — ciência publicada); NÃO
> copiamos nomes, telas, estímulos, textos ou marca do Cogmed.

## 1. O que o método faz (síntese operacional)

**Motor adaptativo por TENTATIVA** (léxico do manual + monitor de blocos):
- Nível = tamanho da sequência a lembrar; subníveis pela dificuldade da combinação.
- Acertou a tentativa → nível **+1** já na próxima.
- Erro **leve** (exatamente 1 item errado, ou troca de ordem de 2 itens) → **mantém** o nível.
- Erro **grave** (2+ itens errados) → nível **−1**.
- Meta: treinar na borda da capacidade. Erros são ESPERADOS no nível ideal —
  treino sem erro é sinal de problema (estratégia externa), não de sucesso.
- Fadiga: após 3 tentativas erradas, pausa curta recomendada (≤5 min).

**Dosagem (protocolos):** Light 15 min/bloco (só visuoespacial, 4+ anos); Standard
25/35/50 min/bloco (visuoespacial+verbal, 7+ anos). Frequência 3–5 blocos/semana;
duração total 5–14 semanas conforme a combinação. Conclusão válida com **≥80% dos
blocos**; atraso >10 dias compromete o protocolo.

**Índice de Treinamento** (a métrica do tutor):
- Calculado continuamente sobre um SUBCONJUNTO de tarefas (mistura visuoespacial + verbal).
- **Índice Inicial** = linha de base nos primeiros blocos (blocos 1–2 nos protocolos
  longos; 3–4 nos curtos, para não contaminar com aprendizado da interface).
- **Índice Máximo** = média dos 2 melhores blocos.
- **Melhoria** = Máximo − Inicial. Espera-se curva crescente suave.

**Monitoria do tutor (por bloco):** nível máx/médio/mín; pouca oscilação = nível ideal;
salto >2 níveis num bloco = suspeita de estratégia proibida (anotar, repetir em voz
alta); queda acentuada = fadiga/desmotivação. Tempo por exercício também é monitorado.

**Modelo de acompanhamento (4 etapas):** entrevista inicial → sessão inicial (30–45
min, define protocolo e rotina) → contato semanal (15 min, checklist de conformidade,
nível ideal, motivação) → sessão de encerramento + Relatório Final (Índices + QIDHI
antes/depois + efeitos qualitativos relatados + follow-up agendado p/ 6 meses).

**Engajamento (livretos):** objetivos funcionais pessoais avaliados 1–10 antes/depois;
calendário com marcação diária; recompensa diária desbloqueada pelo ESFORÇO (jogo à
parte); certificado de conclusão; dois temas — com gamificação e "focus" sem nada.

## 2. Mapa NeuroPeak (estado atual × método)

Exercícios equivalentes (memória operacional): `span-numerico` (+inverso, +auditivos),
`letras-sequencia`, `cubo-corsi`, `matriz-espacial` (+inversa), `sequencia-itens`.

| Dimensão | Cogmed | NeuroPeak hoje |
|---|---|---|
| Adaptação | Por tentativa: +1 no acerto; leve mantém; grave −1 | 2 acertos seguidos → +1; 2 erros seguidos → −1 (modelo Cubo/Span) |
| Distinção de erro | Leve (1 item/troca) vs grave (2+) | Não existe — erro é erro |
| Sessão | Bloco de 15–50 min, exercícios encadeados | ~7 min por exercício (tempo ativo) |
| Dosagem prescrita | Protocolo formal (blocos/semana × semanas, ≥80%) | Plano lista exercícios; sem meta semanal formal |
| Métrica longitudinal | Índice Inicial/Máximo/Melhoria | Score 0-100 + acurácia por sessão; sem índice consolidado |
| Fidelidade | Alerta de salto >2 níveis; treino sem erro = suspeito | Sem verificação |
| Fadiga | Pausa ≤5 min após 3 erros | Sem pausa guiada |
| Encerramento | Relatório final padronizado + follow-up | PDF de relatório existe; sem seção de índice/objetivos |
| Teto | Sem teto prático de span | Span: teto 8 dígitos (MAX_LEVEL 7) — baixo p/ adultos fortes |

## 3. Propostas (para decisão da Kamylla)

- **A. Motor por tentativa** nos 6+ exercícios de MO: acerto → +1; erro leve → mantém;
  erro grave → −1. "Leve" por exercício: 1 item errado OU troca de 2 adjacentes.
  Elevar teto do Span (8 → 10+ dígitos). MAIOR impacto clínico; muda o ritmo do treino.
- **B. Índice de Memória Operacional** (painel + PDF): baseline nas primeiras sessões ×
  média das 2 melhores; curva de evolução. Compara o paciente só com ele mesmo.
- **C. Protocolo de dosagem no plano:** terapeuta define blocos/semana e duração;
  app mostra calendário de conformidade; cron de alertas avisa atraso (>N dias) e
  conclusão (≥80%).
- **D. Alertas de fidelidade:** salto >2 níveis num bloco ou sessão sem nenhum erro em
  nível alto → alerta ao terapeuta (sistema de Alerts já existe).
- **E. Pausa guiada:** 3 erros seguidos → tela de respiro (respiração/alongar, ≤5 min,
  não conta no tempo ativo).
- **F. Relatório final + objetivos:** objetivos funcionais 1–10 antes/depois definidos
  pelo terapeuta + seção de índice no PDF + follow-up sugerido.

Observação honesta: a literatura independente sustenta com força os ganhos nas tarefas
treinadas e o valor do motor adaptativo/dosagem; a generalização ampla (far transfer)
é debatida. As propostas acima importam exatamente a parte sólida do método.

## 4. Decisões pendentes

1. Adotar o motor por tentativa? Em todos os de MO ou pilotar em um?
2. Quais das frentes B–F entram, e em que ordem?
3. Dosagem padrão sugerida ao terapeuta (ex.: 5 blocos/semana × 5 semanas ~ Standard)?
