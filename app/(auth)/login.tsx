import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useWedding } from "@/lib/wedding-context";

export default function LoginScreen() {
    const router = useRouter();
    const { setWeddingId } = useWedding();

    const handleBypassLogin = () => {
        // For now, we are bypassing actual authentication
        // and just setting a mock wedding ID to enter the app
        setWeddingId("mock-wedding-id");
        router.replace("/(tabs)");
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{
                    uri: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
                }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.9)"]}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Start planning your perfect day.</Text>
                            <Text style={styles.subtitle}>
                                Join thousands of couples using EverAfter.
                            </Text>
                        </View>

                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleBypassLogin}
                            >
                                <Feather
                                    name="mail"
                                    size={20}
                                    color="#2D3748"
                                    style={styles.buttonIcon}
                                />
                                <Text style={styles.primaryButtonText}>
                                    Continue with Email
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleBypassLogin}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Sign up with Google
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.loginLinkContainer}>
                                <Text style={styles.loginText}>Already have an account? </Text>
                                <TouchableOpacity onPress={handleBypassLogin}>
                                    <Text style={styles.loginLink}>Log in</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    backgroundImage: {
        flex: 1,
        width: "100%",
    },
    gradient: {
        flex: 1,
        justifyContent: "flex-end",
        paddingHorizontal: 24,
        paddingBottom: 48,
    },
    content: {
        width: "100%",
    },
    headerContainer: {
        marginBottom: 48,
    },
    title: {
        fontFamily: "PlayfairDisplay_600SemiBold",
        fontSize: 40,
        color: "#FFFFFF",
        lineHeight: 48,
        marginBottom: 16,
    },
    subtitle: {
        fontFamily: "Lora_400Regular",
        fontSize: 18,
        color: "#E2E8F0",
        lineHeight: 28,
    },
    actionsContainer: {
        gap: 16,
    },
    primaryButton: {
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        fontFamily: "Lora_600SemiBold",
        fontSize: 16,
        color: "#2D3748",
    },
    buttonIcon: {
        marginRight: 12,
    },
    secondaryButton: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    secondaryButtonText: {
        fontFamily: "Lora_600SemiBold",
        fontSize: 16,
        color: "#FFFFFF",
    },
    loginLinkContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
    },
    loginText: {
        fontFamily: "Lora_400Regular",
        fontSize: 14,
        color: "#CBD5E1",
    },
    loginLink: {
        fontFamily: "Lora_600SemiBold",
        fontSize: 14,
        color: "#FFFFFF",
        textDecorationLine: "underline",
    },
});
