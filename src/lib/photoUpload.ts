export async function uploadPhoto(url: string, fields: Record<string, string>, file: File): Promise<void> {
  const form = new FormData()
  Object.entries(fields).forEach(([key, value]) => form.append(key, value))
  form.append('Content-Type', file.type)
  form.append('file', file)

  const response = await fetch(url, { method: 'POST', body: form })
  if (!response.ok) {
    throw new Error(`Photo upload to S3 failed with status ${response.status}`)
  }
}
