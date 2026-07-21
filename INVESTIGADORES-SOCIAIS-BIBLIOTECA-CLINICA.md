# Investigadores da Situação Social — Biblioteca Clínica (banco de dados)

> **Etapa 2.** Banco de dados clínico que alimenta o gerador de histórias do schema `SocialCase`
> (ver `INVESTIGADORES-SOCIAIS-SPEC.md`). **Não contém histórias nem narrativas** — apenas
> unidades reutilizáveis, tabeladas e com ID, para gerar centenas de casos com coerência e
> progressão cognitiva. Enums controlados: a IA de autoria escolhe **dentro** destas tabelas.

**Legenda de eixos** (usada nas colunas "Eixo"): `RE` reconhecimento emocional · `CX` leitura de
contexto · `TM` teoria da mente · `TP` tomada de perspectiva · `IN` inferência · `JS` julgamento
social · `RS` regras sociais · `FI` fato × interpretação · `RP` resolução de problema social.

**Legenda de placeholders** (Bib. 8): `{P}`/`{P2}` personagens · `{AMB}` ambiente · `{EMO}` emoção
· `{OBJ}` objeto · `{ACAO}` ação/evento · `{GRP}` grupo.

**Convenção de IDs:** `EMO-` emoção · `CUE-` pista · `RUL-` regra · `ENV-` ambiente · `CHR-`
personagem · `SIT-` situação · `INT-` intenção · `Q-` pergunta · `DIF-` dificuldade cognitiva ·
`IND-` indicador clínico. Todos estáveis e versionáveis.

---

## 1. Biblioteca de emoções

Campos: definição (operacional) · contexto típico · sinais possíveis (observáveis) · interpretações
equivocadas comuns. **Sinais são hipóteses, não certezas** (ver Bib. 2).

### 1.1 Básicas

| ID | Emoção | Definição | Contexto típico | Sinais possíveis | Interpretações equivocadas |
|---|---|---|---|---|---|
| EMO-B01 | Alegria | Estado positivo de satisfação/prazer | Conquista, reencontro, brincadeira | Sorriso com rugas nos olhos, riso, corpo expansivo, voz animada | Achar que quem sorri está sempre feliz; confundir sorriso social com alegria |
| EMO-B02 | Tristeza | Resposta a perda ou decepção | Perda, separação, fracasso | Cantos da boca para baixo, olhar baixo, ombros caídos, voz baixa, choro | Ler como raiva ou desinteresse; supor que silêncio = tristeza |
| EMO-B03 | Raiva | Resposta a obstáculo ou injustiça | Frustração, transgressão, provocação | Sobrancelhas franzidas, mandíbula tensa, tom elevado, gestos bruscos | Confundir assertividade com raiva; ver raiva onde há dor |
| EMO-B04 | Medo | Resposta a ameaça ou perigo | Novidade, risco, avaliação | Olhos arregalados, corpo recuado ou imóvel, voz trêmula | Interpretar como timidez ou desinteresse; achar que evitar = não querer |
| EMO-B05 | Surpresa | Reação breve ao inesperado (valência neutra) | Imprevisto, novidade | Sobrancelhas altas, boca aberta, inspiração, pausa | Ler como medo ou alegria sem checar o contexto |
| EMO-B06 | Nojo/Aversão | Rejeição a algo desagradável | Sabor/cheiro ruim, quebra de norma | Nariz franzido, lábio superior elevado, afastamento | Confundir com desprezo ou raiva |

### 1.2 Intermediárias (sociais, dependem de contexto/aprendizado)

| ID | Emoção | Definição | Contexto típico | Sinais possíveis | Interpretações equivocadas |
|---|---|---|---|---|---|
| EMO-I01 | Vergonha | Desconforto por falha própria exposta a outros | Erro público, crítica | Rubor, olhar desviado, cabeça baixa, encolher | Ler como desinteresse ou arrogância |
| EMO-I02 | Culpa | Percepção de ter causado dano ou violado um valor | Magoar alguém, quebrar combinado | Evitar olhar, pedir desculpas, corpo retraído | Confundir com medo de punição; ver culpa onde há discordância |
| EMO-I03 | Orgulho | Satisfação por conquista ou valor próprio | Sucesso, reconhecimento | Postura ereta, sorriso, peito aberto, queixo erguido | Interpretar como arrogância |
| EMO-I04 | Ciúme | Medo de perder alguém/algo para um terceiro | Atenção dividida, rival | Monitorar, irritação, insistência, retraimento | Confundir com raiva pura |
| EMO-I05 | Inveja | Desejo pelo que o outro tem | Comparação social | Comentários, desânimo, evitar o outro | Ler como antipatia gratuita |
| EMO-I06 | Frustração | Bloqueio de um objetivo | Tarefa difícil, plano falho | Suspirar, desistir, tensão, resmungar | Confundir com raiva dirigida a pessoas |
| EMO-I07 | Ansiedade | Antecipação apreensiva de algo futuro | Prova, avaliação, incerteza | Inquietação, fala acelerada, evitação | Ler como desinteresse ou má-vontade |
| EMO-I08 | Alívio | Cessação de tensão ou ameaça | Fim de perigo, boa notícia | Expiração, relaxar ombros, sorriso leve | Confundir com alegria plena |
| EMO-I09 | Gratidão | Reconhecimento por um benefício recebido | Ajuda, presente | Agradecer, sorriso, aproximação | Ver como obrigação social vazia |
| EMO-I10 | Entusiasmo | Energia positiva antecipatória | Expectativa boa | Fala rápida, gestos amplos, sorriso | Confundir com agitação/descontrole |
| EMO-I11 | Timidez | Desconforto em exposição social nova | Conhecer pessoas, falar em público | Falar baixo, evitar olhar, aproximar devagar | Ler como arrogância ou desinteresse |
| EMO-I12 | Irritação | Desconforto leve e contínuo | Incômodo repetido | Respostas curtas, suspiros, tensão leve | Confundir com raiva intensa |

### 1.3 Complexas (autoconscientes, mistas, exigem teoria da mente)

| ID | Emoção | Definição | Contexto típico | Sinais possíveis | Interpretações equivocadas |
|---|---|---|---|---|---|
| EMO-C01 | Constrangimento | Desconforto por situação social desajeitada (sem falha moral) | Gafe, atenção inesperada | Riso sem graça, rubor, cobrir o rosto | Ler como desrespeito |
| EMO-C02 | Decepção | Expectativa não correspondida por alguém/algo | Promessa quebrada | Desânimo, olhar baixo, silêncio, tom contido | Confundir com raiva ou frieza |
| EMO-C03 | Empatia | Sintonizar-se com o estado do outro | Alguém sofre ou celebra | Espelhar expressão, aproximar, oferecer apoio | Confundir com pena ou invasão |
| EMO-C04 | Compaixão | Empatia somada ao desejo de aliviar o sofrimento | Outro em dor | Acolher, tom suave, gesto de cuidado | Ler como superioridade |
| EMO-C05 | Admiração | Valorização de uma qualidade do outro | Feito notável | Atenção, elogio, tentar imitar | Confundir com inveja |
| EMO-C06 | Nostalgia | Saudade afetiva e agridoce do passado | Lembranças | Olhar distante, sorriso melancólico | Ler apenas como tristeza |
| EMO-C07 | Ambivalência | Emoções opostas ao mesmo tempo | Escolhas difíceis, despedidas felizes | Expressão mista, hesitação | Exigir uma emoção "única" |
| EMO-C08 | Humilhação | Rebaixamento da dignidade por outro | Exposição cruel | Encolher, silêncio, raiva contida | Confundir com vergonha comum |
| EMO-C09 | Indignação | Raiva moral diante de injustiça | Violação de valor ou direito | Tom firme, protesto, corpo mobilizado | Ler como agressividade gratuita |
| EMO-C10 | Insegurança | Dúvida sobre o próprio valor em contexto social | Comparação, avaliação | Hesitar, buscar aprovação, retrair-se | Confundir com desinteresse |
| EMO-C11 | Desapontamento consigo | Frustração dirigida ao próprio desempenho | Erro pessoal | Autocrítica, cabeça baixa, silêncio | Ler como mau humor com os outros |
| EMO-C12 | Resignação | Aceitação passiva de algo indesejado e inevitável | Perda irremediável | Suspiro, ombros caídos, tom neutro, "tudo bem" | Confundir com concordância genuína |
| EMO-C13 | Orgulho ferido | Dor pela ameaça à autoimagem | Crítica, derrota pública | Defensividade, justificativas, retraimento | Ler apenas como raiva |
| EMO-C14 | Esperança | Expectativa positiva apesar da incerteza | Situação difícil com chance de melhora | Postura mais aberta, fala projetiva, engajamento | Confundir com ingenuidade |

---

## 2. Biblioteca de pistas sociais

> **Princípio obrigatório:** **nenhuma pista isolada determina uma emoção.** Cada pista abre
> **hipóteses**; a leitura social exige **convergência de várias pistas + contexto + histórico**.
> No conteúdo, todo item pontuável de emoção deve apoiar-se em **≥2 pistas convergentes**.

### 2.1 Expressão facial (CUE-FAC)

| ID | Pista observável | Hipóteses possíveis (não exclusivas) |
|---|---|---|
| CUE-FAC01 | Sorriso com rugas ao redor dos olhos | Alegria genuína, diversão |
| CUE-FAC02 | Sorriso que não envolve os olhos | Cortesia, nervosismo, disfarce |
| CUE-FAC03 | Sobrancelhas franzidas | Concentração, raiva, dúvida, dor |
| CUE-FAC04 | Sobrancelhas elevadas | Surpresa, medo, interesse, ceticismo |
| CUE-FAC05 | Lábios apertados | Contenção, tensão, desaprovação |
| CUE-FAC06 | Queixo/lábio inferior tremendo | Tristeza iminente, medo |
| CUE-FAC07 | Nariz franzido | Nojo, desagrado |
| CUE-FAC08 | Olhos marejados | Tristeza, emoção intensa, alívio, riso |
| CUE-FAC09 | Boca aberta súbita | Surpresa, susto |
| CUE-FAC10 | Rubor facial | Vergonha, constrangimento, calor, esforço |
| CUE-FAC11 | Rosto neutro/inexpressivo | Concentração, cansaço, contenção, tristeza contida |

### 2.2 Postura corporal (CUE-POS)

| ID | Pista observável | Hipóteses possíveis |
|---|---|---|
| CUE-POS01 | Ombros caídos | Desânimo, cansaço, tristeza |
| CUE-POS02 | Postura ereta e aberta | Confiança, disposição |
| CUE-POS03 | Corpo encolhido | Medo, frio, insegurança, dor |
| CUE-POS04 | Corpo voltado para longe do outro | Desconforto, desinteresse, pressa |
| CUE-POS05 | Corpo voltado para o outro | Interesse, engajamento |
| CUE-POS06 | Braços cruzados | Autoproteção, frio, reflexão, resistência |
| CUE-POS07 | Inclinar-se para frente | Interesse, urgência |
| CUE-POS08 | Rigidez corporal | Tensão, medo, contenção |

### 2.3 Gestos (CUE-GES)

| ID | Pista observável | Hipóteses possíveis |
|---|---|---|
| CUE-GES01 | Mãos inquietas | Ansiedade, pressa, tédio |
| CUE-GES02 | Gesticular amplo | Entusiasmo, ênfase |
| CUE-GES03 | Cobrir a boca | Surpresa, susto, esconder reação |
| CUE-GES04 | Mão na nuca | Constrangimento, dúvida |
| CUE-GES05 | Apontar | Indicar, acusar, orientar |
| CUE-GES06 | Punhos cerrados | Raiva, tensão, determinação |
| CUE-GES07 | Acenar | Cumprimento, despedida, chamar |
| CUE-GES08 | Balançar a cabeça (negativa) | Discordância, negação, reprovação |
| CUE-GES09 | Balançar a perna sentado | Impaciência, ansiedade |

### 2.4 Direção do olhar (CUE-OLH)

| ID | Pista observável | Hipóteses possíveis |
|---|---|---|
| CUE-OLH01 | Olhar direto e sustentado | Atenção, interesse, confronto (depende do contexto) |
| CUE-OLH02 | Desviar o olhar | Timidez, vergonha, desconforto, reflexão |
| CUE-OLH03 | Olhar para baixo | Tristeza, submissão, culpa, concentração |
| CUE-OLH04 | Olhar repetido para o relógio/porta | Pressa, tédio, vontade de sair |
| CUE-OLH05 | Seguir alguém com o olhar | Interesse, monitoramento, preocupação |
| CUE-OLH06 | Olhar distante/perdido | Distração, nostalgia, cansaço |
| CUE-OLH07 | Evitar contato visual em grupo | Insegurança, exclusão sentida |

### 2.5 Distância física (CUE-DIS)

| ID | Pista observável | Hipóteses possíveis |
|---|---|---|
| CUE-DIS01 | Aproximar-se muito | Intimidade, urgência, invasão (varia por relação/cultura) |
| CUE-DIS02 | Manter distância | Respeito, receio, formalidade |
| CUE-DIS03 | Afastar-se quando o outro chega | Desconforto, rejeição, necessidade de espaço |
| CUE-DIS04 | Sentar ao lado de alguém | Aceitação, proximidade |
| CUE-DIS05 | Ficar na borda/atrás do grupo | Timidez, exclusão, observação |

### 2.6 Tom de voz (CUE-TOM)

| ID | Pista observável | Hipóteses possíveis |
|---|---|---|
| CUE-TOM01 | Voz alta | Entusiasmo, raiva, tentar ser ouvido, ambiente barulhento |
| CUE-TOM02 | Voz baixa | Timidez, tristeza, segredo, cansaço |
| CUE-TOM03 | Voz trêmula | Medo, emoção, nervosismo |
| CUE-TOM04 | Fala acelerada | Ansiedade, empolgação, pressa |
| CUE-TOM05 | Fala lenta/arrastada | Cansaço, desânimo, ênfase |
| CUE-TOM06 | Tom monótono | Tédio, contenção, tristeza, concentração |
| CUE-TOM07 | Entonação ascendente | Dúvida, insegurança, convite |
| CUE-TOM08 | Ênfase sarcástica | Ironia (sentido oposto ao literal) |

