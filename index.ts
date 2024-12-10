import { addToList, sendEmail } from './sendgrid.ts';
import { getArtworks, getArtwork } from './sanity.ts';
import { Hono } from '@hono/hono'
import { trimTrailingSlash } from '@hono/hono/trailing-slash'
import { cors } from '@hono/hono/cors';

type Reply = {
    status: number
    data: any
}

function reply(data: Reply = { status: 404, data: { message: 'Resource Not Found' } }) {
    return new Response(JSON.stringify(data), {
        headers: { 'content-type': 'application/json' }
    })
}

const api = new Hono()

api.use("/api/*", cors())
api.use(trimTrailingSlash())
api.get("/api/artworks", async (c) => {
    const res: Reply = { status: 200, data: null };

    res.data = await getArtworks()
    return c.json(res);
})

api.get("/api/artworks/:slug", async (c) => {
    const res: Reply = { status: 200, data: null };
    const slug = c.req.param("slug")

    res.data = await getArtwork(slug)
    if (!res.data) res.status = 404;
    return c.json(res);
})

api.post("/api/newsletter", async (c) => {
    const res: Reply = { status: 200, data: null };

    try {
        const { name, email } = await c.req.json();

        if (!name || !email) {
            res.status = 400;
            res.data = {
                message: 'Invalid or Missing Values'
            };

            return c.json(res)
        }

        await addToList(name, email);
        return c.json(res);
    } catch (_) { return c.json({})}

})

api.post("/api/email", async (c) => {
    const res: Reply = { status: 200, data: null };

    try {
        const { name, email, message } = await c.req.json();

        if (!name || !email || !message) {
            res.status = 400;
            res.data = {
                message: 'Invalid or Missing Values'
            };

            return c.json(res)
        }

        await sendEmail(email, name, message);
        return c.json(res);
    } catch (_) { return c.json({}) }
})

Deno.serve(api.fetch);
