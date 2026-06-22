"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import { ItemSvg } from "@/components/exercises/ItemSvg";
import type { ExerciseResult, Theme } from "@/types";
import { fmt } from "@/lib/item-domains";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const MAX_TRIALS = 60;

type MRLevel = 1 | 2 | 3;

function getLevel(d: number): MRLevel {
  if (d <= 3) return 1;
  if (d <= 6) return 2;
  return 3;
}

interface MRItem {
  key: string;
  svgId: string;
  label: string;
  price: number;
  qty?: number;
  unit?: string;
  catLabel?: string;
}

interface MRScenario {
  question: string;
  subtext?: string;
  levelTag: string;
  items: MRItem[];
  correctKey: string;
  explanation: string;
}

// ── Nível 1 — comparação direta ─────────────────────────────────────────────

const L1: MRScenario[] = [
  {
    question: "Qual é o mais barato?", levelTag: "Menor preço",
    explanation: "Banana (R$ 3,90) é o produto mais barato entre os três.",
    items: [
      { key: "banana", svgId: "banana", label: "Banana",  price: 3.90 },
      { key: "maca",   svgId: "maca",   label: "Maçã",    price: 6.90 },
      { key: "uva",    svgId: "uva",    label: "Uva",     price: 8.90 },
    ], correctKey: "banana",
  },
  {
    question: "Qual é o mais caro?", levelTag: "Maior preço",
    explanation: "Frango (R$ 16,90) é o produto mais caro.",
    items: [
      { key: "leite",  svgId: "leite",  label: "Leite",  price: 5.90 },
      { key: "queijo", svgId: "queijo", label: "Queijo", price: 14.90 },
      { key: "frango", svgId: "frango", label: "Frango", price: 16.90 },
    ], correctKey: "frango",
  },
  {
    question: "Qual é um produto de higiene?", levelTag: "Categoria",
    explanation: "Shampoo pertence à categoria de higiene pessoal.",
    items: [
      { key: "cafe",    svgId: "cafe",    label: "Café",    price: 11.90 },
      { key: "shampoo", svgId: "shampoo", label: "Shampoo", price: 16.90 },
      { key: "batata",  svgId: "batata",  label: "Batata",  price: 5.90 },
    ], correctKey: "shampoo",
  },
  {
    question: "Qual custa menos de R$ 5,00?", levelTag: "Faixa de preço",
    explanation: "Só o sal (R$ 2,90) está abaixo de R$ 5,00.",
    items: [
      { key: "sal",     svgId: "sal",     label: "Sal",     price: 2.90 },
      { key: "iogurte", svgId: "iogurte", label: "Iogurte", price: 7.90 },
      { key: "cafe",    svgId: "cafe",    label: "Café",    price: 11.90 },
    ], correctKey: "sal",
  },
  {
    question: "Qual é uma bebida?", levelTag: "Categoria",
    explanation: "Água mineral é classificada como bebida.",
    items: [
      { key: "arroz",    svgId: "arroz",    label: "Arroz",     price: 7.90 },
      { key: "agua-min", svgId: "agua-min", label: "Água min.", price: 3.50 },
      { key: "sabonete", svgId: "sabonete", label: "Sabonete",  price: 4.90 },
    ], correctKey: "agua-min",
  },
  {
    question: "Qual custa mais de R$ 10,00?", levelTag: "Faixa de preço",
    explanation: "Só o café (R$ 11,90) ultrapassa R$ 10,00.",
    items: [
      { key: "cafe",     svgId: "cafe",     label: "Café",     price: 11.90 },
      { key: "alface",   svgId: "alface",   label: "Alface",   price: 2.90 },
      { key: "macarrao", svgId: "macarrao", label: "Macarrão", price: 4.50 },
    ], correctKey: "cafe",
  },
  {
    question: "Qual é um produto de mercearia?", levelTag: "Categoria",
    explanation: "Feijão é um produto de mercearia (grãos e cereais).",
    items: [
      { key: "feijao",  svgId: "feijao",  label: "Feijão",        price: 8.90 },
      { key: "banana",  svgId: "banana",  label: "Banana",        price: 3.90 },
      { key: "pasta",   svgId: "pasta",   label: "Pasta de dente",price: 6.90 },
    ], correctKey: "feijao",
  },
  {
    question: "Qual tem o menor preço?", levelTag: "Menor preço",
    explanation: "Laranja (R$ 3,50) é o produto mais barato.",
    items: [
      { key: "laranja",  svgId: "laranja",  label: "Laranja",  price: 3.50 },
      { key: "manteiga", svgId: "manteiga", label: "Manteiga", price: 9.90 },
      { key: "oleo",     svgId: "oleo",     label: "Óleo",     price: 13.90 },
    ], correctKey: "laranja",
  },
  {
    question: "Qual é um laticínio?", levelTag: "Categoria",
    explanation: "Ovos são classificados como laticínios no supermercado.",
    items: [
      { key: "ovos",    svgId: "ovos",    label: "Ovos",    price: 12.90 },
      { key: "refri",   svgId: "refri",   label: "Refri.",  price: 8.90 },
      { key: "oleo",    svgId: "oleo",    label: "Óleo",    price: 13.90 },
    ], correctKey: "ovos",
  },
  {
    question: "Qual é o produto mais barato?", levelTag: "Menor preço",
    explanation: "Detergente (R$ 3,90) é o mais barato.",
    items: [
      { key: "detergente", svgId: "detergente", label: "Detergente", price: 3.90 },
      { key: "shampoo",    svgId: "shampoo",    label: "Shampoo",    price: 16.90 },
      { key: "sabao",      svgId: "sabao",      label: "Sabão",      price: 18.90 },
    ], correctKey: "detergente",
  },
  {
    question: "Qual é um hortifruti?", levelTag: "Categoria",
    explanation: "Cenoura é da categoria hortifruti (legumes e verduras).",
    items: [
      { key: "cenoura", svgId: "cenoura", label: "Cenoura",   price: 4.90 },
      { key: "acucar",  svgId: "acucar",  label: "Açúcar",   price: 4.90 },
      { key: "cha",     svgId: "cha",     label: "Chá gelado",price: 6.90 },
    ], correctKey: "cenoura",
  },
  {
    question: "Qual custa entre R$ 5 e R$ 8?", levelTag: "Faixa de preço",
    explanation: "Suco de caixa (R$ 5,90) é o único nessa faixa de preço.",
    items: [
      { key: "suco-cx",  svgId: "suco-cx",  label: "Suco cx.",  price: 5.90 },
      { key: "papel-hig",svgId: "papel-hig",label: "Papel hig.",price: 14.90 },
      { key: "alface",   svgId: "alface",   label: "Alface",    price: 2.90 },
    ], correctKey: "suco-cx",
  },
  {
    question: "Qual é o mais caro?", levelTag: "Maior preço",
    explanation: "Óleo (R$ 13,90) tem o maior preço.",
    items: [
      { key: "pao",   svgId: "pao",   label: "Pão",   price: 6.90 },
      { key: "oleo",  svgId: "oleo",  label: "Óleo",  price: 13.90 },
      { key: "tomate",svgId: "tomate",label: "Tomate",price: 4.50 },
    ], correctKey: "oleo",
  },
  {
    question: "Qual é um produto de limpeza?", levelTag: "Categoria",
    explanation: "Sabão em pó é usado para limpeza de roupas.",
    items: [
      { key: "sabao",  svgId: "sabao",  label: "Sabão em pó", price: 18.90 },
      { key: "iogurte",svgId: "iogurte",label: "Iogurte",     price: 7.90 },
      { key: "refri",  svgId: "refri",  label: "Refri.",       price: 8.90 },
    ], correctKey: "sabao",
  },
  {
    question: "Qual tem o maior preço?", levelTag: "Maior preço",
    explanation: "Queijo (R$ 14,90) é o produto mais caro.",
    items: [
      { key: "laranja", svgId: "laranja", label: "Laranja", price: 3.50 },
      { key: "macarrao",svgId: "macarrao",label: "Macarrão",price: 4.50 },
      { key: "queijo",  svgId: "queijo",  label: "Queijo",  price: 14.90 },
    ], correctKey: "queijo",
  },
];

