import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, TouchableOpacity, View, Text } from 'react-native';

import { updateContact } from '../services/mutation-contact-data';
import { useI18n } from '../../../hooks/use-i18n';
import { CustomAlertManager } from '../../../components/ui/custom-alert';

import BottomModal from '@/src/components/ui/bottom-modal';

const AddressBookImage = ({
  image = '',
  id,
  setUrl,
}: {
  image?: string | null;
  id?: string;
  setUrl?: (url: string) => void;
}) => {
  const { t } = useI18n();
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        {image ? (
          <Image className="ml-6 h-20 w-20 rounded-full bg-gray" source={{ uri: image }} />
        ) : (
          <View className="bg-gray-300 ml-6 h-20 w-20 items-center justify-center rounded-full">
            <Text className="text-2xl text-white">👤</Text>
          </View>
        )}
      </TouchableOpacity>
      {isModalVisible && (
        <EditAddressBookImageModal
          image={image}
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setUrl={setUrl}
          id={id}
        />
      )}
    </>
  );
};

const EditAddressBookImageModal = ({
  image,
  isModalVisible,
  setIsModalVisible,
  setUrl,
  id,
}: {
  image: string | null;
  isModalVisible: boolean;
  setIsModalVisible: (isModalVisible: boolean) => void;
  id?: string;
  setUrl?: (url: string) => void;
}) => {
  const { t } = useI18n();
  const handleSelectImage = () => {
    CustomAlertManager.alert(
      t.locale.startsWith('en') ? 'Select Image' : '이미지 선택', 
      t.locale.startsWith('en') ? 'How would you like to select an image?' : '이미지를 어떻게 선택하시겠습니까?', 
      [
        { text: t.locale.startsWith('en') ? 'Cancel' : '취소', style: 'cancel' },
        { text: t.locale.startsWith('en') ? 'Gallery' : '갤러리에서 선택', onPress: openGallery },
        { text: t.locale.startsWith('en') ? 'Camera' : '카메라로 촬영', onPress: openCamera },
      ]
    );
  };

  const openGallery = async () => {
    try {
      // 갤러리 접근 권한 요청
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        CustomAlertManager.error(
          t.locale.startsWith('en') ? 'Gallery access permission is required.' : '갤러리 접근 권한이 필요합니다.',
          t.locale.startsWith('en') ? 'Permission Required' : '권한 필요'
        );
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImageUri = result.assets[0].uri;
        handleEditImage(selectedImageUri);
      }
    } catch (error) {
      CustomAlertManager.error(
        t.locale.startsWith('en') ? 'Cannot open gallery.' : '갤러리를 열 수 없습니다.',
        t.locale.startsWith('en') ? 'Error' : '오류'
      );
    }
  };

  const openCamera = async () => {
    try {
      // 카메라 접근 권한 요청
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        CustomAlertManager.error(
          t.locale.startsWith('en') ? 'Camera access permission is required.' : '카메라 접근 권한이 필요합니다.',
          t.locale.startsWith('en') ? 'Permission Required' : '권한 필요'
        );
        return;
      }

      // 카메라로 촬영
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const capturedImageUri = result.assets[0].uri;
        handleEditImage(capturedImageUri);
      }
    } catch (error) {
      CustomAlertManager.error(
        t.locale.startsWith('en') ? 'Cannot open camera.' : '카메라를 열 수 없습니다.',
        t.locale.startsWith('en') ? 'Error' : '오류'
      );
    }
  };

  const handleEditImage = (newImageUri?: string) => {
    const imageToUpdate = newImageUri || image || '';

    if (setUrl) {
      setUrl(imageToUpdate);
    }
    if (id && id !== '0') {
      updateContact(id, { profile_image: imageToUpdate });
    }

    setIsModalVisible(false);
  };

  return (
    <BottomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
      <View className="w-full items-center px-5 py-8">
        {/* 이미지가 있을 때만 표시 */}
        {image && (
          <Image
            source={{ uri: image }}
            className="bg-gray-100 mb-5 h-64 w-64 rounded-xl"
            resizeMode="cover"
          />
        )}

        {/* 이미지가 없을 때 플레이스홀더 */}
        {!image && (
          <View className="bg-gray-100 mb-5 h-64 w-64 items-center justify-center rounded-xl">
            <Text className="text-gray-500 text-base">이미지 없음</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSelectImage}
          className="mb-3 w-4/5 rounded-lg bg-blue-500 px-6 py-3"
        >
          <Text className="text-center text-base font-semibold text-white">이미지 변경</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsModalVisible(false)}
          className="bg-gray-500 w-4/5 rounded-lg px-6 py-3"
        >
          <Text className="text-center text-base font-semibold text-white">취소</Text>
        </TouchableOpacity>
      </View>
    </BottomModal>
  );
};

export default AddressBookImage;
