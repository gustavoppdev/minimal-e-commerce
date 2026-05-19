import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import SignInContent from "../components/SignInContent";

const breadcrumbItems = [
  { label: "Início", href: "/" },
  { label: "Autenticação", href: "/auth/sign-in" },
  { label: "Login" },
];

const SignInPage = () => {
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
