/**
 * Seed script para crear los datos iniciales en Firestore
 * Uso: node scripts/seed.mjs
 * 
 * Requiere: GOOGLE_APPLICATION_CREDENTIALS set con la ruta al service account key
 * O correr después de `npx firebase login` con las credenciales de admin
 */

import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Inicializar con el proyecto enzi-app
const app = initializeApp({
  projectId: "enzi-app",
  credential: applicationDefault(),
});

const db = getFirestore(app);

async function seed() {
  console.log("🐕 Seeding Firestore para Enzi...\n");

  // 1. Crear household/main
  const householdRef = db.collection("household").doc("main");
  const householdSnap = await householdRef.get();

  if (householdSnap.exists) {
    console.log("⚠️  household/main ya existe, saltando...");
  } else {
    await householdRef.set({
      petName: "Enzo",
      petNickname: "Enzi",
      petBreed: "Border Collie",
      alertThresholdMinutes: 480,
      lastAlertSentAt: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log("✅ Creado: household/main");
    console.log("   petName: Enzo");
    console.log("   petNickname: Enzi");
    console.log("   petBreed: Border Collie");
    console.log("   alertThresholdMinutes: 480 (8 horas)");
  }

  console.log("\n🎉 Seed completado!");
  console.log("\nPróximos pasos:");
  console.log("  1. Ir a la app y crear dispensadores en /dispensadores/nuevo");
  console.log("  2. Grabar los links generados en tags NFC");
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err.message);
  if (err.message.includes("Could not load the default credentials")) {
    console.log("\n💡 Tip: Corré estos comandos primero:");
    console.log("   gcloud auth application-default login");
    console.log("   O configurá GOOGLE_APPLICATION_CREDENTIALS con un service account key");
  }
  process.exit(1);
});
