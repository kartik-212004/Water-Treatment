"use client";

import type React from "react";
import { useState } from "react";

import axios from "axios";
import { CheckCircle, Droplets, Mail, MapPin, Phone, Shield } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { WaterSystem, emailSchema, phoneSchema, zipCodeSchema } from "@/zodSchema/form";

export default function WaterQualityReport() {
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

    if (waterSystems.length > 1 && !selectedPwsid) {
      newErrors.waterSystem = "Please select your water provider";
    }

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
        description: "You'll receive your water quality report soon.",
        duration: 4000,
      });
    } catch (err: any) {
      console.error("Submit failed", err);

      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.retryAfter || 60;
        toast.error(`Too many submissions! Please wait ${retryAfter} seconds before trying again.`, {
          description: "You've submitted too many forms recently.",
          duration: 5000,
        });
      } else if (err.response?.data?.error) {
        // Handle other API errors
        toast.error("Submission failed", {
          description: err.response.data.error,
          duration: 4000,
        });
      } else {
        // Handle network or unknown errors
        toast.error("Something went wrong", {
          description: "Please check your connection and try again.",
          duration: 4000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = async (field: string, value: string | boolean) => {
    if (field === "zipCode" && typeof value === "string") {
      setFormData((prev) => ({ ...prev, [field]: value }));

      setWaterSystems([]);
      setSelectedPwsid("");

      if (value.length === 5) {
        setIsLoadingWaterSystems(true);
        try {
          const response = await axios.get(
            `https://data.epa.gov/efservice/WATER_SYSTEM/ZIP_CODE/${value}/JSON`
          );
          const data: WaterSystem[] = response.data;

          if (Array.isArray(data) && data.length > 0) {
            setWaterSystems(data);
            if (data.length === 1) {
              setSelectedPwsid(data[0].pwsid);
            }
          } else {
            setWaterSystems([]);
            setErrors((prev) => ({ ...prev, zipCode: "No water systems found for this zip code" }));
          }
        } catch (error) {
          console.error("Error fetching water systems:", error);
          setErrors((prev) => ({ ...prev, zipCode: "Error fetching water system data" }));
        } finally {
          setIsLoadingWaterSystems(false);
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleWaterSystemSelect = (pwsid: string) => {
    setSelectedPwsid(pwsid);
    if (errors.waterSystem) {
      setErrors((prev) => ({ ...prev, waterSystem: "" }));
    }
  };

  const disableSubmit =
    isSubmitting ||
    !formData.zipCode ||
    !formData.email ||
    !formData.consent ||
    (!!formData.phone && !!errors.phone) ||
    !!errors.zipCode ||
    !!errors.email ||
    (waterSystems.length > 1 && !selectedPwsid);

  return (
    <div className="relative min-h-screen bg-white px-4 py-12 dark:bg-black">
      <div className="absolute right-4 top-4"></div>

      <div className="mx-auto max-w-4xl">
        <Header />

        <div className="mx-auto max-w-2xl">
          <Card className="overflow-hidden rounded-2xl border border-gray-200 shadow-xl dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-black">
              <CardTitle className="text-center text-2xl font-bold text-black dark:text-white">
                Get Your Water Quality Report
              </CardTitle>
              <CardDescription className="text-center text-lg text-gray-600 dark:text-gray-400">
                Enter your information to receive your personalized analysis
              </CardDescription>
            </CardHeader>

            <CardContent className="bg-white p-8 dark:bg-black">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="zipCode"
                      className="text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
                      Zip Code *
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id="zipCode"
                        type="text"
                        placeholder="Enter your zip code (e.g., 90210)"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        className={`h-14 rounded-xl border-2 pl-12 text-lg transition-all duration-200 ${
                          errors.zipCode
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 focus:border-black dark:border-gray-800 dark:focus:border-white"
                        } bg-white text-black dark:bg-black dark:text-white`}
                      />
                    </div>
                    {errors.zipCode && <p className="text-sm font-medium text-red-500">{errors.zipCode}</p>}

                    {isLoadingWaterSystems && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <span>Loading water systems</span>
                      </div>
                    )}

                    {waterSystems.length > 1 && (
                      <div className="space-y-3">
                        <Label
                          htmlFor="waterSystem"
                          className="text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
                          Select Your Water Provider *
                        </Label>
                        <div className="relative">
                          <Droplets className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          <Select value={selectedPwsid} onValueChange={handleWaterSystemSelect}>
                            <SelectTrigger
                              className={`h-14 rounded-xl border-2 pl-12 text-lg transition-all duration-200 ${
                                errors.waterSystem
                                  ? "border-red-500 focus:border-red-500"
                                  : "border-gray-200 focus:border-black dark:border-gray-800 dark:focus:border-white"
                              } bg-white text-black dark:bg-black dark:text-white`}>
                              <SelectValue placeholder="Choose your water provider..." />
                            </SelectTrigger>
                            <SelectContent>
                              {waterSystems.map((system) => (
                                <SelectItem key={system.pwsid} value={system.pwsid}>
                                  <div className="flex flex-col">
                                    <span className="text-start text-sm">{system.pws_name}</span>
                                    <span className="text-xs text-gray-500">
                                      {system.pwsid} • Serves{" "}
                                      {system.population_served_count?.toLocaleString()} people
                                      {system.city_name && ` • ${system.city_name}`}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {errors.waterSystem && (
                          <p className="text-sm font-medium text-red-500">{errors.waterSystem}</p>
                        )}
                        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                          <p className="text-xs text-blue-800 dark:text-blue-200">
                            Multiple water systems serve your area. Please select your specific water provider
                            to get the most accurate report.
                          </p>
                        </div>
                      </div>
                    )}

                    {waterSystems.length === 1 && (
                      <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Water Provider Found: {waterSystems[0].pws_name}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                          PWSID: {waterSystems[0].pwsid} • Serves{" "}
                          {waterSystems[0].population_served_count?.toLocaleString()} people
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`h-14 rounded-xl border-2 pl-12 text-lg transition-all duration-200 ${
                          errors.email
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 focus:border-black dark:border-gray-800 dark:focus:border-white"
                        } bg-white text-black dark:bg-black dark:text-white`}
                      />
                    </div>
                    {errors.email && <p className="text-sm font-medium text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
                      Mobile Number (Optional)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`h-14 rounded-xl border-2 pl-12 text-lg transition-all duration-200 ${
                          errors.phone
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 focus:border-black dark:border-gray-800 dark:focus:border-white"
                        } bg-white text-black dark:bg-black dark:text-white`}
                      />
                    </div>
                    {errors.phone && <p className="text-sm font-medium text-red-500">{errors.phone}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-4 rounded-xl bg-gray-50 p-6 dark:bg-gray-950">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => handleInputChange("consent", checked as boolean)}
                    className={`mt-1 ${
                      errors.consent ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                    }`}
                  />
                  <Label
                    htmlFor="consent"
                    className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    I agree to receive email and SMS marketing communications from 4Patriots about water
                    filtration products and health tips. I understand I can unsubscribe at any time.
                  </Label>
                </div>
                {errors.consent && <p className="text-sm font-medium text-red-500">{errors.consent}</p>}

                <Button
                  type="submit"
                  disabled={disableSubmit}
                  aria-disabled={disableSubmit}
                  className="group relative h-16 w-full transform rounded-xl bg-black text-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                  <span className="flex items-center justify-center gap-2">
                    {isSubmitting && (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent" />
                    )}
                    {waterSystems.length > 1 && !selectedPwsid
                      ? "Select Water Provider First"
                      : isSubmitting
                        ? "Submitting..."
                        : "See My Report Now"}
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>

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
        </div>
      </div>
    </div>
  );
}
