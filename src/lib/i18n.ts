/**
 * 다국어 지원 시스템
 * 
 * 한국어와 영어를 지원합니다.
 */

export type SupportedLanguage = 'ko' | 'en';

interface Translations {
  // 공통
  common: {
    ok: string;
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    save: string;
    loading: string;
    retry: string;
    back: string;
    close: string;
    add: string;
    search: string;
    settings: string;
    yes: string;
    no: string;
    error: string;
    showAll: string;
    newest: string;
    oldest: string;
  };
  
  locale: string;
  
  // 탭
  tabs: {
    diary: string;
    schedule: string;
    routine: string;
    addressBook: string;
    search: string;
  };
  
  // 일기
  diary: {
    title: string;
    create: string;
    edit: string;
    detail: string;
    noEntries: string;
    enterTitle: string;
    enterContent: string;
    mood: string;
    favorite: string;
    removeFavorite: string;
    export: string;
    deleteConfirm: string;
    deleteSuccess: string;
    loading: string;
    stats: string;
    bookmarks: string;
    noSearchResults: string;
    searchSuggestion: string;
    showAll: string;
    writeFirst: string;
    howWasToday: string;
    startWriting: string;
    writingTips: string;
    consistentRecord: string;
    writeDaily: string;
    vividMemories: string;
    recordWithMedia: string;
    invalidId: string;
    loadFailed: string;
    deleteFailed: string;
    shareText: string;
    favoriteAdded: string;
    favoriteRemoved: string;
    todayMood: string;
    voiceMemo: string;
  };
  
  // 일정
  schedule: {
    title: string;
    create: string;
    edit: string;
    detail: string;
    location: string;
    companion: string;
    completed: string;
    pending: string;
    days: string[];
    todaySchedule: string;
    count: string;
    total: string;
    great: string;
    loading: string;
    incomplete: string;
    complete: string;
    noSchedules: string;
    addNewSchedule: string;
    addSchedule: string;
    toggleFailed: string;
    toggleError: string;
  };
  
  // 루틴
  routine: {
    title: string;
    create: string;
    edit: string;
    detail: string;
    daily: string;
    weekly: string;
    monthly: string;
    loading: string;
  };
  
  // 주소록
  addressBook: {
    title: string;
    contacts: string;
    myInfo: string;
    name: string;
    phoneNumber: string;
    memo: string;
    noContacts: string;
    searchPlaceholder: string;
  };
  
  // 설정
  settings: {
    title: string;
    account: string;
    profile: string;
    personalInfo: string;
    preferences: string;
    darkMode: string;
    enabled: string;
    disabled: string;
    language: string;
    korean: string;
    english: string;
    notifications: string;
    data: string;
    dataExport: string;
    dataBackup: string;
    support: string;
    privacy: string;
    appInfo: string;
    danger: string;
    deleteAllData: string;
    deleteAllDataSubtitle: string;
    deleteAllDataConfirm: string;
    dataExportConfirm: string;
    dataExportPending: string;
    finalConfirm: string;
    deleteAllDataFinal: string;
    deleteAllDataSuccess: string;
    deleteAllDataError: string;
    notificationsPending: string;
    notificationSubtitle: string;
  };
  
  // 스타일
  style: {
    title: string;
    font: string;
    fontSize: string;
    textColor: string;
    textAlign: string;
    backgroundColor: string;
    preview: string;
    left: string;
    center: string;
    right: string;
    default: string;
  };
  
  // 랜딩페이지
  landing: {
    welcome: string;
    subtitle: string;
    writeDiary: string;
    viewSchedule: string;
    findItems: string;
    viewRoutine: string;
    viewContacts: string;
  };
}

