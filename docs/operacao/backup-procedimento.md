# Procedimento de backup do banco — Supabase Free

> **NADA EXECUTADO.** Nenhum comando rodado, nenhum acesso ao banco, nenhum `db push`.
> Documento operacional para validação dela.

## 0. Por que este documento existe

Confirmado por ela em 04/ago/2026: o projeto está no **Supabase Free**, **sem backups automáticos** e
**sem PITR**.

⚠️ **Não existe rede de segurança.** Se um `db push` corromper ou apagar dado clínico, **não há de
onde restaurar**. O backup lógico manual deixa de ser boa prática e passa a ser a **única** forma de
recuperação.

## 1. Resumo da decisão

**Padrão do projeto: `pg_dump` em formato `custom`, pela conexão direta (porta 5432), com o cliente
PostgreSQL instalado via Homebrew.** A comparação com Supabase CLI, Dashboard e Docker, e a
justificativa técnica, estão na seção 4.

### 1.1 ⚠️ Duas armadilhas que quebram o `pg_dump` no Supabase

**a) Conexão direta, não pooler.** O Supabase oferece duas strings:

- **pooler** (porta `6543`, PgBouncer) — **`pg_dump` NÃO funciona aqui.** O PgBouncer em modo
  transaction não suporta os comandos que o dump precisa;
- **direta** (porta `5432`) — **é esta.** É a que o projeto já chama de `DIRECT_URL`.

**b) Versão do cliente ≥ versão do servidor.** Um `pg_dump` mais antigo que o servidor falha com
`server version mismatch`. Cliente **mais novo** que o servidor funciona — daí a escolha de instalar
a versão mais alta (seção 4.3).

## 2. Credenciais necessárias

| Credencial | Para quê |
|---|---|
| **Host** do banco | ex.: `db.<ref>.supabase.co` |
| **Porta** | **`5432`** (direta), nunca `6543` |
| **Database** | normalmente `postgres` |
| **Usuário** | normalmente `postgres` |
| **Senha** do banco | definida na criação do projeto |

⚠️ **A senha do banco NÃO é a senha da conta Supabase.** Se ela foi perdida, é possível **redefinir**
no painel — mas isso **invalida a string atual** e exige atualizar `DATABASE_URL`/`DIRECT_URL` na
Vercel, ou o app cai.

⛔ **Nunca** colar a senha no chat, em arquivo versionado, em commit ou em histórico de shell.

## 3. Onde localizar no painel do Supabase

1. **Connection string:** Project → **Settings** → **Database** → **Connection string** → aba
   **URI**. Escolher **Direct connection** (porta 5432), **não** "Transaction pooler".
2. **Versão do PostgreSQL:** Project → **Settings** → **Infrastructure** (ou **Database** →
   *Postgres version*). **Anotar** — define qual cliente instalar.
3. **Senha:** Settings → Database → **Reset database password**, se necessário.

## 4. As quatro alternativas — comparação e escolha

⚠️ **Verificado nesta máquina:** `pg_dump`, `psql`, `pg_restore`, Supabase CLI e Docker **não estão
instalados**. Homebrew está (6.0.14), com fórmulas de PostgreSQL 12 a 18. Qualquer caminho exige um
passo de instalação.

### 4.1 Comparação

| Critério | **pg_dump (Homebrew)** | Supabase CLI | Dashboard Free | Docker |
|---|---|---|---|---|
| Instalação | `brew install` | `brew install` | nada | Docker Desktop (~1 GB, GUI) |
| Camadas até o banco | **1 — direto** | 2 — wrapper sobre pg_dump | — | 2 — container |
| Formato | **custom, comprimido** | SQL puro | CSV por tabela | custom |
| Restauração seletiva | ✅ | ❌ | ❌ | ✅ |
| Schema + constraints + índices | ✅ | ✅ | ❌ **perde tudo** | ✅ |
| Exige login/link no projeto | não | **sim** (`login` + `link`) | sim | não |
| Casamento de versão | resolvido instalando a mais alta | abstraído | — | trocar a tag |
| Dependência externa | nenhuma | pode exigir Docker | — | Docker sempre |
| Estabilidade do comando | **alta** | muda entre versões do CLI | — | alta |