### 2.7 Silêncio (CUE-SIL)

| ID | Pista observável | Hipóteses possíveis |
|---|---|---|
| CUE-SIL01 | Silêncio após uma pergunta | Reflexão, desconforto, não saber responder |
| CUE-SIL02 | Silêncio em grupo | Timidez, exclusão, atenção, tensão |
| CUE-SIL03 | Parar de falar quando alguém chega | Segredo, mudança de assunto, surpresa |
| CUE-SIL04 | Silêncio prolongado entre dois | Intimidade confortável OU tensão (depende) |
| CUE-SIL05 | Não responder a um cumprimento | Distração, mágoa, não ter ouvido |

### 2.8 Ambiente (CUE-AMB)

| ID | Pista observável | Hipóteses possíveis |
|---|---|---|
| CUE-AMB01 | Local barulhento | Dificulta ouvir, aumenta irritação |
| CUE-AMB02 | Local silencioso (ex.: biblioteca) | Exige voz baixa, contenção |
| CUE-AMB03 | Local cheio/lotado | Pressa, disputa por espaço |
| CUE-AMB04 | Local formal | Comportamento contido |
| CUE-AMB05 | Organização/iluminação do lugar | Sinaliza o clima e a função do local |

### 2.9 Objetos (CUE-OBJ)

| ID | Pista observável | Hipóteses possíveis |
|---|---|---|
| CUE-OBJ01 | Presente embrulhado | Celebração, gesto de afeto |
| CUE-OBJ02 | Mochila nas costas indo à saída | Fim de atividade, partida |
| CUE-OBJ03 | Celular na mão com olhar desviado | Distração, evitação |
| CUE-OBJ04 | Objeto quebrado | Acidente, conflito recente |
| CUE-OBJ05 | Bandeja/comida | Refeição, serviço |
| CUE-OBJ06 | Senha/ficha/ingresso | Espera, ordem de atendimento |

### 2.10 Contexto (CUE-CTX)

| ID | Pista contextual | O que informa |
|---|---|---|
| CUE-CTX01 | Histórico da relação entre os personagens | Muda o sentido de gestos e falas |
| CUE-CTX02 | Evento imediatamente anterior | Fornece a causa provável do estado atual |
| CUE-CTX03 | Papel de cada um no ambiente | Define expectativas de comportamento |
| CUE-CTX04 | Regra social vigente no local | Delimita o que é adequado |
| CUE-CTX05 | Expectativa cultural da situação | Ajusta a leitura de distância, tom e contato |

### 2.11 Ações (CUE-ACAO)

| ID | Pista observável | Hipóteses possíveis |
|---|---|---|
| CUE-ACAO01 | Oferecer ajuda | Cuidado, cortesia |
| CUE-ACAO02 | Virar as costas e sair | Término, mágoa, pressa |
| CUE-ACAO03 | Abraçar | Afeto, consolo, comemoração |
| CUE-ACAO04 | Entregar algo a alguém | Dar, devolver, compartilhar |
| CUE-ACAO05 | Ceder o lugar/a vez | Cortesia, respeito |
| CUE-ACAO06 | Ignorar um pedido | Não ouvir, recusar, estar distraído |
| CUE-ACAO07 | Repetir uma ação | Insistência, dúvida, ritual |

---

## 3. Biblioteca de regras sociais (por ambiente)

Para cada ambiente: **explícitas** (declaradas/afixadas) · **implícitas** (não ditas, presumidas)
· **comportamentos esperados** · **situações ambíguas** (onde a regra depende de leitura). IDs no
formato `RUL-<amb>-<tipo>`.

**RUL-ESCOLA** · Escola
| Tipo | Itens |
|---|---|
| Explícitas | Levantar a mão para falar; chegar no horário; não usar celular em aula; usar uniforme |
| Implícitas | Não interromper o colega; respeitar o turno de fala; não expor o erro alheio |
| Esperados | Prestar atenção, cooperar em grupo, pedir ajuda ao professor |
| Ambíguas | Ajudar o colega na prova (ajuda × cola); rir de uma resposta (humor × zombaria) |

**RUL-CASA** · Casa
| Tipo | Itens |
|---|---|
| Explícitas | Combinados da família; horários de refeição e sono; tarefas divididas |
| Implícitas | Bater antes de entrar no quarto; respeitar o silêncio de quem descansa |
| Esperados | Colaborar, avisar aonde vai, cuidar dos objetos comuns |
| Ambíguas | Pegar algo do irmão sem pedir (confiança × invasão); brincadeira que incomoda |

**RUL-RESTAURANTE** · Restaurante
| Tipo | Itens |
|---|---|
| Explícitas | Esperar para ser acomodado; chamar o garçom; pagar a conta |
| Implícitas | Falar em volume moderado; não mexer no prato alheio; esperar todos serem servidos |
| Esperados | Ser cordial com o garçom, agradecer, respeitar a fila do caixa |
| Ambíguas | Reclamar do prato (direito × grosseria); dividir a conta (combinado prévio) |

**RUL-PARQUE** · Parque
| Tipo | Itens |
|---|---|
| Explícitas | Respeitar horários; não pisar em áreas proibidas; recolher o lixo |
| Implícitas | Revezar nos brinquedos; não furar fila do escorregador |
| Esperados | Compartilhar espaço, cuidar de crianças menores, pedir a vez |
| Ambíguas | Entrar numa brincadeira alheia (convite × invasão) |

**RUL-SHOPPING** · Shopping
| Tipo | Itens |
|---|---|
| Explícitas | Pagar antes de consumir; respeitar horário de funcionamento |
| Implícitas | Não bloquear a passagem; manter distância nas filas; falar baixo em provadores |
| Esperados | Aguardar atendimento, agradecer o vendedor |
| Ambíguas | Experimentar sem comprar (livre × compromisso); pedir desconto |

**RUL-SUPERMERCADO** · Supermercado
| Tipo | Itens |
|---|---|
| Explícitas | Pesar produtos; pagar no caixa; devolver o carrinho |
| Implícitas | Não abrir embalagens; respeitar a fila; ceder passagem com o carrinho |
| Esperados | Organizar itens na esteira, cumprimentar o operador |
| Ambíguas | Fila preferencial (quem tem direito); alguém com poucos itens atrás |

**RUL-HOSPITAL** · Hospital
| Tipo | Itens |
|---|---|
| Explícitas | Horário de visita; silêncio; higienizar as mãos |
| Implícitas | Falar baixo, respeitar a privacidade, não ocupar leito alheio |
| Esperados | Aguardar a vez, seguir orientação da equipe, acolher acompanhantes |
| Ambíguas | Prioridade de atendimento (gravidade × ordem de chegada) |

**RUL-CONSULTORIO** · Consultório
| Tipo | Itens |
|---|---|
| Explícitas | Horário marcado; aguardar ser chamado; sigilo |
| Implícitas | Não escutar conversa alheia na espera; respeitar o tempo da sessão |
| Esperados | Pontualidade, cordialidade com a recepção |
| Ambíguas | Atraso do profissional (esperar × reclamar) |

**RUL-BIBLIOTECA** · Biblioteca
| Tipo | Itens |
|---|---|
| Explícitas | Silêncio; devolver no prazo; não comer |
| Implícitas | Falar sussurrando, desligar som do celular, não guardar lugar por horas |
| Esperados | Cuidar dos livros, pedir ajuda em voz baixa |
| Ambíguas | Reservar mesa e sair (uso × monopólio) |

**RUL-CINEMA** · Cinema
| Tipo | Itens |
|---|---|
| Explícitas | Silêncio durante o filme; celular no silencioso; lugar marcado |
| Implícitas | Não chutar a poltrona; não narrar o filme; chegar no horário |
| Esperados | Respeitar o assento alheio, sair com discrição |
| Ambíguas | Sentar no lugar errado (engano × má-fé); comentar em voz baixa |

**RUL-TRABALHO** · Trabalho
| Tipo | Itens |
|---|---|
| Explícitas | Cumprir horário; entregar tarefas; seguir normas da empresa |
| Implícitas | Não interromper reunião, respeitar hierarquia, dividir crédito |
| Esperados | Colaborar, comunicar-se com clareza, respeitar prazos |
| Ambíguas | Discordar do chefe (opinião × insubordinação); pausa longa |

**RUL-FACULDADE** · Faculdade
| Tipo | Itens |
|---|---|
| Explícitas | Frequência mínima; prazos de trabalho; regras de avaliação |
| Implícitas | Dividir tarefas em grupo, citar fontes, respeitar a fala alheia |
| Esperados | Autonomia, participação, pontualidade |
| Ambíguas | Colega que não colabora no grupo (cobrar × expor) |

**RUL-ACADEMIA** · Academia
| Tipo | Itens |
|---|---|
| Explícitas | Usar toalha; devolver os pesos; horário de aula |
| Implícitas | Não monopolizar aparelho, respeitar o espaço, revezar |
| Esperados | Higiene, cordialidade, pedir a vez |
| Ambíguas | Pedir para "puxar" o aparelho (dividir × atrapalhar) |

**RUL-TRANSPORTE** · Transporte público
| Tipo | Itens |
|---|---|
| Explícitas | Pagar a passagem; assentos preferenciais; embarcar pela porta certa |
| Implícitas | Ceder lugar, deixar descer antes de subir, mochila à frente |
| Esperados | Respeitar fila, falar baixo, ceder passagem |
| Ambíguas | Guardar assento para alguém; volume do fone |

**RUL-PRACA** · Praça
| Tipo | Itens |
|---|---|
| Explícitas | Recolher lixo; respeitar áreas de convívio |
| Implícitas | Compartilhar bancos, controlar volume, cuidar de animais |
| Esperados | Convivência pacífica, revezar espaços |
| Ambíguas | Ocupar o banco todo (uso × excesso) |

**RUL-FESTA** · Festa
| Tipo | Itens |
|---|---|
| Explícitas | Horário; convite; combinados do anfitrião |
| Implícitas | Cumprimentar o anfitrião, integrar-se, não monopolizar a atenção |
| Esperados | Sociabilidade, agradecer, ajudar se preciso |
| Ambíguas | Entrar num grupo já formado; sair cedo (educado × desfeita) |

---

## 4. Biblioteca de ambientes (≥ 80)

IDs `ENV-###`; coluna **Categoria** para balancear a geração e medir generalização (Etapa 1, §15).

| ID | Ambiente | Categoria | ID | Ambiente | Categoria |
|---|---|---|---|---|---|
| ENV-001 | Sala de aula | Educacional | ENV-041 | Banco | Serviços |
| ENV-002 | Pátio da escola | Educacional | ENV-042 | Correios | Serviços |
| ENV-003 | Refeitório escolar | Educacional | ENV-043 | Salão de beleza | Serviços |
| ENV-004 | Biblioteca escolar | Educacional | ENV-044 | Barbearia | Serviços |
| ENV-005 | Laboratório escolar | Educacional | ENV-045 | Pet shop | Serviços |
| ENV-006 | Quadra da escola | Educacional | ENV-046 | Cartório | Serviços |
| ENV-007 | Creche | Educacional | ENV-047 | Oficina mecânica | Serviços |
| ENV-008 | Sala universitária | Educacional | ENV-048 | Cinema | Lazer/Cultura |
| ENV-009 | Auditório | Educacional | ENV-049 | Teatro | Lazer/Cultura |
| ENV-010 | Autoescola | Educacional | ENV-050 | Museu | Lazer/Cultura |
| ENV-011 | Curso de idiomas | Educacional | ENV-051 | Biblioteca pública | Lazer/Cultura |
| ENV-012 | Hospital (enfermaria) | Saúde | ENV-052 | Parque | Lazer/Cultura |
| ENV-013 | Pronto-socorro | Saúde | ENV-053 | Zoológico | Lazer/Cultura |
| ENV-014 | Consultório médico | Saúde | ENV-054 | Aquário | Lazer/Cultura |
| ENV-015 | Consultório psicológico | Saúde | ENV-055 | Parque de diversões | Lazer/Cultura |
| ENV-016 | Clínica odontológica | Saúde | ENV-056 | Clube | Lazer/Cultura |
| ENV-017 | Posto de saúde | Saúde | ENV-057 | Praia | Lazer/Cultura |
| ENV-018 | Farmácia | Saúde | ENV-058 | Piscina | Lazer/Cultura |
| ENV-019 | Laboratório de exames | Saúde | ENV-059 | Academia | Esporte |
| ENV-020 | Sala de espera | Saúde | ENV-060 | Quadra poliesportiva | Esporte |
| ENV-021 | Fisioterapia | Saúde | ENV-061 | Estádio | Esporte |
| ENV-022 | Restaurante | Alimentação | ENV-062 | Campo de futebol | Esporte |
| ENV-023 | Lanchonete | Alimentação | ENV-063 | Pista de corrida | Esporte |
| ENV-024 | Cafeteria | Alimentação | ENV-064 | Ponto de ônibus | Transporte |
| ENV-025 | Padaria | Alimentação | ENV-065 | Ônibus | Transporte |
| ENV-026 | Sorveteria | Alimentação | ENV-066 | Metrô | Transporte |
| ENV-027 | Praça de alimentação | Alimentação | ENV-067 | Estação de trem | Transporte |
| ENV-028 | Bar | Alimentação | ENV-068 | Aeroporto | Transporte |
| ENV-029 | Food truck | Alimentação | ENV-069 | Avião | Transporte |
| ENV-030 | Cantina | Alimentação | ENV-070 | Táxi/app | Transporte |
| ENV-031 | Supermercado | Comércio | ENV-071 | Terminal rodoviário | Transporte |
| ENV-032 | Shopping | Comércio | ENV-072 | Escritório | Trabalho |
| ENV-033 | Loja de roupas | Comércio | ENV-073 | Sala de reunião | Trabalho |
| ENV-034 | Livraria | Comércio | ENV-074 | Recepção | Trabalho |
| ENV-035 | Loja de brinquedos | Comércio | ENV-075 | Coworking | Trabalho |
| ENV-036 | Feira livre | Comércio | ENV-076 | Call center | Trabalho |
| ENV-037 | Mercadinho de bairro | Comércio | ENV-077 | Fábrica | Trabalho |
| ENV-038 | Casa (sala) | Doméstico | ENV-078 | Sala de casa (visita) | Doméstico |
| ENV-039 | Cozinha | Doméstico | ENV-079 | Quarto compartilhado | Doméstico |
| ENV-040 | Quintal | Doméstico | ENV-080 | Elevador do prédio | Doméstico |
| ENV-081 | Área de festas do condomínio | Doméstico | ENV-091 | Igreja/templo | Cerimônia |
| ENV-082 | Portaria do prédio | Doméstico | ENV-092 | Velório | Cerimônia |
| ENV-083 | Rua/calçada | Público | ENV-093 | Casamento | Cerimônia |
| ENV-084 | Praça pública | Público | ENV-094 | Formatura | Cerimônia |
| ENV-085 | Fila de órgão público | Público | ENV-095 | Festa de aniversário | Evento social |
| ENV-086 | Delegacia | Público | ENV-096 | Festa junina | Evento social |
| ENV-087 | Trilha/natureza | Natureza | ENV-097 | Churrasco em família | Evento social |
| ENV-088 | Camping | Natureza | ENV-098 | Show/festival | Evento social |
| ENV-089 | Sítio | Natureza | ENV-099 | Grupo de mensagens | Digital |
| ENV-090 | Pesqueiro | Natureza | ENV-100 | Videochamada/jogo online | Digital |

