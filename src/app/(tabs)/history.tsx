import { useModal } from "@/components/UniversalModal";
import { INTERVIEW_TOPICS } from "@/constants/topics";
import {
    calculateCandidateAnalytics,
    deleteInterviewSession,
    getInterviewSessions,
} from "@/services/historyStorage";
import { CandidateAnalytics, InterviewSession } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
    const router = useRouter();
    const { showConfirm } = useModal();
    const [sessions, setSessions] = useState<InterviewSession[]>([]);
    const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>("all");
    const [analytics, setAnalytics] = useState<CandidateAnalytics | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        const list = await getInterviewSessions();
        setSessions(list);
        setAnalytics(calculateCandidateAnalytics(list));
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleDelete = (id: string) => {
        showConfirm({
            title: "Видалити запис?",
            message: "Цю сесію буде видалено з історії безповоротно.",
            type: "danger",
            confirmText: "Видалити",
            cancelText: "Скасувати",
            onConfirm: async () => {
                await deleteInterviewSession(id);
                await loadData();
            },
        });
    };

    const filteredSessions =
        selectedTopicFilter === "all"
            ? sessions
            : sessions.filter((s) => s.topicId === selectedTopicFilter);

    const getScoreBadgeColor = (score: number) => {
        if (score >= 8)
            return {
                bg: "bg-emerald-500/20",
                text: "text-emerald-400",
                border: "border-emerald-500/40",
            };
        if (score >= 6)
            return {
                bg: "bg-amber-500/20",
                text: "text-amber-400",
                border: "border-amber-500/40",
            };
        return {
            bg: "bg-rose-500/20",
            text: "text-rose-400",
            border: "border-rose-500/40",
        };
    };

    return (
        <SafeAreaView className="flex-1 bg-background-dark">
            {/* Шапка екрану */}
            <View className="border-b border-slate-800 px-6 py-4 bg-slate-900/60">
                <Text className="text-xl font-extrabold text-white">
                    &#x1f4ca; Аналітика та Історія
                </Text>
                <Text className="text-xs text-slate-400 mt-0.5">
                    Відстежуйте динаміку зростання ваших знань та результати співбесід
                </Text>
            </View>

            <FlatList
                data={filteredSessions}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
                }
                contentContainerClassName="p-5 pb-12"
                ListHeaderComponent={
                    <View className="mb-6">
                        {/* Головна картка готовності */}
                        <View className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 mb-5 shadow-xl">
                            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                &#x1f3c6; Рівень готовності до інтерв'ю
                            </Text>

                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-4xl font-extrabold text-white">
                                        {analytics?.overallAverageScore || 0}
                                        <Text className="text-lg text-slate-400 font-normal"> / 10</Text>
                                    </Text>
                                    <Text className="text-xs text-slate-400 mt-1">
                                        Пройдено співбесід: <Text className="font-bold text-white">{analytics?.totalInterviews || 0}</Text>
                                    </Text>
                                </View>

                                <View className="items-end">
                                    <View
                                        className={`px-3.5 py-1.5 rounded-full border ${(analytics?.overallAverageScore || 0) >= 7
                                            ? "bg-emerald-500/20 border-emerald-500/40"
                                            : "bg-amber-500/20 border-amber-500/40"
                                            }`}
                                    >
                                        <Text
                                            className={`text-xs font-bold ${(analytics?.overallAverageScore || 0) >= 7
                                                ? "text-emerald-400"
                                                : "text-amber-400"
                                                }`}
                                        >
                                            {(analytics?.overallAverageScore || 0) >= 8
                                                ? "Готовий до офферів"
                                                : (analytics?.overallAverageScore || 0) >= 6
                                                    ? "Впевнений Junior"
                                                    : "Потребує підготовки"}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Прогрес за кожною темою */}
                            <View className="mt-5 pt-4 border-t border-slate-800/80 gap-3">
                                {analytics?.topicStats.map((stat) => (
                                    <View key={stat.topicId}>
                                        <View className="flex-row items-center justify-between mb-1.5">
                                            <Text className="text-xs font-medium text-slate-300">
                                                {stat.icon} {stat.topicTitle}
                                            </Text>
                                            <Text className="text-xs font-bold text-white">
                                                {stat.averageScore > 0 ? `${stat.averageScore}/10` : "Немає даних"}
                                            </Text>
                                        </View>
                                        <View className="h-2 rounded-full bg-slate-800 overflow-hidden">
                                            <View
                                                className="h-full rounded-full bg-primary"
                                                style={{ width: `${(stat.averageScore / 10) * 100}%` }}
                                            />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Фільтри за темами */}
                        <Text className="text-sm font-bold text-white mb-2.5">
                            Історія інтерв'ю ({filteredSessions.length})
                        </Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2">
                            <TouchableOpacity
                                onPress={() => setSelectedTopicFilter("all")}
                                className={`px-3.5 py-1.5 rounded-full border mr-2 ${selectedTopicFilter === "all"
                                    ? "bg-primary border-primary"
                                    : "bg-slate-900 border-slate-800"
                                    }`}
                            >
                                <Text
                                    className={`text-xs font-semibold ${selectedTopicFilter === "all" ? "text-white" : "text-slate-400"
                                        }`}
                                >
                                    Всі напрями
                                </Text>
                            </TouchableOpacity>

                            {INTERVIEW_TOPICS.map((topic) => {
                                const active = selectedTopicFilter === topic.id;
                                return (
                                    <TouchableOpacity
                                        key={topic.id}
                                        onPress={() => setSelectedTopicFilter(topic.id)}
                                        className={`px-3.5 py-1.5 rounded-full border mr-2 ${active ? "bg-primary border-primary" : "bg-slate-900 border-slate-800"
                                            }`}
                                    >
                                        <Text
                                            className={`text-xs font-semibold ${active ? "text-white" : "text-slate-400"
                                                }`}
                                        >
                                            {topic.icon} {topic.title}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                }
                renderItem={({ item }) => {
                    const badge = getScoreBadgeColor(item.report.score);

                    return (
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: "/report/[id]" as any,
                                    params: { id: item.id },
                                })
                            }
                            activeOpacity={0.8}
                            className="rounded-2xl bg-background-card border border-slate-800 p-4 mb-3.5 shadow-md"
                        >
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-1 mr-2">
                                    <Text className="text-base font-bold text-white" numberOfLines={1}>
                                        {item.topicTitle}
                                    </Text>
                                    <Text className="text-[11px] text-accent-purple font-medium">
                                        {item.levelTitle} • {new Date(item.timestamp).toLocaleDateString("uk-UA")}
                                    </Text>
                                </View>

                                <View className={`px-3 py-1 rounded-full border ${badge.bg} ${badge.border}`}>
                                    <Text className={`text-xs font-extrabold ${badge.text}`}>
                                        &#x1f3c6; {item.report.score}/10
                                    </Text>
                                </View>
                            </View>

                            {/* Короткий прев'ю фідбеку */}
                            <Text className="text-xs text-slate-400 mb-3" numberOfLines={2}>
                                &#x1f31f; {item.report.strengths[0] || "Пройдено успішно"}
                            </Text>

                            <View className="flex-row items-center justify-between pt-3 border-t border-slate-800/80">
                                <Text className="text-[11px] text-primary font-bold">
                                    Переглянути повний звіт →
                                </Text>

                                <TouchableOpacity
                                    onPress={() => handleDelete(item.id)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="trash-outline" size={16} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View className="py-12 items-center justify-center">
                        <Text className="text-4xl mb-3">&#x1f4dd;</Text>
                        <Text className="text-base font-bold text-white mb-1">
                            Історія порожня
                        </Text>
                        <Text className="text-xs text-slate-400 text-center max-w-[250px] mb-5">
                            Ви ще не завершили жодної співбесіди. Пройдіть перше тренування!
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push("/(tabs)")}
                            className="rounded-xl bg-primary px-5 py-2.5"
                        >
                            <Text className="text-white text-xs font-bold">
                                Почати співбесіду
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
}