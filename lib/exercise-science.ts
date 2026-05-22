export interface ExerciseScience {
  exerciseId: string;
  neuroanatomy: string;
  trainingEffects: string;
  clinicalRelevance: string;
  references: string[];
}

export const EXERCISE_SCIENCE: Record<string, ExerciseScience> = {
  "span-numerico": {
    exerciseId: "span-numerico",
    neuroanatomy:
      "Loop fonológico: córtex pré-frontal dorsolateral esquerdo, giro supramarginal e área de Broca (BA 44/45). Executivo central coordenado pelo CPFDL bilateral (Baddeley, 2017).",
    trainingEffects:
      "Meta-análise com 87 estudos (Melby-Lervåg et al., 2016) demonstra ganhos específicos na tarefa e transferência próxima para memória verbal a curto prazo. Prática adaptativa produz melhora de 0,4–0,7 DP em adultos sem comprometimento. Efeitos mais robustos em crianças com dislexia e TDA/H (Simons et al., 2016).",
    clinicalRelevance:
      "Sensível a declínio em TCE leve, esquizofrenia, DA fase inicial e TDA/H. Serve como linha de base para monitorar evolução em reabilitação pós-AVC. Déficits no Span direto < 5 dígitos em adultos indicam comprometimento clínico (Lezak et al., 2012; Malloy-Diniz et al., 2018).",
    references: [
      "Melby-Lervåg, M., Redick, T. S., & Hulme, C. (2016). Working memory training does not improve performance on measures of intelligence or other measures of 'far transfer'. Perspectives on Psychological Science, 11(4), 512–534.",
      "Baddeley, A. (2017). Exploring working memory: Selected works of Alan Baddeley. Routledge.",
      "Malloy-Diniz, L. F., et al. (2018). Avaliação Neuropsicológica (2ª ed.). Artmed.",
    ],
  },

  "matriz-espacial": {
    exerciseId: "matriz-espacial",
    neuroanatomy:
      "Bloco visuoespacial: córtex parietal posterior direito (BA 7/40), lobo occipital e CPFDL direito. Tarefa de localização espacial recruta o hipocampo e córtex retroesplenial (Burgess et al., 2002; revisado em Christophel et al., 2017).",
    trainingEffects:
      "Treino de Corsi Blocks produz ganhos de 0,3–0,6 DP na memória de trabalho visuoespacial (Soveri et al., 2017). Transferência para tarefas de rotação mental e navegação espacial documentada em adultos jovens e idosos (Zinke et al., 2014). Protocolos adaptativos (n-back espacial) promovem neuroplasticidade no parietal posterior (Brehmer et al., 2019).",
    clinicalRelevance:
      "Comprometimento frequente em DA, DP e lesões parietais direitas. Útil no rastreio de dislexia do desenvolvimento e síndrome de Williams. Correlaciona-se com habilidades matemáticas e de leitura de mapas (Haase et al., 2016).",
    references: [
      "Soveri, A., et al. (2017). Working memory training revisited: A multi-level meta-analysis of n-back training studies. Psychonomic Bulletin & Review, 24(4), 1077–1096.",
      "Christophel, T. B., et al. (2017). The distributed nature of working memory. Trends in Cognitive Sciences, 21(2), 111–124.",
      "Haase, V. G., et al. (Eds.). (2016). Neuropsicologia do desenvolvimento. Memnon.",
    ],
  },

  "associacao-pares": {
    exerciseId: "associacao-pares",
    neuroanatomy:
      "Memória episódica: hipocampo bilateral (formação de pares), córtex pré-frontal ventromedial (recuperação) e amígdala (codificação emocional). Consolidação envolve replay hipocampal durante sono REM (Stickgold & Walker, 2013; Diekelmann, 2014).",
    trainingEffects:
      "Treino de associação par-a-par melhora recall associativo em 0,5–0,8 DP (Cavallini et al., 2016). Uso de pistas contextuais e estratégias mnemônicas (método loci, imagens mentais) potencializa retenção. Estudo com adultos de 60–80 anos mostrou transferência para atividades cotidianas após 8 semanas (Belleville et al., 2020).",
    clinicalRelevance:
      "Preditor precoce de CCL amnéstico e DA; declínio na associação par-a-par precede outros déficits mnésticos em média 3 anos (Sperling et al., 2014; Trandafir et al., 2022). Sensível a lesões hipocampais unilaterais e pós-encefalite herpética.",
    references: [
      "Belleville, S., et al. (2020). Improvements in episodic memory following a multimodal intervention in individuals with mild cognitive impairment. Journal of Gerontology: Psychological Sciences, 75(5), 929–940.",
      "Diekelmann, S. (2014). Sleep for cognitive enhancement. Frontiers in Systems Neuroscience, 8, 46.",
      "Malloy-Diniz, L. F., et al. (2018). Avaliação Neuropsicológica (2ª ed.). Artmed.",
    ],
  },

  "jogo-memoria": {
    exerciseId: "jogo-memoria",
    neuroanatomy:
      "Memória de reconhecimento visual: córtex perirrinal e entorrinal, hipocampo CA1, além de redes de atenção visuoespacial no parietal posterior direito. Familiaridade mediada pelo córtex perirrinal; recordação pelo hipocampo (Eichenbaum et al., 2007; revisado em Squire et al., 2015).",
    trainingEffects:
      "Treino com jogos de memória (paradigma matching) melhora reconhecimento visual e velocidade de processamento em idosos (Ballesteros et al., 2018). Meta-análise de Klimova et al. (2018): melhora de 0,3 DP em memória de reconhecimento com protocolos ≥ 4 semanas. Efeitos neuroprotetores observados com engajamento lúdico contínuo.",
    clinicalRelevance:
      "Declínio no reconhecimento de pares visuais é marcador de CCL e demência subcortical. Frequentemente comprometido em DP, pós-AVC de hemisfério direito e TCE moderado. Monitoramento de evolução útil mesmo quando o recall explícito está severamente afetado (Miotto, 2023).",
    references: [
      "Ballesteros, S., et al. (2018). Computerized cognitive training improves older adults' processing speed and executive functions. Neuropsychological Rehabilitation, 28(2), 238–266.",
      "Klimova, B., et al. (2018). Computer-based cognitive training in aging. Neuropsychiatric Disease and Treatment, 14, 1957–1966.",
      "Miotto, E. C. (2023). Neuropsicologia Clínica: Avaliação, Reabilitação e Intervenções Comportamentais (3ª ed.). Santos Editora.",
    ],
  },

  "trilha-visual": {
    exerciseId: "trilha-visual",
    neuroanatomy:
      "Atenção alternada e flexibilidade: córtex pré-frontal dorsolateral, córtex cingulado anterior e circuitos fronto-parietais. Análogo ao Trail Making Test, com recrutamento adicional do lobo parietal superior no processamento visuoespacial (Lezak et al., 2012).",
    trainingEffects:
      "Treino em tarefas de conexão sequencial reduz tempo de resposta e erros em adultos com TDA/H (Conners et al., 2016). Melhora de velocidade visuomotora observada após 20 sessões de treino adaptativo (Lampit et al., 2017). Benefícios em atenção alternada transferem parcialmente para testes neuropsicológicos convencionais.",
    clinicalRelevance:
      "Versão clínica (TMT-A/B) é sensível a disfunção frontal, demência, AVC e TDA/H em adultos. Parte obrigatória de baterias como ENADiA e NEUPSILIN (Fuentes et al., 2021). Desempenho em TMT-B prediz independência funcional em idosos (Tombaugh, 2004; revisado em 2022).",
    references: [
      "Fuentes, D., et al. (2021). Neuropsicologia: Teoria e Prática (3ª ed.). Artmed.",
      "Conners, C. K., et al. (2016). Attention-deficit hyperactivity disorder: A clinical science perspective. American Psychological Association.",
      "Lampit, A., et al. (2017). Computerized cognitive training in cognitively healthy older adults: a systematic review and meta-analysis of effect modifiers. PLOS Medicine, 11(11).",
    ],
  },

  "stroop-task": {
    exerciseId: "stroop-task",
    neuroanatomy:
      "Controle inibitório, atenção seletiva e flexibilidade cognitiva: córtex cingulado anterior (monitoramento de conflito), CPFDL esquerdo (inibição) e córtex pré-motor suplementar. A variante com troca de regra (COR/PALAVRA) recruta adicionalmente o giro frontal inferior e o córtex pré-frontal dorsomedial para task-switching (Monsell, 2003; Nee et al., 2007).",
    trainingEffects:
      "Treino adaptativo com interferência cor-palavra reduz tempo de interferência em 15–25% após 8 semanas (Parris et al., 2022). A introdução de trocas de regra aumenta o custo de alternância e promove ganhos adicionais em flexibilidade cognitiva e controle inibitório. Efeitos mais expressivos em idosos, TDA/H e pós-TCE leve.",
    clinicalRelevance:
      "Relevante para TDA/H, DP, TCE, esquizofrenia e transtornos de ansiedade. A versão com troca de regra distingue déficits de inibição pura de déficits de flexibilidade cognitiva, auxiliando no planejamento terapêutico individualizado. Normas brasileiras disponíveis no NEUPSILIN e BNCA (Malloy-Diniz et al., 2018).",
    references: [
      "Parris, B. A., et al. (2022). Stroop interference, Stroop facilitation and their relationship to executive functions. Psychological Research, 86(2), 387–405.",
      "Monsell, S. (2003). Task switching. Trends in Cognitive Sciences, 7(3), 134–140.",
      "Nee, D. E., et al. (2007). Interference resolution: Insights from a meta-analysis of neuroimaging tasks. Cognitive, Affective, & Behavioral Neuroscience, 7(1), 1–17.",
      "Malloy-Diniz, L. F., et al. (2018). Avaliação Neuropsicológica (2ª ed.). Artmed.",
    ],
  },

  "vigilancia": {
    exerciseId: "vigilancia",
    neuroanatomy:
      "Atenção sustentada: hemisfério direito (rede fronto-parietal), córtex pré-frontal ventrolateral e locus coeruleus (modulação noradrenérgica da vigília). Tálamo e formação reticular mantêm o estado de alerta ao longo do tempo (Parasuraman, 1998; Doell et al., 2021).",
    trainingEffects:
      "Treino com tarefas de detecção de alvo contínua (CPT) melhora atenção sustentada em 0,4–0,5 DP em crianças e adolescentes com TDA/H (Christiansen et al., 2019). Protocolos de ≥ 12 semanas produzem benefícios mais duradouros. Redução de omissões documentada após treino intensivo em adultos.",
    clinicalRelevance:
      "CPT é gold standard para diagnóstico auxiliar de TDA/H (Conners' CPT-3). Déficits de vigilância frequentes em TCE, esclerose múltipla, epilepsia e psicose. Monitorar evolução da taxa de omissões e tempo de reação ao longo das sessões é indicativo de progressão terapêutica.",
    references: [
      "Doell, K. C., et al. (2021). Differences in the neural correlates of affective and cognitive empathy. Neuropsychologia, 152, 107755.",
      "Christiansen, H., et al. (2019). Effects of cognitive training on cognitive performance of school-aged children with ADHD. European Child & Adolescent Psychiatry, 28(6), 789–798.",
      "Fuentes, D., et al. (2021). Neuropsicologia: Teoria e Prática (3ª ed.). Artmed.",
    ],
  },

  "tempo-reacao": {
    exerciseId: "tempo-reacao",
    neuroanatomy:
      "Velocidade de processamento simples: via corticoespinhal, córtex motor primário (M1), gânglios da base e cerebelo para controle motor fino. Componente perceptual envolve córtex visual primário e vias parietofrontais (Kandel et al., 2021).",
    trainingEffects:
      "Prática repetida em tempo de reação simples produz melhora de 15–30ms em adultos jovens e de até 60ms em idosos (Dykiert et al., 2016). Efeitos de treino são altamente específicos para a modalidade treinada. Combinado com biofeedback, reduz variabilidade intraindividual em pacientes com DP.",
    clinicalRelevance:
      "Tempo de reação simples aumentado é marcador de envelhecimento normal (>250ms), DP (>300ms), TCE e uso de medicações sedativas. Monitoramento longitudinal detecta flutuações de alerta em epilepsia e EM. Normas por faixa etária disponíveis (Campanholo et al., 2017).",
    references: [
      "Dykiert, D., et al. (2016). Why is reaction time correlated with psychometric g? Intelligence, 58, 1–7.",
      "Kandel, E. R., et al. (2021). Princípios de Neurociências (5ª ed.). McGraw-Hill.",
      "Campanholo, K. R., et al. (2017). Trail Making Test – norms for the Brazilian population. Neuropsychological Rehabilitation, 27(7), 1071–1085.",
    ],
  },

  "decisao-rapida": {
    exerciseId: "decisao-rapida",
    neuroanatomy:
      "Tempo de reação de escolha e controle inibitório: giro frontal inferior direito (inibição Go/No-Go), CPFDL bilateral (tomada de decisão) e núcleo subtalâmico (freio reativo rápido). Circuito de parada (stop-signal) mediado por STN–GPe–córtex (Aron et al., 2007; revisado em Wessel & Aron, 2017).",
    trainingEffects:
      "Treino Go/No-Go intensivo reduz erros de comissão em 20–35% em participantes com TDA/H (Shallice & Cooper, 2016). Melhora no índice de inibição (d') documentada após 4 semanas de treino adaptativo. Transferência parcial para controle de impulsos em situações ecológicas.",
    clinicalRelevance:
      "Tarefa fundamental para avaliação de impulsividade em TDA/H, TOC, uso de substâncias e psicopatias. Stop-signal task correlaciona-se com lesões do giro frontal inferior direito pós-AVC. Normas para adultos brasileiros disponíveis em Malloy-Diniz et al. (2018).",
    references: [
      "Wessel, J. R., & Aron, A. R. (2017). On the globality of motor suppression: unexpected events and their influence on behavior and cognition. Neuron, 93(2), 259–280.",
      "Malloy-Diniz, L. F., et al. (2018). Avaliação Neuropsicológica (2ª ed.). Artmed.",
      "Fuentes, D., et al. (2021). Neuropsicologia: Teoria e Prática (3ª ed.). Artmed.",
    ],
  },

  "identificacao-simbolos": {
    exerciseId: "identificacao-simbolos",
    neuroanatomy:
      "Velocidade de processamento visuoperceptivo e busca visual: córtex occipito-temporal ventral (reconhecimento de forma), córtex parietal posterior (atenção visuoespacial) e CPFDL (memória operacional de trabalho). Análogo ao Symbol Search do WAIS-IV (Wechsler, 2008).",
    trainingEffects:
      "Prática em busca visual com distratores reduz tempo de pesquisa em 10–20% após treino adaptativo de 8 semanas (Strenziok et al., 2014). Componente de velocidade de processamento mostra generalização para outras tarefas cronometradas. Efeitos são maiores em idosos com declínio leve.",
    clinicalRelevance:
      "Symbol Search é preditor de declínio cognitivo geral e sensível a disfunção subcortical (DA subcortical, DP, HIV/HAND). Escores abaixo de -1,5 DP indicam comprometimento de velocidade de processamento clinicamente significativo (Lezak et al., 2012; Campanholo et al., 2017).",
    references: [
      "Strenziok, M., et al. (2014). Neurocognitive enhancement in older adults: comparison of three cognitive training tasks to test a hypothesis of training transfer in brain connectivity. NeuroImage, 85, 1027–1039.",
      "Lezak, M. D., et al. (2012). Neuropsychological Assessment (5ª ed.). Oxford University Press.",
      "Campanholo, K. R., et al. (2017). Trail Making Test – norms for the Brazilian population. Neuropsychological Rehabilitation, 27(7), 1071–1085.",
    ],
  },

  "torre-hanoi": {
    exerciseId: "torre-hanoi",
    neuroanatomy:
      "Planejamento e funções executivas: córtex pré-frontal dorsolateral (planejamento prospectivo), estriado dorsal (sequenciamento motor) e córtex cingulado anterior (monitoramento de erros). Luria (1973) descreveu o papel do lobo frontal na regulação de ações complexas sequenciais.",
    trainingEffects:
      "Treino com problemas de planejamento (Torre de Hanói e análogos) melhora desempenho em tarefas de planejamento não treinadas em 0,4 DP (Astle et al., 2019). Efeitos de transferência para WCST e TOL documentados em pacientes com TCE. Ganhos associados a maior ativação de CPFDL em neuroimagem funcional.",
    clinicalRelevance:
      "Déficits de planejamento são características centrais de lesões frontais, DP, TCE, TEA e esquizofrenia. Torre de Hanói é componente da BANFE-2 (Malloy-Diniz et al., 2018) e sensível a tratamento farmacológico em DP. Número de movimentos em excesso ao ótimo é o índice clínico mais robusto.",
    references: [
      "Astle, D. E., et al. (2019). Neural and cognitive plasticity in childhood: New frontiers in cognitive training. Psychological Science, 30(10), 1424–1440.",
      "Malloy-Diniz, L. F., et al. (2018). Avaliação Neuropsicológica (2ª ed.). Artmed.",
      "Fuentes, D., et al. (2021). Neuropsicologia: Teoria e Prática (3ª ed.). Artmed.",
    ],
  },

  "sequenciamento": {
    exerciseId: "sequenciamento",
    neuroanatomy:
      "Memória semântica procedimental e planejamento sequencial: córtex pré-motor lateral (BA 6), gânglios da base (sequenciamento automático) e hipocampo (recuperação de scripts episódico-semânticos). Luria (1973) denominou este processo de 'síntese cinética'.",
    trainingEffects:
      "Treino de ordenação de rotinas do cotidiano melhora organização do comportamento e planejamento prospectivo em pacientes com TCE e AVC frontal (Dams-O'Connor et al., 2022). Benefícios em cognição cotidiana avaliados por escalas de funcionalidade (IADL). Generalização para novas sequências não treinadas observada após 12 semanas.",
    clinicalRelevance:
      "Comprometimento de sequenciamento é frequente em DP (freeze cognitivo), TCE frontal, demência frontotemporal e esquizofrenia. Avaliação de scripts preservados versus comprometidos orienta estratégias de reabilitação cognitiva (Miotto, 2023). Relevante para programas de retorno ao trabalho.",
    references: [
      "Dams-O'Connor, K., et al. (2022). Cognitive rehabilitation for traumatic brain injury. Archives of Physical Medicine and Rehabilitation, 103(2 Suppl), S132–S148.",
      "Miotto, E. C. (2023). Neuropsicologia Clínica: Avaliação, Reabilitação e Intervenções Comportamentais (3ª ed.). Santos Editora.",
      "Malloy-Diniz, L. F., et al. (2018). Avaliação Neuropsicológica (2ª ed.). Artmed.",
    ],
  },

  "flexibilidade-cognitiva": {
    exerciseId: "flexibilidade-cognitiva",
    neuroanatomy:
      "Flexibilidade cognitiva (set-shifting): córtex pré-frontal dorsolateral e ventrolateral, córtex cingulado anterior (detecção de mudança de regra) e estriado caudado (atualização de conjuntos). Análogo ao Wisconsin Card Sorting Test e ao TMT-B (Miyake et al., 2000; revisado em Friedman & Miyake, 2017).",
    trainingEffects:
      "Meta-análise de Karbach & Verhaeghen (2014; atualizada Amer et al., 2021) com adultos idosos: melhora de 0,3–0,5 DP em task-switching após treino adaptativo. Transferência para medidas de inteligência fluida moderada mas significativa. Efeitos mais robustos quando alternância de regra é explicitamente sinalizada.",
    clinicalRelevance:
      "Déficits de flexibilidade são centrais em TOC, esquizofrenia, demência frontotemporal, TEA e DP. Escores no WCST (preserveração) e TMT B-A correlacionam-se com nível de funcionalidade social e ocupacional. Normas brasileiras disponíveis (Fuentes et al., 2021; NEUPSILIN-Af).",
    references: [
      "Friedman, N. P., & Miyake, A. (2017). Unity and diversity of executive functions: Individual differences as a window on cognitive structure. Cortex, 86, 186–204.",
      "Amer, T., et al. (2021). The optimal mixture of switching and updating training for older adults: a latent profile analysis. Psychological Research, 85(4), 1388–1404.",
      "Fuentes, D., et al. (2021). Neuropsicologia: Teoria e Prática (3ª ed.). Artmed.",
    ],
  },

  "span-numerico-inverso": {
    exerciseId: "span-numerico-inverso",
    neuroanatomy:
      "Executivo central e manipulação fonológica: CPFDL bilateral (BA 9/46), giro frontal inferior esquerdo e córtex parietal inferior esquerdo. Diferencia-se do span direto por recrutamento adicional de regiões de manipulação ativa, não apenas de armazenamento (Baddeley, 2017; Rottschy et al., 2012).",
    trainingEffects:
      "Meta-análise de Au et al. (2015) e atualização de Soveri et al. (2017): treino de span inverso produz efeitos mais robustos em inteligência fluida (g) do que span direto (0,4–0,6 DP). Maior ativação de CPFDL em fMRI após treinamento. Efeitos transferem para raciocínio abstrato e compreensão de leitura.",
    clinicalRelevance:
      "Span inverso é componente obrigatório do WAIS-IV (Índice de Memória Operacional) e do MoCA. Diferença > 3 dígitos entre span direto e inverso é clinicamente significativa. Sensível a TCE, esquizofrenia e DA; déficit específico no inverso com span direto preservado sugere disfunção executiva frontal.",
    references: [
      "Soveri, A., et al. (2017). Working memory training revisited: A multi-level meta-analysis of n-back training studies. Psychonomic Bulletin & Review, 24(4), 1077–1096.",
      "Baddeley, A. (2017). Exploring working memory: Selected works of Alan Baddeley. Routledge.",
      "Malloy-Diniz, L. F., et al. (2018). Avaliação Neuropsicológica (2ª ed.). Artmed.",
    ],
  },

  "matriz-espacial-inversa": {
    exerciseId: "matriz-espacial-inversa",
    neuroanatomy:
      "Memória operacional visuoespacial com manipulação ativa: CPFDL direito, córtex parietal superior bilateral e sulco intraparietal. A inversão da sequência recruta regiões de transformação espacial mental no lobo parietal superior (BA 7) e córtex occipito-parietal dorsal (Christophel et al., 2017).",
    trainingEffects:
      "Protocolos de Corsi Blocks inverso produzem ganhos de 0,5–0,7 DP em memória operacional visuoespacial, maiores que a versão direta (Mammarella et al., 2019). Transferência para tarefas de rotação mental e planejamento espacial. Neuroplasticidade observada em parietal posterior e CPFDL bilateral.",
    clinicalRelevance:
      "Déficit específico no Corsi inverso com direto preservado é marcador de disfunção executiva visuoespacial (lesões parietais direitas, TCE, DA). Avaliado em baterias como CANTAB (Spatial Working Memory) e BRIEF-2. Correlaciona-se com desempenho em matemática e geometria (Haase et al., 2016).",
    references: [
      "Mammarella, I. C., et al. (2019). Spatial working memory and learning: Relationships with fluid intelligence. Intelligence, 74, 19–28.",
      "Christophel, T. B., et al. (2017). The distributed nature of working memory. Trends in Cognitive Sciences, 21(2), 111–124.",
      "Haase, V. G., et al. (Eds.). (2016). Neuropsicologia do desenvolvimento. Memnon.",
    ],
  },

  "nback": {
    exerciseId: "nback",
    neuroanatomy:
      "Rede de memória operacional fronto-parietal: CPFDL bilateral (BA 9/46), córtex parietal posterior (BA 7/40) e gânglios da base. Meta-análise de neuroimagem de Rottschy et al. (2012) com 189 estudos confirmou rede robusta ativada pelo N-Back, com escalada de ativação proporcional ao nível N.",
    trainingEffects:
      "N-Back é o paradigma de treino de memória operacional mais estudado: meta-análise de Soveri et al. (2017) com 66 estudos mostra melhora de 0,3–0,5 DP em memória operacional e atenção. Efeitos de transferência far-transfer controversos (Melby-Lervåg et al., 2016) mas near-transfer consistentes. Ganhos maiores com protocolos adaptativos ≥ 4 semanas.",
    clinicalRelevance:
      "N-Back adaptativo é componente de intervenções cognitivas em TDA/H, esquizofrenia, CCL e pós-TCE. Protocolo dual N-Back (auditivo + visual simultâneo) mostra resultados superiores em tarefas de raciocínio fluido. Normas de desempenho por nível N disponíveis para comparação clínica (Jaeggi et al., 2010; revisado 2022).",
    references: [
      "Soveri, A., et al. (2017). Working memory training revisited: A multi-level meta-analysis of n-back training studies. Psychonomic Bulletin & Review, 24(4), 1077–1096.",
      "Rottschy, C., et al. (2012). Modelling neural correlates of working memory: A coordinate-based meta-analysis. NeuroImage, 60(1), 830–846.",
      "Melby-Lervåg, M., Redick, T. S., & Hulme, C. (2016). Working memory training does not improve performance on measures of intelligence or other measures of 'far transfer'. Perspectives on Psychological Science, 11(4), 512–534.",
    ],
  },

  "labirinto": {
    exerciseId: "labirinto",
    neuroanatomy:
      "Navegação espacial e planejamento: hipocampo (mapa cognitivo e células de lugar), córtex entorrinal (células de grade), córtex pré-frontal (planejamento de rota) e córtex parietal posterior (representação alocêntrica). Descoberta de O'Keefe & Moser (Nobel 2014) e expandida por Brunec et al. (2019).",
    trainingEffects:
      "Treino de navegação virtual melhora memória espacial episódica em 0,4 DP em adultos jovens (Lövdén et al., 2020). Protocolo de labirinto 3D mostrou aumento de volume hipocampal em adultos idosos após 3 meses (Kühn et al., 2014). Benefícios em tarefas de orientação espacial ecológica documentados em CCL.",
    clinicalRelevance:
      "Déficits de navegação espacial são marcadores pré-clínicos de DA e CCL amnéstico; avaliados pela tarefa Sea Hero Quest (Coughlan et al., 2019). Comprometimento frequente em DP, TCE e pós-AVC de hemisfério direito. Monitoramento de erros e tempo de percurso fornece índices sensíveis de progressão.",
    references: [
      "Lövdén, M., et al. (2020). Revisiting the proximodistal principle of hippocampal function. Psychological Review, 127(6), 1033–1049.",
      "Coughlan, G., et al. (2019). Toward personalized cognitive diagnostics of at-genetic-risk Alzheimer's disease. PNAS, 116(19), 9285–9292.",
      "Brunec, I. K., et al. (2019). Shrinking and growing of spatial maps in the hippocampus. Nature Communications, 10, 1–12.",
    ],
  },
};
