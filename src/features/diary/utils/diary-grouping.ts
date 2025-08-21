import { getTranslations, SupportedLanguage } from '../../../lib/i18n';

/**
 * 두 날짜가 같은 주인지 확인
 * @param d1 - 첫 번째 날짜
 * @param d2 - 두 번째 날짜
 * @returns 같은 주이면 true
 */
const isSameWeek = (d1: Date, d2: Date) => {
  const oneJan = new Date(d1.getFullYear(), 0, 1);
  const week1 = Math.ceil(((d1.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
  const week2 = Math.ceil(((d2.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
  return d1.getFullYear() === d2.getFullYear() && week1 === week2;
};

/**
 * 일기를 기간별로 그룹화
 * @param diaries - 일기 목록
 * @param language - 언어 설정
 * @param selectedDate - 선택된 날짜 (필터용)
 * @returns 기간별로 그룹화된 일기 객체
 */
export const groupDiariesByPeriod = (
  diaries: any[], 
  language: SupportedLanguage = 'ko', 
  selectedDate?: Date
) => {
  const t = getTranslations(language);
  
  // 선택된 날짜가 있으면 해당 날짜의 일기만 필터링
  const filteredDiaries = selectedDate 
    ? diaries.filter(item => {
        const itemDate = new Date(item.created_at ?? '');
        return (
          itemDate.getFullYear() === selectedDate.getFullYear() &&
          itemDate.getMonth() === selectedDate.getMonth() &&
          itemDate.getDate() === selectedDate.getDate()
        );
      })
    : diaries;

  return filteredDiaries.reduce((acc: any, item) => {
    const date = new Date(item.created_at ?? '');
    const now = new Date();
    let section = t.diary.timeGroups.past;

    if (isSameWeek(date, now)) {
      section = t.diary.timeGroups.thisWeek;
    } else if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() - 1) {
      section = t.diary.timeGroups.lastMonth;
    } else if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
      section = t.diary.timeGroups.thisMonth;
    } else {
      section = t.diary.timeGroups.past;
    }

    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {});
};
