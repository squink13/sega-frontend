import { Text, Spacer } from "@nextui-org/react";

export default function Home() {
  return (
    <>
      <Text h1 css={{ textGradient: "45deg, $blue600 -10%, $pink600 100%" }}>
        {"Squink's Epic Gacha Showdown"}
      </Text>
      <Spacer y={1} />
    </>
  );
}
