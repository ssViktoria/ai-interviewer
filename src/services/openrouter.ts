import { AVAILABLE_MODELS, DEFAULT_MODEL } from "@/constants/models";
import { OpenRouterAPIMessage } from "@/types";
import { OpenRouter } from "@openrouter/sdk";
import { getApiKey, getSelectedModel } from "./storage";

export interface SendChatOptions {
    messages: OpenRouterAPIMessage[];
    temperature?: number;
    maxTokens?: number;
}

export async function sendChatToOpenRouter({
    messages,
    temperature = 0.7,
    maxTokens = 800,
}: SendChatOptions): Promise<string> {
    const apiKey = await getApiKey();

    if (!apiKey) {
        throw new Error("API-ключ відсутній. Будь ласка, вкажіть ключ у налаштуваннях.");
    }

    const savedModel = await getSelectedModel();
    const validModelIds = AVAILABLE_MODELS.map((m) => m.id);
    const model = savedModel && validModelIds.includes(savedModel) ? savedModel : DEFAULT_MODEL;

    const openRouter = new OpenRouter({
        apiKey: apiKey,
        httpReferer: "https://github.com/react-native-lessons",
        appTitle: "React Native AI Mock Interviewer",
    });

    try {
        const response = await openRouter.chat.send({
            chatRequest: {
                model: model,
                messages: messages,
                temperature: temperature,
                maxTokens: maxTokens,
                stream: false,
            },
        });

        if (!("choices" in response) || !response.choices || response.choices.length === 0) {
            throw new Error("Модель повернула пусту відповідь.");
        }

        const choice = response.choices[0];
        let rawContent = "";

        if (typeof choice.message?.content === "string") {
            rawContent = choice.message.content;
        } else if (Array.isArray(choice.message?.content)) {
            rawContent = (choice.message.content as Array<{ text?: string }>)
                .map((item) => item.text || "")
                .join("");
        }

        // Видаляємо теги <think>...</think> та внутрішні роздуми моделі
        rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "");
        rawContent = rawContent.replace(/^<think>[\s\S]*$/gi, "");

        const cleanReply = rawContent.trim();
        if (!cleanReply) {
            throw new Error("Модель повернула пусту відповідь.");
        }

        return cleanReply;
    } catch (error: any) {
        if (error?.status === 401 || error?.statusCode === 401) {
            throw new Error("Невірний API-ключ OpenRouter. Перевірте ключ у налаштуваннях.");
        } else if (error?.status === 429 || error?.statusCode === 429) {
            throw new Error("Перевищено ліміт запитів до безкоштовної моделі. Спробуйте знову через хвилину.");
        }
        throw new Error(error?.message || "Помилка при зверненні до OpenRouter через SDK.");
    }
}