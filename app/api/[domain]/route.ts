import dns from "@/lib/dns";
import htmlRules from "@/lib/htmlRules";
import rules from "@/lib/rules";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: {
    params: {
      domain: string;
    };
  }
) {
  const domain = context.params.domain;
  const result = await dns.lookup(domain);
  const html = await fetch(`https://${domain}`).then((res) => res.text());
  const dnsNotes = rules.run(result);
  const htmlNotes = htmlRules.run(html);
  return NextResponse.json({
    domain,
    dns: result,
    dnsNotes,
    htmlNotes,
  });
}
