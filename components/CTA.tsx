import { CheckCircle, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CTA_LIST = [
  { title: "Targets priority contaminants identified in this report", icon: CheckCircle },
  { title: "Advanced Nanomesh™ multi‑stage reduction technology", icon: CheckCircle },
  { title: "Independent lab verified performance", icon: CheckCircle },
] as const;

export default function CTA() {
  return (
    <Card className="mb-10 overflow-hidden rounded-none border-0 bg-[#101935] text-white shadow-sm sm:rounded-sm">
      <CardContent className="px-6 py-10 md:px-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Protect Your Drinking Water</h2>
            <ul className="space-y-2 text-sm text-white/80">
              {CTA_LIST.map((e, i) => (
                <li key={i} className="flex items-start gap-2">
                  <e.icon className="mt-0.5 h-4 w-4 text-yellow-300" />
                  <span className="text-left">{e.title}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center gap-4 md:items-end">
            <Button
              size="lg"
              className="bg-yellow-400 px-10 py-5 text-base font-semibold text-[#101935] shadow hover:bg-yellow-400/90"
              onClick={() =>
                window.open(
                  "https://4patriots.com/product/patriot-pure-ultimate-water-filtration-system-nanomesh-filter",
                  "_blank"
                )
              }>
              View Filter Details
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-[11px] uppercase tracking-wide text-white">Limited Inventory</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
