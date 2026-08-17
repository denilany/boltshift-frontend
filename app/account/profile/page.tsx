"use client";

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashedSeparator } from "@/components/separator/dashed-separator";
import { BasicDetails } from "@/components/accounts/personal-info/basic-details";
import { Address } from "@/components/accounts/personal-info/address";
import { Password } from "@/components/accounts/personal-info/password";

export function PersonalInfo() {
  return (
    <div className="flex flex-col gap-8">
      <BasicDetails />
      <DashedSeparator />
      <Address />
      <DashedSeparator />
      <Password />

      <div className="border-t py-6 flex justify-end items-center">
        <Button size="lg" className="w-full sm:w-auto px-4.5">
          <Save />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default PersonalInfo;
