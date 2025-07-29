import React, { useEffect, useState } from "react";

interface Props {
  children?: React.ReactNode;
  // any props that come into the component
}

export default function ClientOnly({ children }: Props) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted ? children : null;
}
