import { speakAssistantMessage } from "@/services/speech";
import { ChatMessage } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface MessageBubbleProps {
    message: ChatMessage;
    isVoiceEnabled?: boolean;
}

export function MessageBubble({ message, isVoiceEnabled = true }: MessageBubbleProps) {
    const isUser = message.role === "user";

    // Розбиваємо текст на звичайні абзаци та блоки коду
    const renderFormattedContent = (content: string) => {
        const parts = content.split(/(```[\s\S]*?```)/g);

        return parts.map((part, index) => {
            if (part.startsWith("```") && part.endsWith("```")) {
                // Вилучаємо мову та сам код
                const lines = part.slice(3, -3).trim().split("\n");
                const language = lines[0].match(/^[a-z0-9_-]+$/i) ? lines[0] : "";
                const codeContent = language ? lines.slice(1).join("\n") : lines.join("\n");

                return (
                    <View
                        key={index}
                        className="my-2 rounded-xl bg-slate-950 border border-slate-700/80 p-3 overflow-hidden"
                    >
                        {language ? (
                            <View className="flex-row justify-between items-center border-b border-slate-800 pb-1.5 mb-2">
                                <Text className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                                    {language}
                                </Text>
                                <Text className="text-[10px] text-slate-500">Код</Text>
                            </View>
                        ) : null}
                        <Text className="font-mono text-xs text-sky-300 leading-relaxed">
                            {codeContent}
                        </Text>
                    </View>
                );
            }

            return (
                <Text
                    key={index}
                    className={`text-sm leading-relaxed ${isUser ? "text-white" : "text-slate-100"
                        }`}
                >
                    {part}
                </Text>
            );
        });
    };

    return (
        <View className={`my-2 flex-row ${isUser ? "justify-end" : "justify-start"}`}>
            <View
                className={`max-w-[88%] rounded-3xl px-4 py-3 shadow-md ${isUser
                    ? "bg-primary rounded-br-none"
                    : "bg-background-card border border-slate-700/80 rounded-bl-none"
                    }`}
            >
                {/* Заголовок автора повідомлення */}
                <View className="flex-row items-center justify-between mb-1">
                    <Text
                        className={`text-[10px] font-bold uppercase tracking-wider ${isUser ? "text-blue-200" : "text-accent-purple"
                            }`}
                    >
                        {isUser ? "Ви (Кандидат)" : "&#x1f916; Tech Lead"}
                    </Text>

                    {!isUser && isVoiceEnabled && (
                        <TouchableOpacity
                            onPress={() => speakAssistantMessage(message.content)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            className="ml-2 opacity-70 active:opacity-100"
                        >
                            <Ionicons name="volume-medium-outline" size={15} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Тіло повідомлення з підтримкою коду */}
                {renderFormattedContent(message.content)}

                {/* Час */}
                <Text
                    className={`text-[9px] mt-1.5 text-right ${isUser ? "text-blue-200/70" : "text-slate-400"
                        }`}
                >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </Text>
            </View>
        </View >
    );
}