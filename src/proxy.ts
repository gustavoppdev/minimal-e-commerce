import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

  // Se houver redirect do Supabase, retorna imediatamente
  if (supabaseResponse.headers.get("location")) {
    return supabaseResponse;
  }

  const intlResponse = intlMiddleware(request);

  // Copia cookies atualizados
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
