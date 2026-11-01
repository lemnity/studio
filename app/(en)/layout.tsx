import type { ReactNode } from "react";

import { StudioRootLayout, rootMetadata, rootViewport } from "@/components/studio/studio-root";

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function Layout({ children }: { children: ReactNode }) {
  return <StudioRootLayout locale="en">{children}</StudioRootLayout>;
}
