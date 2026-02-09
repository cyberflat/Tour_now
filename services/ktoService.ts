
import { KTOPlace } from '../types';

const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

async function ktoFetch(endpoint: string, params: Record<string, string>) {
  // process 객체 존재 여부 체크 (Vercel 등 환경 대응)
  const env = typeof process !== 'undefined' ? process.env : {};
  const envKey = (env.KTO_API_KEY || '').trim();
  const fallbackKey = (env.API_KEY || '').trim();
  const activeKey = envKey || fallbackKey;

  if (!activeKey) {
    throw new Error(
      "관광공사 서비스키(KTO_API_KEY)가 설정되지 않았습니다. Secrets 설정에서 키를 추가해 주세요."
    );
  }

  const queryParams: Record<string, string> = {
    MobileOS: 'ETC',
    MobileApp: 'TourAI',
    _type: 'json',
    ...params
  };

  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const finalKey = activeKey.includes('%') ? activeKey : encodeURIComponent(activeKey);
  const url = `${BASE_URL}/${endpoint}?serviceKey=${finalKey}&${queryString}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("인증 실패: 서비스키가 유효하지 않습니다.");
      }
      throw new Error(`서버 오류: ${response.status}`);
    }

    const data = await response.json();
    
    // KTO API의 특이한 구조 처리: 데이터가 없을 때 items가 빈 문자열("")로 올 수 있음
    const itemsContainer = data.response?.body?.items;
    if (!itemsContainer || itemsContainer === "") {
      return [];
    }
    
    const items = itemsContainer.item;
    if (!items) return [];

    // 결과가 1개면 객체로, 여러 개면 배열로 오는 특성 대응
    return Array.isArray(items) ? items : [items];
  } catch (error: any) {
    console.error("KTO API Fetch Error:", error);
    throw error;
  }
}

export const getPlacesByLocation = async (lat: number, lng: number): Promise<KTOPlace[]> => {
  return ktoFetch('locationBasedList2', {
    mapX: lng.toString(),
    mapY: lat.toString(),
    radius: '5000',
    listYN: 'Y',
    arrange: 'O',
    numOfRows: '10'
  });
};

export const getPlacesByKeyword = async (keyword: string): Promise<KTOPlace[]> => {
  return ktoFetch('searchKeyword2', {
    keyword,
    listYN: 'Y',
    arrange: 'O',
    numOfRows: '10'
  });
};

export const getPlaceDetail = async (contentId: string): Promise<string> => {
  try {
    const items = await ktoFetch('detailCommon2', {
      contentId,
      overviewYN: 'Y',
      defaultYN: 'Y',
      addrinfoYN: 'Y'
    });
    return items[0]?.overview || '상세 정보가 없습니다.';
  } catch (e) {
    return '상세 정보를 불러오는 중 문제가 발생했습니다.';
  }
}
