import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { 
  ScreenLayout, 
  PlatinumHeader, 
  PlatinumCard, 
  PlatinumButton, 
  PlatinumInput, 
  DashboardSection, 
  StatsGrid, 
  StatNode
} from '@components/common';
import { Tokens } from '@constants/Tokens';
import { Icons } from '@components/common/Icons';

export const DesignSystemPlayground: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const testError = () => {
    setInputError('Institutional validation failed');
    setTimeout(() => setInputError(null), 3000);
  };

  return (
    <ScreenLayout scrollable={true} padding="lg">
      <PlatinumHeader 
        title="Platinum System" 
        subtitle="Source of Truth V1.0"
        showBorder={false}
      />

      {/* 🎨 TOKENS SECTION */}
      <DashboardSection title="Semantic Tokens">
        <View className="flex-row flex-wrap gap-3">
          {['primary', 'success', 'danger', 'warning', 'info'].map((c) => (
            <View key={c} className="items-center">
              <View 
                style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: Tokens.radius.md, 
                  backgroundColor: (Tokens.colors as any)[c] 
                }} 
              />
              <Text className="text-[8px] font-inter-bold mt-1 uppercase text-gray-400">{c}</Text>
            </View>
          ))}
        </View>
      </DashboardSection>

      {/* ✍️ TYPOGRAPHY SECTION */}
      <DashboardSection title="Typography Scale">
        <PlatinumCard padding="lg">
          <Text style={{ fontSize: Tokens.typography.sizes.hero, fontFamily: Tokens.typography.families.interBlack, color: Tokens.colors.textPrimary }}>Hero Title</Text>
          <Text style={{ fontSize: Tokens.typography.sizes.title, fontFamily: Tokens.typography.families.interBold, color: Tokens.colors.textPrimary, marginTop: 8 }}>Section Title</Text>
          <Text style={{ fontSize: Tokens.typography.sizes.body, fontFamily: Tokens.typography.families.interMedium, color: Tokens.colors.textSecondary, marginTop: 4 }}>
            Body text using the institutional Inter scale. Optimized for density and readability.
          </Text>
          <Text style={{ fontSize: Tokens.typography.sizes.micro, fontFamily: Tokens.typography.families.interBold, color: Tokens.colors.primary, textTransform: 'uppercase', marginTop: 12, letterSpacing: 2 }}>
            Micro Metadata Tag
          </Text>
        </PlatinumCard>
      </DashboardSection>

      {/* 🔘 BUTTONS SECTION */}
      <DashboardSection title="Action Components">
        <View className="gap-4">
          <PlatinumButton 
            label="Primary Action" 
            onPress={() => {}} 
            variant="primary" 
            size="xl" 
            icon={<Icons.Send size={18} color="white" />}
          />
          <View className="flex-row gap-3">
            <PlatinumButton 
              label="Success" 
              onPress={() => {}} 
              variant="success" 
              style={{ flex: 1 }}
            />
            <PlatinumButton 
              label="Danger" 
              onPress={() => {}} 
              variant="danger" 
              style={{ flex: 1 }}
            />
          </View>
          <PlatinumButton 
            label="Outline Secondary" 
            onPress={() => {}} 
            variant="outline" 
          />
        </View>
      </DashboardSection>

      {/* ⌨️ INPUTS SECTION */}
      <DashboardSection title="Interaction System">
        <PlatinumInput 
          label="Institutional Input"
          value={inputValue}
          onChangeText={setInputValue}
          error={inputError}
          icon={<Icons.Mail size={20} color={Tokens.colors.textTertiary} />}
          placeholder="Enter data to test focus"
        />
        <PlatinumButton 
          label="Trigger Error Shake" 
          onPress={testError} 
          variant="outline" 
          size="sm"
        />
      </DashboardSection>

      {/* 📊 DASHBOARD PATTERNS */}
      <DashboardSection title="Dashboard Patterns">
        <StatsGrid>
          <StatNode 
            label="Attendance" 
            value="98%" 
            subValue="+2.4% vs last month"
            icon={<Icons.Users size={18} color={Tokens.colors.primary} />}
          />
          <StatNode 
            label="Assignments" 
            value={12} 
            color={Tokens.colors.warning}
            icon={<Icons.FileText size={18} color={Tokens.colors.warning} />}
          />
        </StatsGrid>
        
        <View className="mt-4">
          <PlatinumCard onPress={() => {}}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text style={{ fontSize: 15, fontFamily: Tokens.typography.families.interBlack, color: Tokens.colors.textPrimary }}>Interactive Surface</Text>
                <Text style={{ fontSize: 12, fontFamily: Tokens.typography.families.interMedium, color: Tokens.colors.textSecondary }}>Inherits 0.97x Tap Law</Text>
              </View>
              <Icons.ChevronRight size={20} color={Tokens.colors.border} />
            </View>
          </PlatinumCard>
        </View>
      </DashboardSection>

      <View className="h-10" />
    </ScreenLayout>
  );
};
