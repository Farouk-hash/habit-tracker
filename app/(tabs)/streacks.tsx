import {
  DATBASE_ID,
  HABIT_COMPLETETION_TABLE_ID,
  HABIT_TABLE_ID,
  tablesDB,
} from "@/libs/appwrite";
import { useAuth } from "@/libs/authContext";
import { useIsFocused } from "@react-navigation/native";
import { MotiText, MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Card } from "react-native-paper";

export default function Streacks() {
  const [completedHabits, setCompletedHabits] = useState<
    { habit_id: string; completed_at: string }[]
  >([]);
  const [habits, setHabits] = useState<
    {
      $id: string;
      title: string;
      description: string;
      frequency: "daily" | "weekly" | "monthly";
    }[]
  >([]);
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isFocused) {
      // Trigger animation every time the tab is focused
      setShouldAnimate(true);
    } else {
      // Reset when tab loses focus (optional)
      setShouldAnimate(false);
    }
  }, [isFocused]);

  useEffect(() => {
    fetchHabits();
    fetchCompletedHabits();
  }, [user]);

  const fetchCompletedHabits = async () => {
    try {
      const response = await tablesDB.listRows(
        DATBASE_ID!,
        HABIT_COMPLETETION_TABLE_ID!,
        [Query.equal("user_id", user?.$id || "")],
      );
      setCompletedHabits(response.rows as []);
    } catch (error) {
      if (error instanceof Error) {
        console.log(
          "ERROR WHILE FETCHING COMPLETED HABITS AT STREAKS: ",
          error.message,
        );
      } else {
        console.log("UNKNOWN ERROR OCCURED");
      }
    }
  };

  const fetchHabits = async () => {
    try {
      const response = await tablesDB.listRows(DATBASE_ID!, HABIT_TABLE_ID!, [
        Query.equal("user_id", user?.$id || ""),
      ]);
      setHabits(response.rows as []);
    } catch (error) {
      console.log(
        "ERROR WHILE FETCHING HABITS AT STREAKS: ",
        (error as Error).message,
      );
    }
  };

  const getStreackData = (
    habitId: string,
    frequency: "daily" | "weekly" | "monthly",
  ) => {
    const habitCompletetion = completedHabits
      .filter((h) => h.habit_id === habitId)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime(),
      );

    if (habitCompletetion.length === 0) {
      return {
        streack: 0,
        bestStreack: 0,
        total: 0,
      };
    }

    // Convert all dates based on frequency
    const getUnitDate = (date: Date) => {
      const newDate = new Date(date);
      switch (frequency) {
        case "daily":
          newDate.setHours(0, 0, 0, 0);
          return newDate;
        case "weekly":
          newDate.setHours(0, 0, 0, 0);
          const day = newDate.getDay();
          newDate.setDate(newDate.getDate() - day);
          return newDate;
        case "monthly":
          return new Date(newDate.getFullYear(), newDate.getMonth(), 1);
        default:
          return newDate;
      }
    };

    const unitDates = habitCompletetion.map((c) =>
      getUnitDate(new Date(c.completed_at)),
    );

    const uniqueDates = Array.from(
      new Set(unitDates.map((d) => d.getTime())),
    ).map((time) => new Date(time));

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const now = new Date();
    const currentUnit = getUnitDate(now);
    const previousUnit = new Date(currentUnit);

    switch (frequency) {
      case "daily":
        previousUnit.setDate(previousUnit.getDate() - 1);
        break;
      case "weekly":
        previousUnit.setDate(previousUnit.getDate() - 7);
        break;
      case "monthly":
        previousUnit.setMonth(previousUnit.getMonth() - 1);
        break;
    }

    const mostRecentDate = uniqueDates[uniqueDates.length - 1];

    if (
      mostRecentDate.getTime() === currentUnit.getTime() ||
      mostRecentDate.getTime() === previousUnit.getTime()
    ) {
      for (let i = uniqueDates.length - 1; i >= 0; i--) {
        if (i === uniqueDates.length - 1) {
          tempStreak = 1;
        } else {
          const currentDate = uniqueDates[i];
          const nextDate = uniqueDates[i + 1];
          let isValidStreak = false;

          const expectedNextDate = new Date(currentDate);
          switch (frequency) {
            case "daily":
              expectedNextDate.setDate(expectedNextDate.getDate() + 1);
              break;
            case "weekly":
              expectedNextDate.setDate(expectedNextDate.getDate() + 7);
              break;
            case "monthly":
              expectedNextDate.setMonth(expectedNextDate.getMonth() + 1);
              break;
          }

          isValidStreak =
            expectedNextDate.getFullYear() === nextDate.getFullYear() &&
            expectedNextDate.getMonth() === nextDate.getMonth() &&
            expectedNextDate.getDate() === nextDate.getDate();

          if (isValidStreak) {
            tempStreak++;
          } else {
            break;
          }
        }
      }
      currentStreak = tempStreak;
    }

    bestStreak = 1;
    tempStreak = 1;

    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = uniqueDates[i];
      const nextDate = uniqueDates[i + 1];

      const expectedNextDate = new Date(currentDate);
      switch (frequency) {
        case "daily":
          expectedNextDate.setDate(expectedNextDate.getDate() + 1);
          break;
        case "weekly":
          expectedNextDate.setDate(expectedNextDate.getDate() + 7);
          break;
        case "monthly":
          expectedNextDate.setMonth(expectedNextDate.getMonth() + 1);
          break;
      }

      const isValidStreak =
        expectedNextDate.getFullYear() === nextDate.getFullYear() &&
        expectedNextDate.getMonth() === nextDate.getMonth() &&
        expectedNextDate.getDate() === nextDate.getDate();

      if (isValidStreak) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    const total = habitCompletetion.length;

    return {
      streack: currentStreak,
      bestStreack: bestStreak,
      total,
    };
  };

  const habitsStreacks = habits.map((habit) => {
    const { total, streack, bestStreack } = getStreackData(
      habit.$id,
      habit.frequency,
    );
    return { habit, total, streack, bestStreack };
  });

  const rankedHabits = habitsStreacks.sort((a, b) => {
    if (b.bestStreack !== a.bestStreack) {
      return b.bestStreack - a.bestStreack;
    }
    if (b.streack !== a.streack) {
      return b.streack - a.streack;
    }
    return b.total - a.total;
  });

  return (
    <View style={styles.container}>
      {/* Top 3 streaks section with staggered animation */}
      {rankedHabits.length > 0 && (
        <View style={styles.topStreaksSection}>
          <View style={styles.sectionTitleContainer}>
            <MotiText
              from={{ opacity: 0, scale: 0.8 }}
              animate={shouldAnimate ? { opacity: 1, scale: 1 } : undefined}
              transition={{ type: "spring", delay: 200 }}
              style={styles.sectionTitle}
            >
              Top Streaks
            </MotiText>
          </View>

          <View style={styles.topStreaksContainer}>
            {/* 1st Place - Gold with bounce animation */}
            {rankedHabits[0] && (
              <MotiView
                from={{ opacity: 0, scale: 0.5, translateY: 50 }}
                animate={
                  shouldAnimate
                    ? { opacity: 1, scale: 1, translateY: 0 }
                    : undefined
                }
                transition={{ type: "spring", delay: 300 }}
                style={[styles.topStreakItem, styles.goldCard]}
              >
                <MotiText
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 400 }}
                  style={styles.topStreakRank}
                >
                  1
                </MotiText>
                <Text style={styles.topStreakTitle} numberOfLines={1}>
                  {rankedHabits[0].habit.title}
                </Text>
                <MotiText
                  from={{ opacity: 0 }}
                  animate={shouldAnimate?{ opacity: 1 }:undefined}
                  transition={{ delay: 500 }}
                  style={styles.topStreakValue}
                >
                  {rankedHabits[0].bestStreack} 👑
                </MotiText>
              </MotiView>
            )}

            {/* 2nd Place - Silver with delay */}
            {rankedHabits[1] && (
              <MotiView
                from={{ opacity: 0, scale: 0.5, translateY: 50 }}
                animate={shouldAnimate?{ opacity: 1, scale: 1, translateY: 0 }:undefined}
                transition={{ type: "spring", delay: 400 }}
                style={[styles.topStreakItem, styles.silverCard]}
              >
                <Text style={styles.topStreakRank}>2</Text>
                <Text style={styles.topStreakTitle} numberOfLines={1}>
                  {rankedHabits[1].habit.title}
                </Text>
                <Text style={styles.topStreakValue}>
                  {rankedHabits[1].bestStreack}
                </Text>
              </MotiView>
            )}

            {/* 3rd Place - Bronze with delay */}
            {rankedHabits[2] && (
              <MotiView
                from={{ opacity: 0, scale: 0.5, translateY: 50 }}
                animate={shouldAnimate?{ opacity: 1, scale: 1, translateY: 0 }:undefined}
                transition={shouldAnimate?{ type: "spring", delay: 500 }:undefined}
                style={[styles.topStreakItem, styles.bronzeCard]}
              >
                <Text style={styles.topStreakRank}>3</Text>
                <Text style={styles.topStreakTitle} numberOfLines={1}>
                  {rankedHabits[2].habit.title}
                </Text>
                <Text style={styles.topStreakValue}>
                  {rankedHabits[2].bestStreack}
                </Text>
              </MotiView>
            )}
          </View>
        </View>
      )}

      {habits.length === 0 ? (
        <MotiView
          from={{ opacity: 0 }}
          animate={shouldAnimate?{ opacity: 1 }:undefined}
          transition={shouldAnimate?{ delay: 600 }:undefined}
          style={styles.emptyState}
        >
          <Text style={styles.emptyText}>No Habits Yet</Text>
        </MotiView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {rankedHabits.map(({ habit, total, bestStreack, streack }, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateY: 30 }}
              animate={shouldAnimate?{ opacity: 1, translateY: 0 }:undefined}
              transition={{
                type: "timing",
                duration: 400,
                delay: index * 100, // Staggered animation
              }}
            >
              <Card style={[styles.card, index === 0 && styles.bestCard]}>
                <Card.Content>
                  {/* Animated title row */}
                  <MotiView
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: index * 100 + 200 }}
                    style={styles.titleRow}
                  >
                    <Text style={styles.habitTitle}>{habit.title}</Text>
                    <MotiView
                      from={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: index * 100 + 300 }}
                      style={styles.frequencyBadge}
                    >
                      <Text style={styles.frequencyText}>
                        {habit.frequency.charAt(0).toUpperCase() +
                          habit.frequency.slice(1)}
                      </Text>
                    </MotiView>
                  </MotiView>

                  {habit.description ? (
                    <MotiText
                      from={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 100 + 400 }}
                      style={styles.description}
                    >
                      {habit.description}
                    </MotiText>
                  ) : null}

                  {/* Animated stats with pulse effect on numbers */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Current Streak</Text>
                      <MotiText
                        from={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          delay: index * 100 + 500,
                        }}
                        style={[styles.statValue, styles.streak]}
                      >
                        {streack} 🔥
                      </MotiText>
                    </View>

                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Best Streak</Text>
                      <MotiText
                        from={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          delay: index * 100 + 600,
                        }}
                        style={[styles.statValue, styles.bestStreak]}
                      >
                        {bestStreack} 👑
                      </MotiText>
                    </View>

                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Total</Text>
                      <MotiText
                        from={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          delay: index * 100 + 700,
                        }}
                        style={styles.statValue}
                      >
                        {total}
                      </MotiText>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </MotiView>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    padding: 20,
  },
  topStreaksSection: {
    marginBottom: 20,
  },
  sectionTitleContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ff444462",
    paddingBottom: 8,
    width: "30%",
  },
  topStreaksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  topStreakItem: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
    overflow: "hidden", // Added for better animation
  },
  goldCard: {
    borderColor: "#FFD700",
    backgroundColor: "#2A2A00",
  },
  silverCard: {
    borderColor: "#C0C0C0",
    backgroundColor: "#2A2A2A",
  },
  bronzeCard: {
    borderColor: "#CD7F32",
    backgroundColor: "#2A1A00",
  },
  topStreakRank: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  topStreakTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  topStreakValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: "#1A1A1A",
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333333",
  },
  bestCard: {
    borderColor: "#003ce0",
    borderWidth: 2,
  },
  habitTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  frequencyBadge: {
    backgroundColor: "#FF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frequencyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  description: {
    color: "#888888",
    fontSize: 14,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  statItem: {
    alignItems: "center",
    marginVertical: 4,
    minWidth: 80,
  },
  statLabel: {
    color: "#888888",
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  frequency: {
    color: "#FF4444",
  },
  streak: {
    color: "#4CAF50",
  },
  bestStreak: {
    color: "#FFD700",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#888888",
    fontSize: 16,
  },
});
