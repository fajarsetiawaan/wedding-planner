import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withDelay,
} from "react-native-reanimated";

export default function SplashScreen() {
    const router = useRouter();
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Fade in animation
        opacity.value = withTiming(1, { duration: 800 });

        // Transition to onboarding after 1.5s
        const timer = setTimeout(() => {
            // Small fade out before transitioning
            opacity.value = withTiming(0, { duration: 300 });
            setTimeout(() => {
                router.replace("/(auth)/onboarding");
            }, 300);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, animatedStyle]}>
                <Text style={styles.logo}>✨</Text>
                <Text style={styles.title}>EverAfter</Text>
                <Text style={styles.subtitle}>Your wedding, perfectly planned.</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FDF8F5", // Pastel rose/blush background
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        alignItems: "center",
    },
    logo: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontFamily: "PlayfairDisplay_600SemiBold",
        fontSize: 36,
        color: "#2D3748",
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: "Lora_400Regular",
        fontSize: 16,
        color: "#718096",
    },
});
