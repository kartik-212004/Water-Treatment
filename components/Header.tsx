import Image from "next/image";
import React from "react";

export default function Header() {
  return (
    <div className="mb-16 text-center">
      <div className="mb-8 flex items-center justify-center">
        <Image src="/logo.webp" width={300} height={100} alt="Logo" />
      </div>

      <div className="mb-6">
        <p className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
          WATER QUALITY ANALYSIS
        </p>
        {/* <h1 className="mb-4 text-5xl font-bold leading-tight text-black dark:text-white md:text-6xl">
          Your{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-clip-text text-transparent">
              water
            </span>
          </span>{" "}
          quality report,
        </h1>
        <h2 className="mb-6 text-5xl font-bold leading-tight text-black dark:text-white md:text-6xl">
          but it actually protects.
        </h2> */}
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Get your personalized water contamination analysis in under 2 minutes.
        </p>
      </div>
    </div>
  );
}
