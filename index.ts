import "dotenv/config";
import { Podcast } from "podcast";
import { publish } from "./lib/aws.js";
import config, { coverUrl } from "./lib/config.js";
import { crawl } from "./lib/crawlers/index.js";

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled rejection at ", promise, reason);
  process.exit(1);
});

const { title, description, author, website } = config.feed;
const feed = new Podcast({
  title: title,
  description: description,
  itunesImage: coverUrl(),
  feedUrl: website,
  siteUrl: website,
  author: author,
  generator: "https://github.com/masone/podcast-aggregator",
});

await Promise.all(
  config.urls.map(async (url) => {
    const items = await crawl(url);

    items.forEach((item) => {
      feed.addItem(item);
    });
  })
);

const xml = feed.buildXml();
console.log(xml);
await publish(xml);
