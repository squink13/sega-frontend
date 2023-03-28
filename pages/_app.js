import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <SessionProvider>
        <Navbar />
      </SessionProvider>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}
