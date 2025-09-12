"use client";

import { useMemo } from "react";

import { Check, ChevronsUpDown, Edit, Loader2, Trash2, X } from "lucide-react";

import ContaminantsNames from "@/lib/contaminants";

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

export interface ContaminantItem {
  id?: string;
  name: string;
  removalRate: string;
  healthRisk: string;
}

interface ExistingContaminantsListProps {
  items: ContaminantItem[];
  loadingExisting: boolean;
  editingId: string | null;
  editForm: ContaminantItem;
  setEditForm: (next: ContaminantItem) => void;
  onEdit: (contaminant: ContaminantItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: (id: string, name: string) => void;
  editComboboxOpen: boolean;
  setEditComboboxOpen: (open: boolean) => void;
}

export default function ExistingContaminantsList({
  items,
  loadingExisting,
  editingId,
  editForm,
  setEditForm,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  editComboboxOpen,
  setEditComboboxOpen,
}: ExistingContaminantsListProps) {
  const uniqueContaminants = useMemo(() => Array.from(new Set(ContaminantsNames)), []);

  return (
    <Card className="flex h-80 flex-col lg:h-96">
      <CardHeader className="shrink-0 pb-4">
        <CardTitle className="text-base sm:text-lg">Existing Contaminants</CardTitle>
        <CardDescription className="text-sm">Currently tracked contaminants ({items.length})</CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden">
        <div className="max-h-[50vh] space-y-2 overflow-y-auto sm:space-y-3 lg:max-h-96">
          {loadingExisting ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No contaminants found</p>
          ) : (
            items.map((contaminant) => (
              <div key={contaminant.id} className="rounded-lg border p-2 sm:p-3">
                {editingId === contaminant.id ? (
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <Label htmlFor={`edit-name-${contaminant.id}`} className="text-xs">
                        Name
                      </Label>
                      <Popover open={editComboboxOpen} onOpenChange={setEditComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={editComboboxOpen}
                            className="h-8 w-full justify-between text-sm">
                            {editForm.name
                              ? uniqueContaminants.find((name) => name === editForm.name)
                              : "Select name"}
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
                                    key={`edit-${name}-${idx}`}
                                    value={name}
                                    onSelect={(currentValue) => {
                                      setEditForm({
                                        ...editForm,
                                        name: currentValue === editForm.name ? "" : currentValue,
                                      });
                                      setEditComboboxOpen(false);
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
                    <div>
                      <Label htmlFor={`edit-rate-${contaminant.id}`} className="text-xs">
                        Removal Rate
                      </Label>
                      <Input
                        id={`edit-rate-${contaminant.id}`}
                        value={editForm.removalRate}
                        onChange={(e) => setEditForm({ ...editForm, removalRate: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-health-${contaminant.id}`} className="text-xs">
                        Health Risk
                      </Label>
                      <Textarea
                        id={`edit-health-${contaminant.id}`}
                        value={editForm.healthRisk}
                        onChange={(e) => setEditForm({ ...editForm, healthRisk: e.target.value })}
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button size="sm" onClick={onSaveEdit} className="h-7 flex-1 sm:flex-none">
                        <Check className="mr-1 h-3 w-3" />
                        <span className="text-xs">Save</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onCancelEdit}
                        className="h-7 flex-1 sm:flex-none">
                        <X className="mr-1 h-3 w-3" />
                        <span className="text-xs">Cancel</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h4 className="truncate text-sm font-medium sm:text-base">{contaminant.name}</h4>
                      <div className="flex flex-shrink-0 items-center gap-1">
                        <Badge variant="outline" className="px-1 text-xs">
                          {contaminant.removalRate}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(contaminant)}
                          className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(contaminant.id!, contaminant.name)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                      {contaminant.healthRisk}
                    </p>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
