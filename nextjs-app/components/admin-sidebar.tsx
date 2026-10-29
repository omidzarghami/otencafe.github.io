"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Coffee,
  ExternalLink,
  LogOut,
  Menu,
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
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Coffee className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold leading-tight">پنل ادمین</p>
            <p className="text-xs text-muted-foreground">کافه اوتن</p>
          </div>
        </div>
        {unsavedCount > 0 && (
          <div className="mt-3 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            {unsavedCount} تغییر ذخیره‌نشده
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">دسترسی سریع</p>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => go("admin-tax")}
          >
            <MessageSquareText className="ml-2 h-4 w-4" />
            پیام مالیات
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={onFocusSearch}>
            <Search className="ml-2 h-4 w-4" />
            جستجو در منو
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => go("admin-menu")}
          >
            <UtensilsCrossed className="ml-2 h-4 w-4" />
            همه دسته‌ها
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={onAddSection}>
            <Plus className="ml-2 h-4 w-4" />
            دسته جدید
          </Button>
        </div>

        <p className="mb-2 mt-6 px-2 text-xs font-medium text-muted-foreground">دسته‌بندی‌ها</p>
        <div className="space-y-1">
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
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span className="truncate text-right">{section.title}</span>
                  <span
                    className={`mr-2 shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : section.hasChanges
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {section.itemCount}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="space-y-2 border-t px-3 py-4">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/" target="_blank" onClick={onNavigateComplete}>
            <ExternalLink className="ml-2 h-4 w-4" />
            مشاهده سایت
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={onLogout}>
          <LogOut className="ml-2 h-4 w-4" />
          خروج
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar(props: AdminSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 overflow-hidden rounded-xl border bg-card/95 shadow-sm backdrop-blur lg:block">
        <SidebarBody {...props} />
      </aside>

      {/* Mobile sidebar trigger + sheet */}
      <div className="lg:hidden">
        <Sheet open={props.mobileOpen} onOpenChange={props.onMobileOpenChange}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed right-4 top-4 z-40 shadow-md"
              aria-label="باز کردن منوی کناری"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0 sm:w-[320px]">
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
      </div>
    </>
  );
}
