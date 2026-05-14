import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '@components/common/Icons';
import { AppTheme, AppCard, AppTypography, SectionHeader, StatusPill, PlatinumHeader } from '@components/common';
import { Grade } from '@context/SchoolDataContext';

const StyledLinearGradient = LinearGradient || View;

interface StudentReportsProps {
  grades: any[];
  isLoading?: boolean;
}

export const StudentReports: React.FC<StudentReportsProps> = ({ grades = [], isLoading = false }) => {
  const calculateGPA = () => {
    if (grades.length === 0) return '0.00';
    const total = grades.reduce((acc, curr) => acc + (curr.marks / (curr.assignments?.max_marks || 100)) * 4, 0);
    return (total / grades.length).toFixed(2);
  };

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      <PlatinumHeader 
        title="Academic Results"
        subtitle={`Official Est. GPA: ${calculateGPA()}`}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0ea5e9" />
        </View>
      ) : (
        <ScrollView 
          className="flex-1 mt-4 relative z-20"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <SectionHeader title="PERFORMANCE REGISTRY" className="mb-4" />
          
          <View className="gap-4">
            {grades.length > 0 ? grades.map((item, idx) => {
              const percentage = (item.marks / (item.assignments?.max_marks || 100)) * 100;
              return (
                <AppCard key={item.id || idx} className="p-4 border border-white shadow-xl shadow-sky-100/30">
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 pr-4">
                      <Text className="text-lg font-black text-gray-900 tracking-tighter font-inter-black">
                        {item.assignments?.title || 'Unknown Assignment'}
                      </Text>
                      <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 font-inter-black">
                        Graded on: {item.graded_at ? new Date(item.graded_at).toLocaleDateString() : 'N/A'}
                      </Text>
                    </View>
                    <View className="mt-1">
                      <Text className="text-sky-600 font-black text-xl font-inter-black">{item.marks}<Text className="text-gray-300 text-xs">/{item.assignments?.max_marks || 100}</Text></Text>
                    </View>
                  </View>

                  {item.feedback && (
                    <View className="bg-sky-50/50 p-3 rounded-2xl border border-sky-100 mb-4">
                      <Text className="text-[10px] text-sky-600 font-black uppercase tracking-widest mb-1.5 font-inter-black">Faculty Feedback</Text>
                      <Text className="text-[12px] text-gray-600 font-inter-medium leading-5 italic">
                        "{item.feedback}"
                      </Text>
                    </View>
                  )}

                  <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <View 
                      className={`h-full rounded-full ${percentage >= 80 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-sky-500' : 'bg-rose-500'}`} 
                      style={{ width: `${percentage}%` }} 
                    />
                  </View>
                </AppCard>
              );
            }) : (
              <View className="py-20 items-center">
                <View className="w-16 h-16 bg-white rounded-3xl items-center justify-center mb-6 border border-gray-100 shadow-xl shadow-sky-100/50">
                  <Icons.FileText size={32} color="#e5e7eb" />
                </View>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] font-inter-black text-center">No graded assignments found</Text>
              </View>
            )}
          </View>

          <View className="mt-12 p-6 bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-indigo-100/20">
             <View className="flex-row items-center mb-4">
                <View className="bg-emerald-50 p-2 rounded-xl mr-3">
                    <Icons.Verified size={16} color="#10b981" />
                </View>
                <Text className="text-[14px] font-black text-gray-900 font-inter-black">Institutional Verification</Text>
             </View>
             <Text className="text-[11px] text-gray-500 leading-5 font-inter-medium mb-6">
                These results are officially verified by the academy's board of directors. For formal transcript requests, please contact the registrar's office.
             </Text>
             <TouchableOpacity className="w-full bg-gray-900 py-4 rounded-2xl items-center justify-center active:scale-95">
                <Text className="text-white font-black uppercase tracking-widest text-[10px] font-inter-black">Request Official Transcript</Text>
             </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};
