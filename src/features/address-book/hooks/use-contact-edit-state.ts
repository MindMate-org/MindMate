import { useCallback, useEffect, useState } from 'react';

import { getContactById } from '../services/get-contact-data';
import { ContactType } from '../types/address-book-type';

import { useAsyncDataGet } from '@/src/hooks/use-async-data-get';

export const useContactEditState = (id: string) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [memo, setMemo] = useState('');
  const [image, setImage] = useState('');
  const getContactByIdCallback = useCallback(async () => {
    const contact = await getContactById(id);
    return contact;
  }, [id]);
  const { data, refetch } = useAsyncDataGet<ContactType>(getContactByIdCallback);
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
