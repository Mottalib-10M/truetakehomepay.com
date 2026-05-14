export interface CryptoMeta {
  id: string;
  name: string;
  symbol: string;
  slug: string;
  defaultPrice: number;
  color: string;
}

export const CRYPTO_LIST: CryptoMeta[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', slug: 'bitcoin', defaultPrice: 100000, color: '#F7931A' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', slug: 'ethereum', defaultPrice: 3500, color: '#627EEA' },
  { id: 'tether', name: 'Tether', symbol: 'USDT', slug: 'tether', defaultPrice: 1, color: '#26A17B' },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', slug: 'bnb', defaultPrice: 600, color: '#F3BA2F' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', slug: 'solana', defaultPrice: 180, color: '#9945FF' },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', slug: 'xrp', defaultPrice: 2.5, color: '#23292F' },
  { id: 'usd-coin', name: 'USD Coin', symbol: 'USDC', slug: 'usd-coin', defaultPrice: 1, color: '#2775CA' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', slug: 'cardano', defaultPrice: 0.8, color: '#0033AD' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', slug: 'dogecoin', defaultPrice: 0.35, color: '#C2A633' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', slug: 'avalanche', defaultPrice: 40, color: '#E84142' },
];

export function getCryptoBySlug(slug: string): CryptoMeta | undefined {
  return CRYPTO_LIST.find((crypto) => crypto.slug === slug);
}
