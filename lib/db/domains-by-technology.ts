import { db } from "@/lib/db/connection";

const fetchDomainsByTechnology = async (technology: string, limit: number) => {
    const data = process.env.DISABLE_DATABASE
      ? { data: [], count: 0 }
      : await db
          .selectFrom("detected_technologies")
          .where("technology", "=", technology)
          .selectAll()
          .distinctOn("domain")
          .execute()
          .then((results) => {
              return {
                data: results.slice(0, limit),
                count: results.length,
        };
    });

    return data;
};

export default fetchDomainsByTechnology;
