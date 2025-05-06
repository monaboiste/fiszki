import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { debounce } from "../lib/utils";

interface FlashcardsSearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const FlashcardsSearchFilter: React.FC<FlashcardsSearchFilterProps> = ({ searchTerm, onSearchChange }) => {
  const [inputValue, setInputValue] = useState(searchTerm);

  // Use a ref to store the debounced function
  const debouncedFn = useRef<((value: string) => void) | null>(null);

  // Initialize the debounced function
  useEffect(() => {
    debouncedFn.current = debounce((...args: unknown[]) => {
      onSearchChange(args[0] as string);
    }, 300);

    // No need for cleanup as the debounce function handles its own timeouts
  }, [onSearchChange]);

  // Update local input value and trigger debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (debouncedFn.current) {
      debouncedFn.current(value);
    }
  };

  // Update local state if prop changes
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="search-flashcards">Search Flashcards</Label>
      <Input
        id="search-flashcards"
        type="text"
        placeholder="Search by front content..."
        value={inputValue}
        onChange={handleInputChange}
        className="max-w-md"
      />
    </div>
  );
};

export default FlashcardsSearchFilter;
