"use client"

import { useEffect, useRef, useCallback } from "react"
import { getSupabase } from "./supabase"
import type { RealtimePostgresChangesPayload, RealtimeChannel } from "@supabase/supabase-js"

type TableName = string
type EventType = "INSERT" | "UPDATE" | "DELETE" | "*"

interface RealtimeOptions {
  table: TableName
  event?: EventType
  filter?: string
  schema?: string
}

type Callback<T extends Record<string, any> = Record<string, any>> = (payload: RealtimePostgresChangesPayload<T>) => void



export function useRealtime<T extends Record<string, any> = Record<string, any>>(
  options: RealtimeOptions,
  callback: Callback<T>,
  deps: any[] = [],
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const channelKey = `${options.schema ?? "public"}:${options.table}:${options.event ?? "*"}:${options.filter ?? ""}`

  useEffect(() => {
    const supabase = getSupabase()
    const channel = supabase.channel(channelKey)

    channel.on(
      "postgres_changes" as any,
      {
        event: options.event ?? "*",
        schema: options.schema ?? "public",
        table: options.table,
        filter: options.filter,
      },
      (payload: RealtimePostgresChangesPayload<T>) => {
        callbackRef.current(payload)
      },
    )

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelKey, ...deps])
}

export function useRealtimeCallback<T extends Record<string, any> = Record<string, any>>(
  options: RealtimeOptions,
  callback: Callback<T>,
  deps: any[] = [],
) {
  return useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => callback(payload),
    deps,
  )
}