---

## 5. Biblioteca de personagens (perfis reutilizáveis)

Perfis **reutilizáveis** e neutros (sem sobrenome, sem marca). Nomes diversos. Campos: nome ·
idade · características gerais (traço social observável, não diagnóstico) · papel social.

### 5.1 Crianças (CHR-C)

| ID | Nome | Idade | Características gerais | Papel social |
|---|---|---|---|---|
| CHR-C01 | Bento | 7 | Comunicativo, distrai-se fácil | Colega de turma |
| CHR-C02 | Lara | 8 | Observadora, tímida no início | Aluna nova |
| CHR-C03 | Théo | 6 | Enérgico, competitivo | Irmão mais novo |
| CHR-C04 | Sofia | 9 | Cuidadosa, gosta de mediar | Líder de grupo |
| CHR-C05 | Davi | 10 | Reservado, leitor | Colega quieto |
| CHR-C06 | Manu | 7 | Espontânea, fala alto | Amiga próxima |
| CHR-C07 | Caio | 8 | Impulsivo, generoso | Colega de time |
| CHR-C08 | Alice | 9 | Perfeccionista | Aluna aplicada |
| CHR-C09 | Gael | 6 | Curioso, questionador | Primo |
| CHR-C10 | Cecília | 10 | Empática, sensível | Amiga confidente |
| CHR-C11 | Nina | 8 | Brincalhona | Vizinha |
| CHR-C12 | Rafa | 9 | Novato no grupo | Aluno recém-chegado |

### 5.2 Adolescentes (CHR-A)

| ID | Nome | Idade | Características gerais | Papel social |
|---|---|---|---|---|
| CHR-A01 | Luca | 14 | Sociável, influente | Colega popular |
| CHR-A02 | Isa | 15 | Introspectiva, artística | Amiga próxima |
| CHR-A03 | Pedro | 16 | Competitivo, líder | Capitão do time |
| CHR-A04 | Yara | 13 | Recém-chegada, insegura | Aluna nova |
| CHR-A05 | Enzo | 17 | Bem-humorado, às vezes irônico | Colega de sala |
| CHR-A06 | Malu | 15 | Organizada, responsável | Representante de turma |
| CHR-A07 | Vitor | 14 | Reservado, gamer | Colega quieto |
| CHR-A08 | Bia | 16 | Extrovertida, direta | Amiga do grupo |
| CHR-A09 | Rael | 15 | Sensível a críticas | Colega de banda |
| CHR-A10 | Duda | 13 | Mediadora de conflitos | Amiga em comum |
| CHR-A11 | Théo | 17 | Ambicioso, focado | Colega de estudos |
| CHR-A12 | Lele | 14 | Tímida em grupo novo | Prima |

### 5.3 Adultos (CHR-D)

| ID | Nome | Idade | Características gerais | Papel social |
|---|---|---|---|---|
| CHR-D01 | Marcos | 34 | Objetivo, comunicativo | Colega de trabalho |
| CHR-D02 | Renata | 41 | Atenciosa, mediadora | Gestora de equipe |
| CHR-D03 | Paulo | 28 | Reservado, meticuloso | Colega novo |
| CHR-D04 | Cláudia | 37 | Direta, assertiva | Cliente |
| CHR-D05 | André | 45 | Formal, exigente | Chefe |
| CHR-D06 | Fernanda | 30 | Cordial, prestativa | Recepcionista |
| CHR-D07 | Rogério | 52 | Paciente, experiente | Vizinho |
| CHR-D08 | Juliana | 33 | Empática | Amiga da família |
| CHR-D09 | Tiago | 26 | Ansioso, esforçado | Estagiário |
| CHR-D10 | Sandra | 48 | Prática, firme | Comerciante |
| CHR-D11 | Bruno | 39 | Sociável, brincalhão | Colega de curso |
| CHR-D12 | Aline | 31 | Tímida em público | Colega de reunião |

### 5.4 Idosos (CHR-I)

| ID | Nome | Idade | Características gerais | Papel social |
|---|---|---|---|---|
| CHR-I01 | Seu Antônio | 71 | Sereno, conversador | Avô |
| CHR-I02 | Dona Cida | 68 | Acolhedora, atenta | Avó/vizinha |
| CHR-I03 | Seu Jorge | 74 | Reservado, orgulhoso | Cliente idoso |
| CHR-I04 | Dona Léa | 66 | Bem-humorada | Vizinha |
| CHR-I05 | Seu Waldir | 80 | Lento, precisa de apoio | Passageiro |
| CHR-I06 | Dona Íris | 70 | Firme, independente | Comerciante aposentada |
| CHR-I07 | Seu Nelson | 77 | Esquecido, gentil | Avô de colega |
| CHR-I08 | Dona Rute | 69 | Sensível, saudosa | Familiar |

---

## 6. Biblioteca de situações sociais (≥ 300 — apenas temas, sem histórias)

Cada linha é um **tema** reutilizável (não uma história). Colunas: `Dif` (1–7, alinhada aos níveis
da Etapa 1) · `Eixo` (foco social primário) · `Amb` (ambiente sugerido, `ENV-###`). O gerador
combina tema + personagens + pistas + regras para produzir o `SocialCase`.

### 6.1 Crianças (SIT-C-001…100)

| ID | Tema | Dif | Eixo | Amb |
|---|---|---|---|---|
| SIT-C-001 | Criança nova não sabe com quem sentar | 1 | CX | ENV-001 |
| SIT-C-002 | Colega é deixado de fora de uma brincadeira | 3 | TP | ENV-002 |
| SIT-C-003 | Dois amigos querem brincar de coisas diferentes | 2 | RP | ENV-052 |
| SIT-C-004 | Amigo muda de escola e se despede | 2 | RE | ENV-001 |
| SIT-C-005 | Grupo já formado e alguém quer entrar | 3 | RP | ENV-002 |
| SIT-C-006 | Melhor amigo brinca com outro colega hoje | 3 | RE | ENV-002 |
| SIT-C-007 | Colega tímido é convidado para o grupo | 2 | TP | ENV-003 |
| SIT-C-008 | Amiga não fala com ninguém no recreio | 2 | IN | ENV-002 |
| SIT-C-009 | Convite de aniversário entregue a quase todos | 4 | TM | ENV-001 |
| SIT-C-010 | Quer sentar com o amigo, mas o lugar está ocupado | 2 | RP | ENV-003 |
| SIT-C-011 | Colega derruba o lanche de outro sem querer | 2 | FI | ENV-003 |
| SIT-C-012 | Dois disputam o mesmo balanço | 2 | JS | ENV-052 |
| SIT-C-013 | Alguém pega o brinquedo do outro sem pedir | 2 | JS | ENV-035 |
| SIT-C-014 | Criança acusa a colega errada por um objeto sumido | 4 | FI | ENV-001 |
| SIT-C-015 | Amigos brigam e param de se falar | 3 | RP | ENV-002 |
| SIT-C-016 | Colega pisa no pé do outro na fila | 2 | FI | ENV-003 |
| SIT-C-017 | Um empurrão no jogo: sem querer ou de propósito? | 4 | IN | ENV-006 |
| SIT-C-018 | Criança quebra o brinquedo do amigo | 3 | RE | ENV-038 |
| SIT-C-019 | Discussão sobre quem ganhou a partida | 3 | RP | ENV-060 |
| SIT-C-020 | Amigo conta uma mentira e é descoberto | 4 | TM | ENV-002 |
| SIT-C-021 | Colega chega chorando na escola | 2 | RE | ENV-001 |
| SIT-C-022 | Criança fica quieta depois de perder | 2 | RE | ENV-060 |
| SIT-C-023 | Amigo sorri, mas parece triste | 4 | RE | ENV-002 |
| SIT-C-024 | Fica vermelha ao ser elogiada diante da turma | 3 | RE | ENV-001 |
| SIT-C-025 | Alguém bate o pé e cruza os braços | 2 | RE | ENV-038 |
| SIT-C-026 | Colega comemora demais a vitória | 3 | JS | ENV-060 |
| SIT-C-027 | Criança se surpreende com uma festa-surpresa | 2 | RE | ENV-081 |
| SIT-C-028 | Amigo com medo de apresentar diante da turma | 2 | RE | ENV-009 |
| SIT-C-029 | Alívio ao encontrar o cachorro perdido | 2 | RE | ENV-040 |
| SIT-C-030 | Colega parece bravo, mas está com dor | 4 | IN | ENV-020 |
| SIT-C-031 | Criança cai no pátio e ninguém percebe | 2 | TP | ENV-002 |
| SIT-C-032 | Colega esqueceu o material | 1 | RP | ENV-001 |
| SIT-C-033 | Idoso precisa de ajuda para atravessar | 2 | JS | ENV-083 |
| SIT-C-034 | Amigo se perde no shopping | 3 | RP | ENV-032 |
| SIT-C-035 | Oferecer o lanche a quem esqueceu o dele | 2 | RE | ENV-003 |
| SIT-C-036 | Colega novo não entende a brincadeira | 2 | TP | ENV-002 |
| SIT-C-037 | Ajudar sem ser pedido pode incomodar? | 5 | TM | ENV-001 |
| SIT-C-038 | Consolar o amigo que perdeu o jogo | 3 | RE | ENV-002 |
| SIT-C-039 | Dividir o guarda-chuva na chuva | 1 | RE | ENV-064 |
| SIT-C-040 | Ver alguém sozinho e decidir chamar | 3 | RP | ENV-003 |
| SIT-C-041 | Falar sem levantar a mão na aula | 1 | RS | ENV-001 |
| SIT-C-042 | Furar a fila do lanche | 2 | JS | ENV-003 |
| SIT-C-043 | Fazer barulho na biblioteca | 1 | RS | ENV-004 |
| SIT-C-044 | Usar o celular escondido na aula | 2 | RS | ENV-001 |
| SIT-C-045 | Ajudar na prova: ajuda ou cola? | 5 | JS | ENV-001 |
| SIT-C-046 | Rir da resposta do colega: piada ou zombaria? | 4 | JS | ENV-001 |
| SIT-C-047 | Contar ao professor que o colega colou | 5 | RP | ENV-001 |
| SIT-C-048 | Pegar algo do irmão sem pedir | 2 | RS | ENV-079 |
| SIT-C-049 | Interromper quem está falando | 2 | RS | ENV-038 |
| SIT-C-050 | Guardar lugar na fila para o amigo | 4 | JS | ENV-032 |
| SIT-C-051 | Amigo procura o brinquedo onde o deixou, mas foi movido | 4 | TM | ENV-038 |
| SIT-C-052 | Presente que o amigo não gostou, mas agradece | 5 | TM | ENV-095 |
| SIT-C-053 | Criança acha que a surpresa é para ela | 4 | TM | ENV-081 |
| SIT-C-054 | Dois entendem a mesma frase de formas diferentes | 5 | TP | ENV-001 |
| SIT-C-055 | Colega não sabe que a aula mudou de sala | 3 | TM | ENV-001 |
| SIT-C-056 | Amiga esconde o desenho achando que é ruim | 4 | TP | ENV-001 |
| SIT-C-057 | Criança conta o fim do filme sem querer | 3 | TM | ENV-048 |
| SIT-C-058 | O que o colega sabe que eu não sei? | 5 | TM | ENV-001 |
| SIT-C-059 | Amigo se acha excluído, mas houve engano | 5 | TM | ENV-002 |
| SIT-C-060 | Imaginar o que o irmão está pensando | 4 | TM | ENV-038 |
| SIT-C-061 | Colega não respondeu ao "oi": bravo ou distraído? | 4 | FI | ENV-002 |
| SIT-C-062 | Amiga cancelou o encontro: desculpa ou verdade? | 5 | IN | ENV-099 |
| SIT-C-063 | Mensagem no grupo sem resposta | 4 | IN | ENV-099 |
| SIT-C-064 | Colega riu: da piada ou de mim? | 5 | TM | ENV-002 |
| SIT-C-065 | Professor chama a atenção de todos; criança se sente culpada | 3 | TP | ENV-001 |
| SIT-C-066 | Amigo falou "que legal" sem animação | 6 | RE | ENV-002 |
| SIT-C-067 | Bilhete sem assinatura na mochila | 4 | IN | ENV-001 |
| SIT-C-068 | Colega desvia o olhar ao ser cumprimentado | 4 | IN | ENV-002 |
| SIT-C-069 | Silêncio do grupo quando a criança chega | 5 | TM | ENV-002 |
| SIT-C-070 | Amigo diz "tô bem" de cabeça baixa | 5 | FI | ENV-038 |
| SIT-C-071 | Irmãos disputam o controle da TV | 2 | RP | ENV-038 |
| SIT-C-072 | Pai chega cansado do trabalho | 3 | TP | ENV-038 |
| SIT-C-073 | Quer contar novidade, mas a mãe está ao telefone | 3 | TM | ENV-039 |
| SIT-C-074 | Avó se emociona com o desenho do neto | 2 | RE | ENV-038 |
| SIT-C-075 | Combinar as tarefas de casa entre irmãos | 2 | RP | ENV-038 |
| SIT-C-076 | Quebrou o vaso e pensa em esconder | 4 | JS | ENV-038 |
| SIT-C-077 | Visita chega e a criança precisa cumprimentar | 1 | RS | ENV-078 |
| SIT-C-078 | Irmão mais novo atrapalha a lição | 2 | RP | ENV-038 |
| SIT-C-079 | Mãe promete passeio e surge um imprevisto | 3 | RE | ENV-038 |
| SIT-C-080 | Avô conta a mesma história de novo | 3 | TP | ENV-097 |
| SIT-C-081 | Dividir o brinquedo novo com a visita | 2 | RP | ENV-038 |
| SIT-C-082 | Ganhar enquanto o amigo perde no mesmo jogo | 3 | TP | ENV-060 |
| SIT-C-083 | Terminar primeiro e esperar os outros | 1 | RS | ENV-001 |
| SIT-C-084 | Repartir o bolo em partes iguais na festa | 2 | JS | ENV-095 |
| SIT-C-085 | Emprestar o material e o outro não devolver | 3 | RP | ENV-001 |
| SIT-C-086 | Perder o jogo e cumprimentar quem ganhou | 3 | JS | ENV-062 |
| SIT-C-087 | Ser elogiado e o amigo não | 4 | TP | ENV-001 |
| SIT-C-088 | Compartilhar a vez no videogame | 2 | RP | ENV-038 |
| SIT-C-089 | Ajudar o time mesmo jogando mal | 3 | TP | ENV-062 |
| SIT-C-090 | Comemorar sem provocar quem perdeu | 4 | JS | ENV-060 |
| SIT-C-091 | Falar alto no cinema | 1 | RS | ENV-048 |
| SIT-C-092 | Criança agitada na sala de espera | 2 | RS | ENV-020 |
| SIT-C-093 | Esbarrar em alguém no corredor do shopping | 2 | FI | ENV-032 |
| SIT-C-094 | Perder os pais na feira e pedir ajuda | 3 | RP | ENV-036 |
| SIT-C-095 | Respeitar a vez no escorregador | 1 | RS | ENV-055 |
| SIT-C-096 | Alguém entra sem querer na foto dos outros | 2 | FI | ENV-052 |
| SIT-C-097 | Devolver o troco que veio a mais | 4 | JS | ENV-037 |
| SIT-C-098 | Ver alguém pegar algo que não é seu | 4 | JS | ENV-031 |
| SIT-C-099 | Fila do banheiro no parque de diversões | 2 | RS | ENV-055 |
| SIT-C-100 | Falar com um estranho no transporte | 3 | RP | ENV-065 |

