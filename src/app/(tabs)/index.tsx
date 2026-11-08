
import { AppModal, ModalButton } from "@/components/AppModal";
import {
  INTERVIEW_LEVELS,
  INTERVIEW_TOPICS,
  InterviewTopic,
} from "@/constants/topics";
import { getApiKey, getCustomApiKey, getEnvApiKey } from "@/services/storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  const [selectedTopic, setSelectedTopic] = useState<InterviewTopic>(
    INTERVIEW_TOPICS[0]
  );

  const [selectedLevel, setSelectedLevel] = useState<
    (typeof INTERVIEW_LEVELS)[number]
  >(INTERVIEW_LEVELS[1]);

  const [hasApiKey, setHasApiKey] = useState(false);
  const [keySource, setKeySource] = useState<"secure_store" | "env" | null>(
    null
  );

  const [modal, setModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: ModalButton[];
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  const showModal = (
    title: string,
    message: string,
    buttons: ModalButton[] = [{ text: "Зрозуміло", onPress: () => { } }]
  ) => {
    setModal({ visible: true, title, message, buttons });
  };

  useFocusEffect(
    useCallback(() => {
      checkKey();
    }, [])
  );

  const checkKey = async () => {
    try {
      const customKey = await getCustomApiKey();

      if (customKey) {
        setHasApiKey(true);
        setKeySource("secure_store");
        return;
      }

      const envKey = getEnvApiKey();

      if (envKey) {
        setHasApiKey(true);
        setKeySource("env");
        return;
      }

      setHasApiKey(false);
      setKeySource(null);
    } catch {
      setHasApiKey(false);
      setKeySource(null);
    }
  };

  const handleStart = async () => {
    try {
      const key = await getApiKey();

      if (!key) {
        showModal(
          "API-ключ відсутній",
          "Для проходження співбесіди налаштуйте ключ OpenRouter у вкладці Налаштування або вкажіть його у файлі .env.",
          [
            {
              text: "Скасувати",
              style: "cancel",
              onPress: () => { },
            },
            {
              text: "Налаштувати",
              onPress: () => router.push("/(tabs)/settings"),
            },
          ]
        );

        return;
      }

      router.push({
        pathname: "/interview",
        params: {
          topicId: selectedTopic.id,
          levelId: selectedLevel.id,
        },
      });
    } catch (err: unknown) {
      showModal(
        "Помилка",
        err instanceof Error
          ? err.message
          : "Не вдалося перевірити API-ключ."
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <View className="flex-row items-center justify-between border-b border-slate-800 px-6 py-3.5 bg-slate-900/60">
        <Text className="text-xl font-extrabold text-white">
          AI Interviewer
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/settings")}
          className="rounded-full bg-slate-800 p-2.5 border border-slate-700 active:bg-slate-700"
        >
          <Text className="text-sm">⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerClassName="p-6 pb-12"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/settings")}
          activeOpacity={0.8}
          className={`flex-row items-center gap-2 rounded-full px-4 py-1.5 mb-6 self-start border ${hasApiKey
            ? "bg-accent-success/20 border-accent-success/40"
            : "bg-accent-warning/20 border-accent-warning/40"
            }`}
        >
          <View
            className={`w-2 h-2 rounded-full ${hasApiKey ? "bg-accent-success" : "bg-accent-warning"
              }`}
          />

          <Text
            className={`text-xs font-semibold ${hasApiKey ? "text-accent-success" : "text-accent-warning"
              }`}
          >
            {hasApiKey
              ? keySource === "env"
                ? "API-ключ підключено (.env)"
                : "API-ключ підключено (SecureStore)"
              : "Потрібно налаштувати ключ"}
          </Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-white mb-1">
          Оберіть напрям співбесіди
        </Text>

        <Text className="text-sm text-slate-400 mb-6">
          AI проведе реалістичний скринінг твоїх знань та надасть розгорнутий
          фідбек.
        </Text>

        <View className="gap-3 mb-6">
          {INTERVIEW_TOPICS.map((topic) => {
            const isSelected = selectedTopic.id === topic.id;

            return (
              <TouchableOpacity
                key={topic.id}
                onPress={() => setSelectedTopic(topic)}
                activeOpacity={0.8}
                className={`rounded-2xl p-4 border ${isSelected
                  ? "bg-primary/20 border-primary"
                  : "bg-background-card border-slate-800"
                  }`}
              >
                <View className="flex-row items-center gap-3.5">
                  <Text className="text-3xl">{topic.icon}</Text>

                  <View className="flex-1">
                    <Text className="font-bold text-white text-base">
                      {topic.title}
                    </Text>

                    <Text className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {topic.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-lg font-bold text-white mb-3">
          Рівень складності
        </Text>

        <View className="flex-row gap-2 mb-8">
          {INTERVIEW_LEVELS.map((lvl) => {
            const isSelected = selectedLevel.id === lvl.id;

            return (
              <TouchableOpacity
                key={lvl.id}
                onPress={() => setSelectedLevel(lvl)}
                className={`flex-1 rounded-xl py-3 px-2 border items-center ${isSelected
                  ? "bg-accent-purple/20 border-accent-purple"
                  : "bg-background-card border-slate-800"
                  }`}
              >
                <Text
                  className={`text-xs font-bold text-center ${isSelected ? "text-accent-purple" : "text-slate-400"
                    }`}
                >
                  {lvl.title}
                </Text>

                <Text className="text-[10px] text-slate-500 mt-1">
                  {lvl.questionsCount} питань
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={handleStart}
          activeOpacity={0.8}
          className="rounded-2xl bg-primary py-4 items-center shadow-lg active:bg-primary-dark"
        >
          <Text className="font-bold text-white text-base">
            🚀 Розпочати співбесіду
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <AppModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        buttons={modal.buttons}
        onClose={() =>
          setModal((prev) => ({ ...prev, visible: false }))
        }
      />
    </SafeAreaView>
  );
}
