# C6 — Contextos novos: a lista do que precisa ser decidido

> Fase 1 do cronograma, terceira fatia. Escrito em 22/set/2026.
> **Como usar:** responda os blocos **A** a **F**. Só o bloco A é bloqueante — os outros eu proponho
> e você aprova ou corrige. Onde houver recomendação, ela está marcada.

---

## Por que isto precisa de você, e não é só trabalho meu

Nos contextos anteriores eu sempre medi a viabilidade **antes** de construir. Aqui **não dá**: o
mercado tem 73 produtos com dados lidos das embalagens reais; cardápio, cinema, viagem e agenda
**não existem**. Não há o que medir até existirem.

E o risco não é técnico, é clínico: um cardápio com pratos implausíveis, ou horários de cinema que
não batem com a realidade, vira um exercício que **ensina errado** sobre o mundo funcional — que é
justamente o que este exercício treina. Isso você vê em 30 segundos e eu não vejo nunca.

---

## BLOCO A — o único bloqueante: quais contextos, em que ordem

Você listou sete na espec: **cardápio · cinema · viagem/transporte · agenda · loja · eventos ·
farmácia**.

**Recomendo começar por três**, não pelos sete:

| ordem | contexto | por que este |
|---|---|---|
| 1º | **Cardápio** | atributos numéricos e categóricos ricos (preço, tempo de preparo, tamanho, vegetariano) — sustenta as 6 operações sem esforço |
| 2º | **Cinema** | introduz **horário**, que é um tipo de dado novo e abre perguntas que o mercado não permite ("depois das 18h") |
| 3º | **Viagem** | combina horário **e** duração, a combinação mais exigente |

**Deixaria para depois:** agenda (muito parecida com viagem em estrutura), loja (muito parecida com
mercado), eventos (parecido com cinema) e **farmácia** — esta última porque exige cuidado extra para
não parecer orientação de dose, e o ganho clínico é o menor dos sete.

👉 **Preciso de você:** confirma os três? Troca algum? Quer os sete de uma vez?

---

## BLOCO B — os atributos de cada contexto

Você já os definiu na espec. Transcrevi e marquei onde tenho dúvida:

**CARDÁPIO** — prato · preço · tamanho · ingredientes · tempo de preparo · opção vegetariana ·
acompanhamento
- ⚠️ "tamanho" é porção (individual/para dois) ou gramatura? *Recomendo porção* — é o que se lê num
  cardápio de verdade.

**CINEMA** — filme · horário · sala · duração · classificação · idioma
- ⚠️ "idioma" seria dublado/legendado? *Recomendo sim* — é a leitura real.

**VIAGEM** — destino · horário de saída · duração · plataforma · companhia · preço
- ⚠️ ônibus, trem ou avião? *Recomendo ônibus rodoviário* — é o mais familiar e o mais funcional
  para o público adulto brasileiro.

👉 **Preciso de você:** os três ⚠️ acima, e se falta algum atributo que você usaria na vida real.

---

## BLOCO C — o conteúdo pode ser fictício?

Regra que já vale no projeto: **marca real não entra**. Os produtos do mercado usam marcas
inventadas ("Fazenda Boa", "Vida Leve").

Para os contextos novos isso significa:
- **filmes**: títulos inventados, plausíveis, sem franquia real;
- **destinos**: cidades **reais** (São Paulo, Curitiba) — são geografia, não marca;
- **companhias de ônibus**: inventadas;
- **pratos**: comida comum brasileira, sem nome de restaurante real.

👉 **Preciso de você:** concorda? Algum caso em que prefere o real?

---

## BLOCO D — o que aparece na tela

Hoje cada opção tem **foto do produto** com fundo transparente. Cardápio, cinema e viagem não têm
"foto" natural — um filme não é um objeto.

**Recomendo: desenhar o material em HTML/CSS**, não gerar imagem.

| | imagem gerada | HTML/CSS |
|---|---|---|
| legibilidade no celular | piora ao reduzir | **sempre nítida** |
| "Ampliar" funciona | sim | **sim, e melhor** |
| custo para criar/alterar | alto, uma a uma | **baixo, é template** |
| acessibilidade | nenhuma | **texto real, selecionável** |
| parece o material de verdade | depende | **sim** — um cardápio é tipografia mesmo |

Isso também resolve de graça a sua §6 (*"não criar dificuldade por baixa legibilidade"*).

👉 **Preciso de você:** aprova o HTML/CSS? Ou quer ver um protótipo dos dois antes de decidir?

---

## BLOCO E — quantos conjuntos, e em que nível entram

**Recomendo começar com 2 conjuntos por contexto**, de 5 a 6 itens cada.

Por que pequeno: você mesma escreveu *"prefiro menos conjuntos bem validados a centenas
repetitivos"*. E porque erro de conteúdo em 6 itens custa minutos para corrigir; em 60, custa uma
sessão inteira.

**Nível de entrada:** recomendo **do 3 em diante**, mantendo os níveis 1-2 só no mercado — nos
primeiros níveis o paciente ainda está aprendendo a mecânica, e trocar de contexto ali soma carga
que não é o alvo.

👉 **Preciso de você:** 2 conjuntos de 5-6 itens está bom? O nível 3 é a entrada certa?

---

## BLOCO F — o que eu entrego para você conferir, antes de qualquer código

Ao receber suas respostas, eu monto e te mostro, **por contexto**:

1. **A tabela de dados** dos 2 conjuntos — todos os itens com todos os atributos, em texto, para você
   ler como leria um cardápio de verdade;
2. **Uma pergunta de cada operação** gerada sobre esses dados (busca, comparação, dois critérios,
   filtro+comparação, exclusão), para você ver se soa natural;
3. **A medição de viabilidade**: quantas questões de cada operação o conjunto sustenta — se algum
   atributo não sustentar nada, é melhor saber antes;
4. **Um desenho da tela** com o material, para o bloco D.

Só depois disso eu implemento.

---

## O que NÃO precisa de você

Estas eu resolvo e te conto depois: a abstração de tipo que permite contextos diferentes conviverem;
onde o contexto entra no sorteio de operação; a anti-repetição passando a considerar contexto; e a
migração do mercado atual para o modelo novo **sem tocar nos 73 produtos**.
