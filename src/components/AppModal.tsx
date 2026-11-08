
import { Modal, Text, TouchableOpacity, View } from "react-native";

export type ModalButton = {
    text: string;
    style?: "default" | "cancel" | "destructive";
    onPress: () => void;
};

type AppModalProps = {
    visible: boolean;
    title: string;
    message: string;
    buttons: ModalButton[];
    onClose: () => void;
};

export function AppModal({
    visible,
    title,
    message,
    buttons,
    onClose,
}: AppModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/70 items-center justify-center px-6">
                <View className="w-full max-w-md rounded-3xl bg-background-card border border-slate-700 p-6">
                    <Text className="text-xl font-bold text-white mb-3">
                        {title}
                    </Text>

                    <Text className="text-sm text-slate-400 leading-6 mb-6">
                        {message}
                    </Text>

                    <View className="flex-row justify-end gap-2 flex-wrap">
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={`${button.text}-${index}`}
                                activeOpacity={0.8}
                                onPress={() => {
                                    onClose();
                                    button.onPress();
                                }}
                                className={`rounded-xl px-4 py-3 ${button.style === "destructive"
                                    ? "bg-red-500/20 border border-red-500/40"
                                    : button.style === "cancel"
                                        ? "bg-slate-800 border border-slate-700"
                                        : "bg-primary"
                                    }`}
                            >
                                <Text
                                    className={`text-sm font-semibold ${button.style === "destructive"
                                        ? "text-red-400"
                                        : "text-white"
                                        }`}
                                >
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
