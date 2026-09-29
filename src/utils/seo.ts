/**
 * Whole-Site Technical SEO Configuration & Dynamic Head Injector for MPLADS-AI
 * Strictly complies with Google Search Quality & W3C Semantic Standards.
 * Unified Brand: MPLADS-AI
 */

export const SITE_CONFIG = {
  name: 'MPLADS-AI',
  brand: 'MPLADS-AI',
  shortName: 'MPLADS-AI',
  tagline: 'Project Lifecycle Intelligence & Anomaly Detection Platform',
  defaultTitle: 'MPLADS-AI | National Project Lifecycle Intelligence & Governance Platform',
  titleTemplate: '%s | MPLADS-AI',
  description:
    'AI-powered national monitoring, anomaly detection, and decision support platform for the Members of Parliament Local Area Development Scheme (MPLADS). MoSPI, Government of India.',
  siteUrl: (import.meta as any).env?.VITE_SITE_URL || 'https://mplads-ai.vercel.app',
  ogImage: '/assets/images/hero_parliament.jpg',
  themeColor: '#0b2e59',
  locale: 'en_IN',
  organization: {
    name: 'MPLADS-AI Governance Platform',
    url: 'https://mplads-ai.vercel.app',
    logo: 'https://mplads-ai.vercel.app/assets/images/national_emblem.png',
    description:
      'National AI-powered auditing and decision support platform analyzing 38,000+ MPLADS public infrastructure works.',
    sameAs: ['https://mplads.mospi.gov.in', 'https://data.gov.in']
  }
};

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  schema?: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Dynamically updates document head tags without SSR hydration mismatches.
 */
export function updateDocumentSEO(props: SEOProps): () => void {
  const {
    title,
    description = SITE_CONFIG.description,
    canonicalPath = '',
    noindex = false,
    ogType = 'website',
    ogImage = SITE_CONFIG.ogImage,
    breadcrumbs,
    schema
  } = props;

  // 1. Title formatting
  const formattedTitle = title
    ? title.includes('MPLADS-AI')
      ? title
      : `${title} | ${SITE_CONFIG.brand}`
    : SITE_CONFIG.defaultTitle;
  document.title = formattedTitle;

  // 2. Helper to set or create meta tag
  const setMeta = (attribute: string, key: string, content: string) => {
    let el = document.querySelector(`meta[${attribute}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attribute, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 3. Primary Meta Tags
  setMeta('name', 'description', description);
  setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  setMeta('name', 'theme-color', SITE_CONFIG.themeColor);

  // 4. Canonical Link
  const rawPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  const canonicalUrl = `${SITE_CONFIG.siteUrl.replace(/\/$/, '')}${rawPath === '/' ? '' : rawPath}`;
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // 5. Open Graph Tags
  setMeta('property', 'og:site_name', SITE_CONFIG.brand);
  setMeta('property', 'og:title', formattedTitle);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:type', ogType);
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_CONFIG.siteUrl.replace(/\/$/, '')}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
  setMeta('property', 'og:image', fullOgImage);
  setMeta('property', 'og:locale', SITE_CONFIG.locale);

  // 6. Twitter / X Card Tags
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', formattedTitle);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', fullOgImage);

  // 7. Structured Data (JSON-LD)
  const scriptId = 'mplads-seo-jsonld';
  let scriptEl = document.getElementById(scriptId);
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = scriptId;
    scriptEl.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptEl);
  }

  const structuredDataItems: Array<Record<string, any>> = [];

  // Global WebSite Schema
  structuredDataItems.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.siteUrl,
    description: SITE_CONFIG.description,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.organization.name,
      url: SITE_CONFIG.organization.url,
      logo: SITE_CONFIG.organization.logo
    }
  });

  // Breadcrumb Schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    structuredDataItems.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: b.url.startsWith('http') ? b.url : `${SITE_CONFIG.siteUrl.replace(/\/$/, '')}${b.url}`
      }))
    });
  }

  // Custom Page Schema
  if (schema) {
    if (Array.isArray(schema)) {
      structuredDataItems.push(...schema);
    } else {
      structuredDataItems.push(schema);
    }
  }

  scriptEl.textContent = JSON.stringify(structuredDataItems.length === 1 ? structuredDataItems[0] : structuredDataItems);

  // Cleanup on unmount
  return () => {
    // Keeps document in clean state for next route transition
  };
}
