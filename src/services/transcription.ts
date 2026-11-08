import { AudioTranscriptionResult } from "@/types";
import {
    getRecordingPermissionsAsync,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { getApiKey } from "./storage";

/**
 * Запитує системні дозволи на використання мікрофона через expo-audio.
 */
export async function requestMicrophonePermission(): Promise<boolean> {
    try {
        const current = await getRecordingPermissionsAsync();
        if (current.granted) return true;

        if (current.canAskAgain) {
            const response = await requestRecordingPermissionsAsync();
            return response.granted;
        }
        return false;
    } catch (error) {
        console.error("Помилка запиту дозволу на мікрофон:", error);
        return false;
    }
}

/**
 * Налаштовує режим аудіо для запису голосу через expo-audio.
 */
export async function setupAudioModeForRecording(): Promise<void> {
    await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
    });
}

/**
 * Відновлює звичайний режим аудіо після завершення запису.
 */
export async function resetAudioMode(): Promise<void> {
    await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
    });
}

/**
 * Відправляє аудіофайл на розпізнавання до OpenRouter Whisper API.
 * Модель openai/whisper-large-v3-turbo забезпечує максимальну точність
 * розпізнавання української мови та англійських ІТ-термінів.
 */
export async function transcribeAudioWithWhisper(
    fileUri: string
): Promise<AudioTranscriptionResult> {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error("Відсутній API-ключ OpenRouter. Вкажіть його у Налаштуваннях.");
    }

    // 1. Перевіряємо існування файлу перед зчитуванням
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
        throw new Error("Аудіозапис не знайдено на пристрої.");
    }

    // 2. Зчитуємо аудіофайл у формат Base64 через expo-file-system/legacy
    const base64Audio = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
    });

    if (!base64Audio || base64Audio.length === 0) {
        throw new Error("Аудіофайл порожній або пошкоджений. Спробуйте записати ще раз.");
    }

    // 3. Визначаємо формат файлу (m4a для пресету HIGH_QUALITY expo-audio)
    const cleanUri = fileUri.split("?")[0].toLowerCase();
    const format = cleanUri.endsWith(".wav")
        ? "wav"
        : cleanUri.endsWith(".mp3")
            ? "mp3"
            : "m4a";

    // 4. Відправляємо запит до OpenRouter Whisper API
    const response = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/react-native-lessons",
            "X-Title": "React Native AI Mock Interviewer",
        },
        body: JSON.stringify({
            model: "openai/whisper-large-v3-turbo",
            input_audio: {
                data: base64Audio,
                format: format,
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
            errorData?.error?.message ||
            (typeof errorData === "string" ? errorData : null) ||
            `Помилка сервера розпізнавання (${response.status})`;
        throw new Error(errorMessage);
    }

    const result = await response.json();
    const rawText = (result.text || "").trim();

    // Очищаємо можливі артефакти або галюцинації тиші Whisper (наприклад: ".", "...", " . ")
    const cleanText = rawText.replace(/^[.\s,!?…]+$/, "").trim();

    // 5. Видаляємо тимчасовий аудіофайл після транскрипції для економії пам'яті
    FileSystem.deleteAsync(fileUri, { idempotent: true }).catch((err) =>
        console.warn("Не вдалося видалити тимчасовий аудіофайл:", err)
    );

    return {
        text: cleanText,
        durationSeconds: result?.usage?.seconds,
    };
}