import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import "@mantine/core/styles.css";
import { getUser } from "~/session.server";
import stylesheet from "~/tailwind.css?url";
import "@mantine/dropzone/styles.css";
import {
  ColorSchemeScript,
  createTheme,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return { user: await getUser(request) };
};

const myTheme = createTheme({
  primaryColor: "indigo",
  components: {
    Button: {},
  },
});

export default function App() {
  return (
    <html lang="en" className="h-full" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <ColorSchemeScript />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <MantineProvider theme={myTheme} withCssVariables>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
        </MantineProvider>
      </body>
    </html>
  );
}
