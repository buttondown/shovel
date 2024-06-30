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
};

describe("fetching", () => {
  Object.entries(DOMAIN_TO_EXPECTED_DATA).forEach(([domain, expectedData]) => {
    expectedData.forEach((data) => {
      test(`fetches ${
        data.metadata.value || data.label
      } for ${domain}`, async () => {
        const { notes } = await fetch(domain);
        expect(notes).toContainEqual(data);
      });
    });
  });
});
