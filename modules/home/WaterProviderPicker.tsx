"use client";

import { useEffect, useRef, useState } from "react";

import axios from "axios";
import { Droplets, MapPin } from "lucide-react";

import type { WaterSystem } from "@/lib/form-schema";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  zipFieldName: string;
  pwsidFieldName: string;
}

export default function WaterProviderPicker({ zipFieldName, pwsidFieldName }: Props) {
  const [zip, setZip] = useState("");
  const [waterSystems, setWaterSystems] = useState<WaterSystem[]>([]);
  const [selectedPwsid, setSelectedPwsid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (zip.length !== 5) {
      setWaterSystems([]);
      setSelectedPwsid("");
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = controller;

    const timeout = setTimeout(async () => {
      try {
        const response = await axios.get(`https://data.epa.gov/efservice/WATER_SYSTEM/ZIP_CODE/${zip}/JSON`, {
          signal: controller.signal,
        });
        const data: WaterSystem[] = response.data;
        if (Array.isArray(data) && data.length > 0) {
          setWaterSystems(data);
          // If only one, preselect
          if (data.length === 1) setSelectedPwsid(data[0].pwsid);
        } else {
          setWaterSystems([]);
          setError("No water systems found for this zip code");
        }
      } catch (e: any) {
        if (e.name === "CanceledError" || e.name === "AbortError") return;
        setError("Error fetching water system data");
        setWaterSystems([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [zip]);

  return (
    <div className="space-y-3" aria-busy={loading}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 md:left-4 md:h-5 md:w-5" />
        <Input
          id={zipFieldName}
          name={zipFieldName}
          type="text"
          placeholder="Enter your zip code (e.g., 90210)"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          className="h-10 rounded-lg border-2 bg-white pl-9 text-base text-black transition-all duration-200 placeholder:text-sm md:h-14 md:rounded-xl md:pl-12 md:text-lg md:placeholder:text-base"
          required
          aria-required
        />
      </div>

      <input type="hidden" name={pwsidFieldName} value={selectedPwsid} />

      {/* Provider selection always visible; enabled only after successful ZIP lookup */}
      <div className="relative w-full space-y-3">
        <Label
          htmlFor={`${pwsidFieldName}-select`}
          className="text-sm font-semibold uppercase tracking-wider text-black">
          Select Your Water Provider *
        </Label>
        <div className="relative">
          <Droplets className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 md:left-4 md:h-5 md:w-5" />
          <Select
            value={selectedPwsid}
            onValueChange={setSelectedPwsid}
            disabled={zip.length !== 5 || loading || waterSystems.length === 0}>
            <SelectTrigger
              id={`${pwsidFieldName}-select`}
              className={`h-10 w-full rounded-lg border-2 pl-9 text-left text-base transition-all duration-200 md:h-14 md:rounded-xl md:pl-12 md:text-lg ${
                zip.length !== 5 || loading || waterSystems.length === 0 ? "opacity-60" : ""
              } bg-white text-black`}>
              <SelectValue
                placeholder={
                  zip.length !== 5
                    ? "Enter ZIP code first"
                    : loading
                      ? "Loading providers..."
                      : waterSystems.length === 0
                        ? "No providers found"
                        : "Choose your water provider..."
                }
              />
            </SelectTrigger>
            {waterSystems.length > 0 && (
              <SelectContent>
                {waterSystems.map((system) => (
                  <SelectItem key={system.pwsid} value={system.pwsid} className="whitespace-normal">
                    <div className="flex max-w-[calc(100vw-5rem)] flex-col sm:max-w-sm">
                      <span className="line-clamp-1 break-words text-start text-sm font-medium">
                        {system.pws_name}
                      </span>
                      <span className="line-clamp-2 break-words text-xs text-gray-500">
                        {system.pwsid} • Serves {system.population_served_count?.toLocaleString()} people
                        {system.city_name && ` • ${system.city_name}`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            )}
          </Select>
        </div>
      </div>

      {waterSystems.length > 1 && (
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-[11px] text-blue-800 md:text-xs">
            Multiple water systems serve your area. Please select your specific water provider to get the most
            accurate report.
          </p>
        </div>
      )}
      {waterSystems.length === 1 && (
        <div className="rounded-lg bg-green-50 p-3">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-800 md:text-sm">
              1 provider found. Preselected.
            </span>
          </div>
        </div>
      )}
      {error && <p className="text-xs font-medium text-red-500 md:text-sm">{error}</p>}
    </div>
  );
}
