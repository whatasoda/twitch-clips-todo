import { Bookmark } from "lucide-solid";
import { t } from "@/shared/i18n";
import { MSG } from "@/shared/i18n/message-keys";
import { Box, HStack, VStack } from "../../../styled-system/jsx";
import { AuthButton } from "./AuthButton";

const steps = [
  { main: MSG.ONBOARDING_STEP1, detail: MSG.ONBOARDING_STEP1_DETAIL },
  { main: MSG.ONBOARDING_STEP2, detail: MSG.ONBOARDING_STEP2_DETAIL },
  { main: MSG.ONBOARDING_STEP3, detail: MSG.ONBOARDING_STEP3_DETAIL },
] as const;

export function WelcomeCard() {
  return (
    <Box p="4">
      <VStack gap="4" alignItems="stretch">
        <VStack gap="1" alignItems="center" textAlign="center">
          <Bookmark size={32} color="var(--colors-accent-default)" />
          <Box fontWeight="semibold" fontSize="md">
            {t(MSG.ONBOARDING_WELCOME_TITLE)}
          </Box>
          <Box fontSize="sm" color="fg.muted">
            {t(MSG.ONBOARDING_WELCOME_DESCRIPTION)}
          </Box>
        </VStack>

        <VStack gap="2" alignItems="stretch">
          {steps.map((step, index) => (
            <HStack gap="3" alignItems="flex-start">
              <Box
                flexShrink={0}
                w="6"
                h="6"
                borderRadius="full"
                bg="accent.3"
                color="accent.11"
                fontSize="xs"
                fontWeight="bold"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {index + 1}
              </Box>
              <Box fontSize="sm" pt="0.5">
                {t(step.main)}
                <Box fontSize="xs" color="fg.muted" mt="0.5">
                  {t(step.detail)}
                </Box>
              </Box>
            </HStack>
          ))}
        </VStack>

        <Box fontSize="xs" color="fg.muted" bg="bg.muted" p="3" borderRadius="md">
          {t(MSG.ONBOARDING_CONNECT_BENEFIT)}
        </Box>

        <Box display="flex" justifyContent="center">
          <AuthButton />
        </Box>
      </VStack>
    </Box>
  );
}
