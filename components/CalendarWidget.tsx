import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from './Icons';

const StyledLinearGradient = styled(LinearGradient);

const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

interface CalendarEvent {
    id: string;
    title: string;
    type: 'academic' | 'holiday' | 'exam' | 'meeting';
    time?: string;
}

const FIXED_HOLIDAYS: Record<string, string> = {
  '01-26': 'Republic Day',
  '08-15': 'Independence Day',
  '10-02': 'Gandhi Jayanti',
  '12-25': 'Christmas',
  '01-01': 'New Year\'s Day',
  '04-14': 'Ambedkar Jayanti',
  '05-01': 'Labour Day'
};

const VARIABLE_HOLIDAYS_2024: Record<string, string> = {
  '2024-01-15': 'Makar Sankranti / Pongal',
  '2024-03-08': 'Maha Shivaratri',
  '2024-03-25': 'Holi',
  '2024-03-29': 'Good Friday',
  '2024-04-09': 'Ugadi / Gudi Padwa',
  '2024-04-11': 'Eid-ul-Fitr',
  '2024-04-17': 'Ram Navami',
  '2024-06-17': 'Bakrid / Eid al-Adha',
  '2024-07-17': 'Muharram',
  '2024-08-19': 'Raksha Bandhan',
  '2024-08-26': 'Janmashtami',
  '2024-09-07': 'Ganesh Chaturthi',
  '2024-09-16': 'Eid-e-Milad',
  '2024-10-12': 'Dussehra',
  '2024-11-01': 'Diwali',
  '2024-11-15': 'Guru Nanak Jayanti',
};

const VARIABLE_HOLIDAYS_2025: Record<string, string> = {
    '2025-01-14': 'Makar Sankranti',
    '2025-03-14': 'Holi',
    '2025-10-20': 'Diwali' 
};

