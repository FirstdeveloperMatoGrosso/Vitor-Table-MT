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
      // Modo desenvolvimento: tentar API direta (precisa de credenciais configuradas)
      console.warn('🔧 Modo desenvolvimento: Tentando gerar PIX real');
      
      // Verificar se tem credenciais configuradas
      if (!MERCADO_PAGO_CONFIG.ACCESS_TOKEN || MERCADO_PAGO_CONFIG.ACCESS_TOKEN.includes('YOUR_ACCESS_TOKEN')) {
        console.error('❌ Credenciais do Mercado Pago não configuradas!');
        console.log('📝 Configure no arquivo .env.local:');
        console.log('REACT_APP_MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-token-aqui');
        
        // Retornar mock como fallback
        return {
          qrCode: '00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substring(7),
          qrCodeBase64: null,
          qrCodeUrl: 'https://via.placeholder.com/300x300.png?text=Configure+Credenciais',
          transactionId: 'MOCK-' + Date.now(),
          status: 'pending',
          expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          amount: parseFloat(amount),
          isMock: true,
          error: 'Credenciais não configuradas'
        };
      }

      // Tentar chamada direta à API (pode dar CORS, mas vamos tentar)
      try {
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
              version: '1.0.0',
              environment: 'development'
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erro Mercado Pago:', errorData);
          throw new Error(errorData.message || 'Erro ao gerar QR Code PIX');
        }

        const data = await response.json();
        console.log('✅ PIX real gerado no desenvolvimento!', data.id);
        
        return {
          qrCode: data.point_of_interaction?.transaction_data?.qr_code,
          qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
          qrCodeUrl: data.point_of_interaction?.transaction_data?.ticket_url,
          transactionId: data.id,
          status: data.status,
          expirationDate: data.date_of_expiration,
          amount: data.transaction_amount,
          isMock: false
        };
      } catch (corsError) {
        console.warn('⚠️ CORS bloqueou chamada direta. Use um proxy ou extensão CORS.');
        console.log('💡 Sugestão: Instale extensão "CORS Unblock" no navegador para desenvolvimento');
        throw corsError;
      }
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
