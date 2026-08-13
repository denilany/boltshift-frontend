import type { ChangeEventHandler } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormInputFieldProps = {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  error?: string | null;
  className?: string;
  inputClassName?: string;
};

export function FormInputField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  className,
  inputClassName,
}: FormInputFieldProps) {
  return (
    <div
      className={cn(
        "w-full max-w-104 flex flex-col gap-1 text-muted-foreground text-xs font-medium",
        className,
      )}
    >
      <Label htmlFor={id}>{label}</Label>

      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={cn(
          "hover:ring-1 hover:ring-ring hover:ring-offset-2",
          inputClassName,
        )}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
