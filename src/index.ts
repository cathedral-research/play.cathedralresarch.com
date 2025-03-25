import { Hono } from "hono";
import { generateBookCommand, generateSignCommand } from "./cmd";
import { MinecraftServerTmux } from "./server";

const app = new Hono();

interface NewPostBody {
  title: string;
  pubDate: string;
  author: string;
  content: string;
}

const mc = new MinecraftServerTmux();
mc.start();

app.get("/test-hello", async (c) => {
  await mc.execute("say Is this thing on?");
  return c.text("the message should appear in minecraft");
});

app.post("/new-post", async (c) => {
  try {
    const body: NewPostBody = await c.req.json();

    let command = generateBookCommand(body.author, body.title, body.content);
    await mc.execute(command);
    command = generateSignCommand(body.title);
    await mc.execute(command);

    return c.json({ status: "ok" }, 200);
  } catch (err: any) {
    console.log(err);
    return c.json({ error: err.message || "Something broke bad" }, 500);
  }
});

export default {
  port: process.env.PORT,
  fetch: app.fetch,
  tls:
    process.env.TLS == "TRUE"
      ? {
          cert: Bun.file(
            process.env.CERTIFICATE_PATH ? process.env.CERTIFICATE_PATH : "",
          ),
          key: Bun.file(process.env.KEY_PATH ? process.env.KEY_PATH : ""),
        }
      : {},
};
