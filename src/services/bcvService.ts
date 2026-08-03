/**
 * Service to fetch official Central Bank of Venezuela (BCV) exchange rate.
 * Primary source: https://pydolarve.org/api/v1/dollar?page=bcv
 * Backup source: https://ve.dolarapi.com/v1/dolares/oficial
 */

export interface BcvRateResponse {
  rate: number;
  lastUpdated: string;
  isFallback: boolean;
  source: string;
}

// Default fallback rate in case APIs are unreachable or offline
const FALLBACK_BCV_RATE = 68.50;

export async function fetchBcvRate(): Promise<BcvRateResponse> {
  // Try Primary API (PyDolarVe)
  try {
    const response = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      // PyDolarVe response format can have monitors.bcv.price or array of monitors
      let price: number | null = null;
      let lastUpdated = new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

      if (data?.monitors?.bcv?.price) {
        price = parseFloat(data.monitors.bcv.price);
        if (data.monitors.bcv.last_update) {
          lastUpdated = data.monitors.bcv.last_update;
        }
      } else if (Array.isArray(data)) {
        const bcvItem = data.find((m: { title?: string; key?: string }) => 
          m.title?.toLowerCase().includes('bcv') || m.key === 'bcv'
        );
        if (bcvItem?.price) price = parseFloat(bcvItem.price);
      }

      if (price && !isNaN(price) && price > 0) {
        return {
          rate: price,
          lastUpdated,
          isFallback: false,
          source: 'BCV Oficial (PyDolarVe)',
        };
      }
    }
  } catch (error) {
    console.warn('PyDolarVe API fetch failed, trying fallback API...', error);
  }

  // Try Backup API (DolarApi VE)
  try {
    const backupResponse = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
    if (backupResponse.ok) {
      const backupData = await backupResponse.json();
      if (backupData?.promedio) {
        const price = parseFloat(backupData.promedio);
        if (!isNaN(price) && price > 0) {
          return {
            rate: price,
            lastUpdated: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
            isFallback: false,
            source: 'BCV Oficial (DolarApi)',
          };
        }
      }
    }
  } catch (error) {
    console.warn('DolarApi fetch failed, using internal fallback rate', error);
  }

  // Fallback to internal static rate
  return {
    rate: FALLBACK_BCV_RATE,
    lastUpdated: new Date().toLocaleDateString('es-VE') + ' (Referencial)',
    isFallback: true,
    source: 'Tasa Referencial BCV',
  };
}

/**
 * Calculates price in Bolívares (Bs.) given a price in USD and current BCV rate
 */
export function calculateBs(amountInUsd: number, bcvRate: number): number {
  return Math.round(amountInUsd * bcvRate * 100) / 100;
}

/**
 * Formats a number as Venezuelan Bolívares (e.g. 1.712,50 Bs.)
 */
export function formatBs(amountInUsd: number, bcvRate: number): string {
  const bsAmount = calculateBs(amountInUsd, bcvRate);
  const formatted = bsAmount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} Bs.`;
}

/**
 * Formats USD currency (e.g. $25.00)
 */
export function formatUSD(amountInUsd: number): string {
  return `$${amountInUsd.toFixed(2)}`;
}
