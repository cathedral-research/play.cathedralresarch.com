import { Hono } from "hono";
import { WebSocket } from "ws";

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
let socket: WebSocket | null;

function start() {
  try {
    socket = new WebSocket(`ws://${HOST}:${PORT}/v1/ws/console`, {
      headers: {
        cookie: `x-servertap-key=${CONSOLE_PASSWORD}`,
      },
    });

    socket.onerror = (error: any) => {
      console.error("WebSocket error:", error);
    };

    socket.onmessage = (message) => {
      const s = message.data.toString();
      const p = JSON.parse(s);
      console.log("ws received:", s);
    };

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };
  } catch (e) {
    console.error(e);
  }
}

start();

app.post("/new-post", async (c) => {
  try {
    if (!socket) throw Error("no websocket");

    const body: NewPostBody = await c.req.json();

    console.log("new book:", body.author, body.title);

    // Construct command with pages first in the tag
    const command = generateBookCommand(body.author, body.title, body.content);

    socket.send(command);

    return c.json(
      {
        success: true,
        post: body,
      },
      200,
    );
  } catch (err: any) {
    console.log(err);
    return c.json({ error: err.message || "Something broke bad" }, 500);
  }
});

app.post("/test", async (c) => {
  try {
    // Construct Minecraft command to create a book with the post content
    const command = `say hello`;

    return c.json(
      {
        success: true,
      },
      200,
    );
  } catch (err: any) {
    return c.json({ error: err.message || "Something broke bad" }, 500);
  }
});

app.get("/items", async (c) => {
  try {
    // const response = await rcon.send("data get block 4 68 32 Items");
    // await rcon.end();

    return c.json(
      {
        success: true,
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
