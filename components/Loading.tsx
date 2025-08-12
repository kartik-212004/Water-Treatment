import React from "react";

export default function Loading({ zipcode }: { zipcode: string | null }) {
  const zipCode = zipcode;
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-2xl space-y-6 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-blue-200"></div>
            <div className="absolute left-0 top-0 h-20 w-20 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Analyzing Water Quality Data{zipCode ? ` for ${zipCode}` : ""}...
          </h2>
          <p className="text-lg leading-relaxed text-gray-700">
            We're cross-referencing millions of records from local, state, and federal sources and comparing
            them against our certified lab results to build your custom report. This may take a moment.
          </p>
        </div>
      </div>
    </div>
  );
}
