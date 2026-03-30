'use client';

import { useState, useMemo, useEffect } from 'react';

const CURRENCIES = [
  { id: 'VES', name: 'Bolívares', symbol: 'Bs', icon: 'account_balance_wallet', desc: 'Moneda Local' },
  { id: 'BCV', name: 'Dólar BCV', symbol: '$', icon: 'account_balance', desc: 'Tasa Oficial' },
  { id: 'EURO', name: 'Euro BCV', symbol: '€', icon: 'euro', desc: 'Tasa Oficial' },
  { id: 'PARALELO', name: 'Dólar Paralelo', symbol: '$', icon: 'trending_up', desc: 'Mercado No Oficial' },
  { id: 'BINANCE', name: 'Tether (Binance)', symbol: 'USDT', icon: 'currency_exchange', desc: 'Tasa P2P' },
];

export default function CurrencyApp() {
  const [activeTab, setActiveTab] = useState<'PANEL' | 'CASHEA'>('PANEL');
  const [rates, setRates] = useState<Record<string, number>>({
    BCV: 36.25,
    EURO: 39.15,
    PARALELO: 39.50,
    BINANCE: 670,
    VES: 1,
  });

  useEffect(() => {
    async function fetchRates() {
      try {
        const [oficialRes, paraleloRes, euroRes] = await Promise.all([
          fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
          fetch('https://ve.dolarapi.com/v1/dolares/paralelo'),
          fetch('https://ve.dolarapi.com/v1/euros/oficial')
        ]);
        if (oficialRes.ok && paraleloRes.ok && euroRes.ok) {
          const oficial = await oficialRes.json();
          const paralelo = await paraleloRes.json();
          const euro = await euroRes.json();
          setRates(prev => ({
            ...prev,
            BCV: oficial.promedio,
            PARALELO: paralelo.promedio,
            EURO: euro.promedio
          }));
        }
      } catch (error) {
        console.error("Error fetching live rates", error);
      }
    }
    fetchRates();
  }, []);

  return (
    <>
      <header className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-blue-950 dark:text-white font-headline">
            <span className="material-symbols-outlined text-blue-700 dark:text-blue-400">sync_alt</span>
            Monitor Cambiario Vzla
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8">
              <button 
                onClick={() => setActiveTab('PANEL')}
                className={`font-bold transition-colors cursor-pointer outline-none ${activeTab === 'PANEL' ? 'text-blue-900 dark:text-white border-b-2 border-blue-900' : 'text-slate-500 dark:text-slate-400 hover:text-blue-700'}`}
              >
                Panel
              </button>
              <button 
                onClick={() => setActiveTab('CASHEA')}
                className={`font-bold transition-colors cursor-pointer outline-none ${activeTab === 'CASHEA' ? 'text-blue-900 dark:text-white border-b-2 border-blue-900' : 'text-slate-500 dark:text-slate-400 hover:text-blue-700'}`}
              >
                Calculadora Cashea
              </button>
              <button className="text-slate-500 dark:text-slate-400 font-medium hover:text-blue-700 transition-colors cursor-pointer outline-none">Configuración</button>
            </nav>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">notifications</span>
            </div>
          </div>
        </div>
      </header>

      {activeTab === 'PANEL' ? (
        <DashboardView rates={rates} title="Múltiples Tasas Simultáneas" />
      ) : (
        <CasheaView rates={rates} />
      )}

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 md:hidden bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,23,54,0.06)] rounded-t-2xl">
        <button 
          onClick={() => setActiveTab('PANEL')}
          className={`flex flex-col items-center justify-center transition-colors cursor-pointer outline-none ${activeTab === 'PANEL' ? 'text-blue-900 dark:text-blue-100 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-blue-600'}`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-medium mt-1">Panel</span>
        </button>
        <button 
          onClick={() => setActiveTab('CASHEA')}
          className={`flex flex-col items-center justify-center transition-colors cursor-pointer outline-none ${activeTab === 'CASHEA' ? 'text-blue-900 dark:text-blue-100 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-blue-600'}`}
        >
          <span className="material-symbols-outlined">calculate</span>
          <span className="text-[10px] font-medium mt-1">Cashea</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-600 transition-colors cursor-pointer outline-none">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-medium mt-1">Configuración</span>
        </button>
      </nav>
    </>
  );
}

