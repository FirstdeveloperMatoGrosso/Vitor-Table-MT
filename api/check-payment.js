// Vercel Serverless Function para verificar status do pagamento

export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transactionId } = req.query;

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    const accessToken = process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      return res.status(500).json({ error: 'Credentials not configured' });
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      status: data.status,
      statusDetail: data.status_detail,
      amount: data.transaction_amount,
      dateApproved: data.date_approved,
      dateCreated: data.date_created
    });

  } catch (error) {
    console.error('Error checking payment:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
