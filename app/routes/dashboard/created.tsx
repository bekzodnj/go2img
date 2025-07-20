import { Badge, Button, Card, Group, SimpleGrid, Text } from "@mantine/core";
import { Link } from "react-router";

import { getMaterialListItems } from "~/models/material.server";
import { requireUserId, requireUserIdWithRedirect } from "~/session.server";
import { Route } from "./+types/created";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUserIdWithRedirect(request);
  const materials = await getMaterialListItems({ userId: user.id });
  return { materials };
}

export default function MaterialList({ loaderData }: Route.ComponentProps) {
  const { materials } = loaderData;

  if (!materials.length) {
    return <Text>No materials found</Text>;
  }

  return (
    <>
      <Text mb="md" size="lg">
        Your uploaded materials
      </Text>
      <SimpleGrid cols={3} spacing="lg">
        {materials.map((material) => (
          <Card
            key={material.id}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
          >
            <Group mt="md" mb="xs">
              <Text>{material.title}</Text>
              <Badge color="teal">{material.category.name}</Badge>
            </Group>

            <Text size="sm">{material.description}</Text>

            <Link to={`/dashboard/${material.id}`}>
              <Button
                variant="light"
                color="blue"
                fullWidth
                mt="md"
                radius="md"
              >
                View Material
              </Button>
            </Link>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}
