import { Hono } from "hono";
import { MinecraftServer } from "./server";

const server = new MinecraftServer("minecraft");
server.start();

const app = new Hono();

interface NewPostBody {
  title: string;
  pubDate: string;
  author: string;
  content: string;
}

app.post("/new-post", async (c) => {
  try {
    const body: NewPostBody = await c.req.json();

    // make command
    const command = generateBookCommand(body.author, body.title, body.content);

    await server.execute(command);

    return c.status(200);
  } catch (err: any) {
    console.log(err);
    return c.json({ error: err.message || "Something broke bad" }, 500);
  }
});

app.get("/", async (c) => {
  return c.text("server is running");
});

app.get("/test-hello", async (c) => {
  await server.execute("say Is this thing on?");
  return c.text("hi");
});

function generateBookCommand(
  author: string,
  title: string,
  content: string,
): string {
  // Split content into pages of max 210 chars
  const pages: string[] = [];
  let remaining = content;
  while (remaining.length > 0) {
    if (remaining.length <= 210) {
      pages.push(remaining);
      break;
    }
    // Find last space within limit - we're not savages who break words
    let cutIndex = remaining.substring(0, 210).lastIndexOf(" ");
    if (cutIndex === -1) cutIndex = 210; // Unless we have no choice
    pages.push(remaining.substring(0, cutIndex));
    remaining = remaining.substring(cutIndex === 210 ? cutIndex : cutIndex + 1);
  }
  // Format pages with proper escaping
  const formattedPages = pages.map((page) => {
    return `{raw:'"${page}"'}`;
  });

  let _formattedPages = `[${formattedPages.join(", ")}]`;

  // Generate command with proper NBT structure
  return `data modify block 5 68 32 Book set value {count: 1, components: {"minecraft:written_book_content": {pages: ${_formattedPages}, author: "${author}", title: {raw: "${title}"}}}, id: "minecraft:written_book"}`;
}

export default {
  port: process.env.PORT,
  fetch: app.fetch,
  tls:
    process.env.TLS == "TRUE"
      ? {
          cert: Bun.file("cert.pem"),
          key: Bun.file("key.pem"),
        }
      : {},
};
