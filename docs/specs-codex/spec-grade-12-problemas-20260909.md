# Spec — Grade Dedutiva: os 12 problemas restantes e os travões de língua

Data: 2026-09-09
O gerador (v3.15.0) está pronto e provado com 4 problemas de nível 2. Falta o resto do seed bank.

⛔ **NÃO toque em `DeductiveGrid.tsx`.** A tela foi **aprovada por ela em 09/set** e há um contrato
em `lib/grade/contrato-tela-aprovada.test.ts` com 7 testes. Se um deles reprovar, **PARE e relate**.
⛔ **NÃO altere `selecionarProblema`** — a troca do banco é a fatia final.
⛔ **NÃO conserte os puzzles antigos**; o teste que afirma que eles reprovam continua valendo.

---

## 1. Primeiro: três travões de língua, que vêm ANTES dos temas

Na revisão dos 4 primeiros o VP achou **4 defeitos de português** que a régua não pega. Eles agora
viram **verificação automática**, para não dependerem de alguém ler 384 frases.

### 1.1 "Quem" só para pessoas

`Quem foi apresentado por Ciro é um Drama` tratava um **filme** como pessoa.

Acrescente a `GramaticaCategoria` um campo `animado: boolean`. Um `sujeito`/`referencia` que comece
com **"Quem"** só é válido se a categoria for `animado: true`. **Teste que rejeita** a violação.

### 1.2 Duas categorias nunca podem ter a MESMA forma de referência

`a oficina de Sol` (mediador) colidia com `a oficina de Marcenaria` (nome da oficina): mesma forma,
sentidos diferentes, e o paciente não tem como saber qual é qual.

Escreva `verificarAmbiguidadeDeReferencia(tema)`: para cada par de categorias, gere a `referencia`
de todos os valores e compare o **molde** — o texto com o valor substituído por um marcador. Dois
moldes iguais em categorias diferentes = **erro**, com as duas categorias nomeadas.
**Rode isso para TODOS os temas num teste**, incluindo os 4 que já existem.

### 1.3 Fusão de exclusões do mesmo sujeito

Hoje sai:
```
4. Quem usou a sala Névoa não é Décio nem Íris.
7. Quem usou a sala Névoa não é Décio nem Alice.
```
Repetitivo, e "não é Décio" aparece duas vezes. Um autor humano escreveria **uma** frase.

No gerador, **depois da minimização**: agrupe as pistas restantes cujas restrições sejam **todas
T2** e tenham o **mesmo `itemA`**, e funda-as numa pista só, deduplicando os `itemB` repetidos.
A pista fundida mantém **todas** as restrições atômicas (é para isso que a pista composta existe) e
o texto vira `{sujeito} não {pred1}, nem {pred2}, nem {pred3}.` — com vírgula a partir de três.

⚠️ **Funda somente depois de minimizar**, e **revalide** unicidade e régua depois de fundir. A fusão
não pode alterar a lógica: teste que `contarSolucoes` é idêntico antes e depois.

⚠️ A elisão de verbo (`elidirVerboRepetido`, já pronta) vale para cada parte: *"não é Décio, nem
Íris, nem Alice"* e *"não preparou o Gelado, nem o Espresso"*.

---

## 2. Os 12 temas

Regras que valem para todos, e que já custaram conserto:
- categorias **semanticamente independentes** — nada de oficina de Cerâmica com material Argila,
  senão o conhecimento de mundo substitui a dedução;
- **nenhuma categoria sequencial** (horas, números, ordinais): sequência conhecida é `rotulosPosicao`;
- `predicado` **começa com verbo** (é o que faz a negação ser prefixo);
- `animado: true` só em categorias de pessoa.

### Nível 3 — 4 posições × 4 categorias
**E. Consultório odontológico** — eixo `["8h","9h","10h","11h"]` · verbo `"foi atendido"`
`paciente` (Bento, Célia, Márcio, Tereza, **animado**) · `procedimento` (Canal, Clareamento, Extração, Limpeza) · `convenio` (Aurora, Bemviver, Consalud, Vitalis) · `dentista` (Dr. Elias, Dra. Norma, Dr. Paulo, Dra. Sônia, **animado**)

**F. Estandes da feira do livro** — eixo `["Estande 1","Estande 2","Estande 3","Estande 4"]` · verbo `"ficou"`
`editora` (Alaúde, Bordô, Chama, Duna) · `genero` (Ensaio, Infantil, Poesia, Romance) · `pais` (Chile, Egito, Irlanda, Japão) · `cor` (Azul, Ocre, Rubi, Verde)

**G. Consultas de nutrição** — eixo `["Segunda","Terça","Quarta","Quinta"]` · verbo `"veio"`
`cliente` (Alan, Diva, Rute, Vitor, **animado**) · `objetivo` (Desempenho, Digestão, Energia, Sono) · `plano` (Bronze, Prata, Ouro, Platina) · `bairro` (Alvorada, Boa Vista, Cruzeiro, Laranjeiras)

**H. Ensaios da orquestra** — eixo `["9h","11h","14h","16h"]` · verbo `"ensaiou"`
`naipe` (Cordas, Madeiras, Metais, Percussão) · `regente` (Ana Lúcia, Fábio, Marta, Sérgio, **animado**) · `peca` (Alvorada, Barcarola, Cortejo, Devaneio) · `sala` (Anexo, Concha, Estúdio, Foyer)

