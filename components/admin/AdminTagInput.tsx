"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminTagInputProps {
  id: string;
  label: string;
  values: string[];
  suggestions?: string[];
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  onChange: (values: string[]) => void;
}

function normalizeValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export default function AdminTagInput({
  id,
  label,
  values,
  suggestions = [],
  placeholder,
  helperText,
  required = false,
  onChange,
}: AdminTagInputProps) {
  const [draftValue, setDraftValue] = useState("");
  const listId = useId();
  const normalizedDraftValue = normalizeValue(draftValue).toLocaleLowerCase("es");
  const visibleSuggestions = suggestions.filter((suggestion) => {
    const alreadySelected = values.some(
      (value) => value.toLocaleLowerCase("es") === suggestion.toLocaleLowerCase("es"),
    );

    if (alreadySelected) {
      return false;
    }

    if (!normalizedDraftValue) {
      return true;
    }

    return suggestion.toLocaleLowerCase("es").includes(normalizedDraftValue);
  });

  const addTags = (rawValue: string) => {
    const nextValues = rawValue.split(",").map(normalizeValue).filter(Boolean);

    if (nextValues.length === 0) {
      return;
    }

    const mergedValues = [...values];

    nextValues.forEach((nextValue) => {
      const alreadyExists = mergedValues.some(
        (currentValue) =>
          currentValue.toLowerCase() === nextValue.toLowerCase(),
      );

      if (!alreadyExists) {
        mergedValues.push(nextValue);
      }
    });

    onChange(mergedValues);
    setDraftValue("");
  };

  const removeTag = (valueToRemove: string) => {
    onChange(values.filter((value) => value !== valueToRemove));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", "Tab", ","].includes(event.key)) {
      event.preventDefault();
      addTags(draftValue);
    }

    if (event.key === "Backspace" && !draftValue && values.length > 0) {
      removeTag(values[values.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="rounded-xl border border-input bg-background p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {values.map((value) => (
            <Badge
              key={value}
              variant="secondary"
              className="gap-1 rounded-full px-3 py-1"
            >
              {value}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-4 rounded-full hover:bg-transparent"
                onClick={() => removeTag(value)}
                aria-label={`Eliminar ${value}`}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
          {values.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              Agrega una o varias categorias. Usa coma, tab o enter para
              convertirlas en badges.
            </span>
          ) : null}
        </div>
        <Input
          id={id}
          value={draftValue}
          list={suggestions.length > 0 ? listId : undefined}
          placeholder={placeholder}
          required={required && values.length === 0}
          onChange={(event) => setDraftValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTags(draftValue)}
        />
        {visibleSuggestions.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {visibleSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="xs"
                className="rounded-full"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addTags(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        ) : null}
        {suggestions.length > 0 ? (
          <datalist id={listId}>
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        ) : null}
      </div>
      {helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
