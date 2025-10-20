'use client';

import { useBreakpoint, useIsMobile, useIsTablet, useIsDesktop, useIsTouchDevice, usePrefersReducedMotion, usePrefersHighContrast, usePrefersDarkMode } from '@/hooks/useResponsive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ResponsiveTest() {
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isTouchDevice = useIsTouchDevice();
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersHighContrast = usePrefersHighContrast();
  const prefersDarkMode = usePrefersDarkMode();

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Teste de Responsividade e Acessibilidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm sm:text-base">Breakpoint Atual</h3>
              <Badge variant="outline" className="text-xs sm:text-sm">
                {breakpoint}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm sm:text-base">Tipo de Dispositivo</h3>
              <div className="flex flex-wrap gap-1">
                {isMobile && <Badge variant="default" className="text-xs">Mobile</Badge>}
                {isTablet && <Badge variant="default" className="text-xs">Tablet</Badge>}
                {isDesktop && <Badge variant="default" className="text-xs">Desktop</Badge>}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm sm:text-base">Touch Device</h3>
              <Badge variant={isTouchDevice ? "default" : "secondary"} className="text-xs">
                {isTouchDevice ? "Sim" : "Não"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm sm:text-base">Reduced Motion</h3>
              <Badge variant={prefersReducedMotion ? "default" : "secondary"} className="text-xs">
                {prefersReducedMotion ? "Sim" : "Não"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm sm:text-base">High Contrast</h3>
              <Badge variant={prefersHighContrast ? "default" : "secondary"} className="text-xs">
                {prefersHighContrast ? "Sim" : "Não"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm sm:text-base">Dark Mode</h3>
              <Badge variant={prefersDarkMode ? "default" : "secondary"} className="text-xs">
                {prefersDarkMode ? "Sim" : "Não"}
              </Badge>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-sm sm:text-base mb-2">Teste de Responsividade</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div 
                  key={i} 
                  className="h-16 bg-primary/10 rounded-md flex items-center justify-center text-xs sm:text-sm font-medium"
                >
                  Item {i + 1}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-sm sm:text-base mb-2">Teste de Acessibilidade</h3>
            <div className="space-y-2">
              <button 
                className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => alert('Botão clicado!')}
              >
                Botão com Foco
              </button>
              <input 
                type="text" 
                placeholder="Campo de teste" 
                className="w-full px-3 py-2 border rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Campo de teste para acessibilidade"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

