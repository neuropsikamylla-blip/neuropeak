# Jogo das Torres — plano técnico do épico

> Documento **meu** (Claude), 31/ago/2026. A fonte da verdade do que se quer é
> `ESPEC-JOGO-DAS-TORRES-KAMYLLA-20260831.md`, escrito por ela. Aqui ficam: o que o código tem
> hoje, os achados técnicos que a espec não podia prever, o fatiamento e as decisões que ainda
> dependem dela.

## 1. Ponto de partida (código real, medido hoje)

`components/exercises/executive/TorreHanoi.tsx` + `lib/torre-hanoi.ts` (v3.0.0):

- Só existe o **Tipo A** da espec: todos os discos na haste 0, alvo fixo na haste 2.
- `optimalMoves(n) = 2^n − 1`, e `initialDiscs = min(max(3, floor(d*0.4)+2), 8)`; `MAX_DISCS = 8`.
- Sucesso = `moves <= optimal` **e** `restarts === 0` (`julgarPuzzle`); ótimo sobe um disco.
- A tela exibe **"Movimentos"** e **"Mínimo"** lado a lado durante a execução, e ao resolver
  mostra "Você pode fazer em X movimentos — tente de novo!".
- Botão **Reiniciar** existe desde a v3.0.0, com 2 usos por puzzle; grava `restarts` e
  `puzzlesComReinicio` no metadata.
- A sessão só chega ao banco em `onComplete`, isto é, **só quando a sessão inteira termina**.
- Evidência do banco (31/ago): **nenhuma sessão de `torre-hanoi` registrada**, contra 72 sessões
  de 21 outros exercícios entre 02/jun e 25/ago. Ninguém concluiu a Torre pelo app — o que é
  coerente com a queixa que ela relatou (63 movimentos no mínimo aos 6 discos) e com a seção 29
  da espec: hoje o abandono não deixa rastro.

## 2. Achados técnicos que a espec não podia prever

### 2.1 O mínimo teórico deixa de ser uma fórmula

`2^n − 1` só vale para o Tipo A (torre completa numa haste → outra haste). Para os Tipos B, C e D
(destino variável, configuração inicial variável, configuração-alvo arbitrária) esse número
**está errado**, e usá-lo produziria eficiência falsa — corrompendo o índice da seção 10.

**Solução, e ela é barata:** com 3 hastes e `n` discos, o espaço de estados tem exatamente `3^n`
posições (3 discos = 27; 4 = 81; 5 = 243; 6 = 729; 7 = 2.187). Uma **busca em largura** sobre esse
grafo dá o mínimo EXATO entre quaisquer duas configurações, em milissegundos, e de quebra:
- prova que existe solução (o grafo é conexo, mas a BFS confirma caso a caso);
- valida a configuração (nenhum disco maior sobre menor);
- permite pré-calcular e congelar o banco de problemas da seção 42.

Isto vira `lib/torres/` com funções puras testáveis. É a peça que destrava os Tipos B–E.

### 2.2 "Corrigir sem reiniciar" (seção 5) provavelmente não precisa de botão

Na Torre, desfazer já é possível **sem nenhuma funcionalidade nova**: basta mover o disco de
volta, o que as regras permitem. A seção 33 pede registrar padrões de reversão (A→B, B→C, C→B) —
isso são movimentos normais, não um `undo`. Um botão "desfazer" traria dois problemas: baratearia
a correção (o custo de refazer é parte do monitoramento) e criaria um caminho que não existe no
tabuleiro real. **Proposta: não construir botão de desfazer; construir o REGISTRO de reversões.**

### 2.3 Registrar abandono mexe no banco

A seção 29 pede status por tentativa (INICIADO / CONCLUÍDO / REINICIADO / ABANDONADO /
INTERROMPIDO). Hoje `Session` só nasce no `onComplete`. Isso exige gravar antes do fim — tabela
nova ou coluna nova.

⚠️ **Regra da casa (CLAUDE.md):** o projeto está em **Supabase Free, sem backup automático e sem
PITR**. Tabela nova ou coluna opcional é **nível 1** (backup + validação do arquivo) pelo
procedimento de `docs/operacao/backup-procedimento.md`. Nada de `db push` antes disso.

### 2.4 A v3.0.0 é parcialmente revogada por esta espec

Feito hoje de manhã, antes da espec chegar: reinício custa o "ótimo" e o limite é 2 por puzzle.
As seções 9 e 12 dizem o contrário — o mínimo exato deixa de ser critério rígido, e a progressão
passa a considerar eficiência, reinícios, tempo e consistência. **A regra `restarts === 0` sai**
quando a fatia 2 entrar. Não é retrabalho perdido: o botão, o registro de reinícios e o teste
continuam valendo.

## 3. Fatiamento proposto (ordem da seção 59 dela)

| # | Fatia | Prioridade dela | Risco | Toca banco? |
|---|---|---|---|---|
| 1 | Tela para de expor mínimo e contador na execução; conclusão sem cobrança | 1 e 6 | baixo | não |
| 2 | Eficiência (seção 10) + faixas (11) + progressão sem mínimo exato (12–13) | 4 | médio | não |
| 3 | Reinício registra momento, movimentos e tempo; movimentos totais × da solução final | 2 e parte da 8 | baixo | não |
| 4 | Segunda tentativa opcional, com comparação entre tentativas | 7 | médio | não |
| 5 | `lib/torres/` com BFS + banco de problemas + Tipos A–E + fases | 5 | **alto** | não |
| 6 | Registro de tentativa iniciada/abandonada | 3 | **alto** | **sim — nível 1** |
| 7 | Relatório do profissional (seções 55–57) | — | médio | não |

Cada fatia termina com prova rodada e commit próprio. A fatia 5 é a maior e provavelmente se
subdivide (motor → banco de problemas → integração na tela).

## 4. Decisões que ainda dependem dela

1. **O limite de 2 reinícios continua?** A espec nova não menciona limite: a seção 4 pede
   registrar, e a 13 usa "poucos reinícios" como critério de progressão — ou seja, o reinício
   passa a ser lido no desempenho, não travado. Se for assim, o limite sai e o botão fica livre.
2. **O contador de movimentos some mesmo durante a execução?** A seção 3 diz "sugiro NÃO mostrar
   permanentemente" — é sugestão, não ordem. Sumir por completo é o mais fiel ao princípio;
   confirmar.
3. **Teto de discos.** A seção 37 diz 5 ou 6, e "não colocar 7 na progressão rotineira". Hoje o
   teto é 8. Proposta: **teto 5** nas fases 1–5 e 6 apenas na fase 6, deixando a dificuldade
   crescer pela configuração.
4. **Botão de desfazer:** confirmar a proposta 2.2 (não construir).

## 5. Princípios que atravessam todas as fatias

- **Sai o carimbo, nunca a medida** (regra dela de 31/ago, já aplicada em 6 exercícios): o app
  não comenta o que o paciente deixou de fazer, mas o dado continua gravado.
- **Depois da instrução, nenhuma dica** (regra de 01/ago): nada na tela entrega a estratégia.
- **Sem conclusão automática para o profissional** (seção 57): dados, nunca interpretação.
- **Nada de configuração aleatória sem validação** (seção 43): tudo pré-calculado e provado.
