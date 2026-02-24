import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function AuthLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="splash" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="login" />
            </Stack>
        </>
    );
}
