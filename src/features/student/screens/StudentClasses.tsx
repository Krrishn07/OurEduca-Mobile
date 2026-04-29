import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { AppTheme, AppCard, AppButton, AppTypography, SectionHeader, StatusPill } from '../../../design-system';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

interface StudentClassesProps {
  studentPrimaryClass: any;
  allStudentClasses: any[];
}

export const StudentClasses: React.FC<StudentClassesProps> = ({ allStudentClasses = [] }) => (
  <View className="flex-1 bg-[#f5f7ff]">
    {/* Platinum Curriculum Hero — 140px Sync */}
    <StyledLinearGradient 
      colors={AppTheme.colors.gradients.brand} 
      start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
      className="h-[140px] px-6 pt-5 rounded-b-[40px] shadow-2xl shadow-indigo-200/50 relative z-30"
    >
        <View className="absolute right-[-15] bottom-[-15] opacity-10 rotate-12">
            <Icons.BookOpen size={130} color="white" />
        </View>

        <View className="relative z-10 flex-row justify-between items-start mb-8">
            <View className="flex-1 mr-4">
                <Text className={`${AppTypography.heroTitle} text-white`}>My Classes</Text>
            </View>
            <View className="bg-white/10 px-4 py-2 rounded-2xl border border-white/20 backdrop-blur-md">
                <Text className="text-[10px] font-black text-white uppercase tracking-widest font-inter-black">{allStudentClasses.length} Active</Text>
            </View>
        </View>
    </StyledLinearGradient>

    <ScrollView 
        className="flex-1 mt-4 relative z-20"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
    >
      <View className="gap-4">
        {allStudentClasses.length > 0 ? allStudentClasses.map((cls, idx) => (
          <AppCard key={cls.facultyRosterId || `class_${idx}`} className="p-4 border border-white shadow-xl shadow-indigo-100/30">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1 pr-4">
                  <Text className="text-lg font-black text-gray-900 tracking-tighter font-inter-black" numberOfLines={1}>{cls.subject || cls.name}</Text>
                  
                  {/* Compact Info Belt */}
                  <View className="flex-row items-center mt-2 gap-4">
                    <View className="flex-row items-center opacity-60">
                        <Icons.Profile size={10} color="#64748b" />
                        <Text className="text-[10px] font-black text-gray-500 ml-1.5 font-inter-black" numberOfLines={1}>{cls.teacher_name || 'Academic Faculty'}</Text>
                    </View>
                    <View className="flex-row items-center opacity-60">
                        <Icons.Calendar size={10} color="#64748b" />
                        <Text className="text-[10px] font-black text-gray-500 ml-1.5 font-inter-black">{cls.class_time || '9:00 AM'}</Text>
                    </View>
                  </View>
                </View>

                <View className="mt-1">
                    <StatusPill label={cls.grade_score || 'A+'} type="success" />
                </View>
              </View>
              
              {/* Institutional Progress Tracking */}
              <View className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 mb-4 flex-row items-center">
                  <View className="w-6 h-6 bg-white rounded-lg items-center justify-center border border-gray-100 mr-3 shadow-inner">
                    <Icons.Classes size={12} color="#4f46e5" />
                  </View>
                  <Text className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mr-2 font-inter-black">Topic:</Text>
                  <Text className={`${AppTypography.body} text-gray-600 flex-1`} numberOfLines={1}>{cls.last_topic || 'Introduction'}</Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-indigo-600 py-3 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100 active:scale-95">
                    <Text className="text-white font-black uppercase tracking-widest text-[10px] font-inter-black">Resources</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-white py-3 rounded-2xl items-center justify-center border border-gray-100 shadow-sm active:scale-95">
                    <Text className="text-indigo-600 font-black uppercase tracking-widest text-[10px] font-inter-black">Subject Tasks</Text>
                </TouchableOpacity>
              </View>
          </AppCard>
        )) : (
            <View className="py-20 items-center">
                <View className="w-16 h-16 bg-white rounded-3xl items-center justify-center mb-6 border border-gray-100 shadow-xl shadow-indigo-100/50">
                    <Icons.Classes size={32} color="#e5e7eb" />
                </View>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] font-inter-black text-center">No subject enrollment detected</Text>
            </View>
        )}
      </View>
    </ScrollView>
  </View>
);
