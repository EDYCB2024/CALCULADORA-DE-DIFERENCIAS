import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TARGET_FILE = path.join(__dirname, '../public/market-data.json');

// Fuentes de monitoreo (Exchange Monitor - Real Time)
const SOURCES = {
  binance: 'https://exchangemonitor.net/venezuela/dolar-binance',
  zelle: 'https://exchangemonitor.net/venezuela/dolar-zelle', // A veces retorna 404, usaremos fallback
  paypal: 'https://exchangemonitor.net/venezuela/dolar-paypal', // A veces retorna 404, usaremos fallback
};

async function scrapeRate(url, label) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    // Extraer precio del OG:Description (Estándar de Exchange Monitor)
    const metaMatch = html.match(/es de ([\d.,]+) VES\/USD/i);
    
    if (metaMatch && metaMatch[1]) {
      const priceStr = metaMatch[1].replace(/\./g, '').replace(',', '.');
      return parseFloat(priceStr);
    }
  } catch (e) {
    console.error(`Error scraping ${label}:`, e.message);
  }
  return null;
}

async function fetchCoinbaseRate() {
  try {
    const response = await fetch('https://api.coinbase.com/v2/prices/PYUSD-VES/spot');
    if (response.ok) {
      const data = await response.json();
      return parseFloat(data.data.amount);
    }
  } catch (e) {
    console.error("Error fetching Coinbase API:", e.message);
  }
  return null;
}

async function syncAllRates() {
  console.log(`[${new Date().toLocaleString()}] Sincronizando tasas de mercado (Binance, Zelle, PayPal)...`);
  
  // Obtener tasas oficiales/paralelas de respaldo vía API (Estable)
  let fallbackParallel = 0;
  try {
    const apiRes = await fetch('https://ve.dolarapi.com/v1/dolares/paralelo');
    if (apiRes.ok) {
      const data = await apiRes.json();
      fallbackParallel = data.promedio;
    }
  } catch (e) { console.error("Error fetching fallback API"); }

  // Intentar scraping y API real
  const [binancePrice, zellePrice, paypalScraped, paypalCoinbase] = await Promise.all([
    scrapeRate(SOURCES.binance, 'Binance'),
    scrapeRate(SOURCES.zelle, 'Zelle'),
    scrapeRate(SOURCES.paypal, 'PayPal (Scraping)'),
    fetchCoinbaseRate()
  ]);

  const marketData = {
    binance: {
      price: binancePrice || (fallbackParallel ? fallbackParallel + 0.5 : 0),
      isReal: !!binancePrice,
      lastUpdate: new Date().toISOString()
    },
    zelle: {
      price: zellePrice || fallbackParallel || 0,
      isReal: !!zellePrice,
      lastUpdate: new Date().toISOString()
    },
    paypal: {
      price: paypalCoinbase || paypalScraped || (fallbackParallel ? fallbackParallel * 0.88 : 0),
      isReal: !!(paypalCoinbase || paypalScraped),
      source: paypalCoinbase ? 'Coinbase API' : (paypalScraped ? 'Exchange Monitor' : 'Calculado'),
      lastUpdate: new Date().toISOString()
    },
    parallel_ref: fallbackParallel
  };

  // Persistir en JSON
  const dir = path.dirname(TARGET_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TARGET_FILE, JSON.stringify(marketData, null, 2));

  console.log("✅ Sincronización completa:");
  console.log(`- Binance: ${marketData.binance.price} ${marketData.binance.isReal ? '(Real)' : '(Estimado)'}`);
  console.log(`- Zelle: ${marketData.zelle.price} ${marketData.zelle.isReal ? '(Real)' : '(Estimado)'}`);
  console.log(`- PayPal: ${marketData.paypal.price} (${marketData.paypal.source})`);
}

// Ejecutar inmediatamente
syncAllRates();

// Re-sincronizar cada 1 hora
setInterval(syncAllRates, 3600000);

console.log("🚀 Sincronizador consolidado activo. Ejecutando consultas cada 1 hora.");
