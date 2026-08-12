"use client";

import { Mail } from "lucide-react";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";

import { handleAuthError, startSocialAuth } from "@/lib/auth/client";
import { SocialAuthButton } from "@/components/checkout/SocialAuthButton";
import { showSonnerMessage } from "@/components/alert/alert";

export function AccountSocialButtons() {
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:max-w-none max-w-120">
      <SocialAuthButton
        provider="Google"
        icon={<FaGoogle className="text-primary size-6" />}
        className="min-w-0 w-full sm:w-auto sm:min-w-35 bg-background text-muted-foreground hover:bg-transparent"
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
        icon={<FaApple className="text-card size-6" />}
        className="min-w-0 w-full sm:w-auto sm:min-w-35 bg-foreground text-card hover:bg-foreground hover:text-card"
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
        icon={<FaFacebook className="text-card size-6" />}
        className="min-w-0 w-full sm:w-auto sm:min-w-35 bg-[#1877F2] text-card hover:bg-[#1877F2] hover:text-card"
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

      <SocialAuthButton
        provider="Email"
        icon={<Mail className="text-card size-6" />}
        className="min-w-0 w-full sm:w-auto sm:min-w-35 bg-[#DA154D] text-card hover:bg-[#DA154D] hover:text-card"
        onClick={() =>
          showSonnerMessage({
            variant: "delete",
            title: "Email connection unavailable",
            description: "Email-based social sign-in is not configured yet.",
          })
        }
      />
    </div>
  );
}
