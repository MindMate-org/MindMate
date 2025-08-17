import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleCheckBig, ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TouchableOpacity, View, SafeAreaView, ScrollView } from 'react-native';

import { useThemeColors } from '../../../src/components/providers/theme-provider';

import ContactDetailGroupSectionList from '../../../src/features/address-book/components/contact-detail-group-section-list';
import EditContactDetailGroupModal from '../../../src/features/address-book/components/edit-contact-detail-group-modal';
import FormEditContact from '../../../src/features/address-book/components/form-edit-contact';

const Edit = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme: themeColors, isDark } = useThemeColors();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  return (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: isDark ? themeColors.background : '#a7f3d0' 
    }}>
      {/* 헤더 */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? themeColors.background : '#a7f3d0',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <ArrowLeft size={24} color={themeColors.primary} />
          <Text style={{
            marginLeft: 8,
            fontSize: 18,
            fontWeight: '500',
            color: themeColors.primary,
          }}>연락처 편집</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          <FormEditContact id={id} />
          <ContactDetailGroupSectionList id={id} isModalVisible={isModalVisible} />

          <View style={{ marginVertical: 24, alignItems: 'center' }}>
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
  const { theme: themeColors } = useThemeColors();
  
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: themeColors.primary,
        backgroundColor: themeColors.surface,
        paddingHorizontal: 24,
        paddingVertical: 12,
      }}
      onPress={onPress}
    >
      <CircleCheckBig size={20} color={themeColors.primary} />
      <Text style={{
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
        color: themeColors.primary,
      }}>연락처 그룹 추가</Text>
    </TouchableOpacity>
  );
};

export default Edit;
