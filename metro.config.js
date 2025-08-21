const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Alias 설정 추가
config.resolver.alias = {
  '@': path.resolve(__dirname),
  '@src': path.resolve(__dirname, 'src'),
  '@app': path.resolve(__dirname, 'app'),
  '@assets': path.resolve(__dirname, 'assets'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@features': path.resolve(__dirname, 'src/features'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@store': path.resolve(__dirname, 'src/store'),
  '@types': path.resolve(__dirname, 'src/types'),
  '@lib': path.resolve(__dirname, 'src/lib'),
  '@constants': path.resolve(__dirname, 'src/constants'),
  '@config': path.resolve(__dirname, 'src/config'),
};

// 번들 최적화 설정
config.transformer = {
  ...config.transformer,
  // 빌드 시 불필요한 코드 제거를 위한 설정
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_keys: false,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    warnings: false,
  },
};

// 메트로 캐시 최적화 (필요시 활성화)
// config.cacheStores = [
//   new (require('metro-cache/src/stores/FileStore'))({
//     root: path.join(__dirname, 'node_modules/.metro-cache'),
//   }),
// ];

module.exports = withNativeWind(config, { input: './global.css' });
