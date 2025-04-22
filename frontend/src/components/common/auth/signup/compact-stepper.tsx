interface CompactStepperProps {
  currentStep: number
  totalSteps: number
  labels?: string[]
}

export function CompactStepper({ currentStep, totalSteps }: CompactStepperProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                index + 1 === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index + 1 < currentStep
                    ? "bg-primary/80 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-[10px] mt-1 text-muted-foreground">
              {index === 0 ? "Info" : index === 1 ? "Password" : "Details"}
            </span>
          </div>
        ))}
      </div>
      <div className="relative w-full h-1 bg-muted rounded-full mt-2">
        <div
          className="absolute top-0 left-0 h-1 bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}
