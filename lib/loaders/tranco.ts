
import { db } from "@/lib/db/connection";
import { Loader } from "./types";

const load: Loader = async (domain: string) => {
    if (process.env.DISABLE_DATABASE === "true") {
        return {
            label: "Tranco",
            data: [],
        };
    }

    const tranco = await db.selectFrom("tranco").where("domain", "=", domain).selectAll().executeTakeFirst();

    return {
        label: "Tranco",
        data: tranco ? [{
            value: tranco.ranking.toString(),
            type: "text/number",
        }] : [],
    };
};

const exports = { load, name: "tranco" };
export default exports;
