// For more information, see https://crawlee.dev/
import { CheerioCrawler, ProxyConfiguration } from "crawlee";
import { router } from "./routes.js";
import { LABELS } from "./consts.js";

const crawler = new CheerioCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
});

await crawler.addRequests([
    "https://www.zappos.com/drinkware/.zso?t=drinkware",
]);

await crawler.run();
