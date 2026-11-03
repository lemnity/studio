import { StudioServicesPage } from "@/components/studio/studio-page";
import { servicesJsonLd, servicesMetadata } from "@/components/studio/studio-services";

export const metadata = servicesMetadata("en");

export default function ServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd("en")) }} />
      <StudioServicesPage locale="en" />
    </>
  );
}
