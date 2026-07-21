# Histórias do Investigadores da Situação Social — como adicionar

Adicionar histórias **não exige mexer no código do exercício** — só criar arquivos de dados
que satisfaçam o modelo `SocialStory` (`lib/social/types.ts`).

## Passo a passo

1. **Copie** `_TEMPLATE.ts` para um arquivo novo, com nome descritivo:
   `crianca-escola-colega-novo.ts` (padrão: `faixa-ambiente-tema`).
2. **Preencha** os campos da história (ver "Modelo" abaixo). Renomeie o `export`
   (`export const escolaColegaNovo: SocialStory = { … }`).
3. **Registre** em `index.ts`: importe o export e some ao array `STORY_MODULES`.
4. Pronto. A história passa a aparecer automaticamente na faixa/nível corretos.

A validação roda sozinha em desenvolvimento (avisos no console). Para checar à mão:
`validateStory(minhaHistoria)` deve devolver `[]`.

## Modelo (resumo)

| Campo | O que é |
|---|---|
| `id` | identificador único (kebab-case) |
| `titulo` | título exibido |
| `faixa` | `crianca` \| `adolescente` \| `adulto` |
| `nivel` | 1–7 (dificuldade social) |
| `objetivoClinico` | o que a história treina (linguagem clínica) |
| `habilidadeTreinada` | eixos: `RE CX TM TP IN JS RS FI RP` |
| `ambiente` | `{ id: "ENV-###", nome }` (Biblioteca 4) |
| `personagens` | lista reutilizável (`id`, `nome`, `papel`, `emoji`) |
| `cenas` | quadros em ordem, cada um com descrição, contexto, personagens e perguntas |
| `reflexao` | perguntas finais de generalização (nível "história") |
| `notasProfissional` | notas para o profissional |

Cada **cena** tem: `imagem` (ref ao asset, opcional), `descricao`, `contexto`,
`personagens` (ids presentes) e `perguntas`.

Cada **pergunta** tem: `tipo`, `eixo`, `enunciado`, `formato` e — se for **pontuável** —
`opcoes` + `gabarito`. **Sem `gabarito`** = item de **discussão mediada** (não pontua; só
registra para o profissional).

## Regras obrigatórias (Etapa 1 §16/§17)

- Todo item pontuável tem **uma** opção `correta:true`; distratores plausíveis com `erroTipo`.
- Leitura de emoção apoia-se em **≥2 pistas** descritas na cena (nada de "adivinhar").
- Personagens citados nas cenas **existem** em `personagens`.
- Sem violência, discriminação, conteúdo sensível, moralização ou juízo sobre o paciente.
- Ambiguidade só nos níveis que a treinam (5–7), nunca em item pontuável de nível baixo.

## De onde tirar o conteúdo

A **Biblioteca Clínica** (`INVESTIGADORES-SOCIAIS-BIBLIOTECA-CLINICA.md`) traz emoções, pistas,
regras, ambientes, personagens, situações, intenções e o banco de perguntas — todos com ID,
prontos para preencher estes campos com coerência e progressão.
