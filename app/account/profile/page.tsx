"use client";

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
    </div>
  );
}

export default PersonalInfo;
