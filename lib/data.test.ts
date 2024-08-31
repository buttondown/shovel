import fetch from "@/lib/data";
import { describe, expect, test } from "vitest";

const DOMAIN_TO_EXPECTED_DATA = {
  "formkeep.com": [
    {
      label: "SOCIAL_MEDIA",
      metadata: {
        username: "formkeep.js",
        service: "github",
      },
    },
    {
      label: "SOCIAL_MEDIA",
      metadata: { username: "formkeep", service: "linkedin" },
    },
  ],
  "savvycal.com": [
    {
      label: "SOCIAL_MEDIA",
      metadata: { username: "savvycal", service: "twitter" },
    },
    {
      label: "RSS",
      metadata: { url: "https://savvycal.com/feed.xml" },
    },
    {
      label: "SERVICE",
      metadata: { value: "rewardful", via: "URL" },
    },
  ],
  "milled.com": [
    {
      label: "SERVICE",
      metadata: { value: "email_octopus", via: "SPF" },
    },
  ],
  "buttondown.email": [
    {
      label: "SOCIAL_MEDIA",
      metadata: { username: "buttondown", service: "github" },
    },
  ],
  "zed.dev": [
    {
      label: "SOCIAL_MEDIA",
      metadata: { username: "zeddotdev", service: "twitter" },
    },
  ],
  "bytereview.co.uk": [
    {
      label: "SOCIAL_MEDIA",
      metadata: { username: "@bytereview", service: "tiktok" },
    },
    {
      label: "SOCIAL_MEDIA",
      metadata: { username: "bytereview", service: "twitter" },
    },
  ],
};

describe("fetching", () => {
  Object.entries(DOMAIN_TO_EXPECTED_DATA).forEach(([domain, expectedData]) => {
    expectedData.forEach((data) => {
      test(`fetches ${data.label} for ${domain}`, async () => {
        const { notes } = await fetch(domain);
        expect(notes).toContainEqual(data);
      });
    });
  });

  test("deduping identical records", async () => {
    const { notes } = await fetch("zed.dev");
    expect(notes.filter((n) => n.label === "SOCIAL_MEDIA")).toHaveLength(1);
  });
});