### 6.2 Adolescentes (SIT-A-001…100)

| ID | Tema | Dif | Eixo | Amb |
|---|---|---|---|---|
| SIT-A-001 | Ser deixado de fora de um plano do grupo | 4 | TP | ENV-099 |
| SIT-A-002 | Amigo posta foto do passeio sem incluir você | 5 | TM | ENV-099 |
| SIT-A-003 | Entrar num grupo novo na escola | 3 | RP | ENV-001 |
| SIT-A-004 | Apelido que pega no grupo | 4 | JS | ENV-002 |
| SIT-A-005 | Amigo próximo se afasta sem explicar | 5 | IN | ENV-001 |
| SIT-A-006 | Dividir a amizade entre dois grupos rivais | 5 | RP | ENV-001 |
| SIT-A-007 | Convite para sair recusado sem motivo claro | 4 | IN | ENV-099 |
| SIT-A-008 | Segredo compartilhado vaza no grupo | 5 | TM | ENV-099 |
| SIT-A-009 | Colega novo tenta se enturmar | 3 | TP | ENV-030 |
| SIT-A-010 | Ser o único não convidado para a festa | 4 | TP | ENV-095 |
| SIT-A-011 | Comentário ambíguo numa foto | 5 | IN | ENV-099 |
| SIT-A-012 | Mensagem vista e não respondida | 4 | IN | ENV-099 |
| SIT-A-013 | Print de conversa compartilhado sem permissão | 5 | JS | ENV-099 |
| SIT-A-014 | Piada no grupo que soa como ataque | 5 | IN | ENV-099 |
| SIT-A-015 | Poucas curtidas numa postagem | 4 | IN | ENV-099 |
| SIT-A-016 | Marcarem alguém numa publicação constrangedora | 5 | JS | ENV-099 |
| SIT-A-017 | Notícia falsa compartilhada por um amigo | 5 | FI | ENV-099 |
| SIT-A-018 | Grupo silencia quando você entra na chamada | 6 | TM | ENV-100 |
| SIT-A-019 | Emoji que muda o sentido da mensagem | 5 | IN | ENV-099 |
| SIT-A-020 | Postar algo do amigo sem avisar | 4 | JS | ENV-099 |
| SIT-A-021 | Amigo esconde que está mal atrás de piadas | 6 | TM | ENV-030 |
| SIT-A-022 | Colega irônico: elogio ou deboche? | 6 | RE | ENV-001 |
| SIT-A-023 | Vergonha ao errar diante da turma | 3 | RE | ENV-001 |
| SIT-A-024 | Insegurança ao se comparar nas redes | 5 | RE | ENV-099 |
| SIT-A-025 | Ciúme do melhor amigo com o novato | 4 | RE | ENV-002 |
| SIT-A-026 | Orgulho ferido após uma crítica | 5 | RE | ENV-001 |
| SIT-A-027 | Amigo minimiza a própria conquista | 5 | TP | ENV-001 |
| SIT-A-028 | Reação exagerada a uma brincadeira leve | 5 | IN | ENV-030 |
| SIT-A-029 | Fingir que não se importa quando importa | 6 | FI | ENV-001 |
| SIT-A-030 | Sentir-se invisível numa roda de conversa | 4 | TP | ENV-030 |
| SIT-A-031 | Colar na prova e o dilema de contar | 5 | RP | ENV-001 |
| SIT-A-032 | Chegar atrasado e interromper a aula | 2 | RS | ENV-008 |
| SIT-A-033 | Usar o celular durante o trabalho em grupo | 3 | RS | ENV-001 |
| SIT-A-034 | Furar a fila do refeitório com desculpa | 3 | JS | ENV-030 |
| SIT-A-035 | Pressão do grupo para fazer algo errado | 5 | RP | ENV-002 |
| SIT-A-036 | Rir de um professor pelas costas | 4 | JS | ENV-001 |
| SIT-A-037 | Espalhar um boato não confirmado | 5 | FI | ENV-002 |
| SIT-A-038 | Dividir a autoria de um trabalho de forma justa | 4 | RP | ENV-008 |
| SIT-A-039 | "Zoar" alguém de brincadeira repetidamente | 5 | JS | ENV-002 |
| SIT-A-040 | Defender ou não um colega sendo excluído | 5 | RP | ENV-002 |
| SIT-A-041 | Você acha que ele acha que você o ignorou | 6 | TM | ENV-001 |
| SIT-A-042 | Amiga acha que você contou o segredo | 5 | FI | ENV-099 |
| SIT-A-043 | Mal-entendido por mensagem sem contexto | 5 | IN | ENV-099 |
| SIT-A-044 | Colega pensa que a piada foi para ele | 6 | TM | ENV-030 |
| SIT-A-045 | Dois amigos brigam por causa de terceiros | 5 | RP | ENV-001 |
| SIT-A-046 | Elogio que soa como indireta | 6 | RE | ENV-002 |
| SIT-A-047 | Silêncio depois de um pedido de desculpas | 5 | IN | ENV-001 |
| SIT-A-048 | Convite feito por educação, sem intenção real | 6 | TM | ENV-030 |
| SIT-A-049 | Interpretar o "tanto faz" do amigo | 6 | RE | ENV-099 |
| SIT-A-050 | Perceber que magoou alguém sem querer | 5 | TM | ENV-001 |
| SIT-A-051 | Não saber se o gesto foi amizade ou interesse | 6 | IN | ENV-056 |
| SIT-A-052 | Amigo em comum entre dois que se gostam | 5 | RP | ENV-095 |
| SIT-A-053 | Ser dispensado com gentileza | 5 | TP | ENV-030 |
| SIT-A-054 | Mensagem enviada por engano à pessoa errada | 4 | RP | ENV-099 |
| SIT-A-055 | Ciúme numa amizade próxima | 5 | RE | ENV-002 |
| SIT-A-056 | Discordar dos pais sobre um horário | 3 | RP | ENV-038 |
| SIT-A-057 | Pais comparam com o irmão mais velho | 4 | RE | ENV-038 |
| SIT-A-058 | Guardar um segredo do irmão diante dos pais | 5 | RP | ENV-038 |
| SIT-A-059 | Responder mal e depois se arrepender | 4 | RE | ENV-038 |
| SIT-A-060 | Pedir desculpa aos pais após uma briga | 4 | RP | ENV-038 |
| SIT-A-061 | Sentir-se pressionado por notas em casa | 4 | TP | ENV-038 |
| SIT-A-062 | Ajudar em casa sem ser mandado | 3 | JS | ENV-039 |
| SIT-A-063 | Avó não entende a linguagem da internet | 3 | TP | ENV-097 |
| SIT-A-064 | Dividir quarto e privacidade com o irmão | 3 | RP | ENV-079 |
| SIT-A-065 | Pais leem as mensagens do celular | 5 | JS | ENV-038 |
| SIT-A-066 | Ficar com quem ninguém escolhe no grupo | 4 | TP | ENV-001 |
| SIT-A-067 | Apresentar em público com medo de errar | 3 | RE | ENV-009 |
| SIT-A-068 | Discordar do professor com respeito | 5 | RS | ENV-008 |
| SIT-A-069 | Colega copia o seu trabalho | 4 | RP | ENV-001 |
| SIT-A-070 | Perder a vaga no time por decisão do técnico | 4 | RE | ENV-060 |
| SIT-A-071 | Novato mais habilidoso que os veteranos | 4 | TP | ENV-062 |
| SIT-A-072 | Ser líder de grupo e coordenar sem mandar | 5 | RP | ENV-008 |
| SIT-A-073 | Colega que nunca colabora no trabalho | 4 | RP | ENV-008 |
| SIT-A-074 | Feedback duro do professor diante da turma | 4 | RE | ENV-001 |
| SIT-A-075 | Ajudar um colega em dificuldade sem humilhar | 5 | TP | ENV-001 |
| SIT-A-076 | Primeiro dia num curso novo | 3 | RP | ENV-011 |
| SIT-A-077 | Atendimento mal-educado numa loja | 4 | RE | ENV-033 |
| SIT-A-078 | Reclamar de um pedido errado na lanchonete | 3 | RP | ENV-023 |
| SIT-A-079 | Ceder o assento no ônibus lotado | 2 | JS | ENV-065 |
| SIT-A-080 | Presenciar bullying na rua | 5 | RP | ENV-083 |
| SIT-A-081 | Ser cobrado por um erro no estágio | 5 | TP | ENV-072 |
| SIT-A-082 | Pedir ajuda a um desconhecido na estação | 3 | RP | ENV-067 |
| SIT-A-083 | Barulho alto no cinema atrapalhando os outros | 2 | RS | ENV-048 |
| SIT-A-084 | Alguém questiona seu direito à fila preferencial | 4 | JS | ENV-041 |
| SIT-A-085 | Devolver dinheiro achado no chão | 4 | JS | ENV-032 |
| SIT-A-086 | Amigo pede segredo que o coloca em risco | 6 | RP | ENV-030 |
| SIT-A-087 | Escolher entre a verdade e proteger um amigo | 6 | RP | ENV-001 |
| SIT-A-088 | Perceber uma indireta num grupo | 6 | TM | ENV-099 |
| SIT-A-089 | Ironia num comentário público | 6 | RE | ENV-099 |
| SIT-A-090 | Notar que alguém está sendo manipulado | 6 | JS | ENV-002 |
| SIT-A-091 | Mudar de opinião diante de um bom argumento | 5 | RP | ENV-008 |
| SIT-A-092 | Reconhecer o próprio erro numa discussão | 5 | TP | ENV-001 |
| SIT-A-093 | Um "parabéns" que parece forçado | 6 | RE | ENV-095 |
| SIT-A-094 | Amizade que esfriou aos poucos | 6 | IN | ENV-001 |
| SIT-A-095 | Dois grupos interpretam o mesmo fato diferente | 6 | FI | ENV-002 |
| SIT-A-096 | Perdoar um amigo que decepcionou | 6 | RE | ENV-030 |
| SIT-A-097 | Assumir a culpa por algo do grupo | 6 | JS | ENV-001 |
| SIT-A-098 | Perceber sarcasmo que a maioria não notou | 7 | RE | ENV-030 |
| SIT-A-099 | Mediar uma briga entre dois amigos | 6 | RP | ENV-002 |
| SIT-A-100 | Dilema: contar aos pais algo grave de um amigo | 7 | RP | ENV-038 |

### 6.3 Adultos (SIT-D-001…100)

