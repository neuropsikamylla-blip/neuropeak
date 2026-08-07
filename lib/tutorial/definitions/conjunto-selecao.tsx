"use client";

import {
  DESAFIO_SUPERMERCADO_MIN_LEVEL,
  DesafioSupermercadoBoard,
  desafioSupermercadoItemsForLevel,
  type Product,
} from "@/components/exercises/memory/DesafioSupermercado";
import { compararConjunto, compararPar } from "@/lib/tutorial/comparadores";
import {
  JOGO_MEMORIA_PAIR_SIZE,
  JOGO_MEMORIA_TUTORIAL_CARDS,
  JogoMemoriaBoard,
} from "@/components/exercises/memory/JogoMemoria";
import {
  LISTA_DISTRACAO_MIN_LEVEL,
  LISTA_DISTRACAO_WORDS,
  ListaDistracaoBoard,
  listaDistracaoItemsForLevel,
} from "@/components/exercises/memory/ListaDistracao";
import {
  RESTAURANTE_ORDEM_MIN_LEVEL,
  RESTAURANTE_TUTORIAL_CHOICES,
  RestauranteOrdemBoard,
  restauranteOrdemItemsForLevel,
  type RestauranteItem,
} from "@/components/exercises/memory/RestauranteOrdem";
import {
  criarTutorialSequenciaOrdenada,
  presentVisualSequence,
  type BoardProps,
} from "@/lib/tutorial/definitions/sequencia-ordenada";


function createUniqueSelection<T>(choices: T[], length: number): T[] {
  const available = [...choices];
  for (let index = available.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [available[index], available[target]] = [available[target], available[index]];
  }
  return available.slice(0, length);
}

const SUPERMARKET_CHOICES: Product[] = [
  { id: "banana", name: "Banana" },
  { id: "maca", name: "Maçã" },
  { id: "laranja", name: "Laranja" },
  { id: "morango", name: "Morango" },
  { id: "uva", name: "Uva" },
];
const SUPERMARKET_UNIT = desafioSupermercadoItemsForLevel(
  DESAFIO_SUPERMERCADO_MIN_LEVEL,
);

function SupermarketBoard({
  activeChoice,
  interactive,
  onChoice,
  enteredItems,
  pressedChoice,
}: BoardProps<Product>) {
  const cartIds = enteredItems.map((item) => item.id);
  if (activeChoice && !cartIds.includes(activeChoice.id)) cartIds.push(activeChoice.id);
  return (
    <div className="h-72 w-full">
      <DesafioSupermercadoBoard
        products={SUPERMARKET_CHOICES}
        cartIds={cartIds}
        onToggle={(id) => {
          const product = SUPERMARKET_CHOICES.find((item) => item.id === id);
          if (product) onChoice(product);
        }}
        showLabels
        interactive={interactive}
        pressedChoice={pressedChoice?.id}
      />
    </div>
  );
}

const LIST_UNIT = listaDistracaoItemsForLevel(LISTA_DISTRACAO_MIN_LEVEL);
const LIST_CHOICES = LISTA_DISTRACAO_WORDS.slice(0, LIST_UNIT + 3);

function ListBoard({
  activeChoice,
  interactive,
  onChoice,
  enteredItems,
  pressedChoice,
}: BoardProps<string>) {
  return (
    <ListaDistracaoBoard
      choices={LIST_CHOICES}
      selectedItems={enteredItems}
      interactive={interactive}
      onChoice={onChoice}
      activeChoice={activeChoice}
      pressedChoice={pressedChoice}
    />
  );
}

function MemoryBoard({
  activeChoice,
  interactive,
  onChoice,
  enteredItems,
  pressedChoice,
}: BoardProps<number>) {
  const visibleCards = [...enteredItems];
  if (activeChoice !== undefined && !visibleCards.includes(activeChoice)) {
    visibleCards.push(activeChoice);
  }
  return (
    <JogoMemoriaBoard
      cards={JOGO_MEMORIA_TUTORIAL_CARDS}
      theme="GAMIFIED"
      visibleCards={visibleCards}
      interactive={interactive}
      onChoice={onChoice}
      pressedChoice={pressedChoice}
    />
  );
}

