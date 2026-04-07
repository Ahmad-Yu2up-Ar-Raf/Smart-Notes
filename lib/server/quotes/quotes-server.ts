// lib/server/Quotes/Quotes-server.ts
import { Quote, QuotesResponse } from '@/type/quotes-type';

const BASE_URL = 'https://dummyjson.com/quotes';

/**
 * fetchAllQuotes
 */
export async function fetchAllQuotes(): Promise<Quote[]> {
  const url = BASE_URL;
  const res = await fetch(url);
  ``;

  if (!res.ok) {
    throw new Error(`fetchAllQuotes failed: HTTP ${res.status}`);
  }

  const json = (await res.json()) as QuotesResponse | null;
  if (!json || !Array.isArray(json.quotes)) {
    throw new Error('fetchAllQuotes: unexpected response shape');
  }

  return json.quotes;
}

/**
 * Fetch single quotes by ID
 */
export async function fetchQuoteById(id: number): Promise<Quote> {
  const url = `${BASE_URL}/quotes/${id}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch quotes`);
    }

    const data = (await response.json()) as Quote | null;
    if (!data) {
      throw new Error(`Failed to fetch quotes ${id}: Quote not found`);
    }
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch quotes ${id}: ${error.message}`);
    }
    throw new Error(`Failed to fetch quotes ${id}: Unknown error`);
  }
}
