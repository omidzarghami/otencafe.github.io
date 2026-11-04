import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  setPrice,
  saveToFile,
  syncWithFile,
  getAllPrices,
} from "@/lib/price-storage";

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const body = await request.json();
    const prices = body?.prices as Record<string, number> | undefined;

    if (!prices || typeof prices !== "object" || Array.isArray(prices)) {
      return NextResponse.json(
        { error: "لیست قیمت معتبر الزامی است" },
        { status: 400 }
      );
    }

    await syncWithFile();

    let updated = 0;
    for (const [itemId, price] of Object.entries(prices)) {
      if (!itemId || typeof price !== "number" || Number.isNaN(price) || price < 0) {
        continue;
      }
      setPrice(itemId, price);
      updated += 1;
    }

    await saveToFile();

    return NextResponse.json({
      success: true,
      updated,
      prices: getAllPrices(),
      durable: !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        (process.env.MENU_WRITE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY)
      ),
    });
  } catch (error) {
    console.error("Error batch updating prices:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی قیمت‌ها" },
      { status: 500 }
    );
  }
}
