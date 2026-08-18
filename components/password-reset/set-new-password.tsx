"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  CircleCheckBig,
  CircleX,
  RectangleEllipsis,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordResetFooter } from "@/components/password-reset/password-reset-footer";
import { PasswordResetProgress } from "@/components/password-reset/password-reset-progress";

type SetNewPasswordProps = {
  onSubmit?: (password: string, confirmPassword: string) => void | Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string;
};

const passwordRequirementDefinitions = [
  {
    label: "Must be at least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    label: "Must be a combination of uppercase & lowercase letters",
    test: (password: string) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    label: "Must include numbers",
    test: (password: string) => /\d/.test(password),
  },
  {
    label: "Must contain at least one special character (e.g., !, @, #, $, %)",
    test: (password: string) => /[!@#$%^&*(),.?":{}|<>_\-=[\]\\;/`~+]/.test(password),
  },
] as const;

export function SetNewPassword({
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: SetNewPasswordProps = {}) {
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");

  const passwordRequirements = useMemo(
    () =>
      passwordRequirementDefinitions.map((requirement) => ({
        label: requirement.label,
        met: requirement.test(password),
      })),
    [password],
  );

  const passwordMatches = retypePassword.length > 0 && password === retypePassword;
  const passwordRequirementsMet = passwordRequirements.every(
    (requirement) => requirement.met,
  );
  const canSubmit = passwordRequirementsMet && passwordMatches;

  return (
    <section className="m-auto flex max-w-84 flex-col gap-20 text-foreground sm:w-84">
      <Card className="gap-8 border-0 bg-transparent p-0 shadow-none">
        <CardHeader className="items-center justify-center gap-6 p-0 text-center">
          <div className="m-auto flex h-14 w-14 items-center justify-center rounded-full text-primary">
            <RectangleEllipsis size={28} />
          </div>

          <div className="grid gap-3">
            <CardTitle className="text-3xl font-semibold">
              Set new password
            </CardTitle>

            <CardDescription className="text-base">
              Your new password must be different to previously used passwords.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <form
            className="grid gap-6"
            onSubmit={(event) => {
              event.preventDefault();

              if (!canSubmit) {
                return;
              }

              void onSubmit?.(password, retypePassword);
            }}
          >
            <div className="grid gap-1">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="retype-password" className="text-xs font-medium">
                Retype Password
              </Label>
              <Input
                id="retype-password"
                name="retype-password"
                type="password"
                required
                value={retypePassword}
                onChange={(event) => setRetypePassword(event.target.value)}
                autoComplete="new-password"
                aria-invalid={retypePassword.length > 0 && !passwordMatches}
              />
              {retypePassword.length > 0 ? (
                <div
                  className={
                    passwordMatches
                      ? "flex items-center gap-2 text-xs text-emerald-600"
                      : "flex items-center gap-2 text-xs text-destructive"
                  }
                >
                  {passwordMatches ? (
                    <CircleCheckBig
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <CircleX className="size-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>
                    {passwordMatches
                      ? "Passwords match."
                      : "Passwords do not match."}
                  </span>
                </div>
              ) : null}
            </div>

            <ul className="grid gap-3">
              {passwordRequirements.map((requirement) => {
                const Icon = requirement.met ? CheckCircle2 : Circle;

                return (
                  <li
                    key={requirement.label}
                    className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
                  >
                    <Icon
                      className={
                        requirement.met
                          ? "size-5 shrink-0 text-emerald-600"
                          : "size-5 shrink-0 text-muted-foreground/60"
                      }
                      aria-hidden="true"
                    />
                    <span className="min-w-0">{requirement.label}</span>
                  </li>
                );
              })}
            </ul>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset password"}
            </Button>

            {errorMessage ? (
              <p className="text-center text-xs text-destructive">
                {errorMessage}
              </p>
            ) : null}
          </form>
        </CardContent>

        <Button
          variant="ghost"
          asChild
          className="justify-center text-sm font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <Link href="/sign-in" transitionTypes={["cross-fade"]}>
            <ArrowLeft className="size-5" />
            Back to log in
          </Link>
        </Button>
      </Card>

      <PasswordResetProgress step={3} />

      <PasswordResetFooter className="mt-auto px-10" />
    </section>
  );
}
