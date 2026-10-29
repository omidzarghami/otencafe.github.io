"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navigationItems } from "@/lib/menu-data";
import Image from "next/image";
import Link from "next/link";
import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";

export function Header() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-32 h-12">
              <Image
                src="/assets/images/oten-cafe-logo.jpg"
                alt="لوگو کافه اوتن"
                fill
                className="object-contain"
                sizes="128px"
              />
            </div>
            <h1 className="text-xl font-bold hidden md:block">منوی کافه اوتن</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                asChild
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-300 hover:scale-110 hover:bg-accent/50 group"
              >
                <Link 
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(item.id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={24}
                    height={24}
                    className="object-contain transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6"
                  />
                  <span className="text-xs transition-all duration-300 group-hover:font-semibold">{item.title}</span>
                </Link>
              </Button>
            ))}
            <Button
              variant="ghost"
              asChild
              className="flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-300 hover:scale-110 hover:bg-accent/50 group"
            >
              <a href="tel:+982188285710">
                <Image
                  src="/assets/images/icons/phone.png"
                  alt="تماس با اوتن"
                  width={24}
                  height={24}
                  className="object-contain transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6"
                />
                <span className="text-xs transition-all duration-300 group-hover:font-semibold">تماس با اوتن</span>
              </a>
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">تغییر تم</span>
            </Button>

            {/* Mobile Navigation */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      asChild
                      className="flex items-center gap-3 justify-start h-auto py-4 transition-all duration-300 hover:translate-x-2 hover:bg-accent/50 group"
                      onClick={() => setOpen(false)}
                    >
                      <Link 
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setOpen(false);
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        <Image
                          src={item.icon}
                          alt={item.title}
                          width={32}
                          height={32}
                          className="object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                        />
                        <span className="transition-all duration-300 group-hover:font-semibold">{item.title}</span>
                      </Link>
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    asChild
                    className="flex items-center gap-3 justify-start h-auto py-4 transition-all duration-300 hover:translate-x-2 hover:bg-accent/50 group"
                    onClick={() => setOpen(false)}
                  >
                    <a href="tel:+982188285710">
                      <Image
                        src="/assets/images/icons/phone.png"
                        alt="تماس با اوتن"
                        width={32}
                        height={32}
                        className="object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                      />
                      <span className="transition-all duration-300 group-hover:font-semibold">تماس با اوتن</span>
                    </a>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