// ── Nível 2 — custo-benefício (preço por unidade) ──────────────────────────

const L2: MRScenario[] = [
  {
    question: "Qual custa menos por 100g?",
    subtext: "Compare: divida o preço pelo peso para descobrir o mais vantajoso.",
    levelTag: "Custo por 100g",
    explanation: "Arroz 1kg: R$0,79/100g · 500g: R$0,90 · 2kg: R$0,88 → 1kg é o melhor valor.",
    items: [
      { key: "arroz-500g", svgId: "arroz", label: "Arroz 500g",  price: 4.50, qty: 500,  unit: "g" },
      { key: "arroz-1kg",  svgId: "arroz", label: "Arroz 1kg",   price: 7.90, qty: 1000, unit: "g" },
      { key: "arroz-2kg",  svgId: "arroz", label: "Arroz 2kg",   price: 17.50,qty: 2000, unit: "g" },
    ], correctKey: "arroz-1kg",
  },
  {
    question: "Qual tem o menor preço por 100ml?",
    subtext: "Calcule mentalmente: divida o preço pelo volume.",
    levelTag: "Custo por 100ml",
    explanation: "Leite 1L: R$0,59/100ml · 500ml: R$0,70 · 2L: R$0,67 → 1L é mais vantajoso.",
    items: [
      { key: "leite-500ml",svgId: "leite", label: "Leite 500ml", price: 3.50, qty: 500,  unit: "ml" },
      { key: "leite-1L",   svgId: "leite", label: "Leite 1L",    price: 5.90, qty: 1000, unit: "ml" },
      { key: "leite-2L",   svgId: "leite", label: "Leite 2L",    price: 13.40,qty: 2000, unit: "ml" },
    ], correctKey: "leite-1L",
  },
  {
    question: "Qual rende mais pelo preço pago?",
    subtext: "Considere o volume de cada embalagem pelo preço cobrado.",
    levelTag: "Melhor rendimento",
    explanation: "Shampoo 400ml: R$6,73/100ml · 200ml: R$7,45 · 100ml: R$8,90 → 400ml rende mais.",
    items: [
      { key: "sh-100ml",svgId: "shampoo", label: "Shampoo 100ml", price: 8.90, qty: 100, unit: "ml" },
      { key: "sh-200ml",svgId: "shampoo", label: "Shampoo 200ml", price: 14.90,qty: 200, unit: "ml" },
      { key: "sh-400ml",svgId: "shampoo", label: "Shampoo 400ml", price: 26.90,qty: 400, unit: "ml" },
    ], correctKey: "sh-400ml",
  },
  {
    question: "Qual custa menos por 100ml?",
    subtext: "Cuidado: a embalagem maior nem sempre é a mais barata por unidade.",
    levelTag: "Custo por 100ml",
    explanation: "Detergente 500ml: R$0,78/100ml · 200ml: R$1,00 · 1L: R$0,85 → 500ml ganha.",
    items: [
      { key: "det-200ml",svgId: "detergente", label: "Deterg. 200ml", price: 1.99, qty: 200,  unit: "ml" },
      { key: "det-500ml",svgId: "detergente", label: "Deterg. 500ml", price: 3.90, qty: 500,  unit: "ml" },
      { key: "det-1L",   svgId: "detergente", label: "Deterg. 1L",    price: 8.50, qty: 1000, unit: "ml" },
    ], correctKey: "det-500ml",
  },
  {
    question: "Qual tem o menor custo por 100g?",
    subtext: "Compare as três opções de tamanho e calcule o melhor custo-benefício.",
    levelTag: "Custo por 100g",
    explanation: "Macarrão 500g: R$0,90/100g · 250g: R$1,16 · 1kg: R$0,99 → 500g é o melhor.",
    items: [
      { key: "mac-250g",svgId: "macarrao", label: "Macarrão 250g", price: 2.90, qty: 250,  unit: "g" },
      { key: "mac-500g",svgId: "macarrao", label: "Macarrão 500g", price: 4.50, qty: 500,  unit: "g" },
      { key: "mac-1kg", svgId: "macarrao", label: "Macarrão 1kg",  price: 9.90, qty: 1000, unit: "g" },
    ], correctKey: "mac-500g",
  },
  {
    question: "Qual rende mais pelo preço?",
    subtext: "Calcule quanto custa cada 100g de feijão.",
    levelTag: "Custo por 100g",
    explanation: "Feijão 1kg: R$0,89/100g · 500g: R$1,18 · 2kg: R$0,99 → 1kg tem melhor valor.",
    items: [
      { key: "fej-500g",svgId: "feijao", label: "Feijão 500g", price: 5.90, qty: 500,  unit: "g" },
      { key: "fej-1kg", svgId: "feijao", label: "Feijão 1kg",  price: 8.90, qty: 1000, unit: "g" },
      { key: "fej-2kg", svgId: "feijao", label: "Feijão 2kg",  price: 19.80,qty: 2000, unit: "g" },
    ], correctKey: "fej-1kg",
  },
  {
    question: "Qual custa menos por 100g?",
    subtext: "O sabão maior nem sempre é mais barato — calcule antes de decidir.",
    levelTag: "Custo por 100g",
    explanation: "Sabão 500g: R$3,78/100g · 200g: R$4,45 · 1kg: R$4,09 → 500g é o melhor.",
    items: [
      { key: "sb-200g",svgId: "sabao", label: "Sabão 200g", price: 8.90,  qty: 200,  unit: "g" },
      { key: "sb-500g",svgId: "sabao", label: "Sabão 500g", price: 18.90, qty: 500,  unit: "g" },
      { key: "sb-1kg", svgId: "sabao", label: "Sabão 1kg",  price: 40.90, qty: 1000, unit: "g" },
    ], correctKey: "sb-500g",
  },
  {
    question: "Qual tem o melhor custo-benefício?",
    subtext: "Considere o preço por grama de cada embalagem.",
    levelTag: "Custo por 100g",
    explanation: "Açúcar 1kg: R$0,49/100g · 500g: R$0,58 · 2kg: R$0,54 → 1kg é o mais vantajoso.",
    items: [
      { key: "ac-500g",svgId: "acucar", label: "Açúcar 500g", price: 2.90,  qty: 500,  unit: "g" },
      { key: "ac-1kg", svgId: "acucar", label: "Açúcar 1kg",  price: 4.90,  qty: 1000, unit: "g" },
      { key: "ac-2kg", svgId: "acucar", label: "Açúcar 2kg",  price: 10.80, qty: 2000, unit: "g" },
    ], correctKey: "ac-1kg",
  },
  {
    question: "Qual é a melhor compra por unidade?",
    subtext: "Compare o preço de cada sabonete em cada pacote.",
    levelTag: "Custo por unidade",
    explanation: "3 sabonetes: R$4,17/un · 1 un: R$4,90 · 5 un: R$4,58 → pacote de 3 é mais barato.",
    items: [
      { key: "sbn-1",svgId: "sabonete", label: "Sabonete 1 un",  price: 4.90,  qty: 1, unit: "un" },
      { key: "sbn-3",svgId: "sabonete", label: "Sabonete 3 un",  price: 12.50, qty: 3, unit: "un" },
      { key: "sbn-5",svgId: "sabonete", label: "Sabonete 5 un",  price: 22.90, qty: 5, unit: "un" },
    ], correctKey: "sbn-3",
  },
  {
    question: "Qual rende mais pelo preço?",
    subtext: "Calcule o preço por 100g de cada iogurte.",
    levelTag: "Custo por 100g",
    explanation: "Iogurte 200g: R$2,25/100g · 150g: R$2,60 · 300g: R$2,63 → 200g tem melhor valor.",
    items: [
      { key: "iog-150g",svgId: "iogurte", label: "Iogurte 150g", price: 3.90, qty: 150, unit: "g" },
      { key: "iog-200g",svgId: "iogurte", label: "Iogurte 200g", price: 4.50, qty: 200, unit: "g" },
      { key: "iog-300g",svgId: "iogurte", label: "Iogurte 300g", price: 7.90, qty: 300, unit: "g" },
    ], correctKey: "iog-200g",
  },
  {
    question: "Qual custa menos por 100ml?",
    subtext: "Cuidado com a embalagem maior — pode parecer mais barata, mas verifique.",
    levelTag: "Custo por 100ml",
    explanation: "Azeite 500ml: R$4,98/100ml · 200ml: R$6,45 · 750ml: R$5,19 → 500ml é o melhor.",
    items: [
      { key: "az-200ml",svgId: "oleo", label: "Azeite 200ml", price: 12.90, qty: 200, unit: "ml" },
      { key: "az-500ml",svgId: "oleo", label: "Azeite 500ml", price: 24.90, qty: 500, unit: "ml" },
      { key: "az-750ml",svgId: "oleo", label: "Azeite 750ml", price: 38.90, qty: 750, unit: "ml" },
    ], correctKey: "az-500ml",
  },
  {
    question: "Qual tem o melhor custo-benefício?",
    subtext: "Divida o preço pelo peso para comparar os queijos.",
    levelTag: "Custo por 100g",
    explanation: "Queijo 200g: R$4,45/100g · 100g: R$4,90 · 500g: R$4,98 → 200g é o mais vantajoso.",
    items: [
      { key: "qj-100g",svgId: "queijo", label: "Queijo 100g", price: 4.90,  qty: 100, unit: "g" },
      { key: "qj-200g",svgId: "queijo", label: "Queijo 200g", price: 8.90,  qty: 200, unit: "g" },
      { key: "qj-500g",svgId: "queijo", label: "Queijo 500g", price: 24.90, qty: 500, unit: "g" },
    ], correctKey: "qj-200g",
  },
  {
    question: "Qual custa menos por 100g?",
    subtext: "Café tem tamanhos diferentes — calcule qual é mais econômico.",
    levelTag: "Custo por 100g",
    explanation: "Café 200g: R$5,95/100g · 100g: R$7,90 · 500g: R$6,58 → 200g ganha.",
    items: [
      { key: "cf-100g",svgId: "cafe", label: "Café 100g", price: 7.90,  qty: 100, unit: "g" },
      { key: "cf-200g",svgId: "cafe", label: "Café 200g", price: 11.90, qty: 200, unit: "g" },
      { key: "cf-500g",svgId: "cafe", label: "Café 500g", price: 32.90, qty: 500, unit: "g" },
    ], correctKey: "cf-200g",
  },
  {
    question: "Qual é a melhor compra por rolo?",
    subtext: "Compare o preço de cada rolo de papel higiênico.",
    levelTag: "Custo por unidade",
    explanation: "8 rolos: R$1,74/rolo · 4 rolos: R$1,98 · 12 rolos: R$1,91 → pacote de 8 ganha.",
    items: [
      { key: "ph-4",svgId: "papel-hig", label: "Papel 4 rolos",  price: 7.90,  qty: 4,  unit: "un" },
      { key: "ph-8",svgId: "papel-hig", label: "Papel 8 rolos",  price: 13.90, qty: 8,  unit: "un" },
      { key: "ph-12",svgId: "papel-hig",label: "Papel 12 rolos", price: 22.90, qty: 12, unit: "un" },
    ], correctKey: "ph-8",
  },
  {
    question: "Qual rende mais pelo preço?",
    subtext: "Calcule o preço por 100ml de cada pasta de dente.",
    levelTag: "Custo por 100g",
    explanation: "Pasta 140g: R$7,07/10g · 90g: R$7,67 · 50g: R$7,80 → 140g tem mais rendimento.",
    items: [
      { key: "pt-50g",svgId: "pasta", label: "Pasta 50g",  price: 3.90, qty: 50,  unit: "g" },
      { key: "pt-90g",svgId: "pasta", label: "Pasta 90g",  price: 6.90, qty: 90,  unit: "g" },
      { key: "pt-140g",svgId:"pasta", label: "Pasta 140g", price: 9.90, qty: 140, unit: "g" },
    ], correctKey: "pt-140g",
  },
];

