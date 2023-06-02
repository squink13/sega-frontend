import NavigationBar from "@/components/NavigationBar";
import { createTheme, NextUIProvider, styled } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const lightTheme = createTheme({
  type: "light",
  theme: {
    colors: {},
  },
});

const darkTheme = createTheme({
  type: "dark",
  theme: {
    colors: {},
  },
});

const Box = styled("div", {
  boxSizing: "border-box",
});

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <NextThemesProvider
        defaultTheme="system"
        attribute="class"
        value={{
          light: lightTheme.className,
          dark: darkTheme.className,
        }}
      >
        <NextUIProvider>
          <SessionProvider session={session}>
            <NavigationBar />
            <Box
              css={{
                px: "$12",
                py: "$15",
                mt: "$12",
                "@xsMax": { px: "$10" },
                maxWidth: "1366px",
                margin: "0 auto",
                display: "flex",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Component {...pageProps} />
            </Box>
          </SessionProvider>
        </NextUIProvider>
      </NextThemesProvider>
    </>
  );
}
