// Child process of the teardown test in http.test.ts (Spec 006, B4, B5), run from the built
// package. It serves on a free port and reports it, then reports "request" when its server has the
// head of a request (Node's public `http.server.request.start` channel). On a message it calls
// close() against a deadline of its own, reports "closed" or the missed deadline, and leaves
// nothing else running.

import { subscribe } from "node:diagnostics_channel";
import { loadServed, startHttpServer } from "../../dist/index.js";

subscribe("http.server.request.start", () => process.send("request"));
const http = await startHttpServer(loadServed(), { port: 0 });
process.send(http.port);
process.once("message", async () => {
  const deadline = new Promise((resolve) =>
    setTimeout(resolve, 1500, "close() did not finish within 1.5 s").unref(),
  );
  const result = await Promise.race([http.close().then(() => "closed"), deadline]);
  process.send(result, () => process.disconnect());
});
