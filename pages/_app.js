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
    colors: {
      background: "#121212",
    },
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
            <Toaster />
            <Component {...pageProps} />
          </SessionProvider>
        </NextUIProvider>
      </NextThemesProvider>
    </>
  );
}
