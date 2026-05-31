// export default function StatCard({
//   title,
//   value,
// }: {
//   title: string;
//   value: string;
// }) {
//   return (
//     <div className="bg-white p-6 rounded shadow">
//       <p className="text-gray-500">{title}</p>
//       <h2 className="text-2xl font-bold">{value}</h2>
//     </div>
//   );
// }

import { ReactNode } from "react";

export default function StatCard({
  title,
  value,
  change,
  changePositive,
  icon,
  iconBg,
}: {
  title: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  icon?: ReactNode;
  iconBg?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-5 flex items-start justify-between shadow-sm flex-1 min-w-0">
      <div>
        <p className="text-sm text-gray-500 font-medium mb-2">{title}</p>
        <h2 className="text-[26px] font-bold text-gray-900 tracking-tight">{value}</h2>
        {change && (
          <p className="text-xs mt-1.5 font-medium">
            <span className={changePositive ? "text-green-600" : "text-red-500"}>
              {change}
            </span>{" "}
            <span className="text-gray-400 font-normal">vs last week</span>
          </p>
        )}
      </div>
      {icon && (
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg ?? "#eff6ff" }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}