import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, useWindowDimensions, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import { authApi } from '../../src/api/endpoints';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { Ionicons } from '@expo/vector-icons';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    offlineAccess: false,
  });
}

// ─── Shared: web input style ────────────────────────────────────────────────
const inputStyle = {
  width: '100%' as const,
  background: '#F7F9FC',
  borderWidth: 1.5,
  borderColor: '#DDE3EF',
  borderRadius: 10,
  paddingVertical: 12,
  paddingLeft: 40,
  paddingRight: 40,
  fontSize: 15,
  color: '#122019',
  letterSpacing: 4,
};

// ─── Shared: error banner ────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View style={{
      backgroundColor: '#FFF2F2', borderWidth: 1, borderColor: '#FFC5C5', borderRadius: 10,
      paddingVertical: 11, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18,
    }}>
      <Ionicons name="alert-circle" size={15} color="#B91C1C" />
      <Text style={{ fontSize: 13, color: '#B91C1C', flex: 1 }}>{message}</Text>
    </View>
  );
}

// ─── PIN field with icon + reveal toggle ────────────────────────────────────
function PinField({
  value, onChangeText, focused, onFocus, onBlur, show, onToggleShow,
}: {
  value: string;
  onChangeText: (v: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <View>
      <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A5568', marginBottom: 7, letterSpacing: 1, textTransform: 'uppercase' }}>
        Staff PIN
      </Text>
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', left: 13, zIndex: 1 }}>
          <Ionicons name="lock-closed" size={15} color="#A0AEC0" />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="••••"
          placeholderTextColor="#C3CBDA"
          keyboardType="numeric"
          secureTextEntry={!show}
          maxLength={6}
          style={[
            inputStyle,
            { borderColor: focused ? '#0F6B4C' : '#DDE3EF', backgroundColor: focused ? '#FFFFFF' : '#F7F9FC' },
          ]}
        />
        <TouchableOpacity
          onPress={onToggleShow}
          style={{ position: 'absolute', right: 12, padding: 2 }}
        >
          <Ionicons name={show ? 'eye-off' : 'eye'} size={16} color="#A0AEC0" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Submit button ────────────────────────────────────────────────────────────
function SubmitBtn({ label, disabled, loading, onPress }: { label: string; disabled: boolean; loading: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
      style={{
        marginTop: 4, width: '100%', paddingVertical: 14, borderRadius: 11,
        alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
        background: disabled ? '#A9C9BB' : 'linear-gradient(135deg, #0D3B2E 0%, #16794F 100%)',
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(13,59,46,0.35)',
      } as any}
    >
      {loading && <ActivityIndicator size="small" color="#fff" />}
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 }}>
        {loading ? `${label}…` : label}
      </Text>
    </TouchableOpacity>
  );
}

export default function LoginScreen() {
  const now = new Date();
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && width >= 900;
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loginMode, setLoginMode] = useState<'pin' | 'mobile' | 'google'>('mobile');
  
  // PIN login state
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);
  
  // Mobile + password login state
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const completeLogin = async (response: any) => {
    const user = response.data.data.user;
    const token = response.data.data.token;
    await setAuth(user, token);
    router.replace('/(tabs)/dashboard');
  };

  // Web-only: Google Identity Services renders the official Gmail button and
  // returns an ID token credential, which we hand to the same /auth/google API.
  React.useEffect(() => {
    if (Platform.OS !== 'web' || loginMode !== 'google') return;
    if (!WEB_CLIENT_ID || WEB_CLIENT_ID.includes('your_google_web_client_id')) return;

    let cancelled = false;
    const handleCredential = async (resp: any) => {
      if (!resp?.credential) return;
      try {
        setLoading(true);
        const response = await authApi.googleSignIn(resp.credential);
        await completeLogin(response);
      } catch {
        Toast.show({ type: 'error', text1: 'Sign in failed', text2: 'Please try again' });
      } finally {
        setLoading(false);
      }
    };

    const renderButton = () => {
      const g = (window as any).google;
      const el = typeof document !== 'undefined' ? document.getElementById('gsi-button-container') : null;
      if (cancelled || !g?.accounts?.id || !el) return;
      g.accounts.id.initialize({ client_id: WEB_CLIENT_ID, callback: handleCredential });
      el.innerHTML = '';
      g.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 320, text: 'continue_with', shape: 'pill' });
    };

    const existing = document.getElementById('google-gsi-script') as HTMLScriptElement | null;
    if ((window as any).google?.accounts?.id) {
      renderButton();
    } else if (existing) {
      existing.addEventListener('load', renderButton, { once: true });
    } else {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = renderButton;
      document.body.appendChild(script);
    }

    return () => { cancelled = true; };
  }, [loginMode]);

  const handleGoogleSignIn = async () => {
    try {
      if (Platform.OS === 'web') {
        Toast.show({
          type: 'info',
          text1: 'Google sign-in is not enabled for web',
          text2: 'Use mobile number/password on web, or use mobile app for Google sign-in',
        });
        return;
      }

      if (!WEB_CLIENT_ID || WEB_CLIENT_ID.includes('your_google_web_client_id')) {
        Toast.show({
          type: 'error',
          text1: 'Google client ID missing',
          text2: 'Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in mobile/.env for Google sign-in',
        });
        return;
      }

      setLoading(true);

      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      
      const response = await authApi.googleSignIn(idToken!);
      await completeLogin(response);
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Toast.show({ type: 'error', text1: 'Sign in failed', text2: 'Please try again' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMobilePasswordLogin = async () => {
    setError('');
    if (!mobile || !password) {
      setError('Enter both mobile number and password');
      return;
    }
    try {
      setLoading(true);
      const response = await authApi.mobilePasswordLogin(mobile, password);
      await completeLogin(response);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Invalid mobile number or password');
      } else if (err?.request || err?.code === 'ERR_NETWORK') {
        setError('Cannot reach the server. Check the API is running.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async () => {
    setError('');
    if (pin.length < 4) {
      setError('Enter your 4 to 6 digit staff PIN.');
      return;
    }
    try {
      setLoading(true);
      const response = await authApi.pinLogin(pin);
      await completeLogin(response);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Invalid PIN. Check with your farm administrator.');
      } else if (err?.request || err?.code === 'ERR_NETWORK') {
        setError('Cannot reach the server. Check the API is running.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ minHeight: '100%' }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, minHeight: '100%', flexDirection: isWideWeb ? 'row' : 'column' }}>

            {/* ═══════════════ LEFT BRAND PANEL ═══════════════ */}
            <View
              style={{
                width: isWideWeb ? '52%' : '100%',
                minHeight: isWideWeb ? undefined : 320,
                position: 'relative',
                overflow: 'hidden',
                paddingVertical: 48,
                paddingHorizontal: 52,
                background: 'linear-gradient(160deg, #04140E 0%, #082A20 45%, #0D3B2E 100%)',
              } as any}
            >
              {/* ambient glow blobs */}
              <View
                pointerEvents="none"
                style={{ position: 'absolute', top: -80, left: -60, width: 460, height: 460, borderRadius: 999, backgroundColor: 'rgba(16,185,129,0.16)', filter: 'blur(70px)' } as any}
              />
              <View
                pointerEvents="none"
                style={{ position: 'absolute', bottom: -100, right: -80, width: 420, height: 420, borderRadius: 999, backgroundColor: 'rgba(52,211,153,0.10)', filter: 'blur(80px)' } as any}
              />
              {/* dot-grid texture */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)',
                  backgroundSize: '26px 26px',
                  opacity: 0.5,
                } as any}
              />
              {/* right edge separator */}
              {isWideWeb && (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute', top: 0, bottom: 0, right: 0, width: 2,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(52,211,153,0.35) 30%, rgba(250,204,21,0.2) 70%, transparent 100%)',
                  } as any}
                />
              )}

              <View style={{ flex: 1 }}>
                {/* Logo row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 44 }}>
                  <View style={{ backgroundColor: '#fff', borderRadius: 12, width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 26 }}>🐄</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>
                      Farm Operations Suite
                    </Text>
                    <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 2 }}>
                      Dairy Farm Manager
                    </Text>
                  </View>
                </View>

                {/* Value proposition */}
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5, lineHeight: 40 }}>
                  Professional Milk Delivery Management for Modern Farms
                </Text>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 22, marginTop: 14, maxWidth: 420 }}>
                  Track deliveries, invoices, payments, breeding, and herd health from one business-ready dashboard.
                </Text>

                {/* Stats */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 32 }}>
                  {[
                    { v: '20+', l: 'Active Customers' },
                    { v: 'Daily', l: 'Route Tracking' },
                    { v: 'Monthly', l: 'Invoice Cycle' },
                  ].map((s) => (
                    <View key={s.l} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center' }}>
                      <Text style={{ fontSize: 17, fontWeight: '800', color: '#4ADE9A', letterSpacing: -0.3 }}>{s.v}</Text>
                      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3, fontWeight: '500', textAlign: 'center' }}>{s.l}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 32 }}>
                © {now.getFullYear()} Dairy Farm Manager. All rights reserved.
              </Text>
            </View>

            {/* ═══════════════ RIGHT SIGN-IN PANEL ═══════════════ */}
            <View
              style={{
                width: isWideWeb ? '48%' : '100%',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 48,
                paddingHorizontal: 32,
                backgroundColor: '#F4F6FB',
              }}
            >
              <View style={{ width: '100%', maxWidth: 400 }}>

                {/* badge */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: 'rgba(15,107,76,0.08)', borderWidth: 1, borderColor: 'rgba(15,107,76,0.16)', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 14, marginBottom: 18 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0F6B4C' }} />
                  <Text style={{ fontSize: 11, color: '#0F6B4C', fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                    Secure Sign In
                  </Text>
                </View>

                <Text style={{ fontSize: 26, fontWeight: '800', color: '#0D2A20', letterSpacing: -0.5, lineHeight: 32 }}>
                  Welcome back
                </Text>
                <Text style={{ fontSize: 13, color: '#6B7A99', marginTop: 8, lineHeight: 19 }}>
                  Sign in to the <Text style={{ fontWeight: '700', color: '#0D2A20' }}>Dairy Farm Manager</Text> platform to manage deliveries, herd health and billing.
                </Text>

                {/* Login mode tabs */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                  {(['mobile', 'pin', 'google'] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => { setLoginMode(mode); setError(''); }}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 10,
                        alignItems: 'center',
                        backgroundColor: loginMode === mode ? '#0F6B4C' : 'rgba(15,107,76,0.1)',
                        borderWidth: 1,
                        borderColor: loginMode === mode ? '#0F6B4C' : 'rgba(15,107,76,0.2)',
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: loginMode === mode ? '#fff' : '#0F6B4C', textTransform: 'capitalize' }}>
                        {mode === 'pin' ? 'PIN' : mode === 'mobile' ? 'Mobile' : 'Gmail'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* form card */}
                <View style={{
                  backgroundColor: '#fff', borderRadius: 18, padding: 32, marginTop: 24,
                  boxShadow: '0 4px 24px rgba(5,40,25,0.08), 0 1px 4px rgba(5,40,25,0.05)',
                  border: '1px solid rgba(15,107,76,0.1)',
                } as any}>
                  <ErrorBanner message={error} />

                  {loginMode === 'pin' && (
                    <>
                      <PinField
                        value={pin}
                        onChangeText={(v) => { setPin(v); if (error) setError(''); }}
                        focused={pinFocused}
                        onFocus={() => setPinFocused(true)}
                        onBlur={() => setPinFocused(false)}
                        show={showPin}
                        onToggleShow={() => setShowPin((v) => !v)}
                      />
                      <Text style={{ fontSize: 11, color: '#9BA8C0', marginTop: 10, fontStyle: 'italic' }}>
                        Forgot your PIN? Contact your farm administrator.
                      </Text>
                      <View style={{ marginTop: 18 }}>
                        <SubmitBtn
                          label="Access Dashboard"
                          disabled={loading || pin.length < 4}
                          loading={loading}
                          onPress={handlePinLogin}
                        />
                      </View>
                    </>
                  )}

                  {loginMode === 'mobile' && (
                    <>
                      <View style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A5568', marginBottom: 7, letterSpacing: 1, textTransform: 'uppercase' }}>
                          Mobile Number
                        </Text>
                        <TextInput
                          value={mobile}
                          onChangeText={(v) => { setMobile(v); if (error) setError(''); }}
                          placeholder="9876543210"
                          placeholderTextColor="#C3CBDA"
                          keyboardType="phone-pad"
                          maxLength={10}
                          style={[
                            inputStyle,
                            { borderColor: passwordFocused ? '#0F6B4C' : '#DDE3EF', backgroundColor: passwordFocused ? '#FFFFFF' : '#F7F9FC' },
                          ]}
                        />
                      </View>

                      <View style={{ marginBottom: 16, position: 'relative', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A5568', marginBottom: 7, letterSpacing: 1, textTransform: 'uppercase' }}>
                          Password
                        </Text>
                        <View style={{ position: 'absolute', left: 13, top: 29, zIndex: 1 }}>
                          <Ionicons name="lock-closed" size={15} color="#A0AEC0" />
                        </View>
                        <TextInput
                          value={password}
                          onChangeText={(v) => { setPassword(v); if (error) setError(''); }}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                          placeholder="••••••••"
                          placeholderTextColor="#C3CBDA"
                          secureTextEntry={!showPassword}
                          style={[
                            inputStyle,
                            { borderColor: passwordFocused ? '#0F6B4C' : '#DDE3EF', backgroundColor: passwordFocused ? '#FFFFFF' : '#F7F9FC' },
                          ]}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword((v) => !v)}
                          style={{ position: 'absolute', right: 12, top: 29, padding: 2 }}
                        >
                          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={16} color="#A0AEC0" />
                        </TouchableOpacity>
                      </View>

                      <View style={{ marginTop: 18 }}>
                        <SubmitBtn
                          label="Sign In"
                          disabled={loading || !mobile || !password}
                          loading={loading}
                          onPress={handleMobilePasswordLogin}
                        />
                      </View>
                    </>
                  )}

                  {loginMode === 'google' && (
                    <View style={{ alignItems: 'center', marginTop: 8 }}>
                      {(!WEB_CLIENT_ID || WEB_CLIENT_ID.includes('your_google_web_client_id')) ? (
                        <Text style={{ fontSize: 13, color: '#B91C1C', textAlign: 'center', lineHeight: 18 }}>
                          Google sign-in isn't configured yet. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in mobile/.env and restart.
                        </Text>
                      ) : (
                        <>
                          <View nativeID="gsi-button-container" style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }} />
                          {loading && <ActivityIndicator style={{ marginTop: 12 }} color="#0F6B4C" />}
                          <Text style={{ fontSize: 11, color: '#9BA8C0', marginTop: 12, textAlign: 'center' }}>
                            Sign in with your Gmail account using the Google button above.
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </View>

                {/* info banner */}
                <View style={{ marginTop: 16, backgroundColor: 'rgba(15,107,76,0.06)', borderWidth: 1, borderColor: 'rgba(15,107,76,0.12)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 }}>
                  <Text style={{ fontSize: 13, color: '#0D2A20', lineHeight: 18 }}>
                    Choose your login method: Mobile number + Password, Staff PIN, or Gmail. Admins have full access, Staff have limited access.
                  </Text>
                </View>

                <Text style={{ textAlign: 'center', fontSize: 11, color: '#9BA8C0', marginTop: 20 }}>
                  Dairy Farm Manager v1.0
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="bg-blue-600 pt-16 pb-12 px-6 items-center">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">🐄</Text>
          </View>
          <Text className="text-white text-3xl font-bold">Dairy Farm</Text>
          <Text className="text-blue-200 text-base mt-1">Milk Delivery Manager</Text>
        </View>

        <View className="flex-1 px-6 py-8">
          <Text className="text-gray-800 text-2xl font-bold text-center mb-2">Welcome Back</Text>
          <Text className="text-gray-500 text-center mb-8">
            Sign in to manage your dairy business
          </Text>

          <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
            {(['mobile', 'google', 'pin'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => { setLoginMode(mode); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg items-center ${loginMode === mode ? 'bg-blue-600' : ''}`}
              >
                <Text className={`font-semibold text-sm ${loginMode === mode ? 'text-white' : 'text-gray-600'}`}>
                  {mode === 'mobile' ? 'Mobile' : mode === 'google' ? 'Gmail' : 'PIN'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ErrorBanner message={error} />

          {loginMode === 'mobile' && (
            <>
              <Input
                label="Mobile Number"
                placeholder="9876543210"
                value={mobile}
                onChangeText={(value) => { setMobile(value.replace(/\D/g, '').slice(0, 10)); if (error) setError(''); }}
                keyboardType="phone-pad"
                maxLength={10}
                required
              />
              <Input
                label="Password"
                placeholder="Enter password"
                value={password}
                onChangeText={(value) => { setPassword(value); if (error) setError(''); }}
                secureTextEntry={!showPassword}
                required
              />
              <TouchableOpacity onPress={() => setShowPassword((value) => !value)} className="mb-4 self-end">
                <Text className="text-blue-600 text-sm font-medium">{showPassword ? 'Hide password' : 'Show password'}</Text>
              </TouchableOpacity>
              <Button title="Sign In" onPress={handleMobilePasswordLogin} loading={loading} disabled={mobile.length !== 10 || !password} />
            </>
          )}

          {loginMode === 'google' && (
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={loading}
              className="flex-row items-center justify-center border border-gray-200 rounded-xl py-4 px-6 bg-white shadow-sm"
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#2563EB" />
              ) : (
                <>
                  <Text className="text-xl mr-3">G</Text>
                  <Text className="text-gray-700 font-semibold text-base">Continue with Gmail</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {loginMode === 'pin' && (
            <>
              <Input
                label="PIN"
                placeholder="Enter staff PIN"
                value={pin}
                onChangeText={(value) => { setPin(value); if (error) setError(''); }}
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                required
              />
              <Button title="Sign In with PIN" onPress={handlePinLogin} loading={loading} disabled={pin.length < 4} />
            </>
          )}
        </View>

        <View className="pb-8 items-center">
          <Text className="text-gray-400 text-xs">
            Dairy Farm Manager v1.0 • Powered by Google Sheets
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
