"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/config";
import {
  ensureAnonymousAuth,
  getMemberName,
  setMemberName as saveMemberName,
  updateLastSeen,
} from "@/lib/firebase/auth";

interface AuthContextValue {
  user: User | null;
  uid: string | null;
  memberName: string | null;
  isLoading: boolean;
  needsName: boolean;
  firebaseReady: boolean;
  setMemberName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  uid: null,
  memberName: null,
  isLoading: true,
  needsName: false,
  firebaseReady: false,
  setMemberName: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [memberName, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsName, setNeedsName] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // If Firebase is not configured, check localStorage for saved name
    if (!isFirebaseConfigured || !auth) {
      console.warn(
        "[Enzi] Firebase no está configurado. Configurá las variables de entorno en .env.local"
      );
      const savedName = typeof window !== "undefined"
        ? localStorage.getItem("enzi-member-name")
        : null;
      if (savedName) {
        setName(savedName);
        setNeedsName(false);
      } else {
        setNeedsName(true);
      }
      setIsLoading(false);
      return;
    }

    let unsubscribed = false;
    const firebaseAuth = auth;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (unsubscribed) return;

      if (firebaseUser) {
        setUser(firebaseUser);
        setFirebaseReady(true);
        try {
          const name = await getMemberName(firebaseUser.uid);
          if (name) {
            setName(name);
            setNeedsName(false);
            updateLastSeen(firebaseUser.uid);
          } else {
            setNeedsName(true);
          }
        } catch (err) {
          console.error("[Enzi] Error al obtener nombre:", err);
          setNeedsName(true);
        }
        setIsLoading(false);
      } else {
        // No user, trigger anonymous auth
        try {
          await ensureAnonymousAuth();
          // onAuthStateChanged will fire again with the new user
        } catch (err) {
          console.error("[Enzi] Error de autenticación:", err);
          setIsLoading(false);
        }
      }
    });

    // Safety timeout: if auth takes more than 8 seconds, stop loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("[Enzi] Auth timeout - mostrando UI sin auth");
        setIsLoading(false);
        setNeedsName(true);
      }
    }, 8000);

    return () => {
      unsubscribed = true;
      unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetMemberName = useCallback(
    async (name: string) => {
      if (user && isFirebaseConfigured) {
        try {
          await saveMemberName(user.uid, name);
        } catch (err) {
          console.error("[Enzi] Error al guardar nombre:", err);
        }
      }
      // Always persist to localStorage as fallback
      if (typeof window !== "undefined") {
        localStorage.setItem("enzi-member-name", name);
      }
      setName(name);
      setNeedsName(false);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        uid: user?.uid ?? null,
        memberName,
        isLoading,
        needsName,
        firebaseReady,
        setMemberName: handleSetMemberName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
