interface StepHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
}

const StepHeader = ({
  currentStep,
  totalSteps,
  title,
  description,
}: StepHeaderProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-6 sm:mb-10 text-left">
      <div className="mb-3 sm:mb-4">
        <span className="text-xs sm:text-sm font-bold tracking-widest text-primary uppercase">
          Step {String(currentStep).padStart(2, "0")} /{" "}
          {String(totalSteps).padStart(2, "0")}
        </span>

        <div className="mt-1.5 sm:mt-2 h-[4px] w-full max-w-[160px] sm:max-w-[240px] overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1e293b] leading-tight tracking-tight break-keep">
        {title}
      </h1>

      <p className="mt-1.5 sm:mt-2 text-sm sm:text-base font-medium text-gray-500 break-keep">
        {description}
      </p>
    </div>
  );
};

export default StepHeader;
