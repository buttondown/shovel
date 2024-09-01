import { GENRE_REGISTRY, REGISTRY } from '@/lib/services'
import type { MetadataRoute } from 'next'

const BASE_URL = "https://shovel.report"

export default function sitemap(): MetadataRoute.Sitemap {
    const technologies = Object.keys(REGISTRY)
    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        // @ts-ignore
        ...technologies.map(technology => ({
            url: `${BASE_URL}/technology/${technology}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        })),
        // @ts-ignore
        ...Object.keys(GENRE_REGISTRY).map(genre => ({
            url: `${BASE_URL}/genre/${genre}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        })),
    ]
}
