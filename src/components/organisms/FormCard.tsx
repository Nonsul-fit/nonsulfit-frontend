import React from "react";

interface FormCardProps {
  title: string;
  icon?: string;
  badge?: string;
  children: React.ReactNode;
}

const FormCard = ({ title, icon, badge, children }: FormCardProps) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-gray-50 pb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl mr-1">{icon}</span>}
          <label className="text-lg font-bold text-gray-800">{title}</label>
        </div>
        {badge && (
          <span className="text-xs text-gray-400 font-semibold bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            {badge}
          </span>
        )}
      </div>

      <div>{children}</div>
    </div>
  );
};

export default FormCard;
