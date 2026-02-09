
export type CompanionType = '가족' | '커플' | '나홀로' | '친구';

export interface KTOPlace {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  firstimage: string;
  mapx: string;
  mapy: string;
  overview?: string;
}

export interface Recommendation extends KTOPlace {
  aiReason: string;
}

export interface TourState {
  locationInput: string;
  companion: CompanionType;
  isLoading: boolean;
  error: string | null;
  results: Recommendation[];
}
