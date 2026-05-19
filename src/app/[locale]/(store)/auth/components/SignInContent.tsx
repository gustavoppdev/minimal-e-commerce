"use client";

import { Field, FieldGroup } from "@/components/ui/field";
import { useAuthForm } from "@/hooks/useAuthForm";
import FormInput from "./FormInput";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const SignInContent = () => {
  const t = useTranslations("Auth");
  const { form, isSubmitting, onSubmit, serverError } = useAuthForm("sign-in");

  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 gap-20">
      {/* sign in */}
      <div className="space-y-4">
        <h1 className="font-medium font-heading text-2xl">
          {t("SignIn.title")}
        </h1>

        {serverError && (
          <div className="text-white p-1 bg-red-400">{serverError}</div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <Field>
            <FieldGroup className="gap-4">
              <FormInput
                label={t("Form.emailLabel")}
                name="email"
                type="email"
                control={form.control}
              />

              <FormInput
                label={t("Form.passwordLabel")}
                name="password"
                type="password"
                control={form.control}
              />

              <Link
                href={"/auth/forgot-password"}
                className="text-[13px] pb-1 pr-2 w-fit -mt-2 text-black/80"
              >
                {t("Form.forgotPassword")}
              </Link>

              <div className="flex items-center gap-2 mt-4">
                <Button type="submit" size={"lg"} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="animate-spin size-5" />
                  ) : (
                    t("SignIn.submitBtn")
                  )}
                </Button>

                <Link href={"/"} className="text-sm">
                  {t("Form.orReturnToStore")}
                </Link>
              </div>
            </FieldGroup>
          </Field>
        </form>
      </div>

      {/* sign up cta */}
      <div className="space-y-4">
        <h2 className="font-medium font-heading text-2xl">
          {t("SignUp.title")}
        </h2>
        <p>{t("SignUp.description")}</p>
        <Button size={"lg"} className="mt-4">
          <Link href={"/auth/sign-up"}>{t("SignUp.submitBtn")}</Link>
        </Button>
      </div>
    </main>
  );
};

export default SignInContent;
