export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { createElement } from "react";
import { calculateDomainScore, generateRecommendations } from "@/lib/scoring";
import { formatDate, calculateAge } from "@/lib/utils";
import { DOMAIN_LABELS } from "@/types";
import type { SessionData } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { withApiHandler } from "@/lib/api-handler";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#2563EB",
  },
  logo: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#2563EB",
  },
  clinicName: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  reportDate: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1E40AF",
    marginTop: 20,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#DBEAFE",
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: "#6B7280",
    width: 160,
  },
  value: {
    fontSize: 10,
    color: "#111827",
    flex: 1,
  },
  domainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  domainLabel: {
    fontSize: 10,
    color: "#374151",
    width: 180,
  },
  domainScore: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    width: 40,
    textAlign: "right",
  },
  domainBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginLeft: 10,
  },
  domainBarFill: {
    height: 8,
    borderRadius: 4,
  },
  sessionRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 4,
  },
  sessionCell: {
    fontSize: 9,
    color: "#374151",
  },
  recommendations: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
    marginTop: 8,
  },
  signature: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signatureBox: {
    width: 250,
    borderTopWidth: 1,
    borderTopColor: "#111827",
    paddingTop: 8,
    alignItems: "center",
  },
  signatureLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
});

export const GET = withApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;
  const searchParams = req.nextUrl.searchParams;
  const patientId = searchParams.get("patientId");
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");

  if (!patientId) {
    return NextResponse.json({ error: "patientId required" }, { status: 400 });
  }

  const start = startStr ? new Date(startStr) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const end = endStr ? new Date(endStr + "T23:59:59") : new Date();

  const [patientBase, sessionRows, achievements, therapist] = await Promise.all([
    prisma.patient.findFirst({ where: { id: patientId, therapistId } }),
    prisma.session.findMany({
      where: { patientId, completedAt: { gte: start, lte: end } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.achievement.findMany({ where: { patientId } }),
    prisma.user.findUnique({ where: { id: therapistId } }),
  ]);

  if (!patientBase || !therapist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const patient = { ...patientBase, sessions: sessionRows, achievements };
  const sessions = patient.sessions as unknown as SessionData[];
  const domainScores = calculateDomainScore(sessions);
  const age = calculateAge(patient.birthDate);
  const recommendations = generateRecommendations(domainScores);

  const doc = createElement(Document, {},
    createElement(Page, { size: "A4", style: styles.page },
      createElement(View, { style: styles.header },
        createElement(View, {},
          createElement(Text, { style: styles.logo }, "NeuroPeak"),
          createElement(Text, { style: styles.clinicName }, therapist.clinicName ?? "Clínica de Neuropsicologia"),
        ),
        createElement(View, {},
          createElement(Text, { style: styles.reportDate }, `Relatório gerado em: ${formatDate(new Date())}`),
          createElement(Text, { style: styles.reportDate }, `Período: ${formatDate(start)} a ${formatDate(end)}`),
        ),
      ),

      createElement(Text, { style: styles.sectionTitle }, "1. Identificação do Paciente"),
      createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Nome:"), createElement(Text, { style: styles.value }, patient.name)),
      createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Data de Nascimento:"), createElement(Text, { style: styles.value }, `${formatDate(patient.birthDate)} (${age} anos)`)),
      patient.cid ? createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "CID:"), createElement(Text, { style: styles.value }, patient.cid)) : null,
      patient.diagnosis ? createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Diagnóstico:"), createElement(Text, { style: styles.value }, patient.diagnosis)) : null,
      patient.education ? createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Escolaridade:"), createElement(Text, { style: styles.value }, patient.education)) : null,
      patient.medications ? createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Medicamentos:"), createElement(Text, { style: styles.value }, patient.medications)) : null,

      createElement(Text, { style: styles.sectionTitle }, "2. Resumo do Treinamento"),
      createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Total de sessões:"), createElement(Text, { style: styles.value }, String(sessions.length))),
      createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Período avaliado:"), createElement(Text, { style: styles.value }, `${formatDate(start)} a ${formatDate(end)}`)),
      createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Terapeuta:"), createElement(Text, { style: styles.value }, therapist.name)),

      createElement(Text, { style: styles.sectionTitle }, "3. Desempenho por Domínio Cognitivo"),
      ...domainScores.map((ds) =>
        createElement(View, { style: styles.domainRow, key: ds.domain },
          createElement(Text, { style: styles.domainLabel }, DOMAIN_LABELS[ds.domain]),
          createElement(Text, { style: { ...styles.domainScore, color: ds.score >= 70 ? "#16A34A" : ds.score >= 50 ? "#CA8A04" : "#DC2626" } }, `${ds.score}/100`),
          createElement(View, { style: styles.domainBar },
            createElement(View, { style: { ...styles.domainBarFill, width: `${ds.score}%`, backgroundColor: ds.score >= 70 ? "#16A34A" : ds.score >= 50 ? "#CA8A04" : "#DC2626" } }),
          ),
        )
      ),

      createElement(Text, { style: styles.sectionTitle }, "4. Histórico de Sessões (últimas 10)"),
      createElement(View, { style: { ...styles.sessionRow, borderBottomColor: "#9CA3AF" } },
        createElement(Text, { style: { ...styles.sessionCell, width: 100, fontFamily: "Helvetica-Bold" } }, "Data"),
        createElement(Text, { style: { ...styles.sessionCell, flex: 1, fontFamily: "Helvetica-Bold" } }, "Exercício"),
        createElement(Text, { style: { ...styles.sessionCell, width: 60, fontFamily: "Helvetica-Bold" } }, "Pontuação"),
        createElement(Text, { style: { ...styles.sessionCell, width: 60, fontFamily: "Helvetica-Bold" } }, "Precisão"),
      ),
      ...sessions.slice(0, 10).map((s, i) =>
        createElement(View, { style: styles.sessionRow, key: i },
          createElement(Text, { style: { ...styles.sessionCell, width: 100 } }, formatDate(s.completedAt)),
          createElement(Text, { style: { ...styles.sessionCell, flex: 1 } }, s.exerciseId),
          createElement(Text, { style: { ...styles.sessionCell, width: 60 } }, `${Math.round(s.score)}/100`),
          createElement(Text, { style: { ...styles.sessionCell, width: 60 } }, `${Math.round(s.accuracy * 100)}%`),
        )
      ),

      createElement(Text, { style: styles.sectionTitle }, "5. Recomendações"),
      createElement(Text, { style: styles.recommendations }, recommendations),

      createElement(View, { style: styles.signature },
        createElement(View, { style: styles.signatureBox },
          createElement(Text, { style: styles.signatureLabel }, therapist.name),
          createElement(Text, { style: styles.signatureLabel }, "Neuropsicólogo(a)"),
          createElement(Text, { style: styles.signatureLabel }, `CRP: _______________`),
        ),
      ),

      createElement(Text, { style: styles.footer },
        `NeuroPeak — Plataforma de Treinamento Cognitivo | Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
      ),
    )
  );

  const pdfBuffer = await renderToBuffer(doc);

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio_${patient.name.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.pdf"`,
    },
  });
});
