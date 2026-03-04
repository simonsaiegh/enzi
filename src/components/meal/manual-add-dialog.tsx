"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useDispensers } from "@/lib/hooks/use-dispensers";
import { callRegisterManualMeal } from "@/lib/firebase/functions";
import { useToast } from "@/lib/hooks/use-toast";

export function ManualAddDialog() {
  const [open, setOpen] = useState(false);
  const [selectedDispenser, setSelectedDispenser] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { uid, memberName } = useAuth();
  const { dispensers } = useDispensers();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedDispenser || !uid || !memberName) return;

    setIsSubmitting(true);
    try {
      const result = await callRegisterManualMeal({
        dispenserId: selectedDispenser,
        memberId: uid,
        memberName,
        amountGrams: amount ? parseInt(amount) : undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        toast({
          title: "Comida registrada",
          description: "Se agregó manualmente al historial",
        });
        setOpen(false);
        setSelectedDispenser("");
        setAmount("");
        setNotes("");
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo registrar la comida",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-white/25 backdrop-blur-sm border-white/30 text-white hover:bg-white/35 shadow-lg"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Agregar comida</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Dispenser selection */}
          <div className="space-y-2">
            <Label>Tipo de comida</Label>
            <div className="grid grid-cols-2 gap-2">
              {dispensers.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDispenser(d.id)}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors ${
                    selectedDispenser === d.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="font-medium">{d.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Cantidad (gramos, opcional)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="150"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ej: Comió con menos ganas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedDispenser || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Registrar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
