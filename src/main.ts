import { CheerioCrawler, ProxyConfiguration } from "crawlee";
import { LABELS } from "./consts.js";
import { router } from "./routes.js";

const crawler = new CheerioCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
});

// Provide the scraper with a search query
const searchQuery = "men oxfords".toLowerCase();

// Add initial request based on the provided search query
await crawler.addRequests([
    {
        url: `https://www.zappos.com/${searchQuery
            .trim()
            .replace(" ", "-")}/.zso?t=${encodeURIComponent(
            searchQuery.trim()
        )}&p=0`,
        label: LABELS.START,
    },
]);

// Run the scraper
await crawler.run();
