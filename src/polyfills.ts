import { TextEncoder, TextDecoder } from "util";
import { ReadableStream, TransformStream, WritableStream } from "stream/web";

Object.assign(global, { TextEncoder, TextDecoder, ReadableStream, TransformStream, WritableStream });

class BroadcastChannel {
  name: string;
  onmessage: any;
  constructor(name: string) {
    this.name = name;
  }
  postMessage() {}
  close() {}
}
Object.assign(global, { BroadcastChannel });
