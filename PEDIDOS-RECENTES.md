# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 13:57
Pare imediatamente a implementação da T1.

Encontramos um bug funcional que bloqueia o uso clínico.

Comportamento observado:

- crio um plano;
- adiciono exercícios;
- salvo;
- tudo parece correto;
- saio da página;
- volto para analisar o mesmo plano;
- todos os exercícios desapareceram.

Não implemente nenhuma correção ainda.

Primeiro faça uma investigação completa e apresente evidências.

Quero descobrir exatamente onde ocorre a perda dos exercícios.

Analise todo o fluxo:

1. criação do plano;
2. salvamento;
3. persistência das relações TrainingPlan ↔ exercícios;
4. update do plano;
5. leitura do plano na tela de análise;
6. carregamento após recarregar a página.

Para cada etapa informe:

- qual função executa;
- qual API é chamada;
- qual SQL/Prisma é executado;
- quais tabelas são alteradas;
- onde os exercícios ainda existem;
- em que momento desaparecem.

Quero evidências, não hipóteses.

Se possível, execute o fluxo completo em ambiente de desenvolvimento e identifique o primeiro ponto em que o estado diverge do esperado.

Não corrija nada antes de localizar exatamente a origem do problema.

## 05/08/2026 15:05
Vou coletar as três evidências solicitadas.

1. Contador da tela:
[INFORMAR SE MOSTRA TOTAL 0 OU TOTAL MAIOR QUE ZERO]

2. Console:
[INFORMAR SE EXISTE ERRO VERMELHO E ENVIAR O TRECHO/PRINT]

3. Requisição GET /api/patients/[id]?config=true:
- status: [VALOR]
- trainingPlans retornado: [SIM/NÃO]
- exercises dentro do plano: [LISTA PRESENTE / LISTA VAZIA]
- quantidade de planos ativos retornados: [VALOR]

Aguarde essas evidências antes de corrigir. Não iniciar T1.

## 05/08/2026 15:27
Coletei as evidências:

1. Contador da tela:
- Total: [VALOR]
- Os cartões aparecem? [SIM/NÃO]

2. Console:
- Há erro vermelho? [SIM/NÃO]
- Mensagem: [TRECHO, SE HOUVER]

3. GET /api/patients/[id]?config=true:
- Status: [VALOR]
- Quantidade de trainingPlans: [VALOR]
- Campo exercises do primeiro plano: [LISTA / [] / AUSENTE]

Não corrigi nem salvei novamente o plano.
Pode localizar a causa raiz e propor a correção mínima.
Não iniciar T1 ainda.
