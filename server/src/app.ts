import express, { Express, Request, Response } from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";

import { getTwilioTurnServer } from "./services/external.service";
import { generateRandomImages } from "./services/video.service";

const app: Express = express();

app.use(
  cors({
    origin: "http://localhost:4000",
  })
);

app.use(morgan("combined"));

// Frontend as staticfiles
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/turn-server", async (req: Request, res: Response) => {
  const turnServerURLs = await getTwilioTurnServer();
  return res.status(200).json({ data: turnServerURLs });
});

app.get("/get-avatar", async (req: Request, res: Response) => {
  const { category } = req.query;
  const baseUrl = `${req.protocol}://${req.headers.host}`;
  if (category !== "male" && category !== "female") {
    return res.status(400).json({
      error: `${category} is not a valid category. input either male or female`,
    });
  }
  const randomImage = await generateRandomImages(category);
  return res.status(200).json({ data: `${baseUrl}/${randomImage}` });
});

// Server images staticfiles directory
app.use(express.static("public"));
app.use("/images", express.static("images"));

app.get("/*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

export default app;
