import argv from "argv";
import { tmpdir } from "os";
import { existsSync, mkdirSync } from "fs";
import { resolve, join } from "path";

export interface Config {
  urls: string[];
  feed: {
    slug: string;
    title: string;
    url: string;
    website: string;
    description: string;
    author: string;
    cover: string;
  };
  aws: {
    host?: string;
    bucket: string;
  };
}

const args = argv
  .option({
    name: "config",
    short: "c",
    type: "string",
    description: "Path to the config file",
  })
  .run();

const config: Config = (
  await import(resolve(args.options.config || "podcast.config.js"))
).default;

export function publicUrl(path: string): string {
  return [config.feed.url, path].join("/");
}

export function downloadsDirectory(): string {
  const dir = join(tmpdir(), config.aws.bucket);
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
  return dir;
}

export function coverUrl(): string {
  return publicUrl(`${config.feed.slug}.png`);
}

export default config;
