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
  const { data, refetch } = useAsyncDataGet<ContactType | null>(getContactByIdCallback);
  useEffect(() => {
    if (data) {
      setName(data.name);
      setPhoneNumber(data.phone_number);
      setMemo(data.memo);
      setImage(data.profile_image || '');
    }
  }, [data]);
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
