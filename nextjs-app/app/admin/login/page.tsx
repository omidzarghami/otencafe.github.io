"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    // بررسی بن بودن از localStorage
    const blocked = localStorage.getItem("login_blocked_until");
    if (blocked) {
      const blockedDate = new Date(parseInt(blocked));
      if (new Date() < blockedDate) {
        setBlockedUntil(blockedDate);
      } else {
        localStorage.removeItem("login_blocked_until");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // بررسی بن بودن
    if (blockedUntil && new Date() < blockedUntil) {
      const minutesLeft = Math.ceil((blockedUntil.getTime() - new Date().getTime()) / 60000);
      setError(`حساب شما به مدت ${minutesLeft} دقیقه مسدود شده است. لطفاً بعداً تلاش کنید.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ریست کردن تلاش‌های ناموفق
        setBlockedUntil(null);
        localStorage.removeItem("login_blocked_until");
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError(data.error || "رمز عبور اشتباه است");
        
        // بررسی بن شدن
        if (data.blockedUntil) {
          const blockedDate = new Date(data.blockedUntil);
          setBlockedUntil(blockedDate);
          localStorage.setItem("login_blocked_until", blockedDate.getTime().toString());
          const minutesLeft = Math.ceil((blockedDate.getTime() - new Date().getTime()) / 60000);
          setError(`رمز عبور 3 بار اشتباه وارد شد. حساب شما به مدت ${minutesLeft} دقیقه مسدود شده است.`);
        } else if (data.remainingAttempts !== undefined) {
          setError(`رمز عبور اشتباه است. ${data.remainingAttempts} تلاش باقی مانده.`);
        }
      }
    } catch (err) {
      setError("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='coffee-admin' x='0' y='0' width='400' height='400' patternUnits='userSpaceOnUse'%3E%3Cg opacity='0.08'%3E%3Ccircle cx='100' cy='100' r='30' fill='%238B4513'/%3E%3Cpath d='M50 200 Q75 180 100 200 T150 200' stroke='%238B4513' stroke-width='3' fill='none'/%3E%3Cpath d='M200 100 L220 80 L240 100 L240 130 L220 150 L200 130 Z' fill='%238B4513'/%3E%3Ccircle cx='300' cy='150' r='25' fill='%238B4513'/%3E%3Cpath d='M250 300 Q275 280 300 300 T350 300' stroke='%238B4513' stroke-width='3' fill='none'/%3E%3Cpath d='M100 300 L120 280 L140 300 L140 330 L120 350 L100 330 Z' fill='%238B4513'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23coffee-admin)'/%3E%3C/svg%3E")`,
      backgroundColor: '#F5E6D3'
    }}>
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-amber-100/60 to-amber-200/40 dark:from-amber-950/80 dark:via-amber-900/60 dark:to-amber-800/40 backdrop-blur-sm"></div>
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-2 border-amber-200 dark:border-amber-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            ورود به پنل مدیریت
          </CardTitle>
          <CardDescription className="text-center">
            لطفاً رمز عبور را وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور را وارد کنید"
                  required
                  disabled={loading || (blockedUntil !== null && new Date() < blockedUntil)}
                  className="text-center pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || (blockedUntil !== null && new Date() < blockedUntil)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500 text-center">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "در حال ورود..." : "ورود"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

