const fs = require('fs');
const path = 'src/screens/auth/Login.tsx';
let c = fs.readFileSync(path, 'utf8');

// 1. Remove trust icons footer from renderLoginForm()
// Replace the footer + closing </Animated.View> with just the closing tag
const loginFormFooter = `      {/* 3. Footer: Secure / Encrypted / Trusted Icons */}\r\n      <View className="flex-row items-center justify-around py-6 border-t border-indigo-100/20">\r\n        <View className="items-center">\r\n          <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mb-1.5">\r\n            <Icons.Shield size={14} color="#6366f1" />\r\n          </View>\r\n          <Text className="text-[10px] font-inter-bold text-gray-400">Secure</Text>\r\n        </View>\r\n        <View className="items-center">\r\n          <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mb-1.5">\r\n            <Icons.Lock size={14} color="#6366f1" />\r\n          </View>\r\n          <Text className="text-[10px] font-inter-bold text-gray-400">Encrypted</Text>\r\n        </View>\r\n        <View className="items-center">\r\n          <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mb-1.5">\r\n            <Icons.Check size={14} color="#6366f1" />\r\n          </View>\r\n          <Text className="text-[10px] font-inter-bold text-gray-400">Trusted</Text>\r\n        </View>\r\n      </View>\r\n    </Animated.View>`;

const loginFormFooterReplacement = `    </Animated.View>`;

if (c.includes(loginFormFooter)) {
  c = c.replace(loginFormFooter, loginFormFooterReplacement);
  console.log('1. Removed trust icons from renderLoginForm');
} else {
  console.log('1. FAILED - loginFormFooter not found');
}

// 2. Replace OTP verify identity view - remove its own footer, simplify wrapper
const otpOld = `                  <View className="w-full flex-1 justify-between py-2">\r\n                    <View className="items-center w-full px-4 flex-1 justify-center">`;
const otpNew = `                  <View className="items-center w-full px-4">`;

if (c.includes(otpOld)) {
  c = c.replace(otpOld, otpNew);
  console.log('2a. Simplified OTP wrapper opening');
} else {
  console.log('2a. FAILED - OTP opening not found');
}

// Remove OTP trust icons and extra closing views
const otpFooter = `                    </View>\r\n                    <View className="flex-row items-center justify-around py-6 border-t border-indigo-100/20">\r\n                      <View className="items-center">\r\n                        <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mb-1.5">\r\n                          <Icons.Shield size={14} color="#6366f1" />\r\n                        </View>\r\n                        <Text className="text-[10px] font-inter-bold text-gray-400">Secure</Text>\r\n                      </View>\r\n                      <View className="items-center">\r\n                        <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mb-1.5">\r\n                          <Icons.Lock size={14} color="#6366f1" />\r\n                        </View>\r\n                        <Text className="text-[10px] font-inter-bold text-gray-400">Encrypted</Text>\r\n                      </View>\r\n                      <View className="items-center">\r\n                        <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mb-1.5">\r\n                          <Icons.Check size={14} color="#6366f1" />\r\n                        </View>\r\n                        <Text className="text-[10px] font-inter-bold text-gray-400">Trusted</Text>\r\n                      </View>\r\n                    </View>\r\n                  </View>`;
const otpFooterReplacement = `                  </View>`;

if (c.includes(otpFooter)) {
  c = c.replace(otpFooter, otpFooterReplacement);
  console.log('2b. Removed OTP trust icons footer');
} else {
  console.log('2b. FAILED - OTP footer not found');
}

