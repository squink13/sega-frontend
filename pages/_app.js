import Navbar from '@/components/Navbar';
import Navbar2 from '@/components/Navbar2';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

const lightTheme = createTheme({
  type: 'light',
});

const darkTheme = createTheme({
  type: 'dark',
});

export default function App({ Component, pageProps }) {
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
          <SessionProvider>
            <Navbar2 />
          </SessionProvider>
          <Component {...pageProps} />
        </NextUIProvider>
      </NextThemesProvider>
      <Toaster />
    </>
  );
}
