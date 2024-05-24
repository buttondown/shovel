import fetch from "@/lib/data";

export async function GET(
  request: Request,
  context: {
    params: {
      domain: string;
    };
  }
) {
  return Response.json(await fetch(context.params.domain));
}
