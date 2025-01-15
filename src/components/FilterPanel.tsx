import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type FilterValues = {
  role: "Appraiser" | "Umpire" | "Both" | null;
  statesLocated: string[];
  statesLicensed: string[];
};

interface FilterPanelProps {
  onFilterChange: (filters: FilterValues) => void;
  className?: string;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export const FilterPanel = ({ onFilterChange, className }: FilterPanelProps) => {
  const [filters, setFilters] = useState<FilterValues>({
    role: null,
    statesLocated: [],
    statesLicensed: [],
  });

  const handleRoleChange = (value: string) => {
    const newFilters = {
      ...filters,
      role: value as FilterValues["role"],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStateLocatedChange = (state: string) => {
    const newStates = filters.statesLocated.includes(state)
      ? filters.statesLocated.filter((s) => s !== state)
      : [...filters.statesLocated, state];
    
    const newFilters = {
      ...filters,
      statesLocated: newStates,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStateLicensedChange = (state: string) => {
    const newStates = filters.statesLicensed.includes(state)
      ? filters.statesLicensed.filter((s) => s !== state)
      : [...filters.statesLicensed, state];
    
    const newFilters = {
      ...filters,
      statesLicensed: newStates,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      role: null,
      statesLocated: [],
      statesLicensed: [],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className={`space-y-6 p-4 bg-white rounded-lg shadow-lg ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Role</h4>
          <RadioGroup
            onValueChange={handleRoleChange}
            value={filters.role || ""}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Appraiser" id="appraiser" />
              <Label htmlFor="appraiser">Appraiser</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Umpire" id="umpire" />
              <Label htmlFor="umpire">Umpire</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Both" id="both" />
              <Label htmlFor="both">Both</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">States Located</h4>
          <Select
            onValueChange={handleStateLocatedChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.statesLocated.map((state) => (
              <Button
                key={state}
                variant="secondary"
                size="sm"
                onClick={() => handleStateLocatedChange(state)}
                className="text-xs"
              >
                {state}
                <X className="h-3 w-3 ml-1" />
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">States Licensed</h4>
          <Select
            onValueChange={handleStateLicensedChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.statesLicensed.map((state) => (
              <Button
                key={state}
                variant="secondary"
                size="sm"
                onClick={() => handleStateLicensedChange(state)}
                className="text-xs"
              >
                {state}
                <X className="h-3 w-3 ml-1" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};