interface CalendarWidgetProps {
  className?: string; 
  canAddEvents?: boolean;
  compact?: boolean;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ 
  className = '', 
  canAddEvents = true,
  compact = false 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});

  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'meeting', time: '', ampm: 'AM' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const initialEvents: Record<string, CalendarEvent[]> = {};
    const yearsToLoad = [year, year + 1];

    yearsToLoad.forEach(y => {
        const date = new Date(y, 0, 1);
        while (date.getDay() !== 0) {
            date.setDate(date.getDate() + 1);
        }
        while (date.getFullYear() === y) {
            const key = formatDateKey(y, date.getMonth(), date.getDate());
            if (!initialEvents[key]) initialEvents[key] = [];
            if (!initialEvents[key].some(e => e.title === 'Sunday')) {
                initialEvents[key].push({
                    id: `sun-${key}`,
                    title: 'Sunday Holiday',
                    type: 'holiday'
                });
            }
            date.setDate(date.getDate() + 7);
        }

        const varHolidays = y === 2024 ? VARIABLE_HOLIDAYS_2024 : y === 2025 ? VARIABLE_HOLIDAYS_2025 : {};
        Object.entries(varHolidays).forEach(([dateStr, title]) => {
             if (!initialEvents[dateStr]) initialEvents[dateStr] = [];
             if (!initialEvents[dateStr].some(e => e.title === title)) {
                 initialEvents[dateStr].push({
                     id: `hol-${dateStr}`,
                     title: title,
                     type: 'holiday'
                 });
             }
        });

        Object.entries(FIXED_HOLIDAYS).forEach(([datePart, title]) => {
            const fullDate = `${y}-${datePart}`;
            if (!initialEvents[fullDate]) initialEvents[fullDate] = [];
            if (!initialEvents[fullDate].some(e => e.title === title)) {
                 initialEvents[fullDate].push({
                    id: `fix-${fullDate}`,
                    title: title,
                    type: 'holiday'
                });
            }
        });
    });

    const today = new Date();
    if (year === today.getFullYear()) {
        const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
        if(!initialEvents[todayKey]) initialEvents[todayKey] = [];
        if(!initialEvents[todayKey].some(e => e.id === 'today1')) {
            initialEvents[todayKey].push({ id: 'today1', title: 'Daily Assembly', type: 'academic', time: '08:00 AM' });
        }
    }

    setEvents(prev => {
        const merged = { ...prev };
        Object.keys(initialEvents).forEach(k => {
            if (!merged[k]) {
                merged[k] = initialEvents[k];
            } else {
                initialEvents[k].forEach(newEvt => {
                    if (!merged[k].some(e => e.id === newEvt.id)) {
                        merged[k].push(newEvt);
                    }
                });
            }
        });
        return merged;
    });
  }, [year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); };
  const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); };

  const handleDateClick = (day: number) => {
      const newDate = new Date(year, month, day);
      setSelectedDate(newDate);
  };

  const getEventsForDate = (day: number) => {
      const key = formatDateKey(year, month, day);
      return events[key] || [];
  };

  const isToday = (day: number) => {
      const today = new Date();
      return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (day: number) => {
      if (!selectedDate) return false;
      return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  const selectedEvents = selectedDate ? (events[formatDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())] || []) : [];

  const openAddModal = () => {
      if (!selectedDate) return;
      setNewEvent({ title: '', type: 'meeting', time: '', ampm: 'AM' });
      setShowModal(true);
  };

  const handleSaveEvent = () => {
      if (!selectedDate || !newEvent.title.trim()) return;

      const key = formatDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const eventToAdd: CalendarEvent = {
          id: Date.now().toString(),
          title: newEvent.title,
          type: newEvent.type as CalendarEvent['type'],
          time: newEvent.time ? `${newEvent.time} ${newEvent.ampm}` : 'All Day'
      };

      setEvents(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), eventToAdd]
      }));
      setShowModal(false);
  };

  const getTypeColor = (type: string) => {
      if(type === 'holiday') return 'bg-red-400';
      if(type === 'exam') return 'bg-orange-400';
      return 'bg-indigo-400';
  };

  return (
    <View className={`${compact ? 'p-0' : 'bg-white p-6 rounded-[32px] shadow-sm border border-gray-100'} flex-1 ${className}`}>
      {/* Header Row — Hidden in compact mode */}
      {!compact && (
        <View className="flex-row items-center mb-6">
          <View className="w-10 h-10 rounded-2xl bg-indigo-50 items-center justify-center mr-3 border border-indigo-100/50">
              <Icons.Calendar size={20} color="#4f46e5" />
          </View>
          <View>
              <Text className="text-xl font-black text-gray-900 tracking-tighter">Academic Calendar</Text>
              <Text className="text-[9px] text-gray-400 font-black uppercase tracking-[2px] mt-1">Institutional Schedule</Text>
          </View>
        </View>
      )}

      {/* Month Navigator */}
      <View className={`bg-gray-50 rounded-[20px] p-2 flex-row items-center justify-between ${compact ? 'mb-4' : 'mb-6'} border border-gray-100/50`}>
          <TouchableOpacity onPress={prevMonth} className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100`}>
              <Icons.ChevronRight size={14} color="#4f46e5" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          
          <Text className="text-[11px] font-black text-indigo-600 uppercase tracking-[2px]">
              {months[month]} {year}
          </Text>

          <TouchableOpacity onPress={nextMonth} className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100`}>
              <Icons.ChevronRight size={14} color="#4f46e5" />
          </TouchableOpacity>
      </View>
      
      <View className={`flex-row justify-between ${compact ? 'mb-2' : 'mb-4'} px-2`}>
        {days.map(d => (
          <Text key={d} className={`text-[10px] font-black py-1 w-[13%] text-center uppercase ${d === 'Su' ? 'text-red-400' : 'text-gray-400'}`}>{d}</Text>
        ))}
      </View>
      
      <View className="flex-row flex-wrap mb-0 h-48">
        {Array(firstDayOfMonth).fill(null).map((_, i) => <View key={`blank-${i}`} className="w-[14.28%] aspect-square" />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dateEvents = getEventsForDate(day);
            const hasEvent = dateEvents.length > 0;
            const hasHoliday = dateEvents.some(e => e.type === 'holiday');
            const today = isToday(day);
            const selected = isSelected(day);
            
            const currentDayDate = new Date(year, month, day);
            const isSunday = currentDayDate.getDay() === 0;

            const boxStyle = [
                "w-[14.28%] aspect-square flex-col items-center justify-center rounded-2xl my-0.5 relative",
                selected ? "bg-indigo-600 shadow-xl shadow-indigo-200 z-10 scale-110" : "bg-transparent",
                today && !selected ? "border border-indigo-200 bg-indigo-50/50" : "",
                (isSunday || hasHoliday) && !selected ? "bg-red-50/30" : ""
            ].join(" ");

            const textStyle = [
                "text-[11px]",
                selected ? "text-white font-black" : "text-gray-700 font-medium",
                today && !selected ? "text-indigo-600 font-black" : "",
                (isSunday || hasHoliday) && !selected ? "text-rose-500 font-black" : ""
            ].join(" ");

            return (
                <TouchableOpacity 
                    key={day} 
                    onPress={() => handleDateClick(day)}
                    className={boxStyle}
                >
                    {selected && (
                        <StyledLinearGradient 
                            colors={['#4f46e5', '#3730a3']}
                            className="absolute inset-0 rounded-2xl"
                        />
                    )}
                    <Text className={textStyle}>{day}</Text>
                    {hasEvent && !selected && (
                        <View className="mt-1 flex-row gap-0.5">
                           {dateEvents.slice(0,3).map((ev, i) => (
                               <View key={i} className={`w-1 h-1 rounded-full ${getTypeColor(ev.type)}`}></View>
                           ))}
                        </View>
                    )}
                </TouchableOpacity>
            );
        })}
      </View>
      
      {/* Selected Date Events */}
      <View className="mt-2 pt-4 border-t border-gray-100 flex-1 min-h-[100px]">
         <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-black text-gray-900">
                {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a date'}
            </Text>
            {selectedDate && canAddEvents && (
                <TouchableOpacity 
                    className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100/50 flex-row items-center"
                    onPress={openAddModal}
                >
                    <Icons.Plus size={12} color="#4f46e5" />
                    <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1.5">Add Event</Text>
                </TouchableOpacity>
            )}
         </View>

         <ScrollView className="flex-1">
             {selectedEvents && selectedEvents.length > 0 ? (
                 selectedEvents.map((evt, idx) => (
                     <View key={idx} className="flex-row items-center p-2 mb-2 rounded-lg bg-gray-50 border border-gray-100">
                         <View className={`w-2 h-2 rounded-full mr-3 ${getTypeColor(evt.type)}`}></View>
                         <View className="flex-1">
                             <Text className="text-[11px] font-black text-gray-800" numberOfLines={1}>{evt.title}</Text>
                             {evt.time && <Text className="text-[10px] text-gray-500">{evt.time}</Text>}
                         </View>
                     </View>
                 ))
             ) : (
                 <View className="items-center justify-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                     <Text className="text-[11px] text-gray-400">No events scheduled.</Text>
                 </View>
             )}
         </ScrollView>
      </View>

      {/* Add Event Modal — Platinum Standard */}
      <Modal visible={showModal} transparent animationType="fade">
         <View className="flex-1 bg-black/60 items-center justify-center p-6">
            <View className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl shadow-indigo-200/40 relative overflow-hidden border border-white">
                {/* Decorative Institutional Accent */}
                <View className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500" />
                
                <TouchableOpacity 
                    onPress={() => setShowModal(false)} 
                    className="absolute top-6 right-6 p-2 bg-gray-50 rounded-xl z-[100] border border-gray-100 active:scale-95 shadow-sm"
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Icons.Close size={18} color="#64748b"/>
                </TouchableOpacity>

                <View className="mb-8">
                    <Text className="text-2xl font-black text-gray-900 tracking-tighter font-inter-black">New Milestone</Text>
                    <Text className="text-[10px] text-gray-400 font-black uppercase tracking-[3px] mt-1.5 font-inter-black">
                        {selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                </View>
                
                <View className="space-y-6">
                    <View>
                        <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-2 px-1 font-inter-black">Activity Designation</Text>
                        <TextInput 
                            className="w-full border border-gray-100 bg-gray-50 rounded-2xl p-4 text-[13px] font-black text-gray-900 shadow-inner font-inter-black"
                            placeholder="e.g. Physics Laboratory Sync"
                            placeholderTextColor="#94a3b8"
                            value={newEvent.title}
                            onChangeText={(text) => setNewEvent({...newEvent, title: text})}
                        />
                    </View>
                    
                    <View className="mt-4">
                        <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-2 px-1 font-inter-black">Institutional Category</Text>
                        <View className="flex-row gap-2">
                           {['academic', 'exam', 'meeting'].map(type => (
                             <TouchableOpacity 
                               key={type}
                               onPress={() => setNewEvent({...newEvent, type})}
                               className={`flex-1 py-3 rounded-xl items-center border ${newEvent.type === type ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-100'}`}
                             >
                               <Text className={`text-[10px] font-black uppercase tracking-wider ${newEvent.type === type ? 'text-indigo-600' : 'text-gray-400'} font-inter-black`}>
                                 {type}
                               </Text>
                             </TouchableOpacity>
                           ))}
                        </View>
                    </View>

                    <View className="mt-4">
                        <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-2 px-1 font-inter-black">Temporal Synchronization</Text>
                        <View className="flex-row items-center gap-3">
                            <View className="flex-1">
                                <TextInput 
                                    className="w-full border border-gray-100 bg-white rounded-2xl p-4 text-[13px] font-black text-gray-900 shadow-sm font-inter-black"
                                    placeholder="09:30"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    value={newEvent.time}
                                    onChangeText={(text) => setNewEvent({...newEvent, time: text})}
                                />
                            </View>
                            <View className="flex-row bg-gray-50 p-1 rounded-2xl border border-gray-100 shadow-inner">
                                 {['AM', 'PM'].map(p => (
                                   <TouchableOpacity 
                                      key={p}
                                      onPress={() => setNewEvent({...newEvent, ampm: p as 'AM' | 'PM'})}
                                      className={`px-4 py-3 rounded-xl ${newEvent.ampm === p ? 'bg-white shadow-sm border border-gray-100' : 'bg-transparent'}`}
                                   >
                                       <Text className={`text-[10px] font-black ${newEvent.ampm === p ? 'text-indigo-600' : 'text-gray-400'} font-inter-black`}>{p}</Text>
                                   </TouchableOpacity>
                                 ))}
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity 
                        onPress={handleSaveEvent}
                        activeOpacity={0.9}
                        className="w-full bg-indigo-600 py-4 rounded-2xl flex-row justify-center items-center mt-6 shadow-xl shadow-indigo-200 border border-indigo-500"
                    >
                        <Text className="text-white font-black uppercase tracking-[3px] text-[11px] font-inter-black">Validate Milestone</Text>
                    </TouchableOpacity>
                </View>
            </View>
         </View>
      </Modal>
    </View>
  );
};
