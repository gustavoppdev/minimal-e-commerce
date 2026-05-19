import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(
  request: NextRequest,
  response: NextResponse = NextResponse.next({ request }),
) {
  let supabaseResponse = response;

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  // const { data } = await supabase.auth.getClaims();

  // const user = data?.claims;

  // Extrair o locale atual da URL se houver, para preservar no redirecionamento
  // const pathname = request.nextUrl.pathname;
  // const isAuthRoute = pathname.includes("/login") || pathname.includes("/register");

  // if (!user && !isAuthRoute) {
  // no user, potentially respond by redirecting the user to the login page
  // const url = request.nextUrl.clone();
  // Preserva o locale se existir no início do path (ex: /pt/login)
  // const localeMatch = pathname.match(/^\/([a-z]{2})\//);
  // const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
  // url.pathname = `${localePrefix}/login`;
  // return NextResponse.redirect(url);
  // }

  return supabaseResponse;
}
