import { Pin } from "lucide-solid";
import { Show } from "solid-js";
import { t } from "@/shared/i18n";
import { MSG } from "@/shared/i18n/message-keys";
import { Box, Center, HStack, VStack } from "../../../styled-system/jsx";

const emptySteps = [MSG.POPUP_EMPTY_STEP1, MSG.POPUP_EMPTY_STEP2, MSG.POPUP_EMPTY_STEP3] as const;

interface EmptyStateProps {
  title?: string;
  description?: string;
  showSteps?: boolean;
}

export function EmptyState(props: EmptyStateProps) {
  const showSteps = () => props.showSteps !== false;
  return (
    <Center py="8">
      <VStack gap="4" textAlign="center">
        <Pin size={48} color="var(--colors-fg-muted)" />
        <Box fontSize="lg" fontWeight="semibold">
          {props.title ?? t(MSG.POPUP_EMPTY_TITLE)}
        </Box>
        <Box fontSize="sm" color="fg.muted">
          {props.description ?? t(MSG.POPUP_EMPTY_DESCRIPTION)}
        </Box>
        <Show when={showSteps()}>
          <VStack gap="2" alignItems="flex-start" textAlign="left" px="4" w="full">
            {emptySteps.map((stepKey, index) => (
              <HStack gap="3" alignItems="flex-start">
                <Box
                  flexShrink={0}
                  w="5"
                  h="5"
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
                <Box fontSize="sm" color="fg.muted" pt="0.5">
                  {t(stepKey)}
                </Box>
              </HStack>
            ))}
          </VStack>
        </Show>
      </VStack>
    </Center>
  );
}