### 4.2 Por que `pg_dump` é o padrão — critérios arquitetônicos

A escolha **não** é sobre qual ferramenta é melhor. Todas as opções acima cumprem o papel a que se
propõem, e a Supabase CLI é uma ferramenta oficial e competente. A escolha é sobre qual delas dá ao
projeto um **procedimento estável de longo prazo**.

| Critério arquitetônico | Por que decide |
|---|---|
| **Ferramenta oficial do PostgreSQL** | mantida pelo mesmo projeto que mantém o banco; o formato do dump acompanha o próprio PostgreSQL |
| **Independe do fornecedor** | não pressupõe Supabase, conta, projeto vinculado nem API de terceiro |
| **Amplamente documentada** | documentação oficial estável há décadas, com material abundante fora da documentação do fornecedor |
| **Sobrevive à troca de hospedagem** | se o banco sair do Supabase — outro provedor, servidor próprio — **o procedimento continua idêntico** |
| **Estável no tempo** | as opções de linha de comando praticamente não mudam entre versões; um procedimento escrito hoje segue válido daqui a anos |

**O critério decisivo é a independência de fornecedor.** Um procedimento de backup é justamente o
que precisa funcionar quando algo sai do esperado — inclusive a relação com o provedor. Ancorar a
recuperação do dado clínico numa ferramenta específica de um fornecedor cria uma dependência no
ponto do sistema onde ela é menos aceitável.

**Consequência prática:** este documento continua válido sem reescrita se o projeto migrar de
hospedagem. Só mudam host, porta e credencial.

### 4.3 Sobre as demais opções

**Supabase CLI** — ferramenta oficial do fornecedor, adequada para quem trabalha inteiramente dentro
do ecossistema. Não é o padrão aqui apenas pelo critério de independência acima. Permanece uma
alternativa legítima caso a equipe prefira, desde que se mantenha a validação do arquivo gerado.

**Docker** — resolveria bem o casamento de versão entre cliente e servidor, bastando trocar a tag da
imagem. Não é o padrão porque exige instalar e manter o Docker Desktop para um comando ocasional.
Continua sendo uma boa saída se, no futuro, a versão do servidor passar da mais alta disponível no
Homebrew.

**Exportação pelo Dashboard (Free)** — o que o plano Free oferece é exportar CSV por tabela, no Table
Editor. Isso serve para inspecionar dados, mas **não constitui backup**: não preserva schema,
constraints, índices, tipos nem relações, e não garante consistência entre tabelas exportadas em
momentos diferentes. Não pode ser usado como fonte de restauração.

### 4.4 ✅ Padrão do projeto

**`pg_dump` em formato `custom`, pela conexão direta (porta 5432), com o cliente PostgreSQL instalado
via Homebrew na versão mais alta disponível.**

O formato `custom` acrescenta três capacidades que o procedimento usa: validar o arquivo sem
restaurar (`pg_restore --list`), restaurar uma tabela isolada e restaurar em paralelo.

**Sobre a versão:** instalar a mais alta (`postgresql@18`) resolve o casamento de versão de forma
duradoura — um `pg_dump` mais novo que o servidor funciona; o inverso é que falha. Assim o
procedimento sobrevive às atualizações do PostgreSQL no provedor sem exigir reinstalação.

## 5. Procedimento padrão — reutilizável em toda alteração de schema

> Este é **o** procedimento do projeto. Vale para a T1 e para qualquer alteração futura.

### 5.0 Instalação — uma vez só

```bash
brew install postgresql@18
echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
pg_dump --version     # confirmar que responde
```

### 5.1 Credencial — uma vez só

```bash
# ~/.pgpass, uma linha, permissão 600. A senha NUNCA vai na linha de comando.
#   db.<ref>.supabase.co:5432:postgres:postgres:<senha>
chmod 600 ~/.pgpass
```

