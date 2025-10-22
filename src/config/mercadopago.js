// Configuração do Mercado Pago
// Substitua com suas credenciais reais

export const MERCADO_PAGO_CONFIG = {
  // Token de acesso do Mercado Pago (obter em: https://www.mercadopago.com.br/developers/panel)
  ACCESS_TOKEN: 'YOUR_ACCESS_TOKEN_HERE',
  
  // ID da sua loja/usuário
  USER_ID: 'YOUR_USER_ID_HERE',
  
  // Chave PIX (obter em: https://www.mercadopago.com.br/developers/panel)
  PIX_KEY: 'YOUR_PIX_KEY_HERE',
  
  // URL base da API
  API_URL: 'https://api.mercadopago.com/v1',
  
  // Configurações de pagamento
  PAYMENT_CONFIG: {
    description: 'Compra de Saldo - VitorTable MT',
    notification_url: 'https://seu-dominio.com/webhook/mercadopago'
  }
};

// Função para gerar QR Code PIX via Mercado Pago
export const generatePixQRCode = async (amount, description) => {
  try {
    const response = await fetch(`${MERCADO_PAGO_CONFIG.API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: description,
        payment_method_id: 'pix',
        payer: {
          email: 'customer@example.com'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar QR Code PIX');
    }

    const data = await response.json();
    
    return {
      qrCode: data.point_of_interaction?.transaction_data?.qr_code,
      qrCodeUrl: data.point_of_interaction?.transaction_data?.qr_code_url,
      transactionId: data.id,
      status: data.status
    };
  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    return null;
  }
};
