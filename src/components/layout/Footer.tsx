import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, MessageCircle, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { businessConfig } from '@/config/business';
import { WHOLESALE_CATEGORIES } from '@/config/categories';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';
import { GoogleMapsButton } from '@/components/common/GoogleMapsButton';
import { Logo } from '@/components/common/Logo';

export function Footer() {
  const whatsappHref = getGeneralEnquiryUrl();

  return (
    <footer className="bg-primary text-white border-t border-primary-light/40 mt-auto">
      {/* Wholesale Guarantees Ribbon */}
      <div className="border-b border-primary-light/30 bg-primary-hover/50 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">100% Wholesale Only</div>
              <div className="text-white/70 text-xs mt-0.5">
                Exclusively supplying shops, institutions, and bulk buyers.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Fixed Piece Rates</div>
              <div className="text-white/70 text-xs mt-0.5">
                Transparent wholesale pricing per piece for any order volume.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Pan-India Dispatch</div>
              <div className="text-white/70 text-xs mt-0.5">
                Reliable transport and parcel logistics to every state.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">WhatsApp & Phone Support</div>
              <div className="text-white/70 text-xs mt-0.5">
                Direct merchant communication for orders and bale dispatch.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="footer" />
            
            <p className="text-accent text-xs font-medium italic">
              &ldquo;{businessConfig.tagline}&rdquo;
            </p>

            <p className="text-white/70 text-xs leading-relaxed max-w-sm">
              We supply authentic handloom and powerloom textiles directly to retail cloth stores, resellers, temple trusts, and institutional buyers across India at single fixed wholesale piece rates.
            </p>

            {/* Direct WhatsApp Action */}
            <div className="pt-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#128C7E] hover:bg-[#0E6C60] text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Contact via WhatsApp ({businessConfig.contact.formattedPhone})</span>
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-white/75">
              {siteConfig.mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-accent transition-colors block py-0.5"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/wholesale-enquiry"
                  className="hover:text-accent transition-colors block py-0.5 text-accent font-medium"
                >
                  Wholesale Enquiry
                </Link>
              </li>
            </ul>
          </div>

          {/* Wholesale Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">
              Textile Categories (12)
            </h3>
            <ul className="space-y-1.5 text-xs text-white/75">
              {WHOLESALE_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="hover:text-accent transition-colors block py-0.5"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/categories"
                  className="hover:text-accent transition-colors block py-1 text-accent text-xs font-semibold"
                >
                  View All Categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Business Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">
              Merchant Contact
            </h3>
            <p className="text-xs text-white/60">
              Official wholesale communication & dispatch godown:
            </p>

            <ul className="space-y-3 text-xs text-white/80">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="text-white/50 block text-[10px] uppercase font-semibold">Phone:</span>
                  <a href={`tel:${businessConfig.contact.phone}`} className="hover:text-accent transition-colors font-medium">
                    {businessConfig.contact.formattedPhone}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="text-white/50 block text-[10px] uppercase font-semibold">WhatsApp:</span>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors font-medium"
                  >
                    {businessConfig.contact.formattedPhone}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="text-white/50 block text-[10px] uppercase font-semibold">Email:</span>
                  <a href={`mailto:${businessConfig.contact.email}`} className="hover:text-accent transition-colors break-all">
                    {businessConfig.contact.email}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-white/50 block text-[10px] uppercase font-semibold">Address & Godown:</span>
                  <p className="text-white/75 leading-relaxed text-[11px]">
                    {businessConfig.contact.fullAddress}
                  </p>
                  <GoogleMapsButton variant="link" size="sm" className="text-accent hover:text-white text-[11px]" />
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Policies and Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-primary-light/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
            {siteConfig.policyLinks.map((policy) => (
              <Link
                key={policy.href}
                href={policy.href}
                className="hover:text-accent transition-colors"
              >
                {policy.title}
              </Link>
            ))}
          </div>

          <div className="text-center md:text-right">
            <p>
              © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
            <p className="text-[11px] text-white/40 mt-0.5">
              Wholesale Cloth Merchant • Nizamabad, Telangana • Pan-India Textile Distribution
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
