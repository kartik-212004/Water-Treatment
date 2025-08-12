import Image from "next/image";
import React from "react";

export default function Header() {
  return (
    <div className="relative mb-16 text-center">
      <div className="sticky mb-8 flex items-center justify-center">
        <Image src="/logo.webp" width={300} height={100} alt="Logo" />
      </div>

      <div className="mb-6">
        <p className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-600">
          WATER QUALITY ANALYSIS
        </p>

        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          What's Really In Your Tap Water? Get Your FREE Personalized Water Report.
        </p>
      </div>
    </div>
  );
}
