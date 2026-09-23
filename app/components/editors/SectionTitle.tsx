import { Group, Text } from "@mantine/core";
import type { ReactNode } from "react";

// One heading style for every editor panel section, with an optional count
// and an optional action on the right
export function SectionTitle({
  children,
  count,
  action,
}: {
  children: ReactNode;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <Group justify="space-between" wrap="nowrap" mb="xs" mih={28}>
      <Text size="sm" fw={600}>
        {children}
        {count !== undefined ? (
          <Text span size="sm" c="dimmed" fw={400} ml={6}>
            {count}
          </Text>
        ) : null}
      </Text>
      {action}
    </Group>
  );
}
