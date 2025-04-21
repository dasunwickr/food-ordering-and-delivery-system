"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Clock } from "lucide-react"

interface TimeRange {
  open: string
  close: string
}

interface CompactTimeSelectorProps {
  value: {
    [key: string]: TimeRange
  }
  onChange: (times: { [key: string]: TimeRange }) => void
}

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function CompactTimeSelector({ value, onChange }: CompactTimeSelectorProps) {
  const [openingTimes, setOpeningTimes] = useState<{
    [key: string]: TimeRange
  }>(
    value && Object.keys(value).length > 0
      ? value
      : weekDays.reduce(
          (acc, day) => {
            acc[day] = { open: "09:00", close: "17:00" }
            return acc
          },
          {} as { [key: string]: TimeRange },
        ),
  )

  const handleTimeChange = (day: string, field: "open" | "close", newTime: string) => {
    const newTimes = { ...openingTimes }
    newTimes[day][field] = newTime
    setOpeningTimes(newTimes)
    onChange(newTimes)
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="opening-times">
        <AccordionTrigger className="text-xs py-2">
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            <span>Set Opening Hours</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 pt-1">
            {weekDays.map((day) => (
              <div key={day} className="grid grid-cols-3 gap-1 items-center">
                <Label className="text-xs">{day.substring(0, 3)}</Label>
                <div className="col-span-2 flex items-center gap-1">
                  <Input
                    type="time"
                    value={openingTimes[day]?.open || "09:00"}
                    onChange={(e) => handleTimeChange(day, "open", e.target.value)}
                    className="h-7 text-xs"
                  />
                  <span className="text-xs">to</span>
                  <Input
                    type="time"
                    value={openingTimes[day]?.close || "17:00"}
                    onChange={(e) => handleTimeChange(day, "close", e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
