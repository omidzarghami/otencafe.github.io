"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";
import {
  clearAdminDraft,
  loadAdminDraft,
  loadPublishedOverrides,
  mergePublishedIntoAdminItems,
  mergePublishedIntoAdminSections,
  sanitizeDraftAgainstBaseline,
  saveAdminDraft,
  savePublishedOverrides,
} from "@/lib/admin-draft-storage";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminArrowNav } from "@/components/admin-arrow-nav";

interface MenuItem {
  id: string;
  name: string;
  sectionId: string;
  sectionTitle: string;
  price: number;
  description: string;
}

type StatusTone = "success" | "error" | "info";

export default function DashboardPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [sections, setSections] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [taxMessage, setTaxMessage] = useState("");
  const [originalTaxMessage, setOriginalTaxMessage] = useState("");
  const [nameChanges, setNameChanges] = useState<Record<string, string>>({});
  const [draftReady, setDraftReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<{ tone: StatusTone; message: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState<string | null>(null);
  const [showEditSectionNameDialog, setShowEditSectionNameDialog] = useState<string | null>(null);
  const [showEditItemNameDialog, setShowEditItemNameDialog] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [editingSectionName, setEditingSectionName] = useState("");
  const [editingItemName, setEditingItemName] = useState("");
  const router = useRouter();

  const taxMessageChanged = taxMessage !== originalTaxMessage;
  const sectionIdSet = useMemo(() => new Set(sections.map((s) => s.id)), [sections]);

  const unsavedCount =
    Object.keys(priceChanges).length +
    Object.keys(nameChanges).length +
    (taxMessageChanged ? 1 : 0);
  const hasUnsavedChanges = unsavedCount > 0;

  const showStatus = (tone: StatusTone, message: string) => {
    setStatus({ tone, message });
    window.setTimeout(() => {
      setStatus((current) => (current?.message === message ? null : current));
    }, 3200);
  };

  useEffect(() => {
    checkAuth();
    void bootstrapAdminData();
  }, []);

  const bootstrapAdminData = async () => {
    await Promise.all([loadItems(), loadSections(), loadTaxMessage()]);

    // Re-read after loads so draft is compared to the same baseline the site uses
    // (API + published localStorage overrides).
    const published = loadPublishedOverrides();
    const response = await fetch("/api/menu/items");
    let baselinePrices: Record<string, number> = {};
    let baselineNames: Record<string, string> = {};
    if (response.ok) {
      const data = await response.json();
      const merged = mergePublishedIntoAdminItems(data.items || [], published);
      for (const item of merged) {
        baselinePrices[item.id] = item.price;
        baselineNames[item.id] = item.name;
      }
    }
    const sectionsRes = await fetch("/api/menu/sections");
    if (sectionsRes.ok) {
      const data = await sectionsRes.json();
      const mergedSections = mergePublishedIntoAdminSections(
        data.sections || [],
        published
      );
      for (const section of mergedSections) {
        baselineNames[section.id] = section.title;
      }
    }

    const taxRes = await fetch("/api/settings/tax-message");
    let baselineTax = "";
    if (taxRes.ok) {
      const data = await taxRes.json();
      baselineTax = published?.taxMessage || data.taxMessage;
      setOriginalTaxMessage(baselineTax);
      setTaxMessage(baselineTax);
    }

    const cleaned = sanitizeDraftAgainstBaseline(loadAdminDraft(), {
      prices: baselinePrices,
      names: baselineNames,
      taxMessage: baselineTax,
    });
    setPriceChanges(cleaned.priceChanges);
    setNameChanges(cleaned.nameChanges);
    if (cleaned.taxMessageChanged && typeof cleaned.taxMessage === "string") {
      setTaxMessage(cleaned.taxMessage);
    }
    saveAdminDraft(cleaned);
    setDraftReady(true);
  };

  useEffect(() => {
    if (!draftReady) return;
    saveAdminDraft({
      priceChanges,
      nameChanges,
      taxMessage,
      taxMessageChanged,
    });
  }, [priceChanges, nameChanges, taxMessage, taxMessageChanged, draftReady]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        const saveButton = document.querySelector<HTMLButtonElement>("[data-admin-save]");
        saveButton?.click();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const headerOffset = 96;
      let current: string | null = null;
      for (const section of sections) {
        const el = document.getElementById(`admin-section-${section.id}`);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= headerOffset + 8) {
          current = section.id;
        }
      }
      setActiveSectionId(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const loadTaxMessage = async () => {
    try {
      const published = loadPublishedOverrides();
      const response = await fetch("/api/settings/tax-message");
      if (response.ok) {
        const data = await response.json();
        const baseline = published?.taxMessage || data.taxMessage;
        setOriginalTaxMessage(baseline);
        setTaxMessage(baseline);
      }
    } catch (error) {
      console.error("Error loading tax message:", error);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check");
      const data = await response.json();
      if (!data.authenticated) {
        router.push("/admin/login");
      }
    } catch {
      router.push("/admin/login");
    }
  };

  const loadItems = async () => {
    try {
      const response = await fetch("/api/menu/items");
      if (response.ok) {
        const data = await response.json();
        const published = loadPublishedOverrides();
        setItems(mergePublishedIntoAdminItems(data.items || [], published));
      } else if (response.status === 401) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error loading items:", error);
      showStatus("error", "خطا در بارگذاری آیتم‌ها");
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => {
    try {
      const response = await fetch("/api/menu/sections");
      if (response.ok) {
        const data = await response.json();
        const published = loadPublishedOverrides();
        setSections(
          mergePublishedIntoAdminSections(data.sections || [], published)
        );
      }
    } catch (error) {
      console.error("Error loading sections:", error);
    }
  };

  const handlePriceChange = (itemId: string, newPrice: number, originalPrice: number) => {
    setPriceChanges((prev) => {
      const next = { ...prev };
      if (Number.isNaN(newPrice) || newPrice === originalPrice) {
        delete next[itemId];
      } else {
        next[itemId] = newPrice;
      }
      return next;
    });
  };

  const handleDiscard = () => {
    setPriceChanges({});
    setNameChanges({});
    setTaxMessage(originalTaxMessage);
    clearAdminDraft();
    showStatus("info", "تغییرات پیش‌نویس پاک شد");
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    setSaving(true);
    try {
      for (const [itemId, price] of Object.entries(priceChanges)) {
        const response = await fetch("/api/menu/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, price }),
        });
        if (!response.ok) throw new Error("price");
      }

      for (const [id, newName] of Object.entries(nameChanges)) {
        if (sectionIdSet.has(id) || items.some((item) => item.sectionId === id)) {
          const response = await fetch("/api/menu/sections/update-name", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sectionId: id, newName }),
          });
          if (!response.ok) throw new Error("section-name");
        } else {
          const response = await fetch("/api/menu/items/update-name", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId: id, newName }),
          });
          if (!response.ok) throw new Error("item-name");
        }
      }

      if (taxMessageChanged) {
        const response = await fetch("/api/settings/tax-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taxMessage }),
        });
        if (!response.ok) throw new Error("tax");
        setOriginalTaxMessage(taxMessage);
      }

      setItems((prevItems) =>
        prevItems.map((item) => {
          const updatedItem = { ...item };
          if (priceChanges[item.id] !== undefined) {
            updatedItem.price = priceChanges[item.id];
          }
          if (nameChanges[item.id]) {
            updatedItem.name = nameChanges[item.id];
          }
          if (nameChanges[item.sectionId]) {
            updatedItem.sectionTitle = nameChanges[item.sectionId];
          }
          return updatedItem;
        })
      );

      setSections((prev) =>
        prev.map((section) => ({
          ...section,
          title: nameChanges[section.id] ?? section.title,
        }))
      );

      const previous = loadPublishedOverrides();
      const nextPrices = { ...(previous?.prices || {}) };
      const nextNames = { ...(previous?.names || {}) };
      const nextSectionNames = { ...(previous?.sectionNames || {}) };

      for (const [itemId, price] of Object.entries(priceChanges)) {
        nextPrices[itemId] = price;
      }

      for (const [id, newName] of Object.entries(nameChanges)) {
        if (sectionIdSet.has(id) || items.some((item) => item.sectionId === id)) {
          nextSectionNames[id] = newName;
        } else {
          nextNames[id] = newName;
        }
      }

      savePublishedOverrides({
        prices: nextPrices,
        names: nextNames,
        sectionNames: nextSectionNames,
        taxMessage: taxMessageChanged ? taxMessage : previous?.taxMessage,
        updatedAt: Date.now(),
      });

      setPriceChanges({});
      setNameChanges({});
      clearAdminDraft();
      showStatus("success", "تغییرات با موفقیت ذخیره شد");
      await loadItems();
      await loadSections();
    } catch {
      showStatus("error", "خطا در ذخیره تغییرات");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      showStatus("error", "نام دسته‌بندی را وارد کنید");
      return;
    }

    const sectionId = `custom-${Date.now()}`;
    try {
      const response = await fetch("/api/menu/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sectionId, title: newSectionTitle, items: [] }),
      });

      if (response.ok) {
        setShowAddSectionDialog(false);
        setNewSectionTitle("");
        await loadSections();
        await loadItems();
        showStatus("success", "دسته‌بندی اضافه شد");
      } else {
        showStatus("error", "خطا در اضافه کردن دسته‌بندی");
      }
    } catch {
      showStatus("error", "خطا در اضافه کردن دسته‌بندی");
    }
  };

  const handleAddItem = async (sectionId: string) => {
    if (!newItemName.trim() || newItemPrice <= 0) {
      showStatus("error", "نام و قیمت معتبر وارد کنید");
      return;
    }

    const itemId = `custom-${Date.now()}`;
    try {
      const response = await fetch("/api/menu/items/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId,
          item: {
            id: itemId,
            name: newItemName,
            description: "",
            price: newItemPrice,
            image: "/assets/images/a-cup-espresso.png",
          },
        }),
      });

      if (response.ok) {
        setShowAddItemDialog(null);
        setNewItemName("");
        setNewItemPrice(0);
        await loadItems();
        showStatus("success", "آیتم اضافه شد");
      } else {
        showStatus("error", "خطا در اضافه کردن آیتم");
      }
    } catch {
      showStatus("error", "خطا در اضافه کردن آیتم");
    }
  };

  const handleEditSectionName = (sectionId: string) => {
    if (!editingSectionName.trim()) {
      showStatus("error", "نام دسته‌بندی را وارد کنید");
      return;
    }

    const original = sections.find((s) => s.id === sectionId)?.title;
    setNameChanges((prev) => {
      const next = { ...prev };
      if (editingSectionName === original) {
        delete next[sectionId];
      } else {
        next[sectionId] = editingSectionName;
      }
      return next;
    });

    setShowEditSectionNameDialog(null);
    setEditingSectionName("");
  };

  const handleEditItemName = (itemId: string) => {
    if (!editingItemName.trim()) {
      showStatus("error", "نام آیتم را وارد کنید");
      return;
    }

    const original = items.find((item) => item.id === itemId)?.name;
    setNameChanges((prev) => {
      const next = { ...prev };
      if (editingItemName === original) {
        delete next[itemId];
      } else {
        next[itemId] = editingItemName;
      }
      return next;
    });

    setShowEditItemNameDialog(null);
    setEditingItemName("");
  };

  const handleDeleteItem = async (sectionId: string, itemId: string) => {
    if (!confirm("این آیتم حذف شود؟")) return;

    try {
      const response = await fetch("/api/menu/items/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, itemId }),
      });

      if (response.ok) {
        setPriceChanges((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        setNameChanges((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        await loadItems();
        showStatus("success", "آیتم حذف شد");
      } else {
        const data = await response.json();
        showStatus("error", data.error || "خطا در حذف آیتم");
      }
    } catch {
      showStatus("error", "خطا در حذف آیتم");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("این دسته‌بندی و همه آیتم‌هایش حذف شوند؟")) return;

    try {
      const response = await fetch("/api/menu/sections/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId }),
      });

      if (response.ok) {
        await loadSections();
        await loadItems();
        showStatus("success", "دسته‌بندی حذف شد");
      } else {
        const data = await response.json();
        showStatus("error", data.error || "خطا در حذف دسته‌بندی");
      }
    } catch {
      showStatus("error", "خطا در حذف دسته‌بندی");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const scrollToTarget = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (!element) return;

    if (targetId.startsWith("admin-section-")) {
      const sectionId = targetId.replace("admin-section-", "");
      setActiveSectionId(sectionId);
      setCollapsedSections((prev) => ({ ...prev, [sectionId]: false }));
    } else {
      setActiveSectionId(null);
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const focusSearch = () => {
    scrollToTarget("admin-menu");
    window.setTimeout(() => {
      document.getElementById("admin-search")?.focus();
    }, 250);
  };

  const groupedItems = sections.reduce(
    (acc, section) => {
      acc[section.id] = {
        title: nameChanges[section.id] ?? section.title,
        items: [],
      };
      return acc;
    },
    {} as Record<string, { title: string; items: MenuItem[] }>
  );

  items.forEach((item) => {
    if (!groupedItems[item.sectionId]) {
      groupedItems[item.sectionId] = {
        title: nameChanges[item.sectionId] ?? item.sectionTitle,
        items: [],
      };
    }
    groupedItems[item.sectionId].items.push(item);
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredGroupedEntries = Object.entries(groupedItems)
    .map(([sectionId, section]) => {
      const sectionMatches = section.title.toLowerCase().includes(normalizedQuery);
      const filteredItems = normalizedQuery
        ? section.items.filter(
            (item) =>
              sectionMatches ||
              (nameChanges[item.id] ?? item.name).toLowerCase().includes(normalizedQuery)
          )
        : section.items;

      if (normalizedQuery && !sectionMatches && filteredItems.length === 0) {
        return null;
      }

      return [sectionId, { ...section, items: filteredItems }] as const;
    })
    .filter(Boolean) as Array<[string, { title: string; items: MenuItem[] }]>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const sidebarSections = Object.entries(groupedItems).map(([sectionId, section]) => {
    const hasChanges =
      !!nameChanges[sectionId] ||
      section.items.some(
        (item) => priceChanges[item.id] !== undefined || !!nameChanges[item.id]
      );
    return {
      id: sectionId,
      title: section.title,
      itemCount: section.items.length,
      hasChanges,
    };
  });

  const navTargets = [
    "admin-tax",
    "admin-menu",
    ...filteredGroupedEntries.map(([sectionId]) => `admin-section-${sectionId}`),
  ];

  const getCurrentNavIndex = () => {
    const headerOffset = 96;
    let best = 0;
    for (let i = 0; i < navTargets.length; i++) {
      const el = document.getElementById(navTargets[i]);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= headerOffset + 8) {
        best = i;
      }
    }
    return best;
  };

  const goPrevSection = () => {
    const nextIndex = Math.max(0, getCurrentNavIndex() - 1);
    scrollToTarget(navTargets[nextIndex]);
  };

  const goNextSection = () => {
    const nextIndex = Math.min(navTargets.length - 1, getCurrentNavIndex() + 1);
    scrollToTarget(navTargets[nextIndex]);
  };

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='coffee-admin' x='0' y='0' width='400' height='400' patternUnits='userSpaceOnUse'%3E%3Cg opacity='0.06'%3E%3Ccircle cx='100' cy='100' r='30' fill='%238B4513'/%3E%3Cpath d='M50 200 Q75 180 100 200 T150 200' stroke='%238B4513' stroke-width='3' fill='none'/%3E%3Cpath d='M200 100 L220 80 L240 100 L240 130 L220 150 L200 130 Z' fill='%238B4513'/%3E%3Ccircle cx='300' cy='150' r='25' fill='%238B4513'/%3E%3Cpath d='M250 300 Q275 280 300 300 T350 300' stroke='%238B4513' stroke-width='3' fill='none'/%3E%3Cpath d='M100 300 L120 280 L140 300 L140 330 L120 350 L100 330 Z' fill='%238B4513'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23coffee-admin)'/%3E%3C/svg%3E")`,
        backgroundColor: "var(--background)",
      }}
    >
      <div className="pointer-events-none fixed inset-0 -z-10 bg-background/95 backdrop-blur-sm" />

      <header className="sticky top-0 z-50 border-b border-border/80 bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl lg:hidden"
            aria-label={sidebarOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold sm:text-2xl">پنل مدیریت کافه اوتن</h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              منو را ویرایش کنید؛ پیش‌نویس در مرورگر ذخیره می‌شود
            </p>
          </div>

          {hasUnsavedChanges ? (
            <Badge
              variant="outline"
              className="shrink-0 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            >
              {unsavedCount} تغییر
            </Badge>
          ) : (
            <Badge variant="secondary" className="hidden shrink-0 font-normal sm:inline-flex">
              ذخیره شده
            </Badge>
          )}
        </div>
      </header>

      <div className="relative z-10">
        <div className="mx-auto flex max-w-7xl gap-4 px-4 py-4 pb-28">
          <AdminSidebar
            sections={sidebarSections}
            activeSectionId={activeSectionId}
            unsavedCount={unsavedCount}
            onNavigate={scrollToTarget}
            onAddSection={() => setShowAddSectionDialog(true)}
            onFocusSearch={focusSearch}
            onLogout={handleLogout}
            mobileOpen={sidebarOpen}
            onMobileOpenChange={setSidebarOpen}
          />

          <div className="min-w-0 flex-1 space-y-4">
          {status && (
            <div
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                status.tone === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : status.tone === "error"
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {status.tone === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : status.tone === "error" ? (
                <AlertCircle className="h-4 w-4 shrink-0" />
              ) : null}
              <span>{status.message}</span>
            </div>
          )}

          <Card id="admin-tax" className="scroll-mt-24">
            <CardHeader>
              <CardTitle>پیام مالیات</CardTitle>
              <CardDescription>این پیام بالای منوی عمومی نمایش داده می‌شود</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={taxMessage}
                onChange={(e) => setTaxMessage(e.target.value)}
                placeholder="پیام مالیات را وارد کنید"
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card id="admin-menu" className="scroll-mt-24">
            <CardContent className="space-y-3 pt-6">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی آیتم یا دسته‌بندی..."
                  className="w-full pr-10"
                />
              </div>
              <Separator />
              <Button onClick={() => setShowAddSectionDialog(true)} className="w-full" variant="outline">
                <Plus className="ml-2 h-4 w-4" />
                اضافه کردن دسته‌بندی جدید
              </Button>
            </CardContent>
          </Card>

          {filteredGroupedEntries.map(([sectionId, section]) => {
            const collapsed = !!collapsedSections[sectionId];
            return (
              <Card
                key={sectionId}
                id={`admin-section-${sectionId}`}
                className="scroll-mt-24"
              >
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCollapsedSections((prev) => ({
                            ...prev,
                            [sectionId]: !prev[sectionId],
                          }))
                        }
                        aria-label={collapsed ? "باز کردن بخش" : "بستن بخش"}
                      >
                        {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      <CardTitle>{section.title}</CardTitle>
                      <span className="text-xs text-muted-foreground">({section.items.length})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingSectionName(nameChanges[sectionId] ?? section.title);
                          setShowEditSectionNameDialog(sectionId);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(sectionId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowAddItemDialog(sectionId)}>
                      <Plus className="ml-2 h-4 w-4" />
                      اضافه کردن آیتم
                    </Button>
                  </div>
                </CardHeader>
                {!collapsed && (
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right w-[45%]">نام آیتم</TableHead>
                            <TableHead className="text-right w-[55%]">قیمت (تومان)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {section.items.length > 0 ? (
                            section.items.map((item) => {
                              const newPrice = priceChanges[item.id] ?? item.price;
                              const hasChange =
                                priceChanges[item.id] !== undefined || !!nameChanges[item.id];

                              return (
                                <TableRow key={item.id} className={hasChange ? "bg-muted/60" : ""}>
                                  <TableCell className="font-medium text-right align-middle">
                                    <div className="flex items-center gap-2">
                                      <span>{nameChanges[item.id] ?? item.name}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingItemName(nameChanges[item.id] ?? item.name);
                                          setShowEditItemNameDialog(item.id);
                                        }}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteItem(item.sectionId, item.id)}
                                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right align-middle">
                                    <div className="space-y-1">
                                      <Input
                                        type="number"
                                        value={newPrice}
                                        onChange={(e) =>
                                          handlePriceChange(
                                            item.id,
                                            parseFloat(e.target.value),
                                            item.price
                                          )
                                        }
                                        className="w-full text-right"
                                        min="0"
                                        step="0.1"
                                      />
                                      {priceChanges[item.id] !== undefined && (
                                        <p className="text-xs text-muted-foreground">
                                          قبلی: {item.price.toLocaleString("fa-IR")}
                                        </p>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center text-muted-foreground">
                                آیتمی یافت نشد
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
          </div>
        </div>
      </div>

      <AdminArrowNav
        onPrev={goPrevSection}
        onNext={goNextSection}
        canPrev={navTargets.length > 1}
        canNext={navTargets.length > 1}
        hidden={sidebarOpen}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-primary/40 bg-card/95 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur supports-[backdrop-filter]:bg-card/90 ${
          sidebarOpen ? "pointer-events-none opacity-0" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {hasUnsavedChanges
                ? `${unsavedCount} تغییر در مرورگر ذخیره شد — برای انتشار دکمه ذخیره را بزنید`
                : "پیش‌نویس مرورگر خالی است"}
              <span className="mr-2 hidden text-xs opacity-70 sm:inline">Ctrl+S</span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDiscard}
                disabled={!hasUnsavedChanges || saving}
              >
                <RotateCcw className="ml-2 h-4 w-4" />
                لغو تغییرات
              </Button>
              <Button
                data-admin-save
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
              >
                <Save className="ml-2 h-4 w-4" />
                {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showAddSectionDialog} onOpenChange={setShowAddSectionDialog}>
        <DialogContent className="rtl" dir="rtl">
          <DialogHeader>
            <DialogTitle>اضافه کردن دسته‌بندی جدید</DialogTitle>
            <DialogDescription>نام دسته‌بندی جدید را وارد کنید</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">نام دسته‌بندی</Label>
              <Input
                id="section-title"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSection()}
                placeholder="مثال: نوشیدنی‌های ویژه"
                className="text-right"
                dir="rtl"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSectionDialog(false)}>
              انصراف
            </Button>
            <Button onClick={handleAddSection}>اضافه کردن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddItemDialog !== null}
        onOpenChange={(open) => !open && setShowAddItemDialog(null)}
      >
        <DialogContent className="rtl" dir="rtl">
          <DialogHeader>
            <DialogTitle>اضافه کردن آیتم جدید</DialogTitle>
            <DialogDescription>اطلاعات آیتم جدید را وارد کنید</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">نام آیتم</Label>
              <Input
                id="item-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="مثال: کاپوچینو ویژه"
                className="text-right"
                dir="rtl"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price">قیمت (تومان)</Label>
              <Input
                id="item-price"
                type="number"
                value={newItemPrice || ""}
                onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                onKeyDown={(e) =>
                  e.key === "Enter" && showAddItemDialog && handleAddItem(showAddItemDialog)
                }
                placeholder="0"
                min="0"
                step="0.1"
                className="text-right w-full"
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(null)}>
              انصراف
            </Button>
            <Button onClick={() => showAddItemDialog && handleAddItem(showAddItemDialog)}>
              اضافه کردن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEditSectionNameDialog !== null}
        onOpenChange={(open) => !open && setShowEditSectionNameDialog(null)}
      >
        <DialogContent className="rtl" dir="rtl">
          <DialogHeader>
            <DialogTitle>ویرایش نام دسته‌بندی</DialogTitle>
            <DialogDescription>نام جدید دسته‌بندی را وارد کنید</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-section-name">نام دسته‌بندی</Label>
              <Input
                id="edit-section-name"
                value={editingSectionName}
                onChange={(e) => setEditingSectionName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  showEditSectionNameDialog &&
                  handleEditSectionName(showEditSectionNameDialog)
                }
                className="text-right"
                dir="rtl"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSectionNameDialog(null)}>
              انصراف
            </Button>
            <Button
              onClick={() =>
                showEditSectionNameDialog && handleEditSectionName(showEditSectionNameDialog)
              }
            >
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEditItemNameDialog !== null}
        onOpenChange={(open) => !open && setShowEditItemNameDialog(null)}
      >
        <DialogContent className="rtl" dir="rtl">
          <DialogHeader>
            <DialogTitle>ویرایش نام آیتم</DialogTitle>
            <DialogDescription>نام جدید آیتم را وارد کنید</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item-name">نام آیتم</Label>
              <Input
                id="edit-item-name"
                value={editingItemName}
                onChange={(e) => setEditingItemName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  showEditItemNameDialog &&
                  handleEditItemName(showEditItemNameDialog)
                }
                className="text-right"
                dir="rtl"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditItemNameDialog(null)}>
              انصراف
            </Button>
            <Button
              onClick={() => showEditItemNameDialog && handleEditItemName(showEditItemNameDialog)}
            >
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
