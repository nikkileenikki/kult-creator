const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-WP-Nonce, x-wp-nonce',
  'Access-Control-Max-Age':       '86400',
}

export async function onRequest({ request, next }) {
  // Return preflight immediately — never reach the route handler
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const response = await next()

  // Attach CORS headers to every response
  const headers = new Headers(response.headers)
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v)

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}
