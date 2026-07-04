import { authClient } from "~/lib/auth-client";
import { useEffect, useState } from "react";
import { CustomerState } from "@polar-sh/sdk/models/components/customerstate";

export function BillingState() {
  const { data: session } = authClient.useSession();
  const [customerState, setCustomerState] = useState<CustomerState | null>(
    null,
  );

  useEffect(() => {
    if (!session) return;
    authClient.customer.state().then(({ data }) => {
      setCustomerState(data);
    });
  }, [session]);

  console.log("customerState", customerState);
  const isPaid = (customerState?.activeSubscriptions?.length ?? 0) > 0;

  if (!isPaid) {
    return <div>Upgrade to Premium to access this feature.</div>;
  }

  return <div>Welcome to the premium feature!</div>;
}
