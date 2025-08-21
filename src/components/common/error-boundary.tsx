/**
 * 전역 에러 바운더리
 * - 예상치 못한 에러 캐치
 * - 사용자 친화적 에러 화면
 * - 에러 리포팅 (향후 확장 가능)
 */
import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    });

    // 에러 리포팅 서비스로 전송 (예: Sentry, Bugsnag)
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 있으면 사용
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.retry);
      }

      // 기본 에러 화면
      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  retry: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, retry }) => {
  const isDev = __DEV__;

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#f8fafc',
    }}>
      <AlertTriangle size={64} color="#ef4444" />
      
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 16,
        textAlign: 'center',
      }}>
        앱에 문제가 발생했습니다
      </Text>
      
      <Text style={{
        fontSize: 16,
        color: '#6b7280',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 24,
      }}>
        예상치 못한 오류가 발생했습니다.{'\n'}
        잠시 후 다시 시도해주세요.
      </Text>

      <TouchableOpacity
        onPress={retry}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#3b82f6',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
          marginTop: 24,
        }}
      >
        <RefreshCw size={20} color="#ffffff" />
        <Text style={{
          color: '#ffffff',
          fontSize: 16,
          fontWeight: '600',
          marginLeft: 8,
        }}>
          다시 시도
        </Text>
      </TouchableOpacity>

      {/* 개발 환경에서만 에러 상세 정보 표시 */}
      {isDev && error && (
        <ScrollView 
          style={{
            maxHeight: 200,
            width: '100%',
            marginTop: 20,
            backgroundColor: '#1f2937',
            borderRadius: 8,
            padding: 12,
          }}
        >
          <Text style={{
            color: '#ef4444',
            fontSize: 14,
            fontFamily: 'monospace',
          }}>
            {error.toString()}
          </Text>
          {error.stack && (
            <Text style={{
              color: '#9ca3af',
              fontSize: 12,
              fontFamily: 'monospace',
              marginTop: 8,
            }}>
              {error.stack}
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

// 특정 섹션용 에러 바운더리
export const FeatureErrorBoundary: React.FC<{
  children: ReactNode;
  featureName: string;
}> = ({ children, featureName }) => {
  return (
    <ErrorBoundary
      fallback={(error, retry) => (
        <View style={{
          padding: 20,
          alignItems: 'center',
          backgroundColor: '#fef2f2',
          borderRadius: 8,
          margin: 16,
        }}>
          <AlertTriangle size={40} color="#ef4444" />
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#dc2626',
            marginTop: 8,
            textAlign: 'center',
          }}>
            {featureName} 기능에 문제가 발생했습니다
          </Text>
          <TouchableOpacity
            onPress={retry}
            style={{
              backgroundColor: '#dc2626',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
              marginTop: 12,
            }}
          >
            <Text style={{ color: 'white', fontSize: 14 }}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}
      onError={(error) => {
        }}
    >
      {children}
    </ErrorBoundary>
  );
};