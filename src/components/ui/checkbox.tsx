import { Check } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

/**
 * 공통 체크박스 컴포넌트
 * @param checked - 체크 여부
 * @param onChange - 체크 상태 변경 함수
 * @param className - 추가적인 스타일 클래스
 * @param size - 체크박스 크기 (px)
 */
type CheckBoxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  size?: number;
};

const CheckBox = ({ checked, onChange, className = '', size = 20 }: CheckBoxProps) => {
  return (
    <TouchableOpacity
      onPress={() => onChange(!checked)}
      className={`items-center justify-center rounded-md ${checked ? 'bg-paleCobalt' : 'border-2 border-gray bg-white'} ${className}`}
      activeOpacity={0.8}
      style={{ width: size, height: size }}
    >
      {checked && <Check size={size - 4} color="#fff" strokeWidth={3} />}
    </TouchableOpacity>
  );
};

export default CheckBox;
