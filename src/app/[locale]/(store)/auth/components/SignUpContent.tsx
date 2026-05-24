"use client";

import { Field, FieldGroup } from "@/components/ui/field";

import FormInput from "./FormInput";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useTranslations } from "next-intl";

const SignUpContent = () => {
  const t = useTranslations("Auth");
  const { form, isSubmitting, onSubmit, serverError } = useAuthForm("sign-up");
  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 gap-20">
      {/* sign in */}
      <div className="space-y-4">
        <h1 className="font-medium font-heading text-2xl">
          {t("SignUp.title")}
        </h1>

        {serverError && (
          <div className="text-white p-1 bg-red-400">{serverError}</div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <Field>
            <FieldGroup className="gap-4">
              <FormInput
                label={t("Form.firstNameLabel")}
                name="firstName"
                type="text"
                control={form.control}
              />
              <FormInput
                label={t("Form.lastNameLabel")}
                name="lastName"
                type="text"
                control={form.control}
              />
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
              <FormInput
                label={t("Form.confirmPasswordLabel")}
                name="confirmPassword"
                type="password"
                control={form.control}
              />

              <div className="flex items-center gap-2 mt-4">
                <Button type="submit" size={"lg"} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="animate-spin size-5" />
                  ) : (
                    t("SignUp.submitBtn")
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
          {t("SignIn.title")}
        </h2>
        <p>{t("SignIn.description")}</p>
        <Button size={"lg"} className="mt-4">
          <Link href={"/auth/sign-in"}>{t("SignIn.submitBtn")}</Link>
        </Button>
      </div>
    </main>
  );
};

export default SignUpContent;
