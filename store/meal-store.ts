import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { Meal, MealFeedback } from '@/types';

// Helper to generate dates for the week
const generateWeekDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = -1; i < 6; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

// Helper to generate mock meals
const generateMockMeals = (): Meal[] => {
  const weekDates = generateWeekDates();
  const breakfastOptions = ['Poha & Tea', 'Idli & Sambhar', 'Bread & Omelette', 'Upma & Coffee', 'Paratha & Curd', 'Dosa & Chutney', 'Cereal & Milk'];
  const lunchOptions = ['Rice, Dal & Sabzi', 'Roti, Paneer & Salad', 'Biryani & Raita', 'Pulao & Curry', 'Thali (Roti, Rice, Dal, 2 Sabzi)', 'Chole Bhature', 'Rajma Chawal'];
  const dinnerOptions = ['Roti & Mixed Veg', 'Rice, Dal & Sabzi', 'Noodles & Manchurian', 'Pulao & Curry', 'Paratha & Sabzi', 'Khichdi & Papad', 'Roti, Rice & Dal Makhani'];

  return weekDates.map((date, index) => ({
    id: `meal-${date}`,
    date,
    breakfast: {
      menu: breakfastOptions[index],
      opted: index !== 2, // Example: opted out for one day
    },
    lunch: {
      menu: lunchOptions[index],
      opted: true,
    },
    dinner: {
      menu: dinnerOptions[index],
      opted: index !== 4, // Example: opted out for one day
    },
  }));
};

export const [MealProvider, useMeal] = createContextHook(() => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [feedback, setFeedback] = useState<MealFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cutoffTime, setCutoffTime] = useState({
    breakfast: '21:00', // Previous day 9 PM
    lunch: '09:00',     // Same day 9 AM
    dinner: '15:00',    // Same day 3 PM
  });

  useEffect(() => {
    const loadMealData = async () => {
      try {
        const mealsData = await AsyncStorage.getItem('meals');
        const feedbackData = await AsyncStorage.getItem('mealFeedback');
        
        if (mealsData) {
          setMeals(JSON.parse(mealsData));
        } else {
          const mockMeals = generateMockMeals();
          setMeals(mockMeals);
          await AsyncStorage.setItem('meals', JSON.stringify(mockMeals));
        }
        
        if (feedbackData) {
          setFeedback(JSON.parse(feedbackData));
        }
      } catch (error) {
        console.error('Failed to load meal data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMealData();
  }, []);

  const toggleMealOption = async (mealId: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const updatedMeals = meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          [mealType]: {
            ...meal[mealType],
            opted: !meal[mealType].opted,
          }
        };
      }
      return meal;
    });

    setMeals(updatedMeals);
    await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
  };

  const submitFeedback = async (newFeedback: MealFeedback) => {
    const updatedFeedback = [...feedback, newFeedback];
    setFeedback(updatedFeedback);
    await AsyncStorage.setItem('mealFeedback', JSON.stringify(updatedFeedback));
  };

  const getTodayMeal = () => {
    const today = new Date().toISOString().split('T')[0];
    return meals.find(meal => meal.date === today) || null;
  };

  return {
    meals,
    feedback,
    isLoading,
    cutoffTime,
    toggleMealOption,
    submitFeedback,
    getTodayMeal,
  };
});