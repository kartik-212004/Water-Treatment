import Image from "next/image";
import React from "react";

export default function Header() {
  return (
    <section className="relative mx-auto max-w-2xl border-b border-gray-200 bg-[#101935] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center">
          <img src="/logo.webp" alt="4Patriots" className="h-12 w-auto" />
        </div>
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight md:text-4xl">
          Get Your Personalized Water Quality Report
        </h1>
        <p className="mt-4 max-w-xl text-sm font-medium tracking-wide text-white/70">
          Enter your zip code and contact details to uncover priority contaminants in your local water and see
          how Patriot Pure® filtration helps protect your home.
        </p>
      </div>
    </section>
  );
}
