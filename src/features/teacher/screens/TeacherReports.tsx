import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '../../../../components/Icons';
import { SkeletonCard, SkeletonRow, PlatinumHeader } from '../../../design-system';
import { supabase } from '../../../../lib/supabase';
import { useSchoolData } from '../../../../contexts/SchoolDataContext';
import { useMockAuth } from '../../../../contexts/MockAuthContext';

interface TeacherReportsProps {
    assignedSections: any[];
    dbRoster: any[];
    onBack: () => void;
    onShowToast: (msg: string) => void;
    initialClassId?: string | null;
}

export const TeacherReports: React.FC<TeacherReportsProps> = ({
    assignedSections = [],
    dbRoster = [],
    onBack,
    onShowToast,
    initialClassId = null
}) => {
    const { currentUser } = useMockAuth();
    const insets = useSafeAreaInsets();
    const { assignments: globalAssignments } = useSchoolData();
    const [selectedFilter, setSelectedFilter] = useState<string | null>(
        initialClassId ? `${initialClassId}::A` : null
    );

    const selectedClass = useMemo(() => {
        if (!selectedFilter) return null;
        const [cId, sec] = selectedFilter.split('::');
        return assignedSections.find(s => 
            String(s.class_id || s.id) === cId && (s.section || 'A') === sec
        );
    }, [assignedSections, selectedFilter]);

    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // PLATINUM FIX: isMounted cleanup prevents Race Conditions during rapid clicking
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                let liveGrades = [];
                if (selectedFilter) {
                    const [cId, sec] = selectedFilter.split('::');
                    // Explicitly filter by BOTH class and section
                    const { data, error } = await supabase
                        .from('grades')
                        .select('marks, student_id, class_id')
                        .eq('class_id', cId);
                    
                    // Note: If 'section' column exists, add .eq('section', sec). 
                    // Filtering in JS for now as safety fallback.
                    if (error) throw error;
                    liveGrades = data || [];
                } else {
                    const classIds = assignedSections.map(s => s.class_id || s.id);
                    if (classIds.length > 0) {
                        const { data, error } = await supabase.from('grades').select('marks, student_id, class_id').in('class_id', classIds);
                        if (error) throw error;
                        liveGrades = data || [];
                    }
                }
                if (isMounted) {
                    setGrades(liveGrades);
                }
            } catch (err) {
                console.error('Report fetch error:', err);
                if (isMounted) {
                    // PLATINUM FIX: Alert the teacher if network drops
                    onShowToast("Failed to sync institutional data. Check connection.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [selectedFilter, assignedSections, onShowToast]);

    const assignments = useMemo(() => {
        if (selectedFilter) {
            const [cId] = selectedFilter.split('::');
            const filtered = globalAssignments.filter(a => String(a.class_id) === cId);
            return filtered;
        }
        const classIds = assignedSections.map(s => String(s.class_id || s.id));
        return globalAssignments.filter(a => classIds.includes(String(a.class_id)));
    }, [globalAssignments, selectedFilter, assignedSections]);

    const reportStats = useMemo(() => {
        const currentStudents = selectedFilter
            ? dbRoster.filter(s => {
                const [cId, sec] = selectedFilter.split('::');
                return String(s.class_id) === cId && (s.section || 'A') === sec;
            })
            : dbRoster;
            
        const studentIdsInView = currentStudents.map(s => s.user_id || s.users?.id);
        const gradesInView = grades.filter(g => studentIdsInView.includes(g.student_id));
        
        const allMarks = gradesInView.map(g => Number(g.marks));
        const calculatedAvg = allMarks.length > 0
            ? (allMarks.reduce((a, b) => a + b, 0) / allMarks.length).toFixed(1)
            : "0.0";

        const studentStats = currentStudents.map(s => {
            const sId = s.user_id || s.users?.id;
            const sGrades = gradesInView.filter(g => g.student_id === sId);
            const totalMarks = sGrades.reduce((acc, g) => acc + Number(g.marks), 0);
            const avg = sGrades.length > 0 ? totalMarks / sGrades.length : 0;
            return { ...s, avg, count: sGrades.length };
        });

        const weakData = studentStats.filter(s => s.count > 0 && s.avg < 40);
        const topData = studentStats.filter(s => s.count > 0 && s.avg >= 80).sort((a, b) => b.avg - a.avg).slice(0, 5);

        const calculatedProgress = (assignments.length > 0 && currentStudents.length > 0)
            ? Math.min(100, Math.round((gradesInView.length / (currentStudents.length * assignments.length)) * 100))
            : 0;

        return { 
            total: currentStudents.length, 
            avg: calculatedAvg, 
            weak: weakData, 
            top: topData, 
            progress: calculatedProgress 
        };
    }, [selectedFilter, grades, dbRoster, assignments]);

    const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(style);
        }
    };

    const handleExport = async () => {
        if (isExporting) return;
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        setIsExporting(true);

        try {
            // 1. Compile the Data into a CSV format
            const header = "Student Name,Roll Number,Average Grade (%),Total Assignments Graded\n";
            
            const allStudentsInView = selectedFilter
                ? dbRoster.filter(s => {
                    const [cId, sec] = selectedFilter.split('::');
                    return String(s.class_id) === cId && (s.section || 'A') === sec;
                })
                : dbRoster;

            const rows = allStudentsInView.map(s => {
                const sId = s.user_id || s.users?.id;
                const sGrades = grades.filter(g => g.student_id === sId);
                const totalMarks = sGrades.reduce((acc, g) => acc + Number(g.marks), 0);
                const avg = sGrades.length > 0 ? (totalMarks / sGrades.length).toFixed(1) : 0;
                
                return `"${s.users?.name || 'Unknown'}","${s.users?.roll_number || 'N/A'}",${avg},${sGrades.length}`;
            }).join("\n");

            const csvString = header + rows;

            // 2. Create a temporary file on the device
            const filename = `Class_Report_${Date.now()}.csv`;
            const fileUri = `${FileSystem.documentDirectory}${filename}`;
            
            // 3. Write the data to the file
            await FileSystem.writeAsStringAsync(fileUri, csvString, { 
                encoding: 'utf8' 
            });

            // 4. Trigger the native iOS/Android Share Sheet
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    dialogTitle: 'Export Class Report',
                    UTI: 'public.comma-separated-values-text'
                });
                onShowToast("Report generated successfully!");
            } else {
                onShowToast("Sharing is not available on this device.");
            }

        } catch (err) {
            console.error("Export Error: ", err);
            onShowToast("Failed to generate the report file.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50/50">
            <PlatinumHeader
                title="Class Progress"
                subtitle={selectedClass ? `${selectedClass.name} • ${selectedClass.subject}` : 'Institutional Analytics'}
                onBack={() => { triggerHaptic(); onBack(); }}
                rightAction={
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity className="p-2 bg-gray-50 rounded-full border border-gray-100">
                            <Icons.Search size={18} color="#6b7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleExport}
                            disabled={isExporting}
                            className="bg-emerald-600 px-4 py-2 rounded-xl shadow-lg active:scale-95 flex-row items-center"
                        >
                            {isExporting ? (
                                <ActivityIndicator size="small" color="white" style={{ marginRight: 4 }} />
                            ) : null}
                            <Text className="text-white text-[10px] font-inter-black uppercase">
                                {isExporting ? 'Exporting...' : 'Export'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />
            <View className="px-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 pb-2">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setSelectedFilter(null)}
                        className={`px-4 py-2 rounded-xl border mr-2 ${!selectedFilter ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200' : 'bg-gray-50 border-gray-100'}`}
                    >
                        <Text className={`text-[8px] font-black uppercase tracking-widest font-inter-black ${!selectedFilter ? 'text-white' : 'text-gray-400'}`}>All Classes</Text>
                    </TouchableOpacity>
                    {assignedSections.map((item, idx) => {
                        const filterKey = `${item.class_id || item.id}::${item.section || 'A'}`;
                        const isSelected = selectedFilter === filterKey;
                        
                        return (
                            <TouchableOpacity
                                key={idx}
                                activeOpacity={0.7}
                                onPress={() => setSelectedFilter(filterKey)}
                                className={`px-4 py-2 rounded-xl border mr-2 ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200' : 'bg-gray-50 border-gray-100'}`}
                            >
                                <Text className={`text-[8px] font-black uppercase tracking-widest font-inter-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                    {`${item.name}-${item.section || 'A'} • ${item.subject}`}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {loading ? (
                <ScrollView className="flex-1 px-4 pt-6">
                    <View className="flex-row gap-3 mb-3">
                        <SkeletonCard className="flex-1" />
                        <SkeletonCard className="flex-1" />
                    </View>
                    <View className="flex-row gap-3 mb-6">
                        <SkeletonCard className="flex-1" />
                        <SkeletonCard className="flex-1" />
                    </View>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                </ScrollView>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Metric Grid */}
                    <View className="px-4 pt-6">
                        <View className="flex-row gap-3 mb-3">
                            <View className="flex-1 bg-white p-5 rounded-2xl border border-white shadow-lg shadow-indigo-100/10">
                                <Icons.Profile size={16} color="#4f46e5" />
                                <Text
                                    className="text-[24px] text-gray-900 font-inter-black mt-2"
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {reportStats.total}
                                </Text>
                                <Text className="text-[8px] font-inter-bold uppercase text-gray-400 tracking-widest mt-0.5">Students</Text>
                            </View>
                            <View className="flex-1 bg-white p-5 rounded-2xl border border-white shadow-lg shadow-indigo-100/10">
                                <Icons.CheckCircle size={16} color="#10b981" />
                                <Text
                                    className="text-[24px] text-gray-900 font-inter-black mt-2"
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {`${reportStats.avg}%`}
                                </Text>
                                <Text className="text-[8px] font-inter-bold uppercase text-gray-400 tracking-widest mt-0.5">Avg Yield</Text>
                            </View>
                        </View>
                        <View className="flex-row gap-3">
                            <View className="flex-1 bg-rose-50 p-5 rounded-2xl border border-rose-100 shadow-lg shadow-rose-100/10">
                                <Icons.Alert size={16} color="#ef4444" />
                                <Text
                                    className="text-[24px] text-rose-600 font-inter-black mt-2"
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {reportStats.weak.length}
                                </Text>
                                <Text className="text-[8px] font-inter-bold uppercase text-rose-400 tracking-widest mt-0.5">Weak Students</Text>
                            </View>
                            <View className="flex-1 bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-100/10">
                                <Icons.Refresh size={16} color="#4f46e5" />
                                <Text
                                    className="text-[24px] text-indigo-600 font-inter-black mt-2"
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {reportStats.progress}%
                                </Text>
                                <Text className="text-[8px] font-inter-bold uppercase text-indigo-400 tracking-widest mt-0.5">Grading Progress</Text>
                            </View>
                        </View>
                    </View>

                    {/* Top Performers */}
                    {reportStats.top.length > 0 && (
                        <View className="px-5 pt-4">
                            <Text className="text-[9px] font-black text-emerald-600 uppercase tracking-[3px] mb-4 font-inter-black text-center">Academic Excellence</Text>
                            <View className="bg-emerald-50 p-5 rounded-[28px] border border-emerald-100 shadow-xl shadow-emerald-100/20 mb-6">
                                {reportStats.top.map((s, i) => (
                                    <View key={i} className="flex-row items-center justify-between mb-4 pb-4 border-b border-emerald-100/30 last:border-b-0">
                                        <View className="flex-row items-center flex-1 pr-2">
                                            <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-3 border border-emerald-200 flex-none">
                                                <Text className="text-[12px] font-black text-emerald-600 font-inter-black">#{i + 1}</Text>
                                            </View>
                                            <View className="flex-1">
                                                {/* PLATINUM FIX: numberOfLines to prevent layout breaking */}
                                                <Text className="text-[14px] font-black text-gray-900 font-inter-black" numberOfLines={1} ellipsizeMode="tail">
                                                    {s.users?.name || 'Student'}
                                                </Text>
                                                <Text className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Performance Master: {s.avg.toFixed(1)}%</Text>
                                            </View>
                                        </View>
                                        <Icons.Star size={16} color="#10b981" className="flex-none" />
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Student List */}
                    <View className="px-5 pt-4">
                        <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[3px] mb-4 font-inter-black text-center">Intervention Required</Text>

                        <View className="bg-white p-5 rounded-[28px] border border-white shadow-xl shadow-indigo-100/20">
                            {reportStats.weak.length > 0 ? (
                                <View>
                                    {reportStats.weak.map((s, i) => (
                                        <View key={i} className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-50 last:border-b-0">
                                            <View className="flex-row items-center flex-1 pr-2">
                                                <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mr-3 border border-rose-100 flex-none">
                                                    <Icons.Profile size={16} color="#ef4444" />
                                                </View>
                                                <View className="flex-1">
                                                    {/* PLATINUM FIX: numberOfLines to prevent layout breaking */}
                                                    <Text className="text-[14px] font-black text-gray-900 font-inter-black" numberOfLines={1} ellipsizeMode="tail">
                                                        {s.users?.name || 'Student'}
                                                    </Text>
                                                    <Text className="text-[8px] font-black text-rose-400 uppercase tracking-widest mt-0.5">Avg: {s.avg.toFixed(1)}% • Action Needed</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex-none active:scale-95">
                                                <Icons.Messages size={14} color="#64748b" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View className="py-8 items-center">
                                    <Icons.CheckCircle size={40} color="#10b981" />
                                    <Text className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mt-4 font-inter-black">All students above baseline</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};