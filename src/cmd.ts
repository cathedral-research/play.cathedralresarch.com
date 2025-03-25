export function generateSignCommand(title: string) {
  return `data modify block 5 69 32 front_text.messages set value ['"latest post"', '{"text":"${title}","bold":true}', '""', '""']`;
}

export function generateBookCommand(
  author: string,
  title: string,
  content: string,
): string {
  // Escape ALL the things
  const escapedContent = content
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/\n/g, "\\\\n") // Double escape newlines for NBT format
    .replace(/"/g, '\\"'); // Escape quotes

  // Your pagination logic is fine
  const pages: string[] = [];
  let remaining = escapedContent;
  while (remaining.length > 0) {
    if (remaining.length <= 210) {
      pages.push(remaining);
      break;
    }
    let cutIndex = remaining.substring(0, 210).lastIndexOf(" ");
    if (cutIndex === -1) cutIndex = 210;
    pages.push(remaining.substring(0, cutIndex));
    remaining = remaining.substring(cutIndex === 210 ? cutIndex : cutIndex + 1);
  }

  // NBT format needs properly escaped strings
  const formattedPages = pages.map((page) => `{raw:'"${page}"'}`);
  const _formattedPages = `[${formattedPages.join(", ")}]`;

  return `data modify block 5 68 32 Book set value {count: 1, components: {"minecraft:written_book_content": {pages: ${_formattedPages}, author: "${author.replace(/"/g, '\\"')}", title: {raw: "${title.replace(/"/g, '\\"')}"}}}, id: "minecraft:written_book"}`;
}
