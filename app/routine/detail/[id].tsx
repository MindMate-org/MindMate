import React from 'react';

import RoutineDetailPage from '../../../src/features/routine/screens/routine-detail-page';

/**
 * 루틴 상세 페이지 라우터
 * @description app router에서 단순히 비즈니스 로직을 features로 위임합니다.
 */
const RoutineDetailRoute: React.FC = () => {
  return <RoutineDetailPage />;
};

export default RoutineDetailRoute;