const ko: Translations = {
  common: {
    ok: '확인',
    cancel: '취소',
    confirm: '확인',
    delete: '삭제',
    edit: '편집',
    save: '저장',
    loading: '로딩 중...',
    retry: '다시 시도',
    back: '뒤로',
    close: '닫기',
    add: '추가',
    search: '검색',
    settings: '설정',
    yes: '예',
    no: '아니오',
    error: '오류',
    showAll: '전체보기',
    newest: '최신순',
    oldest: '오래된순',
  },
  
  locale: 'ko-KR',
  
  tabs: {
    diary: '일기',
    schedule: '일정',
    routine: '루틴',
    addressBook: '주소록',
    search: '검색',
  },
  
  diary: {
    title: '일기',
    create: '일기 작성하기',
    edit: '일기 수정하기',
    detail: '일기 상세',
    noEntries: '아직 일기가 없습니다',
    enterTitle: '제목을 입력해주세요',
    enterContent: '내용을 입력해주세요',
    mood: '기분',
    favorite: '즐겨찾기',
    removeFavorite: '즐겨찾기 해제',
    export: '내보내기',
    deleteConfirm: '정말로 이 일기를 삭제하시겠습니까?',
    deleteSuccess: '일기가 삭제되었습니다',
    loading: '일기를 불러오는 중...',
    stats: '통계',
    bookmarks: '북마크',
    noSearchResults: '검색 결과가 없습니다',
    searchSuggestion: '다른 검색어로 시도해보시거나\n필터를 조정해보세요',
    showAll: '전체 일기 보기',
    writeFirst: '첫 번째 일기를 작성해보세요',
    howWasToday: '오늘 하루는 어떠셨나요?\n소중한 순간들을 기록해보세요',
    startWriting: '일기 작성하기',
    writingTips: '일기 작성 팁',
    consistentRecord: '꾸준한 기록',
    writeDaily: '매일 조금씩\n작성해보세요',
    vividMemories: '생생한 추억',
    recordWithMedia: '사진과 영상으로\n기록하세요',
    invalidId: '잘못된 일기 ID입니다.',
    loadFailed: '일기 정보를 불러오는 데 실패했습니다.',
    deleteFailed: '일기 삭제에 실패했습니다.',
    shareText: '일기 내용을 공유합니다.',
    favoriteAdded: '즐겨찾기에 추가되었습니다.',
    favoriteRemoved: '즐겨찾기에서 제거되었습니다.',
    todayMood: '오늘의 기분',
    voiceMemo: '음성 메모가 있습니다',
  },
  
  schedule: {
    title: '일정',
    create: '일정 작성하기',
    edit: '일정 수정하기',
    detail: '일정 상세',
    location: '장소',
    companion: '동행',
    completed: '완료됨',
    pending: '대기 중',
    days: ['일', '월', '화', '수', '목', '금', '토'],
    todaySchedule: '오늘 일정',
    count: '개 중',
    total: '총',
    great: '개를 완료했어요!',
    loading: '일정을 불러오는 중...',
    incomplete: '미완료',
    complete: '완료',
    noSchedules: '등록된 일정이 없습니다',
    addNewSchedule: '새로운 일정을 추가해보세요!',
    addSchedule: '일정 추가',
    toggleFailed: '일정 상태 변경에 실패했습니다.',
    toggleError: '일정 상태 변경 중 문제가 발생했습니다.',
  },
  
  routine: {
    title: '루틴',
    create: '루틴 작성하기',
    edit: '루틴 수정하기',
    detail: '루틴 상세',
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
    loading: '루틴을 불러오는 중...',
  },
  
  addressBook: {
    title: '주소록',
    contacts: '연락처',
    myInfo: '내 정보',
    name: '이름',
    phoneNumber: '전화번호',
    memo: '메모',
    noContacts: '아직 연락처가 없습니다',
    searchPlaceholder: '연락처 검색...',
  },
  
  settings: {
    title: '설정',
    account: '계정',
    profile: '프로필',
    personalInfo: '개인 정보 관리',
    preferences: '환경설정',
    darkMode: '다크 모드',
    enabled: '사용 중',
    disabled: '사용 안함',
    language: '언어',
    korean: '한국어',
    english: 'English',
    notifications: '알림',
    data: '데이터',
    dataExport: '데이터 내보내기',
    dataBackup: '백업 파일 생성',
    support: '지원',
    privacy: '개인정보 처리방침',
    appInfo: '앱 정보',
    danger: '위험',
    deleteAllData: '모든 데이터 삭제',
    deleteAllDataSubtitle: '앱의 모든 데이터가 영구적으로 삭제됩니다',
    deleteAllDataConfirm: '모든 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?',
    dataExportConfirm: '모든 데이터를 백업 파일로 내보내시겠습니까?',
    dataExportPending: '데이터 내보내기 기능이 준비 중입니다.',
    finalConfirm: '최종 확인',
    deleteAllDataFinal: '정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    deleteAllDataSuccess: '모든 데이터가 삭제되었습니다.',
    deleteAllDataError: '데이터 초기화 중 문제가 발생했습니다.',
    notificationsPending: '알림 설정 기능이 준비 중입니다.',
    notificationSubtitle: '푸시 알림 설정',
  },
  
  style: {
    title: '스타일 설정',
    font: '폰트',
    fontSize: '글자 크기',
    textColor: '텍스트 색상',
    textAlign: '텍스트 정렬',
    backgroundColor: '배경색',
    preview: '미리보기',
    left: '왼쪽',
    center: '가운데',
    right: '오른쪽',
    default: '기본',
  },
  
  landing: {
    welcome: 'MIND MATE에 오신 것을 환영합니다',
    subtitle: '마음을 돌보는 스마트한 동반자',
    writeDiary: '일기 쓰기',
    viewSchedule: '일정 보기',
    findItems: '물건 찾기',
    viewRoutine: '루틴 보기',
    viewContacts: '연락처 보기',
  },
};

