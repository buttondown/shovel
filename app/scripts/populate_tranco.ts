import { db } from '@/lib/db/connection';
import pino from 'pino';

const TRANCO_URL = "https://tranco-list.eu/download/KJ94W/1000000";
const logger = pino();

async function fetchAndPopulateTrancoData() {
    try {
        const response = await fetch(TRANCO_URL);
        const data = await response.text();
        const lines = data.split('\n').filter(line => line.trim() !== '');
        const batchSize = 1000;
        const totalBatches = Math.ceil(lines.length / batchSize);

        for (let i = 0; i < lines.length; i += batchSize) {
            const batch = lines.slice(i, i + batchSize);
            await db
                .insertInto('tranco')
                .values(batch.map(line => {
                    const [rank, domain] = line.split(',');
                    return {
                        ranking: parseInt(rank),
                        domain: domain.trim(),
                    };
                }))
                .execute();
            logger.info(`Inserted batch ${Math.floor(i / batchSize) + 1} of ${totalBatches}`);
        }

        logger.info('Tranco data successfully populated in the database.');
    } catch (error) {
        logger.error({ err: error }, 'Error fetching and populating Tranco data');
    }
}

fetchAndPopulateTrancoData();
