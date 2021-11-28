// import 'https://deno.land/x/dotenv@v3.1.0/load.ts';
import { getEntries } from './contentful.js';
import { addToList, sendEmail } from './sendgrid.js';
import { serve } from 'https://deno.land/std@0.116.0/http/server.ts';

function vow (promise) {
    return promise
        .then(response => ([response, null]))
        .catch(err => Promise.resolve([null, err]))
}

function transformResponse(data, assets) {
    let image = assets.find((d) => d.sys.id == data.fields.image.sys.id);

    return {
        ...data.fields,
        image: {
            url: image.fields.file.url,
            filename: image.fields.file.fileName
        }
    }
}

function reply(data = { status: 404, data: { message: 'Resource Not Found' } }) {
    return new Response(JSON.stringify(data), {
        headers: { 'content-type': 'application/json' }
    })
}

async function handler(req) {
    const url = new URL(req.url);
    let res = { status: 200, data: null };

    if (req.method == 'GET') {
        switch(url.pathname) {
            case `/api/artworks/${url.pathname.slice('/api/artworks/'.length)}`: {
                const id = url.pathname.slice('/api/artworks/'.length);
                const rawData = await getEntries({ content_type: 'artwork', fields: new Map([['slug', id]]) });

                res.data = rawData.items.map(d => transformResponse(d, rawData.includes.Asset))[0] || null;
                return reply(res);
            }
            case '/api/artworks': {
                const rawData = await getEntries({ content_type: 'artwork', order: '-fields.date' });

                res.data = rawData.items.map(d => transformResponse(d, rawData.includes.Asset));
                return reply(res);
            }
        }
    }

    if (req.method == 'POST') {
        switch(url.pathname) {
            case '/api/newsletter': {
                try {
                    let { name, email } = await req.json();

                    if (!name || !email) {
                        res.status = 400;
                        res.data = {
                            message: 'Invalid or Missing Values'
                        };
                        break;
                    }

                    await addToList({ email, name });
                    return reply(res);
                } catch (error) { return reply() }
            }
            case '/api/email': {
                try {
                    let { name, email, message } = await req.json();

                    if (!name || !email || !message) {
                        res.status = 400;
                        res.data = {
                            message: 'Invalid or Missing Values'
                        };
                        break;
                    }

                    await sendEmail({ email, name, message });
                    return reply(res);
                } catch (error) { return reply() }
            }
        }
    }

    return reply();
}

console.log('Listening...');
await serve(handler);
