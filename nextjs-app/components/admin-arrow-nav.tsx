"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp } from "lucide-react";

type AdminArrowNavProps = {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  hidden?: boolean;
};

export function AdminArrowNav({
  onPrev,
  onNext,
  canPrev,
  canNext,
  hidden,
}: AdminArrowNavProps) {
  if (hidden) return null;

  return (
    <TooltipProvider>
      <div className="fixed bottom-24 left-4 z-40 flex flex-col gap-1 rounded-xl border bg-card/95 p-1 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={onPrev}
              disabled={!canPrev}
              aria-label="بخش قبلی"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">بخش قبلی</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={onNext}
              disabled={!canNext}
              aria-label="بخش بعدی"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">بخش بعدی</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
