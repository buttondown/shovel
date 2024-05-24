import { Loader } from "./types";

const load: Loader = async (domain: string) => {
  const html = await fetch(`https://${domain}`).then((res) => res.text());
  return {
    label: "HTML",
    data: [
      {
        value: html,
        type: "text/html",
      },
    ],
  };
};

const exports = { load };
export default exports;