| ID | Tema | Dif | Eixo | Amb |
|---|---|---|---|---|
| SIT-D-001 | Ter uma ideia interrompida em reunião | 4 | TP | ENV-073 |
| SIT-D-002 | Chefe dá feedback negativo em público | 4 | RE | ENV-072 |
| SIT-D-003 | Colega leva o crédito pelo seu trabalho | 5 | JS | ENV-072 |
| SIT-D-004 | E-mail com tom ambíguo do gestor | 5 | IN | ENV-072 |
| SIT-D-005 | Discordar do chefe sem confronto | 5 | RS | ENV-073 |
| SIT-D-006 | Novo colega ainda perdido no setor | 3 | TP | ENV-075 |
| SIT-D-007 | Colega sobrecarregado não pede ajuda | 5 | TM | ENV-072 |
| SIT-D-008 | Reunião em que ninguém se manifesta | 5 | IN | ENV-073 |
| SIT-D-009 | Piada do chefe que ninguém achou graça | 6 | RE | ENV-072 |
| SIT-D-010 | Cliente irritado no atendimento | 4 | RE | ENV-074 |
| SIT-D-011 | Feedback difícil a dar a um subordinado | 6 | RP | ENV-072 |
| SIT-D-012 | Colega falta e sobra trabalho para você | 4 | RP | ENV-072 |
| SIT-D-013 | Convite de confraternização feito por educação | 6 | TM | ENV-072 |
| SIT-D-014 | Mensagem do trabalho fora do horário | 4 | RS | ENV-099 |
| SIT-D-015 | Erro próprio que afeta a equipe | 5 | JS | ENV-072 |
| SIT-D-016 | Discussão de casal sobre divisão de tarefas | 5 | RP | ENV-038 |
| SIT-D-017 | Sogra dá conselho não pedido | 5 | TP | ENV-078 |
| SIT-D-018 | Filho adolescente responde mal | 4 | RE | ENV-038 |
| SIT-D-019 | Irmãos discutem quem cuida dos pais idosos | 6 | RP | ENV-038 |
| SIT-D-020 | Parente comenta sobre sua vida na festa | 5 | JS | ENV-097 |
| SIT-D-021 | Amigo pede dinheiro emprestado | 5 | RP | ENV-024 |
| SIT-D-022 | Convite recusado por um familiar magoado | 5 | IN | ENV-038 |
| SIT-D-023 | Cônjuge chega calado do trabalho | 4 | IN | ENV-038 |
| SIT-D-024 | Criança faz birra em público | 4 | TP | ENV-031 |
| SIT-D-025 | Vizinho reclama do barulho da sua festa | 4 | RP | ENV-081 |
| SIT-D-026 | Cobrança velada da família por casamento/filhos | 6 | RE | ENV-097 |
| SIT-D-027 | Ajudar um pai idoso sem ferir o orgulho dele | 6 | TP | ENV-038 |
| SIT-D-028 | Marcar um limite com um familiar invasivo | 6 | RP | ENV-038 |
| SIT-D-029 | Um "tudo bem" seco após uma promessa quebrada | 5 | FI | ENV-038 |
| SIT-D-030 | Filho mente e é descoberto | 5 | TM | ENV-038 |
| SIT-D-031 | Atendente comete um erro no pedido | 3 | RP | ENV-022 |
| SIT-D-032 | Direito à fila preferencial questionado | 4 | JS | ENV-041 |
| SIT-D-033 | Alguém fura a fila do caixa | 3 | JS | ENV-031 |
| SIT-D-034 | Troco devolvido a mais | 4 | JS | ENV-037 |
| SIT-D-035 | Reclamar de um serviço sem ser grosseiro | 4 | RP | ENV-043 |
| SIT-D-036 | Barulho de outra mesa no restaurante | 3 | RS | ENV-022 |
| SIT-D-037 | Vizinho de assento invade seu espaço no avião | 3 | RS | ENV-069 |
| SIT-D-038 | Motorista de app inicia conversa | 3 | RP | ENV-070 |
| SIT-D-039 | Alguém passa mal na fila do banco | 4 | RP | ENV-041 |
| SIT-D-040 | Cobrança indevida numa conta | 4 | RP | ENV-041 |
| SIT-D-041 | Notícia difícil na sala de espera | 5 | RE | ENV-020 |
| SIT-D-042 | Acompanhar um familiar hospitalizado | 5 | TP | ENV-012 |
| SIT-D-043 | Profissional de saúde apressado | 4 | IN | ENV-014 |
| SIT-D-044 | Idoso confuso pede ajuda na farmácia | 4 | TP | ENV-018 |
| SIT-D-045 | Consolar alguém no velório sem palavras prontas | 6 | RS | ENV-092 |
| SIT-D-046 | Vizinho novo se apresenta no elevador | 2 | RP | ENV-080 |
| SIT-D-047 | Cachorro do vizinho late à noite | 4 | RP | ENV-082 |
| SIT-D-048 | Vaga de garagem ocupada por engano | 4 | FI | ENV-081 |
| SIT-D-049 | Reunião de condomínio com opiniões opostas | 5 | RP | ENV-081 |
| SIT-D-050 | Ajudar um vizinho idoso com as compras | 3 | JS | ENV-037 |
| SIT-D-051 | Amigo responde "que ótimo" sem entusiasmo | 6 | RE | ENV-024 |
| SIT-D-052 | Elogio que soa como crítica velada | 6 | RE | ENV-072 |
| SIT-D-053 | Silêncio prolongado numa conversa importante | 6 | IN | ENV-014 |
| SIT-D-054 | Reencontro com um amigo distante | 5 | IN | ENV-024 |
| SIT-D-055 | Decepcionar alguém sem saber por quê | 6 | TM | ENV-038 |
| SIT-D-056 | Amigo cancela sempre de última hora | 5 | IN | ENV-099 |
| SIT-D-057 | Um "depois a gente marca" que nunca acontece | 6 | TM | ENV-099 |
| SIT-D-058 | Constrangimento após uma gafe própria | 5 | TP | ENV-095 |
| SIT-D-059 | Colega que sorri, mas evita você | 6 | TM | ENV-072 |
| SIT-D-060 | Alguém muda de assunto quando você chega | 6 | TM | ENV-073 |
| SIT-D-061 | Ver um colega cometer uma pequena fraude | 6 | JS | ENV-072 |
| SIT-D-062 | Guardar segredo que pode prejudicar outro | 7 | RP | ENV-072 |
| SIT-D-063 | Dar um retorno honesto que vai magoar | 6 | TP | ENV-024 |
| SIT-D-064 | Assumir um erro que ninguém viu | 6 | JS | ENV-072 |
| SIT-D-065 | Defender alguém injustiçado numa reunião | 6 | JS | ENV-073 |
| SIT-D-066 | Receber crédito que era de outra pessoa | 6 | JS | ENV-072 |
| SIT-D-067 | Perceber um preconceito velado numa conversa | 7 | IN | ENV-097 |
| SIT-D-068 | Interromper uma fofoca no grupo | 6 | JS | ENV-099 |
| SIT-D-069 | Escolher entre lealdade e verdade | 7 | RP | ENV-072 |
| SIT-D-070 | Reconhecer o próprio viés num julgamento | 7 | FI | ENV-073 |
| SIT-D-071 | Você acha que ela pensa que você a criticou | 7 | TM | ENV-072 |
| SIT-D-072 | Dois setores culpam um ao outro pelo mesmo erro | 7 | FI | ENV-072 |
| SIT-D-073 | Cliente e atendente leem a mesma fala diferente | 6 | FI | ENV-022 |
| SIT-D-074 | Perceber a real intenção por trás de um pedido | 7 | TM | ENV-072 |
| SIT-D-075 | Antecipar como o outro vai reagir a uma notícia | 6 | IN | ENV-014 |
| SIT-D-076 | Mediar um desentendimento entre dois colegas | 6 | RP | ENV-073 |
| SIT-D-077 | Negociar uma folga com o gestor | 5 | RP | ENV-072 |
| SIT-D-078 | Recusar um pedido sem magoar | 5 | RP | ENV-024 |
| SIT-D-079 | Retomar o contato após uma briga | 6 | RE | ENV-038 |
| SIT-D-080 | Lidar com uma crítica pública com calma | 6 | RE | ENV-073 |
| SIT-D-081 | Pedir desculpas de forma genuína | 5 | RP | ENV-038 |
| SIT-D-082 | Dar espaço a alguém que precisa desabafar | 5 | TP | ENV-024 |
| SIT-D-083 | Estabelecer um limite com um amigo insistente | 5 | RP | ENV-024 |
| SIT-D-084 | Cobrar uma dívida de um amigo | 6 | RP | ENV-024 |
| SIT-D-085 | Corrigir um mal-entendido sem acusar | 6 | FI | ENV-099 |
| SIT-D-086 | Um obrigado que soou automático | 5 | RE | ENV-041 |
| SIT-D-087 | Alguém desabafa e você não sabe o que dizer | 5 | RP | ENV-024 |
| SIT-D-088 | Reconhecer quando é hora de ouvir, não aconselhar | 6 | TP | ENV-015 |
| SIT-D-089 | Perceber que a piada não foi bem recebida | 6 | TM | ENV-097 |
| SIT-D-090 | Ler o clima de uma reunião tensa | 6 | CX | ENV-073 |
| SIT-D-091 | Diferenciar firmeza de grosseria numa resposta | 6 | FI | ENV-074 |
| SIT-D-092 | Notar cansaço no outro e ajustar a conversa | 5 | TP | ENV-038 |
| SIT-D-093 | Um convite que exige ler entrelinhas | 6 | TM | ENV-095 |
| SIT-D-094 | Distinguir crítica construtiva de ataque | 6 | FI | ENV-072 |
| SIT-D-095 | Perceber quando o "não" é definitivo | 6 | IN | ENV-024 |
| SIT-D-096 | Aceitar um feedback sem se justificar | 6 | TP | ENV-072 |
| SIT-D-097 | Reagir a um elogio com naturalidade | 4 | RE | ENV-095 |
| SIT-D-098 | Perceber exclusão sutil num grupo de trabalho | 7 | TM | ENV-075 |
| SIT-D-099 | Encerrar uma conversa educadamente | 5 | RS | ENV-024 |
| SIT-D-100 | Reconhecer sinais de que magoou e reparar | 7 | TM | ENV-038 |

> **Total Biblioteca 6:** 300 situações (100 por faixa), distribuídas em dificuldade 1–7 e nos 9
> eixos. Cobertura ampliável — manter o balanceamento eixo × dificuldade × ambiente a cada lote novo.

---

## 7. Biblioteca de intenções sociais

Metas comunicativas reutilizáveis (o que um personagem quer alcançar socialmente). Alimentam a
camada de resolução de problema e as tarefas de generalização. Coluna **Grupo** para dosagem.

| ID | Intenção | Grupo | ID | Intenção | Grupo |
|---|---|---|---|---|---|
| INT-001 | Iniciar uma conversa | Iniciar | INT-028 | Agradecer | Oferecer |
| INT-002 | Cumprimentar alguém | Iniciar | INT-029 | Dar um presente | Oferecer |
| INT-003 | Apresentar-se | Iniciar | INT-030 | Consolar alguém | Oferecer |
| INT-004 | Entrar em um grupo | Iniciar | INT-031 | Encorajar alguém | Oferecer |
| INT-005 | Convidar alguém | Iniciar | INT-032 | Compartilhar uma novidade | Oferecer |
| INT-006 | Puxar assunto | Iniciar | INT-033 | Ceder a vez/o lugar | Oferecer |
| INT-007 | Aproximar-se de alguém novo | Iniciar | INT-034 | Recusar um convite | Recusar |
| INT-008 | Retomar um contato | Iniciar | INT-035 | Dizer não a um pedido | Recusar |
| INT-009 | Manter uma conversa | Manter | INT-036 | Discordar com respeito | Recusar |
| INT-010 | Revezar o turno de fala | Manter | INT-037 | Estabelecer um limite | Recusar |
| INT-011 | Mudar de assunto com naturalidade | Manter | INT-038 | Interromper de forma adequada | Recusar |
| INT-012 | Encerrar uma conversa | Manter | INT-039 | Corrigir alguém com cuidado | Recusar |
| INT-013 | Cooperar numa tarefa | Cooperar | INT-040 | Expressar alegria | Expressar |
| INT-014 | Combinar/negociar | Cooperar | INT-041 | Expressar tristeza | Expressar |
| INT-015 | Dividir algo | Cooperar | INT-042 | Expressar raiva de forma adequada | Expressar |
| INT-016 | Esperar a vez | Cooperar | INT-043 | Expressar gratidão | Expressar |
| INT-017 | Seguir a regra do grupo | Cooperar | INT-044 | Expressar afeto | Expressar |
| INT-018 | Pedir ajuda | Pedir | INT-045 | Expressar desconforto | Expressar |
| INT-019 | Pedir licença | Pedir | INT-046 | Pedir para desabafar | Expressar |
| INT-020 | Pedir desculpas | Pedir | INT-047 | Resolver um mal-entendido | Reparar |
| INT-021 | Pedir permissão | Pedir | INT-048 | Mediar um conflito | Reparar |
| INT-022 | Pedir algo emprestado | Pedir | INT-049 | Reparar uma falha | Reparar |
| INT-023 | Pedir para participar | Pedir | INT-050 | Reconhecer o próprio erro | Reparar |
| INT-024 | Pedir esclarecimento | Pedir | INT-051 | Aceitar desculpas | Reparar |
| INT-025 | Pedir para repetir | Pedir | INT-052 | Defender alguém | Reparar |
| INT-026 | Oferecer ajuda | Oferecer | INT-053 | Negociar um acordo | Reparar |
| INT-027 | Elogiar | Oferecer | INT-054 | Lidar com uma crítica | Reparar |

---

## 8. Biblioteca de perguntas (≥ 300 — templates com placeholders)

Perguntas **reutilizáveis** aplicáveis a qualquer `SocialCase` via placeholders. Colunas:
`Formato` (Etapa 1, §11) · `Nv` (nível-alvo sugerido 1–7). Itens `abertaRegistrada` são de
**discussão mediada** (não pontuados). Legenda de placeholders no topo do documento.

### 8.1 Observação / Fatos (Q-OBS)