const en: Translations = {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    loading: 'Loading...',
    retry: 'Retry',
    back: 'Back',
    close: 'Close',
    add: 'Add',
    search: 'Search',
    settings: 'Settings',
    yes: 'Yes',
    no: 'No',
    error: 'Error',
    showAll: 'Show All',
    newest: 'Newest',
    oldest: 'Oldest',
  },
  
  locale: 'en-US',
  
  tabs: {
    diary: 'Diary',
    schedule: 'Schedule',
    routine: 'Routine',
    addressBook: 'Contacts',
    search: 'Search',
  },
  
  diary: {
    title: 'Diary',
    create: 'Create Diary',
    edit: 'Edit Diary',
    detail: 'Diary Detail',
    noEntries: 'No diary entries yet',
    enterTitle: 'Enter title',
    enterContent: 'Enter content',
    mood: 'Mood',
    favorite: 'Favorite',
    removeFavorite: 'Remove from favorites',
    export: 'Export',
    deleteConfirm: 'Are you sure you want to delete this diary?',
    deleteSuccess: 'Diary has been deleted',
    loading: 'Loading diaries...',
    stats: 'Statistics',
    bookmarks: 'Bookmarks',
    noSearchResults: 'No search results found',
    searchSuggestion: 'Try a different search term or\nadjust your filters',
    showAll: 'Show All Diaries',
    writeFirst: 'Write your first diary entry',
    howWasToday: 'How was your day today?\nRecord your precious moments',
    startWriting: 'Start Writing',
    writingTips: 'Writing Tips',
    consistentRecord: 'Consistent Record',
    writeDaily: 'Write a little\nevery day',
    vividMemories: 'Vivid Memories',
    recordWithMedia: 'Record with\nphotos and videos',
    invalidId: 'Invalid diary ID.',
    loadFailed: 'Failed to load diary information.',
    deleteFailed: 'Failed to delete diary.',
    shareText: 'Sharing diary content.',
    favoriteAdded: 'Added to favorites.',
    favoriteRemoved: 'Removed from favorites.',
    todayMood: "Today's mood",
    voiceMemo: 'Voice memo available',
  },
  
  schedule: {
    title: 'Schedule',
    create: 'Create Schedule',
    edit: 'Edit Schedule',
    detail: 'Schedule Detail',
    location: 'Location',
    companion: 'Companion',
    completed: 'Completed',
    pending: 'Pending',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    todaySchedule: "Today's Schedule",
    count: ' of ',
    total: 'Total ',
    great: ' completed!',
    loading: 'Loading schedules...',
    incomplete: 'Incomplete',
    complete: 'Complete',
    noSchedules: 'No schedules registered',
    addNewSchedule: 'Add a new schedule!',
    addSchedule: 'Add Schedule',
    toggleFailed: 'Failed to change schedule status.',
    toggleError: 'Problem occurred while changing schedule status.',
  },
  
  routine: {
    title: 'Routine',
    create: 'Create Routine',
    edit: 'Edit Routine',
    detail: 'Routine Detail',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    loading: 'Loading routines...',
  },
  
  addressBook: {
    title: 'Address Book',
    contacts: 'Contacts',
    myInfo: 'My Info',
    name: 'Name',
    phoneNumber: 'Phone Number',
    memo: 'Memo',
    noContacts: 'No contacts yet',
    searchPlaceholder: 'Search contacts...',
  },
  
  settings: {
    title: 'Settings',
    account: 'Account',
    profile: 'Profile',
    personalInfo: 'Personal Information',
    preferences: 'Preferences',
    darkMode: 'Dark Mode',
    enabled: 'Enabled',
    disabled: 'Disabled',
    language: 'Language',
    korean: '한국어',
    english: 'English',
    notifications: 'Notifications',
    data: 'Data',
    dataExport: 'Export Data',
    dataBackup: 'Create Backup',
    support: 'Support',
    privacy: 'Privacy Policy',
    appInfo: 'App Info',
    danger: 'Danger',
    deleteAllData: 'Delete All Data',
    deleteAllDataSubtitle: 'All app data will be permanently deleted',
    deleteAllDataConfirm: 'All data will be permanently deleted. Do you want to continue?',
    dataExportConfirm: 'Do you want to export all data as a backup file?',
    dataExportPending: 'Data export feature is under development.',
    finalConfirm: 'Final Confirmation',
    deleteAllDataFinal: 'Are you sure you want to delete all data? This action cannot be undone.',
    deleteAllDataSuccess: 'All data has been deleted.',
    deleteAllDataError: 'An error occurred while clearing data.',
    notificationsPending: 'Notification settings feature is under development.',
    notificationSubtitle: 'Push notification settings',
  },
  
  style: {
    title: 'Style Settings',
    font: 'Font',
    fontSize: 'Font Size',
    textColor: 'Text Color',
    textAlign: 'Text Alignment',
    backgroundColor: 'Background Color',
    preview: 'Preview',
    left: 'Left',
    center: 'Center',
    right: 'Right',
    default: 'Default',
  },
  
  landing: {
    welcome: 'Welcome to MIND MATE',
    subtitle: 'Your Smart Companion for Mental Care',
    writeDiary: 'Write Diary',
    viewSchedule: 'View Schedule',
    findItems: 'Find Items',
    viewRoutine: 'View Routine',
    viewContacts: 'View Contacts',
  },
};

const translations = { ko, en };

export const getTranslations = (language: SupportedLanguage): Translations => {
  return translations[language] || translations.ko;
};