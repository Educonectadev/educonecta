"use client"

import {
  ColorPicker,
  ColorArea,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  Label,
} from "@heroui/react"
import { useBrandColor } from "./BrandColorProvider"

const presets = [
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#6366f1",
  "#14b8a6",
  "#84cc16",
  "#d946ef",
  "#0ea5e9",
]

export default function BrandColorPicker() {
  const { brandColor, setBrandColor } = useBrandColor()

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
        Color de la marca
      </p>
      <p className="text-[11px] text-gray-400 dark:text-zinc-500 -mt-1">
        Personaliza el color de los botones y la navegación
      </p>
      <ColorPicker defaultValue={brandColor} value={brandColor} onChange={(v) => setBrandColor(v.toString("hex"))}>
        <div className="flex items-center gap-3">
          <ColorPicker.Trigger>
            <ColorSwatch size="lg" />
          </ColorPicker.Trigger>
          <Label className="text-sm font-medium text-gray-900 dark:text-white/90 cursor-pointer">
            {brandColor}
          </Label>
        </div>
        <ColorPicker.Popover>
          <ColorArea
            aria-label="Color area"
            className="max-w-full"
            colorSpace="hsb"
            xChannel="saturation"
            yChannel="brightness"
          >
            <ColorArea.Thumb />
          </ColorArea>
          <ColorSlider aria-label="Hue slider" channel="hue" className="gap-1 px-1" colorSpace="hsb">
            <Label>Hue</Label>
            <ColorSlider.Output className="text-muted-foreground" />
            <ColorSlider.Track>
              <ColorSlider.Thumb />
            </ColorSlider.Track>
          </ColorSlider>
          <ColorSwatchPicker className="justify-center px-1" size="xs">
            {presets.map((preset) => (
              <ColorSwatchPicker.Item key={preset} color={preset}>
                <ColorSwatchPicker.Swatch />
              </ColorSwatchPicker.Item>
            ))}
          </ColorSwatchPicker>
        </ColorPicker.Popover>
      </ColorPicker>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => setBrandColor("#000000")}
          className="rounded-[20px] border border-gray-200 dark:border-zinc-700 px-3 py-1.5 text-[11px] text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
        >
          Restablecer
        </button>
      </div>
    </div>
  )
}