/**
 * No jogo da memória, a unidade respondida é o próprio par: não existe uma sequência esperada
 * para comparar. Por isso a esperada é deliberadamente ignorada e as duas cartas dadas são
 * comparadas entre si pelo símbolo que escondem.
 */

const RESTAURANT_UNIT = restauranteOrdemItemsForLevel(RESTAURANTE_ORDEM_MIN_LEVEL);

function RestaurantBoard({
  activeChoice,
  interactive,
  onChoice,
  enteredItems,
  pressedChoice,
}: BoardProps<RestauranteItem>) {
  const selectedItems = [...enteredItems];
  if (activeChoice && !selectedItems.some((item) => item.id === activeChoice.id)) {
    selectedItems.push(activeChoice);
  }
  return (
    <RestauranteOrdemBoard
      choices={RESTAURANTE_TUTORIAL_CHOICES}
      selectedItems={selectedItems}
      slots={RESTAURANT_UNIT}
      interactive={interactive}
      onChoice={onChoice}
      pressedChoice={pressedChoice}
    />
  );
}

const unorderedDefaults = {
  version: 1,
  retryHint: "Observe novamente e clique nas opções quando elas ficarem disponíveis.",
  present: presentVisualSequence,
};

export const desafioSupermercadoTutorial = criarTutorialSequenciaOrdenada<Product>({
  ...unorderedDefaults,
  exerciseId: "desafio-supermercado",
  guidedInstruction: "Observe os produtos e clique nos que estavam na lista.",
  smallestValidUnit: SUPERMARKET_UNIT,
  demonstrationItems: SUPERMARKET_CHOICES.slice(0, SUPERMARKET_UNIT),
  createGuidedSequence: () => createUniqueSelection(SUPERMARKET_CHOICES, SUPERMARKET_UNIT),
  Board: SupermarketBoard,
  targetSelectorFor: (item) => `[data-choice="${item.id}"]`,
  compararResposta: compararConjunto,
});

export const listaDistracaoTutorial = criarTutorialSequenciaOrdenada<string>({
  ...unorderedDefaults,
  exerciseId: "lista-distracao",
  guidedInstruction: "Observe os itens e clique nos que você memorizou.",
  smallestValidUnit: LIST_UNIT,
  demonstrationItems: LIST_CHOICES.slice(0, LIST_UNIT),
  createGuidedSequence: () => createUniqueSelection(LIST_CHOICES, LIST_UNIT),
  Board: ListBoard,
  targetSelectorFor: (item) => `[data-choice="${item}"]`,
  compararResposta: compararConjunto,
});

export const jogoMemoriaTutorial = criarTutorialSequenciaOrdenada<number>({
  ...unorderedDefaults,
  exerciseId: "jogo-memoria",
  guidedInstruction: "Clique em duas cartas para encontrar um par.",
  smallestValidUnit: JOGO_MEMORIA_PAIR_SIZE,
  demonstrationItems: [0, 1],
  createGuidedSequence: () => Math.random() < 0.5 ? [0, 1] : [2, 3],
  Board: MemoryBoard,
  targetSelectorFor: (card) => `[data-choice="${card}"]`,
  compararResposta: compararPar(JOGO_MEMORIA_TUTORIAL_CARDS, JOGO_MEMORIA_PAIR_SIZE),
});

export const restauranteOrdemTutorial = criarTutorialSequenciaOrdenada<RestauranteItem>({
  ...unorderedDefaults,
  exerciseId: "restaurante-ordem",
  guidedInstruction: "Observe os pedidos e clique nos que foram feitos.",
  smallestValidUnit: RESTAURANT_UNIT,
  demonstrationItems: RESTAURANTE_TUTORIAL_CHOICES.slice(0, RESTAURANT_UNIT),
  createGuidedSequence: () => createUniqueSelection(
    RESTAURANTE_TUTORIAL_CHOICES,
    RESTAURANT_UNIT,
  ),
  Board: RestaurantBoard,
  targetSelectorFor: (item) => `[data-choice="${item.id}"]`,
  compararResposta: compararConjunto,
});
