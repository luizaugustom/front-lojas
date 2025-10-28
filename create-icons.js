const fs = require('fs');
const path = require('path');

// Função para criar um ícone PNG simples
function createSimpleIcon(size, filename) {
  // Criar um canvas simples usando dados PNG básicos
  // Este é um PNG 1x1 pixel transparente que será redimensionado pelo navegador
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, // IHDR data
    0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
    0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // IDAT data
    0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
  ]);

  fs.writeFileSync(path.join(__dirname, 'public', filename), pngData);
  console.log(`✅ Criado ${filename} (${size}x${size})`);
}

// Criar ícones para PWA
console.log('🎨 Criando ícones para PWA...');

try {
  createSimpleIcon(192, 'icon-192x192.png');
  createSimpleIcon(512, 'icon-512x512.png');
  
  console.log('✅ Ícones criados com sucesso!');
  console.log('📝 Nota: Estes são ícones básicos. Para produção, substitua por ícones personalizados.');
} catch (error) {
  console.error('❌ Erro ao criar ícones:', error);
}




