import { InterviewPreferences } from "@/types";
import * as SecureStore from "expo-secure-store";

const PREFERENCES_STORAGE_KEY = "user_interview_preferences";

const DEFAULT_PREFERENCES: InterviewPreferences = {
    isVoiceEnabled: true,
    timerSeconds: 90,
    isHapticsEnabled: true,
};

/**
 * Отримує налаштування звуку та таймера.
 */
export async function getInterviewPreferences(): Promise<InterviewPreferences> {
    try {
        const raw = await SecureStore.getItemAsync(PREFERENCES_STORAGE_KEY);
        if (!raw) return DEFAULT_PREFERENCES;
        return JSON.parse(raw) as InterviewPreferences;
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

/**
 * Зберігає налаштування звуку та таймера.
 */
export async function saveInterviewPreferences(
    prefs: InterviewPreferences
): Promise<void> {
    await SecureStore.setItemAsync(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(prefs)
    );
}
const API_KEY_STORAGE = "user_openrouter_key";
const MODEL_STORAGE = "user_selected_model";

export async function saveApiKey(key: string): Promise<void> {
    await SecureStore.setItemAsync(API_KEY_STORAGE, key.trim());
}

/**
 * Отримує діючий API-ключ.
 * Пріоритет:
 * 1. Зашифроване сховище SecureStore (користувач ввів вручну в додатку).
 * 2. Змінна оточення EXPO_PUBLIC_OPENROUTER_API_KEY з файлу .env.
 */
export async function getApiKey(): Promise<string | null> {
    try {
        const key = await SecureStore.getItemAsync(API_KEY_STORAGE);
        if (key && key.trim().length > 0) {
            return key.trim();
        }
    } catch {
        // Якщо SecureStore недоступний, переходимо до fallback на .env
    }

    const envKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
    if (envKey && envKey.trim().length > 0) {
        return envKey.trim();
    }

    return null;
}

/**
 * Повертає ключ суто зі змінної оточення .env (якщо встановлено)
 */
export function getEnvApiKey(): string | null {
    const envKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
    return envKey && envKey.trim().length > 0 ? envKey.trim() : null;
}

/**
 * Повертає ключ суто зі сховища SecureStore
 */
export async function getCustomApiKey(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(API_KEY_STORAGE);
    } catch {
        return null;
    }
}

export async function deleteApiKey(): Promise<void> {
    await SecureStore.deleteItemAsync(API_KEY_STORAGE);
}

export async function saveSelectedModel(model: string): Promise<void> {
    await SecureStore.setItemAsync(MODEL_STORAGE, model);
}

export async function getSelectedModel(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(MODEL_STORAGE);
    } catch {
        return null;
    }
}