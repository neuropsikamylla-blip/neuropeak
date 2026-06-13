"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { ExerciseWrapper } from "@/components/exercises/ExerciseWrapper";
import { EXERCISE_DEFINITIONS, type ExerciseResult, type Theme } from "@/types";
import { planExerciseSettings } from "@/lib/exercise-plan";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ExerciseLoader() {
  return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
}

const SpanNumerico        = dynamic(() => import("@/components/exercises/memory/SpanNumerico").then(m => ({ default: m.SpanNumerico })), { loading: ExerciseLoader, ssr: false });
const MatrizEspacial      = dynamic(() => import("@/components/exercises/memory/MatrizEspacial").then(m => ({ default: m.MatrizEspacial })), { loading: ExerciseLoader, ssr: false });
const JogoMemoria         = dynamic(() => import("@/components/exercises/memory/JogoMemoria").then(m => ({ default: m.JogoMemoria })), { loading: ExerciseLoader, ssr: false });
const SpanNumericoInverso = dynamic(() => import("@/components/exercises/memory/SpanNumericoInverso").then(m => ({ default: m.SpanNumericoInverso })), { loading: ExerciseLoader, ssr: false });
const MatrizEspacialInversa = dynamic(() => import("@/components/exercises/memory/MatrizEspacialInversa").then(m => ({ default: m.MatrizEspacialInversa })), { loading: ExerciseLoader, ssr: false });
const NBack               = dynamic(() => import("@/components/exercises/memory/NBack").then(m => ({ default: m.NBack })), { loading: ExerciseLoader, ssr: false });
const TrilhaVisual        = dynamic(() => import("@/components/exercises/attention/TrilhaVisual").then(m => ({ default: m.TrilhaVisual })), { loading: ExerciseLoader, ssr: false });
const AtencaoSeletiva     = dynamic(() => import("@/components/exercises/attention/AtencaoSeletiva").then(m => ({ default: m.AtencaoSeletiva })), { loading: ExerciseLoader, ssr: false });
const StroopTask          = dynamic(() => import("@/components/exercises/executive/StroopTask").then(m => ({ default: m.StroopTask })), { loading: ExerciseLoader, ssr: false });
const Vigilancia          = dynamic(() => import("@/components/exercises/attention/Vigilancia").then(m => ({ default: m.Vigilancia })), { loading: ExerciseLoader, ssr: false });
const TempoReacao         = dynamic(() => import("@/components/exercises/processing/TempoReacao").then(m => ({ default: m.TempoReacao })), { loading: ExerciseLoader, ssr: false });
const DecisaoRapida       = dynamic(() => import("@/components/exercises/processing/DecisaoRapida").then(m => ({ default: m.DecisaoRapida })), { loading: ExerciseLoader, ssr: false });
const IdentificacaoSimbolos = dynamic(() => import("@/components/exercises/processing/IdentificacaoSimbolos").then(m => ({ default: m.IdentificacaoSimbolos })), { loading: ExerciseLoader, ssr: false });
const TorreHanoi          = dynamic(() => import("@/components/exercises/executive/TorreHanoi").then(m => ({ default: m.TorreHanoi })), { loading: ExerciseLoader, ssr: false });
const Labirinto           = dynamic(() => import("@/components/exercises/executive/Labirinto").then(m => ({ default: m.Labirinto })), { loading: ExerciseLoader, ssr: false });
const OrdemHistoria       = dynamic(() => import("@/components/exercises/executive/OrdemHistoria").then(m => ({ default: m.OrdemHistoria })), { loading: ExerciseLoader, ssr: false });
const CertoOuErrado       = dynamic(() => import("@/components/exercises/processing/CertoOuErrado").then(m => ({ default: m.CertoOuErrado })), { loading: ExerciseLoader, ssr: false });
const AntesDepois         = dynamic(() => import("@/components/exercises/attention/AntesDepois").then(m => ({ default: m.AntesDepois })), { loading: ExerciseLoader, ssr: false });
const Semaforo            = dynamic(() => import("@/components/exercises/processing/Semaforo").then(m => ({ default: m.Semaforo })), { loading: ExerciseLoader, ssr: false });
const DesafioSupermercado = dynamic(() => import("@/components/exercises/memory/DesafioSupermercado").then(m => ({ default: m.DesafioSupermercado })), { loading: ExerciseLoader, ssr: false });
const DesafioCidade       = dynamic(() => import("@/components/exercises/executive/DesafioCidade").then(m => ({ default: m.DesafioCidade })), { loading: ExerciseLoader, ssr: false });
const CorridaContraOTempo = dynamic(() => import("@/components/exercises/processing/CorridaContraOTempo").then(m => ({ default: m.CorridaContraOTempo })), { loading: ExerciseLoader, ssr: false });
const CacaItemBarato      = dynamic(() => import("@/components/exercises/attention/CacaItemBarato").then(m => ({ default: m.CacaItemBarato })), { loading: ExerciseLoader, ssr: false });
const MudancaRegras       = dynamic(() => import("@/components/exercises/executive/MudancaRegras").then(m => ({ default: m.MudancaRegras })), { loading: ExerciseLoader, ssr: false });
const CompraMultifuncional = dynamic(() => import("@/components/exercises/executive/CompraMultifuncional").then(m => ({ default: m.CompraMultifuncional })), { loading: ExerciseLoader, ssr: false });
const LetrasSequencia     = dynamic(() => import("@/components/exercises/memory/LetrasSequencia").then(m => ({ default: m.LetrasSequencia })), { loading: ExerciseLoader, ssr: false });
const PadroesRotacao      = dynamic(() => import("@/components/exercises/memory/PadroesRotacao").then(m => ({ default: m.PadroesRotacao })), { loading: ExerciseLoader, ssr: false });
const SequenciaItens      = dynamic(() => import("@/components/exercises/memory/SequenciaItens").then(m => ({ default: m.SequenciaItens })), { loading: ExerciseLoader, ssr: false });
const ListaDistracao      = dynamic(() => import("@/components/exercises/memory/ListaDistracao").then(m => ({ default: m.ListaDistracao })), { loading: ExerciseLoader, ssr: false });
const RestauranteOrdem    = dynamic(() => import("@/components/exercises/memory/RestauranteOrdem").then(m => ({ default: m.RestauranteOrdem })), { loading: ExerciseLoader, ssr: false });
const TaskSwitching        = dynamic(() => import("@/components/exercises/executive/TaskSwitching").then(m => ({ default: m.TaskSwitching })), { loading: ExerciseLoader, ssr: false });
const AtencaoSustentada    = dynamic(() => import("@/components/exercises/attention/AtencaoSustentada").then(m => ({ default: m.AtencaoSustentada })), { loading: ExerciseLoader, ssr: false });
const MOT                  = dynamic(() => import("@/components/exercises/attention/MOT").then(m => ({ default: m.MOT })), { loading: ExerciseLoader, ssr: false });
const DualTask             = dynamic(() => import("@/components/exercises/attention/DualTask").then(m => ({ default: m.DualTask })), { loading: ExerciseLoader, ssr: false });
const DeductiveGrid        = dynamic(() => import("@/components/exercises/executive/DeductiveGrid").then(m => ({ default: m.DeductiveGrid })), { loading: ExerciseLoader, ssr: false });
const FocusAgents          = dynamic(() => import("@/components/exercises/attention/FocusAgents").then(m => ({ default: m.FocusAgents })), { loading: ExerciseLoader, ssr: false });
const AtencaoAlternada     = dynamic(() => import("@/components/exercises/attention/AtencaoAlternada").then(m => ({ default: m.AtencaoAlternada })), { loading: ExerciseLoader, ssr: false });
const AssociacaoPares      = dynamic(() => import("@/components/exercises/memory/AssociacaoPares").then(m => ({ default: m.AssociacaoPares })), { loading: ExerciseLoader, ssr: false });

