
import { KTOPlace } from '../types';

const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

async function ktoFetch(endpoint: string, params: Record<string, string>) {
  const envKey = (process.env.KTO_API_KEY || '').trim();
  const fallbackKey = (process.env.API_KEY || '').trim();
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
        throw new Error("인증 실패: 발급받으신 서비스키가 활성화되지 않았거나 유효하지 않습니다.");
      }
      throw new Error(`서버 오류: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      if (text.includes("SERVICE_KEY_IS_NOT_REGISTERED_ERROR")) {
        throw new Error("등록되지 않은 서비스키입니다. 공공데이터포털 승인 상태를 확인하세요.");
      }
      throw new Error("API 응답 형식 오류 (인증 문제 가능성)");
    }

    const data = await response.json();
    const resultCode = data.response?.header?.resultCode;

    if (resultCode !== '0000') {
      const resultMsg = data.response?.header?.resultMsg || '알 수 없는 에러';
      throw new Error(`KTO API 에러: ${resultMsg}`);
    }
    
    return data.response.body.items?.item || [];
  } catch (error: any) {
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
    return '상세 정보를 불러오는 중 인증 문제가 발생했습니다.';
  }
}