### Nível 4 — 5 posições × 4 categorias
**I. Atendimentos da fisioterapia** — eixo `["7h","8h","9h","10h","11h"]` · verbo `"foi atendido"`
`paciente` (Aline, Caio, Elza, Nuno, Wilma, **animado**) · `regiao` (Coluna, Joelho, Ombro, Punho, Tornozelo) · `recurso` (Bola, Elástico, Esteira, Halteres, Prancha) · `fisioterapeuta` (Dr. Ivo, Dra. Lúcia, Dr. Nei, Dra. Olga, Dra. Rita, **animado**)

**J. Turnos da recepção** — eixo `["Segunda","Terça","Quarta","Quinta","Sexta"]` · verbo `"trabalhou"`
`recepcionista` (Bia, Douglas, Kátia, Márcio, Zilda, **animado**) · `tarefa` (Agendamentos, Arquivo, Cobrança, Ligações, Triagem) · `andar` (Cobertura, Mezanino, Subsolo, Térreo, Sobreloja) · `uniforme` (Areia, Grafite, Marinho, Musgo, Vinho)

**K. Palestras do congresso** — eixo `["9h","10h30","13h","14h30","16h"]` · verbo `"palestrou"`
`palestrante` (Aurora, Ícaro, Solange, Teodoro, Yara, **animado**) · `tema` (Ansiedade, Linguagem, Memória, Sono, Vínculos) · `formato` (Debate, Mesa, Oficina, Painel, Roda) · `auditorio` (Bosque, Cristal, Lagoa, Pedra, Vento)

**L. Colheita da horta comunitária** — eixo `["Semana 1","Semana 2","Semana 3","Semana 4","Semana 5"]` · verbo `"colheu"`
`horta` (Beira-Rio, Encosta, Morro, Pomar, Várzea) · `cultivo` (Abóbora, Alface, Cenoura, Quiabo, Rúcula) · `responsavel` (Efigênia, Joel, Nadir, Sebastião, Vânia, **animado**) · `destino` (Creche, Escola, Feira, Hospital, Mercado)

### Nível 5 — 5 posições × 5 categorias
**M. Plantão do pronto-socorro** — eixo `["18h","20h","22h","0h","2h"]` · verbo `"atendeu"`
`medico` (Dr. Aldo, Dra. Bruna, Dr. Cássio, Dra. Dora, Dr. Elmo, **animado**) · `queixa` (Cefaleia, Fratura, Náusea, Tontura, Tosse) · `exame` (Ecografia, Eletro, Raio-X, Sangue, Urina) · `leito` (Amarelo, Branco, Cinza, Laranja, Roxo) · `encaminhamento` (Alta, Cirurgia, Internação, Observação, Retorno)

**N. Semana do restaurante** — eixo `["Segunda","Terça","Quarta","Quinta","Sexta"]` · verbo `"foi servido"`
`prato` (Bobó, Escondidinho, Moqueca, Risoto, Vatapá) · `chef` (Aparecida, Dionísio, Genoveva, Leandro, Otávio, **animado**) · `acompanhamento` (Chuchu, Farofa, Pirão, Salada, Vinagrete) · `sobremesa` (Cocada, Manjar, Pavê, Pudim, Quindim) · `sala` (Adega, Jardim, Mezanino, Terraço, Varanda)

**O. Trilhas do parque** — eixo `["Trilha 1","Trilha 2","Trilha 3","Trilha 4","Trilha 5"]` · verbo `"guiou"`
`guia` (Benedita, Firmino, Iolanda, Ubirajara, Zulmira, **animado**) · `bioma` (Campo, Cerrado, Mangue, Mata, Restinga) · `duracao` (Curta, Média, Longa, Extensa, Integral) · `atrativo` (Cachoeira, Gruta, Lago, Mirante, Ruína) · `nivel` (Fácil, Leve, Moderado, Difícil, Severo)

**P. Exposição do museu** — eixo `["Sala 1","Sala 2","Sala 3","Sala 4","Sala 5"]` · verbo `"foi exposta"`
`obra` (Aurora, Clepsidra, Estuário, Ninho, Vertigem) · `artista` (Anísio, Gilda, Hermínia, Rodolfo, Wanda, **animado**) · `tecnica` (Aquarela, Bronze, Gravura, Óleo, Têxtil) · `decada` (Cinquenta, Sessenta, Setenta, Oitenta, Noventa) · `doador` (Almeida, Barroso, Camargo, Dutra, Esteves)

⚠️ Se alguma concordância ficar torta ao montar as frases, **ajuste a gramática do tema** e diga no
relatório o que mudou. Português correto **com acentuação** é requisito.

---

## 3. Provas

```
npx tsc --noEmit          # exit 0
npm run test              # base: 74 arquivos / 976 testes — não pode cair
```
**NÃO rodar `npm run build`.** Se não conseguir rodar no lab por falta de `node_modules`, **declare**.

Testes obrigatórios:
- **os 16** (4 antigos + 12 novos) têm solução única, `validarPuzzle` nulo e **passam na régua**;
- `verificarAmbiguidadeDeReferencia` **reprova** um tema montado com duas categorias de mesmo molde,
  e **aprova** os 16 temas reais;
- "Quem" em categoria **inanimada** é rejeitado;
- a **fusão de exclusões** não muda a lógica: `contarSolucoes` idêntico antes e depois;
- uma fusão de **três** exclusões produz `não A, nem B, nem C.` com as vírgulas certas;
- a prova de texto do VP (`vp-prova-banco.test.ts`) passa para **todos** os níveis — generalize-a
  para varrer os 16, não só o nível 2.

## 4. Relatório

Quantas tentativas cada problema exigiu; a contagem de pistas e restrições de cada um; quantas
fusões aconteceram; qualquer ajuste de concordância; e **o texto completo das pistas dos 12 novos**.
