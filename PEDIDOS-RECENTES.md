# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## COMO PROVEI

**1. O puzzle é real e tem solução única.** Força bruta independente em Node sobre as 331.776 combinações (4 categorias × 4! posições): as 8 pistas admitem **exatamente uma** solução, e cada uma das 8 é essencial (removendo qualquer uma, aparece uma segunda solução). Solução: bancada 1 Bruno/Vulcão/Amarela/Chá · 2 Ana/Ponte/Azul/Água · 3 Carla/Robô/Verde/Café · 4 Diego/Solar/Vermelha/Suco. O estado marcado nas telas é derivável das pistas (as pessoas saem da integração das pistas 1 e 3; as eliminações de Café/Chá/Água/Robô/Verde vêm das pistas 3, 2 e 6).

**2. A página renderiza.** Chrome headless (`--headless=new --screenshot`) em 1280, 1512 e 1900 px de largura; li os PNGs. Duas regressões achadas e corrigidas por evidência: (a) em coluna de 1004 px a proposta A truncava "Vermelha" em "Verm…" — por isso desktop e celular ficaram **empilhados**, nunca lado a lado (lado a lado espremia a grade abaixo do legível; o teste está registrado num comentário no CSS); (b) a proposta C deixava um vazio de ~400 px dentro do card, exatamente o que a seção 11 proíbe — virou foco+contexto.

**3. A interação funciona de verdade** (cliques simulados em navegador real, `teste-interacao.html`): ciclo `vazio → × → ? → ✓ → vazio` confirmado célula a célula com os glifos; o chip da proposta A cicla igual; na proposta C, confirmar `Pasta/Amarela/bancada 1` fez a faixa de resposta passar de `"—"` para `"Amarela"` e voltar a `"—"` ao desfazer; marcar na cópia reduzida atualiza a mesma célula; o modo menu abre o popover com 4 opções.

**4. As medidas da página são medidas, não afirmadas.** Corrigi uma desonestidade minha: a legenda dizia "sem rolagem horizontal" como texto fixo. Agora `scrollWidth × clientWidth` e o menor alvo de toque são lidos do DOM. Valores no celular de 360 × 660: **A** 2.523 px (3,8 telas), alvo 155 × 40 · **B** 1.611 px (2,4 telas), alvo 51 × 44 · **C** 930 px (1,4 telas), alvo 51 × 50. Nenhuma com rolagem horizontal. Desktop a 1512: as três com 1.414 px de largura útil, alturas 1.047 / 799 / 1.070.

**5. Pior caso da espec (nível 5: 5 posições × 6 categorias), clone medido.** Aqui achei um erro meu que teria passado batido: o CSS tinha `repeat(4)` fixo, então o primeiro teste de 5 posições **quebrou em silêncio** (a 5ª coluna virou linha) e deu um falso "cabe". Tornei as grades agnósticas a N e remedi: **A** 5.523 px = **8,4 telas** · **B** 2.455 px, célula 40 × 44 · **C** 1.184 px, célula 39 × 50; nenhuma com rolagem horizontal.

### Recomendação

**Adotar a casca da C com a grade da B; descartar a A.** Ou seja: faixa de resposta derivada dos ✓ em cima (não editável) + área de dedução em matriz por posição — todas as categorias visíveis no desktop, uma por aba só no celular. Isso já está construído e clicável na página: a C no desktop, por construção, é a B com a faixa em cima.

Motivo: a distinção `?` × `✓` que é o coração da espec ganha uma segunda codificação, espacial (o ✓ "sobe" para a faixa; o `?` não), sem custar nada ao paciente; e é a única combinação que cabe bem no pior caso (1,8 telas contra 3,7 da B pura e 8,4 da A).

### Onde cada uma falha

- **A (colunas por posição)** — a sugestão da seção 90 é a que escala pior: o rótulo escrito se repete posições × valores (16 vezes por categoria num 4×4, 30 num 5×6), o que dá 8,4 telas de rolagem no nível 5 e trunca rótulos em desktop mais estreito. Um `×` ocupa o mesmo espaço de uma resposta.
- **B (matriz de possibilidades)** — o risco é de aparência (planilha) e exige acompanhar o cabeçalho da coluna para saber qual bancada se marca; a 5 posições a célula estreita para 40 px de largura, abaixo dos 44 px recomendados de alvo de toque (a altura, 44, se mantém).
- **C (dedução + resposta)** — duas representações do mesmo estado (mais código e mais chance de incoerência); no celular a aba realmente esconde três categorias, e pistas cruzadas obrigam a trocar de aba; a faixa devolve os confirmados, nunca as eliminações.

