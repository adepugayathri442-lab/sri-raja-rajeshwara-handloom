'use client';

import React from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { businessConfig } from '@/config/business';

interface GoogleMapsButtonProps {
  variant?: 'button' | 'link' | 'card';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDirectionsText?: boolean;
  className?: string;
}

export function GoogleMapsButton({
  variant = 'button',
  size = 'md',
  showIcon = true,
  showDirectionsText = false,
  className = '',
}: GoogleMapsButtonProps) {
  const mapUrl = businessConfig.contact.googleMapsUrl;
  const buttonLabel = showDirectionsText ? 'Get Directions' : 'View on Google Maps';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  if (variant === 'link') {
    return (
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-accent hover:text-accent-hover font-medium underline underline-offset-4 transition-colors ${className}`}
        aria-label="View Sri Raja Rajeshwara Handloom location on Google Maps"
      >
        {showIcon && <MapPin className="w-4 h-4 shrink-0 text-accent" />}
        <span>{buttonLabel}</span>
        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
      </a>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-lg bg-surface border border-accent/20 space-y-3 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <MapPin className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-accent uppercase tracking-wider">
              Shop & Warehouse Location
            </h4>
            <p className="text-sm font-medium text-charcoal mt-1">
              {businessConfig.contact.googleMapsAddress}
            </p>
            <p className="text-xs text-muted mt-1">
              Google Maps Plus Code: <span className="font-mono font-semibold text-primary">{businessConfig.contact.googleMapsPlusCode}</span>
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-accent/15 flex items-center justify-between">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            <Navigation className="w-4 h-4 text-accent" />
            <span>Get Directions on Google Maps</span>
            <ExternalLink className="w-3 h-3 text-muted" />
          </a>
        </div>
      </div>
    );
  }

  // Default 'button' variant
  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center font-medium rounded-md transition-colors bg-accent hover:bg-accent-hover text-primary shadow-xs font-semibold ${sizeClasses[size]} ${className}`}
      aria-label="Open Google Maps to visit Sri Raja Rajeshwara Handloom in Nizamabad"
    >
      {showIcon && (showDirectionsText ? <Navigation className="w-4 h-4 shrink-0" /> : <MapPin className="w-4 h-4 shrink-0" />)}
      <span>{buttonLabel}</span>
      <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
    </a>
  );
}
