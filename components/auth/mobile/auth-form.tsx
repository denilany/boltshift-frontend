"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";

import { Logomark } from "@/components/brand/logomark";
import { Logotype } from "@/components/brand/logotype";
import { SocialAuthButton } from "@/components/checkout/SocialAuthButton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { handleAuthError, startSocialAuth } from "@/lib/auth/client";
import { showSonnerMessage } from "@/components/alert/alert";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  className?: string;
  mainClassName?: string;
};

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  className,
  mainClassName,
}: AuthLayoutProps) {
  return (
    <main
      className={cn(
        "min-h-screen w-full bg-background px-12 py-12",
        mainClassName,
      )}
    >
      <section
        className={cn(
          "mx-auto flex w-full max-w-84 flex-col items-center gap-10",
          className,
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <Logomark className="size-11 md:size-14" aria-hidden="true" />
          <Logotype
            className="h-5.5 w-28.5 md:h-[27.8px] md:w-[144.94px]"
            aria-hidden="true"
          />
          <span className="sr-only">Boltshift home</span>
        </Link>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 text-center">
            <h1 className="text-3xl font-semibold tracking-normal text-foreground">
              {title}
            </h1>
            <p className="text-base text-muted-foreground">{subtitle}</p>
          </div>

          <div className="w-full">{children}</div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {footer}
        </div>
      </section>
    </main>
  );
}

type AuthFieldProps = {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  autoComplete?: string;
  name?: string;
  required?: boolean;
  error?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  inputClassName?: string;
};

export function AuthField({
  id,
  label,
  type = "text",
  placeholder,
  defaultValue,
  value,
  autoComplete,
  name,
  required,
  error,
  onChange,
  onBlur,
  inputClassName,
}: AuthFieldProps) {
  return (
    <Field className="gap-1">
      <FieldLabel htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </FieldLabel>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...(value === undefined ? { defaultValue } : { value })}
        autoComplete={autoComplete}
        name={name}
        required={required}
        aria-invalid={Boolean(error)}
        onChange={onChange}
        onBlur={onBlur}
        className={cn(inputClassName)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </Field>
  );
}

type PasswordFieldProps = {
  id?: string;
  label?: string;
  autoComplete?: string;
  name?: string;
  required?: boolean;
  value?: string;
  error?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
};

export function PasswordField({
  id = "password",
  label = "Password",
  autoComplete,
  name = "password",
  required,
  value,
  error,
  onChange,
  onBlur,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          name={name}
          required={required}
          {...(value === undefined ? {} : { value })}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-foreground hover:bg-transparent"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <Eye className="size-5" aria-hidden="true" />
            ) : (
              <EyeOff className="size-5" aria-hidden="true" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </Field>
  );
}

export function AuthSocialButtons() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <SocialAuthButton
        provider="Google"
        icon={<FaGoogle className="size-6 text-primary" />}
        showLabel={false}
        className="h-12 min-w-0 rounded-lg bg-background p-0 text-muted-foreground shadow-xs hover:bg-background"
        onClick={() =>
          void startSocialAuth("google").catch((error) => {
            const normalized = handleAuthError(error);
            showSonnerMessage({
              variant: "delete",
              title: "Google sign-in unavailable",
              description: normalized.message,
            });
          })
        }
      />
      <SocialAuthButton
        provider="Apple ID"
        icon={<FaApple className="size-6 text-card" />}
        showLabel={false}
        className="h-12 min-w-0 rounded-lg bg-foreground p-0 text-card hover:bg-foreground hover:text-card"
        onClick={() =>
          void startSocialAuth("apple").catch((error) => {
            const normalized = handleAuthError(error);
            showSonnerMessage({
              variant: "delete",
              title: "Apple sign-in unavailable",
              description: normalized.message,
            });
          })
        }
      />
      <SocialAuthButton
        provider="Facebook"
        icon={<FaFacebook className="size-6 text-card" />}
        showLabel={false}
        className="h-12 min-w-0 rounded-lg border-[#1877F2] bg-[#1877F2] p-0 text-card hover:bg-[#1877F2] hover:text-card"
        onClick={() =>
          void startSocialAuth("facebook").catch((error) => {
            const normalized = handleAuthError(error);
            showSonnerMessage({
              variant: "delete",
              title: "Facebook sign-in unavailable",
              description: normalized.message,
            });
          })
        }
      />
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-sm text-muted-foreground">Or Continue With</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function CheckedAgreement({
  id,
  children,
  checkboxPosition = "start",
  defaultChecked = true,
  name = id,
  required,
  checked,
  onCheckedChange,
}: {
  id: string;
  children: ReactNode;
  checkboxPosition?: "start" | "end";
  defaultChecked?: boolean;
  name?: string;
  required?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2",
        checkboxPosition === "end" && "flex-row-reverse justify-between",
      )}
    >
      <Checkbox
        id={id}
        name={name}
        required={required}
        {...(checked === undefined
          ? { defaultChecked }
          : { checked, onCheckedChange })}
        className="mt-0.5 size-4"
      />
      <Label
        htmlFor={id}
        className="block text-xs leading-5 text-muted-foreground"
      >
        {children}
      </Label>
    </div>
  );
}
