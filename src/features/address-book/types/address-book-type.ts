// 기본 테이블 타입들
export type ContactType = {
  id: number;
  name: string;
  phone_number: string;
  profile_image: string | null;
  memo: string;
  is_me: 0 | 1;
  created_at: string;
};

export type TagType = {
  id: number;
  name: string;
  color: string;
};

export type ContactTagType = {
  id: number;
  contact_id: number;
  tag_id: number;
};

export type NoteGroupType = {
  group_id: number;
  contact_id: number;
  title: string;
};

export type NoteItemType = {
  item_id: number;
  group_id: number;
  title: string;
  content: string;
};

// 조인된 데이터 타입들 (실제 사용시 유용)
export type ContactWithTagsType = ContactType & {
  tags?: TagType[];
};

export type NoteGroupWithItemsType = NoteGroupType & {
  items?: NoteItemType[];
};

export type ContactWithDetailsType = ContactType & {
  tags?: TagType[];
  noteGroups?: NoteGroupWithItemsType[];
};
