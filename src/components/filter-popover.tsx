
"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/datepicker";
import { Filter, ArrowUp, ArrowDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FilterPopoverProps {
  column: string;
  label: string;
  value: string | Date | null;
  sortDirection: 'asc' | 'desc' | null;
  onFilterChange: (value: string | Date | null) => void;
  onSortChange: (direction: 'asc' | 'desc' | null) => void;
  isDatePicker?: boolean;
}

export function FilterPopover({
  column,
  label,
  value,
  sortDirection,
  onFilterChange,
  onSortChange,
  isDatePicker = false,
}: FilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleApply = () => {
    onFilterChange(inputValue);
    setIsOpen(false);
  };
  
  const handleClearFilter = () => {
    setInputValue(isDatePicker ? null : "");
    onFilterChange(null);
    setIsOpen(false);
  }

  const handleDateChange = (date?: Date) => {
    setInputValue(date || null);
  }

  const handleSort = (direction: 'asc' | 'desc') => {
    onSortChange(direction);
    setIsOpen(false);
  }

  const handleClearSort = () => {
    onSortChange(null);
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 hover:text-primary">
          {label}
          <div className="flex flex-col">
           {sortDirection === 'asc' && <ArrowUp className="h-3 w-3 text-primary" />}
           {sortDirection === 'desc' && <ArrowDown className="h-3 w-3 text-primary" />}
          </div>
          <Filter className={`h-3 w-3 transition-colors ${value ? 'text-primary' : 'text-muted-foreground'}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium leading-none">Filter {label}</h4>
            <div className="grid gap-2 pt-2">
              {isDatePicker ? (
                <DatePicker
                  value={inputValue as Date | undefined}
                  onChange={handleDateChange}
                />
              ) : (
                <Input
                  placeholder={`Filter by ${label}...`}
                  value={inputValue as string || ""}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleClearFilter}>Clear</Button>
              <Button size="sm" onClick={handleApply}>Apply</Button>
            </div>
          </div>
          <Separator />
           <div>
            <h4 className="font-medium leading-none">Sort by {label}</h4>
            <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleSort('asc')}><ArrowUp className="mr-2 h-4 w-4" /> Asc</Button>
                <Button variant="outline" size="sm" onClick={() => handleSort('desc')}><ArrowDown className="mr-2 h-4 w-4" /> Desc</Button>
            </div>
             {sortDirection && <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleClearSort}>Clear Sort</Button>}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
