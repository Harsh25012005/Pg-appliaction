import { Tabs } from "expo-router";
import React, { useRef } from "react";
import {
  Home,
  IndianRupee,
  UtensilsCrossed,
  AlertCircle,
  Bell,
  MessageSquare,
  User,
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { FloatingButton } from "@/components/FloatingButton";
import { BottomSheetRef } from "@/components/BottomSheet";
import { AIAssistantBottomSheet } from "@/components/AIChat";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";

export default function TabLayout() {
  const router = useRouter();
  const aiBottomSheetRef = useRef<BottomSheetRef>(null);

  const handleAIButtonPress = () => {
    aiBottomSheetRef.current?.open();
  };

  const handleQuickReplyPress = (action: string) => {
    aiBottomSheetRef.current?.close();

    switch (action) {
      case "NAVIGATE_TO_MEALS":
        router.push("/(tabs)/meals");
        break;
      case "NAVIGATE_TO_COMPLAINTS":
        router.push("/(tabs)/complaints");
        break;
      case "NAVIGATE_TO_RENT":
        router.push("/(tabs)/rent");
        break;
      case "NAVIGATE_TO_ANNOUNCEMENTS":
        router.push("/(tabs)/announcements");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.accent.primary,
          tabBarInactiveTintColor: colors.text.muted,
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
            height: 88,
            paddingBottom: 24,
            paddingTop: 8,
          },
          tabBarBackground: () => (
            <BlurView
              intensity={100}
              style={StyleSheet.absoluteFill}
              tint="dark"
            />
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          headerStyle: {
            backgroundColor: colors.background.primary,
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Home
                size={focused ? 24 : 22}
                color={color}
                fill={focused ? color : "none"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="rent"
          options={{
            title: "Rent",
            tabBarIcon: ({ color, focused }) => (
              <IndianRupee
                size={focused ? 24 : 22}
                color={color}
                fill={focused ? color : "none"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="meals"
          options={{
            title: "Meals",
            tabBarIcon: ({ color, focused }) => (
              <UtensilsCrossed
                size={focused ? 24 : 22}
                color={color}
                fill={focused ? color : "none"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="complaints"
          options={{
            title: "Support",
            tabBarIcon: ({ color, focused }) => (
              <AlertCircle
                size={focused ? 24 : 22}
                color={color}
                fill={focused ? color : "none"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="announcements"
          options={{
            title: "Notices",
            tabBarIcon: ({ color, focused }) => (
              <Bell
                size={focused ? 24 : 22}
                color={color}
                fill={focused ? color : "none"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <User
                size={focused ? 24 : 22}
                color={color}
                fill={focused ? color : "none"}
              />
            ),
          }}
        />
      </Tabs>

      <FloatingButton
        icon={<MessageSquare size={24} color={colors.text.primary} />}
        onPress={handleAIButtonPress}
      />

      <AIAssistantBottomSheet
        ref={aiBottomSheetRef}
        onQuickReplyPress={handleQuickReplyPress}
      />
    </>
  );
}