| ID | Pergunta (template) | Formato | Nv |
|---|---|---|---|
| Q-OBS-001 | O que está acontecendo nesta cena? | escolhaUnica | 1 |
| Q-OBS-002 | Onde a cena acontece? | escolhaUnica | 1 |
| Q-OBS-003 | Quem são as pessoas na cena? | multiplaSelecao | 1 |
| Q-OBS-004 | O que {P} está fazendo? | escolhaUnica | 1 |
| Q-OBS-005 | O que aconteceu logo antes deste momento? | ordenar | 2 |
| Q-OBS-006 | Quais objetos aparecem na cena? | multiplaSelecao | 1 |
| Q-OBS-007 | Coloque os quadros na ordem em que aconteceram | ordenar | 2 |
| Q-OBS-008 | O que {P} fez com {OBJ}? | escolhaUnica | 1 |
| Q-OBS-009 | Quantas pessoas estão em {AMB}? | escolhaUnica | 1 |
| Q-OBS-010 | Qual foi a última coisa que {P} disse ou fez? | escolhaUnica | 2 |
| Q-OBS-011 | O que dá para ver na expressão de {P}? | escolherExpressao | 1 |
| Q-OBS-012 | Para onde {P} está olhando? | escolhaUnica | 2 |
| Q-OBS-013 | O que {P2} fez quando {P} chegou? | escolhaUnica | 2 |
| Q-OBS-014 | Que ações aconteceram nesta cena? | multiplaSelecao | 2 |
| Q-OBS-015 | Selecione apenas o que realmente aparece na cena | multiplaSelecao | 2 |
| Q-OBS-016 | O que mudou entre o primeiro e o último quadro? | escolhaUnica | 2 |
| Q-OBS-017 | Qual gesto {P} fez? | escolhaUnica | 1 |
| Q-OBS-018 | Onde {P} está em relação ao grupo? | escolhaUnica | 2 |
| Q-OBS-019 | O que estava no ambiente (sobre a mesa, ao redor)? | multiplaSelecao | 1 |
| Q-OBS-020 | Quem falou primeiro? | escolhaUnica | 2 |
| Q-OBS-021 | O que {P} segurava? | escolhaUnica | 1 |
| Q-OBS-022 | Qual foi a reação corporal de {P}? | escolhaUnica | 2 |
| Q-OBS-023 | Descreva apenas os fatos visíveis nesta cena | abertaRegistrada | 3 |
| Q-OBS-024 | Aponte a pista que mostra o que {P} estava fazendo | escolhaUnica | 2 |
| Q-OBS-025 | O que aconteceu com {OBJ} na cena? | escolhaUnica | 2 |
| Q-OBS-026 | Quem estava presente quando {ACAO} aconteceu? | multiplaSelecao | 2 |
| Q-OBS-027 | Qual a distância entre {P} e {P2}? | escolhaUnica | 2 |
| Q-OBS-028 | O tom de voz de {P} era alto ou baixo? | escolhaUnica | 2 |
| Q-OBS-029 | Houve silêncio em algum momento? Quando? | escolhaUnica | 3 |
| Q-OBS-030 | Quais pistas você consegue observar em {P}? | multiplaSelecao | 2 |
| Q-OBS-031 | O que {GRP} estava fazendo junto? | escolhaUnica | 2 |
| Q-OBS-032 | O ambiente estava cheio ou vazio? | escolhaUnica | 1 |
| Q-OBS-033 | O que {P} fez logo após {ACAO}? | escolhaUnica | 2 |
| Q-OBS-034 | Qual expressão facial aparece em {P2}? | escolherExpressao | 1 |
| Q-OBS-035 | Que sons ou ruídos a cena sugere? | escolhaUnica | 3 |
| Q-OBS-036 | Marque os fatos e desmarque o que não apareceu | classificar | 3 |
| Q-OBS-037 | O que estava acontecendo ao fundo da cena? | escolhaUnica | 3 |
| Q-OBS-038 | Quem entrou ou saiu da cena? | escolhaUnica | 2 |
| Q-OBS-039 | Qual foi o primeiro sinal de que algo mudou? | escolhaUnica | 3 |
| Q-OBS-040 | O que {P} fez com o corpo (postura)? | escolhaUnica | 2 |
| Q-OBS-041 | Havia mais alguém observando a cena? | escolhaUnica | 3 |
| Q-OBS-042 | Reconstitua os fatos em uma frase, sem opinião | abertaRegistrada | 4 |
| Q-OBS-043 | Qual pista aparece em mais de um quadro? | escolhaUnica | 4 |
| Q-OBS-044 | O que aconteceu ao mesmo tempo que {ACAO}? | escolhaUnica | 3 |
| Q-OBS-045 | Liste as pistas visíveis, sem interpretá-las | multiplaSelecao | 4 |

### 8.2 Emoções (Q-EMO)

| ID | Pergunta (template) | Formato | Nv |
|---|---|---|---|
| Q-EMO-001 | Como {P} está se sentindo? | escolhaUnica | 1 |
| Q-EMO-002 | Escolha a expressão que combina com {P} | escolherExpressao | 1 |
| Q-EMO-003 | Qual a intensidade da emoção de {P}? | escala | 2 |
| Q-EMO-004 | Por que {P} está se sentindo assim? | escolhaUnica | 2 |
| Q-EMO-005 | Quais pistas mostram a emoção de {P}? | multiplaSelecao | 2 |
| Q-EMO-006 | {P} e {P2} sentem a mesma coisa? | escolhaUnica | 3 |
| Q-EMO-007 | A emoção de {P} mudou ao longo da cena? | escolhaUnica | 3 |
| Q-EMO-008 | Qual emoção NÃO combina com o que se vê em {P}? | escolhaUnica | 2 |
| Q-EMO-009 | {P} pode estar sentindo mais de uma emoção? Quais? | multiplaSelecao | 5 |
| Q-EMO-010 | O sorriso de {P} indica alegria mesmo? Por quê? | escolhaUnica | 4 |
| Q-EMO-011 | Como {P2} reagiu emocionalmente a {ACAO}? | escolhaUnica | 3 |
| Q-EMO-012 | Qual pista foi mais importante para ler a emoção? | escolhaUnica | 3 |
| Q-EMO-013 | A emoção de {P} combina com o contexto? | escolhaUnica | 4 |
| Q-EMO-014 | Que emoção o tom de voz de {P} sugere? | escolhaUnica | 3 |
| Q-EMO-015 | {P} está escondendo alguma emoção? Qual? | escolhaUnica | 5 |
| Q-EMO-016 | Ordene as emoções de {P} do início ao fim | ordenar | 4 |
| Q-EMO-017 | O que o corpo de {P} revela sobre como se sente? | escolhaUnica | 2 |
| Q-EMO-018 | Como {P} provavelmente vai se sentir depois? | escolhaUnica | 4 |
| Q-EMO-019 | A emoção de {P} é agradável ou desagradável? | escolhaUnica | 1 |
| Q-EMO-020 | {P} parece calmo ou agitado? Em que se percebe? | escolhaUnica | 2 |
| Q-EMO-021 | Qual emoção o silêncio de {P} pode indicar? | escolhaUnica | 4 |
| Q-EMO-022 | Duas pistas de {P} apontam emoções diferentes — o que fazer? | escolhaUnica | 5 |
| Q-EMO-023 | Como distinguir se {P} está com raiva ou com medo? | escolhaUnica | 4 |
| Q-EMO-024 | O que causou a mudança de humor de {P}? | escolhaUnica | 4 |
| Q-EMO-025 | {P} está desapontado consigo ou com o outro? | escolhaUnica | 5 |
| Q-EMO-026 | Qual seria uma leitura equivocada da emoção de {P}? | escolhaUnica | 5 |
| Q-EMO-027 | A reação de {P} foi proporcional ao que aconteceu? | escala | 5 |
| Q-EMO-028 | Que emoção aparece em {GRP} como um todo? | escolhaUnica | 4 |
| Q-EMO-029 | Como {P} demonstra alegria sem falar? | multiplaSelecao | 2 |
| Q-EMO-030 | O rosto de {P} está neutro — o que isso pode querer dizer? | escolhaUnica | 4 |
| Q-EMO-031 | {P} sente vergonha ou culpa? Qual a diferença aqui? | escolhaUnica | 6 |
| Q-EMO-032 | Escolha a face que mostra como {P2} ficou no fim | escolherExpressao | 2 |
| Q-EMO-033 | A emoção de {P} combina com a fala dele? | escolhaUnica | 5 |
| Q-EMO-034 | Que sinais mostram que {P} está ansioso? | multiplaSelecao | 3 |
| Q-EMO-035 | {P} parece aliviado ou feliz? Como saber? | escolhaUnica | 5 |
| Q-EMO-036 | O que a emoção de {P} diz sobre o que ele queria? | escolhaUnica | 5 |
| Q-EMO-037 | Qual emoção é mais forte em {P} neste momento? | escolhaUnica | 3 |
| Q-EMO-038 | {P} demonstra empatia pelo outro? Em que se vê? | escolhaUnica | 5 |
| Q-EMO-039 | Como nomear a emoção mista que {P} demonstra? | escolhaUnica | 6 |
| Q-EMO-040 | A emoção de {P} foi causada por {P2} ou por {ACAO}? | escolhaUnica | 4 |
| Q-EMO-041 | Registre com suas palavras como {P} se sente e por quê | abertaRegistrada | 4 |
| Q-EMO-042 | {P} demonstra orgulho ou arrogância? Diferencie | escolhaUnica | 6 |
| Q-EMO-043 | O que mudaria a sua leitura da emoção de {P}? | escolhaUnica | 6 |
| Q-EMO-044 | Qual pista contradiz a primeira impressão sobre {P}? | escolhaUnica | 6 |
| Q-EMO-045 | Dois leem a emoção de {P} diferente — quem se apoia nas pistas? | escolhaUnica | 6 |

### 8.3 Contexto (Q-CTX)

| ID | Pergunta (template) | Formato | Nv |
|---|---|---|---|
| Q-CTX-001 | O que o lugar ({AMB}) nos diz sobre a situação? | escolhaUnica | 1 |
| Q-CTX-002 | Que regra vale neste ambiente? | escolhaUnica | 2 |
| Q-CTX-003 | O que se espera das pessoas em {AMB}? | escolhaUnica | 2 |
| Q-CTX-004 | O momento (hora/ocasião) muda o sentido da cena? | escolhaUnica | 3 |
| Q-CTX-005 | O que aconteceu antes ajuda a entender o agora? | escolhaUnica | 3 |
| Q-CTX-006 | Qual o papel de {P} neste lugar? | escolhaUnica | 2 |
| Q-CTX-007 | A relação entre {P} e {P2} muda a leitura do gesto? | escolhaUnica | 4 |
| Q-CTX-008 | O mesmo gesto em outro lugar teria outro sentido? | escolhaUnica | 5 |
| Q-CTX-009 | Que informação do contexto falta para concluir? | escolhaUnica | 5 |
| Q-CTX-010 | O ambiente é formal ou informal? Como isso afeta? | escolhaUnica | 3 |
| Q-CTX-011 | O que o objeto {OBJ} indica sobre a situação? | escolhaUnica | 2 |
| Q-CTX-012 | Qual pista do ambiente explica o comportamento de {P}? | escolhaUnica | 3 |
| Q-CTX-013 | A cena seria diferente em outro ambiente? Como? | escolhaUnica | 5 |
| Q-CTX-014 | O barulho ou silêncio do local influencia a cena? | escolhaUnica | 3 |
| Q-CTX-015 | O que a ocasião ({ACAO}) exige das pessoas? | escolhaUnica | 3 |
| Q-CTX-016 | Qual expectativa social vale para {AMB}? | escolhaUnica | 4 |
| Q-CTX-017 | O contexto justifica a reação de {P}? | escolhaUnica | 4 |
| Q-CTX-018 | Que detalhe do cenário passa despercebido mas importa? | escolhaUnica | 5 |
| Q-CTX-019 | O histórico entre os personagens muda a leitura? | escolhaUnica | 5 |
| Q-CTX-020 | O que muda se {P} for chefe em vez de colega? | escolhaUnica | 5 |
| Q-CTX-021 | A hora do dia sugere o quê sobre a cena? | escolhaUnica | 3 |
| Q-CTX-022 | Que regra implícita está em jogo aqui? | escolhaUnica | 4 |
| Q-CTX-023 | O comportamento de {P} combina com o lugar? | escolhaUnica | 3 |
| Q-CTX-024 | Quais pistas do ambiente ajudam a entender a cena? | multiplaSelecao | 4 |
| Q-CTX-025 | O que as pessoas ao redor esperam de {P}? | escolhaUnica | 4 |
| Q-CTX-026 | Selecione as pistas do ambiente que ajudam a entender | multiplaSelecao | 3 |
| Q-CTX-027 | Falta contexto para ter certeza? O que você perguntaria? | abertaRegistrada | 5 |
| Q-CTX-028 | O que a organização do lugar revela? | escolhaUnica | 3 |
| Q-CTX-029 | Como o mesmo evento muda entre {AMB} e outro lugar? | escolhaUnica | 5 |
| Q-CTX-030 | Que combinado anterior explica a cena? | escolhaUnica | 4 |
| Q-CTX-031 | O costume do lugar afeta o gesto de {P}? | escolhaUnica | 6 |
| Q-CTX-032 | O papel social de {P2} muda o que é esperado? | escolhaUnica | 4 |
| Q-CTX-033 | Qual informação do contexto pesa mais aqui? | escolhaUnica | 5 |
| Q-CTX-034 | O que se sabe da cena só pelo cenário, sem as falas? | escolhaUnica | 3 |
| Q-CTX-035 | O ambiente pede voz baixa ou alta? Por quê? | escolhaUnica | 2 |
| Q-CTX-036 | Que expectativa {P} tinha ao entrar em {AMB}? | escolhaUnica | 4 |
| Q-CTX-037 | O contexto torna o comportamento adequado ou não? | escolhaUnica | 4 |
| Q-CTX-038 | O que muda se a cena for numa festa em vez de na aula? | escolhaUnica | 4 |
| Q-CTX-039 | Qual pista do ambiente foi decisiva para você? | escolhaUnica | 4 |
| Q-CTX-040 | Como o contexto ajuda a separar acidente de intenção? | escolhaUnica | 6 |
| Q-CTX-041 | O que o momento anterior a {ACAO} explica? | escolhaUnica | 4 |
| Q-CTX-042 | A cena tem informação suficiente para concluir? | escolhaUnica | 5 |
| Q-CTX-043 | Registre quais dados do contexto você usou | abertaRegistrada | 5 |
| Q-CTX-044 | Que suposição sobre o contexto poderia estar errada? | escolhaUnica | 6 |
| Q-CTX-045 | Como o papel de cada um organiza a cena? | escolhaUnica | 5 |

### 8.4 Perspectiva / Teoria da mente (Q-PER) — inclui Fato × Interpretação

