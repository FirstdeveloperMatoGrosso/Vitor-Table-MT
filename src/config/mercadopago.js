// Configuração do Mercado Pago
// Use variáveis de ambiente em produção

export const MERCADO_PAGO_CONFIG = {
  // Token de acesso do Mercado Pago
  // Em produção: Configure no Vercel em Settings > Environment Variables
  ACCESS_TOKEN: process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN || 'TEST-YOUR_ACCESS_TOKEN_HERE',
  
  // ID da sua loja/usuário
  USER_ID: process.env.REACT_APP_MERCADO_PAGO_USER_ID || 'YOUR_USER_ID_HERE',
  
  // Chave PIX
  PIX_KEY: process.env.REACT_APP_MERCADO_PAGO_PIX_KEY || 'YOUR_PIX_KEY_HERE',
  
  // URL base da API
  API_URL: 'https://api.mercadopago.com/v1',
  
  // Configurações de pagamento
  PAYMENT_CONFIG: {
    description: 'Compra de Saldo - VitorTable MT',
    notification_url: process.env.REACT_APP_WEBHOOK_URL || 'https://vitor-table-mt.vercel.app/webhook/mercadopago'
  }
};

// Função para gerar QR Code PIX via Mercado Pago
export const generatePixQRCode = async (amount, description, customerEmail = 'customer@vitortable.com') => {
  try {
    // Validar credenciais
    if (MERCADO_PAGO_CONFIG.ACCESS_TOKEN.includes('YOUR_ACCESS_TOKEN')) {
      console.warn('⚠️ Configure suas credenciais do Mercado Pago!');
      // Retornar mock para desenvolvimento
      return {
        qrCode: '00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substring(7),
        qrCodeUrl: 'https://via.placeholder.com/300x300.png?text=QR+Code+PIX',
        transactionId: 'MOCK-' + Date.now(),
        status: 'pending',
        isMock: true
      };
    }

    const response = await fetch(`${MERCADO_PAGO_CONFIG.API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.ACCESS_TOKEN}`,
        'X-Idempotency-Key': `${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify({
        transaction_amount: parseFloat(amount),
        description: description,
        payment_method_id: 'pix',
        payer: {
          email: customerEmail,
          first_name: 'Cliente',
          last_name: 'VitorTable'
        },
        notification_url: MERCADO_PAGO_CONFIG.PAYMENT_CONFIG.notification_url,
        metadata: {
          app: 'VitorTable MT',
          version: '1.0.0'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro Mercado Pago:', errorData);
      throw new Error(errorData.message || 'Erro ao gerar QR Code PIX');
    }

    const data = await response.json();
    
    return {
      qrCode: data.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      qrCodeUrl: data.point_of_interaction?.transaction_data?.ticket_url,
      transactionId: data.id,
      status: data.status,
      expirationDate: data.date_of_expiration,
      isMock: false
    };
  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    return null;
  }
};

// Função para verificar status do pagamento
export const checkPaymentStatus = async (transactionId) => {
  try {
    if (transactionId.startsWith('MOCK-')) {
      return { status: 'approved', isMock: true };
    }

    const response = await fetch(`${MERCADO_PAGO_CONFIG.API_URL}/payments/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao verificar pagamento');
    }

    const data = await response.json();
    return {
      status: data.status,
      statusDetail: data.status_detail,
      amount: data.transaction_amount,
      dateApproved: data.date_approved
    };
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    return null;
  }
};

// Função para cancelar pagamento
export const cancelPayment = async (transactionId) => {
  try {
    if (transactionId.startsWith('MOCK-')) {
      return { success: true, isMock: true };
    }

    const response = await fetch(`${MERCADO_PAGO_CONFIG.API_URL}/payments/${transactionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        status: 'cancelled'
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao cancelar pagamento');
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao cancelar pagamento:', error);
    return { success: false, error: error.message };
  }
};