### 5.2 Gerar o backup — antes de cada alteração

```bash
BACKUP="$HOME/backups-neuropeak/neuropeak-$(date +%Y%m%d-%H%M%S).dump"
mkdir -p "$(dirname "$BACKUP")"

pg_dump \
  --host=db.<ref>.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-acl \
  --verbose \
  --file="$BACKUP"

echo "exit=$?"        # tem de ser 0 — medir SEM pipe
ls -lh "$BACKUP"
```

**Por que cada opção:** `--format=custom` dá restauração seletiva e validação sem restaurar ·
`--no-owner --no-acl` evita erro de permissão ao restaurar em projeto novo, onde os papéis do
Supabase diferem · `--verbose` mostra tabela a tabela, revelando se parou no meio · destino **fora do
repositório**, porque o dump contém dado clínico de paciente.

⚠️ **Porta 5432, conexão direta.** Pela porta 6543 (pooler) o `pg_dump` **não funciona**.

⚠️ **Medir o exit code sem pipe.** `pg_dump ... | tail` devolve o código do `tail`.

## 6. Validar o backup

Um arquivo criado **não** é um backup válido. Três checagens:

```bash
# 5.1 — Existe, tem tamanho plausível (não alguns bytes):
ls -lh "$BACKUP"

# 5.2 — É legível e contém as tabelas esperadas:
pg_restore --list "$BACKUP" | grep -E "Patient|Session|ExerciseConfig|TrainingPlan|User"

# 5.3 — Contagem de objetos:
pg_restore --list "$BACKUP" | grep -c "TABLE DATA"
```

**Critério de aceite:** `pg_restore --list` roda sem erro **e** mostra `Patient`, `Session`,
`ExerciseConfig`, `TrainingPlan` e `User`.

⚠️ **A única validação que prova de verdade é restaurar.** Ver 7.2 — restauração de teste num banco
descartável. **Sem isso, o backup é uma esperança, não uma garantia.**

## 7. Restaurar

### 7.1 Restauração real (emergência)

```bash
# Em banco VAZIO. Se o banco tiver dados, --clean --if-exists APAGA antes.
pg_restore \
  --host=db.<ref>.supabase.co --port=5432 \
  --username=postgres --dbname=postgres \
  --no-owner --no-acl \
  --clean --if-exists \
  --verbose \
  "$BACKUP"
```

⛔ **`--clean` derruba objetos existentes.** Em emergência real é o desejado; fora dela, é
destrutivo. **Nunca rodar sem confirmação explícita dela.**

### 7.2 Restauração de teste — o que valida de verdade

```bash
# Num PostgreSQL LOCAL, jamais no Supabase:
brew services start postgresql@17
createdb neuropeak_teste
pg_restore --dbname=neuropeak_teste --no-owner --no-acl --verbose "$BACKUP"

psql -d neuropeak_teste -c 'SELECT count(*) FROM "Patient";'
psql -d neuropeak_teste -c 'SELECT count(*) FROM "Session";'
psql -d neuropeak_teste -c 'SELECT count(*) FROM "ExerciseConfig";'
```

**Comparar com as contagens de produção.** Iguais → backup confiável. Só então prosseguir.

## 8. Limitações deste backup, comparado ao Pro

| | Manual (Free) | Automático (Pro) |
|---|---|---|
| Frequência | **só quando alguém roda** | diário |
| **PITR** | ❌ não existe | ✅ até 7 dias, por segundo |
| Perda máxima | **tudo desde o último dump** | minutos |
| Retenção | o que o disco guardar | gerenciada |
| Restaurar | manual, com downtime | pelo painel |
| Depende de | alguém lembrar | ninguém |
| Storage/Auth | ❌ **não incluídos** | incluídos |

⚠️ **Três limitações que importam clinicamente:**

