import { Logo } from "@/components/Icons/Logo";
import { MoonIcon } from "@/components/Icons/MoonIcon";
import { SunIcon } from "@/components/Icons/SunIcon";
import { Avatar, Button, Navbar, Text, Switch, useTheme } from "@nextui-org/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme as useNextTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

// TODO: fix various errors, check web console
// TODO: read next-auth docs on proper session handling

export default function NavigationBar({}) {
  const { data: session, status } = useSession();
  const { setTheme } = useNextTheme();
  const { isDark } = useTheme();
  return (
    <Navbar isBordered variant={"static"}>
      <Navbar.Brand>
        <Link href="/">
          <Logo
            width={120}
            height={40}
            style={{
              marginTop: "10px",
            }}
          />
        </Link>
      </Navbar.Brand>
      {/**<Navbar.Content>
        <Navbar.Item>
          <Navbar.Link>
            <Link href="/">
              <Text>Link 1</Text>
            </Link>
          </Navbar.Link>
        </Navbar.Item>
        <Navbar.Item>
          <Navbar.Link>
            <Link href="/">
              <Text>Link 2</Text>
            </Link>
          </Navbar.Link>
        </Navbar.Item>
        <Navbar.Item>
          <Navbar.Link>
            <Link href="/">
              <Text>Link 3</Text>
            </Link>
          </Navbar.Link>
        </Navbar.Item>
      </Navbar.Content>*/}
      <Navbar.Content>
        <Switch
          checked={isDark}
          size="md"
          iconOff={<SunIcon filled />}
          iconOn={<MoonIcon filled />}
          onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
        />
        {status === "authenticated" ? (
          <>
            <Navbar.Item>
              <Navbar.Link>
                <Link href={`/${session.user.id}`}>
                  <Text b>{session.user.name}</Text>
                </Link>
              </Navbar.Link>
            </Navbar.Item>
            <Navbar.Item>
              <Link href={`/${session.user.id}`}>
                <Avatar
                  color={"gradient"}
                  bordered
                  src={session.user.image}
                  size="lg"
                  css={{
                    cursor: "pointer",
                    ":hover": {
                      opacity: 0.8,
                    },
                  }}
                />
              </Link>
            </Navbar.Item>
            <Navbar.Item>
              <Button
                auto
                flat
                href="#"
                onPress={() => {
                  signOut("osu");
                }}
              >
                Log out
              </Button>
            </Navbar.Item>
          </>
        ) : status === "loading" ? (
          <Navbar.Item>
            <Text b>Loading...</Text>
          </Navbar.Item>
        ) : (
          <Navbar.Item>
            <Button
              auto
              color={"gradient"}
              href="#"
              onPress={() => {
                signIn("osu");
              }}
              shadow
            >
              Log in
            </Button>
          </Navbar.Item>
        )}
      </Navbar.Content>
    </Navbar>
  );
}
