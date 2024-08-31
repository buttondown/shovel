import { Loader } from "./types";

const load: Loader = async (domain: string) => {
  try {
    // Some domains, like `nerdy.dev`, do not return valid responses from HTTP 1.1 requests.
    // We should rip out the fetch-h2 dependency at some point soon, but.. not high on the list
    // of priorities.
    const response = await fetch(`https://${domain}`, {
      signal: AbortSignal.timeout(5000),
    });
    const html = await response.text();
    const headerKeys = Array.from(response.headers.keys());
    return {
      label: "HTML",
      data: [
        {
          value: html,
          type: "text/html",
        },
        ...headerKeys.map((key) => ({
          value: response.headers.get(key) || "",
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
