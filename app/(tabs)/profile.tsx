import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  Edit3,
  Camera,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Save,
  X,
  Settings,
  Moon,
  Globe,
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useUser } from "@/store/user-store";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
  const { user, updateUser, logout } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || "",
    room: user?.room || "",
  });
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Update editedUser when user data changes
  useEffect(() => {
    if (user && !isEditing) {
      setEditedUser({
        name: user.name || "",
        room: user.room || "",
      });
    }
  }, [user, isEditing]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset to original values when canceling edit
      setEditedUser({
        name: user?.name || "",
        room: user?.room || "",
      });
    } else {
      // Initialize with current values when starting edit
      setEditedUser({
        name: user?.name || "",
        room: user?.room || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    // Reset to original values and exit edit mode
    setEditedUser({
      name: user?.name || "",
      room: user?.room || "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedUser.name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    await updateUser({
      name: editedUser.name,
      room: editedUser.room,
    });
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully");
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera roll permissions to change your profile picture"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateUser({ profilePic: result.assets[0].uri });
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const ProfileHeader = () => (
    <Card variant="gradient" style={styles.headerCard}>
      <LinearGradient
        colors={["rgba(99, 102, 241, 0.1)", "rgba(139, 92, 246, 0.1)"]}
        style={styles.headerGradient}
      >
        <View style={styles.profileImageContainer}>
          {user?.profilePic ? (
            <Image
              source={{ uri: user.profilePic }}
              style={styles.profileImage}
            />
          ) : (
            <LinearGradient
              colors={colors.accent.gradient}
              style={styles.profileImagePlaceholder}
            >
              <User size={40} color={colors.text.primary} />
            </LinearGradient>
          )}
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleImagePicker}
          >
            <Camera size={16} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editedUser.name}
                onChangeText={(text) =>
                  setEditedUser((prev) => ({ ...prev, name: text }))
                }
                placeholder="Full Name"
                placeholderTextColor={colors.text.muted}
              />
              <TextInput
                style={styles.editInput}
                value={editedUser.room}
                onChangeText={(text) =>
                  setEditedUser((prev) => ({ ...prev, room: text }))
                }
                placeholder="Room Number"
                placeholderTextColor={colors.text.muted}
              />
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userRoom}>Room {user?.room}</Text>
              <Text style={styles.joinDate}>
                Member since{" "}
                {user?.joinedOn
                  ? new Date(user.joinedOn).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A"}
              </Text>
            </>
          )}
        </View>

        <View style={styles.headerActions}>
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSave}
              >
                <Save size={20} color={colors.status.success} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCancelEdit}
              >
                <X size={20} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEditToggle}
            >
              <Edit3 size={20} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Card>
  );

  const SettingsSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card variant="glass" style={styles.sectionCard}>
        {children}
      </Card>
    </View>
  );

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    showChevron = true,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsIcon}>{icon}</View>
        <View style={styles.settingsContent}>
          <Text style={styles.settingsTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightElement}
        {showChevron && onPress && (
          <ChevronRight size={16} color={colors.text.muted} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <ProfileHeader />

        <SettingsSection title="Preferences">
          <SettingsItem
            icon={<Bell size={20} color={colors.accent.primary} />}
            title="Notifications"
            subtitle="Manage your notification preferences"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: colors.border.medium,
                  true: colors.accent.primary,
                }}
                thumbColor={colors.text.primary}
              />
            }
            showChevron={false}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Moon size={20} color={colors.accent.secondary} />}
            title="Dark Mode"
            subtitle="Currently enabled"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{
                  false: colors.border.medium,
                  true: colors.accent.secondary,
                }}
                thumbColor={colors.text.primary}
              />
            }
            showChevron={false}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Globe size={20} color={colors.status.info} />}
            title="Language"
            subtitle="English"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Language settings will be available soon"
              )
            }
          />
        </SettingsSection>

        <SettingsSection title="Account & Security">
          <SettingsItem
            icon={<Shield size={20} color={colors.status.success} />}
            title="Privacy & Security"
            subtitle="Manage your account security"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Security settings will be available soon"
              )
            }
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Settings size={20} color={colors.text.muted} />}
            title="Account Settings"
            subtitle="Update your account information"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Account settings will be available soon"
              )
            }
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsItem
            icon={<HelpCircle size={20} color={colors.status.warning} />}
            title="Help & Support"
            subtitle="Get help or contact support"
            onPress={() =>
              Alert.alert("Support", "Contact support at support@hostel.com")
            }
          />
        </SettingsSection>

        <Card variant="glass" style={styles.logoutCard}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={colors.status.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>© 2024 Hostel Management</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  headerCard: {
    marginBottom: 24,
    padding: 0,
  },
  headerGradient: {
    padding: 24,
    borderRadius: 16,
  },
  profileImageContainer: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  userRoom: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: colors.text.muted,
  },
  editContainer: {
    width: "100%",
    gap: 12,
  },
  editInput: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    textAlign: "center",
  },
  headerActions: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
  },
  sectionCard: {
    padding: 0,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.elevated,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: colors.text.muted,
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: 16,
  },
  logoutCard: {
    marginBottom: 24,
    padding: 0,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.status.error,
  },
  footer: {
    alignItems: "center",
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 4,
  },
});
