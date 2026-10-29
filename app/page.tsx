import { StudioRoute, studioMetadata } from "@/components/studio/studio-route";

export const metadata = studioMetadata("ru");

export default function HomePage() {
  return <StudioRoute locale="ru" />;
}
