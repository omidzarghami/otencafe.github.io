"use client";

import { useEffect, useState } from "react";
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
import { LogOut, Save, Plus, Pencil, Trash2 } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  sectionId: string;
  sectionTitle: string;
  price: number;
  description: string;
}

export default function DashboardPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [sections, setSections] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [taxMessage, setTaxMessage] = useState("");
  const [taxMessageChanged, setTaxMessageChanged] = useState(false);
  const [nameChanges, setNameChanges] = useState<Record<string, string>>({}); // sectionId or itemId -> new name
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

  useEffect(() => {
    checkAuth();
    loadItems();
    loadSections();
    loadTaxMessage();
  }, []);

  const loadTaxMessage = async () => {
    try {
      const response = await fetch("/api/settings/tax-message");
      if (response.ok) {
        const data = await response.json();
        setTaxMessage(data.taxMessage);
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
    } catch (error) {
      router.push("/admin/login");
    }
  };

  const loadItems = async () => {
    try {
      const response = await fetch("/api/menu/items");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      } else if (response.status === 401) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => {
    try {
      const response = await fetch("/api/menu/sections");
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error("Error loading sections:", error);
    }
  };

  const handlePriceChange = (itemId: string, newPrice: number) => {
    setPriceChanges((prev) => ({
      ...prev,
      [itemId]: newPrice,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(priceChanges).map(([itemId, price]) => ({
        itemId,
        price,
      }));

      // ذخیره قیمت‌ها
      for (const update of updates) {
        await fetch("/api/menu/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(update),
        });
      }

      // ذخیره تغییرات نام دسته‌بندی‌ها و آیتم‌ها
      const groupedItemsForCheck = items.reduce((acc, item) => {
        if (!acc[item.sectionId]) {
          acc[item.sectionId] = true;
        }
        return acc;
      }, {} as Record<string, boolean>);

      for (const [id, newName] of Object.entries(nameChanges)) {
        if (groupedItemsForCheck[id]) {
          // این یک sectionId است
          await fetch("/api/menu/sections/update-name", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sectionId: id, newName }),
          });
        } else {
          // این یک itemId است
          await fetch("/api/menu/items/update-name", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ itemId: id, newName }),
          });
        }
      }

      // ذخیره پیام مالیات
      if (taxMessageChanged) {
        await fetch("/api/settings/tax-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taxMessage }),
        });
        setTaxMessageChanged(false);
      }

      // به‌روزرسانی state
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

      setPriceChanges({});
      setNameChanges({});
      alert("تغییرات با موفقیت ذخیره شدند");
      await loadItems(); // بارگذاری مجدد برای نمایش تغییرات
    } catch (error) {
      alert("خطا در ذخیره تغییرات");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      alert("لطفاً نام دسته‌بندی را وارد کنید");
      return;
    }

    const sectionId = `custom-${Date.now()}`;
    const newSection = {
      id: sectionId,
      title: newSectionTitle,
      items: [],
    };

    try {
      const response = await fetch("/api/menu/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSection),
      });

      if (response.ok) {
        setShowAddSectionDialog(false);
        setNewSectionTitle("");
        // کمی تاخیر برای اطمینان از نوشته شدن فایل
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadSections();
        await loadItems();
        router.refresh();
        alert("دسته‌بندی با موفقیت اضافه شد");
      } else {
        alert("خطا در اضافه کردن دسته‌بندی");
      }
    } catch (error) {
      alert("خطا در اضافه کردن دسته‌بندی");
    }
  };

  const handleAddItem = async (sectionId: string) => {
    if (!newItemName.trim() || newItemPrice <= 0) {
      alert("لطفاً نام و قیمت آیتم را وارد کنید");
      return;
    }

    const itemId = `custom-${Date.now()}`;
    const newItem = {
      id: itemId,
      name: newItemName,
      description: "",
      price: newItemPrice,
      image: "/assets/images/a-cup-espresso.png",
    };

    try {
      const response = await fetch("/api/menu/items/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sectionId, item: newItem }),
      });

      if (response.ok) {
        setShowAddItemDialog(null);
        setNewItemName("");
        setNewItemPrice(0);
        // کمی تاخیر برای اطمینان از نوشته شدن فایل
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadItems();
        router.refresh();
        alert("آیتم با موفقیت اضافه شد");
      } else {
        alert("خطا در اضافه کردن آیتم");
      }
    } catch (error) {
      alert("خطا در اضافه کردن آیتم");
    }
  };

  const handleEditSectionName = async (sectionId: string) => {
    if (!editingSectionName.trim()) {
      alert("لطفاً نام دسته‌بندی را وارد کنید");
      return;
    }

    setNameChanges((prev) => ({
      ...prev,
      [sectionId]: editingSectionName,
    }));

    setShowEditSectionNameDialog(null);
    setEditingSectionName("");
  };

  const handleEditItemName = async (itemId: string) => {
    if (!editingItemName.trim()) {
      alert("لطفاً نام آیتم را وارد کنید");
      return;
    }

    setNameChanges((prev) => ({
      ...prev,
      [itemId]: editingItemName,
    }));

    setShowEditItemNameDialog(null);
    setEditingItemName("");
  };

  const handleDeleteItem = async (sectionId: string, itemId: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟")) {
      return;
    }

    try {
      const response = await fetch("/api/menu/items/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sectionId, itemId }),
      });

      if (response.ok) {
        // کمی تاخیر برای اطمینان از نوشته شدن فایل
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadItems();
        router.refresh();
        alert("آیتم با موفقیت حذف شد");
      } else {
        const data = await response.json();
        alert(data.error || "خطا در حذف آیتم");
      }
    } catch (error) {
      alert("خطا در حذف آیتم");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این دسته‌بندی را حذف کنید؟ تمام آیتم‌های این دسته‌بندی نیز حذف خواهند شد.")) {
      return;
    }

    try {
      const response = await fetch("/api/menu/sections/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sectionId }),
      });

      if (response.ok) {
        // کمی تاخیر برای اطمینان از نوشته شدن فایل
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadSections();
        await loadItems();
        router.refresh();
        alert("دسته‌بندی با موفقیت حذف شد");
      } else {
        const data = await response.json();
        alert(data.error || "خطا در حذف دسته‌بندی");
      }
    } catch (error) {
      alert("خطا در حذف دسته‌بندی");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // گروه‌بندی آیتم‌ها بر اساس section
  // ابتدا همه دسته‌بندی‌ها را اضافه می‌کنیم (حتی اگر خالی باشند)
  const groupedItems = sections.reduce((acc, section) => {
    acc[section.id] = {
      title: nameChanges[section.id] ?? section.title,
      items: [],
    };
    return acc;
  }, {} as Record<string, { title: string; items: MenuItem[] }>);

  // سپس آیتم‌ها را به دسته‌بندی‌های مربوطه اضافه می‌کنیم
  items.forEach((item) => {
    if (!groupedItems[item.sectionId]) {
      groupedItems[item.sectionId] = {
        title: nameChanges[item.sectionId] ?? item.sectionTitle,
        items: [],
      };
    }
    groupedItems[item.sectionId].items.push(item);
  });

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

  return (
    <div className="min-h-screen p-4 relative overflow-hidden" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='coffee-admin' x='0' y='0' width='400' height='400' patternUnits='userSpaceOnUse'%3E%3Cg opacity='0.06'%3E%3Ccircle cx='100' cy='100' r='30' fill='%238B4513'/%3E%3Cpath d='M50 200 Q75 180 100 200 T150 200' stroke='%238B4513' stroke-width='3' fill='none'/%3E%3Cpath d='M200 100 L220 80 L240 100 L240 130 L220 150 L200 130 Z' fill='%238B4513'/%3E%3Ccircle cx='300' cy='150' r='25' fill='%238B4513'/%3E%3Cpath d='M250 300 Q275 280 300 300 T350 300' stroke='%238B4513' stroke-width='3' fill='none'/%3E%3Cpath d='M100 300 L120 280 L140 300 L140 330 L120 350 L100 330 Z' fill='%238B4513'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23coffee-admin)'/%3E%3C/svg%3E")`,
      backgroundColor: 'var(--background)'
    }}>
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm"></div>
      <div className="relative z-10">
      <div className="container mx-auto max-w-7xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold">
                  پنل مدیریت کافه اوتن
                </CardTitle>
                <CardDescription>
                  مدیریت قیمت‌های منو
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="ml-2 h-4 w-4" />
                خروج
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Tax Message Editor */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>پیام مالیات</CardTitle>
            <CardDescription>
              پیامی که در بالای صفحه نمایش داده می‌شود
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                value={taxMessage}
                onChange={(e) => {
                  setTaxMessage(e.target.value);
                  setTaxMessageChanged(true);
                }}
                placeholder="پیام مالیات را وارد کنید"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {(Object.keys(priceChanges).length > 0 || Object.keys(nameChanges).length > 0 || taxMessageChanged) && (
          <Card className="mb-6 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {Object.keys(priceChanges).length + Object.keys(nameChanges).length + (taxMessageChanged ? 1 : 0)} تغییر ذخیره نشده
                </p>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="ml-2 h-4 w-4" />
                  {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* دکمه اضافه کردن دسته‌بندی جدید */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Button
              onClick={() => setShowAddSectionDialog(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="ml-2 h-4 w-4" />
              اضافه کردن دسته‌بندی جدید
            </Button>
          </CardContent>
        </Card>

        {Object.entries(groupedItems).map(([sectionId, section]) => (
          <Card key={sectionId} className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>{nameChanges[sectionId] ?? section.title}</CardTitle>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddItemDialog(sectionId)}
                >
                  <Plus className="ml-2 h-4 w-4" />
                  اضافه کردن آیتم
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right w-[40%]">نام آیتم</TableHead>
                      <TableHead className="text-right w-[30%]">قیمت فعلی (تومان)</TableHead>
                      <TableHead className="text-right w-[30%]">قیمت جدید (تومان)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.items.length > 0 ? (
                      section.items.map((item) => {
                        const newPrice = priceChanges[item.id] ?? item.price;
                        const hasChange = priceChanges[item.id] !== undefined;

                        return (
                          <TableRow 
                            key={item.id} 
                            className={hasChange ? "bg-muted" : ""}
                          >
                            <TableCell className="font-medium text-right">
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
                            <TableCell className="text-right">
                              {item.price.toLocaleString("fa-IR")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                value={newPrice}
                                onChange={(e) =>
                                  handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                                }
                                className="w-full max-w-32 text-right"
                                min="0"
                                step="0.1"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          آیتمی یافت نشد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>

      {/* Dialog برای اضافه کردن دسته‌بندی جدید */}
      <Dialog open={showAddSectionDialog} onOpenChange={setShowAddSectionDialog}>
        <DialogContent className="rtl" dir="rtl">
          <DialogHeader>
            <DialogTitle>اضافه کردن دسته‌بندی جدید</DialogTitle>
            <DialogDescription>
              نام دسته‌بندی جدید را وارد کنید
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">نام دسته‌بندی</Label>
              <Input
                id="section-title"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="مثال: نوشیدنی‌های ویژه"
                className="text-right"
                dir="rtl"
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

      {/* Dialog برای اضافه کردن آیتم جدید */}
      <Dialog open={showAddItemDialog !== null} onOpenChange={(open) => !open && setShowAddItemDialog(null)}>
        <DialogContent className="rtl" dir="rtl">
          <DialogHeader>
            <DialogTitle>اضافه کردن آیتم جدید</DialogTitle>
            <DialogDescription>
              اطلاعات آیتم جدید را وارد کنید
            </DialogDescription>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price">قیمت (تومان)</Label>
              <Input
                id="item-price"
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.1"
                className="text-right"
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

      {/* Dialog برای ویرایش نام دسته‌بندی */}
      <Dialog open={showEditSectionNameDialog !== null} onOpenChange={(open) => !open && setShowEditSectionNameDialog(null)}>
        <DialogContent className="rtl" dir="rtl">
          <DialogHeader>
            <DialogTitle>ویرایش نام دسته‌بندی</DialogTitle>
            <DialogDescription>
              نام جدید دسته‌بندی را وارد کنید
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-section-name">نام دسته‌بندی</Label>
              <Input
                id="edit-section-name"
                value={editingSectionName}
                onChange={(e) => setEditingSectionName(e.target.value)}
                placeholder="نام دسته‌بندی"
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSectionNameDialog(null)}>
              انصراف
            </Button>
            <Button onClick={() => showEditSectionNameDialog && handleEditSectionName(showEditSectionNameDialog)}>
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog برای ویرایش نام آیتم */}
      <Dialog open={showEditItemNameDialog !== null} onOpenChange={(open) => !open && setShowEditItemNameDialog(null)}>
        <DialogContent className="rtl" dir="rtl">
          <DialogHeader>
            <DialogTitle>ویرایش نام آیتم</DialogTitle>
            <DialogDescription>
              نام جدید آیتم را وارد کنید
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item-name">نام آیتم</Label>
              <Input
                id="edit-item-name"
                value={editingItemName}
                onChange={(e) => setEditingItemName(e.target.value)}
                placeholder="نام آیتم"
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditItemNameDialog(null)}>
              انصراف
            </Button>
            <Button onClick={() => showEditItemNameDialog && handleEditItemName(showEditItemNameDialog)}>
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

