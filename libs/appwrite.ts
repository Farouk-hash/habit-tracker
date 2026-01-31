import { Account, Client, TablesDB  } from "react-native-appwrite";

export const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!) // Your Project ID
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME!); // Your package name / bundle identifier

export const account = new Account(client);

export const tablesDB = new TablesDB(client);
export const DATBASE_ID = process.env.EXPO_PUBLIC_DATABASE_ID;
export const HABIT_TABLE_ID = process.env.EXPO_PUBLIC_HABIT_COLLECTION_ID;
export const HABIT_COMPLETETION_TABLE_ID  = process.env.EXPO_PUBLIC_HABIT_COMPELETION_TABLE_ID ; 
