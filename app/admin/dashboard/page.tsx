"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import axios from "axios";
import { Loader2, Plus, Trash2, Save, LogOut, Beaker } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface Contaminant {
  id?: string;
  name: string;
  removalRate: string;
  healthRisk: string;
}

export default function AdminDashboard() {
  const [contaminants, setContaminants] = useState<Contaminant[]>([
    { name: "", removalRate: "", healthRisk: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [existingContaminants, setExistingContaminants] = useState<Contaminant[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast("Please login to access admin dashboard");
      router.push("/admin");
      return;
    }
    fetchContaminants();
  }, [router]);

  const fetchContaminants = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get("/api/admin/contaminants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setExistingContaminants(response.data.contaminants || []);
      }
    } catch (error) {
      console.error("Failed to fetch contaminants:", error);
      toast("Failed to load contaminants");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin");
  };

  const addContaminantField = () => {
    setContaminants([...contaminants, { name: "", removalRate: "", healthRisk: "" }]);
  };

  const removeContaminantField = (index: number) => {
    if (contaminants.length > 1) {
      setContaminants(contaminants.filter((_, i) => i !== index));
    }
  };

  const updateContaminant = (index: number, field: keyof Contaminant, value: string) => {
    const updated = [...contaminants];
    updated[index] = { ...updated[index], [field]: value };
    setContaminants(updated);
  };

  const validateContaminants = () => {
    for (const contaminant of contaminants) {
      if (!contaminant.name.trim() || !contaminant.removalRate.trim() || !contaminant.healthRisk.trim()) {
        return "All fields are required for each contaminant";
      }

      // Check for duplicates in the form
      const duplicateInForm =
        contaminants.filter((c) => c.name.toLowerCase() === contaminant.name.toLowerCase()).length > 1;
      if (duplicateInForm) {
        return `Duplicate contaminant name: ${contaminant.name}`;
      }

      // Check against existing contaminants
      const existsInDb = existingContaminants.some(
        (existing) => existing.name.toLowerCase() === contaminant.name.toLowerCase()
      );
      if (existsInDb) {
        return `Contaminant already exists: ${contaminant.name}`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateContaminants();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        "/api/admin/contaminants",
        { contaminants },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage({ type: "success", text: `Successfully added ${contaminants.length} contaminant(s)` });
        setContaminants([{ name: "", removalRate: "", healthRisk: "" }]);
        toast(`Successfully added ${contaminants.length} contaminant(s)`);
        fetchContaminants(); // Refresh the list
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to save contaminants";
      setMessage({ type: "error", text: errorMessage });
      toast("Failed to save contaminants");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-primary p-2">
                <Beaker className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage contaminants database</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Add Contaminants Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add New Contaminants</span>
                </CardTitle>
                <CardDescription>
                  Add one or more contaminants to the Patriots filtration database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {message.text && (
                  <Alert variant={message.type === "error" ? "destructive" : "default"}>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}

                {contaminants.map((contaminant, index) => (
                  <div key={index} className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Contaminant {index + 1}</Badge>
                      {contaminants.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeContaminantField(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`name-${index}`}>Contaminant Name</Label>
                      <Input
                        id={`name-${index}`}
                        placeholder="e.g., Arsenic"
                        value={contaminant.name}
                        onChange={(e) => updateContaminant(index, "name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`removal-${index}`}>Removal Rate</Label>
                      <Input
                        id={`removal-${index}`}
                        placeholder="e.g., 99.9%"
                        value={contaminant.removalRate}
                        onChange={(e) => updateContaminant(index, "removalRate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`health-${index}`}>Health Risk Description</Label>
                      <Textarea
                        id={`health-${index}`}
                        placeholder="Describe the health risks associated with this contaminant..."
                        value={contaminant.healthRisk}
                        onChange={(e) => updateContaminant(index, "healthRisk", e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={addContaminantField}
                    className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Another Contaminant</span>
                  </Button>

                  <Button onClick={handleSave} disabled={saving} className="flex items-center space-x-2">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save All</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Existing Contaminants List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Existing Contaminants</CardTitle>
                <CardDescription>
                  Currently tracked contaminants ({existingContaminants.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {existingContaminants.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No contaminants found</p>
                  ) : (
                    existingContaminants.map((contaminant) => (
                      <div key={contaminant.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{contaminant.name}</h4>
                          <Badge variant="outline">{contaminant.removalRate}</Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {contaminant.healthRisk}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
