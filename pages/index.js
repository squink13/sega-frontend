import Link from 'next/link';
import Loader from '@/components/Loader';
import { toast } from 'react-hot-toast';
import { Container, Grid, Text } from '@nextui-org/react';
import NavigationBar from '@/components/NavigationBar';

export default function Home() {
  return (
    <Container>
      {/**
        <Link
          prefetch={false}
          href={{
            pathname: '/[username]',
            query: { username: 'squink' },
          }}
        >
        </Link>
        
        <Loader show />

        <button onClick={() => toast.success('hello toast!')}>Toast</button> */}

      <Grid.Container justify="center">
        <Text h1>Home Page</Text>
      </Grid.Container>
    </Container>
  );
}
