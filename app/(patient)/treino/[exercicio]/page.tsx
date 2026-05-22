"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { ExerciseWrapper } from "@/components/exercises/ExerciseWrapper";
import { EXERCISE_DEFINITIONS, type ExerciseResult, type Theme } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

function ExerciseLoader() {
  return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
}

const SpanNumerico        = dynamic(() => import("@/components/exercises/memory/SpanNumerico").then(m => ({ default: m.SpanNumerico })), { loading: ExerciseLoader });
const MatrizEspacial      = dynamic(() => import("@/components/exercises/memory/MatrizEspacial").then(m => ({ default: m.MatrizEspacial })), { loading: ExerciseLoader });
const AssociacaoPares     = dynamic(() => import("@/components/exercises/memory/AssociacaoPares").then(m => ({ default: m.AssociacaoPares })), { loading: ExerciseLoader });
const JogoMemoria         = dynamic(() => import("@/components/exercises/memory/JogoMemoria").then(m => ({ default: m.JogoMemoria })), { loading: ExerciseLoader });
const SpanNumericoInverso = dynamic(() => import("@/components/exercises/memory/SpanNumericoInverso").then(m => ({ default: m.SpanNumericoInverso })), { loading: ExerciseLoader });
const MatrizEspacialInversa = dynamic(() => import("@/components/exercises/memory/MatrizEspacialInversa").then(m => ({ default: m.MatrizEspacialInversa })), { loading: ExerciseLoader });
const NBack               = dynamic(() => import("@/components/exercises/memory/NBack").then(m => ({ default: m.NBack })), { loading: ExerciseLoader });
const TrilhaVisual        = dynamic(() => import("@/components/exercises/attention/TrilhaVisual").then(m => ({ default: m.TrilhaVisual })), { loading: ExerciseLoader });
const StroopTask          = dynamic(() => import("@/components/exercises/attention/StroopTask").then(m => ({ default: m.StroopTask })), { loading: ExerciseLoader });
const Vigilancia          = dynamic(() => import("@/components/exercises/attention/Vigilancia").then(m => ({ default: m.Vigilancia })), { loading: ExerciseLoader });
const TempoReacao         = dynamic(() => import("@/components/exercises/processing/TempoReacao").then(m => ({ default: m.TempoReacao })), { loading: ExerciseLoader });
const DecisaoRapida       = dynamic(() => import("@/components/exercises/processing/DecisaoRapida").then(m => ({ default: m.DecisaoRapida })), { loading: ExerciseLoader });
const IdentificacaoSimbolos = dynamic(() => import("@/components/exercises/processing/IdentificacaoSimbolos").then(m => ({ default: m.IdentificacaoSimbolos })), { loading: ExerciseLoader });
const TorreHanoi          = dynamic(() => import("@/components/exercises/executive/TorreHanoi").then(m => ({ default: m.TorreHanoi })), { loading: ExerciseLoader });
const Sequenciamento      = dynamic(() => import("@/components/exercises/executive/Sequenciamento").then(m => ({ default: m.Sequenciamento })), { loading: ExerciseLoader });
const FlexibilidadeCognitiva = dynamic(() => import("@/components/exercises/executive/FlexibilidadeCognitiva").then(m => ({ default: m.FlexibilidadeCognitiva })), { loading: ExerciseLoader });
const Labirinto           = dynamic(() => import("@/components/exercises/executive/Labirinto").then(m => ({ default: m.Labirinto })), { loading: ExerciseLoader });

