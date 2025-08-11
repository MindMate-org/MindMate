import Button from './button';

type AddButtonProps = {
  onPress?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

/**
 * 추가 버튼 컴포넌트 (통합된 Button 사용)
 * @param onPress - 버튼이 눌렸을 때 실행될 함수
 * @param className - 추가적인 스타일 클래스
 * @param size - 버튼 크기
 * @returns
 */
const AddButton = ({ onPress, className, size = 'md' }: AddButtonProps) => {
  return <Button variant="floating" size={size} onPress={onPress} className={className} />;
};

export default AddButton;
