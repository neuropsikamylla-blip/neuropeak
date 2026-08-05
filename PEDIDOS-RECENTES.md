# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 16:15
Autorizo executar apenas as três consultas de diagnóstico, em modo estritamente somente leitura, pelo SQL Editor do Supabase.

Objetivo:

- identificar quantas Sessions foram criadas durante a janela do incidente;
- identificar quais pacientes e exercícios foram afetados;
- comparar essas Sessions com os respectivos ExerciseConfig;
- calcular apenas os valores que seriam candidatos à reparação.

Regras obrigatórias:

1. Executar somente comandos SELECT.

2. Não executar:
- UPDATE;
- INSERT;
- DELETE;
- UPSERT;
- ALTER;
- CREATE;
- DROP;
- TRUNCATE;
- DO blocks;
- funções que produzam escrita;
- tabelas temporárias persistentes;
- qualquer correção automática.

3. Antes de executar, mostre as três consultas SQL completas para revisão.

4. Utilizar como janela exata do incidente:
- início: 04/08/2026 às 23:46;
- fim: 05/08/2026 às 15:51;
- confirmar antes qual timezone está armazenado no banco e converter corretamente para UTC, se necessário.

5. A saída deve informar, sem expor dados pessoais desnecessários:
- quantidade total de Sessions na janela;
- quantidade de pacientes afetados;
- quantidade de exercícios afetados;
- patientId e exerciseId apenas quando necessários para o reparo;
- total de sessões por paciente e exercício;
- estado atual do ExerciseConfig;
- totalAttempts atual;
- lastAttemptAt atual;
- currentDifficulty atual;
- valor proposto de totalAttempts;
- valor proposto de lastAttemptAt;
- metadata disponível para reconstrução de currentDifficulty;
- existência ou ausência de ExerciseConfig.

6. Para currentDifficulty:
- não propor inferência genérica;
- usar somente metadata explícito, como meta.nextLevel ou meta.endedLevel, quando houver garantia de qual campo representa o valor que deveria ter sido persistido;
- nos demais exercícios, marcar como “não reconstruir automaticamente”.

7. Não mostrar nomes, e-mails ou outros dados identificáveis na resposta. Use apenas IDs técnicos e contagens.

8. Depois das consultas, apresente:
- os resultados agregados;
- a lista exata de registros potencialmente reparáveis;
- quais campos podem ser reconstruídos com segurança;
- quais devem permanecer intocados;
- o SQL de reparação apenas como proposta, sem executar.

9. A T1 continua parada.

10. Nenhuma escrita poderá ocorrer antes de:
- backup lógico validado;
- restauração de teste;
- minha aprovação explícita do SQL final.

Pode preparar agora as consultas SELECT e apresentá-las antes da execução.

## 05/08/2026 16:17
Vamos usar o caminho (a): executarei as consultas pelo SQL Editor do Supabase.

Antes disso, corrija a consulta 2 para tratar ExerciseConfig ausente.

Onde está:

c."totalAttempts" + count(*) AS attempts_proposto

utilize:

COALESCE(c."totalAttempts", 0) + count(*) AS attempts_proposto

E, para facilitar a leitura, apresente também:

COALESCE(c."totalAttempts", 0) AS attempts_base

Mantenha `attempts_atual` como o valor real do banco, inclusive NULL quando a configuração não existir.

Depois me devolva as três consultas finais completas e prontas para copiar, sem nenhuma instrução de escrita.

Não executar UPDATE, INSERT, DELETE ou qualquer alteração.

## 05/08/2026 16:24
Prefiro executar a auditoria pelo terminal utilizando a DATABASE_URL já configurada no projeto.

Crie um script temporário de diagnóstico (somente leitura), sem modificar nenhum dado.

Requisitos:

- utilizar Prisma;
- executar exatamente as três consultas de auditoria;
- somente SELECT;
- nenhuma escrita;
- nenhum UPDATE, INSERT, DELETE, ALTER, CREATE ou DROP;
- imprimir os resultados de forma organizada no terminal;
- não depender do SQL Editor do Supabase;
- após a auditoria, deixar o script fora do código de produção (ou em scripts/diagnostics).

Execute o script localmente e me apresente os resultados.
