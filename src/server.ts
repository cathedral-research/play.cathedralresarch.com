export class MinecraftServer {
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

  public execute(command: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const proc = Bun.spawn([
        "tmux",
        "send-keys",
        "-t",
        this.tmuxSession,
        command,
        "Enter",
      ]);

      proc.exited.then((exitCode) => {
        if (exitCode === 0) {
          resolve();
        } else {
          reject(
            new Error(`Failed to send command to tmux session: ${exitCode}`),
          );
        }
      });
    });
  }

  public stop(): Promise<void> {
    return this.execute("stop");
  }
}
