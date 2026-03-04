// Quick script to add a sample daytime meal event to Firestore
// Run: node scripts/add-sample-meal.mjs

import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const app = initializeApp({ projectId: "enzi-app" });
const db = getFirestore(app);

async function addSampleMeal() {
  // Create a timestamp for today at 12:30 PM (daytime)
  const now = new Date();
  const daytime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30, 0);

  const eventData = {
    dispenserId: "sample",
    dispenserName: "Normal Food",
    dispenserIcon: "utensils",
    dispenserColor: "#F59E0B",
    memberId: "sample-user",
    memberName: "Simon",
    amountGrams: 150,
    notes: "",
    source: "manual",
    tokenId: null,
    undone: false,
    undoneAt: null,
    undoneBy: null,
    timestamp: Timestamp.fromDate(daytime),
    createdAt: Timestamp.fromDate(daytime),
  };

  const ref = await db.collection("events").add(eventData);
  console.log(`✅ Added sample daytime meal (12:30 PM): ${ref.id}`);
  console.log("   Refresh the app to see the day-themed card!");
}

addSampleMeal().catch(console.error);
