import Link from 'next/link';
import Loader from '@/components/Loader';
import { toast } from 'react-hot-toast';
import { Container } from '@nextui-org/react';

export default function Home() {
  return (
    <Container>
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
    </Container>
  );
}