| ID | Pergunta (template) | Formato | Nv |
|---|---|---|---|
| Q-PER-001 | O que {P} está pensando neste momento? | escolhaUnica | 3 |
| Q-PER-002 | O que {P} quer ou deseja? | escolhaUnica | 3 |
| Q-PER-003 | {P} sabe o que aconteceu? | escolhaUnica | 3 |
| Q-PER-004 | O que {P} NÃO sabe que {P2} sabe? | escolhaUnica | 4 |
| Q-PER-005 | Onde {P} vai procurar {OBJ}? | escolhaUnica | 4 |
| Q-PER-006 | {P} acredita em algo que não é verdade? O quê? | escolhaUnica | 4 |
| Q-PER-007 | Como a situação parece do ponto de vista de {P2}? | escolhaUnica | 4 |
| Q-PER-008 | {P} e {P2} têm a mesma informação? | escolhaUnica | 4 |
| Q-PER-009 | O que {P} acha que {P2} está pensando? | escolhaUnica | 5 |
| Q-PER-010 | {P} pensa que {P2} sabe do segredo? | escolhaUnica | 5 |
| Q-PER-011 | Classifique cada frase como Fato ou Interpretação | classificar | 4 |
| Q-PER-012 | "{P} está bravo" é fato ou interpretação? | escolhaUnica | 4 |
| Q-PER-013 | O que é fato e o que é suposição nesta cena? | classificar | 4 |
| Q-PER-014 | Como {P} interpretou o gesto de {P2}? | escolhaUnica | 5 |
| Q-PER-015 | A interpretação de {P} está apoiada em pistas? | escolhaUnica | 5 |
| Q-PER-016 | Existe outra explicação para o que {P} fez? | multiplaSelecao | 5 |
| Q-PER-017 | O que {P2} esperava que {P} fizesse? | escolhaUnica | 4 |
| Q-PER-018 | Como você veria a cena no lugar de {P}? | abertaRegistrada | 4 |
| Q-PER-019 | {P} entendeu a intenção de {P2}? | escolhaUnica | 5 |
| Q-PER-020 | O que muda ao olhar pela perspectiva de {P2}? | escolhaUnica | 5 |
| Q-PER-021 | {P} sabe que {P2} está triste? | escolhaUnica | 4 |
| Q-PER-022 | O que {P} imagina que vai acontecer? | escolhaUnica | 4 |
| Q-PER-023 | A conclusão de {P} é a única possível? | escolhaUnica | 5 |
| Q-PER-024 | {P} concluiu algo sem ter todas as informações? | escolhaUnica | 5 |
| Q-PER-025 | O que {P2} gostaria que {P} entendesse? | escolhaUnica | 5 |
| Q-PER-026 | {P} acha que a piada foi para ele — está certo? | escolhaUnica | 6 |
| Q-PER-027 | Como duas pessoas podem ver o mesmo fato diferente? | escolhaUnica | 5 |
| Q-PER-028 | O que {P} sabe que muda a leitura da cena? | escolhaUnica | 5 |
| Q-PER-029 | O que {P} pensa que {P2} pensa sobre ele? | escolhaUnica | 6 |
| Q-PER-030 | Qual crença de {P} não bate com a realidade? | escolhaUnica | 4 |
| Q-PER-031 | O que seria preciso saber para entender {P}? | escolhaUnica | 5 |
| Q-PER-032 | {P} agiu com base num engano? Qual? | escolhaUnica | 5 |
| Q-PER-033 | A intenção de {P} foi a mesma que {P2} entendeu? | escolhaUnica | 5 |
| Q-PER-034 | Classifique: o que {P} viu × o que {P} concluiu | classificar | 5 |
| Q-PER-035 | O que você diria a {P} para ver o outro lado? | abertaRegistrada | 6 |
| Q-PER-036 | {P} consegue imaginar como {P2} se sente? | escolhaUnica | 5 |
| Q-PER-037 | A fala de {P} tem um sentido diferente do literal? | escolhaUnica | 6 |
| Q-PER-038 | {P} percebeu a ironia de {P2}? | escolhaUnica | 6 |
| Q-PER-039 | O que {P} realmente quis dizer? | escolhaUnica | 6 |
| Q-PER-040 | De quantos pontos de vista dá para ver esta cena? | escolhaUnica | 6 |
| Q-PER-041 | {P} está julgando por um fato ou por uma suposição? | escolhaUnica | 5 |
| Q-PER-042 | O que {P2} sabe que faria {P} mudar de ideia? | escolhaUnica | 6 |
| Q-PER-043 | Qual perspectiva foi esquecida na cena? | escolhaUnica | 6 |
| Q-PER-044 | {P} atribuiu uma intenção que não existia? | escolhaUnica | 6 |
| Q-PER-045 | Separe, por escrito, o que {P} pensou: fato × interpretação | abertaRegistrada | 6 |

### 8.5 Regras sociais / Julgamento (Q-REG)

| ID | Pergunta (template) | Formato | Nv |
|---|---|---|---|
| Q-REG-001 | Qual regra vale em {AMB}? | escolhaUnica | 2 |
| Q-REG-002 | O que {P} deveria fazer neste lugar? | escolhaUnica | 2 |
| Q-REG-003 | O comportamento de {P} respeitou a regra? | escolhaUnica | 3 |
| Q-REG-004 | Que regra {P} quebrou? | escolhaUnica | 3 |
| Q-REG-005 | A regra aqui é dita ou subentendida? | escolhaUnica | 4 |
| Q-REG-006 | O que é esperado de {P} em {AMB}? | escolhaUnica | 2 |
| Q-REG-007 | A atitude de {P} foi adequada ao lugar? | escolhaUnica | 3 |
| Q-REG-008 | Qual seria a atitude mais adequada aqui? | escolhaUnica | 3 |
| Q-REG-009 | A regra muda se o lugar mudar? Como? | escolhaUnica | 5 |
| Q-REG-010 | Existe uma regra implícita sendo ignorada? | escolhaUnica | 4 |
| Q-REG-011 | O que {P} precisaria saber para agir certo aqui? | escolhaUnica | 4 |
| Q-REG-012 | A regra vale para todos igualmente nesta cena? | escolhaUnica | 5 |
| Q-REG-013 | A situação é uma exceção à regra? | escolhaUnica | 5 |
| Q-REG-014 | O que acontece se {P} não seguir a regra? | escolhaUnica | 3 |
| Q-REG-015 | Classifique as atitudes em adequadas e inadequadas | classificar | 3 |
| Q-REG-016 | Qual regra ajudaria a resolver esta cena? | escolhaUnica | 4 |
| Q-REG-017 | A regra deste lugar é a mesma da casa de {P}? | escolhaUnica | 4 |
| Q-REG-018 | {P} sabia da regra? Isso muda o julgamento? | escolhaUnica | 5 |
| Q-REG-019 | O que a boa convivência pede nesta situação? | escolhaUnica | 3 |
| Q-REG-020 | Há regras diferentes para {P} e {P2}? Por quê? | escolhaUnica | 5 |
| Q-REG-021 | A regra é sobre segurança, respeito ou convivência? | escolhaUnica | 4 |
| Q-REG-022 | O que muda na regra numa ocasião especial ({ACAO})? | escolhaUnica | 5 |
| Q-REG-023 | A atitude de {P} foi firme ou grosseira? | escolhaUnica | 6 |
| Q-REG-024 | Seguir a regra aqui pode conflitar com ajudar? | escolhaUnica | 6 |
| Q-REG-025 | Quando é certo quebrar uma regra por um bem maior? | escolhaUnica | 7 |
| Q-REG-026 | O que é combinado e o que é só costume nesta cena? | classificar | 5 |
| Q-REG-027 | {P} respeitou a vez dos outros? | escolhaUnica | 2 |
| Q-REG-028 | A regra protege quem nesta situação? | escolhaUnica | 5 |
| Q-REG-029 | A atitude esperada muda com a idade de {P}? | escolhaUnica | 5 |
| Q-REG-030 | O que seria justo fazer aqui? | escolhaUnica | 4 |
| Q-REG-031 | Existe mais de uma atitude adequada? Quais? | multiplaSelecao | 5 |
| Q-REG-032 | A regra do local aparece em algum ponto da cena? | escolhaUnica | 4 |
| Q-REG-033 | O comportamento de {GRP} seguiu a norma do lugar? | escolhaUnica | 4 |
| Q-REG-034 | Como {P} poderia discordar sem desrespeitar? | escolhaUnica | 5 |
| Q-REG-035 | O que {P} deveria ter pedido antes de agir? | escolhaUnica | 3 |
| Q-REG-036 | Qual regra social evita o mal-entendido aqui? | escolhaUnica | 5 |
| Q-REG-037 | A regra deste ambiente é rígida ou flexível? | escolhaUnica | 5 |
| Q-REG-038 | O que muda se houver um idoso ou criança na cena? | escolhaUnica | 5 |
| Q-REG-039 | A atitude de {P} respeitou o espaço de {P2}? | escolhaUnica | 4 |
| Q-REG-040 | Avalie o quão adequada foi a atitude de {P} | escala | 4 |
| Q-REG-041 | Qual norma implícita {P2} esperava que {P} seguisse? | escolhaUnica | 5 |
| Q-REG-042 | A situação pede seguir a regra ou usar o bom senso? | escolhaUnica | 6 |
| Q-REG-043 | Registre qual regra você usaria para orientar {P} | abertaRegistrada | 5 |
| Q-REG-044 | Duas regras entram em conflito — qual pesa mais? | escolhaUnica | 7 |
| Q-REG-045 | A regra foi quebrada por engano ou de propósito? | escolhaUnica | 6 |

### 8.6 Solução de problemas sociais (Q-SOL)

| ID | Pergunta (template) | Formato | Nv |
|---|---|---|---|
| Q-SOL-001 | O que {P} pode fazer agora? | escolhaUnica | 2 |
| Q-SOL-002 | Qual seria a melhor atitude de {P}? | escolhaUnica | 3 |
| Q-SOL-003 | Liste opções de ação para {P} | multiplaSelecao | 4 |
| Q-SOL-004 | Qual opção resolve sem magoar ninguém? | escolhaUnica | 4 |
| Q-SOL-005 | O que aconteceria se {P} fizesse {ACAO}? | escolhaUnica | 4 |
| Q-SOL-006 | Ordene os passos para resolver a situação | ordenar | 4 |
| Q-SOL-007 | Qual a primeira coisa que {P} deveria fazer? | escolhaUnica | 3 |
| Q-SOL-008 | Como {P} pode pedir ajuda aqui? | escolhaUnica | 2 |
| Q-SOL-009 | O que {P} pode dizer para {P2}? | escolhaUnica | 3 |
| Q-SOL-010 | Qual solução é boa para os dois lados? | escolhaUnica | 5 |
| Q-SOL-011 | O que evitaria o conflito nesta cena? | escolhaUnica | 4 |
| Q-SOL-012 | Como {P} pode reparar o que fez? | escolhaUnica | 4 |
| Q-SOL-013 | Qual opção NÃO ajudaria a resolver? | escolhaUnica | 4 |
| Q-SOL-014 | Como {P} pode entrar no grupo com respeito? | escolhaUnica | 3 |
| Q-SOL-015 | O que {P} pode fazer para se acalmar antes de agir? | escolhaUnica | 3 |
| Q-SOL-016 | Quais consequências cada escolha traz? | multiplaSelecao | 5 |
| Q-SOL-017 | Como {P} pode dizer não sem ser grosseiro? | escolhaUnica | 5 |
| Q-SOL-018 | Qual seria uma solução criativa para a cena? | abertaRegistrada | 5 |
| Q-SOL-019 | Como {P} pode se desculpar de verdade? | escolhaUnica | 4 |
| Q-SOL-020 | O que {P} pode propor para dividir de forma justa? | escolhaUnica | 4 |
| Q-SOL-021 | Como {P} pode checar se entendeu certo antes de reagir? | escolhaUnica | 5 |
| Q-SOL-022 | Qual atitude previne o mal-entendido? | escolhaUnica | 5 |
| Q-SOL-023 | O que {P} pode fazer se a solução não der certo? | escolhaUnica | 5 |
| Q-SOL-024 | Como {P} pode incluir quem está de fora? | escolhaUnica | 4 |
| Q-SOL-025 | Qual passo {P} pode dar para retomar a amizade? | escolhaUnica | 5 |
| Q-SOL-026 | Como {P} pode expressar o que sente sem brigar? | escolhaUnica | 5 |
| Q-SOL-027 | Qual a melhor forma de {P} pedir o que precisa? | escolhaUnica | 3 |
| Q-SOL-028 | O que ajudaria {P} e {P2} a se entenderem? | escolhaUnica | 5 |
| Q-SOL-029 | Como {P} pode ser firme e respeitoso ao mesmo tempo? | escolhaUnica | 6 |
| Q-SOL-030 | Qual solução respeita a regra do lugar? | escolhaUnica | 4 |
| Q-SOL-031 | O que {P} pode fazer para não repetir o erro? | escolhaUnica | 4 |
| Q-SOL-032 | Como {P} pode mediar a briga entre {P2} e {GRP}? | escolhaUnica | 6 |
| Q-SOL-033 | Compare duas soluções: qual é melhor e por quê? | escolhaUnica | 6 |
| Q-SOL-034 | O que {P} pode dizer para consolar {P2}? | escolhaUnica | 4 |
| Q-SOL-035 | Qual atitude protege a todos nesta cena? | escolhaUnica | 5 |
| Q-SOL-036 | Como {P} pode se desculpar e manter a amizade? | escolhaUnica | 5 |
| Q-SOL-037 | O que fazer quando não se sabe o que o outro quer? | escolhaUnica | 5 |
| Q-SOL-038 | Qual é a solução mais gentil que ainda resolve? | escolhaUnica | 5 |
| Q-SOL-039 | Como {P} pode agir sem piorar a situação? | escolhaUnica | 5 |
| Q-SOL-040 | O que {P} poderia ter feito diferente antes? | escolhaUnica | 5 |
| Q-SOL-041 | Registre um plano de 3 passos para {P} | abertaRegistrada | 5 |
| Q-SOL-042 | Qual opção equilibra o que {P} quer e o que {P2} precisa? | escolhaUnica | 6 |
| Q-SOL-043 | Como {P} pode reconhecer o próprio erro na conversa? | escolhaUnica | 6 |
| Q-SOL-044 | Qual solução você escolheria e por quê? | abertaRegistrada | 6 |
| Q-SOL-045 | Se a primeira ideia falhar, qual seria o plano B? | escolhaUnica | 6 |

### 8.7 Generalização (Q-GEN) — majoritariamente discussão mediada