### O que descobri tentando caber em 360 px

A matriz clássica de *logic grid* — categoria × categoria, em escada — **não é implementável hoje por dois motivos independentes que apontam para o mesmo lado**: (1) `MarcacaoCelula` em `/Users/kamyllahonorio/neuropeak/lib/grade/tipos.ts` grava `(categoria, valor, posição)`, e `aplicarMarcacoes` em `/Users/kamyllahonorio/neuropeak/lib/grade/motor.ts` só sabe ligar/desligar bits de posição — o cruzamento Pessoa × Bebida não tem onde ser registrado; (2) para 4 categorias são 6 blocos em escada, ~700 px só de grade, inviável em 360. A matriz que cabe é a do eixo **posição**, que é justamente a que o modelo já suporta. Se um dia a escada clássica for desejada, é mudança de modelo e de solver, não de CSS.

### Onde a espec esbarrou em impossibilidade de layout

1. **Seção 13 (pistas sempre visíveis) contra os 660 px do celular.** Oito pistas abertas custam ~300 px; com a grade não sobra tela. Não existe solução literal. O melhor honesto é a gaveta presa ao rodapé (na C do celular): sempre ao alcance sem rolar, ao custo de ~150 px permanentes.
2. **Seção 11 (nada de conteúdo perdido em tela grande) contra a ideia de "uma categoria por vez".** Uma categoria não preenche um desktop. Resolvi mostrando as outras três reduzidas ao lado — mas isso significa que, no desktop, a aba deixa de esconder e vira só "o que ampliar".
3. **Seção 14 (a tela não denuncia erro) fecha a paleta.** Vermelho fica proibido em qualquer estado, inclusive no `×` — por isso o impossível é cinza. Vale registrar como decisão, não como acidente.
4. **A sugestão da própria seção 90** (posição como coluna) é, medida, a pior no celular. Ela pediu para testar antes de fechar; testado, não passa.

## O QUE NÃO FIZ

- **Não commitei, não dei push, não alterei nada em `/Users/kamyllahonorio/neuropeak`** — nem `DeductiveGrid.tsx`, nem `lib/grade/`, nem docs. As duas mudanças em `PEDIDOS-*.md` são do gancho automático.
- **Não implementei solver por trás dos botões.** VERIFICAR e CONCLUIR mostram o texto exato da espec rotulado como "exemplo de mensagem"; a mensagem não depende do que está marcado, e a página diz isso.
- **Não inventei nada fora da espec**: sem dica, sem pontuação, sem cronômetro, sem barra de progresso da solução, sem aviso de incompatibilidade. Progresso só como "Desafio 3 de 5".
- **Não pus desktop e celular lado a lado na mesma linha**, como o despacho pedia — testei e a grade do desktop encolhia a ponto de truncar rótulo e quebrar cabeçalho. Preferi empilhar e registrar o teste; se você quiser o lado a lado mesmo assim, é uma linha de CSS, mas a evidência diz que piora.
- **Ponto que precisa da sua adjudicação, não minha:** `PEDIDOS-RECENTES.md` registrou, hoje 09:51–09:56 (durante esta tarefa), três falas dela que atravessam este despacho — *"o layout que eu mais gostei foi o C"*, *"acho que tumutua demais colocar X impossivel ? hipotese… pode ser somente o nome das pessoas"*, e *"o ideal é eu clicar e abrir; ficar clicando dificulta o raciocínio de visualizar quem resta"*. A última já está atendida na página (o modo "menu de escolha"); as outras duas contradizem o escopo que recebi (quatro estados, três propostas) e **não executei nada a partir delas** — elas apontam para uma quarta proposta, com a célula mostrando os nomes restantes e menu ao toque, mais o riscar manual de pistas que ela mencionou. Se for para fazer, precisa de despacho novo.
- **Não verifiquei em aparelho real nem em Safari/iOS.** Toda a evidência visual é Chrome headless no macOS; toque real, rolagem com inércia e a sensação do popover no dedo continuam **DESCONHECIDOS** até ela abrir no aparelho.</result>
<usage><subagent_tokens>211781</subagent_tokens><tool_uses>67</tool_uses><duration_ms>1805040</duration_ms></usage>
</task-notification>

## 03/09/2026 10:04
[Image #23] dois pontos (se eu adicionei ANA de novo deveria ficar em VERMELHO para mostrar opa vc ja usou ela) e essa configuraçao das dicas esta desconfigurada 1 tem um espaçamento maior da 3 que as outras e mande a ideia escrita la nao consigo msotrar so mandar por escrito
