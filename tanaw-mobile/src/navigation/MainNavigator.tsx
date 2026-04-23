import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, AppStackParamList } from '../types/navigation.types';
import { COLORS } from '../constants/colors';
import HomeScreen from '../screens/home/HomeScreen';
import ServicesScreen from '../screens/services/ServicesScreen';
import DigitalIDScreen from '../screens/profile/DigitalIDScreen';
import EmergencyScreen from '../screens/emergency/EmergencyScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import WebViewScreen from '../screens/webview/WebViewScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import PostDetailScreen from '../screens/post-detail/PostDetailScreen';
import FollowsScreen from '../screens/follows/FollowsScreen';
import PersonalInformationScreen from '../screens/profile/PersonalInformationScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<AppStackParamList>();

function DigitalIdTabButton({ onPress, accessibilityState }: BottomTabBarButtonProps) {
  const focused = accessibilityState?.selected ?? false;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.idButtonWrap}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Digital ID"
    >
      <View style={styles.idCircle}>
        <Ionicons name="card" size={26} color={COLORS.WHITE} />
      </View>
      <Text style={[styles.idLabel, focused && styles.idLabelActive]}>Digital ID</Text>
    </TouchableOpacity>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.GRAY_500,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DigitalID"
        component={DigitalIDScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => <DigitalIdTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'warning' : 'warning-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="WebView" component={WebViewScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="Follows" component={FollowsScreen} />
      <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
    elevation: 16,
    boxShadow: '0px -4px 12px rgba(0, 0, 0, 0.06)',
  },
  tabItem: { paddingTop: 2 },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  idButtonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  idCircle: {
    position: 'absolute',
    top: -32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 4,
    borderColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    boxShadow: '0px 4px 10px rgba(200, 16, 46, 0.35)',
  },
  idLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.GRAY_500,
    marginTop: 26,
  },
  idLabelActive: {
    color: COLORS.PRIMARY,
    fontWeight: '700',
  },
});
