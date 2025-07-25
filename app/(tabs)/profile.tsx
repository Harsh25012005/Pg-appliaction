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
  ActivityIndicator,
  RefreshControl,
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
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Home,
  Bed,
  AlertCircle,
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useUser } from "@/store/user-store";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useProfile } from "@/hooks/useProfile";
import { SafeImage } from "@/components/SafeImage";

export default function ProfileScreen() {
  const { user, updateUser, logout } = useUser();
  const { profileData, loading, error, refetch, updateProfile } = useProfile();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: profileData?.name || "",
    phone: profileData?.phone || "",
    address: profileData?.address || "",
    emergency_contact: profileData?.emergency_contact || "",
  });
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Update editedUser when profile data changes
  useEffect(() => {
    if (profileData && !isEditing) {
      setEditedUser({
        name: profileData.name || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        emergency_contact: profileData.emergency_contact || "",
      });
    }
  }, [profileData, isEditing]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset to original values when canceling edit
      setEditedUser({
        name: profileData?.name || "",
        phone: profileData?.phone || "",
        address: profileData?.address || "",
        emergency_contact: profileData?.emergency_contact || "",
      });
    } else {
      // Initialize with current values when starting edit
      setEditedUser({
        name: profileData?.name || "",
        phone: profileData?.phone || "",
        address: profileData?.address || "",
        emergency_contact: profileData?.emergency_contact || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    // Reset to original values and exit edit mode
    setEditedUser({
      name: profileData?.name || "",
      phone: profileData?.phone || "",
      address: profileData?.address || "",
      emergency_contact: profileData?.emergency_contact || "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedUser.name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    try {
      await updateProfile({
        name: editedUser.name,
        phone: editedUser.phone,
        address: editedUser.address,
        emergency_contact: editedUser.emergency_contact,
      });
      
      // Also update the user store for consistency
      await updateUser({
        name: editedUser.name,
      });
      
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  };

  const handleImagePicker = async () => {
    try {
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
        base64: false, // Disable base64 to avoid memory issues
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validate the asset
        if (!asset.uri || asset.uri.trim() === '') {
          Alert.alert("Error", "Invalid image selected");
          return;
        }

        // Check file size (limit to 5MB)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert("Error", "Image size too large. Please select an image under 5MB.");
          return;
        }

        try {
          await updateProfile({ avatar: asset.uri });
          await updateUser({ profilePic: asset.uri });
          Alert.alert("Success", "Profile picture updated successfully");
        } catch (error: any) {
          Alert.alert("Error", error.message || "Failed to update profile picture");
        }
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to open image picker");
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
          <SafeImage
            uri={profileData?.avatar}
            style={styles.profileImage}
            fallbackStyle={styles.profileImagePlaceholder}
            fallbackIcon={<User size={40} color={colors.text.primary} />}
          />
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
                value={editedUser.phone}
                onChangeText={(text) =>
                  setEditedUser((prev) => ({ ...prev, phone: text }))
                }
                placeholder="Phone Number"
                placeholderTextColor={colors.text.muted}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.editInput}
                value={editedUser.address}
                onChangeText={(text) =>
                  setEditedUser((prev) => ({ ...prev, address: text }))
                }
                placeholder="Address"
                placeholderTextColor={colors.text.muted}
                multiline
              />
              <TextInput
                style={styles.editInput}
                value={editedUser.emergency_contact}
                onChangeText={(text) =>
                  setEditedUser((prev) => ({ ...prev, emergency_contact: text }))
                }
                placeholder="Emergency Contact"
                placeholderTextColor={colors.text.muted}
                keyboardType="phone-pad"
              />
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{profileData?.name || "N/A"}</Text>
              <View style={styles.userDetails}>
                <View style={styles.detailRow}>
                  <Home size={14} color={colors.text.muted} />
                  <Text style={styles.userRoom}>Room {profileData?.room_id || "N/A"}</Text>
                  {profileData?.bed_no && (
                    <>
                      <Bed size={14} color={colors.text.muted} />
                      <Text style={styles.userRoom}>Bed {profileData.bed_no}</Text>
                    </>
                  )}
                </View>
                {profileData?.pg_name && (
                  <Text style={styles.pgName}>{profileData.pg_name}</Text>
                )}
              </View>
              <Text style={styles.joinDate}>
                Member since{" "}
                {profileData?.join_date
                  ? new Date(profileData.join_date).toLocaleDateString("en-IN", {
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

  if (loading && !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color={colors.status.error} />
        <Text style={styles.errorText}>Failed to load profile</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <Button title="Retry" onPress={refetch} style={styles.retryButton} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.content}>
        <ProfileHeader />

        <SettingsSection title="Personal Information">
          <SettingsItem
            icon={<Mail size={20} color={colors.accent.primary} />}
            title="Email"
            subtitle={profileData?.email || "Not provided"}
            showChevron={false}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Phone size={20} color={colors.status.success} />}
            title="Phone"
            subtitle={profileData?.phone || "Not provided"}
            showChevron={false}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<MapPin size={20} color={colors.status.warning} />}
            title="Address"
            subtitle={profileData?.address || "Not provided"}
            showChevron={false}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Phone size={20} color={colors.status.error} />}
            title="Emergency Contact"
            subtitle={profileData?.emergency_contact || "Not provided"}
            showChevron={false}
          />
        </SettingsSection>

        <SettingsSection title="Accommodation Details">
          <SettingsItem
            icon={<Home size={20} color={colors.accent.secondary} />}
            title="Room Number"
            subtitle={`Room ${profileData?.room_id || "N/A"}`}
            showChevron={false}
          />
          {profileData?.bed_no && (
            <>
              <View style={styles.divider} />
              <SettingsItem
                icon={<Bed size={20} color={colors.status.info} />}
                title="Bed Number"
                subtitle={`Bed ${profileData.bed_no}`}
                showChevron={false}
              />
            </>
          )}
          <View style={styles.divider} />
          <SettingsItem
            icon={<Calendar size={20} color={colors.text.muted} />}
            title="Join Date"
            subtitle={
              profileData?.join_date
                ? new Date(profileData.join_date).toLocaleDateString("en-IN")
                : "Not available"
            }
            showChevron={false}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<CreditCard size={20} color={colors.status.success} />}
            title="Monthly Rent"
            subtitle={profileData?.rent ? `₹${profileData.rent.toLocaleString()}` : "Not set"}
            showChevron={false}
          />
          {profileData?.deposit && (
            <>
              <View style={styles.divider} />
              <SettingsItem
                icon={<CreditCard size={20} color={colors.accent.primary} />}
                title="Security Deposit"
                subtitle={`₹${profileData.deposit.toLocaleString()}`}
                showChevron={false}
              />
            </>
          )}
        </SettingsSection>

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
  userDetails: {
    alignItems: "center",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  userRoom: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  pgName: {
    fontSize: 14,
    color: colors.text.muted,
    fontStyle: "italic",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.status.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
});
