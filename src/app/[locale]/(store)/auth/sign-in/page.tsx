import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { useTranslations } from "next-intl";
import SignInContent from "../components/SignInContent";

const SignInPage = () => {
  const t = useTranslations("Auth.SignIn");

  const breadcrumbItems = [
    { label: t("breadcrumb.home"), href: "/" },
    { label: t("breadcrumb.auth"), href: "/auth/sign-in" },
    { label: t("breadcrumb.signIn") },
  ];

  return (
    <div className="">
      <div className="py-6 border-b text-center">Simulando hero</div>

      <section className="section-container py-4 space-y-10">
        <DynamicBreadcrumb items={breadcrumbItems} />
        <SignInContent />
      </section>

      <div className="py-6 border-t text-center">Simulando footer</div>
    </div>
  );
};

export default SignInPage;
