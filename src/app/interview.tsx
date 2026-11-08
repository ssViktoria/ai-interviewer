
import { Ionicons } from "@expo/vector-icons";
import {
  RecordingPresets,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MessageBubble } from "@/components/MessageBubble";
import { useModal } from "@/components/UniversalModal";
import { INTERVIEW_LEVELS, INTERVIEW_TOPICS } from "@/constants/topics";
import { saveInterviewSession } from "@/services/historyStorage";
import { sendChatToOpenRouter } from "@/services/openrouter";
import { buildInterviewSystemPrompt } from "@/services/prompts";
import { parseAIReport } from "@/services/reportParser";
import { speakAssistantMessage, stopSpeech } from "@/services/speech";
import { getInterviewPreferences } from "@/services/storage";
import {
  requestMicrophonePermission,
  resetAudioMode,
  setupAudioModeForRecording,
  transcribeAudioWithWhisper,
} from "@/services/transcription";
import {
  ChatMessage,
  InterviewPreferences,
  InterviewSession,
  OpenRouterAPIMessage,
  VoiceRecordingStatus,
} from "@/types";

export default function InterviewScreen() {
  const router = useRouter();
  const { showConfirm, showAlert } = useModal();

  const params = useLocalSearchParams<{
    topicId: string;
    levelId: string;
  }>();

  const currentTopic =
    INTERVIEW_TOPICS.find((topic) => topic.id === params.topicId) ||
    INTERVIEW_TOPICS[0];

  const currentLevel =
    INTERVIEW_LEVELS.find((level) => level.id === params.levelId) ||
    INTERVIEW_LEVELS[1];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputAnswer, setInputAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  const [prefs, setPrefs] = useState<InterviewPreferences>({
    isVoiceEnabled: true,
    timerSeconds: 90,
    isHapticsEnabled: true,
  });

  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(90);
  const [recordingStatus, setRecordingStatus] =
    useState<VoiceRecordingStatus>("idle");

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 500);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutHandledRef = useRef(false);
  const mountedRef = useRef(true);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cleanupVoiceRecording = useCallback(async () => {
    try {
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }
    } catch {
      // Recorder may already be stopped.
    }

    try {
      await resetAudioMode();
    } catch {
      // Audio mode cleanup is best-effort.
    }
  }, [audioRecorder]);

  const startTimer = useCallback(
    (duration: number) => {
      clearTimer();
      timeoutHandledRef.current = false;

      if (duration <= 0 || isFinished) {
        setTimeLeft(0);
        return;
      }

      setTimeLeft(duration);

      timerRef.current = setInterval(() => {
        setTimeLeft((previous) => {
          if (previous <= 1) {
            clearTimer();

            if (!timeoutHandledRef.current) {
              timeoutHandledRef.current = true;

              if (prefs.isHapticsEnabled) {
                void Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Warning
                );
              }

              showAlert({
                title: "Время вышло",
                message:
                  "Время на ответ закончилось. Отправить ответ о том, что вы не успели?",
                type: "warning",
                confirmText: "Продолжить",
                onConfirm: () => {
                  void handleSendAnswer(
                    "Время на ответ закончилось. Я не успел ответить."
                  );
                },
              });
            }

            return 0;
          }

          return previous - 1;
        });
      }, 1000);
    },
    [clearTimer, isFinished, prefs.isHapticsEnabled, showAlert]
  );

  const initInterview = useCallback(
    async (currentPrefs: InterviewPreferences) => {
      setLoading(true);

      const systemPrompt = buildInterviewSystemPrompt(
        currentTopic,
        currentLevel.title,
        currentLevel.questionsCount
      );

      const initialMessages: OpenRouterAPIMessage[] = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: "Добрий день! Я готовий розпочати співбесіду.",
        },
      ];

      try {
        const reply = await sendChatToOpenRouter({
          messages: initialMessages,
        });

        const firstMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: reply,
          timestamp: Date.now(),
        };

        if (!mountedRef.current) return;

        setMessages([firstMessage]);

        if (currentPrefs.isVoiceEnabled) {
          speakAssistantMessage(reply);
        }

        if (currentPrefs.timerSeconds > 0) {
          startTimer(currentPrefs.timerSeconds);
        }
      } catch (error: unknown) {
        if (!mountedRef.current) return;

        showAlert({
          title: "Ошибка начала интервью",
          message:
            error instanceof Error
              ? error.message
              : "Не удалось начать собеседование.",
          type: "danger",
          confirmText: "Вернуться",
          onConfirm: () => router.replace("/(tabs)"),
        });
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [
      currentTopic,
      currentLevel,
      router,
      showAlert,
      startTimer,
    ]
  );

  useEffect(() => {
    mountedRef.current = true;

    const loadConfig = async () => {
      try {
        const preferences = await getInterviewPreferences();

        if (!mountedRef.current) return;

        setPrefs(preferences);
        setIsVoiceActive(preferences.isVoiceEnabled);
        await initInterview(preferences);
      } catch (error: unknown) {
        if (!mountedRef.current) return;

        showAlert({
          title: "Ошибка настроек",
          message:
            error instanceof Error
              ? error.message
              : "Не удалось загрузить настройки.",
          type: "danger",
          confirmText: "Вернуться",
          onConfirm: () => router.replace("/(tabs)"),
        });
      }
    };

    void loadConfig();

    return () => {
      mountedRef.current = false;
      stopSpeech();
      clearTimer();
      void cleanupVoiceRecording();
    };
  }, [initInterview, clearTimer, cleanupVoiceRecording, router, showAlert]);

  async function handleSendAnswer(customAnswer?: string) {
    const answer = (customAnswer ?? inputAnswer).trim();

    if (
      !answer ||
      loading ||
      isFinished ||
      recordingStatus !== "idle"
    ) {
      return;
    }

    clearTimer();
    stopSpeech();

    if (prefs.isHapticsEnabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setInputAnswer("");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: answer,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setLoading(true);

    const systemPrompt = buildInterviewSystemPrompt(
      currentTopic,
      currentLevel.title,
      currentLevel.questionsCount
    );

    const apiPayload: OpenRouterAPIMessage[] = [
      { role: "system", content: systemPrompt },
      ...updatedMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    try {
      const reply = await sendChatToOpenRouter({
        messages: apiPayload,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
      };

      const conversation = [...updatedMessages, assistantMessage];

      setMessages(conversation);

      if (isVoiceActive) {
        speakAssistantMessage(reply);
      }

      const finalReport =
        reply.includes("ЗАГАЛЬНА ОЦІНКА") ||
        reply.includes("СИЛЬНІ СТОРОНИ") ||
        reply.includes("ОЦІНКА:");

      if (finalReport) {
        setIsFinished(true);
        clearTimer();
        setTimeLeft(0);

        if (prefs.isHapticsEnabled) {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        }

        const sessionId = Date.now().toString();

        const session: InterviewSession = {
          id: sessionId,
          topicId: currentTopic.id,
          topicTitle: currentTopic.title,
          levelId: currentLevel.id,
          levelTitle: currentLevel.title,
          timestamp: Date.now(),
          messages: conversation,
          report: parseAIReport(reply),
        };

        try {
          await saveInterviewSession(session);

          if (mountedRef.current) {
            setSavedSessionId(sessionId);
          }
        } catch (error: unknown) {
          console.error("Ошибка сохранения истории:", error);

          if (mountedRef.current) {
            showAlert({
              title: "Ошибка сохранения",
              message:
                "Интервью завершено, но сохранить историю не удалось.",
              type: "danger",
            });
          }
        }
      } else if (prefs.timerSeconds > 0) {
        startTimer(prefs.timerSeconds);
      }
    } catch (error: unknown) {
      if (mountedRef.current) {
        showAlert({
          title: "Ошибка AI",
          message:
            error instanceof Error
              ? error.message
              : "Не удалось получить ответ от AI.",
          type: "danger",
        });

        if (prefs.timerSeconds > 0 && !isFinished) {
          startTimer(prefs.timerSeconds);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }

  const handleStartVoiceRecording = async () => {
    try {
      if (loading || isFinished) return;

      Keyboard.dismiss();
      stopSpeech();
      clearTimer();

      const hasPermission = await requestMicrophonePermission();

      if (!hasPermission) {
        showAlert({
          title: "Нет доступа к микрофону",
          message:
            "Разрешите доступ к микрофону в настройках устройства.",
          type: "warning",
        });

        if (prefs.timerSeconds > 0) {
          startTimer(prefs.timerSeconds);
        }

        return;
      }

      if (prefs.isHapticsEnabled) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      await setupAudioModeForRecording();
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      setRecordingStatus("recording");
    } catch (error: unknown) {
      try {
        await resetAudioMode();
      } catch {
        // Ignore audio mode reset errors.
      }

      showAlert({
        title: "Ошибка записи",
        message:
          error instanceof Error
            ? error.message
            : "Не удалось активировать микрофон.",
        type: "danger",
      });

      setRecordingStatus("idle");

      if (prefs.timerSeconds > 0) {
        startTimer(prefs.timerSeconds);
      }
    }
  };

  const handleCancelVoiceRecording = async () => {
    try {
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }

      await resetAudioMode();
    } catch {
      // Ignore cancellation cleanup errors.
    }

    setRecordingStatus("idle");

    if (prefs.isHapticsEnabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (prefs.timerSeconds > 0 && !isFinished) {
      startTimer(prefs.timerSeconds);
    }
  };

  const handleStopAndTranscribe = async () => {
    setRecordingStatus("transcribing");

    if (prefs.isHapticsEnabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await audioRecorder.stop();
      await resetAudioMode();

      const fileUri = audioRecorder.uri;

      if (!fileUri) {
        throw new Error("Не удалось получить файл аудиозаписи.");
      }

      const result = await transcribeAudioWithWhisper(fileUri);

      if (result.text?.trim()) {
        setInputAnswer((previous) =>
          previous.trim()
            ? `${previous.trim()} ${result.text.trim()}`
            : result.text.trim()
        );

        if (prefs.isHapticsEnabled) {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        }
      } else {
        showAlert({
          title: "Речь не распознана",
          message:
            "Не удалось распознать речь. Попробуйте говорить громче или ближе к микрофону.",
          type: "warning",
        });
      }
    } catch (error: unknown) {
      try {
        await resetAudioMode();
      } catch {
        // Ignore audio mode reset errors.
      }

      showAlert({
        title: "Ошибка распознавания",
        message:
          error instanceof Error
            ? error.message
            : "Не удалось распознать аудио.",
        type: "danger",
      });
    } finally {
      setRecordingStatus("idle");

      if (prefs.timerSeconds > 0 && !isFinished) {
        startTimer(prefs.timerSeconds);
      }
    }
  };

  const handleRequestHint = () => {
    if (loading || recordingStatus !== "idle" || isFinished) return;

    void handleSendAnswer(
      "[ПІДКАЗКА] Підкажи, будь ласка, з чого почати або дай короткий натяк?"
    );
  };

  const toggleVoice = () => {
    if (isVoiceActive) {
      stopSpeech();
      setIsVoiceActive(false);
      return;
    }

    setIsVoiceActive(true);

    const lastAssistantMessage = [...messages]
      .reverse()
      .find((message) => message.role === "assistant");

    if (lastAssistantMessage) {
      speakAssistantMessage(lastAssistantMessage.content);
    }
  };

  const formatSecondsToMMSS = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleExit = () => {
    stopSpeech();
    clearTimer();

    showConfirm({
      title: "Завершить интервью?",
      message: "Текущий прогресс не будет сохранён.",
      type: "warning",
      confirmText: "Выйти",
      cancelText: "Продолжить",
      onConfirm: () => {
        void cleanupVoiceRecording();
        router.replace("/(tabs)");
      },
    });
  };

  const timerColor =
    timeLeft <= 10
      ? "bg-rose-500"
      : timeLeft <= 30
        ? "bg-amber-500"
        : "bg-primary";

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <View className="flex-row items-center justify-between border-b border-slate-800 bg-slate-900/60 px-5 py-3">
        <View className="mr-2 flex-1">
          <Text
            className="text-base font-bold text-white"
            numberOfLines={1}
          >
            {currentTopic.title}
          </Text>

          <Text className="text-[11px] font-semibold text-accent-purple">
            {currentLevel.title} • {currentLevel.questionsCount} питань
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={toggleVoice}
            className={`rounded-xl border p-2 ${isVoiceActive
                ? "border-primary bg-primary/20"
                : "border-slate-700 bg-slate-800"
              }`}
          >
            <Ionicons
              name={isVoiceActive ? "volume-high" : "volume-mute"}
              size={16}
              color={isVoiceActive ? "#60A5FA" : "#94A3B8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleExit}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5"
          >
            <Text className="text-xs text-slate-300">Выйти</Text>
          </TouchableOpacity>
        </View>
      </View>

      {prefs.timerSeconds > 0 && !isFinished && (
        <View className="flex-row items-center gap-3 border-b border-slate-800/80 bg-slate-900 px-4 py-2">
          <Ionicons
            name="time-outline"
            size={14}
            color={timeLeft <= 10 ? "#F43F5E" : "#94A3B8"}
          />

          <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <View
              className={`h-full rounded-full ${timerColor}`}
              style={{
                width: `${prefs.timerSeconds > 0
                    ? Math.min(
                      100,
                      (timeLeft / prefs.timerSeconds) * 100
                    )
                    : 0
                  }%`,
              }}
            />
          </View>

          <Text
            className={`font-mono text-xs font-bold ${timeLeft <= 10 ? "text-rose-400" : "text-slate-400"
              }`}
          >
            {timeLeft}с
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        className="flex-1"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerClassName="flex-grow p-4"
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListFooterComponent={
            loading ? (
              <View className="my-2 self-start flex-row items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                <ActivityIndicator size="small" color="#60A5FA" />
                <Text className="text-xs italic text-slate-300">
                  Tech Lead оценивает ответ и готовит следующий вопрос...
                </Text>
              </View>
            ) : null
          }
        />

        {!isFinished ? (
          <View className="border-t border-slate-800 bg-background-card p-3">
            <View className="mb-2 flex-row items-center justify-between px-1">
              <TouchableOpacity
                onPress={handleRequestHint}
                disabled={loading || recordingStatus !== "idle"}
                className={`flex-row items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1 ${loading || recordingStatus !== "idle"
                    ? "bg-slate-900 opacity-50"
                    : "bg-slate-800/80"
                  }`}
              >
                <Ionicons
                  name="bulb-outline"
                  size={13}
                  color="#CBD5E1"
                />
                <Text className="text-[11px] font-semibold text-slate-300">
                  Попросить подсказку
                </Text>
              </TouchableOpacity>

              {prefs.timerSeconds > 0 && (
                <Text className="text-[10px] text-slate-500">
                  Осталось:{" "}
                  <Text className="font-bold text-slate-400">
                    {timeLeft} сек
                  </Text>
                </Text>
              )}
            </View>

            {recordingStatus === "recording" ? (
              <View className="flex-row items-center justify-between rounded-2xl border border-rose-500/40 bg-slate-900 px-4 py-2.5">
                <View className="flex-row items-center gap-2">
                  <View className="h-3 w-3 rounded-full bg-rose-500" />

                  <Text className="text-sm font-bold text-rose-400">
                    {formatSecondsToMMSS(
                      Math.round(
                        (recorderState?.durationMillis || 0) / 1000
                      )
                    )}
                  </Text>

                  <Text className="text-xs text-slate-400">
                    Говорите...
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={handleCancelVoiceRecording}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2"
                  >
                    <Text className="text-xs font-semibold text-slate-300">
                      Отмена
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleStopAndTranscribe}
                    className="rounded-xl bg-accent-success px-3.5 py-2"
                  >
                    <Text className="text-xs font-bold text-white">
                      Готово
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : recordingStatus === "transcribing" ? (
              <View className="flex-row items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-slate-900 p-3.5">
                <ActivityIndicator size="small" color="#60A5FA" />
                <Text className="text-xs font-semibold text-primary">
                  Распознаём ответ через Whisper AI...
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={inputAnswer}
                  onChangeText={setInputAnswer}
                  placeholder="Введите или надиктуйте ответ..."
                  placeholderTextColor="#64748B"
                  multiline
                  editable={!loading}
                  className="max-h-24 flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
                />

                <TouchableOpacity
                  onPress={handleStartVoiceRecording}
                  disabled={loading}
                  className={`h-12 w-12 items-center justify-center rounded-2xl border ${loading
                      ? "border-slate-700 bg-slate-800 opacity-50"
                      : "border-primary/40 bg-slate-800"
                    }`}
                >
                  <Ionicons
                    name="mic-outline"
                    size={21}
                    color="#60A5FA"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => void handleSendAnswer()}
                  disabled={loading || !inputAnswer.trim()}
                  className={`items-center justify-center rounded-2xl px-4 py-3.5 ${inputAnswer.trim() && !loading
                      ? "bg-primary"
                      : "bg-slate-800 opacity-50"
                    }`}
                >
                  <Text className="text-sm font-bold text-white">
                    Отправить
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View className="gap-2.5 border-t border-slate-800 bg-background-card p-4">
            {savedSessionId && (
              <TouchableOpacity
                onPress={() =>
                  router.replace({
                    pathname: "/report/[id]",
                    params: { id: savedSessionId },
                  })
                }
                className="items-center rounded-2xl bg-accent-success py-3.5"
              >
                <Text className="text-sm font-bold text-white">
                  Просмотреть подробный отчёт
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => router.replace("/(tabs)")}
              className="items-center rounded-2xl border border-slate-700 bg-slate-800 py-3.5"
            >
              <Text className="text-sm font-semibold text-slate-300">
                На главную
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
