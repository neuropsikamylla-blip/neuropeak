# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O código, pronto para portar

Substitui a `ShapeSvg` inteira (linhas 136–147 de `/Users/kamyllahonorio/neuropeak/components/exercises/attention/DualTask.tsx`).

**Como os cantos foram calculados.** Para cada vértice `V` com vizinhos `A` e `B`: `û = norm(A−V)`, `ŵ = norm(B−V)`, ângulo interno `θ = acos(û·ŵ)`. Os pontos de tangência ficam a `d = r / tan(θ/2)` de `V` sobre cada aresta, e o canto vira `L T1` + `A r r 0 0 1 T2` (varredura 1 porque os vértices estão em ordem horária na tela). O arco **retrai** a ponta em `r/sen(θ/2) − r` — 8 unidades no ápice do triângulo, 3,3 nas pontas do losango. Por isso o polígono matemático foi **reexpandido** até a silhueta medida bater na caixa alvo; os vértices calculados caem fora da silhueta visível, e é por isso que o `d` final vai como constante em vez de ser recalculado em tempo de execução.

```tsx
// Silhuetas com vértices arredondados por arco tangente (raio 8) e peso ótico corrigido.
const SHAPE_PATH: Record&lt;ShapeKind, string&gt; = {
  circle:   "M 9.036 50 A 40.964 40.964 0 1 0 90.964 50 A 40.964 40.964 0 1 0 9.036 50 Z",
  square:   "M 13.211 21.211 A 8 8 0 0 1 21.211 13.211 L 78.789 13.211 A 8 8 0 0 1 86.789 21.211 L 86.789 78.789 A 8 8 0 0 1 78.789 86.789 L 21.211 86.789 A 8 8 0 0 1 13.211 78.789 Z",
  triangle: "M 42.995 13.649 A 8 8 0 0 1 57.005 13.649 L 92.852 78.621 A 8 8 0 0 1 85.847 90.486 L 14.153 90.486 A 8 8 0 0 1 7.148 78.621 Z",
  diamond:  "M 44.343 7.843 A 8 8 0 0 1 55.657 7.843 L 92.157 44.343 A 8 8 0 0 1 92.157 55.657 L 55.657 92.157 A 8 8 0 0 1 44.343 92.157 L 7.843 55.657 A 8 8 0 0 1 7.843 44.343 Z",
};

// Degradê de baixa amplitude: apenas o eixo L* do CIELAB (±3), matiz e croma preservados.
const SHAPE_SHADE: Record&lt;ShapeColor, { top: string; bottom: string; edge: string }&gt; = {
  green  : { top: "#25ab51", bottom: "#009b43", edge: "#008639" },
  red    : { top: "#f94d4b", bottom: "#e53a3d", edge: "#cf212d" },
  blue   : { top: "#356af4", bottom: "#0a5ce2", edge: "#004cc1" },
  yellow : { top: "#f3bb1a", bottom: "#e0ab00", edge: "#c99900" },
  orange : { top: "#ff7d29", bottom: "#ef6b09", edge: "#d45c00" },
};

function ShapeSvg({ color, kind, size = 90 }: { color: ShapeColor; kind: ShapeKind; size?: number | string }) {
  const d = SHAPE_PATH[kind];
  const s = SHAPE_SHADE[color];
  const uid = `${color}-${kind}`;
  return (
    &lt;svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}&gt;
      &lt;defs&gt;
        &lt;linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1"&gt;
          &lt;stop offset="0" stopColor={s.top} /&gt;
          &lt;stop offset="1" stopColor={s.bottom} /&gt;
        &lt;/linearGradient&gt;
        &lt;filter id={`sf-${uid}`} x="-40%" y="-40%" width="180%" height="180%"&gt;
          &lt;feDropShadow dx="0" dy="1.6" stdDeviation="1.6" floodColor="#0F172A" floodOpacity="0.18" /&gt;
        &lt;/filter&gt;
        &lt;clipPath id={`sc-${uid}`}&gt;&lt;path d={d} /&gt;&lt;/clipPath&gt;
      &lt;/defs&gt;
      &lt;path d={d} fill={`url(#sg-${uid})`} filter={`url(#sf-${uid})`} /&gt;
      &lt;g clipPath={`url(#sc-${uid})`}&gt;
        &lt;path d={d} fill="none" stroke={s.edge} strokeWidth={2} opacity={0.5} /&gt;
      &lt;/g&gt;
    &lt;/svg&gt;
  );
}
```

A chave `cor-forma` no `id` é obrigatória: o estímulo grande e o ícone de 18 px podem coexistir com a mesma cor e forma, e aí o `id` repete — o que é inofensivo porque a chave determina integralmente o conteúdo das definições. Encurtar a chave (só a forma, por exemplo) quebraria: duas cores compartilhariam o mesmo degradê.

## O QUE NÃO FIZ (limites e dúvidas)

- **Não apliquei nada no projeto.** `DualTask.tsx` está intocado, nada foi commitado, nada foi enviado. O despacho pedia a página; a integração é decisão dela.
- **Comportamento em produção: DESCONHECIDO.** Não rodei `npm run build`, `lint`, `test` nem tsc, porque não integrei. Em particular, **não medi o custo do `filter` com desfoque** num elemento que o framer-motion anima (`scale`/`opacity`) a cada 1,6–2,6 s; num único SVG pequeno é provável que seja irrelevante, mas provável não é medido. Se ela quiser risco zero de desempenho, a variante C (sem filtro) entrega 90% do ganho.
- **A avaliação visual foi minha, em Chrome headless no macOS**, a 1× e 2×. Não vi em aparelho real, nem no monitor dela, nem no tema GAMIFIED em uso, nem em movimento (a forma fica ~2 s e entra com `scale 0.6→1`). Volume sutil em peça animada pode ler diferente do que em imagem parada.
- **A correção de peso ótico a 50% é julgamento de desenho**, apoiado na medida de área e na leitura das renderizações — não é resultado de teste com paciente. A página mostra 0%, 50% e 100% justamente para ela discordar com os três à vista.
- **Não tratei acessibilidade.** A tabela de contraste registra um dado que já existe e não foi introduzido por mim: o **amarelo tem 1,82:1 contra o fundo claro**. Para um exercício que depende de nomear cor, isso merece uma tarefa própria — não mexi na paleta porque estava fora do despacho.
- **Não mexi em nada clínico:** mesma paleta, mesmas 4 formas, mesma taxonomia, mesma lógica de alvo e distrator.</result>
<usage><subagent_tokens>166360</subagent_tokens><tool_uses>61</tool_uses><duration_ms>1610661</duration_ms></usage>
</task-notification>

## 31/08/2026 11:29
reloginho (Ritmo: moderado) isso nao precisa aparecer.
