
import { KTOPlace } from '../types';

const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

/**
 * KTO API 호출을 위한 페치 함수
 */
async function ktoFetch(endpoint: string, params: Record<string, string>) {
  /**
   * [API 키 설정 안내]
   * 1. 권장: 에디터의 'Secrets' 또는 'Environment Variables' 설정에서 'KTO_API_KEY'를 추가하세요.
   * 2. 임시: 아래 activeKey 변수에 직접 "키값"을 문자열로 넣을 수도 있습니다 (보안 주의).
   */
  const envKey = (process.env.KTO_API_KEY || '').trim();
  
  // 만약 KTO 전용 키가 없다면, 범용 API_KEY 변수에 관광공사 키가 들어있는지 확인합니다.
  const fallbackKey = (process.env.API_KEY || '').trim();
  
  // 최종적으로 사용할 키 선택
  const activeKey = envKey || fallbackKey;

  if (!activeKey) {
    throw new Error(
      "관광공사 서비스키(KTO_API_KEY)가 설정되지 않았습니다.\n" +
      "설정 방법: 에디터 좌측 하단 'Secrets' 메뉴에서 이름은 KTO_API_KEY, 값은 발급받은 키를 입력해주세요."
    );
  }

  // 기본 파라미터 설정
  const queryParams: Record<string, string> = {
    MobileOS: 'ETC',
    MobileApp: 'TourAI',
    _type: 'json',
    ...params
  };

  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  /**
   * 서비스 키 인코딩 처리
   * 이미 % 문자가 포함된 인코딩된 키라면 그대로 쓰고, 아니라면 인코딩합니다.
   */
  const finalKey = activeKey.includes('%') ? activeKey : encodeURIComponent(activeKey);
  const url = `${BASE_URL}/${endpoint}?serviceKey=${finalKey}&${queryString}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("KTO API 인증 실패: 서비스키가 유효하지 않거나 승인 대기 중입니다.");
      }
      throw new Error(`API 서버 응답 오류: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      if (text.includes("SERVICE_KEY_IS_NOT_REGISTERED_ERROR")) {
        throw new Error("등록되지 않은 서비스키입니다. 공공데이터포털 마이페이지에서 승인 상태를 확인하세요.");
      }
      throw new Error("API 응답이 JSON 형식이 아닙니다. 서비스키 인증 문제를 확인해주세요.");
    }

    const data = await response.json();
    const resultCode = data.response?.header?.resultCode;

    if (resultCode !== '0000') {
      const resultMsg = data.response?.header?.resultMsg || '알 수 없는 에러';
      throw new Error(`KTO API 에러: ${resultMsg} (${resultCode})`);
    }
    
    return data.response.body.items?.item || [];
  } catch (error: any) {
    console.error("KTO API Fetch Failure:", error);
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
    return '장소 상세 정보를 불러오는 중 오류가 발생했습니다.';
  }
}
