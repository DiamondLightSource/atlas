import { ServerConnection, KernelManager } from "@jupyterlab/services";
import type { Kernel } from "@jupyterlab/services";

export interface KernelClientOptions {
  baseUrl?: string;
  wsUrl?: string;
  token?: string;
}

export function makeServerSettings(opts: KernelClientOptions = {}) {
  return ServerConnection.makeSettings({
    baseUrl: opts.baseUrl ?? "http://localhost:8888",
    wsUrl: opts.wsUrl ?? "ws://localhost:8888",
    token: opts.token ?? "",

    appendToken: !!opts.token,
  });
}

export function makeKernelManager(
  opts: KernelClientOptions = {},
): KernelManager {
  return new KernelManager({ serverSettings: makeServerSettings(opts) });
}

export async function startKernel(
  kernelManager: KernelManager,
  name: "python3",
): Promise<Kernel.IKernelConnection> {
  await kernelManager.ready;
  return kernelManager.startNew({ name });
}

export type OutputHandler = (chunk: {
  kind: "stream" | "result" | "error";
  text: string;
}) => void;

export function executeCode(
  kernel: Kernel.IKernelConnection,
  code: string,
  onOutput: OutputHandler,
): Promise<void> {
  const future = kernel.requestExecute({ code });

  future.onIOPub = (msg) => {
    switch (msg.header.msg_type) {
      case "stream": {
        const content = msg.content as any;
        onOutput({ kind: "stream", text: content.text });
        break;
      }
      case "execute_result":
      case "display_data": {
        const data = (msg.content as any).data ?? {};
        if (data["text/plain"]) {
          onOutput({ kind: "result", text: data["text/plain"] });
        }
        break;
      }
      case "error": {
        const content = msg.content as any;
        onOutput({
          kind: "error",
          text: `${content.ename}: ${content.evalue}`,
        });
      }
      default:
        break; // status, execute_impl, etc - ignore for minimal REPL
    }
  };

  return future.done.then(() => undefined);
}
