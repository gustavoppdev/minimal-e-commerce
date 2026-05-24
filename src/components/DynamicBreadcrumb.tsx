import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Link } from "@/i18n/navigation";

export type BreadcrumbStep = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbStep[];
};

const DynamicBreadcrumb = ({ items }: Props) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={item.label}>
              <BreadcrumbItem className="text-[13px]">
                {isLast ? (
                  // Último item renderiza como a página atual (texto plano)
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  // Itens anteriores renderizam como links navegáveis
                  <Link href={item.href || "#"}>{item.label}</Link>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DynamicBreadcrumb;