function DashboardView({ title, rates, hideMarketAnalysis = false }: { title: string, rates: Record<string, number>, hideMarketAnalysis?: boolean }) {
  const [activeCurrency, setActiveCurrency] = useState<string>('BCV');
  const [inputValue, setInputValue] = useState<string>('1.00');

  const baseBs = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return 0;
    
    switch (activeCurrency) {
      case 'BCV': return val * rates.BCV;
      case 'EURO': return val * rates.EURO;
      case 'PARALELO': return val * rates.PARALELO;
      case 'BINANCE': return val * rates.BINANCE;
      case 'VES':
      default: return val;
    }
  }, [inputValue, activeCurrency, rates]);

  const getDisplayValue = (currencyId: string) => {
    if (activeCurrency === currencyId) {
      if (!inputValue) return '';
      const parts = inputValue.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
    }
    if (baseBs === 0) return '0,00';
    let targetVal = 0;
    switch (currencyId) {
      case 'BCV': targetVal = baseBs / rates.BCV; break;
      case 'EURO': targetVal = baseBs / rates.EURO; break;
      case 'PARALELO': targetVal = baseBs / rates.PARALELO; break;
      case 'BINANCE': targetVal = baseBs / rates.BINANCE; break;
      case 'VES': targetVal = baseBs; break;
    }
    return targetVal.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleFocus = (currencyId: string) => {
    if (activeCurrency !== currencyId) {
      let currentVal = getDisplayValue(currencyId).replace(/\./g, '').replace(/,/g, '.');
      setActiveCurrency(currencyId);
      setInputValue(currentVal);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 lg:grid lg:grid-cols-12 lg:gap-12 fade-in">
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h1 className="text-5xl font-extrabold text-primary font-headline tracking-tight mb-4">{title}</h1>
            <p className="text-on-surface-variant text-lg max-w-xl">Ingresa un monto en cualquier campo y observa el descarte sincrónico en tiempo real.</p>
          </section>

          <div className="bg-surface-container-lowest p-8 rounded-xl ambient-shadow space-y-4 relative">
            <div className="flex flex-col gap-4">
              {CURRENCIES.map((currency) => (
                <div 
                  key={currency.id}
                  className={`relative flex items-center rounded-xl overflow-hidden transition-all duration-300 border ${
                    activeCurrency === currency.id 
                    ? 'border-primary ring-2 ring-primary/20 bg-surface-container-lowest shadow-sm z-10' 
                    : 'border-transparent bg-surface-container-low hover:bg-surface-container-highest cursor-text'
                  }`}
                  onClick={() => handleFocus(currency.id)}
                >
                  <div className="flex flex-col justify-center px-6 py-4 min-w-[140px] md:min-w-[180px] border-r border-outline-variant/10">
                    <div className="flex items-center gap-2 mb-1 text-primary">
                      <span className="material-symbols-outlined text-lg">{currency.icon}</span>
                      <span className="font-bold text-sm tracking-widest">{currency.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">{currency.desc}</span>
                  </div>
                  
                  <div className="flex-1 relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold pointer-events-none transition-colors ${activeCurrency === currency.id ? 'text-primary' : 'text-on-surface-variant'}`}>{currency.symbol}</span>
                    <input
                      className="w-full h-full bg-transparent border-none py-6 pl-10 pr-6 text-2xl font-bold text-primary outline-none text-right placeholder-on-surface-variant/40"
                      type="text"
                      placeholder="0,00"
                      value={getDisplayValue(currency.id)}
                      onFocus={() => handleFocus(currency.id)}
                      onBlur={() => {
                        const numericVal = parseFloat(inputValue);
                        if (!isNaN(numericVal)) setInputValue(numericVal.toFixed(2));
                      }}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\./g, '').replace(/,/g, '.');
                        val = val.replace(/[^0-9.]/g, '');
                        const parts = val.split('.');
                        if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                        setInputValue(val);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-outline-variant/15 flex flex-col md:flex-row justify-between items-baseline gap-6">
              <div>
                <p className="text-on-surface-variant text-sm font-medium mb-1">Indicador Rápido</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-xl font-bold text-primary/60 font-headline">1 USD =</span>
                   <span className="text-4xl font-extrabold text-primary font-headline">{rates.BCV.toLocaleString('es-VE', {minimumFractionDigits: 2})}</span>
                   <span className="text-xl font-bold text-primary/60 font-headline">Bs</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-on-surface-variant text-xs font-bold tracking-widest uppercase mb-1">Diferencial Cambiario</p>
                <p className="text-error font-bold flex items-center justify-end gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {( (rates.PARALELO - rates.BCV) / rates.BCV * 100).toFixed(1)}% Paralelo vs BCV
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 mt-12 lg:mt-0 space-y-8">
          {!hideMarketAnalysis && (
            <section className="bg-primary text-on-primary p-8 rounded-xl relative overflow-hidden">
              <h3 className="text-lg font-bold font-headline mb-6 relative z-10">Análisis de Mercado</h3>
              <div className="space-y-6 relative z-10">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs text-on-primary/60 font-bold uppercase tracking-widest">Prima P2P Binance</p>
                      <p className="text-3xl font-extrabold font-headline">{( (rates.BINANCE - rates.BCV) / rates.BCV * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="space-y-6">
            <h3 className="text-lg font-bold text-primary font-headline">Tasas</h3>
            <div className="space-y-4">
              {['BCV', 'EURO', 'PARALELO', 'BINANCE'].map(id => (
                <article key={id} className="p-4 bg-surface-container-low rounded-xl flex justify-between items-center border border-outline-variant/10">
                   <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-primary">{id === 'BCV' ? 'account_balance' : id === 'EURO' ? 'euro' : id === 'PARALELO' ? 'trending_up' : 'currency_exchange'}</span>
                     <h4 className="font-bold text-primary text-sm">{id === 'BINANCE' ? 'Binance P2P' : id === 'EURO' ? 'Euro BCV' : id}</h4>
                   </div>
                   <p className="font-bold text-primary">{rates[id].toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </main>
  );
}

function CasheaView({ rates }: { rates: Record<string, number> }) {
  const [costUsd, setCostUsd] = useState<string>('1.00');

  const numericCost = parseFloat(costUsd) || 0;

  const formatBs = (rate: number) => (numericCost * rate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatUsd = (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getDisplayValue = () => {
    if (!costUsd) return '';
    const parts = costUsd.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 lg:grid lg:grid-cols-12 lg:gap-12 fade-in">
      <div className="lg:col-span-8 space-y-12">
        <section>
          <h1 className="text-5xl font-extrabold text-primary font-headline tracking-tight mb-4">Calculadora Cashea</h1>
          <p className="text-on-surface-variant text-lg max-w-xl">Introduce el costo de tu producto en divisas para obtener el monto equivalente en bolívares según las diferentes tasas del mercado.</p>
        </section>

        <div className="bg-surface-container-lowest p-8 rounded-xl ambient-shadow space-y-10">
          <div>
            <label className="block text-sm font-bold text-primary uppercase tracking-widest mb-4">Introduce el costo de tu producto (USD)</label>
            <div className="relative border-b-2 border-primary/20 focus-within:border-primary transition-colors">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-bold text-primary/40">$</span>
              <input 
                type="text"
                className="w-full bg-transparent py-4 pl-10 text-6xl font-black text-primary outline-none"
                value={getDisplayValue()}
                onBlur={() => {
                  const numericVal = parseFloat(costUsd);
                  if (!isNaN(numericVal)) setCostUsd(numericVal.toFixed(2));
                }}
                onChange={(e) => {
                  let val = e.target.value.replace(/\./g, '').replace(/,/g, '.');
                  val = val.replace(/[^0-9.]/g, '');
                  const parts = val.split('.');
                  if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                  setCostUsd(val);
                }}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Equivalente en Bolívares (Bs)</h3>
            
            <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10 flex justify-between items-center group hover:bg-surface-container-high transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tasa Oficial BCV</p>
                  <p className="text-sm font-medium text-on-surface-variant/60">Tasa: {rates.BCV.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-primary font-headline">{formatBs(rates.BCV)} <span className="text-lg">Bs</span></p>
                <p className="text-sm font-bold text-on-surface-variant mt-1">(${formatUsd(numericCost)} USD)</p>
              </div>
            </div>

            <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10 flex justify-between items-center group hover:bg-surface-container-high transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Dólar Paralelo</p>
                  <p className="text-sm font-medium text-on-surface-variant/60">Tasa: {rates.PARALELO.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-primary font-headline">{formatUsd((numericCost * rates.BCV) / rates.PARALELO)} <span className="text-lg">USD</span></p>
                <div className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tight rounded-md">
                  Monto si pagas en efectivo
                </div>
              </div>
            </div>

            <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10 flex justify-between items-center group hover:bg-surface-container-high transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">currency_exchange</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Binance P2P (USDT)</p>
                  <p className="text-sm font-medium text-on-surface-variant/60">Tasa: {rates.BINANCE.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-primary font-headline">{formatUsd((numericCost * rates.BCV) / rates.BINANCE)} <span className="text-lg">USDT</span></p>
                <div className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tight rounded-md">
                  Monto si cambias USDT
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <aside className="lg:col-span-4 mt-12 lg:mt-0 space-y-8">
        <section className="p-8 bg-surface-container-low rounded-xl border border-outline-variant/10">
          <h3 className="text-lg font-bold font-headline mb-4">Información de Tasas</h3>
          <p className="text-sm leading-relaxed opacity-80 mb-6">
            Esta calculadora te permite comparar rápidamente cuánto deberías pagar en bolívares por un producto que tiene un precio fijado en dólares, evaluando las tres principales referencias del mercado venezolano.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Nota Importante</p>
            <p className="text-xs text-on-surface-variant leading-tight">Cashea utiliza estrictamente la tasa del BCV del día para sus consumos y pagos.</p>
          </div>
        </section>
      </aside>
    </main>
  );
}
