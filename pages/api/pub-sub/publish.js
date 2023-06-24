import * as Ably from "ably/promises";

export default async function handler(req, res) {
  console.log("/api/pub-sub/publish called");

  if (!process.env.ABLY_API_KEY) {
    return res
      .status(500)
      .setHeader("content-type", "application/json")
      .json({
        errorMessage: `Missing ABLY_API_KEY environment variable.
                If you're running locally, please ensure you have a ./.env file with a value for ABLY_API_KEY=your-key.
                If you're running in Netlify, make sure you've configured env variable ABLY_API_KEY. 
                Please see README.md for more details on configuring your Ably API Key.`,
      });
  }

  const client = new Ably.Rest(process.env.ABLY_API_KEY);

  var channel = client.channels.get("draft");
  const message = req.body;

  await channel.publish("update-from-server", message);

  res.status(200).json({ message: "Message published successfully" }); // send a response
}
