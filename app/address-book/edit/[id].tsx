import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleCheckBig, ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TouchableOpacity, View, SafeAreaView, ScrollView } from 'react-native';

import ContactDetailGroupSectionList from '../../../src/features/address-book/components/contact-detail-group-section-list';
import EditContactDetailGroupModal from '../../../src/features/address-book/components/edit-contact-detail-group-modal';
import FormEditContact from '../../../src/features/address-book/components/form-edit-contact';

const Edit = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-turquoise">
      {/* 헤더 */}
      <View className="pt-safe flex-row items-center bg-turquoise px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <ArrowLeft size={24} color="#576bcd" />
          <Text className="ml-2 text-lg font-medium text-paleCobalt">연락처 편집</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="pb-safe px-4">
          <FormEditContact id={id} />
          <ContactDetailGroupSectionList id={id} isModalVisible={isModalVisible} />

          <View className="my-6 items-center">
            <AddContactDetailGroupButton onPress={() => setIsModalVisible(true)} />
          </View>
        </View>
      </ScrollView>

      {isModalVisible && (
        <EditContactDetailGroupModal
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          id={id}
          refetch={() => {}}
        />
      )}
    </SafeAreaView>
  );
};

const AddContactDetailGroupButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-center rounded-lg border-2 border-dashed border-paleCobalt bg-white px-6 py-3"
      onPress={onPress}
    >
      <CircleCheckBig size={20} color="#576BCD" />
      <Text className="ml-2 text-sm font-medium text-paleCobalt">연락처 그룹 추가</Text>
    </TouchableOpacity>
  );
};

export default Edit;
