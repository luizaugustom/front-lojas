/**
 * Sistema de logging para produção
 * Remove logs desnecessários em produção para melhorar performance
 */

const IS_DEV = process.env.NODE_ENV === 'development';
const DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (IS_DEV || DEBUG_ENABLED) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (IS_DEV || DEBUG_ENABLED) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Sempre logar erros, mesmo em produção
    console.error(...args);
  },
  
  debug: (...args: any[]) => {
    if (IS_DEV || DEBUG_ENABLED) {
      console.debug(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (IS_DEV || DEBUG_ENABLED) {
      console.info(...args);
    }
  },
  
  group: (...args: any[]) => {
    if (IS_DEV || DEBUG_ENABLED) {
      console.group(...args);
    }
  },
  
  groupEnd: () => {
    if (IS_DEV || DEBUG_ENABLED) {
      console.groupEnd();
    }
  },
};

export default logger;

