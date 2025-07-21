import { Button, Container, Group, Text } from "@mantine/core";
import classes from "./HeroTitle.module.css";
import { ActionFunctionArgs, Form } from "react-router";

export function HeroSection() {
  return (
    <div className={classes.wrapper}>
      <Container size={700} className={classes.inner}>
        <h1 className={classes.title}>
          A blazing fast{" "}
          <Text
            component="span"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            inherit
          >
            OG Image
          </Text>{" "}
          generating tool
        </h1>

        <Text className={classes.description} color="dimmed">
          Build fully functional accessible web applications with ease – React
          includes more than 100 customizable components and hooks to cover you
          in any situation
        </Text>

        <Group className={classes.controls}>
          <Button
            component="a"
            href="https://github.com/mantinedev/mantine"
            size="xl"
            variant="default"
            className={classes.control}
          >
            GitHub
          </Button>
        </Group>
      </Container>
    </div>
  );
}
