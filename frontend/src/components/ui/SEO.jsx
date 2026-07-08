import { Helmet } from 'react-helmet-async';
import { useSettings } from '../../context/SettingsContext.jsx';

const SITE_URL = 'https://southqalyubialawyers.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

export default function SEO({ title, description, image }) {
  const { settings } = useSettings();
  const siteName = settings?.unionName || 'نقابة محامين جنوب القليوبية';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | الموقع الرسمي`;
  const desc =
    description ||
    settings?.aboutText?.slice(0, 160) ||
    'الموقع الرسمي لنقابة محامين جنوب القليوبية - خدمات المحامين، أحكام النقض، الكتب القانونية، الندوات والتعاقدات.';
  const url = typeof window !== 'undefined' ? SITE_URL + window.location.pathname : SITE_URL;
  const img = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="ar_EG" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
