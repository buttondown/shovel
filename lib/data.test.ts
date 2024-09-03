import fetch from "@/lib/data";
import { describe, expect, test } from "bun:test";
import { DetectedTechnology } from "./parsers/types";

const DOMAIN_TO_UNEXPECTED_DATA: Record<string, DetectedTechnology[]> = {
    "changelog.com": [
        {
            identifier: "subdomain",
            metadata: {
                value: "op3.dev",
            },
        },
    ],
};

const DOMAIN_TO_EXPECTED_DATA: Record<string, DetectedTechnology[]> = {
    "formkeep.com": [
        {
            identifier: "github",
            metadata: {
                username: "formkeep.js",
            },
        },
        {
            identifier: "linkedin",
            metadata: { username: "formkeep" },
        },
    ],
    "savvycal.com": [
        {
            identifier: "twitter",
            metadata: { username: "savvycal" },
        },
        {
            identifier: "rss",
            metadata: { url: "https://savvycal.com/feed.xml" },
        },
        {
            identifier: "rewardful",
            metadata: { value: "rewardful", via: "URL" },
        },
    ],
    "milled.com": [
        {
            identifier: "email_octopus",
            metadata: { via: "SPF" },
        },
    ],
    "buttondown.email": [
        {
            identifier: "github",
            metadata: { username: "buttondown" },
        },
    ],
    "zed.dev": [
        {
            identifier: "twitter",
            metadata: { username: "zeddotdev" },
        },
    ],
    "bytereview.co.uk": [
        {
            identifier: "tiktok",
            metadata: { username: "@bytereview" },
        },
        {
            identifier: "twitter",
            metadata: { username: "bytereview" },
        },
    ],
};

describe("fetching", () => {
    Object.entries(DOMAIN_TO_EXPECTED_DATA).forEach(([domain, expectedData]) => {
        expectedData.forEach((data) => {
            test(`fetches ${data.identifier} for ${domain}`, async () => {
                const { detected_technologies } = await fetch(domain);
                expect(detected_technologies).toContainEqual(data);
            });
        });
    });

    Object.entries(DOMAIN_TO_UNEXPECTED_DATA).forEach(([domain, unexpectedData]) => {
        unexpectedData.forEach((data) => {
            test(`does not fetch ${data.identifier} for ${domain}`, async () => {
                const { detected_technologies } = await fetch(domain);
                expect(detected_technologies).not.toContainEqual(data);
            });
        });
    });

    test("deduping identical records", async () => {
        const { detected_technologies } = await fetch("zed.dev");
        expect(detected_technologies.filter((tech) => tech.identifier === "twitter")).toHaveLength(1);
    });
});