// ── Nível 3 — múltiplos critérios ──────────────────────────────────────────

const L3: MRScenario[] = [
  {
    question: "Qual produto de MERCEARIA tem o menor custo por 100g?",
    subtext: "Filtre pela categoria e compare os valores. Orçamento: R$ 15.",
    levelTag: "Categoria + Custo",
    explanation: "Arroz 1kg (mercearia, R$0,79/100g) é mais barato por grama que macarrão e cabe no orçamento.",
    items: [
      { key: "arroz-1kg",  svgId: "arroz",    label: "Arroz 1kg",    price: 7.90, qty: 1000, unit: "g",  catLabel: "Mercearia" },
      { key: "shampoo-400",svgId: "shampoo",  label: "Shampoo 400ml",price: 14.90,qty: 400,  unit: "ml", catLabel: "Higiene" },
      { key: "mac-1kg",    svgId: "macarrao", label: "Macarrão 1kg", price: 9.90, qty: 1000, unit: "g",  catLabel: "Mercearia" },
      { key: "sabao-500g", svgId: "sabao",    label: "Sabão 500g",   price: 18.90,qty: 500,  unit: "g",  catLabel: "Higiene" },
    ], correctKey: "arroz-1kg",
  },
  {
    question: "Qual produto de HIGIENE é o mais barato dentro do orçamento de R$ 10?",
    subtext: "Dois filtros: categoria correta E preço dentro do limite.",
    levelTag: "Categoria + Orçamento",
    explanation: "Detergente 500ml (higiene, R$3,90) é da categoria certa e mais barato que a pasta dentro do orçamento.",
    items: [
      { key: "det-500ml",  svgId: "detergente", label: "Detergente 500ml",price: 3.90, qty: 500, unit: "ml", catLabel: "Higiene" },
      { key: "sabao-500g2",svgId: "sabao",       label: "Sabão 500g",      price: 18.90,qty: 500, unit: "g",  catLabel: "Higiene" },
      { key: "pasta-90g",  svgId: "pasta",       label: "Pasta 90g",       price: 6.90, qty: 90,  unit: "g",  catLabel: "Higiene" },
      { key: "arroz-500g2",svgId: "arroz",       label: "Arroz 500g",      price: 4.50, qty: 500, unit: "g",  catLabel: "Mercearia" },
    ], correctKey: "det-500ml",
  },
  {
    question: "Qual BEBIDA tem o menor preço por 100ml dentro do orçamento de R$ 8?",
    subtext: "Filtre as bebidas dentro do orçamento e compare o valor por volume.",
    levelTag: "Categoria + Custo + Orçamento",
    explanation: "Suco de caixa 1L (bebida, R$0,59/100ml, R$5,90) tem melhor valor que a água e cabe no orçamento.",
    items: [
      { key: "agua-500ml",svgId: "agua-min", label: "Água 500ml",    price: 3.50, qty: 500,  unit: "ml", catLabel: "Bebidas" },
      { key: "suco-1L",   svgId: "suco-cx",  label: "Suco cx. 1L",  price: 5.90, qty: 1000, unit: "ml", catLabel: "Bebidas" },
      { key: "refri-2L",  svgId: "refri",    label: "Refri. 2L",    price: 8.90, qty: 2000, unit: "ml", catLabel: "Bebidas" },
      { key: "leite-1L2", svgId: "leite",    label: "Leite 1L",     price: 5.90, qty: 1000, unit: "ml", catLabel: "Laticínios" },
    ], correctKey: "suco-1L",
  },
  {
    question: "Qual LATICÍNIO tem mais de 500g e custa menos de R$ 8?",
    subtext: "Atenção às duas condições: categoria, peso mínimo e limite de preço.",
    levelTag: "Categoria + Peso + Preço",
    explanation: "Leite 1L (1000ml, R$5,90) é da categoria laticínios, tem mais de 500ml e está abaixo de R$ 8.",
    items: [
      { key: "leite-1L3",  svgId: "leite",   label: "Leite 1L",     price: 5.90, qty: 1000, unit: "ml", catLabel: "Laticínios" },
      { key: "iog-200g2",  svgId: "iogurte", label: "Iogurte 200g", price: 4.50, qty: 200,  unit: "g",  catLabel: "Laticínios" },
      { key: "queijo-200g2",svgId:"queijo",   label: "Queijo 200g",  price: 8.90, qty: 200,  unit: "g",  catLabel: "Laticínios" },
      { key: "banana-1kg",  svgId:"banana",   label: "Banana 1kg",   price: 3.90, qty: 1000, unit: "g",  catLabel: "Hortifruti" },
    ], correctKey: "leite-1L3",
  },
  {
    question: "Qual produto de MERCEARIA tem mais de 900g e custa menos de R$ 10?",
    subtext: "Três condições: categoria certa, peso suficiente e preço dentro do limite.",
    levelTag: "Categoria + Peso + Orçamento",
    explanation: "Arroz 1kg (mercearia, 1000g > 900g, R$7,90 < R$10) é o único que atende tudo.",
    items: [
      { key: "arroz-1kg2",svgId: "arroz",    label: "Arroz 1kg",     price: 7.90, qty: 1000, unit: "g", catLabel: "Mercearia" },
      { key: "mac-500g2", svgId: "macarrao", label: "Macarrão 500g", price: 4.50, qty: 500,  unit: "g", catLabel: "Mercearia" },
      { key: "fej-2kg2",  svgId: "feijao",   label: "Feijão 2kg",    price: 19.80,qty: 2000, unit: "g", catLabel: "Mercearia" },
      { key: "det-1L2",   svgId: "detergente",label:"Deterg. 1L",    price: 8.50, qty: 1000, unit: "ml",catLabel: "Higiene" },
    ], correctKey: "arroz-1kg2",
  },
  {
    question: "Qual HORTIFRUTI custa menos de R$ 5 e tem o maior peso?",
    subtext: "Filtre pela categoria e pelo orçamento — depois compare as quantidades.",
    levelTag: "Categoria + Orçamento + Peso",
    explanation: "Banana 1kg (hortifruti, R$3,90, 1000g) pesa mais que a laranja e cabe no orçamento.",
    items: [
      { key: "banana-1kg2",svgId:"banana",   label: "Banana 1kg",    price: 3.90, qty: 1000, unit: "g",  catLabel: "Hortifruti" },
      { key: "laranja-500",svgId:"laranja",  label: "Laranja 500g",  price: 3.50, qty: 500,  unit: "g",  catLabel: "Hortifruti" },
      { key: "uva-300g",   svgId:"uva",      label: "Uva 300g",      price: 8.90, qty: 300,  unit: "g",  catLabel: "Hortifruti" },
      { key: "leite-1L4",  svgId:"leite",    label: "Leite 1L",      price: 5.90, qty: 1000, unit: "ml", catLabel: "Laticínios" },
    ], correctKey: "banana-1kg2",
  },
  {
    question: "Qual LATICÍNIO tem mais de 200g e custa menos de R$ 7?",
    subtext: "Verifique a categoria, o peso mínimo e o preço máximo.",
    levelTag: "Categoria + Peso + Orçamento",
    explanation: "Leite 1L (laticínio, 1000ml, R$5,90) atende os três critérios.",
    items: [
      { key: "leite-1L5",   svgId: "leite",   label: "Leite 1L",      price: 5.90, qty: 1000, unit: "ml", catLabel: "Laticínios" },
      { key: "iog-100g",    svgId: "iogurte", label: "Iogurte 100g",  price: 2.90, qty: 100,  unit: "g",  catLabel: "Laticínios" },
      { key: "manteiga-200",svgId: "manteiga",label: "Manteiga 200g", price: 9.90, qty: 200,  unit: "g",  catLabel: "Laticínios" },
      { key: "arroz-1kg3",  svgId: "arroz",   label: "Arroz 1kg",     price: 7.90, qty: 1000, unit: "g",  catLabel: "Mercearia" },
    ], correctKey: "leite-1L5",
  },
  {
    question: "Qual produto de HIGIENE tem mais de 300ml e custa menos de R$ 20?",
    subtext: "Filtre por categoria, verifique o volume mínimo e o preço máximo.",
    levelTag: "Categoria + Volume + Orçamento",
    explanation: "Detergente 1L (higiene, 1000ml > 300ml, R$8,50 < R$20) é o único que atende tudo.",
    items: [
      { key: "det-1L3",   svgId: "detergente", label: "Deterg. 1L",   price: 8.50,  qty: 1000, unit: "ml", catLabel: "Higiene" },
      { key: "pasta-90g2",svgId: "pasta",      label: "Pasta 90g",    price: 6.90,  qty: 90,   unit: "g",  catLabel: "Higiene" },
      { key: "sabao-500g3",svgId:"sabao",      label: "Sabão 500g",   price: 22.90, qty: 500,  unit: "g",  catLabel: "Higiene" },
      { key: "feijao-1kg2",svgId:"feijao",     label: "Feijão 1kg",   price: 8.90,  qty: 1000, unit: "g",  catLabel: "Mercearia" },
    ], correctKey: "det-1L3",
  },
  {
    question: "Qual produto de MERCEARIA tem mais de 400g e o melhor custo por 100g?",
    subtext: "Dois passos: filtre a categoria e o peso, depois compare o custo.",
    levelTag: "Categoria + Peso + Custo",
    explanation: "Macarrão 500g (mercearia, 500g > 400g, R$0,90/100g) vence o feijão e o arroz menor.",
    items: [
      { key: "mac-500g3",svgId: "macarrao", label: "Macarrão 500g", price: 4.50, qty: 500,  unit: "g", catLabel: "Mercearia" },
      { key: "fej-1kg2", svgId: "feijao",   label: "Feijão 1kg",    price: 11.90,qty: 1000, unit: "g", catLabel: "Mercearia" },
      { key: "arroz-250",svgId: "arroz",    label: "Arroz 250g",    price: 2.90, qty: 250,  unit: "g", catLabel: "Mercearia" },
      { key: "iog-200g3",svgId: "iogurte",  label: "Iogurte 200g",  price: 4.50, qty: 200,  unit: "g", catLabel: "Laticínios" },
    ], correctKey: "mac-500g3",
  },
  {
    question: "Qual BEBIDA tem mais de 600ml e cabe no orçamento de R$ 7?",
    subtext: "Encontre a bebida com volume suficiente que caiba no orçamento.",
    levelTag: "Categoria + Volume + Orçamento",
    explanation: "Suco de caixa 1L (bebida, 1000ml > 600ml, R$5,90 < R$7) é o único que atende tudo.",
    items: [
      { key: "suco-1L2", svgId: "suco-cx", label: "Suco cx. 1L",   price: 5.90, qty: 1000, unit: "ml", catLabel: "Bebidas" },
      { key: "agua-500", svgId: "agua-min",label: "Água 500ml",     price: 3.50, qty: 500,  unit: "ml", catLabel: "Bebidas" },
      { key: "refri-2L2",svgId: "refri",   label: "Refri. 2L",     price: 8.90, qty: 2000, unit: "ml", catLabel: "Bebidas" },
      { key: "leite-1L6",svgId: "leite",   label: "Leite 1L",      price: 5.90, qty: 1000, unit: "ml", catLabel: "Laticínios" },
    ], correctKey: "suco-1L2",
  },
];

