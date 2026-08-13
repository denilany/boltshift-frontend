"use client";

import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerFieldProps = {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  "aria-invalid"?: boolean;
};

export function DatePickerField({
  id,
  value,
  onChange,
  "aria-invalid": ariaInvalid,
}: DatePickerFieldProps) {
  const date = value ? parseISO(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          data-empty={!date}
          aria-invalid={ariaInvalid}
          className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          {date ? format(date, "PPP") : <span>Pick a date</span>}
          <CalendarIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={(selected) => {
            onChange?.(selected ? format(selected, "yyyy-MM-dd") : "");
          }}
          defaultMonth={date}
          className="w-full"
        />
      </PopoverContent>
    </Popover>
  );
}
