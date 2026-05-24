"use client";

import { useState } from "react";
import { resendVerificationEmail } from "@/actions/auth";
import { AlertTriangle, Loader2, Check } from "lucide-react";

type BannerProps = {
  userId: string;
  userEmail: string;
};

export function EmailVerificationBanner({ userId, userEmail }: BannerProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    const res = await resendVerificationEmail(userId);
    setLoading(false);
    if (res.success) {
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 py-2.5 px-4 text-sm flex flex-col sm:flex-row items-center justify-between gap-2 transition-all duration-300">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 animate-bounce" />
        <span>
          Seu e-mail <strong>{userEmail}</strong> não está confirmado.
          Confirme-o para liberar compras.
        </span>
      </div>
      <button
        onClick={handleResend}
        disabled={loading || sent}
        className="flex items-center gap-1.5 bg-amber-600 text-white font-medium px-3 py-1 rounded-md text-xs hover:bg-amber-700 transition disabled:opacity-50"
      >
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        {sent ? (
          <>
            <Check className="h-3 w-3" /> Reenviado! Verifique a Caixa
          </>
        ) : (
          "Reenviar E-mail"
        )}
      </button>
    </div>
  );
}
