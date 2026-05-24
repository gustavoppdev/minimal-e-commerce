"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signOut as signOutAction } from "@/actions/auth";
import { User } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Tipagem do Contexto de Autenticação
// ---------------------------------------------------------------------------
interface AuthContextType {
  /** O usuário atual autenticado, ou null se não estiver logado. */
  user: User | null;
  /** True enquanto o Supabase ainda está verificando os tokens/cookies. */
  isLoading: boolean;
  /**
   * Desloga o usuário de forma centralizada.
   * Chama a Server Action de signOut para invalidar a sessão no servidor
   * e redirecionar para a página de login.
   */
  signOut: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Criação do Contexto
// Iniciado como undefined para que o hook useAuth possa detectar uso fora do Provider.
// ---------------------------------------------------------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // IMPORTANTE: O cliente Supabase deve ser memorizado com useMemo.
  // Sem isso, createClient() seria chamado a cada re-render, criando uma nova
  // instância e fazendo o useEffect (que tem `supabase` como dependência)
  // cancelar e recriar a subscription repetidamente — um vazamento de memória real.
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // A. Obtém a sessão inicial de forma assíncrona para inicializar a UI
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Erro ao buscar a sessão inicial do Supabase:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // B. Listener em tempo real que reage a SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Força um re-fetch nos Server Components para refletir a mudança de sessão
      if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
        router.refresh();
      }
    });

    // C. Limpeza: cancela a subscription quando o componente é desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // ---------------------------------------------------------------------------
  // Função de logout centralizada
  // Delega para a Server Action, que invalida a sessão no servidor e redireciona.
  // ---------------------------------------------------------------------------
  const signOut = async () => {
    try {
      setIsLoading(true);
      await signOutAction();
      // O redirect é feito pela Server Action; o estado local será limpo
      // pelo listener onAuthStateChange quando o evento SIGNED_OUT chegar.
    } catch (error) {
      console.error("Erro ao efetuar logout:", error);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook customizado — valida que está dentro do AuthProvider
// ---------------------------------------------------------------------------
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth deve ser utilizado dentro de um <AuthProvider>! " +
        "Verifique se o componente está dentro da árvore do AuthProvider.",
    );
  }

  return context;
}
