import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';

// Dynamic import — only loaded on native (not web)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RNWebView = Platform.OS !== 'web' ? (require('react-native-webview').default as React.ComponentType<Record<string, unknown>>) : View;

type WebViewRouteParams = {
  WebView: { url: string; title: string };
};

export default function WebViewScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<WebViewRouteParams, 'WebView'>>();
  const { url, title } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color={COLORS.WHITE} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      <View style={styles.actionBtn}>
        {isLoading && Platform.OS !== 'web' && <ActivityIndicator size="small" color={COLORS.WHITE} />}
      </View>
    </View>
  );

  // Web: government sites block iframes — show mobile-only message
  if (Platform.OS === 'web') {
    return (
      <View style={styles.root}>
        <Header />
        <View style={styles.mobileOnly}>
          <View style={styles.mobileOnlyIcon}>
            <Ionicons name="phone-portrait-outline" size={36} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.mobileOnlyTitle}>{title}</Text>
          <Text style={styles.mobileOnlyDesc}>
            This service is available on the TANAW mobile app. Open the app on your phone to access {title}.
          </Text>
          <View style={styles.urlBox}>
            <Ionicons name="link-outline" size={16} color={COLORS.GRAY_500} />
            <Text style={styles.urlText} numberOfLines={1}>{url}</Text>
          </View>
          <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={18} color={COLORS.WHITE} />
            <Text style={styles.goBackBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Native: full WebView — works perfectly, no iframe restrictions
  return (
    <SafeAreaView style={styles.root} >
      <Header />
      {isLoading && <View style={styles.progressBar} />}

      {loadError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.GRAY_300} />
          <Text style={styles.errorTitle}>Cannot load page</Text>
          <Text style={styles.errorDesc}>Check your internet connection and try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setLoadError(false)} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={18} color={COLORS.WHITE} />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <RNWebView
          source={{ uri: url }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setLoadError(true); }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.PRIMARY} />
              <Text style={styles.loadingText}>Loading {title}...</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.WHITE },
  header: { backgroundColor: COLORS.PRIMARY, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, color: COLORS.WHITE, fontSize: 16, fontWeight: '700' },
  actionBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  progressBar: { height: 3, backgroundColor: COLORS.GOLD },
  webview: { flex: 1 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.WHITE },
  loadingText: { color: COLORS.GRAY_500, fontSize: 13, marginTop: 12 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorTitle: { color: COLORS.GRAY_900, fontSize: 18, fontWeight: '700', marginTop: 16 },
  errorDesc: { color: COLORS.GRAY_500, fontSize: 14, textAlign: 'center', lineHeight: 22, marginTop: 8 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: 24, marginTop: 20 },
  retryBtnText: { color: COLORS.WHITE, fontSize: 14, fontWeight: '700' },
  // Mobile-only message (web fallback)
  mobileOnly: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  mobileOnlyIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: COLORS.PRIMARY_LIGHT, justifyContent: 'center', alignItems: 'center' },
  mobileOnlyTitle: { color: COLORS.GRAY_900, fontSize: 20, fontWeight: '700', marginTop: 20 },
  mobileOnlyDesc: { color: COLORS.GRAY_500, fontSize: 14, textAlign: 'center', lineHeight: 22, marginTop: 8, maxWidth: 300 },
  urlBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.GRAY_50, borderRadius: RADIUS.sm, paddingHorizontal: 14, paddingVertical: 10, marginTop: 16 },
  urlText: { color: COLORS.GRAY_500, fontSize: 12 },
  goBackBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: 28, marginTop: 20 },
  goBackBtnText: { color: COLORS.WHITE, fontSize: 14, fontWeight: '700' },
});
