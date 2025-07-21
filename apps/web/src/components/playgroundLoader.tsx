"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2 } from "lucide-react"
import { PlayGroundStatus as PlaygroundStatus } from "@repo/shared"

interface LoadingStep {
    id: string
    label: string
    description: string
    isComplete: (status: PlaygroundStatus) => boolean
    isActive: (status: PlaygroundStatus) => boolean
}

const loadingSteps: LoadingStep[] = [
    {
        id: "container-request",
        label: "Adding your container request",
        description: "Initializing playground resources",
        isComplete: (status) => (status ? true : false),
        isActive: (status) => (status ? true : true),
    },
    {
        id: "dedicated-container",
        label: "Getting your dedicated container",
        description: "Provisioning compute resources",
        isComplete: (status) => (status ? status.job?.phase === "Pending" : false),
        isActive: (status) => (status ? status.job?.phase === "Pending" && status.updateCount > 0 : false),
    },
    {
        id: "connecting-container",
        label: "Connecting to your container",
        description: "Establishing network connections",
        isComplete: (status) => (status ? status.ready : false),
        isActive: (status) => (status ? status.service.ready || status.virtual_service.ready : false  ),
    },
    {
        id: "setting-up-editor",
        label: "Setting up your editor",
        description: "Configuring development environment",
        isComplete: (_status) => true,
        isActive: (_status) => true,
    },
    {
        id: "finalizing-playground",
        label: "Finalizing your playground",
        description: "Completing initialization",
        isComplete: (status) => (status ? status.ready : false),
        isActive: (status) => (status ? status.virtual_service.ready && !status.ready : false),
    },
]

interface PlaygroundLoaderProps {
  status: PlaygroundStatus | undefined
  onComplete?: () => void
}

export default function PlaygroundLoader({ status, onComplete }: PlaygroundLoaderProps) {

  useEffect(() => {
    if (status?.ready && onComplete) {
      setTimeout(onComplete, 1000) 
    }
  }, [status, onComplete])

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Main Message */}
          <div className="text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl lg:text-5xl font-light text-white mb-4">Hang on...</h1>
              <p className="text-gray-400 text-lg">We're setting up your development environment</p>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-gray-300 text-sm">
                  {status
                    ? `${loadingSteps.filter((step) => step.isComplete(status)).length} of ${loadingSteps.length} completed`
                    : "Initializing..."}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-64 h-1 bg-gray-800 rounded-full mt-4 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width: status
                      ? `${(loadingSteps.filter((step) => step.isComplete(status)).length / loadingSteps.length) * 100}%`
                      : "0%",
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </div>

          {/* Right Side - Loading Steps */}
          <div className="space-y-4">
            <AnimatePresence>
              {status && loadingSteps.map((step, index) => {
                const isComplete = step.isComplete(status)
                const isActive = step.isActive(status)

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-gray-900/50 border border-gray-700"
                        : isComplete
                          ? "bg-gray-900/30"
                          : "bg-transparent"
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {isComplete ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      ) : isActive ? (
                        <div className="w-6 h-6 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-600 rounded-full" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-medium transition-colors duration-300 ${
                          isComplete ? "text-green-400" : isActive ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                    </div>

                    {/* Active Step Indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-2 h-2 bg-white rounded-full animate-pulse"
                      />
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Status Debug Info (Optional - remove in production) */}
            {process.env.NODE_ENV === "development" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 p-4 bg-gray-900/30 rounded-lg border border-gray-800"
              >
                <h4 className="text-xs font-mono text-gray-400 mb-2">Debug Status:</h4>
                <div className="text-xs font-mono text-gray-500 space-y-1">
                  {status ? (
                    <>
                      <div>
                        Job: {status.job.phase} ({status.job.ready ? "ready" : "not ready"})
                      </div>
                      <div>Service: {status.service.ready ? "ready" : "not ready"}</div>
                      <div>Virtual Service: {status.virtual_service.ready ? "ready" : "not ready"}</div>
                      <div>Overall: {status.ready ? "ready" : "not ready"}</div>
                      <div>Updates: {status.updateCount}</div>
                    </>
                  ) : (
                    <div className="text-yellow-400">Status: Loading initial data...</div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

