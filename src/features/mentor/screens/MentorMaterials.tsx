import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { AppTheme, AppCard, AppTypography, SectionHeader } from '../../../design-system';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

interface MentorMaterialsProps {
  materials: any[];
  onUpload: () => void;
}

export const MentorMaterials: React.FC<MentorMaterialsProps> = ({
  materials,
  onUpload,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredMaterials = (materials || []).filter(m => 
    m.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIconForType = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF': return <Icons.Report size={20} color="#ef4444" />;
      case 'LINK': return <Icons.Globe size={20} color="#3b82f6" />;
      case 'VIDEO': return <Icons.Video size={20} color="#6366f1" />;
      default: return <Icons.Plus size={20} color="#94a3b8" />;
    }
  };

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Premium Resource Header */}
        <StyledLinearGradient
          colors={AppTheme.colors.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-8 pt-16 pb-20 rounded-b-[48px] shadow-2xl shadow-indigo-200/50"
        >
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-3xl font-black text-white tracking-tighter font-inter-black">Resource Vault</Text>
              <Text className="text-indigo-100/60 text-[10px] font-black uppercase tracking-[3px] mt-2 font-inter-black">ACADEMIC ASSETS</Text>
            </View>
            <TouchableOpacity 
              onPress={onUpload}
              className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center border border-white/20 backdrop-blur-md active:bg-white/20 shadow-lg"
            >
              <Icons.Plus size={28} color="white" />
            </TouchableOpacity>
          </View>

          <View className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 flex-row items-center backdrop-blur-md shadow-inner">
            <Icons.Search size={18} color="white" />
            <TextInput
              className="flex-1 ml-4 text-sm font-black text-white placeholder:text-indigo-200 font-inter-black"
              placeholder="Find institutional resources..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </StyledLinearGradient>

        <View className="px-6 -mt-10">
          <SectionHeader 
            title="INSTITUTIONAL REGISTRY" 
            subtitle={`${filteredMaterials.length} CURATED ASSETS AVAILABLE`}
            className="px-2"
          />

          {filteredMaterials.length > 0 ? (
            <View className="space-y-4 mb-8">
              {filteredMaterials.map((item) => (
                <AppCard 
                  key={item.id}
                  className="p-4 flex-row items-center border-gray-100"
                >
                  <View className="w-14 h-14 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100 mr-4 shadow-sm">
                    {getIconForType(item.type)}
                  </View>
                  
                  <View className="flex-1">
                    <Text className="font-black text-[14px] text-gray-900 tracking-tight font-inter-black mb-1" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/50">
                        <Text className="text-[8px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">
                          {item.subject}
                        </Text>
                      </View>
                      <View className="w-1 h-1 rounded-full bg-gray-200 mx-2" />
                      <Text className="text-[9px] text-gray-400 font-black uppercase tracking-widest font-inter-black opacity-60">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'RECENT'}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100 active:bg-gray-100">
                    <Icons.ChevronRight size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </AppCard>
              ))}
            </View>
          ) : (
            <AppCard className="items-center py-24 mb-8 border-dashed border-gray-200">
              <View className="w-20 h-20 bg-gray-50 rounded-[30px] items-center justify-center mb-6 border border-gray-100 shadow-inner">
                <Icons.Report size={32} color="#cbd5e1" />
              </View>
              <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] font-inter-black">Registry Empty</Text>
            </AppCard>
          )}

          {/* Premium Insight Banner */}
          <StyledLinearGradient
            colors={['#4f46e5', '#312e81']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-8 rounded-[40px] shadow-2xl shadow-indigo-200/50 overflow-hidden relative border border-white/10"
          >
             <View className="relative z-10">
                <View className="flex-row items-center mb-6">
                  <View className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                    <Icons.Sparkles size={18} color="white" />
                  </View>
                  <Text className="text-white font-black text-[10px] uppercase tracking-[3px] ml-3 font-inter-black">Faculty Insight</Text>
                </View>
                <Text className="text-white text-[13px] leading-relaxed font-inter-medium opacity-80">
                  Uploading structured materials like lesson plans and assignment briefs helps students and parents stay aligned with your curriculum.
                </Text>
             </View>
             <View className="absolute -bottom-10 -right-10 opacity-10 rotate-12">
                <Icons.Report size={160} color="white" />
             </View>
          </StyledLinearGradient>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
};
