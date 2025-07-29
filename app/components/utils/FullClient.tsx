import React from "react";
import { OnlineStatus } from "../main/OnlineStatus.client";
import ImageMap from "~/components/main/ImageMap/ImageMapDemo";
import { ClientOnly } from "./client-only";

export default function Index() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  return <ClientOnly fallback={<>hey</>}>{() => <ImageMap />}</ClientOnly>;
}
