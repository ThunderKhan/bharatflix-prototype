import { CatalogProvider } from "@/lib/catalog-context";
import { getPublishedCatalog } from "@/lib/db/queries";
import { HomeExperience } from "@/components/home/home-experience";

// The catalogue lives in SQLite: render on demand so studio edits show up on refresh.
export const dynamic = "force-dynamic";

export default function Home() {
  return <CatalogProvider snapshot={getPublishedCatalog()}><HomeExperience /></CatalogProvider>;
}