const EXERCISE_INSTRUCTIONS: Record<string, string[]> = {
  "span-numerico": [
    "Você vai OUVIR uma sequência de números (eles não aparecem na tela).",
    "As bolinhas indicam quantos números foram falados.",
    "Depois, toque os números no teclado na MESMA ordem em que ouviu.",
    "Use fones ou aumente o volume e evite distrações.",
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
  "atencao-seletiva": [
    "Um estímulo aparece na tela por poucos instantes — forme colorida ou com formato específico.",
    "Toque na tela APENAS quando o estímulo corresponder à regra mostrada no topo.",
    "Se o estímulo for diferente, NÃO toque — espere o próximo.",
    "Nas dificuldades mais altas, a regra pode mudar durante o exercício. Fique atento!",
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
    "Você vai OUVIR uma sequência de números (eles não aparecem na tela).",
    "As bolinhas indicam quantos números foram falados.",
    "Depois, toque os números no teclado em ORDEM INVERSA. Se ouvir 3 → 7 → 2, toque 2 → 7 → 3.",
    "Treina memória operacional (working memory). Use fones ou bom volume.",
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
    "Leia a situação do dia a dia que aparece no topo.",
    "Arraste os cartões para colocar as etapas na ordem correta.",
    "Pense no que precisa acontecer primeiro — do primeiro passo ao último.",
    "Nos níveis avançados, há etapas que NÃO fazem parte: descarte-as.",
    "Toque em 'Confirmar Ordem' quando terminar.",
  ],
  "certo-ou-errado": [
    "Você verá uma situação do cotidiano descrita em texto.",
    "Decida rapidamente: essa situação está CORRETA ou ERRADA?",
    "Pense em segurança, saúde e boas práticas do dia a dia.",
    "Velocidade e precisão contam — confie no seu julgamento!",
  ],
  "antes-depois": [
    "Uma figura ou palavra aparece no centro (dia, mês, número, letra ou rotina).",
    "Veja se a pergunta pede o que vem ANTES ou DEPOIS dela.",
    "Toque na alternativa certa. Use o 🔊 para ouvir a pergunta de novo.",
  ],
  "semaforo": [
    "Três semáforos aparecem na tela e piscam ao mesmo tempo.",
    "Após piscar, UM deles acende com uma cor — esse é o ativo.",
    "Verde → toque AVANÇAR. Vermelho ou amarelo → toque PARAR.",
    "Reaja rápido assim que um semáforo acender — o tempo é limitado!",
  ],
  "desafio-supermercado": [
    "Uma lista de compras aparecerá na tela — leia e memorize os itens com nome e desenho!",
    "Após a lista sumir, você verá uma prateleira com vários produtos.",
    "Selecione apenas os itens que estavam na sua lista e confirme.",
    "A dificuldade aumenta conforme você acerta: mais itens na lista!",
  ],
  "desafio-supermercado-auditivo": [
    "Você vai OUVIR a lista de compras lida em voz alta — ouça com atenção!",
    "Memorize os produtos pelo SOM do nome — os desenhos não terão legenda.",
    "Após a lista, encontre os produtos na prateleira reconhecendo-os pelo desenho.",
    "Treine sua memória auditiva e reconhecimento visual ao mesmo tempo!",
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
  "letras-sequencia": [
    "Você verá (ou ouvirá) uma sequência de letras ou sílabas, uma de cada vez.",
    "Memorize a ordem. Depois toque nas letras para reproduzir a sequência.",
    "Em alguns níveis você repete na MESMA ordem; em outros, na ordem INVERSA.",
    "Conforme você acerta, as sequências ficam maiores e mais desafiadoras.",
  ],
  "padroes-rotacao": [
    "Observe as posições acesas na matriz e memorize o padrão.",
    "A matriz inteira vai girar como um tabuleiro — observe a rotação.",
    "Marque onde os pontos ficam DEPOIS da rotação e confirme.",
    "Conforme você acerta, a matriz fica maior e a rotação mais difícil.",
  ],
  "sequencia-itens": [
    "Você verá (ou ouvirá) uma sequência de figuras, uma de cada vez.",
    "Memorize a ordem em que elas aparecem.",
    "Depois, toque nas figuras na MESMA ordem — atenção aos distratores parecidos!",
    "Conforme você acerta, as sequências ficam maiores e com mais alternativas.",
  ],
  "lista-distracao": [
    "Primeiro, memorize a lista de palavras que aparece na tela.",
    "Depois, faça uma tarefinha rápida (contar, comparar números ou cores).",
    "Por fim, toque nas palavras da lista — em alguns níveis, na ordem correta!",
    "A tarefa do meio serve para te distrair: o desafio é não esquecer a lista.",
  ],
  "restaurante-ordem": [
    "Leia ou ouça o pedido do cliente com atenção.",
    "Monte a bandeja tocando nos itens na ordem certa.",
    "Atenção à regra: às vezes é na ordem inversa, ou um item deve ser ignorado.",
    "Cuidado com os distratores — só coloque o que o pedido pediu!",
  ],
  "restaurante-ordem-auditivo": [
    "Você vai OUVIR o pedido dos clientes — ouça com atenção, sem ler!",
    "Memorize os itens e a ordem; toque em 🔊 para ouvir de novo.",
    "Monte a bandeja de cada cliente na ordem certa.",
    "Nos níveis mais altos, o cliente pode TROCAR ou CANCELAR um item — fique atento à mudança!",
  ],
  "caca-item-barato": [
    "Você verá etiquetas de produtos com preço, peso, quantidade e validade.",
    "Leia as informações e responda a pergunta sobre o produto ou compare embalagens.",
    "Nas dificuldades maiores, compare múltiplos produtos e calcule qual tem melhor custo-benefício.",
    "Treine a leitura de rótulos — uma habilidade essencial do dia a dia!",
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
  "task-switching": [
    "Uma carta aparece na tela. Classifique-a seguindo a REGRA mostrada no topo.",
    "Toque no botão correto o mais rápido possível — velocidade e precisão contam!",
    "Nas dificuldades maiores, a regra muda SEM aviso. Fique sempre atento!",
    "Regras possíveis: COR (Vermelho/Azul), NÚMERO (Ímpar/Par), FORMA (Círculo/Triângulo).",
  ],
  "atencao-sustentada": [
    "Letras aparecem na tela, uma por vez, em sequência rápida.",
    "Toque APENAS quando aparecer X imediatamente após A. Sequência A → X = tocar.",
    "Se a letra X aparecer após QUALQUER outra letra, ignore! Só toca no A → X.",
    "O exercício é longo — mantenha o foco do início ao fim!",
  ],
  "mot": [
    "Algumas bolas vão piscar — memorize quais são!",
    "Todas as bolas vão se mover. Tente acompanhar as bolas que piscaram com os olhos.",
    "Quando as bolas pararem, toque nas bolas que eram os alvos.",
    "Atenção: quanto mais bolas e mais rápido, mais difícil!",
  ],
  "dual-task": [
    "Você terá DUAS tarefas ao mesmo tempo — fique atento às duas áreas da tela!",
    "SUPERIOR: Toque quando aparecer uma forma VERDE. Ignore outras cores.",
    "INFERIOR: Toque IGUAL quando o número for igual ao anterior.",
    "Divida sua atenção entre as duas — não foque em apenas uma!",
  ],
  "deductive-grid": [
    "Leia as pistas e deduza quem tem cada atributo.",
    "Toque numa célula para marcar: toque 1x = SIM ✓, 2x = NÃO ✗, 3x = apaga.",
    "Use eliminação: se souber que Bruno=Verde, marque NÃO para Ana e Carla.",
    "Confirme quando tiver certeza de todas as células!",
  ],
  "focus-agents": [],
  "focus-agents-auditivo": [],
  "atencao-alternada": [
    "Um item aparecerá no centro da tela — pode ser um animal ou objeto, grande ou pequeno.",
    "No topo, uma regra indica o que observar: ANIMAL vs OBJETO ou GRANDE vs PEQUENO.",
    "Toque no botão correto para a regra ativa. A regra muda automaticamente!",
    "Fique atento às mudanças de regra — é preciso trocar o foco rapidamente.",
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
  const [exerciseSettings, setExerciseSettings] = useState<Record<string, unknown> | undefined>();
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
        // Calculate patient age from birthDate if available
        const dob = data.patient?.birthDate;
        if (dob) {
          const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
          setPatientAge(age);
        }

        // Config do terapeuta para este exercício (vinda da prescrição do plano).
        const activePlan = data.patient?.trainingPlans?.[0];
        if (activePlan) setExerciseSettings(planExerciseSettings(activePlan.exercises, exerciseId));

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
      case "span-numerico": return <SpanNumerico {...props} settings={exerciseSettings} />;
      case "matriz-espacial": return <MatrizEspacial {...props} />;
      case "atencao-seletiva": return <AtencaoSeletiva {...props} />;
      case "trilha-visual": return <TrilhaVisual {...props} />;
      case "stroop-task": return <StroopTask {...props} />;
      case "vigilancia": return <Vigilancia {...props} />;
      case "tempo-reacao": return <TempoReacao {...props} />;
      case "decisao-rapida": return <DecisaoRapida {...props} />;
      case "identificacao-simbolos": return <IdentificacaoSimbolos {...props} />;
      case "torre-hanoi": return <TorreHanoi {...props} />;
      case "labirinto": return <Labirinto {...props} />;
      case "jogo-memoria": return <JogoMemoria {...props} />;
      case "span-numerico-inverso": return <SpanNumericoInverso {...props} settings={exerciseSettings} />;
      case "matriz-espacial-inversa": return <MatrizEspacialInversa {...props} />;
      case "nback": return <NBack {...props} />;
      case "ordem-historia": return <OrdemHistoria {...props} />;
      case "certo-ou-errado": return <CertoOuErrado {...props} patientAge={patientAge} />;
      case "antes-depois": return <AntesDepois {...props} />;
      case "semaforo": return <Semaforo {...props} />;
      case "desafio-supermercado": return <DesafioSupermercado {...props} mode="leitura" />;
      case "desafio-supermercado-auditivo": return <DesafioSupermercado {...props} mode="auditivo" />;
      case "desafio-cidade": return <DesafioCidade {...props} />;
      case "corrida-tempo": return <CorridaContraOTempo {...props} />;
      // "desafio-orcamento" foi fundido na Compra Multifuncional (fallback p/ links antigos)
      case "desafio-orcamento": return <CompraMultifuncional {...props} />;
      case "caca-item-barato": return <CacaItemBarato {...props} />;
      case "mudanca-regras": return <MudancaRegras {...props} />;
      case "compra-multifuncional": return <CompraMultifuncional {...props} />;
      case "letras-sequencia": return <LetrasSequencia {...props} />;
      case "padroes-rotacao": return <PadroesRotacao {...props} />;
      case "sequencia-itens": return <SequenciaItens {...props} />;
      case "lista-distracao": return <ListaDistracao {...props} />;
      case "restaurante-ordem": return <RestauranteOrdem {...props} />;
      case "restaurante-ordem-auditivo": return <RestauranteOrdem {...props} auditory />;
      case "task-switching": return <TaskSwitching {...props} />;
      case "atencao-sustentada": return <AtencaoSustentada {...props} />;
      case "mot": return <MOT {...props} />;
      case "dual-task": return <DualTask {...props} />;
      case "deductive-grid": return <DeductiveGrid {...props} />;
      case "focus-agents": return <FocusAgents {...props} forceMode="visual" />;
      case "focus-agents-auditivo": return <FocusAgents {...props} forceMode="auditivo" exerciseId="focus-agents-auditivo" />;
      case "atencao-alternada": return <AtencaoAlternada {...props} />;
      case "associacao-pares": return <AssociacaoPares {...props} />;
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
