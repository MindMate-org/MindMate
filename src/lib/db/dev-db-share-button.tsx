import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Button } from 'react-native';

const shareDb = async () => {
  try {
    const dbUri = FileSystem.documentDirectory + 'SQLite/MindMateDb.db';
    const copyUri = FileSystem.documentDirectory + 'export_db.db';
    await FileSystem.copyAsync({ from: dbUri, to: copyUri });
    await Sharing.shareAsync(copyUri);
  } catch (err) {
    console.error('데이터베이스 내보내기 실패:', err);
  }
};

export const DevDbShareButton = () => {
  return <Button title="내 DB 내보내기" onPress={shareDb} />;
};

export default DevDbShareButton;
