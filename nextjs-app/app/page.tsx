"use client";

import { Header } from "@/components/header";
import { MenuSection } from "@/components/menu-section";
import { MenuSection as MenuSectionType } from "@/lib/menu-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUp, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [menuSections, setMenuSections] = useState<MenuSectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [taxMessage, setTaxMessage] = useState("قیمت ها بدون احتساب مالیات بر افزایش افزوده می باشد.");
  const [showTaxBanner, setShowTaxBanner] = useState(true);

  useEffect(() => {
    loadMenu();
    loadTaxMessage();
    
    // بررسی localStorage برای نمایش بنر مالیات
    const taxBannerHidden = localStorage.getItem("taxBannerHidden");
    if (taxBannerHidden === "true") {
      setShowTaxBanner(false);
    }
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const loadMenu = async () => {
    try {
      const response = await fetch("/api/menu/public");
      if (response.ok) {
        const data = await response.json();
        setMenuSections(data.sections);
      }
    } catch (error) {
      console.error("Error loading menu:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Warning Banner */}
      {taxMessage && showTaxBanner && (
        <div className="bg-muted border-b relative">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-3">
              <p className="text-center text-sm text-muted-foreground flex-1">
                {taxMessage}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-muted-foreground/20"
                onClick={() => {
                  setShowTaxBanner(false);
                  localStorage.setItem("taxBannerHidden", "true");
                }}
                aria-label="بستن پیام مالیات"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Sections */}
      {loading ? (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">در حال بارگذاری منو...</p>
        </div>
      ) : (
        menuSections.map((section) => (
          <MenuSection key={section.id} section={section} />
        ))
      )}

      {/* Map Section */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4 text-center">موقعیت کافه</h2>
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d18323.088858530682!2d51.384378350476695!3d35.72387970715075!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e01ffd14f118d%3A0xcf7f2f822de3bb52!2sOten%20Cafe!5e0!3m2!1sen!2s!4v1713100894047!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-xs text-muted-foreground">
              توسعه یافته توسط{" "}
              <a
                href="mailto:omidzarghami@gmail.com"
                className="font-medium text-foreground hover:underline transition-colors"
              >
                Omid Zarghami
              </a>
              {" "}به عنوان{" "}
              <span className="font-medium text-foreground">Developer</span>
            </p>
            <a
              href="mailto:omidzarghami@gmail.com"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
              omidzarghami@gmail.com
          </a>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 rounded-full w-12 h-12 p-0 shadow-lg z-50"
          size="icon"
          aria-label="برو بالا"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
      </main>
  );
}
