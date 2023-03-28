import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import Link from 'next/link';

import Loader from '@/components/Loader';
import { toast } from 'react-hot-toast';

export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      {/*Testing Link functionality*/}
      <Link
        prefetch={false}
        href={{
          pathname: '/[username]',
          query: { username: 'squink' },
        }}
      >
        {"Squink's profile"}
      </Link>

      {/*Testing Loader functionality*/}
      <Loader show />

      {/*Testing toast functionality*/}
      <button onClick={() => toast.success('hello toast!')}>Toast</button>
    </div>
  );
}
