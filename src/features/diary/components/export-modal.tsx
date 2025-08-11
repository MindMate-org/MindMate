import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { FileText, MessageSquare, X } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';

import { Colors } from '../../../constants/colors';

type ExportModalProps = {
  visible: boolean;
  onClose: () => void;
  diary: {
    title: string | null;
    body: string | null;
    created_at: string | null;
    updated_at: string | null;
    mood?: string | null;
    text_color?: string | null;
    background_color?: string | null;
    font?: string | null;
    font_size?: number | null;
  };
  media?: Array<{
    filePath: string;
    mediaType: string;
  }>;
};

/**
 * 내보내기 모달 컴포넌트
 */
const ExportModal = ({ visible, onClose, diary, media = [] }: ExportModalProps) => {
  /**
   * PDF로 내보내기
   */
  const handlePdfExport = async () => {
    try {
      onClose();

      // 이미지 파일들을 base64로 변환
      const imagePromises = media
        .filter((m) => m.mediaType === 'image')
        .map(async (m) => {
          try {
            const base64 = await FileSystem.readAsStringAsync(m.filePath, {
              encoding: FileSystem.EncodingType.Base64,
            });
            return `data:image/jpeg;base64,${base64}`;
          } catch (error) {
            console.error('이미지 변환 실패:', error);
            return null;
          }
        });

      const imageBase64Array = await Promise.all(imagePromises);
      const validImages = imageBase64Array.filter((img) => img !== null);

      // 시간 포맷팅
      const displayTime = diary.updated_at ?? diary.created_at ?? '';
      const formattedDate = displayTime ? new Date(displayTime).toLocaleString('ko-KR') : '';

      // HTML 템플릿 생성
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${diary.title || '일기'}</title>
          <style>
            body {
              font-family: 'Malgun Gothic', sans-serif;
              padding: 40px;
              line-height: 1.6;
              color: ${diary.text_color || '#000000'};
              background-color: ${diary.background_color || '#FFFFFF'};
            }
            .header {
              border-bottom: 2px solid #87CEEB;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: ${(diary.font_size || 16) + 8}px;
              font-weight: bold;
              margin-bottom: 10px;
              color: ${diary.text_color || '#000000'};
            }
            .date {
              font-size: 14px;
              color: #666;
            }
            .content {
              font-size: ${diary.font_size || 16}px;
              margin-bottom: 30px;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .images {
              margin-top: 20px;
            }
            .image {
              max-width: 100%;
              height: auto;
              margin: 10px 0;
              border-radius: 8px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${diary.title || '제목 없음'}</div>
            <div class="date">${formattedDate}</div>
          </div>
          
          <div class="content">
            ${diary.body || '내용 없음'}
          </div>
          
          ${
            validImages.length > 0
              ? `
            <div class="images">
              ${validImages.map((img) => `<img src="${img}" class="image" alt="일기 이미지" />`).join('')}
            </div>
          `
              : ''
          }
          
          <div class="footer">
            MindMate에서 생성된 일기
          </div>
        </body>
        </html>
      `;

      // PDF 생성
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // 파일명 생성
      const fileName = `${diary.title?.replace(/[^a-zA-Z0-9가-힣]/g, '_') || '일기'}_${new Date().toISOString().split('T')[0]}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;

      // 파일 이동
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      // 공유
      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: '일기 PDF 공유',
      });
    } catch (error) {
      console.error('PDF 내보내기 실패:', error);
      Alert.alert('오류', 'PDF 생성 중 오류가 발생했습니다.');
    }
  };

  /**
   * 텍스트로 공유
   */
  const handleTextShare = async () => {
    try {
      onClose();

      // 간단한 텍스트 형태로 일기 내용 구성
      const displayTime = diary.updated_at ?? diary.created_at ?? '';
      const formattedDate = displayTime ? new Date(displayTime).toLocaleDateString('ko-KR') : '';

      const shareText = `📝 ${diary.title || '일기'}

📅 ${formattedDate}

${diary.body || '내용 없음'}

📱 MindMate에서 작성`;

      // 임시 텍스트 파일 생성
      const fileUri = `${FileSystem.documentDirectory}diary_share.txt`;
      await FileSystem.writeAsStringAsync(fileUri, shareText);

      // 공유
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: '일기 공유',
          mimeType: 'text/plain',
        });
      } else {
        Alert.alert(
          '공유 불가',
          '공유 기능을 사용할 수 없습니다.\n내용을 직접 복사해서 사용하세요.',
          [
            {
              text: '내용 보기',
              onPress: () => Alert.alert('일기 내용', shareText),
            },
            { text: '확인' },
          ],
        );
      }
    } catch (error) {
      console.error('텍스트 공유 실패:', error);
      Alert.alert('오류', '공유 중 오류가 발생했습니다.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            paddingVertical: 24,
            paddingHorizontal: 20,
            minWidth: 280,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          {/* 헤더 */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.paleCobalt }}>
              내보내기
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={Colors.gray} />
            </TouchableOpacity>
          </View>

          {/* 메뉴 옵션들 */}
          <TouchableOpacity
            onPress={handlePdfExport}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 16,
              marginBottom: 8,
              backgroundColor: '#F8F9FA',
              borderRadius: 12,
            }}
          >
            <FileText size={20} color={Colors.paleCobalt} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.paleCobalt }}>
                PDF로 저장
              </Text>
              <Text style={{ fontSize: 12, color: Colors.gray, marginTop: 2 }}>
                일기를 PDF 파일로 저장하여 공유
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTextShare}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 16,
              backgroundColor: '#FEE500',
              borderRadius: 12,
            }}
          >
            <MessageSquare size={20} color="#3C1E1E" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#3C1E1E' }}>
                텍스트로 공유
              </Text>
              <Text style={{ fontSize: 12, color: '#8B4513', marginTop: 2 }}>
                일기 내용을 메신저로 공유
              </Text>
            </View>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ExportModal;
