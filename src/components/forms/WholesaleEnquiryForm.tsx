'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { WHOLESALE_CATEGORIES } from '@/config/categories';
import { getWholesaleFormWhatsAppUrl } from '@/lib/whatsapp';
import { businessConfig } from '@/config/business';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { emitWhatsAppEnquiryEvent } from '@/lib/notifications/whatsapp-events';
import { useAuth } from '@/lib/auth/auth-context';
import { MessageCircle, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';

export function WholesaleEnquiryForm() {
  const router = useRouter();
  const { isAuthenticated, profile, user } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Telangana');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Towels', 'Check Lungies']);
  const [estimatedQuantity, setEstimatedQuantity] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveBusinessName = businessName !== '' ? businessName : (profile?.businessName || '');
  const effectiveContactPerson = contactPerson !== '' ? contactPerson : (profile?.fullName || '');
  const effectivePhone = phone !== '' ? phone : (profile?.phone || '');
  const effectiveEmail = email !== '' ? email : (profile?.email || user?.email || '');

  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      router.push('/login?next=/wholesale-enquiry');
      return;
    }

    if (!effectiveBusinessName.trim() || !effectiveContactPerson.trim() || !effectivePhone.trim() || !city.trim()) {
      setError('Please fill in all required fields (Shop Name, Contact Person, Phone, City).');
      return;
    }

    setIsSubmitting(true);

    // Save to Supabase if configured
    let enquiryId = `ENQ-${Date.now()}`;
    let createdAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        if (supabase) {
          const { data } = await supabase.from('wholesale_enquiries').insert({
            name: effectiveContactPerson.trim(),
            business_name: effectiveBusinessName.trim(),
            phone: effectivePhone.trim(),
            email: effectiveEmail.trim() || null,
            city: city.trim(),
            state: state.trim(),
            products_interested: selectedCategories.join(', '),
            approximate_quantity: estimatedQuantity.trim() || null,
            message: message.trim() || 'Wholesale price and supply enquiry',
            status: 'pending',
          }).select('id, created_at').maybeSingle();

          if (data?.id) enquiryId = data.id;
          if (data?.created_at) createdAt = data.created_at;
        }
      } catch (err) {
        console.warn('Supabase enquiry save notice:', err);
      }
    }

    // Emit non-blocking WhatsApp event for n8n automation
    emitWhatsAppEnquiryEvent({
      enquiryId,
      customerName: effectiveContactPerson.trim(),
      businessName: effectiveBusinessName.trim() || null,
      customerPhone: effectivePhone.trim(),
      customerType: 'Wholesale Buyer',
      enquiryMessage: message.trim() || `Interested in: ${selectedCategories.join(', ')}`,
      createdAt,
    }).catch(() => {});

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const whatsappUrl = getWholesaleFormWhatsAppUrl({
    name: effectiveContactPerson || 'Merchant',
    businessName: effectiveBusinessName || 'Wholesale Buyer',
    phone: effectivePhone || 'Not provided',
    city: city || 'Telangana',
    state: state || 'Telangana',
    productsInterested: selectedCategories.join(', ') || 'Wholesale Textiles',
    approximateQuantity: estimatedQuantity || undefined,
    message: message || undefined,
  });

  if (submitted) {
    return (
      <div className="p-6 sm:p-8 bg-surface rounded-xl border border-accent/40 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-serif font-bold text-primary">
          Wholesale Enquiry Received
        </h3>
        <p className="text-xs text-charcoal/80 max-w-md mx-auto leading-relaxed">
          Thank you, <strong className="text-charcoal font-semibold">{contactPerson}</strong> ({businessName}). Your trade enquiry has been logged. Our merchant desk in Nizamabad will review your product requirements and piece counts.
        </p>

        <div className="pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Send Copy to Sales Desk on WhatsApp ({businessConfig.contact.formattedPhone})</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Business / Shop Name *
          </label>
          <input
            type="text"
            required
            value={effectiveBusinessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Balaji Cloth Store"
            className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Contact Person *
          </label>
          <input
            type="text"
            required
            value={effectiveContactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="e.g. Ramesh Reddy"
            className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Phone / WhatsApp Number *
          </label>
          <input
            type="tel"
            required
            value={effectivePhone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Email Address <span className="text-muted font-normal">(Optional)</span>
          </label>
          <input
            type="email"
            value={effectiveEmail}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. merchant@clothstore.com"
            className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            City / Town / District *
          </label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Nizamabad / Hyderabad"
            className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            State / UT *
          </label>
          <input
            type="text"
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. Telangana / Andhra Pradesh"
            className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-charcoal mb-1.5">
          Select Categories of Interest (12 Categories Available)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {WHOLESALE_CATEGORIES.map((cat) => (
            <label
              key={cat.id}
              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                selectedCategories.includes(cat.name)
                  ? 'border-accent bg-accent/10 font-semibold text-primary'
                  : 'border-border/70 bg-surface-subtle text-charcoal/80 hover:border-accent/40'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.name)}
                onChange={() => toggleCategory(cat.name)}
                className="rounded text-primary focus:ring-accent"
              />
              <span className="truncate">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-charcoal mb-1">
          Estimated Order Quantity / Bale Count <span className="text-muted font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          value={estimatedQuantity}
          onChange={(e) => setEstimatedQuantity(e.target.value)}
          placeholder="e.g. 50 pieces trial or 500 pieces wholesale bale"
          className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-charcoal mb-1">
          Specific Requirements or Transport Query
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe border styles, GSM preferences, preferred parcel transport agency, etc..."
          className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
        />
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Recording Enquiry...
            </span>
          ) : !isAuthenticated ? (
            <span className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-accent" />
              Sign In to Submit Wholesale Enquiry
            </span>
          ) : (
            'Submit Wholesale Enquiry'
          )}
        </Button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold rounded-md transition-colors"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Direct WhatsApp Quote</span>
        </a>
      </div>
    </form>
  );
}
