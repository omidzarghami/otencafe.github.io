import { NextRequest, NextResponse } from "next/server";
import { setAuthToken } from "@/lib/auth";
import { getLoginAttempts, recordFailedLogin, resetLoginAttempts } from "@/lib/price-storage";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    // دریافت IP address برای rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "unknown";
    const identifier = `login_${ip}`;

    // بررسی بن بودن
    const attempt = getLoginAttempts(identifier);
    if (attempt?.blockedUntil && Date.now() < attempt.blockedUntil) {
      return NextResponse.json(
        {
          error: "حساب شما به دلیل تلاش‌های ناموفق متعدد مسدود شده است",
          blockedUntil: attempt.blockedUntil,
        },
        { status: 429 }
      );
    }

    // رمز عبور جدید: OtenCafe2024!
    // در production باید hash را بررسی کنیم
    const isValid = password === "OtenCafe2024!";

    if (isValid) {
      // ریست کردن تلاش‌های ناموفق
      resetLoginAttempts(identifier);
      await setAuthToken();
      return NextResponse.json({ success: true });
    } else {
      // ثبت تلاش ناموفق
      const result = recordFailedLogin(identifier);
      
      if (result.blocked) {
        return NextResponse.json(
          {
            error: "رمز عبور 3 بار اشتباه وارد شد. حساب شما به مدت 10 دقیقه مسدود شده است.",
            blockedUntil: result.blockedUntil,
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        {
          error: "رمز عبور اشتباه است",
          remainingAttempts: result.remainingAttempts,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "خطا در ورود به سیستم" },
      { status: 500 }
    );
  }
}

