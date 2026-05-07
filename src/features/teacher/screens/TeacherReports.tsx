import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Platform, ActivityIndicator, TextInput, Alert, TouchableOpacity } from 'react-native';
import { triggerHaptic, ImpactFeedbackStyle } from '../../../utils/haptics';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '../../../../components/Icons';
import { SkeletonCard, SkeletonRow, PlatinumHeader } from '../../../design-system';
import { supabase } from '../../../../lib/supabase';
import { useMockAuth } from '../../../../contexts/MockAuthContext';

interface TeacherReportsProps {
    assignedSections: any[];
    onBack: () => void;
    onShowToast: (msg: string) => void;
    initialClassId?: string | null;
    onMessageStudent?: (studentId: string, template?: string) => void;
}

export const TeacherReports = React.memo<TeacherReportsProps>(({
    assignedSections = [],
    onBack,
    onShowToast,
    initialClassId = null,
    onMessageStudent
}) => {
    const { currentUser } = useMockAuth();
    const insets = useSafeAreaInsets();
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
    const [students, setStudents] = useState<any[]>([]);
    const [localAssignments, setLocalAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportStep, setExportStep] = useState(0); // 0: Idle, 1: Preparing, 2: Generating, 3: Sharing
    const [search, setSearch] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const fetchData = useCallback(async (isMounted = true) => {
        setLoading(true);
        setFetchError(false);
        try {
            const classIds = selectedFilter 
                ? [selectedFilter.split('::')[0]]
                : assignedSections.map(s => String(s.class_id || s.id));

            if (classIds.length === 0) {
                if (isMounted) {
                    setGrades([]);
                    setStudents([]);
                }
                return;
            }

            // Parallel Data Fetch for Performance
            const [gradesRes, rosterRes, assignmentsRes] = await Promise.all([
                supabase.from('grades')
                    .select('student_id, marks, assignment_id, class_id')
                    .in('class_id', classIds),
                supabase.from('class_roster')
                    .select('user_id, users(id, name, roll_number), class_id, section')
                    .in('class_id', classIds)
                    .eq('role_in_class', 'student'),
                supabase.from('assignments')
                    .select('id, title, max_marks, pass_percentage, class_id')
                    .in('class_id', classIds)
            ]);

            if (gradesRes.error) throw gradesRes.error;
            if (rosterRes.error) throw rosterRes.error;
            if (assignmentsRes.error) throw assignmentsRes.error;

            if (isMounted) {
                setGrades(gradesRes.data || []);
                setStudents(rosterRes.data || []);
                setLocalAssignments(assignmentsRes.data || []);
            }
        } catch (err) {
            console.error('Report fetch error:', err);
            if (isMounted) {
                setFetchError(true);
                onShowToast("Failed to sync institutional data.");
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    }, [selectedFilter, assignedSections, onShowToast]);

    useEffect(() => {
        let isMounted = true;
        fetchData(isMounted);
        return () => { isMounted = false; };
    }, [fetchData]);

    const assignments = useMemo(() => {
        if (selectedFilter) {
            const [cId] = selectedFilter.split('::');
            const filtered = localAssignments.filter(a => String(a.class_id) === cId);
            return filtered;
        }
        const classIds = assignedSections.map(s => String(s.class_id || s.id));
        return localAssignments.filter(a => classIds.includes(String(a.class_id)));
    }, [localAssignments, selectedFilter, assignedSections]);

    const reportStats = useMemo(() => {
        const currentStudents = (selectedFilter
            ? students.filter(s => {
                const [cId, sec] = selectedFilter.split('::');
                return String(s.class_id) === cId && (s.section || 'A') === sec;
            })
            : students).filter(s => 
                s.users?.name?.toLowerCase().includes(search.toLowerCase()) || 
                s.users?.roll_number?.toLowerCase().includes(search.toLowerCase())
            );
            
        const studentIdsInView = currentStudents.map(s => s.user_id || s.users?.id);
        const gradesInView = grades.filter(g => studentIdsInView.includes(g.student_id));
        
        const classPercentages = gradesInView.map(g => {
            const asn = assignments.find(a => a.id === g.assignment_id);
            const max = asn?.max_marks ?? 100;
            return (Number(g.marks) / max) * 100;
        });

        const calculatedAvg = classPercentages.length > 0
            ? (classPercentages.reduce((a, b) => a + b, 0) / classPercentages.length).toFixed(1)
            : "0.0";

        const studentStats = currentStudents.map(s => {
            const sId = s.user_id || s.users?.id;
            const sGrades = gradesInView.filter(g => g.student_id === sId);
            
            const percentages = sGrades.map(g => {
                const asn = assignments.find(a => a.id === g.assignment_id);
                const max = asn?.max_marks ?? 100;
                return (Number(g.marks) / max) * 100;
            });

            const avg = percentages.length > 0 ? percentages.reduce((a, b) => a + b, 0) / percentages.length : 0;
            return { ...s, avg, count: sGrades.length };
        });

        // Each assignment can have its own pass threshold; use the average pass threshold across all assignments in view
        const avgPassThreshold = assignments.length > 0
            ? assignments.reduce((sum, a) => sum + (a.pass_percentage ?? 40), 0) / assignments.length
            : 40;

        const weakData = studentStats.filter(s => s.count > 0 && s.avg < avgPassThreshold);
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
    }, [selectedFilter, grades, students, assignments, search]);


    const buildReportHtml = (stats: any, cls: any) => `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #4f46e5; margin-bottom: 5px;">Progress Report</h1>
              <p style="color: #666; font-size: 14px;">Institutional Analytics Node</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
              <h2 style="margin-top: 0;">Class Overview</h2>
              <p><strong>Subject:</strong> ${cls?.subject ?? 'All Classes'}</p>
              <p><strong>Class:</strong> ${cls?.name ?? 'All Sections'}</p>
              <p><strong>Students Enrolled:</strong> ${stats.total}</p>
              <p><strong>Average Yield:</strong> ${stats.avg}%</p>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="color: #10b981;">Top Scholars</h2>
              <table style="width: 100%; border-collapse: collapse;">
                ${stats.top.map((s: any) => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0;">${s.users?.name || 'Unknown Student'}</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: bold;">${s.avg.toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </table>
            </div>

            <div>
              <h2 style="color: #ef4444;">Academic Interventions Required</h2>
              <table style="width: 100%; border-collapse: collapse;">
                ${stats.weak.map((s: any) => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0;">${s.users?.name || 'Unknown Student'}</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #ef4444;">${s.avg.toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </table>
            </div>
            
            <div style="margin-top: 50px; border-top: 1px solid #eee; pt: 20px; font-size: 10px; color: #999; text-align: center;">
              Generated via OurEduca Platinum Portal on ${new Date().toLocaleDateString('en-IN')}
            </div>
          </body>
        </html>
    `;

    const handleExport = async () => {
        if (isExporting) return;
        triggerHaptic(ImpactFeedbackStyle.Medium);
        setIsExporting(true);

        try {
            setExportStep(1); // Preparing data
            const html = buildReportHtml(reportStats, selectedClass);

            setExportStep(2); // Generating PDF
            const { uri } = await Print.printToFileAsync({ html, base64: false });

            setExportStep(3); // Sharing
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `Report — ${selectedClass?.name ?? 'Institutional Analytics'}`,
                    UTI: 'com.adobe.pdf'
                });
                onShowToast("Report generated successfully!");
            } else {
                onShowToast("Sharing is not available on this device.");
            }

        } catch (err) {
            console.error("Export Error: ", err);
            onShowToast("Failed to generate the PDF report.");
        } finally {
            setIsExporting(false);
            setExportStep(0);
        }
    };

    return (
        <View className="flex-1 bg-[#f8faff]">
            <PlatinumHeader
                title="Class Progress"
                subtitle={selectedClass ? `${selectedClass.name} • ${selectedClass.subject}` : 'Institutional Analytics'}
                onBack={() => { triggerHaptic(); onBack(); }}
                rightAction={
                    <View className="flex-row items-center gap-2">
                        <Pressable 
                            onPress={() => { triggerHaptic(); setIsSearchVisible(!isSearchVisible); }}
                            className={`p-2 rounded-full border ${isSearchVisible ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Icons.Search size={18} color={isSearchVisible ? '#4f46e5' : '#6b7280'} />
                        </Pressable>
                    </View>
                }
            />
            <View className="px-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 pb-2">
                    <Pressable
                        style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                        onPress={() => setSelectedFilter(null)}
                        className={`px-4 py-2 rounded-xl border mr-2 ${!selectedFilter ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200' : 'bg-gray-50 border-gray-100'}`}
                    >
                        <Text className={`text-[8px] font-black uppercase tracking-[1px] font-inter-black ${!selectedFilter ? 'text-white' : 'text-gray-400'}`}>All Classes</Text>
                    </Pressable>
                    {assignedSections.map((item, idx) => {
                        const filterKey = `${item.class_id || item.id}::${item.section || 'A'}`;
                        const isSelected = selectedFilter === filterKey;
                        
                        return (
                            <Pressable
                                key={`${item.class_id || item.id}-${idx}`}
                                style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                                onPress={() => setSelectedFilter(filterKey)}
                                className={`px-4 py-2 rounded-xl border mr-2 ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200' : 'bg-gray-50 border-gray-100'}`}
                            >
                                <Text className={`text-[8px] font-black uppercase tracking-[1px] font-inter-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                    {`${item.name}-${item.section || 'A'} • ${item.subject}`}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
                
                {isSearchVisible && (
                    <View className="mt-4 bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex-row items-center">
                        <Icons.Search size={16} color="#94a3b8" />
                        <TextInput 
                            className="flex-1 ml-3 text-[13px] font-black text-gray-900 font-inter-black p-0"
                            placeholder="Search students..."
                            value={search}
                            onChangeText={setSearch}
                            autoFocus
                        />
                        {search.length > 0 && (
                            <Pressable onPress={() => setSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Icons.Close size={16} color="#94a3b8" />
                            </Pressable>
                        )}
                    </View>
                )}
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
            ) : fetchError ? (
                <View className="flex-1 justify-center items-center px-8">
                    <View className="w-16 h-16 bg-rose-50 rounded-2xl items-center justify-center mb-6 border border-rose-100">
                        <Icons.Alert size={32} color="#ef4444" />
                    </View>
                    <Text className="text-gray-900 font-inter-black text-[18px] text-center">Sync Interrupted</Text>
                    <Text className="text-gray-400 text-[10px] uppercase tracking-[1px] text-center mt-2 leading-4 font-inter-black">
                        We couldn't reach the institutional database. This is usually due to a weak network connection.
                    </Text>
                    <Pressable 
                        onPress={() => fetchData()}
                        className="mt-8 bg-indigo-600 px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-100 active:scale-95"
                    >
                        <Text className="text-white font-inter-black text-[10px] uppercase tracking-[1px]">Retry Connection</Text>
                    </Pressable>
                </View>
            ) : (
                <ScrollView 
                    className="flex-1" 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
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
                                <Text className="text-[8px] font-inter-bold uppercase text-gray-400 tracking-[1px] mt-0.5">Students</Text>
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
                                <Text className="text-[8px] font-inter-bold uppercase text-gray-400 tracking-[1px] mt-0.5">Avg Yield</Text>
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
                                <Text className="text-[8px] font-inter-bold uppercase text-rose-400 tracking-[1px] mt-0.5">Weak Students</Text>
                            </View>
                            <View className="flex-1 bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-100/10">
                                <Icons.Gradebook size={16} color="#4f46e5" />
                                <Text
                                    className="text-[24px] text-indigo-600 font-inter-black mt-2"
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {reportStats.progress}%
                                </Text>
                                <Text className="text-[8px] font-inter-bold uppercase text-indigo-400 tracking-[1px] mt-0.5">Grading Progress</Text>
                            </View>
                        </View>
                    </View>

                    {/* Top Performers */}
                    {reportStats.top.length > 0 && (
                        <View className="px-5 pt-4">
                            <Text className="text-[9px] font-black text-emerald-600 uppercase tracking-[1px] mb-4 font-inter-black text-center">Academic Excellence</Text>
                            <View className="bg-emerald-50 p-5 rounded-[28px] border border-emerald-100 shadow-xl shadow-emerald-100/20 mb-6">
                                {reportStats.top.map((s: any, i: number) => (
                                    <View key={(s.user_id || s.users?.id || i) as any} className={`flex-row items-center justify-between ${i < reportStats.top.length - 1 ? 'mb-4 pb-4 border-b border-emerald-100/30' : ''}`}>
                                        <View className="flex-row items-center flex-1 pr-2">
                                            <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-3 border border-emerald-200 flex-none">
                                                <Text className="text-[12px] font-black text-emerald-600 font-inter-black">#{i + 1}</Text>
                                            </View>
                                            <View className="flex-1">
                                                {/* PLATINUM FIX: numberOfLines to prevent layout breaking */}
                                                <Text className="text-[14px] font-black text-gray-900 font-inter-black" numberOfLines={1} ellipsizeMode="tail">
                                                    {s.users?.name || 'Student'}
                                                </Text>
                                                <Text className="text-[8px] font-black text-emerald-500 uppercase tracking-[1px] mt-0.5">Performance Master: {s.avg.toFixed(1)}%</Text>
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
                        <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[1px] mb-4 font-inter-black text-center">Intervention Required</Text>

                        <View className="bg-white p-5 rounded-[28px] border border-white shadow-xl shadow-indigo-100/20">
                            {reportStats.weak.length > 0 ? (
                                <View>
                                    {reportStats.weak.map((s: any, i: number) => (
                                        <View key={(s.user_id || s.users?.id || i) as any} className={`flex-row items-center justify-between ${i < reportStats.weak.length - 1 ? 'mb-4 pb-4 border-b border-gray-50' : ''}`}>
                                            <View className="flex-row items-center flex-1 pr-2">
                                                <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mr-3 border border-rose-100 flex-none">
                                                    <Icons.Profile size={16} color="#ef4444" />
                                                </View>
                                                <View className="flex-1">
                                                    {/* PLATINUM FIX: numberOfLines to prevent layout breaking */}
                                                    <Text className="text-[14px] font-black text-gray-900 font-inter-black" numberOfLines={1} ellipsizeMode="tail">
                                                        {s.users?.name || 'Student'}
                                                    </Text>
                                                    <Text className="text-[8px] font-black text-rose-400 uppercase tracking-[1px] mt-0.5">Avg: {s.avg.toFixed(1)}% • Action Needed</Text>
                                                </View>
                                            </View>
                                            <Pressable 
                                                onPress={() => { 
                                                    triggerHaptic(); 
                                                    const template = `Hi ${s.users?.name || 'there'}, I've been reviewing the latest progress reports for ${selectedClass?.subject || 'our class'}. Your current yield is ${s.avg.toFixed(1)}%, which is below our institutional baseline. Let's discuss how we can support your improvement.`;
                                                    onMessageStudent?.(s.user_id || s.users?.id, template); 
                                                }}
                                                className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex-none active:scale-95"
                                            >
                                                <Icons.Messages size={14} color="#64748b" />
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View className="py-8 items-center">
                                    <Icons.CheckCircle size={40} color="#10b981" />
                                    <Text className="text-emerald-600 font-black text-[10px] uppercase tracking-[1px] mt-4 font-inter-black">All students above baseline</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* PLATINUM FIX: Primary Bottom Action Pattern */}
                    <View className="px-5 mt-8">
                        <TouchableOpacity
                            onPress={handleExport}
                            disabled={isExporting}
                            activeOpacity={0.8}
                            className="bg-emerald-600 py-4 rounded-[24px] shadow-xl shadow-emerald-100 items-center justify-center flex-row border border-emerald-500"
                        >
                            {isExporting ? (
                                <ActivityIndicator color="white" style={{ marginRight: 8 }} />
                            ) : (
                                <Icons.Report size={18} color="white" style={{ marginRight: 8 }} />
                            )}
                            <Text className="text-white font-inter-black text-[12px] uppercase tracking-[1px]">
                                {exportStep === 1 ? 'Preparing Data...' : exportStep === 2 ? 'Generating PDF...' : exportStep === 3 ? 'Opening Share Sheet...' : 'Export Full PDF Report'}
                            </Text>
                        </TouchableOpacity>
                        
                        <Text className="text-center text-[8px] text-gray-400 font-inter-black uppercase tracking-[2px] mt-4">
                            Generated locally via Institutional Node
                        </Text>
                    </View>
                </ScrollView>
            )}
        </View>
    );
});
