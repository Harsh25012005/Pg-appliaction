import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from "react-native";
import { UtensilsCrossed, Clock, Calendar, Star } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Card } from "@/components/Card";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/Button";
import { useMeal } from "@/store/meal-store";
import { Meal, MealFeedback } from "@/types";

export default function MealsScreen() {
  const { meals, cutoffTime, toggleMealOption, submitFeedback } = useMeal();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  const selectedMeal = meals.find((meal) => meal.date === selectedDate);

  // Calculate remaining time until cutoff
  useEffect(() => {
    const calculateRemainingTime = () => {
      if (!selectedMeal) return;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      let cutoffHour = 0;
      let cutoffMinute = 0;
      let mealType = "";

      // Determine which meal's cutoff time to show
      if (currentHour < 9) {
        // Before breakfast cutoff
        [cutoffHour, cutoffMinute] = cutoffTime.breakfast
          .split(":")
          .map(Number);
        mealType = "breakfast";
      } else if (currentHour < 15) {
        // Before lunch cutoff
        [cutoffHour, cutoffMinute] = cutoffTime.lunch.split(":").map(Number);
        mealType = "lunch";
      } else {
        // Before dinner cutoff
        [cutoffHour, cutoffMinute] = cutoffTime.dinner.split(":").map(Number);
        mealType = "dinner";
      }

      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffHour, cutoffMinute, 0, 0);

      // If current time is past the dinner cutoff, show next day's breakfast cutoff
      if (
        currentHour >= 15 &&
        currentHour >= cutoffHour &&
        currentMinute >= cutoffMinute
      ) {
        cutoffDate.setDate(cutoffDate.getDate() + 1);
        [cutoffHour, cutoffMinute] = cutoffTime.breakfast
          .split(":")
          .map(Number);
        cutoffDate.setHours(cutoffHour, cutoffMinute, 0, 0);
        mealType = "tomorrow's breakfast";
      }

      const diffMs = cutoffDate.getTime() - now.getTime();
      if (diffMs <= 0) {
        setRemainingTime("Cutoff time passed");
        return;
      }

      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setRemainingTime(`${diffHrs}h ${diffMins}m left for ${mealType}`);
    };

    calculateRemainingTime();
    const interval = setInterval(calculateRemainingTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [selectedDate, cutoffTime, selectedMeal]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleToggleMeal = (mealType: "breakfast" | "lunch" | "dinner") => {
    if (!selectedMeal) return;
    toggleMealOption(selectedMeal.id, mealType);
  };

  const handleOpenFeedback = (mealType: "breakfast" | "lunch" | "dinner") => {
    const key = `${selectedDate}-${mealType}`;
    setShowFeedback((prev) => ({ ...prev, [key]: !prev[key] }));
    if (!ratings[key]) {
      setRatings((prev) => ({ ...prev, [key]: 0 }));
    }
    if (!comments[key]) {
      setComments((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleSubmitFeedback = (mealType: "breakfast" | "lunch" | "dinner") => {
    if (!selectedMeal) return;

    const key = `${selectedDate}-${mealType}`;
    const rating = ratings[key];
    const comment = comments[key];

    if (rating === 0) return;

    const feedback: MealFeedback = {
      mealId: selectedMeal.id,
      mealType: mealType,
      rating,
      comment,
    };

    submitFeedback(feedback);
    setShowFeedback((prev) => ({ ...prev, [key]: false }));
  };

  const handleRatingChange = (
    mealType: "breakfast" | "lunch" | "dinner",
    rating: number
  ) => {
    const key = `${selectedDate}-${mealType}`;
    setRatings((prev) => ({ ...prev, [key]: rating }));
  };

  const handleCommentChange = (
    mealType: "breakfast" | "lunch" | "dinner",
    comment: string
  ) => {
    const key = `${selectedDate}-${mealType}`;
    setComments((prev) => ({ ...prev, [key]: comment }));
  };

  // Generate week dates for the calendar
  const weekDates = meals.map((meal) => meal.date);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Weekly Calendar */}
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <Calendar size={18} color={colors.accent.primary} />
          <Text style={styles.calendarTitle}>Weekly Meal Plan</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.datesScrollView}
        >
          {weekDates.map((date) => {
            const isSelected = date === selectedDate;
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const dayNumber = dateObj.getDate();
            const isToday =
              new Date().toDateString() === dateObj.toDateString();

            return (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateItem,
                  isSelected && styles.selectedDateItem,
                  isToday && styles.todayDateItem,
                ]}
                onPress={() => handleDateSelect(date)}
              >
                <Text
                  style={[
                    styles.dayName,
                    isSelected && styles.selectedDateText,
                  ]}
                >
                  {dayName}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    isSelected && styles.selectedDateText,
                  ]}
                >
                  {dayNumber}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected Day Meals */}
      {selectedMeal ? (
        <View style={styles.mealsContainer}>
          {/* Breakfast */}
          <Card style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>Breakfast</Text>
              <Switch
                value={selectedMeal.breakfast.opted}
                onValueChange={() => handleToggleMeal("breakfast")}
                trackColor={{
                  false: colors.background.elevated,
                  true: colors.accent.primary,
                }}
                thumbColor={colors.text.primary}
              />
            </View>

            <Text style={styles.mealMenu}>{selectedMeal.breakfast.menu}</Text>

            <View style={styles.mealActions}>
              <Button
                title="Rate Meal"
                onPress={() => handleOpenFeedback("breakfast")}
                variant="outline"
                size="small"
                style={styles.rateButton}
              />
            </View>

            {/* Breakfast Feedback */}
            {showFeedback[`${selectedDate}-breakfast`] && (
              <View style={styles.feedbackSection}>
                <View style={styles.feedbackHeader}>
                  <Star size={18} color={colors.accent.primary} />
                  <Text style={styles.feedbackTitle}>Rate Breakfast</Text>
                </View>

                <StarRating
                  rating={ratings[`${selectedDate}-breakfast`] || 0}
                  onRatingChange={(rating) =>
                    handleRatingChange("breakfast", rating)
                  }
                  style={styles.starRating}
                />

                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment (optional)"
                  placeholderTextColor={colors.text.muted}
                  value={comments[`${selectedDate}-breakfast`] || ""}
                  onChangeText={(comment) =>
                    handleCommentChange("breakfast", comment)
                  }
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.feedbackActions}>
                  <Button
                    title="Cancel"
                    onPress={() => handleOpenFeedback("breakfast")}
                    variant="outline"
                    style={styles.feedbackButton}
                  />
                  <Button
                    title="Submit"
                    onPress={() => handleSubmitFeedback("breakfast")}
                    disabled={(ratings[`${selectedDate}-breakfast`] || 0) === 0}
                    style={styles.feedbackButton}
                  />
                </View>
              </View>
            )}
          </Card>

          {/* Lunch */}
          <Card style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>Lunch</Text>
              <Switch
                value={selectedMeal.lunch.opted}
                onValueChange={() => handleToggleMeal("lunch")}
                trackColor={{
                  false: colors.background.elevated,
                  true: colors.accent.primary,
                }}
                thumbColor={colors.text.primary}
              />
            </View>

            <Text style={styles.mealMenu}>{selectedMeal.lunch.menu}</Text>

            <View style={styles.mealActions}>
              <Button
                title="Rate Meal"
                onPress={() => handleOpenFeedback("lunch")}
                variant="outline"
                size="small"
                style={styles.rateButton}
              />
            </View>

            {/* Lunch Feedback */}
            {showFeedback[`${selectedDate}-lunch`] && (
              <View style={styles.feedbackSection}>
                <View style={styles.feedbackHeader}>
                  <Star size={18} color={colors.accent.primary} />
                  <Text style={styles.feedbackTitle}>Rate Lunch</Text>
                </View>

                <StarRating
                  rating={ratings[`${selectedDate}-lunch`] || 0}
                  onRatingChange={(rating) =>
                    handleRatingChange("lunch", rating)
                  }
                  style={styles.starRating}
                />

                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment (optional)"
                  placeholderTextColor={colors.text.muted}
                  value={comments[`${selectedDate}-lunch`] || ""}
                  onChangeText={(comment) =>
                    handleCommentChange("lunch", comment)
                  }
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.feedbackActions}>
                  <Button
                    title="Cancel"
                    onPress={() => handleOpenFeedback("lunch")}
                    variant="outline"
                    style={styles.feedbackButton}
                  />
                  <Button
                    title="Submit"
                    onPress={() => handleSubmitFeedback("lunch")}
                    disabled={(ratings[`${selectedDate}-lunch`] || 0) === 0}
                    style={styles.feedbackButton}
                  />
                </View>
              </View>
            )}
          </Card>

          {/* Dinner */}
          <Card style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>Dinner</Text>
              <Switch
                value={selectedMeal.dinner.opted}
                onValueChange={() => handleToggleMeal("dinner")}
                trackColor={{
                  false: colors.background.elevated,
                  true: colors.accent.primary,
                }}
                thumbColor={colors.text.primary}
              />
            </View>

            <Text style={styles.mealMenu}>{selectedMeal.dinner.menu}</Text>

            <View style={styles.mealActions}>
              <Button
                title="Rate Meal"
                onPress={() => handleOpenFeedback("dinner")}
                variant="outline"
                size="small"
                style={styles.rateButton}
              />
            </View>

            {/* Dinner Feedback */}
            {showFeedback[`${selectedDate}-dinner`] && (
              <View style={styles.feedbackSection}>
                <View style={styles.feedbackHeader}>
                  <Star size={18} color={colors.accent.primary} />
                  <Text style={styles.feedbackTitle}>Rate Dinner</Text>
                </View>

                <StarRating
                  rating={ratings[`${selectedDate}-dinner`] || 0}
                  onRatingChange={(rating) =>
                    handleRatingChange("dinner", rating)
                  }
                  style={styles.starRating}
                />

                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment (optional)"
                  placeholderTextColor={colors.text.muted}
                  value={comments[`${selectedDate}-dinner`] || ""}
                  onChangeText={(comment) =>
                    handleCommentChange("dinner", comment)
                  }
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.feedbackActions}>
                  <Button
                    title="Cancel"
                    onPress={() => handleOpenFeedback("dinner")}
                    variant="outline"
                    style={styles.feedbackButton}
                  />
                  <Button
                    title="Submit"
                    onPress={() => handleSubmitFeedback("dinner")}
                    disabled={(ratings[`${selectedDate}-dinner`] || 0) === 0}
                    style={styles.feedbackButton}
                  />
                </View>
              </View>
            )}
          </Card>
        </View>
      ) : (
        <View style={styles.noMealContainer}>
          <Text style={styles.noMealText}>
            No meal information available for this date
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: 14,
    paddingBottom: 100, // Extra padding for floating button
  },
  timerCard: {
    backgroundColor: colors.background.card,
    marginBottom: 16,
  },
  timerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timerTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginLeft: 8,
  },
  timerText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.accent.primary,
  },
  calendarContainer: {
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginLeft: 8,
  },
  datesScrollView: {
    flexDirection: "row",
  },
  dateItem: {
    width: 60,
    height: 70,
    borderRadius: 12,
    backgroundColor: colors.background.card,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  selectedDateItem: {
    backgroundColor: colors.accent.primary,
  },
  todayDateItem: {
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  dayName: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  selectedDateText: {
    color: colors.text.primary,
  },
  mealsContainer: {
    gap: 16,
  },
  mealCard: {
    backgroundColor: colors.background.card,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  mealMenu: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  mealActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  rateButton: {
    minWidth: 100,
  },
  noMealContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  noMealText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
  },
  feedbackCard: {
    backgroundColor: colors.background.card,
    marginTop: 16,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginLeft: 8,
  },
  starRating: {
    marginBottom: 16,
    justifyContent: "center",
  },
  commentInput: {
    backgroundColor: colors.background.elevated,
    borderRadius: 8,
    padding: 12,
    color: colors.text.primary,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  feedbackActions: {
    flexDirection: "row",
    gap: 8,
  },
  feedbackButton: {
    flex: 1,
  },
  feedbackSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
