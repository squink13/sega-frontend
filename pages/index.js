import NavigationBar from "@/components/NavigationBar";
import { Text, Spacer, Avatar, Button, Link, Box, styled } from "@nextui-org/react";
import { UploadButton } from "@uploadthing/react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  if (status === "authenticated" && session.osu_id) {
    console.log(session.osu_id);
  }

  const Box = styled("div", {
    boxSizing: "border-box",
  });

  return (
    <>
      <NavigationBar />
      <Box
        css={{
          px: "$12",
          py: "$15",
          mt: "$12",
          "@xsMax": { px: "$10" },
          maxWidth: "1366px",
          margin: "0 auto",
          display: "flex",
          display: "grid",
          placeItems: "center",
        }}
      >
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
        <Spacer y={1} />
        <Link href="/draft">
          <Text b size={"$xl"}>
            Click Here for the Draft Page
          </Text>
        </Link>

        {/* <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            // Do something with the response
            console.log("Files: ", res);
            alert("Upload Completed");
          }}
          onUploadError={() => {
            // Do something with the error.
            alert(`ERROR! ${error.message}`);
          }}
        /> */}
      </Box>
    </>
  );
}
