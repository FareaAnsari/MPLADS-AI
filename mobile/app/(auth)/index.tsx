import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Button, Card, Badge, TextField } from '../../src/ui/components';
import { Colors, Spacing, Radii } from '../../src/ui/theme';
import { useAuthStore } from '../../src/store/authStore';
import { UserRole } from '../../src/domain/entities';
import { useTranslation } from '../../src/i18n';

export default function AuthScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();
  const { loginAsRole, sendAadhaarOtp, verifyAadhaarOtp, user, status, logout } = useAuthStore();
  
  const [authTab, setAuthTab] = useState<'CITIZEN' | 'OFFICER' | 'INSTITUTIONAL'>('CITIZEN');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  // Citizen Aadhaar State
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [name, setName] = useState('');
  const [stateName, setStateName] = useState('Bihar');
  const [district, setDistrict] = useState('Araria');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [maskedMobile, setMaskedMobile] = useState('');

  // District Nodal Officer State
  const [officerId, setOfficerId] = useState('dpo.araria@gov.in');
  const [officerDistrict, setOfficerDistrict] = useState('Araria, Bihar');
  const [officerInspectorId, setOfficerInspectorId] = useState('insp-01');
  const [officerPin, setOfficerPin] = useState('123456');

  const formatAadhaar = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const parts = raw.match(/.{1,4}/g);
    return parts ? parts.join(' ') : raw;
  };

  const handleSendOtp = async () => {
    const rawDigits = aadhaarNumber.replace(/\D/g, '');
    if (rawDigits.length !== 12) {
      Alert.alert(
        isHindi ? 'अमान्य आधार' : 'Invalid Aadhaar',
        isHindi ? 'कृपया 12 अंकों का वैध आधार नंबर दर्ज करें।' : 'Please enter a valid 12-digit Aadhaar Card number.'
      );
      return;
    }

    setOtpLoading(true);
    try {
      const res = await sendAadhaarOtp(rawDigits);
      setMaskedMobile(res.maskedMobile);
      setOtpSent(true);
      Alert.alert(
        isHindi ? 'ओटीपी भेजा गया' : 'UIDAI OTP Sent',
        `${res.message}\n${isHindi ? 'डेमो ओटीपी: 123456' : 'Demo OTP: 123456'}`
      );
    } catch (err: any) {
      Alert.alert(isHindi ? 'त्रुटि' : 'Error', err.message || 'Failed to dispatch Aadhaar OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCitizenAadhaarAuth = async () => {
    const rawDigits = aadhaarNumber.replace(/\D/g, '');
    if (rawDigits.length !== 12) {
      Alert.alert('Validation Error', 'Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    if (!otpSent) {
      Alert.alert('Action Required', 'Please request UIDAI OTP first.');
      return;
    }

    if (otp.trim().length !== 6) {
      Alert.alert('Validation Error', 'Please enter the 6-digit OTP (Demo: 123456).');
      return;
    }

    if (isRegistering && !name.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name as on your Aadhaar card.');
      return;
    }

    setLoading(true);
    try {
      await verifyAadhaarOtp({
        aadhaarNumber: rawDigits,
        otp: otp.trim(),
        name: isRegistering ? name.trim() : (rawDigits === '548912345678' ? 'Ramesh Kumar' : undefined),
        jurisdictionState: stateName.trim() || 'Bihar',
        jurisdictionDistrict: district.trim() || 'Araria',
      });

      const last4 = rawDigits.slice(-4);
      Alert.alert(
        'Aadhaar e-KYC Verified',
        `Welcome! Aadhaar XXXX-XXXX-${last4} verified under MoSPI statutory guidelines. You may now submit ground verification evidence.`,
        [{ text: 'Proceed to Verification Hub', onPress: () => router.replace('/(citizen)/evidence') }]
      );
    } catch (err: any) {
      Alert.alert('Authentication Failed', err.message || 'Could not verify Aadhaar OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfficerLogin = async () => {
    if (!officerId.trim()) {
      Alert.alert('Validation Error', 'Please enter your District Nodal Officer ID or Gov Email.');
      return;
    }
    setLoading(true);
    try {
      await loginAsRole('DISTRICT_OFFICER');
      Alert.alert(
        isHindi ? 'जिला नोडल प्रमाणीकरण सफल' : 'District Nodal Officer Verified',
        isHindi
          ? `स्वागत है, जिला योजना एवं नोडल अधिकारी (${officerDistrict})।`
          : `Authenticated as District Planning & Nodal Officer for ${officerDistrict}. Accessing statutory console.`,
        [{ text: isHindi ? 'कंसोल खोलें' : 'Open Console', onPress: () => router.replace('/(officer)') }]
      );
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message || 'Failed to authenticate officer credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoleLogin = async (role: UserRole) => {
    setLoadingRole(role);
    try {
      await loginAsRole(role);
      switch (role) {
        case 'CITIZEN':
          router.replace('/(citizen)');
          break;
        case 'DISTRICT_OFFICER':
          router.replace('/(officer)');
          break;
        case 'MP_OFFICE':
          router.replace('/(mp)');
          break;
        case 'CONTRACTOR':
          router.replace('/(contractor)');
          break;
        default:
          router.replace('/');
          break;
      }
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message || 'Failed to authenticate');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Badge
          label="Government of India · MoSPI Statutory Access"
          variant="primary"
          size="sm"
          style={styles.badge}
        />
        <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
          {isHindi ? 'नागरिक एवं नोडल अधिकारी प्रवेश द्वार' : 'Citizen & Officer Access Gateway'}
        </Text>
        <Text variant="body" color={Colors.textSecondary}>
          {isHindi
            ? 'नागरिक सत्यापन, जिला नोडल निगरानी और संस्थागत पोर्टल तक पहुंच।'
            : 'Statutory access portal for Aadhaar citizen verification and District Nodal Officers.'}
        </Text>
      </View>

      {status === 'AUTHENTICATED' && user && (
        <Card style={styles.activeSessionCard}>
          <Text variant="title">
            {isHindi ? 'सक्रिय सत्र' : 'Active Session'}
          </Text>
          <Text variant="bodySmall" color={Colors.textSecondary} style={{ marginVertical: Spacing.xs }}>
            Signed in as: <Text variant="bodyMedium">{user.name}</Text> ({user.role}) · {user.jurisdictionDistrict || 'National'}
          </Text>
          <View style={styles.sessionActions}>
            <Button
              title={
                user.role === 'DISTRICT_OFFICER'
                  ? (isHindi ? 'अधिकारी कंसोल खोलें' : 'Open Officer Console')
                  : (isHindi ? 'सत्यापन हब खोलें' : 'Open Verification Hub')
              }
              variant="primary"
              size="sm"
              onPress={() => {
                if (user.role === 'DISTRICT_OFFICER') {
                  router.replace('/(officer)');
                } else {
                  router.replace('/(citizen)/evidence');
                }
              }}
            />
            <Button
              title={isHindi ? 'लॉग आउट' : 'Sign Out'}
              variant="danger"
              size="sm"
              onPress={logout}
            />
          </View>
        </Card>
      )}

      {/* 3-Way Tab Switcher: Citizen | District Officer | Institutional */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, authTab === 'CITIZEN' && styles.tabButtonActive]}
          onPress={() => setAuthTab('CITIZEN')}
        >
          <Text
            variant="bodySmall"
            style={[styles.tabText, authTab === 'CITIZEN' && styles.tabTextActive]}
          >
            {isHindi ? 'नागरिक आधार' : 'Citizen'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, authTab === 'OFFICER' && styles.tabButtonActive]}
          onPress={() => setAuthTab('OFFICER')}
        >
          <Text
            variant="bodySmall"
            style={[styles.tabText, authTab === 'OFFICER' && styles.tabTextActive]}
          >
            {isHindi ? 'नोडल अधिकारी' : 'District Nodal'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, authTab === 'INSTITUTIONAL' && styles.tabButtonActive]}
          onPress={() => setAuthTab('INSTITUTIONAL')}
        >
          <Text
            variant="bodySmall"
            style={[styles.tabText, authTab === 'INSTITUTIONAL' && styles.tabTextActive]}
          >
            {isHindi ? 'सांसद / विक्रेता' : 'MP & Vendor'}
          </Text>
        </TouchableOpacity>
      </View>

      {authTab === 'CITIZEN' ? (
        <Card style={styles.formCard}>
          <View style={styles.modeSwitchRow}>
            <TouchableOpacity
              onPress={() => { setIsRegistering(false); setOtpSent(false); }}
              style={[styles.modeButton, !isRegistering && styles.modeButtonActive]}
            >
              <Text
                variant="bodySmall"
                style={[styles.modeButtonText, !isRegistering && styles.modeButtonTextActive]}
              >
                {isHindi ? 'आधार लॉगिन' : 'Aadhaar Sign In'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setIsRegistering(true); setOtpSent(false); }}
              style={[styles.modeButton, isRegistering && styles.modeButtonActive]}
            >
              <Text
                variant="bodySmall"
                style={[styles.modeButtonText, isRegistering && styles.modeButtonTextActive]}
              >
                {isHindi ? 'आधार पंजीकरण' : 'Aadhaar Register'}
              </Text>
            </TouchableOpacity>
          </View>

          <TextField
            label={isHindi ? '12 अंकों का आधार नंबर *' : '12-Digit Aadhaar Number *'}
            placeholder="XXXX XXXX XXXX (e.g. 5489 1234 5678)"
            value={aadhaarNumber}
            onChangeText={(val) => setAadhaarNumber(formatAadhaar(val))}
            keyboardType="number-pad"
            maxLength={14}
            style={styles.field}
          />

          <Button
            title={
              otpLoading
                ? isHindi ? 'ओटीपी भेजा जा रहा है...' : 'Dispatching OTP...'
                : otpSent
                ? isHindi ? 'ओटीपी पुनः भेजें' : 'Resend UIDAI OTP'
                : isHindi ? 'आधार ओटीपी भेजें' : 'Send Aadhaar e-KYC OTP'
            }
            variant="outline"
            size="sm"
            loading={otpLoading}
            disabled={aadhaarNumber.replace(/\D/g, '').length !== 12}
            onPress={handleSendOtp}
            style={{ marginBottom: Spacing.sm }}
          />

          {isRegistering && (
            <TextField
              label={isHindi ? 'आधार कार्ड के अनुसार पूरा नाम *' : 'Full Name (as on Aadhaar) *'}
              placeholder="e.g. Ramesh Kumar Sharma"
              value={name}
              onChangeText={setName}
              style={styles.field}
            />
          )}

          {isRegistering && (
            <View style={styles.locationRow}>
              <View style={{ flex: 1, marginRight: Spacing.xs }}>
                <TextField
                  label={isHindi ? 'राज्य' : 'State'}
                  placeholder="e.g. Bihar"
                  value={stateName}
                  onChangeText={setStateName}
                  style={styles.field}
                />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.xs }}>
                <TextField
                  label={isHindi ? 'जिला' : 'District'}
                  placeholder="e.g. Araria"
                  value={district}
                  onChangeText={setDistrict}
                  style={styles.field}
                />
              </View>
            </View>
          )}

          {otpSent && (
            <View style={styles.otpSection}>
              <Badge
                label={isHindi ? `ओटीपी भेजा गया: ${maskedMobile}` : `OTP dispatched to ${maskedMobile}`}
                variant="success"
                size="sm"
                style={{ marginBottom: Spacing.xs }}
              />
              <TextField
                label={isHindi ? '6 अंकों का आधार ओटीपी दर्ज करें *' : 'Enter 6-Digit Aadhaar OTP *'}
                placeholder="123456"
                value={otp}
                onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.field}
              />
            </View>
          )}

          <Button
            title={
              isRegistering
                ? isHindi
                  ? 'आधार सत्यापित करें और पंजीकरण करें'
                  : 'Verify Aadhaar e-KYC & Register'
                : isHindi
                ? 'आधार सत्यापित करें और लॉगिन करें'
                : 'Verify Aadhaar e-KYC & Sign In'
            }
            variant="primary"
            loading={loading}
            disabled={!otpSent || otp.trim().length !== 6}
            onPress={handleCitizenAadhaarAuth}
            style={styles.submitBtn}
          />
        </Card>
      ) : authTab === 'OFFICER' ? (
        <Card style={styles.formCard}>
          <View style={styles.officerBadgeRow}>
            <Badge
              label="District Planning & Nodal Cell · MoSPI Authority"
              variant="primary"
              size="sm"
            />
          </View>
          <Text variant="title" style={styles.sectionHeading}>
            {isHindi ? 'जिला नोडल अधिकारी प्रमाणीकरण' : 'District Nodal Officer Sign In'}
          </Text>
          <Text variant="caption" color={Colors.textSecondary} style={{ marginBottom: Spacing.md }}>
            {isHindi
              ? 'सांविधिक एमपीलैड्स परियोजना निरीक्षण, साक्ष्य समीक्षा और एसएलए ट्रैकिंग के लिए आधिकारिक लॉगिन।'
              : 'Authorized access for statutory project inspections, evidence audit, and SLA bottleneck monitoring.'}
          </Text>

          <TextField
            label={isHindi ? 'अधिकारी ईमेल / आईडी *' : 'Officer ID / Gov Email *'}
            placeholder="e.g. dpo.araria@gov.in"
            value={officerId}
            onChangeText={setOfficerId}
            style={styles.field}
          />

          <View style={styles.locationRow}>
            <View style={{ flex: 1, marginRight: Spacing.xs }}>
              <TextField
                label={isHindi ? 'जिला क्षेत्राधिकार' : 'Jurisdiction District'}
                placeholder="Araria, Bihar"
                value={officerDistrict}
                onChangeText={setOfficerDistrict}
                style={styles.field}
              />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.xs }}>
              <TextField
                label={isHindi ? 'निरीक्षक कोड' : 'Inspector Unit ID'}
                placeholder="insp-01"
                value={officerInspectorId}
                onChangeText={setOfficerInspectorId}
                style={styles.field}
              />
            </View>
          </View>

          <TextField
            label={isHindi ? 'सुरक्षा पिन / पासवर्ड *' : 'Security PIN / Password *'}
            placeholder="••••••"
            value={officerPin}
            onChangeText={setOfficerPin}
            secureTextEntry
            style={styles.field}
          />

          <Button
            title={
              loading
                ? (isHindi ? 'सत्यापन हो रहा है...' : 'Authenticating...')
                : (isHindi ? 'जिला नोडल अधिकारी के रूप में लॉगिन करें' : 'Sign In as District Nodal Officer')
            }
            variant="primary"
            loading={loading}
            onPress={handleOfficerLogin}
            style={styles.submitBtn}
          />
        </Card>
      ) : (
        <Card style={styles.formCard}>
          <Text variant="title" style={styles.sectionHeading}>
            {isHindi ? 'संस्थागत भूमिका लॉगिन' : 'Select Institutional Role'}
          </Text>

          <View style={styles.buttonGroup}>
            <Button
              title="Sign in as MP Constituency Office"
              variant="secondary"
              loading={loadingRole === 'MP_OFFICE'}
              onPress={() => handleSelectRoleLogin('MP_OFFICE')}
            />
            <Button
              title="Sign in as Registered Contractor"
              variant="outline"
              loading={loadingRole === 'CONTRACTOR'}
              onPress={() => handleSelectRoleLogin('CONTRACTOR')}
            />
          </View>
        </Card>
      )}

      <Button
        title={isHindi ? 'होम स्क्रीन पर वापस जाएं' : 'Return to Home'}
        variant="ghost"
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/');
          }
        }}
        style={{ marginTop: Spacing.lg }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  title: {
    marginTop: Spacing.xs,
  },
  activeSessionCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.borderLight,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.borderLight,
    borderRadius: Radii.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radii.sm,
  },
  tabButtonActive: {
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  tabText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  formCard: {
    marginBottom: Spacing.md,
  },
  modeSwitchRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modeButtonActive: {
    borderBottomColor: Colors.primary,
  },
  modeButtonText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  field: {
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
  },
  otpSection: {
    backgroundColor: Colors.borderLight,
    padding: Spacing.sm,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  sectionHeading: {
    marginBottom: Spacing.md,
  },
  buttonGroup: {
    gap: Spacing.md,
  },
  officerBadgeRow: {
    marginBottom: Spacing.sm,
    alignSelf: 'flex-start',
  },
});