// ── Utilities ─────────────────────────────────────────────────────────────────

function getPool(level: MRLevel): MRScenario[] {
  if (level === 1) return L1;
  if (level === 2) return L2;
  return L3;
}

function pickScenario(pool: MRScenario[], used: Set<number>): MRScenario {
  const avail = pool.map((_, i) => i).filter(i => !used.has(i));
  const src = avail.length > 0 ? avail : pool.map((_, i) => i);
  const idx = src[Math.floor(Math.random() * src.length)];
  used.add(idx);
  if (used.size >= pool.length) used.clear();

  // Shuffle items so correct answer isn't always in same position
  const s = pool[idx];
  const shuffled = [...s.items].sort(() => Math.random() - 0.5);
  return { ...s, items: shuffled };
}

// ── Tutorial ─────────────────────────────────────────────────────────────────

function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const scenario: MRScenario = {
    question: "Qual é o mais barato?",
    subtext: "Toque no produto com o menor preço.",
    levelTag: "Menor preço",
    items: [
      { key: "banana", svgId: "banana", label: "Banana",  price: 3.90 },
      { key: "maca",   svgId: "maca",   label: "Maçã",    price: 6.90 },
      { key: "uva",    svgId: "uva",    label: "Uva",     price: 8.90 },
    ],
    correctKey: "banana",
    explanation: "Banana (R$ 3,90) tem o menor preço.",
  };

  const [chosen, setChosen] = useState<string | null>(null);
  const doneRef = useRef(false);

  function tap(key: string) {
    if (chosen || doneRef.current) return;
    setChosen(key);
    if (key === scenario.correctKey && !doneRef.current) {
      doneRef.current = true;
      setTimeout(onDone, 900);
    } else {
      setTimeout(() => setChosen(null), 900);
    }
  }

  return (
    <div className="space-y-3">
      <div className={`rounded-xl px-4 py-3 text-center font-bold text-sm ${theme === "GAMIFIED" ? "bg-cyan-900/40 border border-cyan-600 text-cyan-300" : "bg-violet-50 border border-violet-200 text-violet-800"}`}>
        {scenario.question}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {scenario.items.map(item => {
          const isChosen = chosen === item.key;
          const correct = chosen ? item.key === scenario.correctKey : false;
          const wrong = isChosen && !correct;
          return (
            <button key={item.key} onClick={() => tap(item.key)}
              className={`rounded-xl border-2 overflow-hidden flex flex-col transition-all active:scale-95 ${
                isChosen && correct ? "border-green-500" :
                isChosen && wrong ? "border-red-400" :
                theme === "GAMIFIED" ? "border-gray-600" : "border-slate-200"
              }`}
            >
              <div className={`flex items-center justify-center h-16 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-50"}`}>
                <ItemSvg id={item.svgId} size={48} />
              </div>
              <div className={`px-2 py-1.5 text-center ${theme === "GAMIFIED" ? "bg-gray-800" : "bg-white"}`}>
                <p className={`text-xs font-semibold ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>{item.label}</p>
                <p className={`text-sm font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600"}`}>{fmt(item.price)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MudancaRegras({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [level, setLevel] = useState<MRLevel>(() => getLevel(difficulty));
  const [streak, setStreak] = useState(0);
  const [trial, setTrial] = useState(0);
  const [trialResults, setTrialResults] = useState<boolean[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [phase, setPhase] = useState<"choosing" | "feedback">("choosing");

  const usedRef = useRef(new Set<number>());
  const startTime = useRef(Date.now());
  const resultsRef = useRef<boolean[]>([]);
  const trialRef = useRef(0);

  const [scenario, setScenario] = useState<MRScenario>(() =>
    pickScenario(getPool(getLevel(difficulty)), usedRef.current)
  );

  const loadNext = useCallback((nextLevel: MRLevel) => {
    setScenario(pickScenario(getPool(nextLevel), usedRef.current));
    setChosen(null);
    setPhase("choosing");
  }, []);

  function handleTap(key: string) {
    if (phase !== "choosing") return;
    setChosen(key);
    setPhase("feedback");

    const isCorrect = key === scenario.correctKey;
    const newResults = [...resultsRef.current, isCorrect];
    resultsRef.current = newResults;
    setTrialResults(newResults);

    // Adaptive level progression
    const newStreak = isCorrect ? Math.max(streak, 0) + 1 : Math.min(streak, 0) - 1;
    let nextLevel = level;
    let resetStreak = false;
    if (newStreak >= 2) {
      nextLevel = Math.min(level + 1, 3) as MRLevel;
      resetStreak = true;
    } else if (newStreak <= -2) {
      nextLevel = Math.max(level - 1, 1) as MRLevel;
      resetStreak = true;
    }
    const nextStreak = resetStreak ? 0 : newStreak;
    setStreak(nextStreak);
    setLevel(nextLevel);

    const nextTrial = trialRef.current + 1;
    reportProgress(Math.round((nextTrial / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextTrial >= MAX_TRIALS) {
        const accuracy = newResults.filter(Boolean).length / MAX_TRIALS;
        onComplete({
          exerciseId: "mudanca-regras",
          domain: "executive",
          score: calculateExerciseScore("mudanca-regras", accuracy, undefined, difficulty),
          accuracy, difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { trials: MAX_TRIALS, correct: newResults.filter(Boolean).length, level: nextLevel },
        });
      } else {
        trialRef.current = nextTrial;
        setTrial(nextTrial);
        loadNext(nextLevel);
      }
    }, 2200);
  }

  if (showTutorial) {
    return (
      <TutorialBase theme={theme} title="Mudança de Regras"
        steps={[{
          instruction: "A cada rodada você verá uma PERGUNTA e 3 ou 4 produtos. Toque no produto que melhor responde à pergunta.",
          content: (done) => <TutStep theme={theme} onDone={done} />,
        }]}
        onDone={() => setShowTutorial(false)}
      />
    );
  }

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-violet-50 to-purple-50" : "bg-slate-50",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-violet-700" : "text-slate-900",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-slate-500",
    questionBg: theme === "GAMIFIED" ? "bg-gray-800 border-gray-600" : theme === "COLORFUL" ? "bg-violet-50 border-violet-200" : "bg-white border-slate-200",
    questionText: theme === "GAMIFIED" ? "text-cyan-300" : theme === "COLORFUL" ? "text-violet-800" : "text-slate-800",
    levelBadge: theme === "GAMIFIED" ? "bg-cyan-900/50 text-cyan-300" : level === 1 ? "bg-green-100 text-green-700" : level === 2 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700",
    cardNeutral: theme === "GAMIFIED" ? "border-gray-600" : "border-slate-200",
    cardCorrect: "border-green-500",
    cardWrong: "border-red-400",
    sceneBg: theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-50",
    labelBg: theme === "GAMIFIED" ? "bg-gray-800" : "bg-white",
    itemName: theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800",
    priceCls: theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600",
    dot: (i: number) => {
      if (i < trialResults.length) return trialResults[i] ? "bg-green-500" : "bg-red-400";
      if (i === trial) return (theme === "GAMIFIED" ? "bg-cyan-500" : "bg-violet-500") + " animate-pulse";
      return theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200";
    },
  };

  const isCorrect = chosen === scenario.correctKey;
  const gridCols = scenario.items.length === 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className={`min-h-screen flex flex-col p-4 pt-5 ${pal.bg}`}>
      <div className="w-full max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className={`font-bold text-base ${pal.title}`}>🔀 Mudança de Regras</h2>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${pal.levelBadge}`}>
              {level === 1 ? "🟢 Leve" : level === 2 ? "🟡 Médio" : "🔴 Avançado"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {streak >= 2 && <span className="text-xs font-bold text-orange-500">🔥 {streak}</span>}
            {streak <= -2 && <span className="text-xs font-bold text-blue-400">↓ {Math.abs(streak)}</span>}
            <span className={`text-xs ${pal.sub}`}>{trial + 1}/{MAX_TRIALS}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-0.5">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${pal.dot(i)}`} />
          ))}
        </div>

        {/* Question banner */}
        <AnimatePresence mode="wait">
          <motion.div key={`q-${trial}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border-2 px-4 py-4 ${pal.questionBg}`}>
            <p className={`text-base font-bold text-center leading-snug ${pal.questionText}`}>{scenario.question}</p>
            {scenario.subtext && (
              <p className={`text-xs text-center mt-1 ${pal.sub}`}>{scenario.subtext}</p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Items grid */}
        <AnimatePresence mode="wait">
          <motion.div key={`items-${trial}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`grid ${gridCols} gap-3`}>
            {scenario.items.map(item => {
              const isChosen = chosen === item.key;
              const isCorrectItem = item.key === scenario.correctKey;
              let borderCls = pal.cardNeutral;
              if (phase === "feedback") {
                if (isCorrectItem) borderCls = pal.cardCorrect;
                else if (isChosen) borderCls = pal.cardWrong;
              }

              return (
                <motion.button
                  key={item.key}
                  onClick={() => handleTap(item.key)}
                  disabled={phase === "feedback"}
                  className={`rounded-2xl border-2 overflow-hidden flex flex-col transition-all active:scale-95 ${borderCls}`}
                  animate={phase === "feedback" && isChosen && !isCorrectItem ? { x: [-4, 4, -4, 4, 0] } : {}}
                  transition={{ duration: 0.25 }}
                >
                  {/* Scene */}
                  <div className={`relative flex items-center justify-center py-4 ${pal.sceneBg}`}>
                    <ItemSvg id={item.svgId} size={56} />
                    {phase === "feedback" && isCorrectItem && (
                      <span className="absolute top-1.5 right-1.5 text-green-500 text-lg font-bold">✓</span>
                    )}
                    {phase === "feedback" && isChosen && !isCorrectItem && (
                      <span className="absolute top-1.5 right-1.5 text-red-400 text-lg font-bold">✗</span>
                    )}
                  </div>
                  {/* Details */}
                  <div className={`px-2 py-2 flex flex-col items-center gap-0.5 ${pal.labelBg}`}>
                    <p className={`text-xs font-semibold text-center leading-tight ${pal.itemName}`}>{item.label}</p>
                    <p className={`text-sm font-bold ${pal.priceCls}`}>{fmt(item.price)}</p>
                    {item.qty !== undefined && (
                      <p className={`text-[11px] ${pal.sub}`}>{item.qty}{item.unit}</p>
                    )}
                    {item.catLabel && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-0.5 ${
                        theme === "GAMIFIED" ? "bg-gray-700 text-gray-400" : "bg-slate-100 text-slate-500"
                      }`}>{item.catLabel}</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Feedback banner */}
        <AnimatePresence>
          {phase === "feedback" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`rounded-xl px-4 py-3 border ${isCorrect ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}
            >
              <p className={`font-bold text-sm ${isCorrect ? "text-green-700" : "text-red-600"}`}>
                {isCorrect ? "✅ Resposta correta!" : "❌ Resposta incorreta"}
              </p>
              <p className={`text-xs mt-0.5 ${isCorrect ? "text-green-600" : "text-red-500"}`}>
                {scenario.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
