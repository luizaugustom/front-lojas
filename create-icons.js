const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Função para criar um ícone PNG simples (fallback)
function createSimpleIcon(size, filename) {
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

// Função para criar ícone do logo
const ICON_SCALE = 0.75;
const TRANSPARENT_BG = { r: 255, g: 255, b: 255, alpha: 0 };

async function createIconFromLogo(size, filename) {
  try {
    const logoPath = path.join(__dirname, 'public', 'logo.png');
    const outputPath = path.join(__dirname, 'public', filename);
    
    // Verificar se o logo existe
    if (!fs.existsSync(logoPath)) {
      console.warn(`⚠️  Logo não encontrado em ${logoPath}, criando ícone básico`);
      createSimpleIcon(size, filename);
      return;
    }

    // Carregar e redimensionar o logo usando Sharp
    const resizedLogo = await sharp(logoPath)
      .resize(Math.round(size * ICON_SCALE), Math.round(size * ICON_SCALE), {
        fit: 'contain',
        background: TRANSPARENT_BG
      })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: TRANSPARENT_BG
      }
    })
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Criado ${filename} (${size}x${size}) a partir do logo`);
  } catch (error) {
    console.error(`❌ Erro ao criar ${filename}:`, error.message);
    console.log(`📝 Criando ícone básico como fallback...`);
    createSimpleIcon(size, filename);
  }
}

// Função principal
async function main() {
  console.log('🎨 Criando ícones para PWA a partir do logo.png...\n');

  try {
    await createIconFromLogo(32, 'favicon-32x32.png');
    await createIconFromLogo(64, 'favicon-64x64.png');
    await createIconFromLogo(192, 'icon-192x192.png');
    await createIconFromLogo(512, 'icon-512x512.png');
    
    console.log('\n✅ Ícones criados com sucesso!');
    console.log('📝 Pronto para produção!');
  } catch (error) {
    console.error('❌ Erro ao criar ícones:', error);
    process.exit(1);
  }
}

main();
