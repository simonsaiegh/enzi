"use client";

export const dynamic = "force-dynamic";

import { motion } from "framer-motion";
import {
  Tag,
  Plus,
  Sunrise,
  Sunset,
  Cookie,
  Pill,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDispensers } from "@/lib/hooks/use-dispensers";
import Link from "next/link";

const iconMap: Record<string, LucideIcon> = {
  sunrise: Sunrise,
  sunset: Sunset,
  cookie: Cookie,
  pill: Pill,
  utensils: Utensils,
};

export default function DispensadoresPage() {
  const { dispensers, isLoading } = useDispensers();

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-4 p-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold">Dispensadores</h1>
          </div>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/dispensadores/nuevo">
              <Plus className="h-4 w-4" />
              Nuevo
            </Link>
          </Button>
        </motion.div>

        <p className="text-sm text-muted-foreground">
          Cada dispensador representa un tipo de comida y se asocia a un tag
          NFC.
        </p>

        {/* Dispenser list */}
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : dispensers.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Tag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              No hay dispensadores configurados
            </p>
            <Button asChild size="sm">
              <Link href="/dispensadores/nuevo">
                <Plus className="h-4 w-4" />
                Crear el primero
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {dispensers.map((d, i) => {
              const Icon = iconMap[d.icon] || Utensils;
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${d.color}20` }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: d.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{d.name}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <Badge variant="secondary" className="text-[10px]">
                            {d.defaultAmountGrams}g
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {d.mode === "auto" ? "Auto" : "Confirmar"}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {d.antiDuplicateWindowSeconds}s anti-dup
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
