import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TARGET_FILE = path.join(__dirname, '../public/binance-rate.json');
const TARGET_URL = 'https://exchangemonitor.net/venezuela/dolar-binance';

async function updateBinanceRate() {
  console.log(`[${new Date().toLocaleString()}] Consultando tasa de Binance en Exchange Monitor...`);
  
  try {
    const response = await fetch(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const html = await response.text();
    
    // Extraer el precio del OG:Description usando Regex
    // Ejemplo: "...es de 651,61 VES/USD."
    const metaMatch = html.match(/es de ([\d.,]+) VES\/USD/i);
    
    if (metaMatch && metaMatch[1]) {
      const priceStr = metaMatch[1].replace(/\./g, '').replace(',', '.');
      const price = parseFloat(priceStr);
      
      const data = {
        price: price,
        source: 'Exchange Monitor (Binance)',
        lastUpdate: new Date().toISOString(),
        url: TARGET_URL
      };
      
      // Asegurar que el directorio existe
      const dir = path.dirname(TARGET_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      fs.writeFileSync(TARGET_FILE, JSON.stringify(data, null, 2));
      console.log(`✅ Tasa actualizada exitosamente: ${price} Bs/$`);
    } else {
      throw new Error("No se pudo encontrar el precio en los metadatos de la página.");
    }
    
  } catch (error) {
    console.error(`❌ Error actualizando la tasa: ${error.message}`);
  }
}

// Ejecutar inmediatamente al iniciar
updateBinanceRate();

// Programar cada 1 hora (3600000ms)
setInterval(updateBinanceRate, 3600000);

console.log("🚀 Script de actualización iniciado. Se ejecutará cada 1 hora.");
console.log("Presiona Ctrl+C para detener.");
