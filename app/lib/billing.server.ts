import { data } from "react-router";
import { polarClient } from "~/lib/auth";
import { FREE_IMAGES_PER_PROJECT, FREE_PROJECT_LIMIT } from "~/lib/constants";
import { countProjectsByUser } from "~/models/project.server";

// Same check as BillingState on the client, but straight from Polar so it
// can't be faked from the browser
export async function hasActiveSubscription(userId: string) {
  try {
    const state = await polarClient.customers.getStateExternal({
      externalId: userId,
    });
    return state.activeSubscriptions.length > 0;
  } catch (error) {
    // No Polar customer for this user (or Polar is unreachable): free plan
    console.error("Polar customer state lookup failed", error);
    return false;
  }
}

// Polar is only asked once a free limit would be crossed, and at most once
// per request
export function getPlan(userId: string) {
  let isPaid: Promise<boolean> | undefined;
  const paid = () => (isPaid ??= hasActiveSubscription(userId));

  return {
    isPaid: paid,
    async canCreateProject() {
      const count = await countProjectsByUser({ userId });
      return count < FREE_PROJECT_LIMIT || paid();
    },
    async canAddImages(existing: number, adding: number) {
      return existing + adding <= FREE_IMAGES_PER_PROJECT || paid();
    },
  };
}

export function planLimitError(error: string) {
  return data({ error }, { status: 403 });
}

export const PROJECT_LIMIT_MESSAGE = `The free plan includes ${FREE_PROJECT_LIMIT} project. Upgrade to Pro to create more.`;
export const IMAGE_LIMIT_MESSAGE = `The free plan includes ${FREE_IMAGES_PER_PROJECT} image per project. Upgrade to Pro to add more.`;
