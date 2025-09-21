'use client';

import { useState, useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Input } from './input';
import { format } from 'date-fns';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
}

type DateInputRef = {
  focus: () => void;
};

export const DateInput = forwardRef<DateInputRef, DateInputProps>(
  ({ value, onChange, onEnter }, ref) => {
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      }
    }));

    useEffect(() => {
      setInputValue(value);
    }, [value]);

    const handleBlur = useCallback(() => {
      if (inputValue.length > 0 && inputValue.length < 6) {
        const day = inputValue.slice(0, 2).padStart(2, '0');
        const month = inputValue.length > 2 ? inputValue.slice(2, 4).padStart(2, '0') : format(new Date(), 'MM');
        const year = inputValue.length > 4 ? inputValue.slice(4, 6) : format(new Date(), 'yy');
        const formattedDate = `${day}${month}${year}`;
        if (formattedDate !== inputValue) {
          onChange(formattedDate);
        }
      }
    }, [inputValue, onChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/[^0-9]/g, '');
      if (val.length > 6) {
        val = val.slice(0, 6);
      }
      setInputValue(val);
      onChange(val);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onEnter) {
          handleBlur();
          onEnter();
      }
    };

    return (
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="ddMMyy"
        className="font-code"
      />
    );
  }
);

DateInput.displayName = 'DateInput';
