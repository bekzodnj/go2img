import { Button, Container, Text, Group } from "@mantine/core";
import { useNavigate } from "react-router";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      <Container size={1200} py={120}>
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          {/* Left: Copy */}
          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Make{" "}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                interactive
              </span>{" "}
              images without coding
            </h1>

            <Text mt="lg" size="lg" c="dimmed">
              Explain visuals with pins, tooltips, and custom annotations —
              exported as clean JSON, ready for real apps.
            </Text>

            <Group mt="xl">
              <Button
                size="md"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                onClick={() => navigate("/editor")}
              >
                Open editor
              </Button>

              <Button
                size="md"
                variant="subtle"
                color="gray"
                onClick={() => navigate("/dashboard")}
              >
                View examples
              </Button>
            </Group>
          </div>

          {/* Right: Visual Hint */}
          <div className="relative hidden md:block">
            <div className="aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {/* fake canvas grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

              {/* image placeholder */}
              <div className="absolute inset-6 rounded-lg bg-white shadow-sm" />

              {/* pins */}
              <div className="absolute left-24 top-20 h-3 w-3 rounded-full bg-blue-500 shadow-md" />
              <div className="absolute bottom-24 right-28 h-3 w-3 rounded-full bg-cyan-400 shadow-md" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
