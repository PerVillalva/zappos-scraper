// For more information, see https://crawlee.dev/
import { CheerioCrawler, ProxyConfiguration } from "crawlee";
import { router } from "./routes.js";

const crawler = new CheerioCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
});

const searchQuery = "men oxfords".toLowerCase();

await crawler.addRequests([
    `https://www.zappos.com/${searchQuery
        .trim()
        .replace(" ", "-")}/.zso?t=${encodeURIComponent(
        searchQuery.trim()
    )}&p=0`,
]);

await crawler.run();
