import { Hono } from "hono";
import { SocketDetails, SocketPromiseWrapper } from "./socketwrapper";

const app = new Hono();

interface NewPostBody {
  title: string;
  pubDate: string;
  author: string;
  content: string;
}

const HOST = "localhost";
const PORT = 4567;
const CONSOLE_PASSWORD = process.env.CONSOLE_PASSWORD;

let s: SocketDetails = {
  url: `ws://${HOST}:${PORT}/v1/ws/console`,
  opts: {
    headers: {
      cookie: `x-servertap-key=${CONSOLE_PASSWORD}`,
    },
  },
};

app.post("/new-post", async (c) => {
  try {
    const socket = new SocketPromiseWrapper({ url: s.url, opts: s.opts });
    const body: NewPostBody = await c.req.json();

    // Construct command with pages first in the tag
    const command = generateBookCommand(body.author, body.title, body.content);

    await socket.ready();

    const resp = await socket.send(command);
    const parsed = JSON.parse(resp);

    if (parsed.message.split(" ")[0] == "Modified") {
      return c.json(
        {
          success: true,
        },
        200,
      );
    } else throw Error("unexpected response");
  } catch (err: any) {
    console.log(err);
    return c.json({ error: err.message || "Something broke bad" }, 500);
  }
});

app.get("/items", async (c) => {
  try {
    const socket = new SocketPromiseWrapper({ url: s.url, opts: s.opts });
    const resp = await socket.send("data get block 4 68 32 Items");

    return c.json(
      {
        success: true,
        message: resp,
      },
      200,
    );
  } catch (err: any) {
    return c.json({ error: err.message || "Something broke bad" }, 500);
  }
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
  return `data modify block 4 68 32 Items append value {count: 1, components: {"minecraft:written_book_content": {pages: ${_formattedPages}, author: "${author}", title: {raw: "${title}"}}}, id: "minecraft:written_book"}`;
}

export default app;
