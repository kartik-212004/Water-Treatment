import React from 'react'
import { Droplets } from 'lucide-react'

export default function Header() {
  return (
      <div className="mb-16 text-center">
              <div className="mb-8 flex items-center justify-center">
                <Droplets className="mr-3 h-8 w-8 text-black dark:text-white" />
                <span className="text-2xl font-bold text-black dark:text-white">4Patriots</span>
              </div>

              <div className="mb-6">
                <p className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  WATER QUALITY ANALYSIS
                </p>
                <h1 className="mb-4 text-5xl font-bold leading-tight text-black dark:text-white md:text-6xl">
                  Your{" "}
                  <span className="relative">
                    <span className="rounded bg-black px-2 py-1 text-white dark:bg-white dark:text-black">
                      water
                    </span>
                  </span>{" "}
                  quality report,
                </h1>
                <h2 className="mb-6 text-5xl font-bold leading-tight text-black dark:text-white md:text-6xl">
                  but it <span className="italic">actually</span> protects.
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                  Get your personalized water contamination analysis in under 2 minutes.
                </p>
              </div>
            </div>
  )
}
