import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'event';
  eventData?: {
    name: string;
    startDate: string;
    endDate?: string;
    location: string;
    description: string;
    image?: string;
  };
  schema?: any;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  eventData,
  schema,
}) => {
  const siteTitle = "Pro San Felice - Sagre, Feste ed Eventi in Molise";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDescription = description || "Associazione Pro San Felice: Il portale n.1 per sagre, feste ed eventi in Molise. Scopri tradizioni, concorsi e manifestazioni.";
  const metaKeywords = keywords || "sagre Molise, feste Molise, eventi Molise, Pro San Felice, Colle d'Anchise, tradizioni molisane, cosa fare in Molise";
  const metaImage = image || "https://www.prosanfelice.it/logo.png";
  const metaUrl = url || "https://www.prosanfelice.it/";

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}

      {type === 'event' && eventData && !schema && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": eventData.name,
            "startDate": eventData.startDate,
            "endDate": eventData.endDate || eventData.startDate,
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "eventStatus": "https://schema.org/EventScheduled",
            "location": {
              "@type": "Place",
              "name": eventData.location,
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Colle d'Anchise",
                "addressRegion": "CB",
                "postalCode": "86020",
                "addressCountry": "IT"
              }
            },
            "image": [
              eventData.image || metaImage
            ],
            "description": eventData.description,
            "organizer": {
              "@type": "Organization",
              "name": "Associazione Pro San Felice",
              "url": "https://www.prosanfelice.it"
            }
          })}
        </script>
      )}
    </Helmet>
  );
};
