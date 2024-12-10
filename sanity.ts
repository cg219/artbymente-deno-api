import {createClient} from '@sanity/client'

const sanity = {
    id: Deno.env.get("SANITY_ID"),
    dataset: Deno.env.get("SANITY_DATASET")
}

const LIMIT = 9;

const client = createClient({
    projectId: sanity.id,
    dataset: sanity.dataset,
    useCdn: true, 
    apiVersion: '2024-12-08', 
})

function transformData(data: any) {
    return {
        title: data.title,
        tags: data.tags,
        date: data.date,
        description: data.description,
        slug: data.slug,
        image: data.image,
        link: data.link,
        mediums: data.mediums,
        nsfw: data.nsfw,
        hasPrints: data.hasPrints,
        views: data.views,
        likes: data.likes,
        related: data.related ?? null
    }
}

export async function getArtwork(slug: string) {
    const art = await client.fetch(`*[_type == "artwork" && slug.current == "${slug}"] {
    title, tags, date, description, link, mediums, nsfw, hasPrints, views, likes,
    "slug": slug.current,
    "image": image.asset->{url},
    "related": *[_type == "artwork" && tags match ^.tags][0...${LIMIT}]{ nsfw, "slug": slug.current, "image": image.asset->{url}}
}| order(date asc)[0]`)

    if (art.related.length < LIMIT) {
        const ignore = art.related.map((d) => d.slug);

        ignore.push(art.slug);

        const limit = LIMIT - [...new Set(ignore)].length;
        const preparedIgnore = ignore.map((d) => `"${d}"`).join(", ")
        const related = await client.fetch(`*[_type == "artwork" && !(slug.current in [${preparedIgnore}])][0...${limit}]{ nsfw, "slug": slug.current, "image": image.asset->{url}}`)

        art.related = [...art.related, ...related]
    }

    return transformData(art)
}

export async function getArtworks() {
    const art = await client.fetch(`*[_type == "artwork"] {
    title, tags, date, description, link, mediums, nsfw, hasPrints, views, likes,
    "slug": slug.current,
    "image": image.asset->{url}
}| order(date desc)`)
    return art.map((d) => transformData(d))
}