1. **Janela de perda.** Backup de hoje 14h, incidente às 18h → **as sessões das 4 horas se perdem**.
   Em plataforma de treino, é treino de paciente que desaparece.
2. **Só o banco.** `pg_dump` **não** cobre Storage, Auth nem Edge Functions. Se houver arquivo em
   Storage, ele não está no dump.
3. **Depende de disciplina humana.** Um backup que ninguém roda não existe.

## 9. Risco de `prisma db push` em vez de migrations

**Sim, há riscos específicos — e são maiores sem backup automático.**

| Risco | Com `db push` | Com `migrate` |
|---|---|---|
| Histórico do que mudou | ❌ nenhum | ✅ arquivos versionados |
| Reverter | ❌ manual | ✅ `migrate resolve` |
| Detectar drift | parcial | ✅ explícito |
| Perda de dado silenciosa | ⚠️ **possível** | avisa e exige confirmação |
| **Objetos fora do schema** | ⚠️ **pode remover** | mesmo risco |

⚠️ **O risco concreto e já documentado neste projeto:** as três CHECK de `Session` **não estão no
`schema.prisma`** e **um `db push` pode removê-las** (RUNBOOK, SCHEMA-01). Sem elas, o banco aceita
`score = 500` ou `accuracy = 7` — dado clínico inválido, gravado em silêncio.

⚠️ **`db push` com `--accept-data-loss`** aplica alterações destrutivas sem perguntar. **Nunca usar.**

**Mitigação nesta operação** — já no plano de implantação:

1. `prisma migrate diff --script` **antes**, para ver o SQL exato;
2. parar se aparecer `DROP` ou `ALTER COLUMN` inesperado;
3. reaplicar as CHECK **imediatamente** depois;
4. conferir constraints antes e depois.

**Recomendação de médio prazo:** migrar para `prisma migrate`. Não agora — é mudança de processo, e
esta operação já tem risco suficiente.

## 10. Política permanente de backup — dois níveis de risco

**Sim, o backup passa a ser obrigatório** enquanto o projeto não tiver backup automático. Mas a
exigência é **proporcional ao risco da alteração**: exigir restauração de teste para acrescentar uma
coluna opcional tornaria a regra pesada a ponto de ser contornada — e regra contornada não protege
ninguém.

### 10.1 Nível 1 — alterações aditivas de baixo risco

**O que é:** novas colunas **opcionais** · novos índices · novos enums · novas tabelas **sem migração
de dados**.

**Por que o risco é baixo:** nada existente é reescrito ou removido. Uma coluna opcional nasce `NULL`
em todas as linhas; um índice não altera dado; uma tabela nova não toca as antigas. O pior caso
realista é a alteração falhar e não ser aplicada.

**Obrigatório:**

- [x] **backup lógico imediatamente anterior** à alteração;
- [x] **validação da integridade do arquivo** (`pg_restore --list` mostrando as tabelas esperadas).

**Não obrigatório:** restauração de teste.

> A **Fase T1** se enquadra aqui: três colunas opcionais e um enum novo, sem migração de dado.

### 10.2 Nível 2 — alterações destrutivas ou com migração de dados

**O que é:** `DROP` de tabela, coluna ou constraint · `ALTER COLUMN` · remoção de colunas · conversão
de tipos · `UPDATE`/`DELETE` em massa · migração de dados existentes.

**Por que o risco é alto:** dado existente é reescrito ou eliminado. Um erro aqui **não se percebe
imediatamente** e pode ser irreversível — e, sem backup automático, irreversível é literal.

**Obrigatório:**

- [x] **backup lógico imediatamente anterior**;
- [x] **validação da integridade do arquivo**;
- [x] **restauração de teste em banco local**, com contagens conferidas contra produção **antes** de
      tocar em produção.

> ⚠️ O **backfill da T1** é `UPDATE` em massa e se enquadra **aqui**, não no nível 1. Mesmo sendo
> idempotente e tocando só colunas novas, é escrita em massa sobre linhas existentes.

### 10.3 Como classificar quando houver dúvida

