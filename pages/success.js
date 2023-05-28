import Link from "next/link";

function Success() {
  return (
    <div style={{ padding: "10px", textAlign: "center" }}>
      <h1>Registration Successful</h1>

      <p>
        Please check that you have successfully joined the Discord server & that your name appears on the
        <Link href="https://docs.google.com/spreadsheets/d/1_O18oJNAHI8Vf6UK_FjPhZS42YhlQESvk9kKiOY0StM/view?rm=minimal">
          {" Main Spreadsheet "}
        </Link>
      </p>

      <p>
        {"If you haven't already, please familiarize yourself with the"}
        <Link href="https://docs.google.com/document/d/13CvktUzqbDGan44fVBMwKu7wl12UV2I6qEt5Q3reo-s/view">
          {" Rules Document "}
        </Link>
        {", it's important that you do."}
      </p>
    </div>
  );
}

export default Success;
