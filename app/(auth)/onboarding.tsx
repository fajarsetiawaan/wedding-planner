import React, { useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    useWindowDimensions,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
    useSharedValue,
    withTiming,
    FadeInDown,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const ONBOARDING_DATA = [
    {
        id: "1",
        title: "Every love deserves a beautiful story.",
        subtitle: "Plan every detail with ease and joy.",
        icon: "heart",
        iconColor: Colors.roseDark, // Rose Dark
    },
    {
        id: "2",
        title: "Plan your big day effortlessly.",
        subtitle: "Manage timeline, budget, and vendors in one place.",
        icon: "calendar",
        iconColor: Colors.gold, // Gold
    },
    {
        id: "3",
        title: "Plan together with your partner.",
        subtitle: "Invite your fiancé and family to join the journey.",
        icon: "users",
        iconColor: Colors.dustyBlue, // Dusty Blue
    },
    {
        id: "4",
        title: "Everything you need, in one app.",
        subtitle: "Start your journey today.",
        features: [
            { icon: "check-circle", text: "Wedding Checklist" },
            { icon: "pie-chart", text: "Budget Tracker" },
            { icon: "clock", text: "Timeline Reminder" },
            { icon: "star", text: "Trusted Vendors" },
        ],
        isTeaser: true,
    },
];

export default function OnboardingScreen() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            try {
                flatListRef.current?.scrollToIndex({
                    index: currentIndex + 1,
                    animated: true,
                });
            } catch (error) {
                // Ignore error if item is not rendered yet, shouldn't happen with our config
                console.warn(error);
            }
        } else {
            router.push("/(auth)/login" as any);
        }
    };

    const handleSkip = () => {
        router.push("/(auth)/login" as any);
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems[0]) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        return (
            <View style={[styles.slide, { width }]}>
                <Animated.View
                    entering={FadeInDown.delay(300).duration(800)}
                    style={styles.contentContainer}
                >
                    {item.isTeaser ? (
                        <View style={styles.teaserContainer}>
                            <View style={styles.iconCircle}>
                                <Feather name="layers" size={48} color={Colors.roseDark} />
                            </View>
                            <Text style={styles.title}>{item.title}</Text>
                            <View style={styles.featureList}>
                                {item.features.map((feature: any, i: number) => (
                                    <View key={i} style={styles.featureItem}>
                                        <Feather
                                            name={feature.icon as any}
                                            size={24}
                                            color={Colors.roseDark}
                                        />
                                        <Text style={styles.featureText}>{feature.text}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <>
                            <View style={[styles.illustrationPlaceholder]}>
                                <Feather name={item.icon as any} size={80} color={item.iconColor} />
                            </View>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.subtitle}>{item.subtitle}</Text>
                        </>
                    )}
                </Animated.View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={ONBOARDING_DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewConfig}
                scrollEventThrottle={32}
                getItemLayout={(_, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
                onScrollToIndexFailed={(info) => {
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                        flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                    });
                }}
            />

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 24, 48) }]}>
                <View style={styles.paginationContainer}>
                    {ONBOARDING_DATA.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                currentIndex === i ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.buttonContainer}>
                    {currentIndex < ONBOARDING_DATA.length - 1 && (
                        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.nextButton,
                            currentIndex === ONBOARDING_DATA.length - 1 && styles.startButton,
                        ]}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextText}>
                            {currentIndex === ONBOARDING_DATA.length - 1
                                ? "Start Planning Free"
                                : "Next"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.cream, // Pastel rose / ivory base
    },
    slide: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    contentContainer: {
        alignItems: "center",
        width: "100%",
    },
    illustrationPlaceholder: {
        width: 200,
        height: 200,
        backgroundColor: "#FFFFFF",
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    title: {
        fontFamily: "PlayfairDisplay_600SemiBold",
        fontSize: 28,
        color: Colors.charcoal,
        textAlign: "center",
        marginBottom: 16,
        lineHeight: 36,
    },
    subtitle: {
        fontFamily: "Lora_400Regular",
        fontSize: 16,
        color: Colors.warmGray,
        textAlign: "center",
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    teaserContainer: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 32,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 24,
        elevation: 10,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.cream,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    featureList: {
        width: "100%",
        marginTop: 24,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    featureText: {
        fontFamily: "Lora_500Medium",
        fontSize: 16,
        color: "#4A5568",
        marginLeft: 16,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        width: 24,
        backgroundColor: Colors.roseDark, // Rose Dark
    },
    inactiveDot: {
        width: 8,
        backgroundColor: Colors.lightGray, // Slate 200
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "flex-end", // Align to right by default
        alignItems: "center",
    },
    skipButton: {
        position: "absolute",
        left: 0,
        padding: 12,
    },
    skipText: {
        fontFamily: "Lora_600SemiBold",
        fontSize: 16,
        color: "#A0AEC0",
    },
    nextButton: {
        backgroundColor: Colors.roseDark,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 30,
        shadowColor: Colors.roseDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    startButton: {
        width: "100%", // Full width for the last slide
        alignItems: "center",
    },
    nextText: {
        fontFamily: "Lora_600SemiBold",
        fontSize: 16,
        color: "#FFFFFF",
    },
});
