import Card from "../../atoms/Card";
import type { NextActionItem } from "../../../types/reportPayloadV2";

interface NextActionsPanelProps {
  nextActions: NextActionItem[];
}

const priorityLabelByValue: Record<string, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

const NextActionsPanel = ({ nextActions }: NextActionsPanelProps) => {
  return (
    <section data-result-section="next-actions" aria-labelledby="actions-title">
      <Card variant="white" className="p-5 rounded-2xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 id="actions-title" className="text-lg font-black text-gray-900">
            다음 액션
          </h2>
          <span className="text-[12px] font-black text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-2 py-1">
            {nextActions.length}개
          </span>
        </div>

        {nextActions.length > 0 ? (
          <ol className="space-y-2">
            {nextActions.map((action, index) => (
              <li
                key={action.actionId ?? `${action.title}-${index}`}
                className="rounded-lg border border-gray-100 bg-slate-50 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-black text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-black text-gray-900">
                    {action.title}
                  </p>
                  {action.priority && (
                    <span className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-black text-gray-500">
                      {priorityLabelByValue[action.priority] ?? action.priority}
                    </span>
                  )}
                </div>
                {action.description && (
                  <p className="mt-1 text-[12px] font-bold text-gray-600 leading-relaxed">
                    {action.description}
                  </p>
                )}
                {action.dueDate && (
                  <p className="mt-1 text-[11px] font-black text-primary">
                    {action.dueDate}
                  </p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-lg border border-gray-100 bg-slate-50 px-4 py-3 text-sm font-bold text-gray-500">
            특이사항 없음
          </p>
        )}
      </Card>
    </section>
  );
};

export default NextActionsPanel;
