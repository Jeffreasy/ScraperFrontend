import { APIError, ErrorCode } from '@/lib/types/api';

export class APIClientError extends Error {
  code: string;
  details?: string;
  requestId?: string;

  constructor(error: APIError, requestId?: string) {
    super(error.message);
    this.name = 'APIClientError';
    this.code = error.code;
    this.details = error.details;
    this.requestId = requestId;
  }
}

export function handleAPIError(error: APIError, requestId?: string): string {
  console.error(`API Error [${requestId}]:`, error);

  switch (error.code as ErrorCode) {
    case ErrorCode.NOT_FOUND:
      return 'De gevraagde resource kon niet worden gevonden.';
    case ErrorCode.DATABASE_ERROR:
      return 'Er is een serverfout opgetreden. Probeer het later opnieuw.';
    case ErrorCode.INVALID_DATE:
      return 'De opgegeven datum is ongeldig.';
    case ErrorCode.INVALID_SOURCE:
      return 'De opgegeven nieuwsbron is onbekend.';
    case ErrorCode.MISSING_QUERY:
      return 'Voer een zoekterm in.';
    case ErrorCode.SEARCH_ERROR:
      return 'Er is een fout opgetreden tijdens het zoeken.';
    case ErrorCode.SCRAPING_FAILED:
      return 'Het ophalen van nieuws is mislukt.';
    case ErrorCode.INVALID_REQUEST:
      return 'Het verzoek is ongeldig.';
    case ErrorCode.INVALID_ID:
      return 'Het opgegeven ID is ongeldig.';
    default:
      return error.message || 'Er is een onbekende fout opgetreden.';
  }
}

export function isRateLimited(remaining: number): boolean {
  return remaining === 0;
}

export function getRateLimitMessage(reset: number): string {
  const minutes = Math.ceil(reset / 60);
  return `Je hebt de limiet bereikt. Probeer het over ${minutes} ${minutes === 1 ? 'minuut' : 'minuten'} opnieuw.`;
}