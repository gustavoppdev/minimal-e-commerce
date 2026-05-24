import { signIn, signUp } from "@/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas Zod de validação
// ---------------------------------------------------------------------------

/**
 * Schema de login (sign-in): apenas e-mail e senha.
 */
function buildSignInSchema(t: ReturnType<typeof useTranslations<"Auth.Errors">>) {
  return z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, { message: t("emailRequired") })
      .max(255, { message: t("maxLengthEmail") })
      .pipe(z.email({ message: t("invalidEmail") })),
    password: z.string().min(1, { message: t("passwordRequired") }),
  });
}

/**
 * Schema de cadastro (sign-up): estende o de login com nome, confirmação de
 * senha e validação cruzada.
 */
function buildSignUpSchema(t: ReturnType<typeof useTranslations<"Auth.Errors">>) {
  const nameField = z
    .string()
    .trim()
    .min(2, { message: t("minLengthName") })
    .max(100, { message: t("maxLengthName") })
    .regex(/^[\p{Letter}\s'-]+$/u, { message: t("invalidNameCharacters") });

  return z
    .object({
      firstName: nameField,
      lastName: nameField,
      email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, { message: t("emailRequired") })
        .max(255, { message: t("maxLengthEmail") })
        .pipe(z.email({ message: t("invalidEmail") })),
      password: z
        .string()
        .min(6, { message: t("passwordTooShort") })
        .max(100, { message: t("passwordTooLong") })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
          message: t("passwordComplexity"),
        }),
      confirmPassword: z
        .string()
        .min(1, { message: t("confirmPasswordRequired") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });
}

// ---------------------------------------------------------------------------
// Tipo unificado dos campos do formulário
// Usamos o super-conjunto (sign-up) para cobrir ambos os casos no useForm.
// Os campos opcionais (firstName, etc.) simplesmente não são exibidos no sign-in.
// ---------------------------------------------------------------------------
type FormValues = {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuthForm(type: "sign-in" | "sign-up") {
  const t = useTranslations("Auth.Errors");
  const tServer = useTranslations("Auth.Errors.Server");
  const [serverError, setServerError] = useState<string | null>(null);

  // Seleciona o schema correto de acordo com o tipo de formulário
  const formSchema =
    type === "sign-up" ? buildSignUpSchema(t) : buildSignInSchema(t);

  const form = useForm<FormValues>({
    // O cast "as any" é necessário porque zodResolver infere tipos diferentes
    // para signInSchema vs signUpSchema (refine muda o tipo interno do Zod).
    // Na prática, o resolver usa o schema passado, então a validação é correta.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormValues) => {
    setServerError(null);

    const result =
      type === "sign-up"
        ? await signUp({
            email: data.email,
            password: data.password,
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
          })
        : await signIn({ email: data.email, password: data.password });

    // Se a action retornou (em vez de redirecionar), ocorreu um erro
    if (result?.error) {
      const errorMessage = resolveServerError(result.error, tServer);
      setServerError(errorMessage);
    }
  };

  return { form, onSubmit, serverError, isSubmitting };
}

// ---------------------------------------------------------------------------
// Helper de mapeamento de erros do servidor
// ---------------------------------------------------------------------------

// Mapeamento de códigos de erro do Supabase para as chaves de tradução
const SERVER_ERROR_MAP: Record<string, string> = {
  invalid_credentials: "invalid_credentials",
  user_already_exists: "user_already_exists",
  email_exists: "user_already_exists",
  over_email_send_rate_limit: "over_email_send_rate_limit",
  weak_password: "weak_password",
};

function resolveServerError(
  code: string,
  tServer: ReturnType<typeof useTranslations<"Auth.Errors.Server">>,
): string {
  const key = SERVER_ERROR_MAP[code];
  // O cast é necessário pois o mapeamento é dinâmico (string → chave válida do namespace)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return key ? tServer(key as any) : tServer("default");
}
