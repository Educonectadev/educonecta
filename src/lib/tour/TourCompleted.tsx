"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useTour } from "./TourContext"

export default function TourCompleted() {
  const { isOpen, finish } = useTour()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-700 p-10 mx-4 max-w-sm text-center"
          >
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">¡Listo!</h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
              Ya conoces cómo funciona EduConecta.
              <br />
              Ahora puedes comenzar a utilizar el sistema.
            </p>
            <button
              onClick={finish}
              className="mt-8 rounded-full bg-emerald-600 px-8 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Comenzar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
