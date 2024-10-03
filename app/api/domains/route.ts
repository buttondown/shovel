import fetchDomainsByTechnology from "@/lib/db/domains-by-technology";
import { NextRequest } from "next/server";

export async function GET(
	request: NextRequest,
	context: {
	},
) {
    const technology = request.nextUrl.searchParams.get("technology");
    if (!technology) {
        return Response.json({
            error: "Missing required parameter: technology",
        }, {
            status: 400,
        });
    }

    const data = await fetchDomainsByTechnology(technology, 100);
	return Response.json({
        // We really need to decide on some sort of way to enforce a contract here.
        // Maybe zod-openapi?
        data: data.data.map((item) => {
            return {
                domain: item.domain,
                creation_date: item.creation_date,
            }
        }).sort((a, b) => b.creation_date.getTime() - a.creation_date.getTime()),
        count: data.count,
	});
}
