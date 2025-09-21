"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  options: { label: string; value: string }[]
  value?: string
  onChange: (value: string) => void
  onEnter?: () => void;
  placeholder?: string
  emptyText?: string
  className?: string
  allowCustom?: boolean
}

type ComboboxRef = {
  focus: () => void
}

export const Combobox = React.forwardRef<ComboboxRef, ComboboxProps>(({ 
  options,
  value,
  onChange,
  onEnter,
  placeholder = "Select option...",
  emptyText = "No option found.",
  className,
  allowCustom = false,
  ...props
}, ref) => {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  const onEnterRef = React.useRef(onEnter);
  onEnterRef.current = onEnter;

  const isSelection = React.useRef(false);

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      buttonRef.current?.focus();
      setOpen(true);
    }
  }));

  const handleSelect = (currentValue: string) => {
    isSelection.current = true;
    onChange(currentValue === value ? "" : currentValue)
    setInputValue("")
    setOpen(false)
  }

  const handleCloseAutoFocus = (event: Event) => {
    if (isSelection.current) {
        isSelection.current = false; // Reset the flag here
        event.preventDefault();
        onEnterRef.current?.();
    }
  }

  const filteredOptions = inputValue
    ? options.filter(option => option.label.toLowerCase().includes(inputValue.toLowerCase()))
    : options

  const showCreateOption = allowCustom && inputValue && !options.some(option => option.value.toLowerCase() === inputValue.toLowerCase())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", !value && "text-muted-foreground", className)}
          onClick={() => setOpen(prev => !prev)}
          {...props}
        >
          {value
            ? options.find((option) => option.value === value)?.label ?? value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0"
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            {filteredOptions.length === 0 && !showCreateOption ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : null}
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
               {showCreateOption && (
                <CommandItem
                  onSelect={() => handleSelect(inputValue)}
                  className="text-primary"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create "{inputValue}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
});

Combobox.displayName = "Combobox";