// 3. Replace the ScrollView close + footer with a new structure:
// ScrollView closes, then fixed footer OUTSIDE ScrollView
const oldClose = `        </ScrollView>\r\n      </KeyboardAvoidingView>`;
const newClose = `        </ScrollView>\r\n\r\n          {step !== 'PENDING_VERIFICATION' && step !== 'REJECTED' && (\r\n          <View className="px-6 pb-2">\r\n            {step === 'ROLE' && (\r\n              <TouchableOpacity onPress={() => setShowRegisterModal(true)} className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-[16px] flex-row items-center justify-between mb-3 shadow-sm">\r\n                <View className="flex-row items-center">\r\n                  <View className="bg-[#10b981] p-2.5 rounded-[12px] mr-3 shadow-sm shadow-emerald-100">\r\n                    <Icons.Plus size={18} color="white" />\r\n                  </View>\r\n                  <View>\r\n                    <Text className="font-black text-[#047857] text-xs font-inter-black">Register Institute</Text>\r\n                    <Text className="text-[9px] text-[#059669] font-medium opacity-70 font-inter-medium">New organization account</Text>\r\n                  </View>\r\n                </View>\r\n                <Icons.ChevronRight size={14} color="#10b981" />\r\n              </TouchableOpacity>\r\n            )}\r\n            <View className="flex-row items-center justify-around py-4 border-t border-indigo-100/20">\r\n              <View className="items-center">\r\n                <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mb-1.5">\r\n                  <Icons.Shield size={14} color="#6366f1" />\r\n                </View>\r\n                <Text className="text-[10px] font-inter-bold text-gray-400">Secure</Text>\r\n              </View>\r\n              <View className="items-center">\r\n                <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mb-1.5">\r\n                  <Icons.Lock size={14} color="#6366f1" />\r\n                </View>\r\n                <Text className="text-[10px] font-inter-bold text-gray-400">Encrypted</Text>\r\n              </View>\r\n              <View className="items-center">\r\n                <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mb-1.5">\r\n                  <Icons.Check size={14} color="#6366f1" />\r\n                </View>\r\n                <Text className="text-[10px] font-inter-bold text-gray-400">Trusted</Text>\r\n              </View>\r\n            </View>\r\n            <View className="items-center pb-1">\r\n              <Text className="text-[8px] text-gray-400 font-bold uppercase tracking-widest font-inter-bold">Oureduca Infrastructure</Text>\r\n            </View>\r\n          </View>\r\n          )}\r\n\r\n      </KeyboardAvoidingView>`;

if (c.includes(oldClose)) {
  c = c.replace(oldClose, newClose);
  console.log('3. Moved footer outside ScrollView');
} else {
  console.log('3. FAILED - ScrollView close not found');
}

// 4. Remove the old inline footer block that was inside ScrollView
const oldInlineFooter = `          {step !== 'PENDING_VERIFICATION' && step !== 'REJECTED' && (\r\n          <View className="mt-4">\r\n             {step === 'ROLE' && (\r\n                <TouchableOpacity onPress={() => setShowRegisterModal(true)} className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-[16px] flex-row items-center justify-between mb-4 shadow-sm">\r\n                  <View className="flex-row items-center">\r\n                    <View className="bg-[#10b981] p-2.5 rounded-[12px] mr-3 shadow-sm shadow-emerald-100">\r\n                      <Icons.Plus size={18} color="white" />\r\n                    </View>\r\n                    <View>\r\n                      <Text className="font-black text-[#047857] text-xs font-inter-black">Register Institute</Text>\r\n                      <Text className="text-[9px] text-[#059669] font-medium opacity-70 font-inter-medium">New organization account</Text>\r\n                    </View>\r\n                  </View>\r\n                  <Icons.ChevronRight size={14} color="#10b981" />\r\n                </TouchableOpacity>\r\n             )}\r\n\r\n             <View className="items-center">\r\n               <Text className="text-[8px] text-gray-400 font-bold uppercase tracking-widest font-inter-bold">Oureduca Infrastructure</Text>\r\n             </View>\r\n          </View>\r\n          )}`;

if (c.includes(oldInlineFooter)) {
  c = c.replace(oldInlineFooter, '');
  console.log('4. Removed old inline footer from ScrollView');
} else {
  console.log('4. FAILED - old inline footer not found');
}

// 5. Also remove justify-between from renderLoginForm since footer moved out
const loginFormJB = `className="w-full flex-1 justify-between py-2"`;
const loginFormFixed = `className="w-full flex-1 py-2"`;
if (c.includes(loginFormJB)) {
  c = c.replace(loginFormJB, loginFormFixed);
  console.log('5. Removed justify-between from renderLoginForm');
} else {
  console.log('5. FAILED - justify-between not found');
}

fs.writeFileSync(path, c);
console.log('Done!');
