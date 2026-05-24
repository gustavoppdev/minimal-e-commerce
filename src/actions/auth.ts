"use server";

import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Instância do cliente de e-mail (criada uma única vez no módulo)
// ---------------------------------------------------------------------------
const resend = new Resend(process.env.RESEND_API_KEY);

// ---------------------------------------------------------------------------
// Remetente centralizado — mude apenas aqui se o domínio mudar
// ---------------------------------------------------------------------------
const EMAIL_FROM = "Minimal E-commerce <no-reply@gustavopp.dev.br>";

// ---------------------------------------------------------------------------
// Tipagem dos payloads
// ---------------------------------------------------------------------------
type SignUpPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type SignInPayload = Pick<SignUpPayload, "email" | "password">;

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Gera um token UUID aleatório e a sua data de expiração (padrão: 24h).
 */
function generateVerificationToken(hoursValid = 24) {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + hoursValid);
  return { token, expiresAt };
}

/**
 * Envia o e-mail de confirmação de cadastro.
 * Centralizado aqui para que signUp e resendVerificationEmail usem o mesmo template.
 */
async function sendVerificationEmail({
  to,
  firstName,
  confirmationLink,
  subject = "Confirme seu E-mail 🚀",
}: {
  to: string;
  firstName: string;
  confirmationLink: string;
  subject?: string;
}) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Bem-vindo, ${firstName}! 🎉</h2>
        <p>
          Obrigado por se cadastrar na nossa loja. Para desbloquear todas as
          funções e começar a fazer compras, confirme seu e-mail clicando no
          link abaixo:
        </p>
        <a
          href="${confirmationLink}"
          style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;"
        >
          Confirmar meu E-mail
        </a>
        <p>Este link expira em 24 horas.</p>
        <p style="color: #999; font-size: 12px;">
          Se você não criou uma conta, pode ignorar este e-mail com segurança.
        </p>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// Actions públicas
// ---------------------------------------------------------------------------

/**
 * Cadastra um novo usuário no Supabase, salva o token de verificação no banco
 * e envia o e-mail de confirmação via Resend.
 * Após o cadastro, o usuário já fica logado e é redirecionado para a home.
 */
export async function signUp({
  email,
  password,
  firstName,
  lastName,
}: SignUpPayload) {
  const supabase = await createClient();
  const locale = await getLocale();

  // 1. Cria o usuário no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
      },
    },
  });

  if (error || !data.user) {
    return { error: error?.code ?? "sign_up_failed" };
  }

  // 2. Gera token de confirmação e persiste no banco
  //    (O usuário já foi inserido na tabela pública pelo trigger do Supabase)
  const { token, expiresAt } = generateVerificationToken();

  await prisma.user.update({
    where: { id: data.user.id },
    data: {
      verificationToken: token,
      verificationTokenExpires: expiresAt,
    },
  });

  // 3. Envia o e-mail de verificação (falha silenciosa — não quebra o cadastro)
  const confirmationLink = `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/auth/verify-email?token=${token}`;

  try {
    await sendVerificationEmail({ to: email, firstName, confirmationLink });
  } catch (emailError) {
    console.error("Erro ao enviar e-mail de confirmação:", emailError);
  }

  // 4. Usuário logado → redireciona para a home
  redirect({ href: "/", locale });
}

/**
 * Autentica um usuário existente via e-mail e senha.
 */
export async function signIn({ email, password }: SignInPayload) {
  const supabase = await createClient();
  const locale = await getLocale();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.code };
  }

  redirect({ href: "/", locale });
}

/**
 * Desloga o usuário atual e redireciona para a página de login.
 * Pode ser chamado de Server Components, Server Actions ou Route Handlers.
 */
export async function signOut() {
  const supabase = await createClient();
  const locale = await getLocale();

  await supabase.auth.signOut();

  redirect({ href: "/auth/sign-in", locale });
}

/**
 * Reenvia o e-mail de verificação para um usuário que ainda não confirmou
 * o seu endereço de e-mail. Gera um novo token e invalida o anterior.
 */
export async function resendVerificationEmail(userId: string) {
  const locale = await getLocale();

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.isEmailConfirmed) {
    return { success: false };
  }

  const { token, expiresAt } = generateVerificationToken();

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationToken: token,
      verificationTokenExpires: expiresAt,
    },
  });

  const confirmationLink = `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/auth/verify-email?token=${token}`;

  try {
    await sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      confirmationLink,
      subject: "Novo Link de Confirmação 🚀",
    });
  } catch (emailError) {
    console.error("Erro ao reenviar e-mail de confirmação:", emailError);
    return { success: false };
  }

  return { success: true };
}
