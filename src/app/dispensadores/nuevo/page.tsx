"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sunrise,
  Sunset,
  Cookie,
  Pill,
  Utensils,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/use-toast";
import { db } from "@/lib/firebase/config";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";

const ICONS = [
  { name: "sunrise", icon: Sunrise, label: "Mañana" },
  { name: "sunset", icon: Sunset, label: "Tarde" },
  { name: "cookie", icon: Cookie, label: "Snack" },
  { name: "pill", icon: Pill, label: "Medicación" },
  { name: "utensils", icon: Utensils, label: "General" },
];

const COLORS = [
  "#F59E0B", // Amber
  "#F97316", // Orange
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#EC4899", // Pink
  "#6366F1", // Indigo
];

function generateToken(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) {
    result += chars[arr[i] % chars.length];
  }
  return result;
}

export default function NuevoDispensadorPage() {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("sunrise");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [amount, setAmount] = useState("150");
  const [antiDup, setAntiDup] = useState("60");
  const [autoMode, setAutoMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://enzi.vercel.app";

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (!db) {
        throw new Error("Firebase no configurado");
      }
      // Create dispenser
      const dispenserRef = await addDoc(collection(db, "dispensers"), {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        defaultAmountGrams: parseInt(amount) || 150,
        antiDuplicateWindowSeconds: parseInt(antiDup) || 60,
        mode: autoMode ? "auto" : "confirm",
        sortOrder: Date.now(),
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create token
      const token = generateToken();
      await setDoc(doc(db, "tokens", token), {
        dispenserId: dispenserRef.id,
        createdAt: serverTimestamp(),
        lastUsedAt: null,
      });

      setCreatedToken(token);

      toast({
        title: "Dispensador creado",
        description: `"${name.trim()}" listo para usar`,
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo crear el dispensador",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nfcUrl = createdToken ? `${appUrl}/t/${createdToken}` : null;

  const handleCopy = async () => {
    if (!nfcUrl) return;
    await navigator.clipboard.writeText(nfcUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copiado" });
  };

  if (createdToken && nfcUrl) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg space-y-4 p-4 pt-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h1 className="mb-2 text-xl font-bold">Dispensador creado</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Grabá este link en tu tag NFC con la app &quot;NFC Tools&quot;
            </p>

            <Card className="w-full p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Link para el tag NFC:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-xs font-mono">
                  {nfcUrl}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setCreatedToken(null);
                  setName("");
                  setCopied(false);
                }}
              >
                Crear otro
              </Button>
              <Button asChild>
                <Link href="/dispensadores">Ver todos</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6 p-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dispensadores">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-bold">Nuevo dispensador</h1>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            placeholder="Ej: Comida AM"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Label>Ícono</Label>
          <div className="flex gap-2">
            {ICONS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setSelectedIcon(item.name)}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-colors ${
                  selectedIcon === item.name
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`h-8 w-8 rounded-full border-2 transition-all ${
                  selectedColor === color
                    ? "border-foreground scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Cantidad default (gramos)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Anti-duplicate */}
        <div className="space-y-2">
          <Label htmlFor="antidup">Ventana anti-duplicado (segundos)</Label>
          <Input
            id="antidup"
            type="number"
            value={antiDup}
            onChange={(e) => setAntiDup(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Si se escanea dos veces en este tiempo, no duplica el registro.
          </p>
        </div>

        {/* Auto mode */}
        <div className="flex items-center justify-between rounded-xl border p-3">
          <div>
            <p className="text-sm font-medium">Registro automático</p>
            <p className="text-xs text-muted-foreground">
              {autoMode
                ? "Registra al escanear sin confirmación"
                : "Pide confirmación antes de registrar"}
            </p>
          </div>
          <Switch checked={autoMode} onCheckedChange={setAutoMode} />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Crear dispensador"
          )}
        </Button>
      </div>
    </AppShell>
  );
}
