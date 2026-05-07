import React from 'react';
import { View, Text, TextInput, Alert, Animated, Pressable, ActivityIndicator } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, FloatingInput } from '../../../design-system';
import { triggerHaptic, HapticPatterns } from '../../../utils/haptics';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; email: string; phone: string; office: string }) => Promise<void> | void;
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  initialOffice: string;
  error?: string | null;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onSave,
  initialName,
  initialEmail,
  initialPhone,
  initialOffice,
  error,
}) => {
  const [name, setName] = React.useState(initialName || '');
  const [email, setEmail] = React.useState(initialEmail || '');
  const [phone, setPhone] = React.useState(initialPhone || '');
  const [office, setOffice] = React.useState(initialOffice || '');
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [saveError, setSaveError] = React.useState(false);

  const emailRef = React.useRef<TextInput>(null);
  const phoneRef = React.useRef<TextInput>(null);
  const officeRef = React.useRef<TextInput>(null);
  const successScale = React.useRef(new Animated.Value(1)).current;
  const formShake = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setName(initialName || '');
      setEmail(initialEmail || '');
      setPhone(initialPhone || '');
      setOffice(initialOffice || '');
      setSaving(false);
      setSaved(false);
      setSaveError(false);
    }
  }, [visible, initialName, initialEmail, initialPhone, initialOffice]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  const isPhoneValid = (phone || '').trim() === '' || /^[+]?[\d\s\-().]{7,15}$/.test((phone || '').trim());
  const canSave = (name || '').trim().length > 0 && isEmailValid && isPhoneValid;

  const isDirty = (name || '') !== (initialName || '') ||
    (email || '') !== (initialEmail || '') ||
    (phone || '') !== (initialPhone || '') ||
    (office || '') !== (initialOffice || '');

  const triggerFormShake = () => {
    HapticPatterns.warning();
    Animated.sequence([
      Animated.timing(formShake, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(formShake, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(formShake, { toValue: 6, duration: 40, useNativeDriver: true }),
      Animated.timing(formShake, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const handleSave = async () => {
    if (saving || saved) return;
    if (!canSave) {
      triggerFormShake();
      return;
    }

    try {
      setSaving(true);
      setSaveError(false);
      triggerHaptic();

      await onSave({ name, email, phone, office });

      setSaving(false);
      setSaved(true);
      HapticPatterns.success();

      // Success pulse animation
      Animated.sequence([
        Animated.timing(successScale, { toValue: 1.03, duration: 150, useNativeDriver: true }),
        Animated.timing(successScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1800);

    } catch {
      setSaving(false);
      setSaveError(true);
      HapticPatterns.error();

      setTimeout(() => setSaveError(false), 2500);
    }
  };

  const handleClose = () => {
    if (saving) return;
    if (isDirty && !saved) {
      Alert.alert(
        'Discard changes?',
        'Your edits have not been saved.',
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  };

  // Button label and variant logic
  const buttonLabel = saved
    ? '✓  Identity Saved'
    : saving
    ? 'Synchronizing...'
    : 'Save Identity Updates';

  const buttonVariant = saved ? 'secondary' : saveError ? 'danger' : 'primary';

  return (
    <ModalShell
      visible={visible}
      onClose={handleClose}
      title="Update Identity"
      subtitle="Modify your profile settings"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <Animated.View className="pb-8 pt-2" style={{ transform: [{ translateX: formShake }] }}>
        {(error || saveError) ? (
          <Text className="text-red-500 text-sm mt-2 mb-4 font-bold text-center">
            {error || 'Something went wrong. Please try again.'}
          </Text>
        ) : null}

        <FloatingInput
          label="Display Name"
          value={name}
          onChangeText={setName}
          icon={<Icons.User size={18} />}
          autoFocus={true}
          maxLength={80}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          blurOnSubmit={false}
        />

        <FloatingInput
          ref={emailRef}
          label="Institutional Email"
          value={email}
          onChangeText={setEmail}
          icon={<Icons.Mail size={18} />}
          keyboardType="email-address"
          autoCapitalize="none"
          maxLength={100}
          returnKeyType="next"
          onSubmitEditing={() => phoneRef.current?.focus()}
          blurOnSubmit={false}
          error={!isEmailValid && (email || '').trim().length > 0 ? "Enter a valid institutional email address" : null}
        />

        <FloatingInput
          ref={phoneRef}
          label="Contact Number"
          value={phone}
          onChangeText={setPhone}
          icon={<Icons.Phone size={18} />}
          keyboardType="phone-pad"
          maxLength={20}
          returnKeyType="next"
          onSubmitEditing={() => officeRef.current?.focus()}
          blurOnSubmit={false}
          error={!isPhoneValid && (phone || '').trim().length > 0 ? "Enter a valid contact number" : null}
        />

        <FloatingInput
          ref={officeRef}
          label="Office Designation"
          value={office}
          onChangeText={setOffice}
          icon={<Icons.Globe size={18} />}
          maxLength={120}
          returnKeyType="done"
          onSubmitEditing={() => canSave && handleSave()}
        />

        <Animated.View style={{ transform: [{ scale: successScale }] }} className="mt-4 mb-10">
          <Pressable
            disabled={!canSave || saving || saved}
            onPress={handleSave}
            style={({ pressed }) => ({
              opacity: (!canSave || saving || saved) ? 0.5 : pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
            className={`h-[58px] rounded-2xl items-center justify-center ${
              saved
                ? 'bg-emerald-500'
                : saving
                ? 'bg-indigo-400'
                : 'bg-indigo-600'
            }`}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-[13px] font-inter-black tracking-[1px] uppercase">
                {saved ? '✓  Saved Successfully' : 'Save Identity Updates'}
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </Animated.View>
    </ModalShell>
  );
};
