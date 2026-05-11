export const formatAcademicTime = (dateStr?: string) => {
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

  return past.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
export const isToday = (date: Date) => {
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

export const isYesterday = (date: Date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

export const isSameDay = (date1: Date, date2: Date) => {
  return date1.toDateString() === date2.toDateString();
};

export const formatDetailedDate = (date: Date) => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
