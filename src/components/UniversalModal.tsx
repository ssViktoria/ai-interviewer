import { Ionicons } from "@expo/vector-icons";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export type ModalType = "info" | "success" | "warning" | "danger";

export interface ModalButton {
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
}

export interface ModalOptions {
    title: string;
    message: string;
    type?: ModalType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
    buttons?: ModalButton[];
}

interface ModalContextType {
    showModal: (options: ModalOptions) => void;
    showAlert: (
        titleOrOptions: string | ModalOptions,
        message?: string,
        type?: ModalType,
        onOk?: () => void
    ) => void;
    showConfirm: (options: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        type?: ModalType;
        onConfirm: () => void | Promise<void>;
        onCancel?: () => void;
    }) => void;
    hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalState, setModalState] = useState<{
        visible: boolean;
        options: ModalOptions;
    }>({
        visible: false,
        options: { title: "", message: "", type: "info" },
    });

    const hideModal = useCallback(() => {
        setModalState((prev) => ({ ...prev, visible: false }));
    }, []);

    const showModal = useCallback((options: ModalOptions) => {
        setModalState({
            visible: true,
            options: {
                type: "info",
                ...options,
            },
        });
    }, []);

    const showAlert = useCallback(
        (
            titleOrOptions: string | ModalOptions,
            message?: string,
            type: ModalType = "info",
            onOk?: () => void
        ) => {
            if (typeof titleOrOptions === "object") {
                showModal({
                    type: "info",
                    confirmText: "Зрозуміло",
                    ...titleOrOptions,
                });
            } else {
                showModal({
                    title: titleOrOptions,
                    message: message || "",
                    type,
                    confirmText: "Зрозуміло",
                    onConfirm: onOk,
                });
            }
        },
        [showModal]
    );

    const showConfirm = useCallback(
        (options: {
            title: string;
            message: string;
            confirmText?: string;
            cancelText?: string;
            type?: ModalType;
            onConfirm: () => void | Promise<void>;
            onCancel?: () => void;
        }) => {
            showModal({
                title: options.title,
                message: options.message,
                type: options.type || "warning",
                confirmText: options.confirmText || "Підтвердити",
                cancelText: options.cancelText || "Скасувати",
                onConfirm: options.onConfirm,
                onCancel: options.onCancel,
            });
        },
        [showModal]
    );

    const { visible, options } = modalState;
    const modalType = options.type || "info";

    // Налаштування кольорів та іконок залежно від типу
    const getTypeConfig = (type: ModalType) => {
        switch (type) {
            case "success":
                return {
                    icon: "checkmark-circle" as const,
                    iconColor: "#10B981",
                    iconBg: "bg-emerald-500/20",
                    iconBorder: "border-emerald-500/30",
                    btnColor: "bg-emerald-600 active:bg-emerald-700",
                };
            case "warning":
                return {
                    icon: "alert-circle" as const,
                    iconColor: "#F59E0B",
                    iconBg: "bg-amber-500/20",
                    iconBorder: "border-amber-500/30",
                    btnColor: "bg-amber-600 active:bg-amber-700",
                };
            case "danger":
                return {
                    icon: "warning" as const,
                    iconColor: "#EF4444",
                    iconBg: "bg-rose-500/20",
                    iconBorder: "border-rose-500/30",
                    btnColor: "bg-rose-600 active:bg-rose-700",
                };
            case "info":
            default:
                return {
                    icon: "information-circle" as const,
                    iconColor: "#60A5FA",
                    iconBg: "bg-primary/20",
                    iconBorder: "border-primary/30",
                    btnColor: "bg-primary active:bg-primary-dark",
                };
        }
    };

    const typeConfig = getTypeConfig(modalType);

    const handleConfirm = async () => {
        hideModal();
        if (options.onConfirm) {
            await options.onConfirm();
        }
    };

    const handleCancel = () => {
        hideModal();
        if (options.onCancel) {
            options.onCancel();
        }
    };

    return (
        <ModalContext.Provider value={{ showModal, showAlert, showConfirm, hideModal }}>
            {children}

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={handleCancel}
            >
                <Pressable
                    onPress={handleCancel}
                    className="flex-1 bg-black/75 items-center justify-center p-5"
                    style={Platform.OS === "web" ? ({ backdropFilter: "blur(4px)" } as any) : undefined}
                >
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl items-center"
                    >
                        {/* Іконка статусу */}
                        <View
                            className={`w-14 h-14 rounded-2xl items-center justify-center border mb-4 ${typeConfig.iconBg} ${typeConfig.iconBorder}`}
                        >
                            <Ionicons name={typeConfig.icon} size={30} color={typeConfig.iconColor} />
                        </View>

                        {/* Заголовок */}
                        <Text className="text-lg font-extrabold text-white text-center mb-2">
                            {options.title}
                        </Text>

                        {/* Опис / повідомлення */}
                        <Text className="text-xs text-slate-300 text-center leading-relaxed mb-6">
                            {options.message}
                        </Text>

                        {/* Кнопки дій */}
                        {options.buttons && options.buttons.length > 0 ? (
                            <View className="w-full gap-2.5">
                                {options.buttons.map((btn, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => {
                                            hideModal();
                                            btn.onPress?.();
                                        }}
                                        className={`w-full py-3 rounded-2xl items-center justify-center ${btn.style === "destructive"
                                                ? "bg-rose-600 active:bg-rose-700"
                                                : btn.style === "cancel"
                                                    ? "bg-slate-800 border border-slate-700 active:bg-slate-700"
                                                    : "bg-primary active:bg-primary-dark"
                                            }`}
                                    >
                                        <Text
                                            className={`text-xs font-bold ${btn.style === "cancel" ? "text-slate-300" : "text-white"
                                                }`}
                                        >
                                            {btn.text}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : options.cancelText ? (
                            <View className="w-full flex-row gap-3">
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    className="flex-1 py-3 rounded-2xl bg-slate-800 border border-slate-700 items-center justify-center active:bg-slate-700"
                                >
                                    <Text className="text-xs font-semibold text-slate-300">
                                        {options.cancelText}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    className={`flex-1 py-3 rounded-2xl items-center justify-center shadow-lg ${typeConfig.btnColor}`}
                                >
                                    <Text className="text-xs font-bold text-white">
                                        {options.confirmText || "OK"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handleConfirm}
                                className={`w-full py-3 rounded-2xl items-center justify-center shadow-lg ${typeConfig.btnColor}`}
                            >
                                <Text className="text-xs font-bold text-white">
                                    {options.confirmText || "Зрозуміло"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </ModalContext.Provider>
    );
}

export function useModal(): ModalContextType {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}