import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default therapist
  const existingUser = await prisma.user.findUnique({
    where: { email: "terapeuta@neuropeak.com" },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("neuropeak123", 12);
    const therapist = await prisma.user.create({
      data: {
        email: "terapeuta@neuropeak.com",
        password: hashedPassword,
        name: "Dra. Ana Santos",
        clinicName: "Clínica NeuroPeak",
        role: "THERAPIST",
      },
    });
    console.log(`Created therapist: ${therapist.email}`);
    console.log(`Password: neuropeak123`);

    // Create demo patients
    const patients = [
      {
        name: "João Silva",
        birthDate: new Date("1985-03-15"),
        diagnosis: "TDAH",
        cid: "F90.0",
        theme: "CLINICAL" as const,
        pin: "1234",
        therapeuticGoals: "Melhora da atenção sustentada e velocidade de processamento",
      },
      {
        name: "Maria Oliveira",
        birthDate: new Date("2012-07-22"),
        diagnosis: "Dislexia",
        cid: "F81.0",
        theme: "COLORFUL" as const,
        pin: "5678",
        therapeuticGoals: "Fortalecimento da memória verbal e funções executivas",
      },
      {
        name: "Pedro Costa",
        birthDate: new Date("2008-11-05"),
        diagnosis: "Síndrome de Asperger",
        cid: "F84.5",
        theme: "GAMIFIED" as const,
        pin: "9012",
        therapeuticGoals: "Flexibilidade cognitiva e planejamento",
      },
    ];

    for (const p of patients) {
      const patient = await prisma.patient.create({
        data: {
          ...p,
          therapistId: therapist.id,
        },
      });

      // Create training plan
      await prisma.trainingPlan.create({
        data: {
          patientId: patient.id,
          domains: JSON.stringify(["memory", "attention"]),
          exercises: JSON.stringify(["span-numerico", "stroop-task", "tempo-reacao"]),
          sessionDuration: 30,
          frequency: 3,
          isActive: true,
        },
      });

      // Create some demo sessions
      const now = new Date();
      for (let i = 0; i < 8; i++) {
        const completedAt = new Date(now.getTime() - i * 2 * 24 * 60 * 60 * 1000);
        await prisma.session.create({
          data: {
            patientId: patient.id,
            exerciseId: ["span-numerico", "stroop-task", "tempo-reacao"][i % 3],
            domain: ["memory", "attention", "processing"][i % 3],
            score: 60 + Math.random() * 30,
            accuracy: 0.6 + Math.random() * 0.35,
            reactionTime: 400 + Math.random() * 300,
            difficulty: 1 + Math.floor(Math.random() * 3),
            duration: 180 + Math.floor(Math.random() * 120),
            completedAt,
          },
        });
      }

      console.log(`Created patient: ${patient.name} (PIN: ${p.pin})`);
    }
  } else {
    console.log("Therapist already exists, skipping seed.");
  }

  console.log("\nDefault credentials:");
  console.log("  Therapist email: terapeuta@neuropeak.com");
  console.log("  Therapist password: neuropeak123");
  console.log("\nDemo patients (use their ID + PIN on patient login):");
  console.log("  João Silva - PIN: 1234");
  console.log("  Maria Oliveira - PIN: 5678");
  console.log("  Pedro Costa - PIN: 9012");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
