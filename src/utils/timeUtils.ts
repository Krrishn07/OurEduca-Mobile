export const formatAcademicTime = (dateStr: string) => {
  if (!dateStr) return 'Just now';
  const now = new Date();
  const past = new Date(dateStr);
  if (isNaN(past.getTime())) return 'Recently';

  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Immediate';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  // Check if it happened today
  const isToday = now.toDateString() === past.toDateString();
  if (isToday) {
    return `Today at ${past.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
