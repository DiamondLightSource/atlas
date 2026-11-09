// this module currently performs the role of a kernel manager,
// making the connection to JKG/JEG and requesting the creation of kernels,
// making them directly available to React components e.g. Console

import {
  ServerConnection,
  KernelManager,
  KernelMessage,
} from "@jupyterlab/services";
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
  name: string,
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
    if (KernelMessage.isStreamMsg(msg)) {
      onOutput({ kind: "stream", text: msg.content.text });
    } else if (
      KernelMessage.isExecuteResultMsg(msg) ||
      KernelMessage.isDisplayDataMsg(msg)
    ) {
      const text = msg.content.data["text/plain"];

      if (typeof text === "string") {
        onOutput({ kind: "result", text });
      }
    } else if (KernelMessage.isErrorMsg(msg)) {
      onOutput({
        kind: "error",
        text: `${msg.content.ename}: ${msg.content.evalue}`,
      });
    }
  };

  return future.done.then(() => undefined);
}
