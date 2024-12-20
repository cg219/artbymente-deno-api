const sendgrid = {
    apiToken: Deno.env.get('SENDGRID_TOKEN'),
    request: 'https://sendgrid.com/v3'
}

let listId: string;

export async function addToList(name: string, email: string) {
    if (!listId) {
        const req = `${sendgrid.request}/marketing/lists`;
        const response = await fetch(req, {
            headers: {
                'Authorization': `Bearer ${sendgrid.apiToken}`
            },
            method: 'GET'
        })

        const lists = await response.json();

        listId = lists.result.find((list: any) => list.name == 'Artbymente')?.id;
        console.log(listId);
    }

    const req = `${sendgrid.request}/marketing/contacts`;
    const body = {
        list_ids: [listId],
        contacts: [{
            first_name: name,
            email
        }]
    };
    const response = await fetch(req, {
        headers: {
            'Authorization': `Bearer ${sendgrid.apiToken}`,
            'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify(body)
    })

    return await response.json();
}

export async function sendEmail(name: string, email: string, message: string) {
    const req = `${sendgrid.request}/mail/send`;
    const body = {
        from: { email: Deno.env.get('SENDING_EMAIL') },
        'reply_to': { email,  name },
        subject: 'Message from Artbymente',
        personalizations: [{
            to: [{ email: Deno.env.get('CONTACT_EMAIL') }]
        }],
        content: [{
            type: 'text/plain',
            value: message
        }]
    }

    await fetch(req, {
        headers: {
            'Authorization': `Bearer ${sendgrid.apiToken}`,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(body)
    })

    return true;
}
