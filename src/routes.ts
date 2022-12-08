import { Dataset, createCheerioRouter } from "crawlee";
import { LABELS, Product } from "./consts.js";

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log, $, request }) => {
    // Print the total number of products when on the first page
    if (request.userData.label === LABELS.START) {
        const totalProducts = $("h1 + span").text();
        log.info(totalProducts);
    }

    // Loop through the total number of pages and enqueue all store pages for the particular search query
    await enqueueLinks({
        globs: ["https://www.zappos.com/*/.zso?t=*&p=*"],
        label: LABELS.LIST,
    });

    // Enqueue all products displayed on each visited page
    log.info(`Enqueueing product details: ${request.loadedUrl}`);
    await enqueueLinks({
        selector: 'a[itemprop="url"]',
        label: LABELS.PRODUCT,
    });
});

router.addHandler(LABELS.PRODUCT, async ({ request, $, log }) => {
    log.info(`Extracting data: ${request.url}`);

    // Define the results object based on the "Product" interface structure imported from consts.ts
    const results: Product = {
        url: request.loadedUrl,
        imgUrl: undefined,
        brand: $('span[itemprop="brand"]').text().trim(),
        name: undefined,
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
        results.name = $('meta[itemprop="name"]').attr("content");
        results.imgUrl = $(
            '#stage button[data-media="image"] img[itemprop="image"]'
        ).attr("src");
    }

    // Push results to the dataset
    await Dataset.pushData(results);
});
