import { Text, Spacer, Avatar, Button, Link } from "@nextui-org/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Client } from "osu-web.js";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <>
      <Text
        h1
        css={{
          textGradient: "45deg, $blue600 -10%, $pink600 100%",
          textAlign: "center",
        }}
      >
        {"Squink's Epic Gacha Showdown"}
      </Text>
      <Spacer y={1} />
      {status === "authenticated" ? (
        <>
          <Link href="/register">
            <Button auto size="lg" color={"gradient"} shadow>
              Register
            </Button>
          </Link>
        </>
      ) : status === "loading" ? (
        <Text b>Loading...</Text>
      ) : (
        <Text h3>Please log in to register</Text>
      )}
    </>
  );
}
