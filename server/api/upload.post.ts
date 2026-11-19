/**
 * UNA JOYA - Upload de imagens do painel (Cloudflare R2)
 *
 * Só aceita pedidos de uma conta admin ativa:
 *  1. exige "Authorization: Bearer <token da sessão Supabase>";
 *  2. valida o token no Supabase Auth;
 *  3. confirma no banco (is_active_admin) que a conta está ativa em admin_profiles.
 * Aceita apenas imagens (JPEG, PNG, WebP, AVIF, GIF) de até 8 MB, conferindo a assinatura do arquivo.
 * Salva cada foto em 3 larguras WebP (…-400/-800/-1600.webp) e devolve a URL da maior.
 */
import { randomUUID } from 'node:crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const MAX_BYTES = 8 * 1024 * 1024

const detectImage = (buf: Buffer): { ext: string; mime: string } | null => {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' }
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: 'png', mime: 'image/png' }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return { ext: 'webp', mime: 'image/webp' }
  if (buf.toString('ascii', 4, 8) === 'ftyp' && /avi[fs]/.test(buf.toString('ascii', 8, 12))) return { ext: 'avif', mime: 'image/avif' }
  if (buf.toString('ascii', 0, 4) === 'GIF8') return { ext: 'gif', mime: 'image/gif' }
  return null
}

let s3: S3Client | null = null

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // 1-3. Autenticação e autorização
  const auth = getHeader(event, 'authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Faça login no painel.' })

  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData.user) throw createError({ statusCode: 401, statusMessage: 'Sessão expirada. Entre novamente.' })
  const { data: isAdmin, error: adminError } = await supabase.rpc('is_active_admin')
  if (adminError || isAdmin !== true) throw createError({ statusCode: 403, statusMessage: 'Sem permissão.' })

  // Configuração do R2
  const endpoint = process.env.R2_ENDPOINT
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET_NAME
  const publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '')
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw createError({ statusCode: 500, statusMessage: 'Armazenamento de imagens não configurado.' })
  }

  // Arquivo
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.data?.length)
  if (!file) throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado.' })
  if (file.data.length > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'Imagem acima de 8 MB.' })
  const kind = detectImage(file.data)
  if (!kind) throw createError({ statusCode: 415, statusMessage: 'Envie uma imagem JPG, PNG, WebP, AVIF ou GIF.' })

  s3 ??= new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId, secretAccessKey } })
  const now = new Date()
  const base = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}`
  const put = (Key: string, Body: Buffer, ContentType: string) => s3!.send(new PutObjectCommand({
    Bucket: bucket, Key, Body, ContentType, CacheControl: 'public, max-age=31536000, immutable'
  }))

  // Gera 3 tamanhos em WebP (400, 800, 1600 px de largura) para o site entregar o tamanho certo
  // a cada tela. GIF (pode ser animado) e falhas na conversão sobem o arquivo original.
  if (kind.ext !== 'gif') {
    const variants = await makeVariants(file.data)
    if (variants) {
      await Promise.all(variants.map(v => put(`${base}-${v.width}.webp`, v.data, 'image/webp')))
      return { success: true, url: `${publicUrl}/${base}-1600.webp` }
    }
  }

  await put(`${base}.${kind.ext}`, file.data, kind.mime)
  return { success: true, url: `${publicUrl}/${base}.${kind.ext}` }
})

const WIDTHS = [400, 800, 1600] as const

const makeVariants = async (input: Buffer): Promise<{ width: number; data: Buffer }[] | null> => {
  try {
    const { default: sharp } = await import('sharp')
    return await Promise.all(WIDTHS.map(async width => ({
      width,
      data: await sharp(input, { failOn: 'error' })
        .rotate() // respeita a orientação da foto do celular
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: width >= 1600 ? 82 : 78 })
        .toBuffer()
    })))
  } catch (err) {
    console.warn('Não foi possível gerar tamanhos da imagem; enviando o original.', err)
    return null
  }
}
