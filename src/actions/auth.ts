"use server";

import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";

type SignUpPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export async function signUp({
  email,
  password,
  firstName,
  lastName,
}: SignUpPayload) {
  const supabase = await createClient();
  const locale = await getLocale();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.code };
  }

  redirect({
    href: "/",
    locale: locale,
  });
}

export async function signIn({
  email,
  password,
}: Omit<SignUpPayload, "firstName" | "lastName" | "fullName">) {
  const supabase = await createClient();
  const locale = await getLocale();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.code };
  }

  redirect({ href: "/", locale });
}
