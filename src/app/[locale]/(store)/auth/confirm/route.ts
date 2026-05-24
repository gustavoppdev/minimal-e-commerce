import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Rota de callback do Supabase Auth
//
// Esta rota é chamada automaticamente pelo Supabase nos seguintes fluxos:
//   - Redefinição de senha (type = "recovery")
//   - Confirmação de e-mail via Magic Link (type = "email")
//   - Alteração de e-mail (type = "email_change")
//   - Login com OTP (type = "magiclink")
//
// NOTA: O fluxo de confirmação de e-mail do CADASTRO usa uma rota customizada
// em /auth/verify-email (com token UUID próprio + Resend). Esta rota é reservada
// para os fluxos nativos do Supabase listados acima.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // Sucesso: redireciona para a URL de destino (padrão: home)
      return redirect(`${origin}${next}`);
    }
  }

  // Falha: redireciona para o login com flag de erro na query string
  // O middleware next-intl cuidará de adicionar o prefixo de locale correto.
  return redirect(`${origin}/auth/sign-in?error=link-invalid`);
}
