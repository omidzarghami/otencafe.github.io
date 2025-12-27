import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  removeCustomItem,
  deleteItem,
  syncCustomDataFromFile,
  saveCustomDataToFile,
} from "@/lib/price-storage";

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { sectionId, itemId }: { sectionId: string; itemId: string } =
      await request.json();

    if (!sectionId || !itemId) {
      return NextResponse.json(
        { error: "شناسه دسته‌بندی و آیتم الزامی است" },
        { status: 400 }
      );
    }

    await syncCustomDataFromFile();
    
    // اگر آیتم سفارشی است، از customItemsCache حذف کن
    if (itemId.startsWith("custom-")) {
      removeCustomItem(sectionId, itemId);
    }
    
    // همه آیتم‌ها (سفارشی و اصلی) را به deletedItems اضافه کن
    deleteItem(itemId);
    
    await saveCustomDataToFile();
    
    // اطمینان از sync شدن داده‌ها
    await syncCustomDataFromFile();

    return NextResponse.json({
      success: true,
      message: "آیتم با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "خطا در حذف آیتم" },
      { status: 500 }
    );
  }
}

