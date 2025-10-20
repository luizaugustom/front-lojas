import axios from 'axios';
import { toast } from 'react-hot-toast';

export function handleApiError(error: any) {
  console.error('[API Error] Full error:', error);
  
  let message = 'Erro desconhecido';
  
  if (axios.isAxiosError(error)) {
    console.error('[API Error] Response:', error.response);
    console.error('[API Error] Request:', error.request);
    console.error('[API Error] Config:', error.config);
    
    if (error.response) {
      // Erro com resposta do servidor
      const status = error.response.status;
      const data = error.response.data;
      
      console.error('[API Error] Status:', status);
      console.error('[API Error] Data:', data);
      
      if (data?.message) {
        message = data.message;
      } else if (data?.error) {
        message = data.error;
      } else if (data?.errors) {
        // Se for um array de erros de validação
        if (Array.isArray(data.errors)) {
          message = data.errors.map((err: any) => err.message || err).join(', ');
        } else {
          message = JSON.stringify(data.errors);
        }
      } else if (status === 400 && data?.message?.includes('must be a UUID')) {
        // Tratamento específico para erro de UUID
        message = 'Erro: O sistema espera IDs no formato UUID. Entre em contato com o suporte técnico.';
      } else {
        message = `Erro do servidor (${status}): ${error.message}`;
      }
    } else if (error.request) {
      // Erro de rede
      message = 'Erro de conexão com o servidor';
    } else {
      // Erro na configuração da requisição
      message = `Erro na requisição: ${error.message}`;
    }
  } else {
    // Erro não relacionado ao Axios
    message = error.message || 'Erro desconhecido';
  }
  
  console.error('[API Error] Final message:', message);
  toast.error(message);
}
