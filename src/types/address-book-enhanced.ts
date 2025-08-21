/**
 * 주소록 관련 개선된 타입 정의
 * - 성능 최적화를 위한 타입들
 * - 태그가 포함된 연락처 타입
 */
import { ContactType, TagType } from '../features/address-book/types/address-book-type';

export interface ContactWithTagsType extends ContactType {
  tags: TagType[];
}

export interface ContactListItemProps {
  contact: ContactWithTagsType;
  onContactUpdate: (contactId: number) => void;
  onContactDelete: (contactId: number) => void;
}

export interface OptimizedAddressBookListProps {
  searchText?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}