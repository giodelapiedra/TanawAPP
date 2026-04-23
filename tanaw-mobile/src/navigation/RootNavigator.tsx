import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAppSelector, useAppDispatch } from '../store';
import { checkAuthThunk } from '../store/slices/authSlice';
import { COLORS } from '../constants/colors';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isCheckingAuth } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.WHITE} />
        <Text style={styles.loaderText}>TANAW</Text>
      </View>
    );
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: COLORS.WHITE,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 16,
  },
});
