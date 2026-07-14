// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — catálogo OFICIAL (Etapa 2, spec §24).
//
// 90 atividades: 30 Crianças (cm_c01..cm_c30) + 30 Adolescentes (cm_a01..cm_a30)
// + 30 Adultos e idosos (cm_ad01..cm_ad30). Conteúdo definido pela terapeuta em
// CAMINHOS-ATIVIDADES-ETAPA2-SPEC.md — ao editar, seguir a spec, não improvisar.
// A biblioteca é classificação interna do painel (nunca aparece ao paciente) e
// NÃO bloqueia por idade: o terapeuta prescreve qualquer atividade a qualquer
// paciente. As 3 atividades [EXEMPLO] da Etapa 1 foram removidas.
// ─────────────────────────────────────────────────────────────────────────────

import type { CaminhosAtividade } from "@/types/caminhos-meta";
import { CAMINHOS_CRIANCAS } from "@/data/caminhos-meta/criancas";
import { CAMINHOS_ADOLESCENTES } from "@/data/caminhos-meta/adolescentes";
import { CAMINHOS_ADULTOS_IDOSOS } from "@/data/caminhos-meta/adultos-idosos";

export { CAMINHOS_CRIANCAS, CAMINHOS_ADOLESCENTES, CAMINHOS_ADULTOS_IDOSOS };

/** Catálogo completo (90), na ordem crianças → adolescentes → adultos e idosos. */
export const CAMINHOS_ATIVIDADES: CaminhosAtividade[] = [
  ...CAMINHOS_CRIANCAS,
  ...CAMINHOS_ADOLESCENTES,
  ...CAMINHOS_ADULTOS_IDOSOS,
];
