import { Helmet } from 'react-helmet-async';
import { useSettings } from '../../context/SettingsContext.jsx';

export default function SEO({ title, description }) {
  const { settings } = useSettings();
  const siteName = settings?.unionName || 'نقابة محامين جنوب القليوبية';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const desc = description || settings?.aboutText?.slice(0, 160) || 'الموقع الرسمي لنقابة محامين جنوب القليوبية';
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
