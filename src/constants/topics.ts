export interface InterviewTopic {
    id: string;
    title: string;
    icon: string;
    description: string;
}

export const INTERVIEW_TOPICS: InterviewTopic[] = [
    {
        id: "rn-core",
        title: "React Native Core",
        icon: "📱",
        description: "Життєвий цикл, хуки (useState, useEffect, useCallback), JSX, FlatList, стилізація.",
    },
    {
        id: "js-ts",
        title: "JavaScript & TypeScript",
        icon: "⚡",
        description: "Event Loop, проміси, async/await, Generics, замикання, типізація пропсів.",
    },
    {
        id: "nav-state",
        title: "Навігація та Стан",
        icon: "🧭",
        description: "Expo Router, файлова структура маршрутів, React Context, Zustand/Redux Toolkit.",
    },
    {
        id: "soft-skills",
        title: "Soft Skills & Поведінкові питання",
        icon: "🤝",
        description: "Робота в команді, вирішення конфліктів, оцінка дедлайнів, взаємодія на Code Review.",
    },
];

export const INTERVIEW_LEVELS = [
    { id: "trainee", title: "Trainee / Intern", questionsCount: 3 },
    { id: "junior", title: "Junior Dev", questionsCount: 5 },
    { id: "junior-plus", title: "Junior+ Dev", questionsCount: 6 },
] as const;