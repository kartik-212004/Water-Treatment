"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useEffect, useRef } from "react";

import axios from "axios";
import { Droplets, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { WaterSystem, emailSchema, phoneSchema, zipCodeSchema } from "@/lib/form-schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WaterQualityReport() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    zipCode: "",
    email: "",
    phone: "",
    consent: false,
  });
  const [waterSystems, setWaterSystems] = useState<WaterSystem[]>([]);
  const [selectedPwsid, setSelectedPwsid] = useState<string>("");
  const [isLoadingWaterSystems, setIsLoadingWaterSystems] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.zipCode) {
      newErrors.zipCode = "Zip code is required";
    } else {
      try {
        zipCodeSchema.parse({ zipCode: formData.zipCode });
      } catch (error) {
        if (error instanceof z.ZodError) {
          newErrors.zipCode = error.errors[0].message;
        }
      }
    }

    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else {
      try {
        emailSchema.parse({ email: formData.email });
      } catch (error) {
        if (error instanceof z.ZodError) {
          newErrors.email = error.errors[0].message;
        }
      }
    }
    if (formData.phone) {
      try {
        phoneSchema.parse(formData.phone);
      } catch (error) {
        if (error instanceof z.ZodError) {
          newErrors.phone = error.errors[0].message;
        }
      }
    }

    if (!formData.consent) {
      newErrors.consent = "You must agree to receive communications";
    }

    if (waterSystems.length > 0 && !selectedPwsid)
      newErrors.waterSystem = "Please select your water provider";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const pwsidToUse = waterSystems.length === 1 ? waterSystems[0].pwsid : selectedPwsid;

      await axios.post("/api/form", {
        email: formData.email,
        phoneNumber: formData.phone || undefined,
        zip: formData.zipCode,
        pwsid: pwsidToUse || undefined,
      });

      toast.success("Form submitted successfully!", {
        description: "Generating your water quality report...",
        duration: 2000,
      });

      setTimeout(() => {
        router.push(`/report?pwsid=${pwsidToUse}&zipcode=${formData.zipCode}&email=${formData.email}`);
      }, 500);
    } catch (err: any) {
      console.error("Submit failed", err);

      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.retryAfter || 60;
        toast.error(`Too many submissions! Please wait ${retryAfter} seconds before trying again.`, {
          description: "You've submitted too many forms recently.",
          duration: 5000,
        });
      } else if (err.response?.data?.error) {
        toast.error("Submission failed", {
          description: err.response.data.error,
          duration: 4000,
        });
      } else {
        toast.error("Something went wrong", {
          description: "Please check your connection and try again.",
          duration: 4000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAbortRef = useRef<AbortController | null>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === "zipCode" && typeof value === "string") {
      // Sanitize: digits only, max 5 chars
      const cleaned = value.replace(/\D/g, "").slice(0, 5);
      setFormData((prev) => ({ ...prev, zipCode: cleaned }));
      setSelectedPwsid("");
      if (errors.zipCode) setErrors((prev) => ({ ...prev, zipCode: "" }));
      // Don't immediately fetch here (debounced effect will handle it)
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Debounced fetch when ZIP becomes 5 digits
  useEffect(() => {
    const zip = formData.zipCode;
    if (zip.length !== 5) {
      setWaterSystems([]);
      setIsLoadingWaterSystems(false);
      return;
    }

    setIsLoadingWaterSystems(true);

    const controller = new AbortController();
    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    fetchAbortRef.current = controller;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await axios.get(`https://data.epa.gov/efservice/WATER_SYSTEM/ZIP_CODE/${zip}/JSON`, {
          signal: controller.signal,
        });
        const data: WaterSystem[] = response.data;
        if (Array.isArray(data) && data.length > 0) {
          setWaterSystems(data);
        } else {
          setWaterSystems([]);
          setErrors((prev) => ({ ...prev, zipCode: "No water systems found for this zip code" }));
        }
      } catch (error: any) {
        if (error.name === "CanceledError" || error.name === "AbortError") return;
        console.error("Error fetching water systems:", error);
        setErrors((prev) => ({ ...prev, zipCode: "Error fetching water system data" }));
        setWaterSystems([]);
      } finally {
        setIsLoadingWaterSystems(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [formData.zipCode]);

  const handleWaterSystemSelect = (pwsid: string) => {
    setSelectedPwsid(pwsid);
    if (errors.waterSystem) setErrors((prev) => ({ ...prev, waterSystem: "" }));
  };

  const disableSubmit =
    isSubmitting ||
    !formData.zipCode ||
    !formData.email ||
    !formData.consent ||
    (!!formData.phone && !!errors.phone) ||
    !!errors.zipCode ||
    !!errors.email ||
    (waterSystems.length > 0 && !selectedPwsid);

  const isSelectDisabled =
    !formData.zipCode || formData.zipCode.length < 5 || isLoadingWaterSystems || waterSystems.length === 0;

  return (
    <div className="relative bg-white pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mx-auto max-w-2xl">
          <Card className="overflow-hidden rounded-sm border-none border-gray-200 shadow-none sm:border sm:shadow-xl">
            <CardContent className="bg-white px-0 py-8 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="zipCode"
                      className="text-sm font-semibold uppercase tracking-wider text-black">
                      Zip Code *
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 md:left-4 md:h-5 md:w-5" />
                      <Input
                        id="zipCode"
                        type="text"
                        placeholder="Enter your zip code (e.g., 90210)"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        className={`h-10 rounded-lg border-2 pl-9 text-base transition-all duration-200 placeholder:text-sm md:h-14 md:rounded-xl md:pl-12 md:text-lg md:placeholder:text-base ${
                          errors.zipCode
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 focus:border-black"
                        } bg-white text-black`}
                      />
                    </div>
                    {errors.zipCode && <p className="text-sm font-medium text-red-500">{errors.zipCode}</p>}

                    {isLoadingWaterSystems && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <span>Loading water systems</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label
                        htmlFor="waterSystem"
                        className="text-[11px] font-semibold uppercase tracking-wide text-black md:text-sm">
                        Select Your Water Provider *
                      </Label>
                      <div className="relative w-full">
                        <Droplets className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 md:left-4 md:h-5 md:w-5" />
                        <Select
                          value={selectedPwsid}
                          onValueChange={handleWaterSystemSelect}
                          disabled={isSelectDisabled}>
                          <SelectTrigger
                            className={`h-10 w-full rounded-lg border-2 pl-9 text-left text-base transition-all duration-200 md:h-14 md:rounded-xl md:pl-12 md:text-lg ${
                              errors.waterSystem
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 focus:border-black"
                            } ${isSelectDisabled ? "opacity-60" : ""} bg-white text-black`}>
                            <SelectValue
                              placeholder={
                                !formData.zipCode
                                  ? "Enter ZIP code first"
                                  : isLoadingWaterSystems
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
                                <SelectItem
                                  key={system.pwsid}
                                  value={system.pwsid}
                                  className="whitespace-normal">
                                  <div className="flex max-w-[calc(100vw-5rem)] flex-col sm:max-w-sm">
                                    <span className="line-clamp-1 break-words text-start text-sm font-medium">
                                      {system.pws_name}
                                    </span>
                                    <span className="line-clamp-2 break-words text-xs text-gray-500">
                                      {system.pwsid} • Serves{" "}
                                      {system.population_served_count?.toLocaleString()} people
                                      {system.city_name && ` • ${system.city_name}`}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          )}
                        </Select>
                      </div>
                      {errors.waterSystem && (
                        <p className="text-xs font-medium text-red-500 md:text-sm">{errors.waterSystem}</p>
                      )}
                      {waterSystems.length > 1 && !errors.waterSystem && (
                        <div className="rounded-lg bg-blue-50 p-3">
                          <p className="text-[11px] text-blue-800 md:text-xs">
                            Multiple water systems serve your area. Please select your specific water provider
                            to get the most accurate report.
                          </p>
                        </div>
                      )}
                      {waterSystems.length === 1 && (
                        <div className="rounded-lg bg-green-50 p-3">
                          <div className="flex items-center space-x-2">
                            <Droplets className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-medium text-green-800 md:text-sm">
                              1 provider found. Please confirm selection.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="email"
                      className="text-[11px] font-semibold uppercase tracking-wide text-black md:text-sm">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 md:left-4 md:h-5 md:w-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`h-10 rounded-lg border-2 pl-9 text-base transition-all duration-200 placeholder:text-sm md:h-14 md:rounded-xl md:pl-12 md:text-lg md:placeholder:text-base ${
                          errors.email
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 focus:border-black"
                        } bg-white text-black`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs font-medium text-red-500 md:text-sm">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="phone"
                      className="text-[11px] font-semibold uppercase tracking-wide text-black md:text-sm">
                      Mobile Number (Optional)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 md:left-4 md:h-5 md:w-5" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`h-10 rounded-lg border-2 pl-9 text-base transition-all duration-200 placeholder:text-sm md:h-14 md:rounded-xl md:pl-12 md:text-lg md:placeholder:text-base ${
                          errors.phone
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 focus:border-black"
                        } bg-white text-black`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs font-medium text-red-500 md:text-sm">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-4 rounded-xl bg-gray-50 p-5 md:p-6">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => handleInputChange("consent", checked as boolean)}
                    className={`mt-1 ${errors.consent ? "border-red-500" : "border-gray-300"}`}
                  />
                  <Label htmlFor="consent" className="text-[13px] leading-relaxed text-gray-700 md:text-sm">
                    I agree to receive email and SMS marketing communications from 4Patriots about water
                    filtration products and health tips. I understand I can unsubscribe at any time.
                  </Label>
                </div>
                {errors.consent && (
                  <p className="text-xs font-medium text-red-500 md:text-sm">{errors.consent}</p>
                )}

                <Button
                  type="submit"
                  disabled={disableSubmit}
                  aria-disabled={disableSubmit}
                  className="group relative h-12 w-full transform rounded-lg bg-[#B40014] text-base font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#8F0010] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 md:h-16 md:rounded-xl md:text-lg">
                  <span className="flex items-center justify-center gap-2">
                    {isSubmitting && (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    {waterSystems.length > 0 && !selectedPwsid
                      ? "Select Water Provider First"
                      : isSubmitting
                        ? "Submitting..."
                        : "See My Report Now"}
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="mt-5 text-center md:mt-6">
            <p className="text-[11px] text-gray-500 md:text-xs">
              By submitting, you agree to receive communications about water filtration solutions. You can opt
              out anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
