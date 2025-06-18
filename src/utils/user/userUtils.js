import api from "@/lib/api";

export const resetPassword = async (userCode) => {
    try {
        const response = await api.patch("/api/auth/password/reset", {
            userCode,
        });
        return response.data;
    } catch (error) {
        console.error("비밀번호 재설정 요청 실패:", error);
        throw error;
    }
};

export const seoulDistricts = [
    '종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구',
    '강북구', '도봉구', '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구',
    '구로구', '금천구', '영등포구', '동작구', '관악구', '서초구', '강남구', '송파구', '강동구'
]