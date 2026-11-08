import * as Speech from "expo-speech";

/**
 * Очищує текст від Markdown-форматування та емодзі для природного озвучення.
 */
function cleanTextForSpeech(rawText: string): string {
    return rawText
        // Видаляємо блоки коду ```...```
        .replace(/```[\s\S]*?```/g, "Приклад коду.")
        // Видаляємо одинарні лапки коду `...`
        .replace(/`([^`]+)`/g, "$1")
        // Видаляємо жирний шрифт та курсив
        .replace(/[*_#]/g, "")
        // Видаляємо посилання
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        // Видаляємо маркери списків
        .replace(/^[-•*]\s+/gm, "")
        // Замінюємо популярні емодзі
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
        .trim();
}

/**
 * Озвучує повідомлення Tech Lead.
 */
export function speakAssistantMessage(text: string): void {
    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    // Зупиняємо попереднє мовлення, якщо воно ще триває
    Speech.stop();

    Speech.speak(cleaned, {
        language: "uk-UA",
        pitch: 1.0,
        rate: 0.95, // Трохи спокійніший темп для технічних термінів
    });
}

/**
 * Зупиняє поточне озвучення.
 */
export function stopSpeech(): void {
    Speech.stop();
}