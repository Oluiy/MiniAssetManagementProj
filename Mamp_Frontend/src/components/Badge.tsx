type BadgeProps = {
  value: string;
};

const statusMap: Record<string, { bg: string; text: string; label: string }> = {
  Active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  Inactive: { bg: 'bg-red-100', text: 'text-red-700', label: 'Inactive' },
  UnderMaintenance: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Under Maintenance' },
  Pending: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Pending' },
  InProgress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
  Completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
  High: { bg: 'bg-red-100', text: 'text-red-700', label: 'High' },
  Medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Medium' },
  Low: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Low' },
};

export const Badge = ({ value }: BadgeProps) => {
  const key = String(value).replace(/\s+/g, '');
  const style = statusMap[key] ?? { bg: 'bg-slate-100', text: 'text-slate-600', label: value };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};