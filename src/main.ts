// For more information, see https://crawlee.dev/
import { CheerioCrawler, ProxyConfiguration } from "crawlee";
import { router } from "./routes.js";

const crawler = new CheerioCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
});

// Provide the scraper with a search query
const searchQuery = "men oxfords".toLowerCase();

// Add initial request based on the provided search query
await crawler.addRequests([
    `https://www.zappos.com/${searchQuery
        .trim()
        .replace(" ", "-")}/.zso?t=${encodeURIComponent(
        searchQuery.trim()
    )}&p=0`,
]);

// Run the scraper
await crawler.run();
