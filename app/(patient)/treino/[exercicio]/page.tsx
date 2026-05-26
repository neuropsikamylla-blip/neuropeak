"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { ExerciseWrapper } from "@/components/exercises/ExerciseWrapper";
import { EXERCISE_DEFINITIONS, type ExerciseResult, type Theme } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ExerciseLoader() {
  return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
}

const SpanNumerico        = dynamic(() => import("@/components/exercises/memory/SpanNumerico").then(m => ({ default: m.SpanNumerico })), { loading: ExerciseLoader });
const MatrizEspacial      = dynamic(() => import("@/components/exercises/memory/MatrizEspacial").then(m => ({ default: m.MatrizEspacial })), { loading: ExerciseLoader });
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
const Labirinto           = dynamic(() => import("@/components/exercises/executive/Labirinto").then(m => ({ default: m.Labirinto })), { loading: ExerciseLoader });
const OrdemHistoria       = dynamic(() => import("@/components/exercises/executive/OrdemHistoria").then(m => ({ default: m.OrdemHistoria })), { loading: ExerciseLoader });
const CertoOuErrado       = dynamic(() => import("@/components/exercises/processing/CertoOuErrado").then(m => ({ default: m.CertoOuErrado })), { loading: ExerciseLoader });
const AntesDepois         = dynamic(() => import("@/components/exercises/attention/AntesDepois").then(m => ({ default: m.AntesDepois })), { loading: ExerciseLoader });
const AtencaoSeletiva     = dynamic(() => import("@/components/exercises/attention/AtencaoSeletiva").then(m => ({ default: m.AtencaoSeletiva })), { loading: ExerciseLoader });
const AtencaoAlternada    = dynamic(() => import("@/components/exercises/attention/AtencaoAlternada").then(m => ({ default: m.AtencaoAlternada })), { loading: ExerciseLoader });
const AtencaoSustentada   = dynamic(() => import("@/components/exercises/attention/AtencaoSustentada").then(m => ({ default: m.AtencaoSustentada })), { loading: ExerciseLoader });
const Semaforo            = dynamic(() => import("@/components/exercises/processing/Semaforo").then(m => ({ default: m.Semaforo })), { loading: ExerciseLoader });
const DesafioSupermercado = dynamic(() => import("@/components/exercises/memory/DesafioSupermercado").then(m => ({ default: m.DesafioSupermercado })), { loading: ExerciseLoader });
const DesafioCidade       = dynamic(() => import("@/components/exercises/executive/DesafioCidade").then(m => ({ default: m.DesafioCidade })), { loading: ExerciseLoader });
const CorridaContraOTempo = dynamic(() => import("@/components/exercises/processing/CorridaContraOTempo").then(m => ({ default: m.CorridaContraOTempo })), { loading: ExerciseLoader });
const DesafioOrcamento    = dynamic(() => import("@/components/exercises/executive/DesafioOrcamento").then(m => ({ default: m.DesafioOrcamento })), { loading: ExerciseLoader });
const CacaItemBarato      = dynamic(() => import("@/components/exercises/attention/CacaItemBarato").then(m => ({ default: m.CacaItemBarato })), { loading: ExerciseLoader });
const MudancaRegras       = dynamic(() => import("@/components/exercises/executive/MudancaRegras").then(m => ({ default: m.MudancaRegras })), { loading: ExerciseLoader });
const CompraMultifuncional = dynamic(() => import("@/components/exercises/executive/CompraMultifuncional").then(m => ({ default: m.CompraMultifuncional })), { loading: ExerciseLoader });

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
    "Uma palavra colorida aparecerá na tela. No topo, haverá uma regra: 🎨 COR ou 📝 PALAVRA.",
    "Se a regra for COR: clique na cor da tinta usada para pintar a palavra.",
    "Se a regra for PALAVRA: clique na palavra que está escrita, independente da cor.",
    "Antes de começar, você verá dois exemplos práticos para entender bem!",
  ],
  "vigilancia": [
    "Uma sequência de letras e números aparecerá rapidamente.",
    "Toque na área de estímulo quando vir a letra/número alvo (indicado na tela).",
    "Não toque quando for outro estímulo.",
    "Mantenha o foco — o exercício testa atenção sustentada!",
  ],
  "tempo-reacao": [
    "Balões coloridos irão cair pela tela.",
    "Toque APENAS nos balões VERDES — eles são o alvo certo.",
    "Balões de outras cores são distratores — ignore-os.",
    "Rapidez e precisão contam: toque certo, no momento certo!",
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
    "Você verá 3 pinos com discos empilhados no pino da esquerda.",
    "Mova todos os discos para o pino da direita, usando o pino do meio como apoio.",
    "Regra: um disco maior NUNCA pode ficar sobre um menor.",
    "Tente resolver usando o menor número de movimentos possível!",
  ],
  "labirinto": [
    "Você está num labirinto — navegue até a bandeira 🏁 para sair.",
    "Use as setas na tela ou as teclas WASD / setas do teclado.",
    "Você só vê uma parte do labirinto — explore com atenção e guarde referências visuais.",
    "Ao se perder, volte ao último cruzamento que você lembra.",
  ],
  "jogo-memoria": [
    "Objetos do dia a dia aparecerão nas cartas — remédios, chaves, óculos e mais.",
    "Memorize as posições durante o tempo de exibição.",
    "Depois, encontre os pares: toque uma carta, depois a outra igual.",
    "Cuidado: erros demais encerram a rodada antes de terminar!",
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
  "ordem-historia": [
    "Você verá 4 painéis de uma situação do dia a dia em ordem embaralhada.",
    "Arraste os painéis para colocá-los em ordem cronológica: do primeiro ao último.",
    "Pense em qual etapa precisa acontecer antes da próxima.",
    "Clique em 'Verificar' quando estiver satisfeito com a ordem.",
  ],
  "certo-ou-errado": [
    "Você verá uma situação do cotidiano descrita em texto.",
    "Decida rapidamente: essa situação está CORRETA ou ERRADA?",
    "Pense em segurança, saúde e boas práticas do dia a dia.",
    "Velocidade e precisão contam — confie no seu julgamento!",
  ],
  "antes-depois": [
    "Uma palavra aparece no centro — pode ser um dia, mês, número ou rotina.",
    "A pergunta indica: O que vem ANTES? ou O que vem DEPOIS?",
    "Escolha a opção correta entre as 4 alternativas.",
    "Tente responder antes que o tempo acabe — rapidez e precisão valem!",
  ],
  "atencao-seletiva": [
    "Uma palavra alvo aparece no topo da tela.",
    "Localize essa palavra entre as outras e toque nela.",
    "As palavras distratoras são similares — leia com atenção.",
    "Seja rápido: o tempo de resposta é medido!",
  ],
  "atencao-alternada": [
    "Você verá um objeto ou ser vivo e deve classificá-lo conforme a REGRA ATUAL.",
    "A regra muda durante o exercício: ora é 'Animal ou Objeto?', ora é 'Grande ou Pequeno?'",
    "Sempre verifique qual regra está ativa antes de responder.",
    "Adaptar-se à mudança de regra é o treino principal!",
  ],
  "atencao-sustentada": [
    "Letras vão aparecer uma por vez, rapidamente.",
    "Toque a tela APENAS quando aparecer a letra A.",
    "Ignore todas as outras letras — inclusive letras parecidas com A.",
    "Mantenha o foco durante todo o exercício — a atenção não pode vacilar!",
  ],
  "semaforo": [
    "Três semáforos aparecem na tela e piscam ao mesmo tempo.",
    "Após piscar, UM deles acende com uma cor — esse é o ativo.",
    "Verde → toque AVANÇAR. Vermelho ou amarelo → toque PARAR.",
    "Reaja rápido assim que um semáforo acender — o tempo é limitado!",
  ],
  "desafio-supermercado": [
    "Uma lista de compras aparecerá na tela por alguns segundos — memorize os itens!",
    "Após a lista sumir, você verá uma prateleira com vários produtos.",
    "Selecione apenas os itens que estavam na sua lista.",
    "Confirme quando estiver pronto. A dificuldade aumenta conforme você acerta!",
  ],
  "desafio-cidade": [
    "Você está em uma cidade com diferentes ambientes: Mercado, Cinema e mais.",
    "Escolha um ambiente e complete a missão proposta.",
    "No Mercado: memorize a lista de compras e encontre os itens corretos.",
    "No Cinema: planeje sua compra dentro do orçamento disponível.",
  ],
  "corrida-tempo": [
    "Uma categoria de produto será anunciada antes de cada rodada.",
    "Localize e toque TODOS os itens que pertencem a essa categoria no grid.",
    "Seja rápido — o tempo é limitado! Itens da categoria errada não contam.",
    "A grade fica maior e o tempo menor conforme a dificuldade aumenta.",
  ],
  "desafio-orcamento": [
    "Você verá um conjunto de produtos com seus preços e um objetivo de gasto.",
    "Selecione itens para atingir o objetivo: máximo, faixa ou valor exato.",
    "O total aparece em tempo real — confirme quando estiver satisfeito.",
    "Fique atento: ultrapassar o orçamento desabilita a confirmação!",
  ],
  "caca-item-barato": [
    "Você verá diferentes embalagens do mesmo produto, com tamanhos e preços variados.",
    "Calcule (ou estime) qual tem o menor preço por 100g ou 100ml.",
    "Toque na embalagem que oferece o melhor custo-benefício.",
    "Nas dificuldades maiores, o preço por unidade não aparece — calcule mentalmente!",
  ],
  "mudanca-regras": [
    "Uma regra aparece no topo da tela: selecione TODOS os itens que se encaixam nela.",
    "A regra pode mudar a cada rodada — fique atento ao aviso de mudança!",
    "Confirme a seleção quando estiver pronto. É necessário acertar todos os itens corretos.",
    "Regras possíveis: categoria, preço máximo, preço mínimo ou excluir categoria.",
  ],
  "compra-multifuncional": [
    "Você deve respeitar TODAS as regras ao mesmo tempo: orçamento, categoria e quantidade.",
    "Um painel mostra em tempo real quais regras já foram cumpridas (✓) e quais faltam.",
    "O cronômetro corre — se o tempo acabar, a compra é confirmada como está.",
    "Planeje antes de tocar nos itens: leia todas as restrições primeiro!",
  ],
};

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function BlockedScreen({ theme, exerciseName }: { theme: Theme; exerciseName: string }) {
  const styles = {
    CLINICAL: {
      bg: "bg-gray-50 min-h-screen flex items-center justify-center p-4",
      card: "bg-white rounded-xl shadow-md border border-gray-100 p-8 max-w-sm w-full text-center",
      icon: "text-green-500",
      title: "text-gray-900 text-xl font-semibold mt-4 mb-2",
      msg: "text-gray-500 text-sm mb-6",
      btn: "bg-blue-600 hover:bg-blue-700 text-white w-full h-11",
    },
    COLORFUL: {
      bg: "bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 min-h-screen flex items-center justify-center p-4",
      card: "bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8 max-w-sm w-full text-center",
      icon: "text-green-500",
      title: "text-purple-700 text-2xl font-bold mt-4 mb-2",
      msg: "text-purple-500 text-sm mb-6",
      btn: "bg-gradient-to-r from-purple-500 to-pink-500 text-white w-full h-11 rounded-full font-bold",
    },
    GAMIFIED: {
      bg: "bg-gray-950 min-h-screen flex items-center justify-center p-4",
      card: "bg-gray-800 rounded-2xl border border-cyan-500/30 p-8 max-w-sm w-full text-center shadow-[0_0_30px_rgba(6,182,212,0.1)]",
      icon: "text-cyan-400",
      title: "text-cyan-400 text-xl font-black tracking-wide mt-4 mb-2 uppercase",
      msg: "text-gray-400 text-sm mb-6",
      btn: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white w-full h-11 rounded-xl font-bold tracking-wide",
    },
  };
  const s = styles[theme];

  return (
    <div className={s.bg}>
      <div className={s.card}>
        <CheckCircle2 className={`w-16 h-16 mx-auto ${s.icon}`} />
        <h2 className={s.title}>
          {theme === "GAMIFIED"
            ? "Missão Concluída!"
            : theme === "COLORFUL"
            ? "Exercício concluído hoje! 🎉"
            : "Exercício concluído hoje"}
        </h2>
        <p className={s.msg}>
          {theme === "GAMIFIED"
            ? `${exerciseName} já foi completado hoje. Volte amanhã para continuar subindo de nível!`
            : theme === "COLORFUL"
            ? `Você já treinou ${exerciseName} hoje! Volte amanhã para mais desafios. 💪`
            : `Você já realizou ${exerciseName} hoje. Descanse e volte amanhã — a consistência é o segredo!`}
        </p>
        <Button className={s.btn} asChild>
          <Link href="/inicio">
            {theme === "GAMIFIED" ? "Voltar ao QG" : "Voltar ao início"}
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function ExercicioPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const exerciseId = params.exercicio as string;

  const [difficulty, setDifficulty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>("CLINICAL");
  const [blockedToday, setBlockedToday] = useState(false);
  const [patientAge, setPatientAge] = useState<number | undefined>();

  useEffect(() => {
    const user = session?.user as { patientId?: string; theme?: string } | undefined;
    if (!user?.patientId) return;

    setTheme((user.theme ?? "CLINICAL") as Theme);

    fetch(`/api/patients/${user.patientId}?config=true`)
      .then((r) => r.json())
      .then((data) => {
        // Calculate patient age from dateOfBirth if available
        const dob = data.patient?.dateOfBirth;
        if (dob) {
          const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
          setPatientAge(age);
        }

        const configs = data.patient?.exerciseConfigs ?? [];
        const config = configs.find(
          (c: { exerciseId: string; currentDifficulty: number; lastAttemptAt?: string | null }) =>
            c.exerciseId === exerciseId
        );

        if (config) {
          const lastAttempt = config.lastAttemptAt ? new Date(config.lastAttemptAt) : null;
          if (lastAttempt && isSameLocalDay(lastAttempt, new Date())) {
            // Already done today — block
            setBlockedToday(true);
          } else if (lastAttempt) {
            // New day: warm-up at 2 below last reached difficulty
            setDifficulty(Math.max(1, config.currentDifficulty - 2));
          } else {
            setDifficulty(config.currentDifficulty);
          }
        }
        // No config = first time doing exercise, start at difficulty 1 (default)
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

  if (blockedToday) {
    return <BlockedScreen theme={theme} exerciseName={exerciseDef.name} />;
  }

  const instructions = EXERCISE_INSTRUCTIONS[exerciseId] ?? ["Siga as instruções do exercício."];

  function renderExercise(onComplete: (result: ExerciseResult) => void) {
    const props = { difficulty, theme, onComplete };

    switch (exerciseId) {
      case "span-numerico": return <SpanNumerico {...props} />;
      case "matriz-espacial": return <MatrizEspacial {...props} />;
      case "trilha-visual": return <TrilhaVisual {...props} />;
      case "stroop-task": return <StroopTask {...props} />;
      case "vigilancia": return <Vigilancia {...props} />;
      case "tempo-reacao": return <TempoReacao {...props} />;
      case "decisao-rapida": return <DecisaoRapida {...props} />;
      case "identificacao-simbolos": return <IdentificacaoSimbolos {...props} />;
      case "torre-hanoi": return <TorreHanoi {...props} />;
      case "labirinto": return <Labirinto {...props} />;
      case "jogo-memoria": return <JogoMemoria {...props} />;
      case "span-numerico-inverso": return <SpanNumericoInverso {...props} />;
      case "matriz-espacial-inversa": return <MatrizEspacialInversa {...props} />;
      case "nback": return <NBack {...props} />;
      case "ordem-historia": return <OrdemHistoria {...props} />;
      case "certo-ou-errado": return <CertoOuErrado {...props} patientAge={patientAge} />;
      case "antes-depois": return <AntesDepois {...props} />;
      case "atencao-seletiva": return <AtencaoSeletiva {...props} />;
      case "atencao-alternada": return <AtencaoAlternada {...props} />;
      case "atencao-sustentada": return <AtencaoSustentada {...props} />;
      case "semaforo": return <Semaforo {...props} />;
      case "desafio-supermercado": return <DesafioSupermercado {...props} />;
      case "desafio-cidade": return <DesafioCidade {...props} />;
      case "corrida-tempo": return <CorridaContraOTempo {...props} />;
      case "desafio-orcamento": return <DesafioOrcamento {...props} />;
      case "caca-item-barato": return <CacaItemBarato {...props} />;
      case "mudanca-regras": return <MudancaRegras {...props} />;
      case "compra-multifuncional": return <CompraMultifuncional {...props} />;
      default: return <div className="p-8 text-center text-gray-500">Exercício em desenvolvimento</div>;
    }
  }

  return (
    <ExerciseWrapper
      title={exerciseDef.name}
      instructions={instructions}
      theme={theme}
      difficulty={difficulty}
      exerciseId={exerciseId}
      onFinish={handleComplete}
    >
      {(onComplete) => renderExercise(onComplete)}
    </ExerciseWrapper>
  );
}
