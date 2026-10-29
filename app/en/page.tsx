import { StudioRoute, studioMetadata } from "@/components/studio/studio-route";

export const metadata = studioMetadata("en");

export default function HomePageEn() {
  return <StudioRoute locale="en" />;
}
