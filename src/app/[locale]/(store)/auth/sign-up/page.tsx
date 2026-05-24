import { useTranslations } from "next-intl";
import SignUpContent from "../components/SignUpContent";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";

const SignUpPage = () => {
  const t = useTranslations("Auth.SignUp");

  const breadcrumbItems = [
    { label: t("breadcrumb.home"), href: "/" },
    { label: t("breadcrumb.auth"), href: "/auth/sign-up" },
    { label: t("breadcrumb.signUp") },
  ];

  return (
    <div>
      <div className="py-6 border-t text-center">Simulando hero</div>

      <section className="section-container py-4 space-y-10">
        <DynamicBreadcrumb items={breadcrumbItems} />
        <SignUpContent />
      </section>

      <div className="py-6 border-t text-center">Simulando footer</div>
    </div>
  );
};

export default SignUpPage;
