import { Hono } from "hono";
import { Rcon } from "rcon-client";
import { env } from "hono/adapter";

const app = new Hono();

interface NewPostBody {
  title: string;
  pubDate: string;
  authors: string;
  content: string;
}

app.post("/new-post", async (c) => {
  try {
    const body = await c.req.json();
    const mdContent = body.mdFile;

    if (!mdContent) return c.json({ error: "No markdown file provided" }, 400);

    // Parse frontmatter and content
    const frontmatterMatch = mdContent.match(
      /^---\n([\s\S]*?)\n---\n([\s\S]*)$/,
    );

    if (!frontmatterMatch)
      return c.json({ error: "Invalid markdown format" }, 400);

    const frontmatterRaw = frontmatterMatch[1];
    const content = frontmatterMatch[2].trim();

    // Parse frontmatter into key-value pairs
    const frontmatter: Record<string, string> = {};
    frontmatterRaw.split("\n").forEach((line: string) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length) {
        frontmatter[key.trim()] = valueParts.join(":").trim();
      }
    });

    const newPost: NewPostBody = {
      title: frontmatter.title || "",
      pubDate: frontmatter.pubDate || "",
      authors: frontmatter.authors || "",
      content,
    };

    // Split content into pages (limit to ~14 chars per page for Minecraft books)
    const pageSize = 240;
    const pages: string[] = [];

    for (let i = 0; i < content.length; i += pageSize) {
      const page = content.substring(i, i + pageSize);
      pages.push(`{"text":"${page.replace(/"/g, '\\"')}"}`);
    }

    // Construct Minecraft command to create a book with the post content
    const command = `/data modify block ~ ~ ~ Items append value {Slot:4b,id:"minecraft:written_book",Count:1b,tag:{
      title:"${newPost.title.replace(/"/g, '\\"')}",
      author:"${newPost.authors.replace(/"/g, '\\"')}",
      pages:[${pages.map((page) => `'${page}'`).join(",")}]
    }}`;

    const { RCON_PASSWORD } = env<{ RCON_PASSWORD: string }>(c);

    const HOST = "minecraft";
    const PORT = 25575;

    const rcon = await Rcon.connect({
      host: HOST,
      port: PORT,
      password: RCON_PASSWORD,
    });

    const response = await rcon.send(command);
    await rcon.end();

    return c.json(
      {
        success: true,
        post: newPost,
        rconResponse: response,
      },
      200,
    );
  } catch (err: any) {
    return c.json({ error: err.message || "Something broke bad" }, 500);
  }
});

app.post("/test", async (c) => {
  try {
    // Construct Minecraft command to create a book with the post content
    const command = `/say hello`;

    const { RCON_PASSWORD } = env<{ RCON_PASSWORD: string }>(c);

    const HOST = "minecraft";
    const PORT = 25575;

    const rcon = await Rcon.connect({
      host: HOST,
      port: PORT,
      password: RCON_PASSWORD,
    });

    const response = await rcon.send(command);
    await rcon.end();

    return c.json(
      {
        success: true,
        rconResponse: response,
      },
      200,
    );
  } catch (err: any) {
    return c.json({ error: err.message || "Something broke bad" }, 500);
  }
});

export default app;
