export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  if (!body.client_id || !body.client_secret || !body.code || !body.redirect_uri) {
    return { error: 'Missing parameters in request' }
  }

  try {
    const urlParams = new URLSearchParams()
    urlParams.append('client_id', body.client_id)
    urlParams.append('client_secret', body.client_secret)
    urlParams.append('grant_type', 'authorization_code')
    urlParams.append('redirect_uri', body.redirect_uri)
    urlParams.append('code', body.code)

    // Using standard node fetch directly to avoid Nitro/ofetch abstractions swallowing the raw body
    const res = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: urlParams,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const raw = await res.text()
    let parsed = null;
    try {
      parsed = JSON.parse(raw)
    } catch(e) {}

    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      raw_response: raw,
      parsed_response: parsed
    }
  } catch (err: any) {
    return { error: String(err) }
  }
})
