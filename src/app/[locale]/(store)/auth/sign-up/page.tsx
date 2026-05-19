import React from "react";
import SignUpContent from "../components/SignUpContent";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";

const breadcrumbItems = [
  { label: "Início", href: "/" },
  { label: "Autenticação", href: "/auth/sign-in" },
  { label: "Cadastro" },
];

const SignUpPage = () => {
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
