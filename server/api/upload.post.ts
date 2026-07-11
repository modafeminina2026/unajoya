import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  // Ler os dados multipart do form
  const multipartData = await readMultipartFormData(event)
  if (!multipartData || multipartData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nenhum arquivo enviado.'
    })
  }

  // Localizar o campo do arquivo (geralmente nomeado como 'file' ou pelo tipo MIME de imagem)
  const fileData = multipartData.find(item => item.name === 'file' || item.type?.startsWith('image/'))
  if (!fileData || !fileData.data || !fileData.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Arquivo de imagem não encontrado ou inválido.'
    })
  }

  // Pegar as variáveis de ambiente
  const endpoint = process.env.R2_ENDPOINT
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucketName = process.env.R2_BUCKET_NAME || 'unjoya'
  const publicUrl = process.env.R2_PUBLIC_URL

  if (!endpoint || !accessKeyId || !secretAccessKey || !publicUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configurações de credenciais do R2 não encontradas no servidor.'
    })
  }

  // Inicializa o cliente do S3 configurado para o Cloudflare R2
  const s3 = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })

  // Gerar um nome de arquivo único para evitar colisões
  const fileExtension = fileData.filename.split('.').pop()
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  const key = `products/${uniqueId}.${fileExtension}`

  try {
    // Fazer o upload para o Cloudflare R2
    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileData.data,
      ContentType: fileData.type || 'image/jpeg'
    }))

    // Limpar a URL pública para evitar barras duplas
    const cleanPublicUrl = publicUrl.replace(/\/$/, '')
    const fileUrl = `${cleanPublicUrl}/${key}`

    return {
      success: true,
      url: fileUrl
    }
  } catch (error: any) {
    console.error('Erro no upload para o Cloudflare R2:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Falha no upload para o R2: ${error.message}`
    })
  }
})
