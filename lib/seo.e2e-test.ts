import { expect, test } from "playwright/test";


const REPRESENTATIVE_ROUTES = [
    "/domain/buttondown.com",
    "/technology/cloudflare",
    "/genre/crm"
]

const BASE_URL = "http://127.0.0.1:3045";

REPRESENTATIVE_ROUTES.forEach((route) => {
    test(`${route} has an h1 element`, async ({ page }) => {
        await page.goto(`${BASE_URL}${route}`);
        const h1 = await page.$('h1');
        expect(h1).not.toBeNull();
    });
});
