"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

interface HeaderBarProps {
  onLogout: () => void;
}

export default function HeaderBar({ onLogout }: HeaderBarProps) {
  return (
    <div className="border-b bg-[#101935] text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-lg font-bold sm:text-xl">Admin Dashboard</h1>
              <p className="text-xs text-gray-100 text-muted-foreground sm:text-sm">
                Manage contaminants database
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-fit text-black" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
