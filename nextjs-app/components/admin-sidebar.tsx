"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Coffee,
  ExternalLink,
  LogOut,
  MessageSquareText,
  Plus,
  Search,
  UtensilsCrossed,
} from "lucide-react";

export type AdminSidebarSection = {
  id: string;
  title: string;
  itemCount: number;
  hasChanges?: boolean;
};

type AdminSidebarProps = {
  sections: AdminSidebarSection[];
  activeSectionId?: string | null;
  unsavedCount: number;
  onNavigate: (targetId: string) => void;
  onAddSection: () => void;
  onFocusSearch: () => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

function SidebarBody({
  sections,
  activeSectionId,
  unsavedCount,
  onNavigate,
  onAddSection,
  onFocusSearch,
  onLogout,
  onNavigateComplete,
}: AdminSidebarProps & { onNavigateComplete?: () => void }) {
  const go = (targetId: string) => {
    onNavigate(targetId);
    onNavigateComplete?.();
  };

  return (
    <TooltipProvider>
      {/* Explicit LTR shell — page is RTL; this panel must not inherit it */}
      <div dir="ltr" className="flex h-full min-h-0 flex-col text-left">
        <div className="shrink-0 space-y-3 px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Coffee className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold leading-tight">پنل ادمین</p>
                <p className="truncate text-xs text-muted-foreground">کافه اوتن</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild aria-label="مشاهده سایت">
                    <Link href="/" target="_blank" onClick={onNavigateComplete}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">مشاهده سایت</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onLogout} aria-label="خروج">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">خروج</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {unsavedCount > 0 ? (
            <Badge
              variant="outline"
              className="w-full justify-center border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            >
              {unsavedCount} تغییر ذخیره‌نشده
            </Badge>
          ) : (
            <Badge variant="secondary" className="w-full justify-center font-normal">
              همه چیز ذخیره شده
            </Badge>
          )}
        </div>

        <Separator />

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <div className="space-y-5">
            <div>
              <p className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground">
                دسترسی سریع
              </p>
              <div className="space-y-0.5">
                <Button
                  variant="ghost"
                  className="h-9 w-full justify-start gap-2"
                  onClick={() => go("admin-tax")}
                >
                  <MessageSquareText className="h-4 w-4" />
                  پیام مالیات
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 w-full justify-start gap-2"
                  onClick={onFocusSearch}
                >
                  <Search className="h-4 w-4" />
                  جستجو در منو
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 w-full justify-start gap-2"
                  onClick={() => go("admin-menu")}
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  همه دسته‌ها
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 w-full justify-start gap-2"
                  onClick={onAddSection}
                >
                  <Plus className="h-4 w-4" />
                  دسته جدید
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground">
                دسته‌بندی‌ها
              </p>
              <div className="space-y-0.5 pb-2">
                {sections.length === 0 ? (
                  <p className="px-2 text-sm text-muted-foreground">دسته‌ای نیست</p>
                ) : (
                  sections.map((section) => {
                    const isActive = activeSectionId === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => go(`admin-section-${section.id}`)}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate text-left">{section.title}</span>
                        <Badge
                          variant="secondary"
                          className={`shrink-0 border-0 px-1.5 py-0 text-[11px] ${
                            isActive
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : section.hasChanges
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                : ""
                          }`}
                        >
                          {section.itemCount}
                        </Badge>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
}

export function AdminSidebar(props: AdminSidebarProps) {
  return (
    <>
      <aside className="sticky top-[4.5rem] hidden h-[calc(100vh-5.5rem)] w-64 shrink-0 overflow-hidden rounded-xl border bg-card shadow-sm lg:block">
        <SidebarBody {...props} />
      </aside>

      <Sheet open={props.mobileOpen} onOpenChange={props.onMobileOpenChange}>
        <SheetContent
          side="right"
          className="z-[60] h-dvh w-[min(100vw-2rem,320px)] gap-0 overflow-hidden p-0"
        >
          <SheetTitle className="sr-only">منوی پنل ادمین</SheetTitle>
          <SidebarBody
            {...props}
            onNavigateComplete={() => props.onMobileOpenChange(false)}
            onFocusSearch={() => {
              props.onFocusSearch();
              props.onMobileOpenChange(false);
            }}
            onAddSection={() => {
              props.onAddSection();
              props.onMobileOpenChange(false);
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