const EXERCISE_INSTRUCTIONS: Record<string, string[]> = {
  "span-numerico": [
    "Uma sequência de números será exibida, um por vez, na tela.",
    "Memorize os números na ordem em que aparecem.",
    "Após a sequência, digite os números na ordem correta.",
    "Tente se concentrar e evite distrações.",
  ],
  "matriz-espacial": [
    "Células de uma grade serão iluminadas em sequência.",
    "Observe com atenção a ordem em que as células acendem.",
    "Após a sequência, clique nas células na mesma ordem.",
    "Fique atento — a velocidade aumenta com a dificuldade!",
  ],
  "associacao-pares": [
    "Você verá pares de palavras e imagens para memorizar.",
    "Estude os pares durante o tempo disponível.",
    "Em seguida, você verá uma palavra e deverá escolher a imagem correta.",
    "Tente criar associações mentais para facilitar a memorização.",
  ],
  "trilha-visual": [
    "Números de 1 a N estão espalhados pela tela.",
    "Toque os números em ordem crescente: 1, 2, 3...",
    "Se tocar no número errado, conta como erro.",
    "Tente ser rápido mas preciso!",
  ],
  "stroop-task": [
    "Palavras de cores aparecerão na tela escritas em tintas coloridas.",
    "Você deve identificar a COR DA TINTA, não a palavra escrita.",
    "Por exemplo: a palavra AZUL escrita em vermelho — resposta correta: VERMELHO.",
    "Seja rápido — o exercício testa sua atenção seletiva!",
  ],
  "vigilancia": [
    "Uma sequência de letras e números aparecerá rapidamente.",
    "Toque na área de estímulo quando vir a letra/número alvo (indicado na tela).",
    "Não toque quando for outro estímulo.",
    "Mantenha o foco — o exercício testa atenção sustentada!",
  ],
  "tempo-reacao": [
    "Um círculo aparecerá na tela.",
    "Aguarde — quando ele ficar VERDE, toque o mais rápido possível!",
    "Não toque antes do sinal verde (toque antecipado conta como erro).",
    "Tente manter um tempo de reação consistente.",
  ],
  "decisao-rapida": [
    "Você verá imagens com nomes de animais ou objetos.",
    "Classifique rapidamente: é um animal ou um objeto?",
    "Toque na categoria correta o mais rápido possível.",
    "Velocidade E precisão são avaliadas!",
  ],
  "identificacao-simbolos": [
    "Um símbolo alvo será mostrado no topo da tela.",
    "Encontre esse símbolo entre os outros e toque nele.",
    "Seja rápido — o tempo de resposta é medido.",
    "Símbolos parecidos irão aparecer para dificultar!",
  ],
  "torre-hanoi": [
    "Você verá 3 pinos com discos de diferentes tamanhos.",
    "Mova todos os discos do pino esquerdo para o direito.",
    "Regra: um disco maior nunca pode ficar sobre um menor.",
    "Planeje seus movimentos com antecedência!",
  ],
  "sequenciamento": [
    "Você verá uma lista de passos de uma tarefa em ordem aleatória.",
    "Arraste os passos para colocá-los na ordem correta.",
    "Pense na sequência lógica de cada etapa.",
    "Quando estiver satisfeito, clique em 'Verificar Sequência'.",
  ],
  "flexibilidade-cognitiva": [
    "Você classificará cartões por uma regra (cor ou forma).",
    "A regra mudará durante o exercício — preste atenção!",
    "Quando a regra mudar, você verá um aviso na tela.",
    "Tente se adaptar rapidamente às mudanças de regra.",
  ],
  "labirinto": [
    "Você está no canto superior esquerdo do labirinto.",
    "Seu objetivo é chegar até a bandeira 🏁 no canto inferior direito.",
    "Use as setas na tela para se mover: ↑ ↓ ← →",
    "Planeje seu caminho com atenção — nem todo caminho leva à saída!",
  ],
  "jogo-memoria": [
    "As cartas estão viradas para baixo — você não consegue ver as figuras.",
    "Toque em uma carta para virá-la, depois toque em outra.",
    "Se as duas forem iguais, elas ficam abertas! Se não, voltam viradas.",
    "Tente lembrar onde cada figura está para encontrar todos os pares!",
  ],
  "span-numerico-inverso": [
    "Uma sequência de números será exibida, um por vez.",
    "Memorize os números — mas responda em ORDEM INVERSA.",
    "Se ouvir 3 → 7 → 2, responda 2 → 7 → 3.",
    "Este exercício treina memória operacional (working memory).",
  ],
  "matriz-espacial-inversa": [
    "Células de uma grade serão iluminadas em sequência.",
    "Após a sequência, clique nas células em ORDEM INVERSA.",
    "Se acendeu posição A → B → C, clique C → B → A.",
    "Este exercício treina memória operacional visuoespacial.",
  ],
  "nback": [
    "Uma letra será exibida por vez na tela.",
    "Você deve responder se a letra ATUAL é igual à de N posições atrás.",
    "Exemplo (2-back): A B C A → a 4ª letra (A) é igual à 2ª (B)? NÃO.",
    "Responda SIM ou NÃO antes que a próxima letra apareça.",
  ],
};

