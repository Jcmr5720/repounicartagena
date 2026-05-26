"use client";

import { Accessibility, Contrast, Type } from "lucide-react";
import { useAccessibility, type TextSizeMode } from "@/lib/accessibility-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const TEXT_SIZE_OPTIONS: Array<{
  label: string;
  value: TextSizeMode;
  shortLabel: string;
}> = [
  { label: "Normal", value: "normal", shortLabel: "A" },
  { label: "Grande", value: "large", shortLabel: "A+" },
  { label: "Extra grande", value: "xlarge", shortLabel: "A++" },
];

function AccessibilityPanel({ compact = false }: { compact?: boolean }) {
  const {
    contrastMode,
    isHydrated,
    setTextSize,
    textSize,
    toggleContrastMode,
  } = useAccessibility();

  return (
    <div className={cn("space-y-4", compact && "text-sm")}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
          <Contrast className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">Alto contraste</p>
              <p className="text-sm text-muted-foreground">
                Mejora la lectura para baja vision.
              </p>
            </div>
            <Switch
              checked={contrastMode === "high"}
              onCheckedChange={toggleContrastMode}
              disabled={!isHydrated}
              aria-label="Activar o desactivar alto contraste"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Type className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">Tamano del texto</p>
            <p className="text-sm text-muted-foreground">
              Ajusta la lectura sin romper la interfaz.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {TEXT_SIZE_OPTIONS.map((option) => {
            const selected = textSize === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant={selected ? "default" : "outline"}
                size="sm"
                className="h-9 px-2"
                onClick={() => setTextSize(option.value)}
                disabled={!isHydrated}
                aria-pressed={selected}
                aria-label={`Tamano de texto ${option.label}`}
              >
                <span
                  className={
                    option.value === "normal"
                      ? "text-sm"
                      : option.value === "large"
                        ? "text-base"
                        : "text-lg"
                  }
                >
                  {option.shortLabel}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {isHydrated
          ? "Estos ajustes se guardan en este navegador."
          : "Cargando preferencias de accesibilidad..."}
      </p>
    </div>
  );
}

export function AccessibilityControls() {
  const { contrastMode, textSize } = useAccessibility();
  const hasActiveSettings = contrastMode === "high" || textSize !== "normal";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Accessibility className="h-4 w-4" />
          Accesibilidad
          {hasActiveSettings ? (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              Activo
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <AccessibilityPanel />
      </PopoverContent>
    </Popover>
  );
}

export function AccessibilityControlsMobile() {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="mb-3 flex items-center gap-2">
        <Accessibility className="h-4 w-4 text-primary" />
        <span className="font-medium text-foreground">Accesibilidad</span>
      </div>
      <AccessibilityPanel compact />
    </div>
  );
}
