import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  schema?: any;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  image = '/logo.png', 
  url = window.location.href,
  type = 'website',
  schema
}) => {
  const baseTitle = 'Pro San Felice 2023';
  const fullTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} - Eventi, Sagre e Feste in Molise`;
  const defaultDescription = 'Associazione Pro San Felice 2023: Scopri tutti gli eventi, le sagre, le rassegne e le feste a Colle d\'Anchise e in tutto il Molise.';
  const fullDescription = description || defaultDescription;
  const fullKeywords = keywords ? `${keywords}, Molise, eventi, sagre` : 'Pro San Felice, Molise, eventi Molise, sagre Molise, feste Molise, Colle d\'Anchise';
  
  // Ensure absolute URL for image
  const absoluteImage = image.startsWith('http') 
    ? image 
    : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