export default function ExercicioPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const exerciseId = params.exercicio as string;

  const [difficulty, setDifficulty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>("CLINICAL");

  useEffect(() => {
    const user = session?.user as { patientId?: string; theme?: string } | undefined;
    if (!user?.patientId) return;

    setTheme((user.theme ?? "CLINICAL") as Theme);

    // Fetch current difficulty
    fetch(`/api/patients/${user.patientId}?config=true`)
      .then((r) => r.json())
      .then((data) => {
        const config = data.exerciseConfigs?.find(
          (c: { exerciseId: string; currentDifficulty: number }) => c.exerciseId === exerciseId
        );
        if (config) setDifficulty(config.currentDifficulty);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, exerciseId]);

  const exerciseDef = EXERCISE_DEFINITIONS[exerciseId as keyof typeof EXERCISE_DEFINITIONS];

  async function handleComplete(result: ExerciseResult) {
    const user = session?.user as { patientId?: string } | undefined;
    if (!user?.patientId) return;

    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: user.patientId,
          ...result,
        }),
      });
      toast({ title: "Sessão salva!", description: `Pontuação: ${Math.round(result.score)}/100` });
    } catch {
      toast({ title: "Erro ao salvar sessão", variant: "destructive" });
    }

    router.push("/inicio");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!exerciseDef) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Exercício não encontrado: {exerciseId}</p>
      </div>
    );
  }

  const instructions = EXERCISE_INSTRUCTIONS[exerciseId] ?? ["Siga as instruções do exercício."];

  function renderExercise(onComplete: (result: ExerciseResult) => void) {
    const props = { difficulty, theme, onComplete };

    switch (exerciseId) {
      case "span-numerico": return <SpanNumerico {...props} />;
      case "matriz-espacial": return <MatrizEspacial {...props} />;
      case "associacao-pares": return <AssociacaoPares {...props} />;
      case "trilha-visual": return <TrilhaVisual {...props} />;
      case "stroop-task": return <StroopTask {...props} />;
      case "vigilancia": return <Vigilancia {...props} />;
      case "tempo-reacao": return <TempoReacao {...props} />;
      case "decisao-rapida": return <DecisaoRapida {...props} />;
      case "identificacao-simbolos": return <IdentificacaoSimbolos {...props} />;
      case "torre-hanoi": return <TorreHanoi {...props} />;
      case "sequenciamento": return <Sequenciamento {...props} />;
      case "flexibilidade-cognitiva": return <FlexibilidadeCognitiva {...props} />;
      case "labirinto": return <Labirinto {...props} />;
      case "jogo-memoria": return <JogoMemoria {...props} />;
      case "span-numerico-inverso": return <SpanNumericoInverso {...props} />;
      case "matriz-espacial-inversa": return <MatrizEspacialInversa {...props} />;
      case "nback": return <NBack {...props} />;
      default: return <div className="p-8 text-center text-gray-500">Exercício em desenvolvimento</div>;
    }
  }

  return (
    <ExerciseWrapper
      title={exerciseDef.name}
      instructions={instructions}
      theme={theme}
      difficulty={difficulty}
      onFinish={handleComplete}
    >
      {(onComplete) => renderExercise(onComplete)}
    </ExerciseWrapper>
  );
}
