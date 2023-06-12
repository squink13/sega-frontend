import { Text, Spacer, Avatar, Button, Link } from "@nextui-org/react";
import { signIn, signOut, useSession } from "next-auth/react";
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
        {"Squink's Epic Gacha Adventure"}
      </Text>
      <Spacer y={1} />
      <Text h3>Registrations have closed</Text>
    </>
  );
}
