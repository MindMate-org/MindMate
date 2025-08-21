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
    searchPlaceholder: string;
    categories: {
      all: string;
      personal: string;
      mobile: string;
      electronics: string;
      documents: string;
      clothing: string;
      books: string;
      kitchen: string;
      sports: string;
      others: string;
    };
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
    timeGroups: {
      thisWeek: string;
      thisMonth: string;
      lastMonth: string;
      past: string;
    };
    filterByDate: string;
    deletedOn: string;
    autoDeleteNotice: string;
    permanentDelete: string;
    reset: string;
    loadFailed: string;
    deleteFailed: string;
    shareText: string;
    favoriteAdded: string;
    favoriteRemoved: string;
    todayMood: string;
    voiceMemo: string;
    trash: string;
    restore: string;
    thisMonth: string;
    lastMonth: string;
    // Stats page
    totalDiaries: string;
    consecutiveDays: string;
    withMedia: string;
    moodStats: string;
    recentSixMonths: string;
    insights: string;
    mostFrequentMood: string;
    mediaInclusionRate: string;
    thisMonthWritten: string;
    consecutiveWriting: string;
    noEntriesYet: string;
    writeFirstEntry: string;
    // Search modal
    searchDiary: string;
    keywordSearch: string;
    searchTitleContent: string;
    dateRange: string;
    startDate: string;
    endDate: string;
    moodFilter: string;
    all: string;
    mediaFilter: string;
    mediaIncluded: string;
    noMedia: string;
    resetFilters: string;
    searchAction: string;
    // Favorites page
    bookmarkEmpty: string;
    addBookmarkHint: string;
    loadingBookmarks: string;
    preciousDiariesCount: string;
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
    scheduleDetail: string;
    loadingSchedule: string;
    cannotFind: string;
    invalidId: string;
    loadFailed: string;
    deleteConfirm: string;
    deleteSuccess: string;
    deleteFailed: string;
    completedStatus: string;
    pendingStatus: string;
    attachedMedia: string;
    noContent: string;
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
    routineDetail: string;
    loadingRoutine: string;
    cannotFind: string;
    invalidId: string;
    loadFailed: string;
    routineListFailed: string;
    deleteConfirm: string;
    deleteSuccess: string;
    deleteFailed: string;
    subTasks: string;
    repeatCycle: string;
    alarmTime: string;
    deadline: string;
    noAlarm: string;
    tasks: string;
    noRoutines: string;
    addNewRoutine: string;
    completed: string;
    goBack: string;
    processing: string;
    save: string;
    cancel: string;
    routineName: string;
    description: string;
    addSubTask: string;
    photoAdd: string;
    repeat: string;
    alarm: string;
    period: string;
    enterRoutineName: string;
    enterDescription: string;
    addNewSubTask: string;
    modify: string;
    register: string;
    routineNameRequired: string;
    subTaskRequired: string;
    routineCreated: string;
    routineUpdated: string;
    subTaskInput: string;
    repeatSetting: string;
    confirm: string;
    repeatCycles: {
      none: string;
      daily: string;
      weekly: string;
      monthly: string;
      interval: string;
      weekdays: {
        mon: string;
        tue: string;
        wed: string;
        thu: string;
        fri: string;
        sat: string;
        sun: string;
      };
      weekOrders: {
        first: string;
        second: string;
        third: string;
        fourth: string;
        last: string;
      };
    };
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
    edit: string;
    add: string;
    addFirstContact: string;
    addMyInfo: string;
    addMyInfoDesc: string;
    noSearchResults: string;
    tryDifferentSearch: string;
    editContact: string;
    addContactGroup: string;
  };

  // 검색 (물건)
  search: {
    title: string;
    itemDetail: string;
    modify: string;
    deleteItem: string;
    loadingText: string;
    loadFailed: string;
    deleteFailed: string;
    deleteConfirm: string;
    deleteSuccess: string;
    noItemsYet: string;
    registerFirstItem: string;
    registerItem: string;
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
    searchPlaceholder: '검색어를 입력해주세요',
    categories: {
      all: '전체',
      personal: '개인용품',
      mobile: '모바일',
      electronics: '전자제품',
      documents: '서류/문서',
      clothing: '의류',
      books: '책/문구',
      kitchen: '주방용품',
      sports: '운동/레저',
      others: '기타',
    },
  },

  locale: 'ko-KR',

  tabs: {
    diary: '일기',
    schedule: '일정',
    routine: '루틴',
    addressBook: '주소록',
    search: '물건',
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
    timeGroups: {
      thisWeek: '이번 주',
      thisMonth: '이번 달',
      lastMonth: '지난 달',
      past: '과거',
    },
    filterByDate: '날짜 선택',
    deletedOn: '삭제일',
    autoDeleteNotice: '삭제된 일기는 30일 후 자동으로 영구 삭제됩니다',
    permanentDelete: '영구삭제',
    reset: '초기화',
    loadFailed: '일기 정보를 불러오는 데 실패했습니다.',
    deleteFailed: '일기 삭제에 실패했습니다.',
    shareText: '일기 내용을 공유합니다.',
    favoriteAdded: '즐겨찾기에 추가되었습니다.',
    favoriteRemoved: '즐겨찾기에서 제거되었습니다.',
    todayMood: '오늘의 기분',
    voiceMemo: '음성 메모가 있습니다',
    trash: '휴지통',
    restore: '복원',
    thisMonth: '이번 달',
    lastMonth: '지난 달',
    // Stats page
    totalDiaries: '총 일기',
    consecutiveDays: '연속 작성일',
    withMedia: '미디어 포함',
    moodStats: '기분별 통계',
    recentSixMonths: '최근 6개월 작성 현황',
    insights: '인사이트',
    mostFrequentMood: '가장 많이 느낀 감정',
    mediaInclusionRate: '미디어 포함률',
    thisMonthWritten: '이번 달 작성',
    consecutiveWriting: '일 연속 작성 중!',
    noEntriesYet: '아직 작성된 일기가 없습니다. 첫 번째 일기를 작성해보세요!',
    writeFirstEntry: '첫 번째 일기를 작성해보세요!',
    // Search modal
    searchDiary: '일기 검색',
    keywordSearch: '키워드 검색',
    searchTitleContent: '제목이나 내용을 검색하세요',
    dateRange: '날짜 범위',
    startDate: '시작일',
    endDate: '종료일',
    moodFilter: '기분별 필터',
    all: '전체',
    mediaFilter: '미디어 포함 여부',
    mediaIncluded: '미디어 있음',
    noMedia: '미디어 없음',
    resetFilters: '초기화',
    searchAction: '검색하기',
    // Favorites page
    bookmarkEmpty: '북마크가 비어있습니다',
    addBookmarkHint: '중요한 일기에 ⭐ 버튼을 눌러 북마크에 추가하세요',
    loadingBookmarks: '북마크를 불러오는 중...',
    preciousDiariesCount: '개의 소중한 일기',
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
    scheduleDetail: '일정 상세',
    loadingSchedule: '일정을 불러오는 중...',
    cannotFind: '일정을 찾을 수 없습니다.',
    invalidId: '잘못된 일정 ID입니다.',
    loadFailed: '일정 정보를 불러오는 데 실패했습니다.',
    deleteConfirm: '정말로 이 일정을 삭제하시겠습니까?',
    deleteSuccess: '일정이 삭제되었습니다.',
    deleteFailed: '일정 삭제에 실패했습니다.',
    completedStatus: '✓ 완료됨',
    pendingStatus: '⏳ 대기 중',
    attachedMedia: '첨부된 미디어',
    noContent: '내용이 없습니다.',
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
    routineDetail: '루틴 상세',
    loadingRoutine: '루틴을 불러오는 중...',
    cannotFind: '루틴을 찾을 수 없습니다.',
    invalidId: '잘못된 루틴 ID입니다.',
    loadFailed: '루틴 정보를 불러오는 데 실패했습니다.',
    routineListFailed: '루틴 목록을 가져오는데 실패했습니다.',
    deleteConfirm: '정말로 이 루틴을 삭제하시겠습니까?',
    deleteSuccess: '루틴이 삭제되었습니다.',
    deleteFailed: '루틴 삭제에 실패했습니다.',
    subTasks: '하위 작업',
    repeatCycle: '반복 주기',
    alarmTime: '알림 시간',
    deadline: '기한',
    noAlarm: '알림 없음',
    tasks: '개 작업',
    noRoutines: '등록된 루틴이 없습니다',
    addNewRoutine: '+ 버튼을 눌러 새 루틴을 추가해보세요!',
    completed: '완료',
    goBack: '돌아가기',
    processing: '처리 중...',
    save: '저장',
    cancel: '취소',
    routineName: '루틴 이름',
    description: '설명',
    addSubTask: '하위 작업 추가',
    photoAdd: '사진 추가',
    repeat: '반복',
    alarm: '알림',
    period: '기간',
    enterRoutineName: '루틴 이름을 입력해주세요',
    enterDescription: '루틴에 대한 설명을 입력해주세요 (선택사항)',
    addNewSubTask: '+ 새로운 하위 작업 추가',
    modify: '수정하기',
    register: '등록하기',
    routineNameRequired: '루틴 이름을 입력해주세요.',
    subTaskRequired: '최소 하나의 하위 작업을 입력해주세요.',
    routineCreated: '루틴이 생성되었습니다.',
    routineUpdated: '루틴이 수정되었습니다.',
    subTaskInput: '하위 루틴 입력',
    repeatSetting: '반복 설정',
    confirm: '확인',
    repeatCycles: {
      none: '없음',
      daily: '매일',
      weekly: '매주',
      monthly: '매달',
      interval: '일마다',
      weekdays: {
        mon: '월',
        tue: '화',
        wed: '수',
        thu: '목',
        fri: '금',
        sat: '토',
        sun: '일',
      },
      weekOrders: {
        first: '첫째주',
        second: '둘째주',
        third: '셋째주',
        fourth: '넷째주',
        last: '마지막주',
      },
    },
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
    edit: '편집',
    add: '추가',
    addFirstContact: '+ 버튼을 눌러 첫 연락처를 추가해보세요',
    addMyInfo: '내 정보를 추가해보세요',
    addMyInfoDesc: '내 연락처 정보를 등록하면 더 편리하게 사용할 수 있어요',
    noSearchResults: '에 대한 검색 결과가 없습니다.',
    tryDifferentSearch: '다른 검색어를 시도해보세요.',
    editContact: '연락처 편집',
    addContactGroup: '연락처 그룹 추가',
  },

  search: {
    title: '물건',
    itemDetail: '물건 상세',
    modify: '수정하기',
    deleteItem: '삭제',
    loadingText: '로딩중...',
    loadFailed: '검색 데이터를 가져오는 데 실패했습니다.',
    deleteFailed: '검색 데이터를 삭제하는 데 실패했습니다.',
    deleteConfirm: '삭제하시겠습니까?',
    deleteSuccess: '삭제가 완료되었습니다.',
    noItemsYet: '아직 물건이 없어요',
    registerFirstItem: '첫 번째 물건을 등록해보세요',
    registerItem: '물건 등록하기',
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
    searchPlaceholder: 'Please enter search terms',
    categories: {
      all: 'All',
      personal: 'Personal Items',
      mobile: 'Mobile',
      electronics: 'Electronics',
      documents: 'Documents',
      clothing: 'Clothing',
      books: 'Books',
      kitchen: 'Kitchen',
      sports: 'Sports',
      others: 'Others',
    },
  },

  locale: 'en-US',

  tabs: {
    diary: 'Diary',
    schedule: 'Schedule',
    routine: 'Routine',
    addressBook: 'Contacts',
    search: 'Items',
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
    timeGroups: {
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      past: 'Past',
    },
    filterByDate: 'Select Date',
    deletedOn: 'Deleted on',
    autoDeleteNotice: 'Deleted entries will be permanently removed after 30 days',
    permanentDelete: 'Delete Forever',
    reset: 'Reset',
    loadFailed: 'Failed to load diary information.',
    deleteFailed: 'Failed to delete diary.',
    shareText: 'Sharing diary content.',
    favoriteAdded: 'Added to favorites.',
    favoriteRemoved: 'Removed from favorites.',
    todayMood: "Today's mood",
    voiceMemo: 'Voice memo available',
    trash: 'Trash',
    restore: 'Restore',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    // Stats page
    totalDiaries: 'Total Diaries',
    consecutiveDays: 'Consecutive Days',
    withMedia: 'With Media',
    moodStats: 'Mood Statistics',
    recentSixMonths: 'Recent 6 Months Activity',
    insights: 'Insights',
    mostFrequentMood: 'Most frequent emotion',
    mediaInclusionRate: 'Media inclusion rate',
    thisMonthWritten: 'This month written',
    consecutiveWriting: 'consecutive writing streak!',
    noEntriesYet: 'No diary entries yet. Write your first entry!',
    writeFirstEntry: 'Write your first entry!',
    // Search modal
    searchDiary: 'Search Diary',
    keywordSearch: 'Keyword Search',
    searchTitleContent: 'Search title or content',
    dateRange: 'Date Range',
    startDate: 'Start Date',
    endDate: 'End Date',
    moodFilter: 'Mood Filter',
    all: 'All',
    mediaFilter: 'Media Filter',
    mediaIncluded: 'Media Included',
    noMedia: 'No Media',
    resetFilters: 'Reset',
    searchAction: 'Search',
    // Favorites page
    bookmarkEmpty: 'Bookmarks are empty',
    addBookmarkHint: 'Press the ⭐ button on important diary entries to add bookmarks',
    loadingBookmarks: 'Loading bookmarks...',
    preciousDiariesCount: 'precious diary entries',
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
    scheduleDetail: 'Schedule Detail',
    loadingSchedule: 'Loading schedule...',
    cannotFind: 'Schedule not found.',
    invalidId: 'Invalid schedule ID.',
    loadFailed: 'Failed to load schedule information.',
    deleteConfirm: 'Are you sure you want to delete this schedule?',
    deleteSuccess: 'Schedule has been deleted.',
    deleteFailed: 'Failed to delete schedule.',
    completedStatus: '✓ Completed',
    pendingStatus: '⏳ Pending',
    attachedMedia: 'Attached Media',
    noContent: 'No content available.',
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
    routineDetail: 'Routine Detail',
    loadingRoutine: 'Loading routine...',
    cannotFind: 'Routine not found.',
    invalidId: 'Invalid routine ID.',
    loadFailed: 'Failed to load routine information.',
    routineListFailed: 'Failed to fetch routine list.',
    deleteConfirm: 'Are you sure you want to delete this routine?',
    deleteSuccess: 'Routine has been deleted.',
    deleteFailed: 'Failed to delete routine.',
    subTasks: 'Sub Tasks',
    repeatCycle: 'Repeat Cycle',
    alarmTime: 'Alarm Time',
    deadline: 'Deadline',
    noAlarm: 'No alarm',
    tasks: ' tasks',
    noRoutines: 'No routines registered for',
    addNewRoutine: 'Press the + button to add a new routine!',
    completed: 'Completed',
    goBack: 'Go Back',
    processing: 'Processing...',
    save: 'Save',
    cancel: 'Cancel',
    routineName: 'Routine Name',
    description: 'Description',
    addSubTask: 'Add Sub Task',
    photoAdd: 'Add Photo',
    repeat: 'Repeat',
    alarm: 'Alarm',
    period: 'Period',
    enterRoutineName: 'Enter routine name',
    enterDescription: 'Enter routine description (optional)',
    addNewSubTask: '+ Add new sub task',
    modify: 'Edit',
    register: 'Register',
    routineNameRequired: 'Please enter a routine name.',
    subTaskRequired: 'Please enter at least one sub task.',
    routineCreated: 'Routine has been created.',
    routineUpdated: 'Routine has been updated.',
    subTaskInput: 'Enter sub routine',
    repeatSetting: 'Repeat Setting',
    confirm: 'Confirm',
    repeatCycles: {
      none: 'None',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      interval: ' days',
      weekdays: {
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed',
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat',
        sun: 'Sun',
      },
      weekOrders: {
        first: '1st week',
        second: '2nd week',
        third: '3rd week',
        fourth: '4th week',
        last: 'Last week',
      },
    },
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
    edit: 'Edit',
    add: 'Add',
    addFirstContact: 'Press the + button to add your first contact',
    addMyInfo: 'Add your information',
    addMyInfoDesc: 'Register your contact info for more convenience',
    noSearchResults: 'No search results for',
    tryDifferentSearch: 'Try a different search term.',
    editContact: 'Edit Contact',
    addContactGroup: 'Add Contact Group',
  },

  search: {
    title: 'Items',
    itemDetail: 'Item Detail',
    modify: 'Edit',
    deleteItem: 'Delete',
    loadingText: 'Loading...',
    loadFailed: 'Failed to fetch search data.',
    deleteFailed: 'Failed to delete search data.',
    deleteConfirm: 'Are you sure you want to delete?',
    deleteSuccess: 'Deletion completed.',
    noItemsYet: 'No items yet',
    registerFirstItem: 'Register your first item',
    registerItem: 'Register Item',
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