**Na dúvida, nível 2.** E há um teste objetivo: rodar
`prisma migrate diff --from-url … --to-schema-datamodel … --script` e ler o SQL gerado.

- só `CREATE TABLE`, `CREATE INDEX`, `CREATE TYPE`, `ADD COLUMN` (nullable) → **nível 1**;
- qualquer `DROP`, `ALTER COLUMN`, `NOT NULL` em coluna existente, ou `UPDATE`/`DELETE` → **nível 2**.

### 10.4 Fora da política

Deploy de código **sem** mudança de schema · leitura · uso normal da aplicação. Nada disso exige
backup.

### 10.5 A alternativa que dispensa a política

**Supabase Pro** (~US$25/mês) traz backup diário automático e PITR de 7 dias. Considerando que o
banco guarda **histórico clínico de pacientes reais** e que hoje **não existe recuperação possível**,
é decisão dela — mas convém dizer com clareza: com backup manual, uma falha às 18h com dump das 14h
**perde quatro horas de treino de paciente**, e isso não se recupera.

## 11. Ordem recomendada, quando ela autorizar

```
1. Descobrir a versão do PostgreSQL no painel        (item 3)
2. brew install postgresql@<versão>                  (item 4.0)
3. Configurar ~/.pgpass com chmod 600                (item 4.1)
4. Rodar o pg_dump                                   (item 4.1)
5. Validar com pg_restore --list                     (item 5)
6. Restauração de TESTE em banco local               (item 6.2)  ← só aqui o backup é confiável
7. ─── só então ─── seguir o plano de implantação da T1
```

⚠️ **O passo 6 é o que separa um arquivo de um backup.** Pular é aceitar não saber se a rede existe.

## 12. Checklist reutilizável — copiar a cada alteração de schema

> Vale para a T1 e para **toda** alteração futura. A instalação (5.0) e a credencial (5.1) são feitas
> uma única vez; o resto se repete.

```
ALTERAÇÃO: ______________________     DATA: ____________

[ ]  1. pg_dump --version responde                      (5.0, uma vez)
[ ]  2. ~/.pgpass com chmod 600                          (5.1, uma vez)
[ ]  3. Nenhum paciente treinando agora
[ ]  4. pg_dump rodado, exit 0                           (5.2)
[ ]  5. Arquivo existe e tem tamanho plausível           (6)
[ ]  6. pg_restore --list mostra as 5 tabelas            (6)
[ ]  7. NÍVEL 2 apenas: restauração de TESTE local       (7.2)
[ ]  8. NÍVEL 2 apenas: contagens do teste batem          (7.2)
     ─────────── só agora a alteração pode começar ───────────
[ ]  9. Constraints ANTES registradas
[ ] 10. prisma migrate diff --script conferido
        (parar se houver DROP ou ALTER COLUMN inesperado)
[ ] 11. Alteração aplicada
[ ] 12. As 3 CHECK de Session reaplicadas (difficulty 1–13)
[ ] 13. Constraints DEPOIS comparadas com as de ANTES
[ ] 14. Contagens clínicas inalteradas
[ ] 15. Caminho do backup anotado no PROGRESSO.md

BACKUP: ~/backups-neuropeak/____________________________
```

**Classificar antes de começar:** NÍVEL 1 (aditivo — coluna opcional, índice, enum, tabela nova) ou
NÍVEL 2 (destrutivo ou migração de dados). Ver seção 10. **Na dúvida, nível 2.**

⚠️ **Nos de nível 2, os passos 7 e 8 são o que separa um arquivo de um backup.** Pular é aceitar não
saber se a rede existe.

⚠️ **O passo 12 é o mais esquecível e o mais caro.** Sem as CHECK, o banco aceita `score = 500` e
`accuracy = 7` em silêncio. O teto de `difficulty` é **13**, não 10.

## 13. O que este documento NÃO faz

Não executa comando · não acessa o banco · não faz `db push` · não instala nada · não expõe
credencial.
