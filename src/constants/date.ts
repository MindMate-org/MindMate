export const WEEK_DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
export const WEEK_DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const getWeekDays = (locale: string) => {
  return locale.startsWith('en') ? WEEK_DAYS_EN : WEEK_DAYS_KO;
};

export const formatDate = (date: Date, locale: string) => {
  if (locale.startsWith('en')) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } else {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
};

export const formatMonthYear = (date: Date, locale: string) => {
  if (locale.startsWith('en')) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  } else {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  }
};

// Legacy export for backward compatibility
export const WEEK_DAYS = WEEK_DAYS_KO;
