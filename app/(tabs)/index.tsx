import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import {
  IndianRupee,
  UtensilsCrossed,
  AlertCircle,
  ChevronRight,
  Calendar,
  Clock,
  LogOut,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/colors";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useUser } from "@/store/user-store";
import { useRent } from "@/store/rent-store";
import { useMeal } from "@/store/meal-store";
import { useComplaint } from "@/store/complaint-store";

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useUser();
  const { currentRent } = useRent();
  const { getTodayMeal } = useMeal();
  const { pendingComplaints } = useComplaint();

  const todayMeal = getTodayMeal();
  const pendingComplaintsCount = pendingComplaints.length;

  const navigateToRent = () => {
    router.push("/(tabs)/rent");
  };

  const navigateToMeals = () => {
    router.push("/(tabs)/meals");
  };

  const navigateToComplaints = () => {
    router.push("/(tabs)/complaints");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const QuickActionCard = ({ title, subtitle, icon, onPress, color }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.quickActionWrapper}
    >
      <Card variant="glass" style={styles.quickActionCard}>
        <View
          style={[styles.quickActionIcon, { backgroundColor: color + "20" }]}
        >
          {icon}
        </View>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        <ChevronRight
          size={16}
          color={colors.text.muted}
          style={styles.quickActionArrow}
        />
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
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
              <Text style={styles.profileInitial}>
                {user?.name?.charAt(0) || "U"}
              </Text>
            </LinearGradient>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <View style={styles.roomBadge}>
              <Text style={styles.roomText}>Room {user?.room || "N/A"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Rent Status Card */}
      {currentRent && (
        <Card elevated variant="gradient" style={styles.rentCard}>
          <LinearGradient
            colors={["rgba(99, 102, 241, 0.1)", "rgba(139, 92, 246, 0.1)"]}
            style={styles.rentGradient}
          >
            <View style={styles.rentHeader}>
              <View style={styles.rentIconContainer}>
                <IndianRupee size={24} color={colors.accent.primary} />
              </View>
              <View style={styles.rentInfo}>
                <Text style={styles.rentLabel}>Rent Due</Text>
                <Text style={styles.rentAmount}>
                  ₹{currentRent.amount.toLocaleString()}
                </Text>
              </View>
              <View style={styles.rentStatus}>
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>Due Soon</Text>
                </View>
              </View>
            </View>

            <View style={styles.rentDetails}>
              <View style={styles.rentDetailItem}>
                <Calendar size={16} color={colors.text.muted} />
                <Text style={styles.rentDetailText}>
                  Due{" "}
                  {new Date(currentRent.dueDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
            </View>

            <Button
              title="Pay Now"
              onPress={navigateToRent}
              style={styles.payButton}
              size="medium"
            />
          </LinearGradient>
        </Card>
      )}

      {/* Today's Overview */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <Text style={styles.sectionSubtitle}>
          Quick access to your daily needs
        </Text>
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.quickActionsGrid}>
        <QuickActionCard
          title="Today's Meals"
          subtitle={todayMeal ? "3 meals planned" : "No meals"}
          icon={<UtensilsCrossed size={20} color={colors.accent.primary} />}
          onPress={navigateToMeals}
          color={colors.accent.primary}
        />

        <QuickActionCard
          title="Complaints"
          subtitle={
            pendingComplaintsCount > 0
              ? `${pendingComplaintsCount} pending`
              : "All resolved"
          }
          icon={
            <AlertCircle
              size={20}
              color={
                pendingComplaintsCount > 0
                  ? colors.status.warning
                  : colors.status.success
              }
            />
          }
          onPress={navigateToComplaints}
          color={
            pendingComplaintsCount > 0
              ? colors.status.warning
              : colors.status.success
          }
        />
      </View>

      {/* Meal Status Card */}
      {todayMeal && (
        <Card variant="glass" style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <View style={styles.mealIconContainer}>
              <UtensilsCrossed size={20} color={colors.accent.secondary} />
            </View>
            <Text style={styles.mealTitle}>Today's Meal Plan</Text>
          </View>

          <View style={styles.mealGrid}>
            <View style={styles.mealItem}>
              <View style={styles.mealItemHeader}>
                <Text style={styles.mealType}>Breakfast</Text>
                <View
                  style={[
                    styles.mealStatusDot,
                    todayMeal.breakfast.opted
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}
                />
              </View>
              <Text style={styles.mealMenu}>{todayMeal.breakfast.menu}</Text>
            </View>

            <View style={styles.mealItem}>
              <View style={styles.mealItemHeader}>
                <Text style={styles.mealType}>Lunch</Text>
                <View
                  style={[
                    styles.mealStatusDot,
                    todayMeal.lunch.opted
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}
                />
              </View>
              <Text style={styles.mealMenu}>{todayMeal.lunch.menu}</Text>
            </View>

            <View style={styles.mealItem}>
              <View style={styles.mealItemHeader}>
                <Text style={styles.mealType}>Dinner</Text>
                <View
                  style={[
                    styles.mealStatusDot,
                    todayMeal.dinner.opted
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}
                />
              </View>
              <Text style={styles.mealMenu}>{todayMeal.dinner.menu}</Text>
            </View>
          </View>

          <Button
            title="Manage Meals"
            onPress={navigateToMeals}
            variant="outline"
            style={styles.mealButton}
            size="medium"
          />
        </Card>
      )}

      {/* Recent Activity */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
      </View>

      <Card variant="glass" style={styles.activityCard}>
        <View style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <Clock size={16} color={colors.text.muted} />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Rent payment reminder</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </View>
      </Card>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profileImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  profileInfo: {
    marginLeft: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  roomBadge: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  roomText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "500" as const,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    justifyContent: "center",
    alignItems: "center",
  },
  rentCard: {
    marginBottom: 32,
    padding: 0,
  },
  rentGradient: {
    padding: 24,
    borderRadius: 16,
  },
  rentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  rentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  rentLabel: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 4,
  },
  rentAmount: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: colors.text.primary,
  },
  rentStatus: {
    alignItems: "flex-end",
  },
  urgentBadge: {
    backgroundColor: colors.status.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  rentDetails: {
    marginBottom: 20,
  },
  rentDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rentDetailText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  payButton: {
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.muted,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  quickActionWrapper: {
    flex: 1,
  },
  quickActionCard: {
    padding: 16,
    alignItems: "center",
    position: "relative",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 4,
    textAlign: "center",
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: "center",
  },
  quickActionArrow: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  mealCard: {
    marginBottom: 32,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  mealGrid: {
    gap: 16,
    marginBottom: 20,
  },
  mealItem: {
    backgroundColor: colors.background.elevated,
    padding: 16,
    borderRadius: 12,
  },
  mealItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealType: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  mealStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: colors.status.success,
  },
  statusInactive: {
    backgroundColor: colors.status.error,
  },
  mealMenu: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  mealButton: {
    marginTop: 4,
  },
  activityCard: {
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.elevated,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.text.primary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: colors.text.muted,
  },
});
