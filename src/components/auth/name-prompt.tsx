"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import Image from "next/image";

export function NamePrompt() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setMemberName } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await setMemberName(trimmed);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Immersive Fixed Background Image */}
      <div className="fixed inset-0 w-full h-[60vh] z-[-1] pointer-events-none">
        <Image
          src="/images/enzo-real.jpg"
          alt="Enzo"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Gradient that fades black/dark to transparent over the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-80" />
        {/* Thick gradient at the bottom that smoothly fades the image into the dark background of the app */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
      </div>

      {/* Main Content (pushed down over the gradient fade) */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-start min-h-screen px-6 pt-[30vh] pb-20">
          
          {/* Header Text overlay on the image/fade */}
          <div className="w-full max-w-sm mb-12 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
              className="text-5xl font-black text-white tracking-tighter"
              style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}
            >
              Enzi
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-2 text-lg font-medium text-white/90"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
            >
              El registro de comidas de Enzo
            </motion.p>
          </div>

          {/* Form area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="w-full max-w-sm p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="w-full space-y-7">
              <div className="space-y-3 text-center">
                <label
                  htmlFor="name"
                  className="text-base font-semibold text-white/80"
                >
                  ¿Cómo te llamás?
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ej: Simon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  autoComplete="given-name"
                  maxLength={30}
                  className="h-16 text-center text-2xl font-bold rounded-2xl bg-white/10 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:bg-white/15 transition-all outline-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={!name.trim() || isSubmitting}
                className="w-full h-14 text-lg font-bold rounded-2xl bg-white text-black hover:bg-white/90 transition-all font-mono tracking-tight"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-6 w-6 rounded-full border-3 border-black border-t-transparent"
                  />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
