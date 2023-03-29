import { Avatar, Button, Container, Navbar, Text } from '@nextui-org/react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar2() {
  const { data: session, status } = useSession();

  return (
    <Navbar variant={'static'} isBordered>
      <Navbar.Brand>
        <Link href="/">
          <Text
            size={40}
            weight="bold"
            css={{ textGradient: '45deg, $blue600 -10%, $pink600 100%' }}
          >
            SEGS
          </Text>
        </Link>
      </Navbar.Brand>
      <Navbar.Content>
        <Navbar.Link href="#">Home</Navbar.Link>
        <Navbar.Link href="#">Test 2</Navbar.Link>
        <Navbar.Link href="#">Test 3</Navbar.Link>
      </Navbar.Content>
      <Navbar.Content>
        {status === 'authenticated' ? (
          <>
            <Navbar.Item>
              <Navbar.Link>
                <Link href={`/${session.user.id}`}>
                  <Text>{session.user.name}</Text>
                </Link>
              </Navbar.Link>
            </Navbar.Item>
            <Navbar.Item>
              <Link href={`/${session.user.id}`}>
                <Avatar
                  bordered
                  color="gradient"
                  src={session.user.image}
                  size="lg"
                />
              </Link>
            </Navbar.Item>
            <Navbar.Item>
              <Button
                auto
                flat
                href="#"
                onClick={(e) => {
                  signOut('osu');
                }}
              >
                Log out
              </Button>
            </Navbar.Item>
          </>
        ) : (
          <Navbar.Item>
            <Button
              auto
              flat
              href="#"
              onClick={(e) => {
                signIn('osu');
              }}
            >
              Log in
            </Button>
          </Navbar.Item>
        )}
      </Navbar.Content>
    </Navbar>
  );
}
