import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllPrices, setPrice, saveToFile, syncWithFile } from "@/lib/price-storage";

export async function POST(request: NextRequest) {
  try {
    // بررسی authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { itemId, price } = await request.json();

    if (!itemId || price === undefined || price < 0) {
      return NextResponse.json(
        { error: "شناسه آیتم و قیمت معتبر الزامی است" },
        { status: 400 }
      );
    }

    // Sync با فایل (در صورت وجود)
    await syncWithFile();
    
    // به‌روزرسانی قیمت در cache
    setPrice(itemId, price);
    
    // ذخیره در فایل (در صورت امکان)
    await saveToFile();

    return NextResponse.json({
      success: true,
      message: "قیمت با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    console.error("Error updating price:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی قیمت" },
      { status: 500 }
    );
  }
}

