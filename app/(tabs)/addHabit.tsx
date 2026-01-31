import { DATBASE_ID, HABIT_TABLE_ID, tablesDB } from "@/libs/appwrite";
import { useAuth } from "@/libs/authContext";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import { Button, SegmentedButtons, TextInput } from "react-native-paper";

const FREQ = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQ)[number];

export default function AddHabit() {
  const [freq, setFreq] = useState<Frequency>("daily");
  const [habitName, setHabitName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const router = useRouter();

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
  const handleSubmit = async () => {
    if (!user) return;
    try {
      await tablesDB.createRow(DATBASE_ID!, HABIT_TABLE_ID!, ID.unique(), {
        user_id: user.$id,
        title: habitName,
        description,
        strock_count: String(0),
      });
      setHabitName("");
      setDescription("");
      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError("ERROR OCCURRED WHILE CREATING A HABIT");
    }
  };

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={shouldAnimate?{ opacity: 1, translateY: 0 }:undefined}
        transition={shouldAnimate?{ type: "timing", duration: 400 }:undefined}
        style={styles.card}
      >
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={shouldAnimate?{ opacity: 1, translateX: 0 }:undefined}
          transition={shouldAnimate?{ type: "timing", duration: 400, delay: 100 }:undefined}
        >
          <TextInput
            label="Habit Name"
            placeholder="e.g. Drink Water"
            value={habitName}
            onChangeText={setHabitName}
            mode="outlined"
            style={styles.input}
            textColor="#FFFFFF"
            placeholderTextColor="#888888"
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 400, delay: 200 }}
        >
          <TextInput
            label="Description"
            placeholder="Optional"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            textColor="#FFFFFF"
            placeholderTextColor="#888888"
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 400, delay: 300 }}
        >
          <SegmentedButtons
            value={freq}
            onValueChange={setFreq}
            style={styles.segmented}
            theme={{
              colors: {
                secondaryContainer: "#FF4444",
                onSecondaryContainer: "#FFFFFF",
                primary: "#888888",
              },
            }}
            buttons={FREQ.map((item) => ({
              value: item,
              label: item.charAt(0).toUpperCase() + item.slice(1),
              style: styles.button,
              labelStyle: styles.label,
            }))}
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 400 }}
        >
          <Button
            mode="contained"
            onPress={handleSubmit}
            buttonColor="#FF4444"
            style={styles.addbutton}
            disabled={!habitName.trim() || !description.trim()}
            textColor="#FFFFFF"
            theme={{
              colors: {
                onSurfaceDisabled: "#666666",
                onSurfaceVariant: "#888888",
              },
            }}
          >
            Add Habit
          </Button>
        </MotiView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  input: {
    backgroundColor: "transparent",
  },
  segmented: {
    marginTop: 10,
  },
  button: {
    borderColor: "#333",
  },
  buttonChecked: {
    backgroundColor: "#FF4444",
  },
  label: {
    color: "#fdfdfd",
  },

  addbutton: {
    borderRadius: 14,
  },
});
