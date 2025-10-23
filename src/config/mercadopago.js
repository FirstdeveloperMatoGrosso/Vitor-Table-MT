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
    // Verificar se está em desenvolvimento local
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocal) {
      // Modo desenvolvimento: usar mock ou API direta (com CORS desabilitado)
      console.warn('🔧 Modo desenvolvimento: Gerando PIX mock');
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        qrCode: '00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substring(7),
        qrCodeBase64: null,
        qrCodeUrl: 'https://via.placeholder.com/300x300.png?text=QR+Code+PIX+Mock',
        transactionId: 'DEV-' + Date.now(),
        status: 'pending',
        expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
        amount: parseFloat(amount),
        isMock: true
      };
    } else {
      // Produção: usar serverless function
      const apiUrl = window.location.origin + '/api/generate-pix';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description,
          customerEmail: customerEmail
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao gerar PIX:', errorData);
        throw new Error(errorData.message || 'Erro ao gerar QR Code PIX');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Falha ao gerar PIX');
      }
      
      return {
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
        qrCodeUrl: data.qrCodeUrl,
        transactionId: data.transactionId,
        status: data.status,
        expirationDate: data.expirationDate,
        amount: data.amount,
        isMock: false
      };
    }
  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    return null;
  }
};

// Função para verificar status do pagamento
export const checkPaymentStatus = async (transactionId) => {
  try {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocal) {
      // Modo desenvolvimento: simular aprovação
      console.warn('🔧 Modo desenvolvimento: Simulando status aprovado');
      
      if (transactionId.startsWith('DEV-')) {
        return {
          status: 'approved',
          statusDetail: 'accredited',
          amount: 50.00,
          dateApproved: new Date().toISOString()
        };
      }
    }
    
    const apiUrl = window.location.origin + `/api/check-payment?transactionId=${transactionId}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Erro ao verificar pagamento');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Falha ao verificar pagamento');
    }
    
    return {
      status: data.status,
      statusDetail: data.statusDetail,
      amount: data.amount,
      dateApproved: data.dateApproved
    };
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    return null;
  }
};

// Função para cancelar pagamento
export const cancelPayment = async (transactionId) => {
  try {

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
