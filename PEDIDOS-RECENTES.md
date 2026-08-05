# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 05/08/2026 16:27
Mantenha o script versionado em scripts/diagnostics/.

Antes de encerrar:

1. Remova qualquer patientId ou dado específico eventualmente embutido no script.
2. Mantenha apenas a janela do incidente e consultas genéricas.
3. Confirme que nenhuma credencial, URL de banco ou conteúdo do .env foi gravado no arquivo ou no commit.
4. Adicione no cabeçalho:
   - finalidade;
   - data do incidente;
   - caráter somente leitura;
   - como executar;
   - que a saída pode conter IDs técnicos e não deve ser compartilhada publicamente.
5. Registre no PROGRESSO.md que:
   - a auditoria encontrou zero sessões afetadas;
   - não há reparação de dados a executar;
   - Sessions e ExerciseConfig estavam sincronizados;
   - a T1 pode ser retomada após o procedimento de backup.

Depois disso, encerre oficialmente o incidente e pare.

Não execute nenhum UPDATE.
Não proponha reparação.
Não iniciar ainda a T1 até eu autorizar o próximo passo.
