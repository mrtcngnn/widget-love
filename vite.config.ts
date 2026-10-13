import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cityPhotosDirectory = path.resolve(__dirname, "public/city-photos");

function cityPhotosPlugin(): PluginOption {
  const virtualModuleId = "virtual:city-photos";
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  const findCityPhotos = (directory: string): string[] => {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return [];
    }

    return entries.flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findCityPhotos(entryPath);
      if (!/\.(avif|gif|jpe?g|png|webp)$/i.test(entry.name)) return [];

      return [
        path.relative(path.resolve(__dirname, "public"), entryPath)
          .split(path.sep)
          .join("/"),
      ];
    });
  };

  return {
    name: "city-photos",
    resolveId(id) {
      return id === virtualModuleId ? resolvedVirtualModuleId : null;
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return null;
      return `export default ${JSON.stringify(findCityPhotos(cityPhotosDirectory))};`;
    },
    configureServer(server) {
      server.watcher.add(cityPhotosDirectory);
    },
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(cityPhotosDirectory)) return;

      const virtualModule = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
      if (virtualModule) server.moduleGraph.invalidateModule(virtualModule);
      server.ws.send({ type: "full-reload" });
      return [];
    },
  };
}

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
  base: "/widget-love/",
  plugins: [react(), svgr(), cityPhotosPlugin(), cityPersistencePlugin()],
});