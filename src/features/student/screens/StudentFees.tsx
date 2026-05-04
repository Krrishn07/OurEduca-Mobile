import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { AppTheme, AppCard, AppTypography, SectionHeader, StatusPill, ActionTile } from '../../../design-system';
import { FeeReceiptModal } from '../modals/FeeReceiptModal';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

interface StudentFeesProps {
  fees: any[];
  studentName: string;
  studentPaymentLink: string | null;
  isPaymentProcessing: boolean;
  showPaymentSuccess: boolean;
  handlePayNow: (id: string) => void;
  handleLinkPress: (url: string) => void;
}

export const StudentFees: React.FC<StudentFeesProps> = ({
  fees = [],
  studentName,
  studentPaymentLink,
  isPaymentProcessing,
  showPaymentSuccess,
  handlePayNow,
  handleLinkPress,
}) => {
  const [selectedReceiptFee, setSelectedReceiptFee] = React.useState<any>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  
  const totalOutstanding = (fees || []).reduce((acc: any, curr: any) => curr.status === 'Pending' ? acc + curr.amount : acc, 0);
  const totalPaid = (fees || []).reduce((acc: any, curr: any) => curr.status === 'Paid' ? acc + curr.amount : acc, 0);

  const isOverdue = (dueDate: string) => {
    try {
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    } catch (e) {
        return false;
    }
  };

  return (
    <ScrollView 
        ref={scrollRef}
        className="flex-1 bg-[#f5f7ff]" 
        showsVerticalScrollIndicator={false}
    >
      {/* Platinum Financial Hero — 140px Sync */}
      <StyledLinearGradient
        colors={AppTheme.colors.gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-[140px] px-6 pt-5 rounded-b-[40px] relative shadow-2xl shadow-indigo-200/50 z-30"
      >
        <View className="absolute right-[-15] bottom-[-15] opacity-10 transform rotate-12">
            <Icons.Payment size={130} color="white" />
        </View>
        
        <View className="relative z-10 flex-row justify-between items-start mb-5">
          <View className="flex-1 mr-4">
            <Text className={`${AppTypography.heroTitle} text-white`}>My Fees</Text>
          </View>
        </View>

        <View className="relative z-10 flex-row justify-between items-end">
            <View>
                <Text className="text-[9px] font-black text-white/50 uppercase tracking-[2px] mb-1 font-inter-black">Amount Due</Text>
                <View className="flex-row items-center">
                    <Text className="text-xl font-black text-white/40 mr-1 font-inter-black">₹</Text>
                    <Text className="text-3xl font-black text-white tracking-tighter font-inter-black">{totalOutstanding.toLocaleString()}</Text>
                </View>
            </View>
            <View className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/20 backdrop-blur-md">
                <View className="flex-row items-center">
                    <Icons.Check size={10} color="#10b981" />
                    <Text className="text-[9px] font-black text-white uppercase tracking-wider font-inter-black ml-2">₹{totalPaid.toLocaleString()} Paid</Text>
                </View>
            </View>
        </View>
      </StyledLinearGradient>

      <View className="px-4 mt-5 relative z-20">
        {showPaymentSuccess && (
          <View className="bg-emerald-500 rounded-[28px] p-5 mb-5 flex-row items-center shadow-xl shadow-emerald-200/50 border border-emerald-400">
            <View className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center mr-4 border border-white/20">
              <Icons.Check size={24} color="white" />
            </View>
            <View>
              <Text className="text-white font-black text-[15px] font-inter-black">Payment Received</Text>
              <Text className="text-emerald-50 text-[10px] font-black uppercase tracking-widest font-inter-black opacity-80">Verification in progress</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="flex-row mb-5">
            <ActionTile 
                title="Pay Now" 
                icon={Icons.Payment}
                onPress={() => scrollRef.current?.scrollTo({ y: 400, animated: true })}
                className="flex-1 mr-3 py-3.5"
            />
            <ActionTile 
                title="Receipts" 
                icon={Icons.Verified}
                onPress={() => {}}
                className="flex-1 py-3.5"
                type="neutral"
            />
        </View>

        {/* Fee Notice */}
        {totalOutstanding > 0 && (
          <AppCard className="bg-amber-50/50 border-amber-100 p-4 mb-5 shadow-sm">
            <View className="flex-row items-center mb-2.5">
              <View className="w-8 h-8 bg-amber-100 rounded-lg items-center justify-center mr-3 border border-amber-200">
                <Icons.Bell size={16} color="#b45309" />
              </View>
              <View>
                <Text className="text-[12px] font-black text-amber-900 tracking-tight font-inter-black">Fee Reminder</Text>
              </View>
            </View>
            <Text className="text-amber-800 text-[11px] font-medium leading-5 font-inter-medium">
              You have outstanding fees. Please settle your dues to avoid any disruption.
            </Text>
          </AppCard>
        )}

        {/* Payment Link */}
        {studentPaymentLink && (
          <View className="bg-[#1e1b4b] p-5 rounded-[32px] shadow-2xl mb-5 relative overflow-hidden">
            <View className="absolute right-[-10] top-[-10] opacity-10">
                <Icons.Shield size={80} color="white" />
            </View>
            
            <View className="flex-row items-center mb-4 relative z-10">
              <View className="w-10 h-10 bg-white/10 rounded-2xl items-center justify-center mr-4 border border-white/10">
                <Icons.Payment size={20} color="#818cf8" />
              </View>
              <View>
                <Text className="text-lg font-black text-white tracking-tighter font-inter-black">Payment Portal</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={() => handleLinkPress(studentPaymentLink)}
              className="bg-indigo-600 py-3 rounded-2xl flex-row items-center justify-center shadow-xl shadow-indigo-900/50 active:scale-95"
            >
              <Text className="text-white font-black tracking-wide mr-2 text-[10px] uppercase font-inter-black">Open Payment Link</Text>
              <Icons.ChevronRight size={14} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Past Invoices */}
        <View className="mb-0">
          <SectionHeader 
            title="PAST INVOICES" 
            className="px-2"
          />

          {fees.map((fee, i) => {
            const overdue = fee.status === 'Pending' && isOverdue(fee.due);
            return (
              <AppCard key={fee.id} className={`p-4 mb-4 border ${overdue ? 'border-red-100 bg-red-50/20' : 'border-white'} shadow-xl shadow-indigo-100/30`}>
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 mr-4">
                    <Text className="text-[14px] font-black text-gray-900 tracking-tight font-inter-black" numberOfLines={1}>{fee.title}</Text>
                    <View className="flex-row items-center mt-2">
                       <Icons.Calendar size={10} color={overdue ? "#ef4444" : "#94a3b8"} />
                       <Text className={`text-[9px] font-black uppercase tracking-widest ml-2 font-inter-black ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                         Due: {fee.due} {overdue && '• OVERDUE'}
                       </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center">
                        <Text className="text-[11px] font-black text-gray-400 mr-0.5 opacity-60 font-inter-black">₹</Text>
                        <Text className="text-lg font-black text-gray-900 tracking-tighter font-inter-black">{fee.amount.toLocaleString()}</Text>
                    </View>
                    <View className="mt-2">
                        <StatusPill 
                            label={fee.status === 'Pending' && overdue ? 'Overdue' : fee.status} 
                            type={
                                fee.status === 'Paid' ? 'success' : 
                                fee.status === 'Processing' ? 'info' :
                                overdue ? 'danger' : 'warning'
                            } 
                        />
                    </View>
                  </View>
                </View>

                {fee.status === 'Paid' ? (
                  <TouchableOpacity 
                    onPress={() => setSelectedReceiptFee(fee)}
                    className="bg-gray-50 py-3 rounded-2xl flex-row items-center justify-center border border-gray-100 active:bg-gray-100"
                  >
                    <Icons.Verified size={12} color="#4f46e5" />
                    <Text className="text-indigo-600 text-[9px] font-black ml-2 uppercase tracking-widest font-inter-black">Official Receipt</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    onPress={() => fee.status !== 'Processing' && handlePayNow(fee.id)}
                    disabled={isPaymentProcessing || fee.status === 'Processing'}
                    className={`${
                        fee.status === 'Processing' ? 'bg-gray-100 border border-gray-200' :
                        overdue ? 'bg-red-600 shadow-red-100' : 'bg-indigo-600 shadow-indigo-100'
                    } py-3 rounded-2xl flex-row items-center justify-center shadow-lg active:scale-[0.98]`}
                  >
                    {isPaymentProcessing ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : fee.status === 'Processing' ? (
                      <>
                        <Icons.Check size={12} color="#94a3b8" />
                        <Text className="text-gray-400 font-black ml-2 uppercase tracking-widest text-[9px] font-inter-black">Verifying...</Text>
                      </>
                    ) : (
                      <>
                        <Icons.Payment size={12} color="white" />
                        <Text className="text-white font-black ml-2 uppercase tracking-widest text-[9px] font-inter-black">Pay Now</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </AppCard>
            );
          })}

          <FeeReceiptModal 
            visible={!!selectedReceiptFee}
            onClose={() => setSelectedReceiptFee(null)}
            fee={selectedReceiptFee}
            studentName={studentName}
          />

          {fees.length === 0 && (
            <View className="py-20 items-center justify-center">
              <View className="w-16 h-16 bg-white rounded-3xl items-center justify-center mb-6 shadow-xl shadow-indigo-100/50 border border-gray-50">
                <Icons.Payment size={28} color="#e2e8f0" />
              </View>
              <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest font-inter-black">No transaction history</Text>
            </View>
          )}
        </View>
      </View>
      <View className="h-20" />
    </ScrollView>
  );
};
