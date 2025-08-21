import React from 'react';

import DiaryDetailPage from '../../src/features/diary/screens/diary-detail-page';

/**
 * 일기 상세 페이지 라우터
 * @description app router에서 단순히 비즈니스 로직을 features로 위임합니다.
 */
const DiaryDetailRoute: React.FC = () => {
  return <DiaryDetailPage />;
};

export default DiaryDetailRoute;
