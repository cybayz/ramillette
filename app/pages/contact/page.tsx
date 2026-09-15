"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MessageSquare, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

export default function ContactPage() {
  const { language } = useLanguageStore();
  const isArabic = language === "ar";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-page">
      {/* Contact Hero Banner */}
      <div className="contact-hero">
        <div className="ramillette-container max-w-[1240px] mx-auto">
          {/* Breadcrumb */}
          <nav className="policy-breadcrumb" aria-label="Breadcrumb">
            <Link href={isArabic ? "/ar" : "/"}>
              {isArabic ? "الرئيسية" : "Home"}
            </Link>
            <span className="policy-breadcrumb__sep" aria-hidden="true">/</span>
            <span className="policy-breadcrumb__current">
              {isArabic ? "اتصل بنا" : "Contact"}
            </span>
          </nav>

          <p className="about-hero__eyebrow">
            {isArabic ? "تواصل معنا" : "GET IN TOUCH"}
          </p>
          <h1 className="about-hero__title">
            {isArabic ? "اتصل بنا" : "Contact"}
          </h1>
          <p className="about-hero__tagline">
            {isArabic
              ? "هل لديك أسئلة حول طلب، أو عطر، أو زيارة متجرنا؟ يسعدنا دائماً أن نسمع منك."
              : "Questions about an order, fragrance, or store visit? We'd love to hear from you."}
          </p>
        </div>
      </div>

      {/* Main Two-Column Contact Layout */}
      <div className="ramillette-container max-w-[1240px] mx-auto">
        <div className="contact-layout">
          {/* Left Column: Reach Us Card & Quick Links */}
          <aside className="contact-aside">
            <div className="contact-card">
              <h2>{isArabic ? "معلومات الاتصال" : "Reach us"}</h2>

              {/* Email */}
              <a className="contact-row" href="mailto:contact@ramillette.com">
                <span className="contact-row__icon" aria-hidden="true">
                  <Mail size={18} strokeWidth={1.8} />
                </span>
                <span>
                  <strong>{isArabic ? "البريد الإلكتروني" : "Email"}</strong>
                  <span>contact@ramillette.com</span>
                </span>
              </a>

              {/* Phone */}
              <a className="contact-row" href="tel:+97466097444">
                <span className="contact-row__icon" aria-hidden="true">
                  <Phone size={18} strokeWidth={1.8} />
                </span>
                <span>
                  <strong>{isArabic ? "الهاتف" : "Phone"}</strong>
                  <span>+97466097444</span>
                </span>
              </a>

              {/* WhatsApp */}
              <a
                className="contact-row"
                href="https://wa.me/97466097444?text=Hi+Ramillette%21+I+have+a+question."
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="contact-row__icon" aria-hidden="true">
                  <MessageSquare size={18} strokeWidth={1.8} />
                </span>
                <span>
                  <strong>{isArabic ? "واتساب" : "WhatsApp"}</strong>
                  <span>{isArabic ? "تحدث مع فريقنا" : "Chat with our team"}</span>
                </span>
              </a>

              {/* Hours */}
              <div className="contact-row contact-row--static">
                <span className="contact-row__icon" aria-hidden="true">
                  <Clock size={18} strokeWidth={1.8} />
                </span>
                <span>
                  <strong>{isArabic ? "ساعات العمل" : "Hours"}</strong>
                  <span>
                    {isArabic
                      ? "السبت–الخميس 10ص–10م · الجمعة 2م–10م"
                      : "Sat–Thu 10am–10pm · Fri 2pm–10pm"}
                  </span>
                </span>
              </div>

              {/* Location */}
              <div className="contact-row contact-row--static">
                <span className="contact-row__icon" aria-hidden="true">
                  <MapPin size={18} strokeWidth={1.8} />
                </span>
                <span>
                  <strong>{isArabic ? "الموقع" : "Location"}</strong>
                  <span>
                    {isArabic
                      ? "سوق الوكرة، قطر — الإنتاج والبيع بالتجزئة أيضًا في الإمارات"
                      : "Souq Al Wakra, Qatar — production & retail also in the UAE"}
                  </span>
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="contact-quick">
              <Link href="/pages/help">{isArabic ? "المساعدة" : "Help"}</Link>
              <Link href="/pages/faqs">{isArabic ? "الأسئلة الشائعة" : "FAQ"}</Link>
              <Link href="/pages/returns-policy">
                {isArabic ? "سياسة الإرجاع" : "Returns Policy"}
              </Link>
            </div>
          </aside>

          {/* Right Column: Send a Message Form + Embedded Location Map */}
          <div className="contact-main">
            <div className="contact-form-card">
              <h2>{isArabic ? "أرسل رسالة" : "Send a message"}</h2>
              <p className="contact-form-card__sub">
                {isArabic
                  ? "شاركنا بعض التفاصيل وسنعاود الاتصال بك في أقرب وقت ممكن."
                  : "Share a few details and we'll get back to you as soon as we can."}
              </p>

              {submitted ? (
                <div className="contact-success flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-[#4E6548] shrink-0" />
                  <span>
                    {isArabic
                      ? "شكراً لتواصلك معنا! سيقوم فريق خدمة العملاء بالرد عليك قريباً."
                      : "Thank you for reaching out! Our team will get back to you as soon as possible."}
                  </span>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-fields">
                  {/* Name */}
                  <label className="contact-field">
                    <span>{isArabic ? "الاسم" : "Name"}</span>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      autoComplete="name"
                    />
                  </label>

                  {/* Email */}
                  <label className="contact-field">
                    <span>{isArabic ? "البريد الإلكتروني" : "Email"}</span>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      autoComplete="email"
                    />
                  </label>

                  {/* Phone */}
                  <label className="contact-field contact-field--full">
                    <span>{isArabic ? "الهاتف" : "Phone"}</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      autoComplete="tel"
                    />
                  </label>

                  {/* Message */}
                  <label className="contact-field contact-field--full">
                    <span>{isArabic ? "الرسالة" : "Message"}</span>
                    <textarea
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </label>
                </div>

                <button type="submit" className="contact-submit">
                  {isArabic ? "إرسال الرسالة" : "Send message"}
                </button>
              </form>
            </div>

            {/* Embedded Google Map */}
            <div className="contact-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.0!2d51.5310!3d25.2854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e45c534ffdce87f%3A0x11c4d9d0c0c0c0c0!2sDoha!5e0!3m2!1sen!2sqa!4v1700000000000!5m2!1sen!2sqa"
                title="Ramillette location map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
