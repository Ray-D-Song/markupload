import { Hono } from 'hono'

const app = new Hono().basePath('/api')

app.post('/upload', async (c) => {
  try {
    const env = c.env as { TOKEN: string; BUCKET: R2Bucket }
    const token = c.req.header('Authorization')

    if (token !== env.TOKEN) {
      return c.text('Unauthorized', 401)
    }

    const body = await c.req.parseBody()
    const file = body['file']

    if (!file) {
      return c.text('File not provided', 400)
    }

    if (typeof file === 'string') {
      return c.text('Invalid type', 400)
    }

    const fileStream = file.stream()
    await env.BUCKET.put(file.name, fileStream)

    return c.text('File uploaded successfully')
  } catch (e) {
    console.error(e)
    return c.text('Internal server error', 500)
  }
})

export default app
