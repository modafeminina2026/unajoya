// Tabela de frete fixo por regiao como fallback quando nao ha API dos Correios
const SHIPPING_TABLE: Record<string, { label: string; price: number; days: string }> = {
  AC: { label: 'Acre', price: 45.90, days: '15-20 dias uteis' },
  AM: { label: 'Amazonas', price: 42.90, days: '15-20 dias uteis' },
  AP: { label: 'Amapa', price: 45.90, days: '15-20 dias uteis' },
  PA: { label: 'Para', price: 38.90, days: '12-18 dias uteis' },
  RO: { label: 'Rondonia', price: 42.90, days: '15-20 dias uteis' },
  RR: { label: 'Roraima', price: 47.90, days: '15-20 dias uteis' },
  TO: { label: 'Tocantins', price: 35.90, days: '10-15 dias uteis' },
  AL: { label: 'Alagoas', price: 29.90, days: '10-15 dias uteis' },
  BA: { label: 'Bahia', price: 27.90, days: '8-13 dias uteis' },
  CE: { label: 'Ceara', price: 29.90, days: '10-15 dias uteis' },
  MA: { label: 'Maranhao', price: 32.90, days: '10-15 dias uteis' },
  PB: { label: 'Paraiba', price: 29.90, days: '10-15 dias uteis' },
  PE: { label: 'Pernambuco', price: 28.90, days: '9-14 dias uteis' },
  PI: { label: 'Piaui', price: 30.90, days: '10-15 dias uteis' },
  RN: { label: 'Rio Grande do Norte', price: 29.90, days: '10-15 dias uteis' },
  SE: { label: 'Sergipe', price: 28.90, days: '9-14 dias uteis' },
  DF: { label: 'Distrito Federal', price: 22.90, days: '6-10 dias uteis' },
  GO: { label: 'Goias', price: 22.90, days: '6-10 dias uteis' },
  MS: { label: 'Mato Grosso do Sul', price: 25.90, days: '7-12 dias uteis' },
  MT: { label: 'Mato Grosso', price: 27.90, days: '8-13 dias uteis' },
  ES: { label: 'Espirito Santo', price: 19.90, days: '5-8 dias uteis' },
  MG: { label: 'Minas Gerais', price: 18.90, days: '4-7 dias uteis' },
  RJ: { label: 'Rio de Janeiro', price: 17.90, days: '3-6 dias uteis' },
  SP: { label: 'Sao Paulo', price: 15.90, days: '2-5 dias uteis' },
  PR: { label: 'Parana', price: 18.90, days: '4-7 dias uteis' },
  RS: { label: 'Rio Grande do Sul', price: 21.90, days: '5-9 dias uteis' },
  SC: { label: 'Santa Catarina', price: 19.90, days: '4-8 dias uteis' },
}

async function getUFByCep(cep: string): Promise<string | null> {
  try {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return null
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.erro) return null
    return data.uf || null
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

    const cepOrigem = process.env.CORREIOS_CEP_ORIGEM || '01310100'
    const cepDestino = cep.replace(/\D/g, '')

    const calcRes = await fetch('https://cws.correios.com.br/precoFprazo/v1/nacional', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idLote: '1',
        parametrosProduto: [{
          coProduto: '04510',
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
      price: parseFloat(result.pcFinal) || 19.90,
      days: `${result.prazoEntrega} dias uteis`,
      service: 'PAC - Correios'
    }
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { cep, subtotal = 0 } = body

  if (!cep) {
    throw createError({ statusCode: 400, statusMessage: 'CEP e obrigatorio.' })
  }

  const FREE_SHIPPING_THRESHOLD = 300
  const isFreeShipping = Number(subtotal) >= FREE_SHIPPING_THRESHOLD

  if (isFreeShipping) {
    return { success: true, isFree: true, price: 0, label: 'Gratis', days: '5-12 dias uteis', service: 'Frete Gratis (Correios PAC)', via: 'threshold' }
  }

  const correiosResult = await tryCorreiosAPI(cep)
  if (correiosResult) {
    return { success: true, isFree: false, price: correiosResult.price, label: `R$ ${correiosResult.price.toFixed(2).replace('.', ',')}`, days: correiosResult.days, service: correiosResult.service, via: 'correios_api' }
  }

  const uf = await getUFByCep(cep)
  if (uf && SHIPPING_TABLE[uf]) {
    const shipping = SHIPPING_TABLE[uf]
    return { success: true, isFree: false, price: shipping.price, label: `R$ ${shipping.price.toFixed(2).replace('.', ',')}`, days: shipping.days, service: 'PAC - Correios (estimativa)', via: 'regional_table', region: shipping.label }
  }

  return { success: true, isFree: false, price: 19.90, label: 'R$ 19,90', days: '8-15 dias uteis', service: 'PAC - Correios (estimativa)', via: 'default' }
})
