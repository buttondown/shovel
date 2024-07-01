import fetch from "@/lib/data";
import { describe, expect, test } from "vitest";

const DOMAIN_TO_EXPECTED_DATA = {
  "savvycal.com": [
    {
      label: "SOCIAL_MEDIA",
      metadata: { username: "savvycal", service: "Twitter" },
    },
    {
      label: "RSS",
      metadata: { url: "https://savvycal.com/feed.xml" },
    },
    {
      label: "SERVICE",
      metadata: { value: "Rewardful" },
    },
  ],
  "buttondown.email": [
    {
      label: "SOCIAL_MEDIA",
      metadata: { username: "buttondown", service: "Twitter" },
    },
  ],
  "zed.dev": [
    {
      label: "SOCIAL_MEDIA",
      metadata: { username: "zeddotdev", service: "Twitter" },
    },
  ],
  "bytereview.co.uk": [
    {
      label: "SOCIAL_MEDIA",
      metadata: { username: "@bytereview", service: "TikTok" },
    },
    {
      label: "SOCIAL_MEDIA",
      metadata: { username: "bytereview", service: "Twitter" },
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
