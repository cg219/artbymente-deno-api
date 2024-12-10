import { addToList, sendEmail } from './sendgrid.ts';
import { getArtworks, getArtwork } from './sanity.ts';

type Reply = {
    status: number
    data: any
}

function reply(data: Reply = { status: 404, data: { message: 'Resource Not Found' } }) {
    return new Response(JSON.stringify(data), {
        headers: { 'content-type': 'application/json' }
    })
}

async function handler(req: Request) {
    const url = new URL(req.url);
    const res: Reply = { status: 200, data: null };

    if (req.method == 'GET') {
        switch(url.pathname) {
            case `/api/artworks/${url.pathname.slice('/api/artworks/'.length)}`: {
                const id = url.pathname.slice('/api/artworks/'.length);

                res.data = await getArtwork(id)
                return reply(res);
            }
            case '/api/artworks': {
                res.data = await getArtworks()
                return reply(res)
            }
        }
    }

    if (req.method == 'POST') {
        switch(url.pathname) {
            case '/api/newsletter': {
                try {
                    const { name, email } = await req.json();

                    if (!name || !email) {
                        res.status = 400;
                        res.data = {
                            message: 'Invalid or Missing Values'
                        };
                        break;
                    }

                    await addToList({ email, name });
                    return reply(res);
                } catch (_) { return reply() }
            }
            case '/api/email': {
                try {
                    const { name, email, message } = await req.json();

                    if (!name || !email || !message) {
                        res.status = 400;
                        res.data = {
                            message: 'Invalid or Missing Values'
                        };
                        break;
                    }

                    await sendEmail({ email, name, message });
                    return reply(res);
                } catch (_) { return reply() }
            }
        }
    }

    return reply();
}

console.log('Listening...');
Deno.serve(handler)
