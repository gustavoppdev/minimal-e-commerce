"use client";

// React
import { useState } from "react";

// Next.js & Next-Intl
import { useTranslations } from "next-intl";

// Components
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// Lucide Icons
import { Eye, EyeOff } from "lucide-react";

// React Hook Form
import { Control, Controller, FieldValues, Path } from "react-hook-form";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  type: React.InputHTMLAttributes<HTMLInputElement>["type"];
};

const FormInput = <T extends FieldValues>({
  label,
  type,
  placeholder,
  name,
  control,
}: Props<T>) => {
  const t = useTranslations("Auth.Form");
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <div className="relative">
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              type={showPassword && type === "password" ? "text" : type}
              className="rounded-none h-10 border-neutral-300"
              placeholder={placeholder}
            />
            {type === "password" && (
              <button
                type="button"
                onClick={handleShowPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-2"
              >
                {showPassword ? (
                  <EyeOff
                    className="w-[18px] h-[18px]"
                    strokeWidth={1.5}
                    aria-label={t("showPasswordAlt")}
                  />
                ) : (
                  <Eye
                    className="w-[18px] h-[18px]"
                    strokeWidth={1.5}
                    aria-label={t("hidePasswordAlt")}
                  />
                )}
              </button>
            )}
          </div>
          {fieldState.invalid && (
            <FieldError className="text-[13px]" errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
};

export default FormInput;
