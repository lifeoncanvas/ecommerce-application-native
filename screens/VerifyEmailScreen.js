import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

const BASE_URL = 'http://10.0.2.2:8080/api/auth';

export default function VerifyEmailScreen({ route, navigation }) {
    const { email } = route.params;
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            Alert.alert("Invalid OTP", "Please enter a 6-digit OTP.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Email verified successfully!");
                navigation.navigate('Login'); // or Home depending on your flow
            } else {
                Alert.alert("Verification Failed", data.message || "Invalid OTP");
            }
        } catch (error) {
            Alert.alert("Network Error", "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert("OTP Resent", "A new code has been sent to your email.");
                setCountdown(60); // Reset countdown
            } else {
                Alert.alert("Error", data.message || "Failed to resend OTP");
            }
        } catch (error) {
            Alert.alert("Network Error", "Could not connect to the server.");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>We've sent a 6-digit verification code to</Text>
            <Text style={styles.emailText}>{email}</Text>

            <TextInput 
                style={styles.input} 
                placeholder="Enter 6-digit code" 
                keyboardType="number-pad" 
                maxLength={6}
                value={otp} 
                onChangeText={setOtp} 
            />

            <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                {countdown > 0 ? (
                    <Text style={styles.countdownText}>Resend in {countdown}s</Text>
                ) : (
                    <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                        {resendLoading ? <ActivityIndicator size="small" color="#4A90E2" /> : <Text style={styles.resendLink}>Resend code</Text>}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
    emailText: { fontSize: 16, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 20, textAlign: 'center', letterSpacing: 5 },
    button: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    resendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    resendText: { color: '#666', fontSize: 16 },
    countdownText: { color: '#999', fontSize: 16 },
    resendLink: { color: '#4A90E2', fontSize: 16, fontWeight: 'bold' }
});
