import puppeteer from "puppeteer";
import type { Loader } from "./types";

const load: Loader = async (domain: string) => {
	try {
		if (process.env.DISABLE_PUPPETEER !== "true") {
			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			const response = await page.goto(`https://${domain}`, {
				waitUntil: "networkidle0",
			});
			const html = await page.content();
			const headers = await response?.headers();
			await browser.close();
			return {
				label: "HTML",
				data: [
					{
						value: html,
						type: "text/html",
					},
					...Object.entries(headers || {}).map(([key, value]) => ({
						value: value || "",
						type: `text/headers/${key}`,
					})),
				],
			};
		}
		const response = await fetch(`https://${domain}`);
		const html = await response.text();
		const headers = response.headers;
		return {
			label: "HTML",
			data: [
				{
					value: html,
					type: "text/html",
				},
				...Object.entries(headers).map(([key, value]) => ({
					value: value[0] || "",
					type: `text/headers/${key}`,
				})),
			],
		};
	} catch (error) {
		return {
			label: "HTML",
			data: [
				{
					value: "Error loading HTML",
					type: "text/error",
				},
			],
		};
	}
};

const exports = { load, name: "html" };
export default exports;