| ID | Pergunta (template) | Formato | Nv |
|---|---|---|---|
| Q-GEN-001 | Onde na sua vida isso poderia acontecer? | abertaRegistrada | 3 |
| Q-GEN-002 | Você já viveu algo parecido? | abertaRegistrada | 3 |
| Q-GEN-003 | O que você faria numa situação assim? | abertaRegistrada | 4 |
| Q-GEN-004 | Como essa lição serve para um {AMB} diferente? | escolhaUnica | 5 |
| Q-GEN-005 | A mesma pista significa o mesmo em outro lugar? | escolhaUnica | 5 |
| Q-GEN-006 | Que outra situação treina a mesma habilidade? | escolhaUnica | 5 |
| Q-GEN-007 | Como usar isso com a sua família? | abertaRegistrada | 4 |
| Q-GEN-008 | Como usar isso na escola ou no trabalho? | abertaRegistrada | 4 |
| Q-GEN-009 | O que muda se a pessoa for um amigo em vez de estranho? | escolhaUnica | 5 |
| Q-GEN-010 | Que sinal você vai observar da próxima vez? | abertaRegistrada | 4 |
| Q-GEN-011 | Como aplicar esta solução numa conversa online? | escolhaUnica | 5 |
| Q-GEN-012 | A regra desta cena vale numa festa também? | escolhaUnica | 5 |
| Q-GEN-013 | Que emoção você aprendeu a reconhecer melhor? | abertaRegistrada | 4 |
| Q-GEN-014 | Onde mais essa emoção costuma aparecer? | escolhaUnica | 4 |
| Q-GEN-015 | Como explicar esta situação para outra pessoa? | abertaRegistrada | 5 |
| Q-GEN-016 | O que você faria diferente se fosse com você? | abertaRegistrada | 5 |
| Q-GEN-017 | Que pista você levaria para a vida real? | abertaRegistrada | 4 |
| Q-GEN-018 | Como saber a hora de pedir ajuda no dia a dia? | escolhaUnica | 4 |
| Q-GEN-019 | Em que outro ambiente essa regra também vale? | escolhaUnica | 5 |
| Q-GEN-020 | Como perceber, na vida real, que alguém quer conversar? | escolhaUnica | 5 |
| Q-GEN-021 | O que faria se um colega agisse assim com você? | abertaRegistrada | 5 |
| Q-GEN-022 | Como transformar esta lição num hábito? | abertaRegistrada | 6 |
| Q-GEN-023 | Que situação da sua semana lembra esta cena? | abertaRegistrada | 4 |
| Q-GEN-024 | Como reconheceria essa intenção fora daqui? | escolhaUnica | 6 |
| Q-GEN-025 | O que combinar de observar até a próxima sessão? | abertaRegistrada | 5 |
| Q-GEN-026 | Como essa habilidade ajuda numa amizade? | abertaRegistrada | 5 |
| Q-GEN-027 | Qual parte disso é mais difícil na sua rotina? | abertaRegistrada | 5 |
| Q-GEN-028 | Como aplicar "separar fato de interpretação" no seu dia? | abertaRegistrada | 6 |
| Q-GEN-029 | Que sinal de emoção você quer treinar a notar? | abertaRegistrada | 4 |
| Q-GEN-030 | Como pedir a perspectiva do outro numa discussão real? | escolhaUnica | 6 |
| Q-GEN-031 | O que muda se a mesma cena for por mensagem? | escolhaUnica | 6 |
| Q-GEN-032 | Como usar isso quando estiver com pressa ou nervoso? | escolhaUnica | 6 |
| Q-GEN-033 | Que atitude desta cena você levaria para casa? | abertaRegistrada | 4 |
| Q-GEN-034 | Onde você poderia praticar isso esta semana? | abertaRegistrada | 5 |
| Q-GEN-035 | Como reconhecer a mesma situação com outras pessoas? | escolhaUnica | 6 |
| Q-GEN-036 | O que faria se ninguém percebesse a pista? | escolhaUnica | 6 |
| Q-GEN-037 | Como adaptar a solução para um adulto ou uma criança? | escolhaUnica | 6 |
| Q-GEN-038 | Que regra desta cena é universal e qual depende do lugar? | classificar | 6 |
| Q-GEN-039 | Como você contaria esta situação sem opinar? | abertaRegistrada | 5 |
| Q-GEN-040 | O que observaria antes de concluir, na vida real? | abertaRegistrada | 5 |
| Q-GEN-041 | Como treinar essa leitura fora do consultório? | abertaRegistrada | 6 |
| Q-GEN-042 | Que pista você confundia e agora entende melhor? | abertaRegistrada | 5 |
| Q-GEN-043 | Como pedir para o outro explicar o que quis dizer? | escolhaUnica | 5 |
| Q-GEN-044 | Onde essa habilidade faria diferença na sua semana? | abertaRegistrada | 5 |
| Q-GEN-045 | Que meta social você quer treinar até a próxima sessão? | abertaRegistrada | 6 |

> **Total Biblioteca 8:** 315 perguntas-template (7 categorias × 45), cobrindo níveis 1–7 e todos
> os formatos de resposta. Itens `abertaRegistrada` = discussão mediada (não pontuados).

---

## 9. Biblioteca de dificuldades cognitivas

Dificuldades que podem aparecer durante o treino. **Descritivas, não diagnósticas** — servem para
o software sinalizar padrões ao profissional (nunca para rotular o paciente). Coluna "Sinal no app"
= como o padrão pode ser inferido dos indicadores objetivos (Bib. 10).

| ID | Dificuldade | O que é | Como se manifesta no treino | Sinal no app |
|---|---|---|---|---|
| DIF-001 | Reconhecer emoções | Não nomear/identificar a emoção | Erra a emoção mesmo com pistas claras | Baixa acurácia em Q-EMO |
| DIF-002 | Diferenciar emoções semelhantes | Confundir estados próximos | Troca raiva/medo, vergonha/culpa | Confusões emocionais recorrentes |
| DIF-003 | Integrar o contexto | Ler a emoção ignorando ambiente/histórico | Acerta isolado, erra quando o contexto pesa | Queda em Q-CTX; acerto em Q-EMO |
| DIF-004 | Rigidez cognitiva | Fixar numa interpretação e não revisar | Mantém a resposta mesmo com nova pista | "Mudança de interpretação" ≈ 0 |
| DIF-005 | Compreender perspectivas (ToM 1ª ordem) | Não separar o que sabe do que o outro sabe | Erra tarefas de falsa crença | Erros em Q-PER-005/006 |
| DIF-006 | Teoria da mente de 2ª ordem | Não aninhar estados mentais | Erra "o que X pensa que Y pensa" | Erros em Q-PER-009/029 |
| DIF-007 | Gerar hipóteses | Enxergar uma única explicação | Poucas opções; abandona cedo | Baixo nº de hipóteses |
| DIF-008 | Viés de interpretação negativa | Presumir intenção hostil | Escolhe distratores hostis/de super-interpretação | Erro tipo "super-interpretação" |
| DIF-009 | Coerência central fraca | Fixar num detalhe e perder o todo | Usa 1 pista, ignora as demais | Erra itens que exigem convergência |
| DIF-010 | Separar fato de interpretação | Tratar suposição como fato | Classifica interpretações como fatos | Baixo índice Fato×Interpretação |
| DIF-011 | Egocentrismo social | Assumir que o outro sabe/sente o mesmo que ele | Projeta o próprio estado no outro | Erros de perspectiva com projeção |
| DIF-012 | Linguagem não literal | Não captar ironia/indiretas | Interpreta ironia ao pé da letra | Erra itens de ironia (Nv 6–7) |
| DIF-013 | Inferência causal | Não ligar pista → causa | Não explica o porquê da emoção/ação | Erros em Q-EMO-004, Q-SOL-005 |
| DIF-014 | Antecipar consequências | Não projetar o que vem depois | Não prevê o desfecho | Erros em inferência de desfecho |
| DIF-015 | Impulsividade na resposta | Responder antes de observar | Latência muito baixa seguida de erro | Resposta rápida + erro |
| DIF-016 | Lentidão no processamento social | Precisar de muito tempo | Latência alta e consistente | Latência mediana elevada |
| DIF-017 | Tomada de decisão social | Travar entre opções | Demora e troca respostas em Q-SOL | Tempo alto + trocas |
| DIF-018 | Dependência de andaime | Só acertar com dica/realce | Desempenho cai ao remover o suporte | Alta taxa de uso de dicas |
| DIF-019 | Julgamento de adequação | Não avaliar o adequado ao contexto | Erra o que é apropriado ao lugar | Baixa acurácia em Q-REG |
| DIF-020 | Generalizar | Não transferir para novo contexto | Cai nos casos de transferência | Baixo índice de transferência |

---

## 10. Biblioteca de indicadores clínicos

Todos os indicadores que o aplicativo pode **registrar objetivamente** (persistidos em
`Session.metadata` / `ExerciseConfig`). Alimentam os relatórios da Etapa 1 (§12–13). **Nenhum
depende de interpretação semântica em runtime.**

| ID | Indicador | O que registra | Como é capturado |
|---|---|---|---|
| IND-001 | Tempo de resposta por item | Latência individual | Timestamp entre exibir e responder |
| IND-002 | Latência mediana por camada | Velocidade por tipo de pergunta | Agregação por camada |
| IND-003 | Acurácia global | % de itens pontuáveis corretos | Comparação com gabarito |
| IND-004 | Acurácia por eixo social | Perfil por RE/TM/FI/… | Agregação por eixo |
| IND-005 | Acurácia por camada | Onde acerta/erra na cadeia | Agregação por camada |
| IND-006 | Necessidade de ajuda | Nº e nível de dicas usadas | Contador de andaime |
| IND-007 | Uso de realce de pistas | Quantas vezes destacou pistas | Contador de interação |
| IND-008 | Nº de hipóteses levantadas | Amplitude de raciocínio | Seleções em múltipla escolha/abertos |
| IND-009 | Flexibilidade | Ajuste diante de nova pista | Mudança de resposta antes de confirmar |
| IND-010 | Mudança de interpretação | Revisão após feedback | Diferença entre tentativas |
| IND-011 | Justificativa utilizada | Como o paciente explica | Registro de item aberto (qualitativo) |
| IND-012 | Tipo de erro (ErroSocialTipo) | Natureza do erro | Distrator escolhido → categoria |
| IND-013 | Índice Fato×Interpretação | Distinção fato/suposição | Acurácia nos itens `classificar` |
| IND-014 | Ordem de ToM alcançada | Marco de teoria da mente | Maior ordem com acerto estável |
| IND-015 | Taxa de acerto de primeira | Sem tentativa prévia | Acerto com 0 erros no item |
| IND-016 | Nº de tentativas por item | Esforço até acertar | Contador de tentativas |
| IND-017 | Autonomia | Independência de suporte | 1 − uso de andaime |
| IND-018 | Consistência entre sessões | Estabilidade do ganho | Variância inter-sessões |
| IND-019 | Persistência | Conclui ou abandona o caso | Estado final do caso |
| IND-020 | Impulsividade | Resposta rápida com erro | Latência baixa + incorreta |
| IND-021 | Reconhecimento por emoção | Acerto por rótulo emocional | Acurácia por `EmocaoRotulo` |
| IND-022 | Confusões emocionais | Pares trocados com frequência | Matriz de confusão de emoções |
| IND-023 | Transferência | Desempenho em contexto novo | Acurácia em casos de transferência |
| IND-024 | Nível trabalhado/alcançado | Dificuldade corrente e máxima | `ExerciseConfig.currentDifficulty` |
| IND-025 | Progressão no tempo | Tendência por eixo | Série temporal por eixo |
| IND-026 | Adequação do julgamento | Leitura de regras/adequação | Acurácia Q-REG + escalas |
| IND-027 | Qualidade da solução | Nível da opção escolhida | Ranking da opção em Q-SOL |
| IND-028 | Engajamento na discussão | Presença de registro mediado | Flag de item aberto respondido |
| IND-029 | Tempo/volume de sessão | Duração e nº de casos | Agregação de sessão |
| IND-030 | Índice de Cognição Social (ICS) | Composto ponderado dos eixos | Fórmula sobre IND-004 |

---

## Integração com a Etapa 1 (como a biblioteca alimenta o gerador)

- Um `SocialCase` (Etapa 1, §10) é montado escolhendo **dentro** destas tabelas: `faixa`+`nivel`
  filtram a Bib. 6 (situação) e a Bib. 5 (personagens); a Bib. 3/4 fixam ambiente e regras; a
  Bib. 1/2 definem emoções-alvo e pistas convergentes; a Bib. 7 dá a intenção social; a Bib. 8
  fornece as perguntas por camada; a Bib. 9/10 orientam distratores e o que registrar.
- **Rastreabilidade obrigatória:** todo item pontuável referencia por ID a(s) pista(s) que o
  sustentam (regra §16 da Etapa 1) e mapeia cada distrator a um `ErroSocialTipo` (Bib. 9).
- **Convergência de pistas:** todo item de emoção exige **≥2 pistas** da Bib. 2 apontando para o
  mesmo estado — nenhuma leitura sai de pista isolada.
- **Balanceamento:** o gerador deve cobrir eixo × dificuldade × ambiente × faixa de forma
  distribuída; um painel de cobertura acompanha lacunas a cada lote.
- **Governança:** a IA preenche o schema escolhendo destas listas; validação automática +
  **revisão humana** antes de publicar. Runtime é determinístico (sem IA, sem interpretação do
  paciente). Ver `INVESTIGADORES-SOCIAIS-SPEC.md` (Anexo B).

## Resumo de volumes

| Biblioteca | Itens |
|---|---|
| 1. Emoções | 32 (6 básicas · 12 intermediárias · 14 complexas) |
| 2. Pistas sociais | ~90 em 11 categorias |
| 3. Regras sociais | 16 ambientes × 4 dimensões |
| 4. Ambientes | 100 |
| 5. Personagens | 44 perfis (4 faixas) |
| 6. Situações | 300 (100 por faixa, dif. 1–7) |
| 7. Intenções sociais | 54 |
| 8. Perguntas | 315 templates (7 categorias × 45) |
| 9. Dificuldades cognitivas | 20 |
| 10. Indicadores clínicos | 30 |







