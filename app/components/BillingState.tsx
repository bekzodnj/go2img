import { authClient } from "~/lib/auth-client";
import { useEffect, useState } from "react";
import { PRO_PRODUCT_ID } from "~/lib/constants";
import type { CustomerState } from "@polar-sh/sdk/models/components/customerstate";

const navItemClass =
  "rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100";

export function BillingState() {
  const { data: session } = authClient.useSession();
  const [customerState, setCustomerState] = useState<CustomerState | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    authClient.customer.state().then(({ data }) => {
      setCustomerState(data);
      setLoading(false);
    });
  }, [session]);

  if (loading) return null;

  const isPaid = (customerState?.activeSubscriptions?.length ?? 0) > 0;

  return (
    <button
      className={navItemClass}
      onClick={() =>
        isPaid
          ? authClient.customer.portal()
          : authClient.checkout({ products: [PRO_PRODUCT_ID] })
      }
    >
      {isPaid ? "Manage plan (Premium)" : "Upgrade to Pro"}
    </button>
  );
}
