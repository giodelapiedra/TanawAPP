export type HighlightCategory = 'NEWS' | 'EVENT' | 'ANNOUNCEMENT';

export interface CityHighlight {
  id: string;
  title: string;
  /** Optional: when present, renders a colored pill badge on the card. */
  category?: HighlightCategory;
  /** Human-readable date (absolute "May 20, 2025" or relative "1 day ago"). */
  date: string;
  imageUrl: string;
  /** Optional: when present, tapping the card opens this URL (or falls back to a stub modal). */
  url?: string;
}
