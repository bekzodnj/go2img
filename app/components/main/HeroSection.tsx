import { Button, Container, Text } from "@mantine/core";
import classes from "./HeroTitle.module.css";
import { useNavigate } from "react-router";

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <div className={classes.wrapper}>
      <Container size={700} className={classes.inner + " space-y-4"}>
        <h1 className={classes.title}>
          Make{" "}
          <Text
            component="span"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            inherit
          >
            interactive images
          </Text>{" "}
          without coding!
        </h1>

        <Text className={classes.description} color="dimmed">
          Explain your image with pins, tooltips, and many more!
        </Text>
        <Button
          className=""
          type="submit"
          onClick={() => navigate("/editor")}
          size="xl"
          variant="gradient"
          gradient={{ from: "blue", to: "cyan" }}
        >
          See in action!
        </Button>
      </Container>
    </div>
  );
}
