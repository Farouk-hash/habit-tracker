import {
  client,
  DATBASE_ID,
  HABIT_COMPLETETION_TABLE_ID,
  HABIT_TABLE_ID,
  tablesDB,
} from "@/libs/appwrite";
import { useAuth } from "@/libs/authContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { MotiText, MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Card, Text } from "react-native-paper";

export default function Index() {
  const { logout, user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const swipeableRef = useRef<{ [key: string]: Swipeable }>({});

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

  const fetchHabits = async () => {
    if (!user) return;

    try {
      const response = await tablesDB.listRows(DATBASE_ID!, HABIT_TABLE_ID!, [
        Query.equal("user_id", user.$id),
      ]);

      const habitsData = response.rows.map((row: any) => ({
        $id: row.$id,
        title: row.title || "",
        description: row.description || "",
        strock_count: row.strock_count || "0",
        frequency: row.frequency || "daily",
      }));

      setHabits(habitsData as []);
    } catch (error: any) {
      console.log("ERROR FETCHING HABITS: ", error.message);
    }
  };

  useEffect(() => {
    if (!user) return;

    const channel = `databases.${DATBASE_ID}.tables.${HABIT_TABLE_ID}.rows`;
    console.log("🔗 Connecting to:", channel);

    const habitsSubscription = client.subscribe(channel, (response) => {
      console.log("📨 Realtime message:", response);

      if (
        response.events.some(
          (event) =>
            event.endsWith(".create") ||
            event.endsWith(".update") ||
            event.endsWith(".delete"),
        )
      ) {
        console.log("🔄 Refreshing habits due to realtime update");
        fetchHabits();
        fetchTodayHabits();
      }
    });

    fetchHabits();
    fetchTodayHabits();
    return () => {
      if (habitsSubscription) {
        habitsSubscription();
      }
    };
  }, [user]);

  const renderLeftActionsMethod = (habitId: string) => (
    <View style={styles.leftActionMethod}>
      {isHabitCompleted(habitId) ? (
        <>
          <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold" }}>
            Completed
          </Text>
        </>
      ) : (
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color={"#fff"}
        />
      )}
    </View>
  );
  const renderRightActionsMethod = () => (
    <View style={styles.righttActionMethod}>
      <MaterialCommunityIcons
        name="trash-can-outline"
        size={32}
        color={"#fff"}
      />
    </View>
  );
  const handleDeleteHabit = async (id: string) => {
    try {
      await tablesDB.deleteRow(DATBASE_ID!, HABIT_TABLE_ID!, id);
    } catch (error) {
      console.log("ERROR WHILE DELETING HABIT", error.message);
    }
  };

  const fetchTodayHabits = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const response = await tablesDB.listRows(
        DATBASE_ID!,
        HABIT_COMPLETETION_TABLE_ID!,
        [
          Query.equal("user_id", user?.$id || ""),
          Query.greaterThanEqual("completed_at", today.toISOString()),
        ],
      );
      const completedHabitsIDs = response.rows.map((ch) => ch.habit_id) || [];
      setTodayHabits(completedHabitsIDs as []);
    } catch (error) {
      console.log("ERROR WHILE FETCHING TODAYS HABITS", error.message);
    }
  };
  const handleCompletedHabit = async (id: string) => {
    if (!user || todayHabits.includes(id)) return;
    console.log("BEGINNNING OF SETTTING COMPETEION");
    try {
      await tablesDB.createRow(
        DATBASE_ID!,
        HABIT_COMPLETETION_TABLE_ID!,
        ID.unique(),
        {
          user_id: user?.$id,
          habit_id: id,
          completed_at: new Date().toISOString(),
        },
      );
      const selectedHabit = habits.find((h) => h.$id === id);
      const currentCount = parseInt(selectedHabit.strock_count) || 0;

      await tablesDB.updateRow(DATBASE_ID!, HABIT_TABLE_ID!, id, {
        strock_count: String(currentCount + 1),
      });

      console.log("COMPLETED SUCCESS");
    } catch (error) {
      console.log("ERROR WHILE COMPLETING A HABIT", error.message);
    }
  };
  const isHabitCompleted = (habitId: stirng) => {
    return todayHabits.includes(habitId);
  };
  return (
    <View style={styles.container}>
      {/* Animated header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={shouldAnimate ? { opacity: 1, translateY: 0 } : undefined}
        transition={{ type: "timing", duration: 400 }}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <MotiText
          from={{ opacity: 0, scale: 0.9 }}
          animate={shouldAnimate ?{ opacity: 1, scale: 1 } : undefined}
          transition={{ type: "spring", delay: 100 }}
          style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "bold" }}
        >
          My Habits
        </MotiText>

        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={shouldAnimate ?{ opacity: 1, scale: 1 }:undefined}
          transition={{ type: "spring", delay: 200 }}
        >
          <Button
            mode="contained"
            onPress={logout}
            icon="logout"
            buttonColor="#FF4444"
            style={{ borderRadius: 8 }}
          >
            Logout
          </Button>
        </MotiView>
      </MotiView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {habits.map((habit: any, index: number) => (
          <MotiView
            key={habit.$id}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "timing",
              duration: 400,
              delay: index * 100, // Staggered animation
            }}
          >
            <Swipeable
              ref={(ref) => {
                swipeableRef.current[habit.$id] = ref;
              }}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={() => renderLeftActionsMethod(habit.$id)}
              renderRightActions={renderRightActionsMethod}
              onSwipeableOpen={(direction) => {
                if (direction === "right") {
                  handleDeleteHabit(habit.$id);
                } else if (direction === "left") {
                  handleCompletedHabit(habit.$id);
                }
                swipeableRef.current[habit.$id].close();
              }}
            >
              <Card
                style={[
                  styles.card,
                  isHabitCompleted(habit.$id) && styles.completedCard,
                ]}
              >
                <Card.Content>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  {habit.description ? (
                    <Text style={styles.description}>{habit.description}</Text>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <Text style={styles.frequency}>
                      {habit.frequency.charAt(0).toUpperCase() +
                        habit.frequency.slice(1)}
                    </Text>
                    <MotiText
                      from={{ opacity: 0, scale: 0.8 }}
                      animate={shouldAnimate ?{ opacity: 1, scale: 1 }:undefined}
                      transition={{ delay: 500 + index * 100 }}
                      style={styles.streak}
                    >
                      🔥 {habit.strock_count} days
                    </MotiText>
                  </View>
                </Card.Content>
              </Card>
            </Swipeable>
          </MotiView>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    padding: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
  completedCard: {
    opacity: 0.2,
  },
  habitTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    color: "#888888",
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  frequency: {
    color: "#FF4444",
    fontSize: 12,
    fontWeight: "600",
  },
  streak: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 20,
    borderRadius: 8,
  },
  leftActionMethod: {
    backgroundColor: "#4CAF50",
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    borderRadius: 8,
    paddingLeft: 16,
    marginBottom: 18,
    marginTop: 6,
  },
  righttActionMethod: {
    backgroundColor: "#FF4444",
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    borderRadius: 8,
    paddingRight: 16,
    marginBottom: 18,
    marginTop: 6,
  },
});
