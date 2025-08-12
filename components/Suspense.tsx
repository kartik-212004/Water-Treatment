"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportSkeleton() {
  return (
    <div className="relative m-0 min-h-screen bg-white pb-12">
      <div className="mx-auto max-w-7xl">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden border-b border-gray-200 bg-[#101935] px-6 py-10 shadow-sm sm:rounded-none">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-48 bg-white/10" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-20 bg-white/10" />
              <Skeleton className="h-9 w-20 bg-white/10" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 bg-white/10 md:h-14 lg:h-16" />
            <Skeleton className="h-4 w-1/2 bg-white/10" />
          </div>
        </div>

        {/* Summary Statement Skeleton */}
        <Card className="mb-10 rounded-sm border border-gray-200 bg-gray-100 shadow-sm">
          <CardContent className="p-8 text-center">
            <Skeleton className="mx-auto mb-3 h-6 w-3/4" />
            <Skeleton className="mx-auto h-4 w-2/3" />
          </CardContent>
        </Card>

        {/* Contaminant Cards Skeleton */}
        <div className="mb-8 space-y-6">
          {[...Array(5)].map((_, index) => (
            <Card
              key={index}
              className="group overflow-hidden rounded-sm bg-white transition hover:shadow-md">
              <div className="absolute left-0 top-0 h-full w-1 bg-gray-200"></div>
              <CardContent className="p-5 sm:p-6">
                {/* Header */}
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <div className="space-y-1 text-right">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                </div>
                {/* Risk Text */}
                <div className="mb-5 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                {/* Stats Grid */}
                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                    <Skeleton className="mb-2 h-3 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                    <Skeleton className="mb-2 h-3 w-20" />
                    <Skeleton className="h-5 w-16" />
                    <div className="mt-2 border-t border-gray-300 pt-2">
                      <Skeleton className="mb-1 h-3 w-12" />
                      <Skeleton className="h-4 w-14" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-md border border-green-300 bg-green-50 px-2 py-3 text-center">
                    <Skeleton className="mb-1 h-5 w-5 rounded-full" />
                    <Skeleton className="mb-1 h-3 w-24" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Skeleton */}
        <Card className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 shadow-sm">
          <CardContent className="p-8 text-center">
            <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
            <Skeleton className="mx-auto mb-4 h-8 w-48" />
            <Skeleton className="mx-auto mb-6 h-4 w-3/4" />
            <Skeleton className="mx-auto h-12 w-32 rounded-lg" />
          </CardContent>
        </Card>

        {/* Disclaimer Skeleton */}
        <Card className="rounded-none border border-gray-200 bg-gray-50 shadow-sm sm:rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-center gap-2">
              <Skeleton className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mx-auto h-3 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// export function SimpleReportSkeleton() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 py-12">
//       <div className="mx-auto max-w-4xl space-y-6">
//         <div className="space-y-4 text-center">
//           <Skeleton className="mx-auto h-12 w-12 rounded-full" />
//           <Skeleton className="mx-auto h-8 w-64" />
//           <Skeleton className="mx-auto h-4 w-48" />
//         </div>
//         <div className="grid gap-4">
//           {[...Array(3)].map((_, i) => (
//             <Card key={i} className="p-6">
//               <div className="space-y-3">
//                 <Skeleton className="h-6 w-1/3" />
//                 <Skeleton className="h-4 w-full" />
//                 <Skeleton className="h-4 w-2/3" />
//               </div>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
