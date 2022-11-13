import { Dataset, createCheerioRouter, CrawlerExtension } from "crawlee";
import { LABELS } from "./consts.js";

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log, $, request, crawler }) => {
    const currentPage = $('span[aria-current="true"]').text();
    const lastPage = Number($("span.Wk-z a:last-child").text());
    if (currentPage === "1") {
        const totalProducts = $("span.jJ-z").text();
        log.info(totalProducts);
        for (let page = 1; page < lastPage; page++) {
            await crawler.requestQueue?.addRequests([
                {
                    url: request.url.replace(/p\=\d+/, `p=${page}`),
                    label: LABELS.LIST,
                },
            ]);
        }
    }

    log.info(`Enqueueing product details: ${request.loadedUrl}`);
    await enqueueLinks({
        selector: 'a[itemprop="url"]',
        label: LABELS.PRODUCT,
    });
});

router.addHandler(LABELS.PRODUCT, async ({ request, $, log }) => {
    log.info(`Extracting data: ${request.url}`);

    // ✅ Add specific properties to object
    interface Product {
        url: string;
        brand: string;
        name: string;
        SKU: string;
        inStock: boolean;
        onSale: boolean;
        price: string;
        originalPrice?: string; // 👈️ mark as optional so we can include it only when the product is on sale
    }

    const priceElement = $('span[itemprop="price"]');

    const results: Product = {
        // @ts-ignore
        url: request.loadedUrl,
        brand: $('span[itemprop="brand"]').text().trim(),
        // @ts-ignore
        name: "",
        SKU: $('*[itemprop~="sku"]').text().trim(),
        inStock: true,
        onSale: false,
        price: `${priceElement.text()}`,
    };

    if (priceElement.hasClass("JA-z")) {
        results.onSale = true;
        results.originalPrice = $(".SA-z").text();
    }

    if (request.url.includes("oosRedirected=true")) {
        results.inStock = false;
    }

    if (request.url.includes("the-style-room")) {
        results.name = $('*[itemprop~="name"]').text().trim();
    } else {
        // @ts-ignore
        results.name = $("span.EW-z").text().trim();
    }
    await Dataset.pushData(results);
});
