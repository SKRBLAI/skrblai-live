export interface JsonLdProps {
  data: Record<string, any>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Sports page JSON-LD schema
export const sportsPageSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "AI Skill Smith - Sports Training Platform",
  "description": "Advanced AI-powered sports training and skill development platform for athletes of all levels.",
  "brand": {
    "@type": "Brand",
    "name": "SKRBL AI"
  },
  "provider": {
    "@type": "Organization",
    "name": "SKRBL AI",
    "url": "https://skrblai.io",
    "logo": {
      "@type": "ImageObject",
      "url": "https://skrblai.io/images/logo.png"
    }
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "USD",
    "price": "29.99",
    "priceValidUntil": "2024-12-31",
    "url": "https://skrblai.io/sports"
  },
  "category": "Sports Training Software",
  "audience": {
    "@type": "Audience",
    "audienceType": "Athletes, Coaches, Sports Enthusiasts"
  },
  "applicationCategory": "Sports & Fitness",
  "operatingSystem": "Web Browser"
};

// Organization schema for main site
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SKRBL AI",
  "url": "https://skrblai.io",
  "logo": {
    "@type": "ImageObject",
    "url": "https://skrblai.io/images/logo.png",
    "width": 200,
    "height": 60
  },
  "description": "AI-powered business automation and content creation platform",
  "foundingDate": "2023",
  "sameAs": [
    "https://twitter.com/skrblai"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "url": "https://skrblai.io/contact"
  }
};