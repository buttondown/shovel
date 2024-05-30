import { Loader } from "./types";

const load: Loader = async (domain: string) => {
  try {
    const response = await fetch(`https://${domain}`);
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

const exports = { load };
export default exports;
