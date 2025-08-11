import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, TouchableOpacity, View, Text, Alert } from 'react-native';

import { updateContact } from '../services/mutation-contact-data';

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
  const handleSelectImage = () => {
    Alert.alert('이미지 선택', '이미지를 어떻게 선택하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '갤러리에서 선택', onPress: openGallery },
      { text: '카메라로 촬영', onPress: openCamera },
    ]);
  };

  const openGallery = async () => {
    try {
      // 갤러리 접근 권한 요청
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
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
      console.error('갤러리 열기 오류:', error);
      Alert.alert('오류', '갤러리를 열 수 없습니다.');
    }
  };

  const openCamera = async () => {
    try {
      // 카메라 접근 권한 요청
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
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
      console.error('카메라 열기 오류:', error);
      Alert.alert('오류', '카메라를 열 수 없습니다.');
    }
  };

  const handleEditImage = (newImageUri?: string) => {
    const imageToUpdate = newImageUri || image || '';

    if (setUrl) {
      setUrl(imageToUpdate);
    }
    if (id) {
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
