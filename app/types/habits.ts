import { Models } from "react-native-appwrite";

export default interface Habits extends Models.Document {
  user_id: string;
  title: string;
  description: string;
  strock_count: string;
  frequency: string;
}
