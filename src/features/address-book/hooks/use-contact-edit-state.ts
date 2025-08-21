import { useCallback, useEffect, useState } from 'react';

import { AddressBookService } from '../services';
import { ContactType } from '../types/address-book-type';

import { useAsyncDataGet } from '@/src/hooks/use-async-data-get';

export const useContactEditState = (id: string) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [memo, setMemo] = useState('');
  const [image, setImage] = useState('');
  const getContactByIdCallback = useCallback(async () => {
    if (id === 'new') return null;
    const contact = await AddressBookService.fetchGetContact(parseInt(id, 10));
    return contact;
  }, [id]);
  const { data, refetch } = useAsyncDataGet<ContactType | null>(getContactByIdCallback, false);
  
  // 데이터가 변경될 때만 상태 업데이트 (무한 루프 방지)
  const [initialized, setInitialized] = useState(false);
  
  // id가 변경되면 초기화 상태 리셋
  useEffect(() => {
    setInitialized(false);
  }, [id]);
  
  useEffect(() => {
    if (data && !initialized) {
      setName(data.name || '');
      setPhoneNumber(data.phone_number || '');
      setMemo(data.memo || '');
      setImage(data.profile_image || '');
      setInitialized(true);
    }
  }, [data, initialized]);
  return {
    name,
    phoneNumber,
    memo,
    setName,
    setPhoneNumber,
    setMemo,
    data,
    id,
    refetch,
    image,
    setImage,
  };
};
