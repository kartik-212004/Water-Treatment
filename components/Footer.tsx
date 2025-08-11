import React from "react";

import { CheckCircle, Droplets, Shield } from "lucide-react";

export default function Footer() {
  return (
    <div className="mt-12 text-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        +18000 HOMEOWNERS USE 4PATRIOTS FOR THEIR WATER SAFETY
      </p>
      <div className="flex items-center justify-center space-x-8 text-xs text-gray-400 dark:text-gray-600">
        <div className="flex items-center">
          <CheckCircle className="mr-2 h-4 w-4" />
          EPA Certified
        </div>
        <div className="flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          Lab Tested
        </div>
        <div className="flex items-center">
          <Droplets className="mr-2 h-4 w-4" />
          99.9% Effective
        </div>
      </div>
    </div>
  );
}
