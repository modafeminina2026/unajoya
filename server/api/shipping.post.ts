// Tabela de frete fixo partindo de JUNDIAÍ / SP como origem
const SHIPPING_TABLE: Record<string, { label: string; price: number; days: string }> = {
  // Estado de Origem (São Paulo)
  SP: { label: 'São Paulo', price: 15.90, days: '2-4 dias úteis' },
  // Região Sudeste (vizinhas a SP)
  RJ: { label: 'Rio de Janeiro', price: 17.90, days: '3-5 dias úteis' },
  MG: { label: 'Minas Gerais', price: 18.90, days: '3-6 dias úteis' },
  ES: { label: 'Espírito Santo', price: 19.90, days: '4-7 dias úteis' },
  // Região Sul
  PR: { label: 'Paraná', price: 18.90, days: '3-6 dias úteis' },
  SC: { label: 'Santa Catarina', price: 19.90, days: '4-7 dias úteis' },
  RS: { label: 'Rio Grande do Sul', price: 21.90, days: '5-8 dias úteis' },
  // Região Centro-Oeste
  DF: { label: 'Distrito Federal', price: 22.90, days: '5-8 dias úteis' },
  GO: { label: 'Goiás', price: 22.90, days: '5-8 dias úteis' },
  MS: { label: 'Mato Grosso do Sul', price: 24.90, days: '6-9 dias úteis' },
  MT: { label: 'Mato Grosso', price: 26.90, days: '7-10 dias úteis' },
  // Região Nordeste
  BA: { label: 'Bahia', price: 27.90, days: '7-11 dias úteis' },
  SE: { label: 'Sergipe', price: 28.90, days: '8-12 dias úteis' },
  AL: { label: 'Alagoas', price: 29.90, days: '8-13 dias úteis' },
  PE: { label: 'Pernambuco', price: 29.90, days: '8-13 dias úteis' },
  PB: { label: 'Paraíba', price: 29.90, days: '9-14 dias úteis' },
  RN: { label: 'Rio Grande do Norte', price: 29.90, days: '9-14 dias úteis' },
  CE: { label: 'Ceará', price: 29.90, days: '9-14 dias úteis' },
  PI: { label: 'Piauí', price: 30.90, days: '9-14 dias úteis' },
  MA: { label: 'Maranhão', price: 32.90, days: '10-15 dias úteis' },
  // Região Norte
  TO: { label: 'Tocantins', price: 35.90, days: '10-15 dias úteis' },
  PA: { label: 'Pará', price: 38.90, days: '12-17 dias úteis' },
  AM: { label: 'Amazonas', price: 42.90, days: '14-19 dias úteis' },
  RO: { label: 'Rondônia', price: 42.90, days: '14-19 dias úteis' },
  AC: { label: 'Acre', price: 45.90, days: '15-20 dias úteis' },
  AP: { label: 'Amapá', price: 45.90, days: '15-20 dias úteis' },
  RR: { label: 'Roraima', price: 47.90, days: '15-20 dias úteis' },
}

// Cidades da Região Aglomerada de Jundiaí para frete local super rápido
const JUNDIAI_REGION_CITIES = [
  'jundiaí', 'jundiai',
  'várzea paulista', 'varzea paulista',
  'campo limpo paulista',
  'itupeva',
  'louveira',
  'vinhedo',
  'cabrúva', 'cabreuva'
]

async function getAddressByCep(cep: string): Promise<{ uf: string; city: string } | null> {
  try {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return null
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.erro) return null
    return {
      uf: data.uf || '',
      city: (data.localidade || '').toLowerCase()
    }
  } catch {
    return null
  }
}

async function tryCorreiosAPI(cep: string): Promise<{ price: number; days: string; service: string } | null> {
  const user = process.env.CORREIOS_USER
  const accessCode = process.env.CORREIOS_ACCESS_CODE
  if (!user || !accessCode) return null

  try {
    const credentials = Buffer.from(`${user}:${accessCode}`).toString('base64')
    const tokenRes = await fetch('https://cws.correios.com.br/token', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' }
    })
    if (!tokenRes.ok) return null
    const { token } = await tokenRes.json()

    // CEP de Origem oficial: Jundiaí / SP (13201-000)
    const cepOrigem = process.env.CORREIOS_CEP_ORIGEM || '13201000'
    const cepDestino = cep.replace(/\D/g, '')

    const calcRes = await fetch('https://cws.correios.com.br/precoFprazo/v1/nacional', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idLote: '1',
        parametrosProduto: [{
          coProduto: '04510', // PAC
          psObjeto: '300',
          tpObjeto: '2',
          nVlComprimento: '20',
          nVlAltura: '10',
          nVlLargura: '15',
          cepOrigem,
          cepDestino
        }]
      })
    })

    if (!calcRes.ok) return null
    const calcData = await calcRes.json()
    const result = calcData[0]
    if (!result || result.txErro) return null

    return {
      price: parseFloat(result.pcFinal) || 15.90,
      days: `${result.prazoEntrega} dias úteis`,
      service: 'PAC - Correios (origem: Jundiaí/SP)'
    }
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { cep, subtotal = 0 } = body

  if (!cep) {
    throw createError({ statusCode: 400, statusMessage: 'CEP é obrigatório.' })
  }

  const FREE_SHIPPING_THRESHOLD = 300
  const isFreeShipping = Number(subtotal) >= FREE_SHIPPING_THRESHOLD

  if (isFreeShipping) {
    return {
      success: true,
      isFree: true,
      price: 0,
      label: 'Grátis',
      days: '2-5 dias úteis',
      service: 'Frete Grátis (Envio de Jundiaí/SP)',
      via: 'threshold'
    }
  }

  // 1. Tentar API oficial dos Correios caso configurada
  const correiosResult = await tryCorreiosAPI(cep)
  if (correiosResult) {
    return {
      success: true,
      isFree: false,
      price: correiosResult.price,
      label: `R$ ${correiosResult.price.toFixed(2).replace('.', ',')}`,
      days: correiosResult.days,
      service: correiosResult.service,
      via: 'correios_api'
    }
  }

  // 2. Consultar o endereço de destino via ViaCEP
  const address = await getAddressByCep(cep)

  // 2.1 Se o destino for Jundiaí ou cidades vizinhas (Região de Jundiaí)
  if (address && JUNDIAI_REGION_CITIES.includes(address.city)) {
    return {
      success: true,
      isFree: false,
      price: 9.90,
      label: 'R$ 9,90',
      days: '1-2 dias úteis',
      service: 'Entrega Expressa Jundiaí e Região',
      via: 'local_jundiai',
      region: 'Jundiaí e Região'
    }
  }

  // 2.2 Outros destinos por Estado (com origem em Jundiaí/SP)
  if (address && address.uf && SHIPPING_TABLE[address.uf]) {
    const shipping = SHIPPING_TABLE[address.uf]
    return {
      success: true,
      isFree: false,
      price: shipping.price,
      label: `R$ ${shipping.price.toFixed(2).replace('.', ',')}`,
      days: shipping.days,
      service: `PAC - Correios (origem Jundiaí/SP)`,
      via: 'regional_table',
      region: shipping.label
    }
  }

  // 3. Fallback genérico para CEPs não mapeados
  return {
    success: true,
    isFree: false,
    price: 15.90,
    label: 'R$ 15,90',
    days: '3-6 dias úteis',
    service: 'PAC - Correios (origem Jundiaí/SP)',
    via: 'default'
  }
})
