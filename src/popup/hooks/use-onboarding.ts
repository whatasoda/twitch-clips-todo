import { createResource, createSignal } from "solid-js";
import { sendMessage } from "../../shared/messaging";
import type { OnboardingState } from "../../shared/types";

const defaultState: OnboardingState = {
  hasSeenTwitchToast: false,
  hasSeenFirstRecordHint: false,
};

async function fetchOnboardingState(): Promise<OnboardingState> {
  return sendMessage<OnboardingState>({ type: "GET_ONBOARDING_STATE" });
}

export function useOnboarding() {
  const [state, { refetch }] = createResource(fetchOnboardingState);
  const [dismissed, setDismissed] = createSignal(false);

  const onboardingState = () => state() ?? defaultState;

  const shouldShowFirstRecordHint = (isAuthenticated: boolean, recordCount: number) => {
    if (dismissed()) return false;
    return isAuthenticated && recordCount > 0 && !onboardingState().hasSeenFirstRecordHint;
  };

  const dismissFirstRecordHint = async () => {
    setDismissed(true);
    await sendMessage<OnboardingState>({
      type: "UPDATE_ONBOARDING_STATE",
      payload: { hasSeenFirstRecordHint: true },
    });
    await refetch();
  };

  return {
    shouldShowFirstRecordHint,
    dismissFirstRecordHint,
  };
}
