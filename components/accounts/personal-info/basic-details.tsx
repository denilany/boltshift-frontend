"use client";

import { useEffect, useState } from "react";

import { AccountSocialButtons } from "@/app/account/profile/account-social-buttons";
import { SectionHeadings } from "@/components/accounts/section-headings";
import { FormInputField } from "@/components/checkout/form-input-field";
import { DatePickerField } from "@/app/account/profile/date-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { SelectList } from "@/components/dropdown/select";
import {
  handleAuthError,
  getCurrentUser,
  updateProfile,
} from "@/lib/auth/client";
import { profileSchema } from "@/lib/auth/schemas";
import type { AuthGender } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

type ProfileFieldErrors = Partial<
  Record<
    | "firstName"
    | "lastName"
    | "email"
    | "phoneNumber"
    | "dateOfBirth"
    | "gender",
    string
  >
>;

const genderOptions: Array<{ label: string; value: AuthGender }> = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

export function BasicDetails() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<AuthGender | "">("");
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const user = await getCurrentUser();

        if (cancelled || !user) {
          return;
        }

        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
        setEmail(user.email ?? "");
        setAvatar(user.avatar ?? "");
        setPhoneNumber(user.phoneNumber ?? "");
        setDateOfBirth(user.dateOfBirth?.slice(0, 10) ?? "");
        setGender(user.gender ?? "");
      } catch (error) {
        const normalized = handleAuthError(error);
        if (!cancelled) {
          setLoadError(normalized.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const applyValidation = () => {
    const result = profileSchema.safeParse({
      firstName,
      lastName,
      email,
      avatar,
      phoneNumber,
      dateOfBirth,
      gender,
    });

    if (result.success) {
      setFieldErrors({});
      return result.data;
    }

    const nextErrors: ProfileFieldErrors = {};

    for (const issue of result.error.issues) {
      const fieldName = issue.path[0] as keyof ProfileFieldErrors | undefined;

      if (fieldName && !nextErrors[fieldName]) {
        nextErrors[fieldName] = issue.message;
      }
    }

    setFieldErrors(nextErrors);
    return null;
  };

  const selectedGenderLabel =
    genderOptions.find((option) => option.value === gender)?.label ?? "";

  return (
    <div className="flex w-full flex-col gap-8 py-4">
      <SectionHeadings
        icon="/account/file-02.png"
        title="Basic Details"
        alt="Gear icon"
      />

      <div className="py-2 flex flex-col gap-5">
        <p className="font-semibold">Connected Account:</p>

        <AccountSocialButtons />
      </div>

      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-xs font-medium w-full max-w-248"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoadError(null);
          setSaveError(null);

          const values = applyValidation();

          if (!values) {
            return;
          }

          setIsSaving(true);

          try {
            await updateProfile({
              ...values,
              avatar,
            });
          } catch (error) {
            const normalized = handleAuthError(error);

            if (normalized.fieldErrors) {
              const nextErrors: ProfileFieldErrors = {};

              for (const [key, messages] of Object.entries(
                normalized.fieldErrors,
              )) {
                if (messages?.[0]) {
                  nextErrors[key as keyof ProfileFieldErrors] = messages[0];
                }
              }

              setFieldErrors((current) => ({ ...current, ...nextErrors }));
            }

            setSaveError(normalized.message);
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <FormInputField
          id="first-name"
          label="First Name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          error={fieldErrors.firstName}
          className="h-auto sm:h-13 max-w-120"
        />

        <FormInputField
          id="last-name"
          label="Last Name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          error={fieldErrors.lastName}
          className="h-auto sm:h-13 max-w-120"
        />

        <FormInputField
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          className="h-auto sm:h-13 max-w-120"
        />

        <div className="w-full max-w-120 flex flex-col gap-1 text-muted-foreground text-xs font-medium">
          <Label htmlFor="phone">Phone Number</Label>
          <PhoneInput
            id="phone"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            className={cn(
              "hover:ring-1 hover:ring-ring hover:ring-offset-2",
              fieldErrors.phoneNumber && "border-destructive",
            )}
          />
          {fieldErrors.phoneNumber ? (
            <p className="text-xs text-destructive">
              {fieldErrors.phoneNumber}
            </p>
          ) : null}
        </div>

        <div className="w-full max-w-120 flex flex-col gap-1 text-muted-foreground text-xs font-medium">
          <Label htmlFor="birthday">Birthday</Label>
          <DatePickerField
            id="birthday"
            value={dateOfBirth}
            onChange={setDateOfBirth}
            aria-invalid={Boolean(fieldErrors.dateOfBirth)}
          />
          {fieldErrors.dateOfBirth ? (
            <p className="text-xs text-destructive">
              {fieldErrors.dateOfBirth}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1 text-muted-foreground text-xs font-medium">
          <Label htmlFor="sex">Sex</Label>
          <SelectList
            list={genderOptions.map((option) => option.label)}
            value={selectedGenderLabel}
            onValueChange={(value) => {
              const selected = genderOptions.find(
                (option) => option.label === value,
              );
              setGender(selected?.value ?? "");
            }}
          />
          {fieldErrors.gender ? (
            <p className="text-xs text-destructive">{fieldErrors.gender}</p>
          ) : null}
        </div>

        <div className="sm:col-span-2 flex flex-col gap-3">
          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : null}
          {saveError ? (
            <p className="text-sm text-destructive">{saveError}</p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
