import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  updateItemName,
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

    const { itemId, newName }: { itemId: string; newName: string } =
      await request.json();

    if (!itemId || !newName) {
      return NextResponse.json(
        { error: "شناسه آیتم و نام جدید الزامی است" },
        { status: 400 }
      );
    }

    await syncCustomDataFromFile();
    updateItemName(itemId, newName);
    await saveCustomDataToFile();

    return NextResponse.json({
      success: true,
      message: "نام آیتم با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    console.error("Error updating item name:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی نام آیتم" },
      { status: 500 }
    );
  }
}

