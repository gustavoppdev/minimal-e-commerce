import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Atualiza a sessão do Supabase no middleware.
 *
 * Esta função deve ser chamada no início de cada request para garantir que
 * os cookies de sessão (access_token + refresh_token) sejam renovados antes
 * de qualquer Server Component ou Server Action tentar ler o usuário.
 *
 * Sem isso, a sessão expira e o usuário é deslogado aleatoriamente.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse = NextResponse.next({ request }),
) {
  let supabaseResponse = response;

  // IMPORTANTE: Não coloque nenhum código entre createServerClient e
  // supabase.auth.getUser(). Qualquer coisa aqui pode causar bugs sutis
  // de sessão onde o usuário é deslogado de forma inesperada.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // 1. Atualiza os cookies no request (para Server Components lerem neste ciclo)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          // 2. Cria uma nova response com os cookies atualizados
          supabaseResponse = NextResponse.next({ request });

          // 3. Propaga os cookies com as opções corretas (HttpOnly, SameSite, etc.)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );

          // 4. Propaga quaisquer headers adicionais (ex: Set-Cookie do Supabase)
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Renova a sessão — este await é obrigatório para que os cookies expirados
  // sejam atualizados antes da resposta ser enviada ao navegador.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Regras de redirecionamento

  const url = request.nextUrl.clone();

  // Se usuário estiver logado e tentar acessar página de autenticação
  if (
    user &&
    url.pathname.includes("/auth/") &&
    !url.pathname.includes("/auth/callback")
  ) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
