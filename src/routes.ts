import { Dataset, createCheerioRouter } from "crawlee";
import { LABELS } from "./consts.js";

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log, $, request }) => {
    const currentPage = $('span[aria-current="true"]').text();
    if (currentPage === "1") {
        const totalProducts = $("span.jJ-z").text();
        log.info(totalProducts);
    }
    log.info(`Enqueueing pagination: ${request.url}`);
    await enqueueLinks({
        globs: ["https://www.zappos.com/drinkware/.zso?t=drinkware&p=*"],
        label: LABELS.LIST,
    });

    log.info(`Enqueueing product details: ${request.url}`);
    await enqueueLinks({
        selector: 'a[itemprop="url"]',
        label: LABELS.PRODUCT,
    });
});

router.addHandler(LABELS.PRODUCT, async ({ request, $, log }) => {
    log.info(`Extracting data: ${request.url}`);
    await Dataset.pushData({
        url: request.loadedUrl,
        brand: $('a[itemprop="url"] span').text(),
        name: $('meta[itemprop="name"]').attr("content"),
        SKU: $('span[itemprop="sku"]').text(),
        currentPrice: `$${$('span[itemprop="price"]').attr("content")}`,
        originalPrie: $(".SA-z").text(),
    });
});
