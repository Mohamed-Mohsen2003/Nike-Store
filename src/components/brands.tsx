import type { ReactNode } from 'react';
import { SiShopify, SiStripe, SiPaypal, SiMeta, SiTiktok, SiGoogleanalytics, SiDhl, SiQuickbooks, SiZapier, SiMailchimp, SiWoocommerce, SiHubspot, SiNotion, SiWhatsapp } from 'react-icons/si';

const map: Record<string, ReactNode> = {
  shopify: <SiShopify />, stripe: <SiStripe />, paypal: <SiPaypal />, meta: <SiMeta />, tiktok: <SiTiktok />,
  google: <SiGoogleanalytics />, dhl: <SiDhl />, quickbooks: <SiQuickbooks />, zapier: <SiZapier />, mailchimp: <SiMailchimp />,
  woo: <SiWoocommerce />, hubspot: <SiHubspot />, notion: <SiNotion />, whatsapp: <SiWhatsapp />,
};

export function BrandIcon({ id, name, color, size = 40 }: { id: string; name: string; color: string; size?: number }) {
  return (
    <span className="brand-icon" style={{ width: size, height: size, ['--b' as string]: color }}>
      {map[id] ?? <b>{name[0]}</b>}
    </span>
  );
}
