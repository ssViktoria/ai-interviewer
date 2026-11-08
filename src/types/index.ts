export type MessageRole = "system" | "user" | "assistant";

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: number;
}

export interface OpenRouterAPIMessage {
    role: MessageRole;
    content: string;
}

export interface OpenRouterChatResponse {
    id: string;
    choices: {
        message: {
            role: MessageRole;
            content: string;
        };
        finish_reason: string;
    }[];
}

export type AIModelTier = "free" | "budget" | "mid" | "flagship";

export interface AIModelOption {
    id: string;
    name: string;
    description: string;
    isFree: boolean;
    pricing?: string;
    tier?: AIModelTier;
}

// ==========================================
// НОВІ ТИПИ: Історія співбесід та аналітика
// ==========================================

export interface ParsedInterviewReport {
    score: number; // Оцінка кандидата від 1 до 10
    maxScore: number; // Зазвичай 10
    strengths: string[]; // Сильні сторони
    weaknesses: string[]; // Зони розвитку та помилки
    recommendedTopics: string[]; // Що повторити
    rawReport: string; // Оригінальний текст звіту від AI
}

export interface InterviewSession {
    id: string; // Унікальний ідентифікатор сесії
    topicId: string;
    topicTitle: string;
    levelId: string;
    levelTitle: string;
    timestamp: number; // Дата та час проведення
    messages: ChatMessage[]; // Повний діалог запитань та відповідей
    report: ParsedInterviewReport; // Структурований результат
}

export interface TopicStatItem {
    topicId: string;
    topicTitle: string;
    icon: string;
    sessionsCount: number;
    averageScore: number;
}

export interface CandidateAnalytics {
    totalInterviews: number;
    overallAverageScore: number;
    topicStats: TopicStatItem[];
}

// ==========================================
// НАЛАШТУВАННЯ ІНТЕРВ'Ю: Звук та Таймер
// ==========================================

export type TimerDurationOption = 0 | 60 | 90 | 120; // 0 = таймер вимкнено

export interface InterviewPreferences {
  isVoiceEnabled: boolean; // Озвучення питань Tech Lead
  timerSeconds: TimerDurationOption; // Ліміт часу на кожне питання
  isHapticsEnabled: boolean; // Тактильний відгук
}

// ==========================================
// ГОЛОСОВЕ ВВЕДЕННЯ (Speech-to-Text)
// ==========================================

export type VoiceRecordingStatus = "idle" | "recording" | "transcribing";

export interface AudioTranscriptionResult {
  text: string;
  durationSeconds?: number;
}