import { Info, X } from "lucide-solid";
import { IconButton } from "@/components/ui/icon-button";
import { t } from "@/shared/i18n";
import { MSG } from "@/shared/i18n/message-keys";
import { Box, Flex, HStack, VStack } from "../../../styled-system/jsx";

interface FirstRecordHintProps {
  onDismiss: () => void;
}

export function FirstRecordHint(props: FirstRecordHintProps) {
  return (
    <Box mx="4" mt="2" p="3" bg="accent.2" borderRadius="md" borderWidth="1px" borderColor="accent.6">
      <Flex gap="2" justifyContent="space-between" alignItems="flex-start">
        <HStack gap="2" alignItems="flex-start" flex="1">
          <Info size={16} color="var(--colors-accent-11)" style={{ "flex-shrink": "0", "margin-top": "2px" }} />
          <VStack gap="1" alignItems="flex-start">
            <Box fontSize="sm">{t(MSG.ONBOARDING_FIRST_RECORD_HINT)}</Box>
            <Box fontSize="xs" color="fg.muted">{t(MSG.ONBOARDING_RETENTION_NOTICE)}</Box>
          </VStack>
        </HStack>
        <IconButton size="xs" variant="ghost" aria-label={t(MSG.HELP_CLOSE)} onClick={props.onDismiss}>
          <X size={14} />
        </IconButton>
      </Flex>
    </Box>
  );
}
