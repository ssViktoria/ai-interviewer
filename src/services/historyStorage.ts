import { INTERVIEW_TOPICS } from "@/constants/topics";
import { CandidateAnalytics, InterviewSession, TopicStatItem } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@ai_interviewer_sessions_v1";

/**
 * Зберігає нову сесію в початок списку.
 */
export async function saveInterviewSession(session: InterviewSession): Promise<void> {
    try {
        const existing = await getInterviewSessions();
        const updated = [session, ...existing];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error("Помилка збереження сесії в AsyncStorage:", error);
        throw error;
    }
}

/**
 * Отримує всі збережені сесії співбесід.
 */
export async function getInterviewSessions(): Promise<InterviewSession[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as InterviewSession[];
    } catch (error) {
        console.error("Помилка завантаження сесій:", error);
        return [];
    }
}

/**
 * Отримує одну сесію за унікальним ID.
 */
export async function getSessionById(id: string): Promise<InterviewSession | null> {
    const sessions = await getInterviewSessions();
    return sessions.find((s) => s.id === id) || null;
}

/**
 * Видаляє окрему сесію за ID.
 */
export async function deleteInterviewSession(id: string): Promise<void> {
    try {
        const existing = await getInterviewSessions();
        const filtered = existing.filter((s) => s.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error("Помилка видалення сесії:", error);
        throw error;
    }
}

/**
 * Очищує всю історію співбесід.
 */
export async function clearAllSessions(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
}

/**
 * Розраховує аналітику готовності кандидата на основі історії.
 */
export function calculateCandidateAnalytics(sessions: InterviewSession[]): CandidateAnalytics {
    if (sessions.length === 0) {
        return {
            totalInterviews: 0,
            overallAverageScore: 0,
            topicStats: INTERVIEW_TOPICS.map((t) => ({
                topicId: t.id,
                topicTitle: t.title,
                icon: t.icon,
                sessionsCount: 0,
                averageScore: 0,
            })),
        };
    }

    const totalScoreSum = sessions.reduce((sum, s) => sum + s.report.score, 0);
    const overallAverageScore = Math.round((totalScoreSum / sessions.length) * 10) / 10;

    const topicStats: TopicStatItem[] = INTERVIEW_TOPICS.map((topic) => {
        const topicSessions = sessions.filter((s) => s.topicId === topic.id);
        const scoreSum = topicSessions.reduce((sum, s) => sum + s.report.score, 0);
        const avg = topicSessions.length > 0 ? Math.round((scoreSum / topicSessions.length) * 10) / 10 : 0;

        return {
            topicId: topic.id,
            topicTitle: topic.title,
            icon: topic.icon,
            sessionsCount: topicSessions.length,
            averageScore: avg,
        };
    });

    return {
        totalInterviews: sessions.length,
        overallAverageScore,
        topicStats,
    };
}