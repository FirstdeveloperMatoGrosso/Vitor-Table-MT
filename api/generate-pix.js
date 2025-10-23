// Vercel Serverless Function para gerar PIX
// Evita problemas de CORS chamando a API do Mercado Pago pelo backend

export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responder OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, description, customerEmail } = req.body;

    // Validar dados
    if (!amount || !description) {
      return res.status(400).json({ error: 'Amount and description are required' });
    }

    // Obter token do ambiente
    const accessToken = process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN;
    
    if (!accessToken || accessToken.includes('YOUR_ACCESS_TOKEN')) {
      return res.status(500).json({ 
        error: 'Mercado Pago credentials not configured',
        message: 'Configure REACT_APP_MERCADO_PAGO_ACCESS_TOKEN in Vercel Environment Variables'
      });
    }

    // Chamar API do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': `${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify({
        transaction_amount: parseFloat(amount),
        description: description,
        payment_method_id: 'pix',
        payer: {
          email: customerEmail || 'customer@vitortable.com',
          first_name: 'Cliente',
          last_name: 'VitorTable'
        },
        notification_url: process.env.REACT_APP_WEBHOOK_URL || 'https://vitor-table-mt.vercel.app/api/webhook',
        metadata: {
          app: 'VitorTable MT',
          version: '1.0.0'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Mercado Pago Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Mercado Pago API error',
        details: errorData 
      });
    }

    const data = await response.json();

    // Retornar dados do PIX
    return res.status(200).json({
      success: true,
      qrCode: data.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      qrCodeUrl: data.point_of_interaction?.transaction_data?.ticket_url,
      transactionId: data.id,
      status: data.status,
      expirationDate: data.date_of_expiration,
      amount: data.transaction_amount
    });

  } catch (error) {
    console.error('Error generating PIX:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
