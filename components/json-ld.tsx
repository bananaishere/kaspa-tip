import type { WebSite, WithContext } from "schema-dts"

export function JsonLd() {
  const websiteSchema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KaspaTip",
    url: "https://kaspa-tip.vercel.app/",
    description: "A simple and secure way to send Kaspa tokens to anyone with the Kasware wallet",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://kaspa-tip.vercel.app/search?q={search_term_string}",
      },
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
}

