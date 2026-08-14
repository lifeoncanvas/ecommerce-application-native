import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

const BASE_URL = 'http://10.0.2.2:8080/api/auth';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Reset Password
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert("Success", "Password reset code sent to your email.");
                setStep(2);
            } else {
                Alert.alert("Error", data.message || "Failed to send reset code.");
            }
        } catch (error) {
            Alert.alert("Network Error", "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) {
            Alert.alert("Error", "Please enter the OTP and a new password.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: otp, newPassword })
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert("Success", "Password reset successfully! You can now log in.");
                navigation.navigate('Login');
            } else {
                Alert.alert("Error", data.message || "Failed to reset password.");
            }
        } catch (error) {
            Alert.alert("Network Error", "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>
            
            {step === 1 ? (
                <>
                    <Text style={styles.subtitle}>Enter your email to receive a reset code.</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Email" 
                        keyboardType="email-address" 
                        autoCapitalize="none"
                        value={email} 
                        onChangeText={setEmail} 
                    />
                    <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Code</Text>}
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={styles.subtitle}>Enter the 6-digit code and your new password.</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="6-Digit OTP" 
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp} 
                        onChangeText={setOtp} 
                    />
                    <TextInput 
                        style={styles.input} 
                        placeholder="New Password" 
                        secureTextEntry
                        value={newPassword} 
                        onChangeText={setNewPassword} 
                    />
                    <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
                    </TouchableOpacity>
                </>
            )}

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
    button: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    backButton: { marginTop: 20, alignItems: 'center' },
    backButtonText: { color: '#4A90E2', fontSize: 16 }
});
