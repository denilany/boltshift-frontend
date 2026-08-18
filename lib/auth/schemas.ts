import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/\d/, "Password must include a number.")
  .regex(
    /[!@#$%^&*(),.?":{}|<>_\-=[\]\\;/`~+]/,
    "Password must include a special character.",
  );

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required.")
  .refine(
    (value) => /^\+?[1-9]\d{7,14}$/.test(value.replace(/\s+/g, "")),
    "Enter a valid phone number in international format.",
  );

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      const parsed = new Date(value);

      return !Number.isNaN(parsed.getTime());
    },
    { message: "Enter a valid date of birth." },
  );

const authGenderSchema = z.enum(["male", "female", "other"]);

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.string().trim().email("Enter a valid email address."),
    phoneNumber: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
    termsAgreement: z
      .boolean()
      .refine((value) => value, "You must agree to the terms."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  phoneNumber: phoneSchema,
  dateOfBirth: optionalDateSchema,
  gender: authGenderSchema.optional().or(z.literal("")),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;

export function getPasswordRequirements(password: string) {
  return [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: "Includes a lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "Includes an uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Includes a number",
      met: /\d/.test(password),
    },
    {
      label: "Includes a special character",
      met: /[!@#$%^&*(),.?":{}|<>_\-=[\]\\;/`~+]/.test(password),
    },
  ] as const;
}
