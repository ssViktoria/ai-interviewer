import { useModal } from "@/components/UniversalModal";
import { getSessionById } from "@/services/historyStorage";
import { InterviewSession } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportScreen() {
    const router = useRouter();
    const { showAlert } = useModal();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [session, setSession] = useState<InterviewSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFullTranscript, setShowFullTranscript] = useState(false);

    useEffect(() => {
        if (id) {
            getSessionById(id)
                .then((res) => setSession(res))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleShare = async () => {
        if (!session) return;

        const reportText = `
&#x1f4cb; РЕЗУЛЬТАТИ ТЕХНІЧНОЇ СПІВБЕСІДИ
----------------------------------------
&#x1f4cc; Напрям: ${session.topicTitle} (${session.levelTitle})
&#x1f4c5; Дата: ${new Date(session.timestamp).toLocaleDateString("uk-UA")}
&#x1f3c6; Оцінка: ${session.report.score} з 10

&#x1f31f; СИЛЬНІ СТОРОНИ:
${session.report.strengths.map((s) => `• ${s}`).join("\n")}

⚠️ ЗОНИ ДЛЯ РОЗВИТКУ ТА ПОМИЛКИ:
${session.report.weaknesses.map((w) => `• ${w}`).join("\n")}

&#x1f4da; РЕКОМЕНДОВАНО ПОВТОРИТИ:
${session.report.recommendedTopics.map((r) => `• ${r}`).join("\n")}
----------------------------------------
Згенеровано у додатку AI Mock Interviewer &#x1f680;
    `.trim();

        try {
            // Кросплатформна підтримка для Web та Desktop (Electron):
            // Якщо нативний Web Share API не підтримується або недоступний, копіюємо в буфер обміну
            if (Platform.OS === "web" && typeof navigator !== "undefined" && !navigator.share) {
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(reportText);
                    showAlert({
                        title: "Звіт скопійовано! &#x1f4cb;",
                        message: "Текст підсумкового звіту успішно скопійовано до буфера обміну. Ви можете вставити його в будь-який чат чи документ.",
                        type: "success",
                    });
                    return;
                }
            }

            await Share.share({
                message: reportText,
                title: `Звіт співбесіди: ${session.topicTitle}`,
            });
        } catch (err: any) {
            showAlert({
                title: "Помилка експорту",
                message: err.message || "Не вдалося поширити звіт.",
                type: "danger",
            });
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background-dark items-center justify-center">
                <ActivityIndicator size="large" color="#60A5FA" />
            </SafeAreaView>
        );
    }

    if (!session) {
        return (
            <SafeAreaView className="flex-1 bg-background-dark items-center justify-center p-6">
                <Text className="text-white text-base font-bold mb-3">Звіт не знайдено</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="rounded-xl bg-primary px-5 py-2.5"
                >
                    <Text className="text-white text-xs font-bold">Повернутися</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const { report } = session;

    return (
        <SafeAreaView className="flex-1 bg-background-dark">
            {/* Шапка екрану */}
            <View className="flex-row items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-900/60">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center gap-1.5"
                >
                    <Ionicons name="arrow-back" size={20} color="#94A3B8" />
                    <Text className="text-slate-300 text-sm font-semibold">Назад</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleShare}
                    className="flex-row items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 active:bg-primary-dark"
                >
                    <Ionicons name="share-social-outline" size={16} color="#FFFFFF" />
                    <Text className="text-white text-xs font-bold">Поділитися</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerClassName="p-5 pb-16" showsVerticalScrollIndicator={false}>
                {/* Головна картка балу */}
                <View className="rounded-3xl bg-slate-900 border border-slate-800 p-6 mb-5 items-center shadow-2xl">
                    <Text className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                        {session.topicTitle} • {session.levelTitle}
                    </Text>
                    <Text className="text-[11px] text-slate-500 mb-4">
                        {new Date(session.timestamp).toLocaleString("uk-UA")}
                    </Text>

                    <View className="w-28 h-28 rounded-full border-4 border-primary items-center justify-center bg-primary/10 mb-3">
                        <Text className="text-4xl font-black text-white">{report.score}</Text>
                        <Text className="text-xs text-slate-400 font-semibold">з 10</Text>
                    </View>

                    <Text className="text-sm font-bold text-center text-slate-200">
                        {report.score >= 8
                            ? "&#x1f31f; Відмінний рівень підготовки!"
                            : report.score >= 6
                                ? "&#x1f44d; Добре, але є прогалини в теорії"
                                : "⚠️ Рекомендується ґрунтовно повторити матеріал"}
                    </Text>
                </View>

                {/* Картка 1: Сильні сторони */}
                <View className="rounded-2xl bg-background-card border border-emerald-500/30 p-4 mb-4">
                    <View className="flex-row items-center gap-2 mb-2.5">
                        <Text className="text-base">&#x1f31f;</Text>
                        <Text className="text-sm font-bold text-emerald-400">Сильні сторони</Text>
                    </View>
                    {report.strengths.map((item, idx) => (
                        <View key={idx} className="flex-row items-start gap-2 mb-2">
                            <Text className="text-emerald-400 text-xs mt-0.5">✓</Text>
                            <Text className="text-xs text-slate-300 flex-1 leading-relaxed">{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Картка 2: Зони для розвитку та помилки */}
                <View className="rounded-2xl bg-background-card border border-amber-500/30 p-4 mb-4">
                    <View className="flex-row items-center gap-2 mb-2.5">
                        <Text className="text-base">⚠️</Text>
                        <Text className="text-sm font-bold text-amber-400">Зони для розвитку та помилки</Text>
                    </View>
                    {report.weaknesses.map((item, idx) => (
                        <View key={idx} className="flex-row items-start gap-2 mb-2">
                            <Text className="text-amber-400 text-xs mt-0.5">•</Text>
                            <Text className="text-xs text-slate-300 flex-1 leading-relaxed">{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Картка 3: Рекомендовані теми */}
                <View className="rounded-2xl bg-background-card border border-primary/30 p-4 mb-5">
                    <View className="flex-row items-center gap-2 mb-2.5">
                        <Text className="text-base">&#x1f4da;</Text>
                        <Text className="text-sm font-bold text-primary-light">Рекомендовано повторити</Text>
                    </View>
                    {report.recommendedTopics.map((item, idx) => (
                        <View key={idx} className="flex-row items-start gap-2 mb-2">
                            <Text className="text-primary text-xs mt-0.5">→</Text>
                            <Text className="text-xs text-slate-300 flex-1 leading-relaxed">{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Секція повного діалогу (транскрипту) */}
                <TouchableOpacity
                    onPress={() => setShowFullTranscript(!showFullTranscript)}
                    className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex-row items-center justify-between mb-4"
                >
                    <View className="flex-row items-center gap-2">
                        <Text className="text-base">&#x1f4ac;</Text>
                        <Text className="text-xs font-bold text-white">
                            {showFullTranscript ? "Сховати повний діалог" : "Показати всі запитання та відповіді"}
                        </Text>
                    </View>
                    <Ionicons
                        name={showFullTranscript ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#94A3B8"
                    />
                </TouchableOpacity>

                {showFullTranscript && (
                    <View className="gap-3 mb-6">
                        {session.messages
                            .filter((m) => m.role !== "system")
                            .map((msg, idx) => (
                                <View
                                    key={idx}
                                    className={`p-3.5 rounded-2xl ${msg.role === "user"
                                            ? "bg-primary/20 border border-primary/40 self-end max-w-[90%]"
                                            : "bg-background-card border border-slate-800 self-start max-w-[95%]"
                                        }`}
                                >
                                    <Text className="text-[10px] font-bold text-slate-400 mb-1 uppercase">
                                        {msg.role === "user" ? "Ви (Кандидат)" : "Tech Lead"}
                                    </Text>
                                    <Text className="text-xs text-slate-200 leading-relaxed">
                                        {msg.content}
                                    </Text>
                                </View>
                            ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}