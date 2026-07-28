import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function cityPersistencePlugin() {
  return {
    name: "city-persistence",
    configureServer(server: { middlewares: { use: (path: string, handler: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use("/api/cities", (req: any, res: any, next: () => void) => {
        const citiesFilePath = path.resolve(__dirname, "src/assets/cities.json");

        const sendJson = (payload: unknown) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(payload));
        };

        if (req.method === "GET") {
          try {
            const content = readFileSync(citiesFilePath, "utf-8");
            sendJson(JSON.parse(content));
          } catch {
            res.statusCode = 500;
            sendJson({ error: "Could not read cities.json" });
          }
          return;
        }

        if (req.method === "PUT" || req.method === "POST") {
          let body = "";
          req.on("data", (chunk: Buffer | string) => {
            body += chunk;
          });

          req.on("end", () => {
            try {
              const parsed = JSON.parse(body);
              writeFileSync(citiesFilePath, `${JSON.stringify(parsed, null, 2)}\n`, "utf-8");
              sendJson({ ok: true });
            } catch {
              res.statusCode = 400;
              sendJson({ error: "Invalid city payload" });
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), svgr(), cityPersistencePlugin()],
});