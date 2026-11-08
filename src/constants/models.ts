import { AIModelOption } from "@/types";

export const AVAILABLE_MODELS: AIModelOption[] = [
    // ==========================================
    // 1. Безкоштовні моделі (Free)
    // ==========================================
    {
        id: "openrouter/free",
        name: "OpenRouter Free Router (Auto)",
        description: "Автоматичний розумний вибір найменш завантаженої безкоштовної моделі (рекомендовано).",
        isFree: true,
        pricing: "Безкоштовно",
        tier: "free",
    },
    {
        id: "nvidia/nemotron-3-ultra-550b-a55b:free",
        name: "NVIDIA Nemotron 3 Ultra 550B",
        description: "Найпотужніша безкоштовна модель для глибоких технічних запитань, аналізу коду та архітектури.",
        isFree: true,
        pricing: "Безкоштовно",
        tier: "free",
    },
    {
        id: "nvidia/nemotron-3.5-lightning:free",
        name: "NVIDIA Nemotron 3.5 Lightning",
        description: "Надшвидка модель від NVIDIA для миттєвих відповідей у режимі реального часу.",
        isFree: true,
        pricing: "Безкоштовно",
        tier: "free",
    },
    {
        id: "cohere/north-mini-code:free",
        name: "Cohere North Mini Code",
        description: "Швидка та точна спеціалізована модель від Cohere для програмування та технічних діалогів.",
        isFree: true,
        pricing: "Безкоштовно",
        tier: "free",
    },

    // ==========================================
    // 2. Економічні платні моделі (Budget Paid)
    // ==========================================
    {
        id: "meta-llama/llama-3.1-8b-instruct",
        name: "Meta: Llama 3.1 8B Instruct",
        description: "Ультра-бюджетна легка модель для швидких інтерв'ю (~$0.05 за 1 млн токенів).",
        isFree: false,
        pricing: "~$0.05 / 1M",
        tier: "budget",
    },
    {
        id: "meta-llama/llama-3.3-70b-instruct",
        name: "Meta: Llama 3.3 70B Instruct",
        description: "Потужна 70B модель рівня GPT-4 при надзвичайно низькій вартості запитів.",
        isFree: false,
        pricing: "~$0.10 / 1M",
        tier: "budget",
    },
    {
        id: "openai/gpt-4o-mini",
        name: "OpenAI: GPT-4o-mini",
        description: "Світовий стандарт швидкості та інтелекту від OpenAI. Без черг та з гарантованою стабільністю.",
        isFree: false,
        pricing: "~$0.15 / 1M",
        tier: "budget",
    },
    {
        id: "deepseek/deepseek-chat",
        name: "DeepSeek: DeepSeek V3",
        description: "Флагманська модель світового рівня для аналізу коду, алгоритмів та архітектури.",
        isFree: false,
        pricing: "~$0.25 / 1M",
        tier: "budget",
    },

    // ==========================================
    // 3. Середній клас (Mid-Tier)
    // ==========================================
    {
        id: "deepseek/deepseek-r1",
        name: "DeepSeek: R1 (Reasoning)",
        description: "Потужна модель поглибленого логічного міркування та архітектурного аналізу.",
        isFree: false,
        pricing: "~$0.70 / 1M",
        tier: "mid",
    },
    {
        id: "anthropic/claude-haiku-4.5",
        name: "Anthropic: Claude Haiku 4.5",
        description: "Швидка, лаконічна та високоінтелектуальна модель від творців Claude.",
        isFree: false,
        pricing: "~$1.00 / 1M",
        tier: "mid",
    },
    {
        id: "openai/o3-mini",
        name: "OpenAI: o3 Mini (Reasoning)",
        description: "Спеціалізована модель логічного мислення від OpenAI для складних інженерних задач.",
        isFree: false,
        pricing: "~$1.10 / 1M",
        tier: "mid",
    },
    {
        id: "anthropic/claude-sonnet-5.5",
        name: "Anthropic: Claude Sonnet 5.5",
        description: "Еталонний баланс інтелекту, якості коду та швидкості для професійних інтерв'ю.",
        isFree: false,
        pricing: "~$2.00 / 1M",
        tier: "mid",
    },
    {
        id: "openai/gpt-4o",
        name: "OpenAI: GPT-4o",
        description: "Головна флагманська універсальна модель OpenAI з найвищою ерудицією.",
        isFree: false,
        pricing: "~$2.50 / 1M",
        tier: "mid",
    },

    // ==========================================
    // 4. Флагмани та преміум (Flagships & Heavyweights)
    // ==========================================
    {
        id: "anthropic/claude-opus-5.5",
        name: "Anthropic: Claude Opus 5.5",
        description: "Преміум-модель від Anthropic для глибокої експертної оцінки та складних систем.",
        isFree: false,
        pricing: "~$4.00 / 1M",
        tier: "flagship",
    },
    {
        id: "anthropic/claude-fable-5.1",
        name: "Anthropic: Claude Fable 5.1",
        description: "Високоінтелектуальна флагманська нейромережа для нестандартних технічних діалогів.",
        isFree: false,
        pricing: "~$10.00 / 1M",
        tier: "flagship",
    },
    {
        id: "openai/o1",
        name: "OpenAI: o1 (Flagship Reasoning)",
        description: "Найпотужніша reasoning-модель у світі для найскладніших алгоритмічних задач.",
        isFree: false,
        pricing: "~$15.00 / 1M",
        tier: "flagship",
    },
    {
        id: "anthropic/claude-opus-4.1",
        name: "Anthropic: Claude Opus 4.1",
        description: "Легендарна високоточна модель для детального аналізу рішень Senior-рівня.",
        isFree: false,
        pricing: "~$15.00 / 1M",
        tier: "flagship",
    },
];

export const DEFAULT_MODEL = "openrouter/free";