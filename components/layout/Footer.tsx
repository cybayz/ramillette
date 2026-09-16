"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

export function Footer() {
  const pathname = usePathname();
  const { language } = useLanguageStore();
  const isAr = Boolean(pathname?.startsWith("/ar"));

  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  const tFooter = isAr
    ? {
        followUs: "تابعنا :",
        emailPlaceholder: "أدخل بريدك الإلكتروني",
        newsletterSub: "ابق على اطلاع بأحدث منتجاتنا وأخبارنا",
        aboutTitle: "About Ramillette",
        aboutDesc:
          "عطور راميلليت هي دار عطور راقية تجمع بين التراث العطري للشرق الأوسط وصناعة العطور الفرنسية المعاصرة. صُنعت في الإمارات العربية المتحدة، مع بوتيكنا الرئيسي في سوق الوكرة التاريخي، قطر.",
        destinationTitle: "Your Fragrance Destination",
        destinationDesc:
          "تسوق العطور المميزة، والزيوت المركزة، وأكثر من 50 عطرًا فاخرًا مستوحى عبر الإنترنت — مع التوصيل في جميع أنحاء قطر.",
        getInTouch: "Get in touch",
        aboutCol: "About",
        accountCol: "Account",
        policiesCol: "Policies",
        aboutLink: "نبذة عنا",
        contactLink: "اتصل بنا",
        blogLink: "المدونة",
        helpLink: "المساعدة",
        faqLink: "الأسئلة الشائعة",
        myBag: "سلتي",
        wishlist: "قائمة الرغبات",
        myOrders: "طلباتي",
        cancellation: "سياسة الإلغاء",
        returns: "سياسة الإرجاع",
        refund: "سياسة الاسترداد",
        exchange: "سياسة الاستبدال",
        copyright: "© 2026 راميلليت. جميع الحقوق محفوظة.",
        designedBy: "تصميم",
        subscribedMsg: "شكرًا لاشتراكك في تحديثات راميلليت!",
      }
    : {
        followUs: "Follow Us :",
        emailPlaceholder: "Enter email id",
        newsletterSub: "Stay up to date with our latest products and news",
        aboutTitle: "About Ramillette",
        aboutDesc:
          "Ramillette Perfumes is an upscale fragrance house blending Middle Eastern aromatic heritage with contemporary French perfumery. Manufactured in the UAE, with our marquee retail boutique at historic Souq Al Wakra, Qatar.",
        destinationTitle: "Your Fragrance Destination",
        destinationDesc:
          "Shop signature parfums, concentrated oils, and our 50+ luxury inspired collection online — with delivery across Qatar.",
        getInTouch: "Get in touch",
        aboutCol: "About",
        accountCol: "Account",
        policiesCol: "Policies",
        aboutLink: "About",
        contactLink: "Contact Us",
        blogLink: "Blog",
        helpLink: "Help",
        faqLink: "FAQ",
        myBag: "My Bag",
        wishlist: "Wishlist",
        myOrders: "My Orders",
        cancellation: "Cancellation Policy",
        returns: "Returns Policy",
        refund: "Refund Policy",
        exchange: "Exchange Policy",
        copyright: "© 2026 Ramillette. All Right Reserved.",
        designedBy: "Designed by",
        subscribedMsg: "Thank you for subscribing to Ramillette updates!",
      };

  return (
    <footer className="bg-[#050505] text-neutral-300 pt-12 pb-8 border-t border-[#1a1a1a]">
      <div className="ramillette-container">
        {/* Foot Top: Logo + Socials & Newsletter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-[#222]">
          {/* Logo & Follow Us */}
          <div className="space-y-4 text-start">
            <Link href={isAr ? "/ar" : "/"} className="inline-block">
              <img
                src="/ramillette-logo-black.svg"
                alt="Ramillette"
                className="h-9 md:h-11 w-auto filter brightness-0 invert"
              />
            </Link>

            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <span className="font-semibold text-white">{tFooter.followUs}</span>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/ramillette_perfumes"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-7 h-7 rounded-full bg-[#1e1e1e] hover:bg-[#333] text-white flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/97466097444?text=Hi+Ramillette%21+I+have+a+question+about+your+products."
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-7 h-7 rounded-full bg-[#1e1e1e] hover:bg-[#25D366] text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="w-full lg:w-auto text-start">
            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 bg-white/10 text-emerald-300 text-xs rounded-md border border-emerald-500/30">
                <Check size={16} />
                <span>{tFooter.subscribedMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2 max-w-md">
                <div className="flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={tFooter.emailPlaceholder}
                    required
                    className="bg-white text-black placeholder:text-neutral-500 text-xs px-3.5 py-2.5 rounded-s-[4px] border-none focus:outline-none w-[200px] sm:w-[260px] text-start"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="bg-black hover:bg-neutral-800 text-white px-3.5 py-2.5 rounded-e-[4px] border border-neutral-700 transition-colors flex items-center justify-center font-bold text-sm"
                  >
                    {isAr ? "↖" : "↗"}
                  </button>
                </div>
                <p className="text-[11.5px] text-neutral-400">
                  {tFooter.newsletterSub}
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Foot About Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-b border-[#222] text-xs leading-relaxed text-neutral-400 text-start">
          <div>
            <h4 className="text-sm font-semibold text-white mb-2 font-heading">
              {tFooter.aboutTitle}
            </h4>
            <p>{tFooter.aboutDesc}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2 font-heading">
              {tFooter.destinationTitle}
            </h4>
            <p>{tFooter.destinationDesc}</p>
          </div>
        </div>

        {/* Foot Columns: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-b border-[#222] text-xs text-start">
          {/* Col 1 */}
          <div>
            <h5 className="text-sm font-semibold text-white mb-4">
              {tFooter.getInTouch}
            </h5>
            <div className="space-y-2 text-neutral-400">
              <p>contact@ramillette.com</p>
              <p dir="ltr" className="text-start">+97466097444</p>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h5 className="text-sm font-semibold text-white mb-4">
              {tFooter.aboutCol}
            </h5>
            <div className="space-y-2.5 flex flex-col text-neutral-400">
              <Link href={isAr ? "/ar/pages/about-us" : "/pages/about-us"} className="hover:text-white transition-colors">
                {tFooter.aboutLink}
              </Link>
              <Link href={isAr ? "/ar/pages/contact" : "/pages/contact"} className="hover:text-white transition-colors">
                {tFooter.contactLink}
              </Link>
              <Link href={isAr ? "/ar/blogs/news" : "/blogs/news"} className="hover:text-white transition-colors">
                {tFooter.blogLink}
              </Link>
              <Link href={isAr ? "/ar/pages/help" : "/pages/help"} className="hover:text-white transition-colors">
                {tFooter.helpLink}
              </Link>
              <Link href={isAr ? "/ar/pages/faqs" : "/pages/faqs"} className="hover:text-white transition-colors">
                {tFooter.faqLink}
              </Link>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <h5 className="text-sm font-semibold text-white mb-4">
              {tFooter.accountCol}
            </h5>
            <div className="space-y-2.5 flex flex-col text-neutral-400">
              <Link href={isAr ? "/ar/cart" : "/cart"} scroll={true} className="hover:text-white transition-colors">
                {tFooter.myBag}
              </Link>
              <Link href={isAr ? "/ar/wishlist" : "/wishlist"} scroll={true} className="hover:text-white transition-colors">
                {tFooter.wishlist}
              </Link>
              <Link href={isAr ? "/ar/account" : "/account"} scroll={true} className="hover:text-white transition-colors">
                {tFooter.myOrders}
              </Link>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h5 className="text-sm font-semibold text-white mb-4">
              {tFooter.policiesCol}
            </h5>
            <div className="space-y-2.5 flex flex-col text-neutral-400">
              <Link href={isAr ? "/ar/pages/cancellation-policy" : "/pages/cancellation-policy"} className="hover:text-white transition-colors">
                {tFooter.cancellation}
              </Link>
              <Link href={isAr ? "/ar/pages/returns-policy" : "/pages/returns-policy"} className="hover:text-white transition-colors">
                {tFooter.returns}
              </Link>
              <Link href={isAr ? "/ar/pages/refund-policy" : "/pages/refund-policy"} className="hover:text-white transition-colors">
                {tFooter.refund}
              </Link>
              <Link href={isAr ? "/ar/pages/exchange-policy" : "/pages/exchange-policy"} className="hover:text-white transition-colors">
                {tFooter.exchange}
              </Link>
            </div>
          </div>
        </div>

        {/* Foot Bottom: Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>{tFooter.copyright}</div>
          <div className="text-neutral-500">
            {tFooter.designedBy}{" "}
            <a
              href="https://wa.me/918848764059?text=i%20want%20ramillette%20type%20ecommerce%20website"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white underline transition-colors"
            >
              creatyvot
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
