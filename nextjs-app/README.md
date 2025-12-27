# منوی کافه اوتن - Next.js

این پروژه یک وب‌سایت منوی کافه اوتن است که با Next.js 16 و shadcn/ui ساخته شده است.

## ویژگی‌ها

- ✅ **Next.js 16** با App Router
- ✅ **shadcn/ui** برای کامپوننت‌های UI
- ✅ **Dark Mode** با next-themes
- ✅ **پشتیبانی کامل از RTL** برای زبان فارسی
- ✅ **فونت فارسی** (Vazirmatn)
- ✅ **Responsive Design** برای موبایل و دسکتاپ
- ✅ **TypeScript** برای type safety
- ✅ **Tailwind CSS** برای استایل‌دهی

## نصب و راه‌اندازی

```bash
# نصب dependencies
npm install

# اجرای dev server
npm run dev

# ساخت برای production
npm run build

# اجرای production
npm start
```

## ساختار پروژه

```
nextjs-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout با RTL و فونت فارسی
│   ├── page.tsx           # صفحه اصلی
│   └── globals.css        # استایل‌های全局
├── components/             # کامپوننت‌های React
│   ├── ui/                # کامپوننت‌های shadcn/ui
│   ├── header.tsx         # Header با navigation
│   ├── menu-item.tsx      # کامپوننت آیتم منو
│   ├── menu-section.tsx   # کامپوننت بخش منو
│   └── theme-provider.tsx # Theme provider برای Dark Mode
├── lib/                   # Utilities و داده‌ها
│   ├── menu-data.ts       # داده‌های منو
│   └── utils.ts           # Utility functions
└── public/                # فایل‌های استاتیک
    └── assets/            # تصاویر و فونت‌ها
```

## کامپوننت‌ها

### Header
Header شامل:
- لوگو کافه
- منوی ناوبری (دسکتاپ و موبایل)
- دکمه تغییر تم (Dark/Light Mode)

### MenuSection
نمایش یک بخش از منو با:
- عنوان بخش
- Grid layout برای آیتم‌ها
- Scroll to section

### MenuItem
نمایش یک آیتم منو با:
- تصویر
- نام
- توضیحات
- قیمت

## Dark Mode

Dark Mode با استفاده از `next-themes` پیاده‌سازی شده است و تنظیمات کاربر در localStorage ذخیره می‌شود.

## RTL Support

پروژه به طور کامل از RTL پشتیبانی می‌کند:
- `dir="rtl"` در HTML
- فونت فارسی (Vazirmatn)
- استایل‌های RTL در Tailwind

## داده‌های منو

داده‌های منو در `lib/menu-data.ts` تعریف شده‌اند و می‌توانید به راحتی آنها را ویرایش کنید.

## استقرار

برای استقرار در Vercel:

```bash
npm run build
```

یا می‌توانید از GitHub Actions برای استقرار خودکار استفاده کنید.

## مجوز

این پروژه برای کافه اوتن ساخته شده است.
