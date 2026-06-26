"use client"

import {
  BellFill,
  BellSlash,
} from "@gravity-ui/icons"
import { Switch } from "@heroui/react"
import { useState } from "react"

export function NotificationsToggle() {
  const [enabled, setEnabled] = useState(false)
  const Off = BellSlash
  const On = BellFill

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 dark:border-zinc-700 p-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className={`flex items-center justify-center size-10 rounded-xl shrink-0 transition-colors ${enabled ? "bg-purple-500/15 text-purple-600 dark:text-purple-300" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400"}`}>
          {enabled ? <BellFill className="size-5" /> : <BellSlash className="size-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Notificaciones Push</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Recibe avisos de tareas, comunicados y eventos en este dispositivo.
          </p>
        </div>
      </div>
      <Switch
        isSelected={enabled}
        onChange={setEnabled}
        aria-label="Notificaciones push"
        size="lg"
      >
        {({ isSelected }) => (
          <Switch.Content>
            <Switch.Control className={isSelected ? "bg-purple-500/80" : ""}>
              <Switch.Thumb>
                <Switch.Icon>
                  {isSelected ? (
                    <On className="size-3 text-inherit opacity-100" />
                  ) : (
                    <Off className="size-3 text-inherit opacity-70" />
                  )}
                </Switch.Icon>
              </Switch.Thumb>
            </Switch.Control>
          </Switch.Content>
        )}
      </Switch>
    </div>
  )
}

export default NotificationsToggle