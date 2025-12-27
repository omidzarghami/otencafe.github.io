import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  addCustomItem,
  syncCustomDataFromFile,
  saveCustomDataToFile,
} from "@/lib/price-storage";
import type { MenuItem } from "@/lib/menu-data";

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { sectionId, item }: { sectionId: string; item: MenuItem } =
      await request.json();

    if (!sectionId || !item.id || !item.name) {
      return NextResponse.json(
        { error: "شناسه دسته‌بندی، شناسه و نام آیتم الزامی است" },
        { status: 400 }
      );
    }

    await syncCustomDataFromFile();
    addCustomItem(sectionId, item);
    await saveCustomDataToFile();
    
    // اطمینان از sync شدن داده‌ها
    await syncCustomDataFromFile();

    return NextResponse.json({
      success: true,
      message: "آیتم با موفقیت اضافه شد",
    });
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json(
      { error: "خطا در اضافه کردن آیتم" },
      { status: 500 }
    );
  }
}

