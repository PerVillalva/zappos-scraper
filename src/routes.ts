import { Dataset, createCheerioRouter } from "crawlee";
import { LABELS, Product } from "./consts.js";

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log, $, request, crawler }) => {
    const currentPage = $('span[aria-current="true"]').text();
    const lastPage = Number($("#searchPagination span a:last-child").text());

    // Run this code only when the scraper is on the first page
    if (currentPage === "1") {
        const totalProducts = $("h1 + span").text();
        log.info(totalProducts);

        // Loop through the total number of pages and enqueue all store pages for the particular search query
        for (let page = 1; page < lastPage; page++) {
            await crawler.addRequests([
                {
                    url: request.url.replace(/p=\d+/, `p=${page}`),
                    label: LABELS.LIST,
                },
            ]);
        }
    }

    // Enqueue all products displayed on each visited page
    log.info(`Enqueueing product details: ${request.loadedUrl}`);
    await enqueueLinks({
        selector: 'a[itemprop="url"]',
        label: LABELS.PRODUCT,
    });
});

router.addHandler(LABELS.PRODUCT, async ({ request, $, log }) => {
    log.info(`Extracting data: ${request.url}`);

    const priceElement = $("");

    // Define the results object based on the "Product" interface structure imported from consts.ts
    const results: Product = {
        url: request.loadedUrl,
        imgUrl: "",
        brand: $('span[itemprop="brand"]').text().trim(),
        name: "",
        SKU: $('*[itemprop~="sku"]').text().trim(),
        inStock: !request.url.includes("oosRedirected=true"), // Check if product is in stock. If not, set inStock property to false
        onSale: false,
        price: $('span[itemprop="price"]').text(),
    };

    // Check if product is on sale. If true, add the product's original price to the results object
    if ($('div[itemprop="offers"]').text().includes("OFF")) {
        results.onSale = true;
        results.originalPrice = $(
            'div[itemprop="offers"] > span:nth-child(2) > span:nth-child(2) > span:nth-child(2)'
        ).text();
    }

    /* Some Zappos products link to a special Zapos store named "The Style Room".
     Products in this store have a slightly different page layout, so we have to adjust our selectors accordingly */
    if (request.url.includes("the-style-room")) {
        results.name = $('*[itemprop~="name"]').text().trim();
        results.imgUrl = $("#default-image").attr("src");
    } else {
        results.name = $('meta[itemprop="name"]')
            .attr("content")
            ?.split(" ")[1];
        results.imgUrl = $(
            '#stage button[data-media="image"] img[itemprop="image"]'
        ).attr("src");
    }

    // Push results to the dataset
    await Dataset.pushData(results);
});
