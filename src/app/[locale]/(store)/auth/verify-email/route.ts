import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const { locale } = await params;

  if (!token) {
    return NextResponse.redirect(
      new URL(`/${locale}/auth/error?reason=no-token`, request.url),
    );
  }

  // 1. Busca usuário com base no token
  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  if (!user) {
    return NextResponse.redirect(
      new URL(`/${locale}/auth/error?reason=invalid-token`, request.url),
    );
  }

  // 2. Verifica se expirou
  if (
    user.verificationTokenExpires &&
    new Date() > user.verificationTokenExpires
  ) {
    return NextResponse.redirect(
      new URL(`/${locale}/auth/error?reason=expired-token`, request.url),
    );
  }

  // 3. Atualiza estado e limpa tokens
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailConfirmed: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  // Redireciona o usuário para a home com um aviso de sucesso
  return NextResponse.redirect(
    new URL(`/${locale}/?confirmed=true`, request.url),
  );
}
