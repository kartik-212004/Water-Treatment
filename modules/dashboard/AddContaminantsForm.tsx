"use client";

import { useMemo } from "react";

import { Loader2, Plus, Save, Trash2, ChevronsUpDown } from "lucide-react";

import ContaminantsNames from "@/lib/contaminants";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

export interface ContaminantFormItem {
  id?: string;
  name: string;
  removalRate: string;
  healthRisk: string;
}

interface AddContaminantsFormProps {
  message: { type: string; text: string };
  contaminants: ContaminantFormItem[];
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof ContaminantFormItem, value: string) => void;
  onAdd: () => void;
  onSave: () => void;
  saving: boolean;
  openComboboxes: { [key: string]: boolean };
  setOpenComboboxes: (next: { [key: string]: boolean }) => void;
}

export default function AddContaminantsForm({
  message,
  contaminants,
  onRemove,
  onUpdate,
  onAdd,
  onSave,
  saving,
  openComboboxes,
  setOpenComboboxes,
}: AddContaminantsFormProps) {
  const uniqueContaminants = useMemo(() => Array.from(new Set(ContaminantsNames)), []);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex flex-col gap-2 text-base sm:flex-row sm:items-center sm:text-lg">
          <Plus className="h-5 w-5" />
          <span>Add New Contaminants</span>
        </CardTitle>
        <CardDescription className="text-sm">
          Add one or more contaminants to the Patriots filtration database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {message.text && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription className="text-sm">{message.text}</AlertDescription>
          </Alert>
        )}

        {contaminants.map((contaminant, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-3 sm:space-y-4 sm:p-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                Contaminant {index + 1}
              </Badge>
              {contaminants.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`name-${index}`}>Contaminant Name</Label>
              <Popover
                open={openComboboxes[`add-${index}`]}
                onOpenChange={(open) => setOpenComboboxes({ ...openComboboxes, [`add-${index}`]: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openComboboxes[`add-${index}`]}
                    className="h-10 w-full justify-between text-sm">
                    {contaminant.name
                      ? uniqueContaminants.find((name) => name === contaminant.name)
                      : "e.g., Arsenic"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[90vw] max-w-[400px] p-0"
                  side="bottom"
                  align="start"
                  sideOffset={5}>
                  <Command>
                    <CommandInput placeholder="Search contaminants..." className="h-9" />
                    <CommandList className="max-h-[40vh]">
                      <CommandEmpty>No contaminant found.</CommandEmpty>
                      <CommandGroup>
                        {uniqueContaminants.map((name: string, idx: number) => (
                          <CommandItem
                            key={`${name}-${idx}`}
                            value={name}
                            onSelect={(currentValue) => {
                              onUpdate(index, "name", currentValue === contaminant.name ? "" : currentValue);
                              setOpenComboboxes({ ...openComboboxes, [`add-${index}`]: false });
                            }}>
                            {name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`removal-${index}`}>Removal Rate</Label>
              <Input
                id={`removal-${index}`}
                placeholder="e.g., 99.9%"
                value={contaminant.removalRate}
                onChange={(e) => onUpdate(index, "removalRate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`health-${index}`}>Health Risk Description</Label>
              <Textarea
                id={`health-${index}`}
                placeholder="Describe the health risks associated with this contaminant..."
                value={contaminant.healthRisk}
                onChange={(e) => onUpdate(index, "healthRisk", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            onClick={onAdd}
            className="flex w-full items-center justify-center space-x-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add Another Contaminant</span>
          </Button>

          <Button
            onClick={onSave}
            disabled={saving}
            className="flex w-full items-center justify-center space-x-2 sm:w-auto">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span className="text-sm">Save All</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
