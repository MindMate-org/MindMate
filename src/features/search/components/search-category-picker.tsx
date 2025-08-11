import DropDownPicker, { DropDownPickerProps } from 'react-native-dropdown-picker';

const SearchCategoryPicker = (props: DropDownPickerProps<any>) => {
  return (
    <DropDownPicker
      listMode="MODAL"
      placeholder="카테고리를 선택해 주세요"
      placeholderStyle={{
        color: '#c5c5c5',
        fontSize: 18,
      }}
      style={{
        borderWidth: 0,
        boxShadow: '0px 4px 6px rgba(189, 199, 255, 0.4)',
        borderRadius: 12,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
      }}
      dropDownContainerStyle={{
        borderWidth: 0,
        boxShadow: '0px 4px 6px rgba(189, 199, 255, 0.4)',
        borderRadius: 12,
      }}
      {...props}
    />
  );
};

export default SearchCategoryPicker;
