import NavigationBar from "@/components/NavigationBar";
import { createTheme, NextUIProvider, styled } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

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
  useEffect(() => {
    // This will run when the component mounts
    // and will add a toast if the browser is Firefox.
    var isFirefox = typeof InstallTrigger !== "undefined";
    if (isFirefox) {
      toast("Warning! Firefox is not supported at this time.", {
        duration: 10000,
        icon: "⚠️",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  }, []);

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
            <Toaster />
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
