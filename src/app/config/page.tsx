"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Moon, Sun, Dog, Info } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "next-themes";
import { getAllMembers } from "@/lib/firebase/firestore";
import type { Member } from "@/lib/types";
import { APP_NAME, PET_NAME, PET_BREED } from "@/lib/utils/constants";

export default function ConfigPage() {
  const { uid } = useAuth();
  const { theme, setTheme } = useTheme();
  const [members, setMembers] = useState<Record<string, Member>>({});
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getAllMembers().then((m) => {
      setMembers(m);
      setMembersLoaded(true);
    });
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-4 p-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold">Configuración</h1>
        </motion.div>

        {/* Pet info */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Dog className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{PET_NAME}</p>
              <p className="text-sm text-muted-foreground">{PET_BREED}</p>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Apariencia
          </p>
          <Card className="p-0">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">Modo oscuro</span>
              </div>
              {mounted && (
                <Switch
                  checked={isDark}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              )}
            </div>
          </Card>
        </div>

        {/* Members */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Familia
          </p>
          <Card className="p-0 divide-y divide-border">
            {Object.entries(members).map(([id, member]) => (
              <div key={id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{member.name}</span>
                </div>
                {id === uid && (
                  <Badge variant="secondary" className="text-[10px]">
                    Vos
                  </Badge>
                )}
              </div>
            ))}
            {Object.keys(members).length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {membersLoaded ? "Sin miembros registrados" : "Cargando miembros..."}
              </div>
            )}
          </Card>
        </div>

        {/* About */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Acerca de
          </p>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{APP_NAME} v0.1.0</p>
                <p className="text-xs text-muted-foreground">
                  Registro de comidas con NFC
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
