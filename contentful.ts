const contentful = {
    space: Deno.env.get('CONTENTFUL_SPACE'),
    accessToken: Deno.env.get('CONTENTFUL_TOKEN')
}

function makeURL({ content_type, select, limit, order, fields, fieldsIn, fieldsNotIn } = {}) {
    let baseUrl = `https://cdn.contentful.com/spaces/${contentful.space}/entries?access_token=${contentful.accessToken}`;

    if (content_type) baseUrl = `${baseUrl}&content_type=${content_type}`;
    if (select) baseUrl = `${baseUrl}&select=${select}`;
    if (limit) baseUrl = `${baseUrl}&limit=${limit}`;
    if (order) baseUrl = `${baseUrl}&order=${order}`;

    if (fields) {
        for (const [name, value] of fields) {
            baseUrl = `${baseUrl}&fields.${name}=${value}`
        }
    }

    if (fieldsIn) {
        for (const [name, value] of fieldsIn) {
            baseUrl = `${baseUrl}&fields.${name}[in]=${value}`
        }
    }

    if (fieldsNotIn) {
        for (const [name, value] of fieldsNotIn) {
            baseUrl = `${baseUrl}&fields.${name}[nin]=${value}`
        }
    }

    return baseUrl
}

export async function getEntries(options) {
    const url = makeURL(options);
    const response = await fetch(url);

    return await response.json();
}
