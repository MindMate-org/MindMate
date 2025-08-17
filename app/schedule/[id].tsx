import React from 'react';

import ScheduleDetailPage from '../../src/features/schedule/screens/schedule-detail-page';

/**
 * 일정 상세 페이지 라우터
 * @description app router에서 단순히 비즈니스 로직을 features로 위임합니다.
 */
const ScheduleDetailRoute: React.FC = () => {
  return <ScheduleDetailPage />;
};

export default ScheduleDetailRoute;
