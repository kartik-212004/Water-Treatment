import React from "react";

import { CheckCircle, Droplets, Shield } from "lucide-react";

export default function Footer() {
  return (
    <div className="bg-[#101935] px-4 py-8 text-center text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <p className="text-xs font-medium uppercase tracking-wider sm:text-sm md:text-base">
          +18000 HOMEOWNERS USE 4PATRIOTS FOR THEIR WATER SAFETY
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:gap-6 sm:text-sm md:gap-8">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
            <span>EPA Certified</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
            <span>Lab Tested</span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
            <span>99.9% Effective</span>
          </div>
        </div>
      </div>
    </div>
  );
}
