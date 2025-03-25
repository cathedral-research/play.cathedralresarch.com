export class MinecraftServerTmux {
  tmuxSession: string;

  constructor(tmuxSession: string = "minecraft") {
    this.tmuxSession = tmuxSession;
  }

  public async start() {
    // Check if session exists first
    const checkProc = Bun.spawn(
      ["tmux", "has-session", "-t", this.tmuxSession],
      {
        stdio: ["ignore", "ignore", "pipe"],
      },
    );

    const exitCode = await checkProc.exited;

    if (exitCode !== 0) {
      throw new Error(`Tmux session '${this.tmuxSession}' doesn't exist`);
    }

    // Set up output capture using tmux pipe-pane
    const pipeProc = Bun.spawn(["tmux", "pipe-pane", "-t", this.tmuxSession]);

    await pipeProc.exited;
  }

  public async execute(command: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        // Create temporary buffer file
        const bufferPath = `/tmp/tmux-buffer-${Date.now()}`;
        await Bun.write(bufferPath, command);

        // Load buffer from file to avoid shell escaping issues
        const loadBuffer = Bun.spawn([
          "tmux",
          "load-buffer",
          "-b",
          "minecraft-cmd",
          bufferPath,
        ]);
        await loadBuffer.exited;

        // Paste and execute
        const pasteBuffer = Bun.spawn([
          "tmux",
          "paste-buffer",
          "-b",
          "minecraft-cmd",
          "-d",
          "-t",
          this.tmuxSession,
        ]);
        await pasteBuffer.exited;

        // Send final Enter key
        const sendEnter = Bun.spawn([
          "tmux",
          "send-keys",
          "-t",
          this.tmuxSession,
          "Enter",
        ]);
        await sendEnter.exited;

        // Cleanup
        await Bun.$`rm ${bufferPath}`;
        resolve();
      } catch (error) {
        reject(`Command execution failed: ${error}`);
      }
    });
  }

  public stop(): Promise<void> {
    return this.execute("stop");
  }
}
