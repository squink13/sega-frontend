import { XataClient } from "@/xata";
import { createUploadthing } from "uploadthing/next-legacy";

const xata = new XataClient();

const f = createUploadthing();

const auth = () => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileCount: 176 }, video: { maxFileCount: 176 } })
    /* // Set permissions and file types for this FileRoute
    .middleware(async ({ req, res }) => {
      // This code runs on your server before upload
      const user = await auth(req, res);

      // If you throw, the user will not be able to upload
      if (!user) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    }) */
    .onUploadComplete(async ({ file }) => {
      // This code RUNS ON YOUR SERVER after upload

      let url = file.url;
      let lastIndex = url.lastIndexOf("_");
      let lastDot = url.lastIndexOf(".");
      let osu_id = url.substring(lastIndex + 1, lastDot);

      let record = await xata.db.registered.update(osu_id, { card_url: url });

      console.log("record", record);
      console.log("id", osu_id);
    }),
};
