import { ArrowUpRight } from "lucide-react";

/** The providers are third-party discovery destinations, not integrated stream sources. */
const providers = [
  { name: "Netflix", href: "https://www.netflix.com/in/" },
  { name: "Prime Video", href: "https://www.primevideo.com/" },
  { name: "Disney+", href: "https://www.disneyplus.com/" },
  { name: "JioHotstar", href: "https://www.hotstar.com/in" },
  { name: "Tata Play Binge", href: "https://www.tataplaybinge.com/" },
] as const;

export function ProviderStrip() {
  return <section className="provider-discovery" aria-label="Explore streaming services">
    <div className="provider-strip-heading"><h2>Explore streaming services</h2><p>Reference destinations · opens each provider&apos;s official website</p></div>
    <div className="provider-strip-track">{providers.map((provider) => <a key={provider.name} href={provider.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${provider.name} official website`}>
      <strong>{provider.name}</strong><ArrowUpRight size={18} aria-hidden="true"/>
    </a>)}</div>
    <p className="provider-disclaimer">These links are for discovery and UI comparison. BharatFlix is not affiliated with these services and does not claim streaming rights to their catalogues.</p>
  </section>;
}
