"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ForumTagInputProps {
  id: string;
  name: string;
  suggestions?: string[];
  placeholder?: string;
}

function normalizeTag(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export default function ForumTagInput({
  id,
  name,
  suggestions = [],
  placeholder = "Ej: KitchenAid, repuestos, batidora",
}: ForumTagInputProps) {
  const [draftValue, setDraftValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const suggestionsId = useId();

  const addTags = (rawValue: string) => {
    const nextValues = rawValue
      .split(",")
      .map(normalizeTag)
      .filter(Boolean)
      .slice(0, 6);

    if (nextValues.length === 0) {
      return;
    }

    setSelectedTags((currentValues) => {
      const mergedValues = [...currentValues];

      nextValues.forEach((nextValue) => {
        const alreadyExists = mergedValues.some(
          (currentValue) => currentValue.toLowerCase() === nextValue.toLowerCase(),
        );

        if (!alreadyExists && mergedValues.length < 6) {
          mergedValues.push(nextValue);
        }
      });

      return mergedValues;
    });

    setDraftValue("");
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags((currentValues) =>
      currentValues.filter((value) => value !== tagToRemove),
    );
  };

  const selectSuggestion = (tag: string) => {
    const normalizedTag = normalizeTag(tag);

    if (!normalizedTag) {
      return;
    }

    setSelectedTags((currentValues) => {
      const alreadyExists = currentValues.some(
        (value) => value.toLowerCase() === normalizedTag.toLowerCase(),
      );

      if (alreadyExists || currentValues.length >= 6) {
        return currentValues;
      }

      return [...currentValues, normalizedTag];
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", "Tab", ","].includes(event.key)) {
      event.preventDefault();
      addTags(draftValue);
    }

    if (event.key === "Backspace" && !draftValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      <input type="hidden" id={id} name={name} value={selectedTags.join(", ")} />

      <div className="rounded-[24px] border border-input bg-background p-4 shadow-xs transition-shadow focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20">
        <div className="flex min-h-12 flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              className="gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            >
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-4 rounded-full text-current hover:bg-white/15 hover:text-current"
                onClick={() => removeTag(tag)}
                aria-label={`Eliminar ${tag}`}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}

          <Input
            value={draftValue}
            list={suggestions.length > 0 ? suggestionsId : undefined}
            placeholder={selectedTags.length === 0 ? placeholder : "Agregar otra etiqueta"}
            className="h-11 min-w-[220px] flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            onChange={(event) => setDraftValue(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTags(draftValue)}
          />
        </div>

        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Presiona coma, tab o enter para convertir cada etiqueta en badge. Puedes agregar hasta 6.
        </p>
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Etiquetas existentes
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((tag) => {
              const isSelected = selectedTags.some(
                (value) => value.toLowerCase() === tag.toLowerCase(),
              );

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => selectSuggestion(tag)}
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/80 bg-muted/50 text-foreground hover:border-primary/25 hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {suggestions.length > 0 ? (
        <datalist id={suggestionsId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      ) : null}
    </div>
  );
}