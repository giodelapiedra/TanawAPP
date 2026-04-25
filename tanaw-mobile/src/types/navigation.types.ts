import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp, NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  RoleSelect: undefined;
  Register: { role: 'RESIDENT' };
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Services: undefined;
  DigitalID: undefined;
  Emergency: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  WebView: { url: string; title: string };
  Notifications: undefined;
  PostDetail: { postId: string };
  Follows: { initialTab?: 'followers' | 'following' };
  PersonalInformation: undefined;
  UserProfile: { userId: string };
};

export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type AppStackNavigationProp = StackNavigationProp<AppStackParamList>;
export type RegisterRouteProp = RouteProp<AuthStackParamList, 'Register'>;
