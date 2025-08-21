/**
 * 애플리케이션 전체에서 사용하는 애니메이션 설정
 * 모든 탭과 페이지에서 일관된 애니메이션 경험 제공
 */

export const ANIMATION_CONFIG = {
  // 페이지 전환 애니메이션
  pageTransition: {
    animation: 'slide_from_right' as const,
    animationDuration: 300,
  },
  
  // 탭 전환 애니메이션 
  tabTransition: {
    animationEnabled: true,
    swipeEnabled: true,
    tabBarScrollEnabled: false,
    sceneAnimationEnabled: true,
    sceneAnimationType: 'shifting' as const,
  },
  
  // 모달 애니메이션
  modal: {
    fade: 'fade' as const,
    slide: 'slide' as const,
    none: 'none' as const,
  },
  
  // 일반적인 애니메이션 지속시간
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  }
} as const;

export default ANIMATION_CONFIG;