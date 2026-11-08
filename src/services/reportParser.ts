import { ParsedInterviewReport } from "@/types";

/**
 * Парсер текстового фінального звіту від AI у структуровані дані.
 */
export function parseAIReport(aiText: string): ParsedInterviewReport {
    // 1. Пошук балу (наприклад, "8 з 10", "8/10", "7.5 з 10")
    let score = 7;
    const scoreRegex = /(?:ЗАГАЛЬНА ОЦІНКА|ОЦІНКА)[\s:]*([0-9]+(?:[.,][0-9]+)?)\s*(?:з|\/)\s*([0-9]+)/i;
    const scoreMatch = aiText.match(scoreRegex);

    if (scoreMatch && scoreMatch[1]) {
        const parsed = parseFloat(scoreMatch[1].replace(",", "."));
        if (!isNaN(parsed)) {
            score = Math.min(Math.max(parsed, 1), 10);
        }
    } else {
        // Резервний пошук одиночної цифри
        const singleDigitMatch = aiText.match(/([0-9]+)\s*з\s*10/i);
        if (singleDigitMatch && singleDigitMatch[1]) {
            score = parseInt(singleDigitMatch[1], 10);
        }
    }

    // 2. Допоміжна функція для вилучення списків із маркованих блоків
    const extractSectionItems = (startMarker: string, endMarkers: string[]): string[] => {
        const startIndex = aiText.indexOf(startMarker);
        if (startIndex === -1) return [];

        const textAfterStart = aiText.substring(startIndex + startMarker.length);
        let minEndIndex = textAfterStart.length;

        for (const marker of endMarkers) {
            const idx = textAfterStart.indexOf(marker);
            if (idx !== -1 && idx < minEndIndex) {
                minEndIndex = idx;
            }
        }

        const sectionContent = textAfterStart.substring(0, minEndIndex).trim();

        return sectionContent
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("-") || line.startsWith("•") || line.startsWith("*") || /^\d+\./.test(line))
            .map((line) => line.replace(/^[-•*]|\d+\.\s*/, "").trim())
            .filter((item) => item.length > 0);
    };

    const strengths = extractSectionItems("СИЛЬНІ СТОРОНИ", [
        "ЗОНИ ДЛЯ РОЗВИТКУ",
        "ПОМИЛКИ",
        "РЕКОМЕНДОВАНІ ТЕМИ",
    ]);

    const weaknesses = extractSectionItems("ЗОНИ ДЛЯ РОЗВИТКУ", [
        "РЕКОМЕНДОВАНІ ТЕМИ",
        "РЕКОМЕНДАЦІЇ",
    ]);

    const recommendedTopics = extractSectionItems("РЕКОМЕНДОВАНІ ТЕМИ", [
        "ПІДСУМОК",
        "УСПІХІВ",
    ]);

    return {
        score: Math.round(score * 10) / 10,
        maxScore: 10,
        strengths: strengths.length > 0 ? strengths : ["Впевнені базові знання напряму", "Гарна швидкість формулювання думок"],
        weaknesses: weaknesses.length > 0 ? weaknesses : ["Потрібно детальніше розібрати поглиблені концепції"],
        recommendedTopics: recommendedTopics.length > 0 ? recommendedTopics : ["Повторити ключову документацію та практичні завдання"],
        rawReport: aiText,
    };
}