/**
 * Radha Radha — Naam Jap Tracker
 * AudioContext — Global persistent audio player for sacred Radha Naam chanting
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react'

export interface AudioContextType {
  isPlaying: boolean
  isMuted: boolean
  volume: number
  isLooping: boolean
  isLoaded: boolean
  hasError: boolean
  duration: number
  currentTime: number
  autoplayBlocked: boolean
  play: () => Promise<void>
  pause: () => void
  togglePlay: () => Promise<void>
  setVolume: (v: number) => void
  toggleMute: () => void
  setLoop: (bool: boolean) => void
  seek: (seconds: number) => void
}

const STORAGE_KEYS = {
  VOLUME: 'radha_radha_audio_volume',
  MUTED: 'radha_radha_audio_muted',
  LOOP: 'radha_radha_audio_loop',
} as const

const DEFAULT_AUDIO_URL = '/audio/radha-naam.mp3'

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export interface AudioProviderProps {
  children: React.ReactNode
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  // Read persisted preferences from localStorage
  const [volume, setVolumeState] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.8
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VOLUME)
      if (stored !== null) {
        const val = parseFloat(stored)
        if (!isNaN(val) && isFinite(val)) {
          return Math.max(0, Math.min(1, val))
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
    return 0.8
  })

  const [isMuted, setIsMutedState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(STORAGE_KEYS.MUTED) === 'true'
    } catch {
      return false
    }
  })

  const [isLooping, setIsLoopingState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOOP)
      return stored === null ? true : stored === 'true'
    } catch {
      return true
    }
  })

  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false)

  // Single persistent HTMLAudioElement reference
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize Audio instance once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const audioUrl = import.meta.env.VITE_AUDIO_URL || DEFAULT_AUDIO_URL
    const audio = new Audio(audioUrl)

    audio.loop = isLooping
    audio.volume = volume
    audio.muted = isMuted
    audio.preload = 'metadata'

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
      setIsLoaded(true)
      setHasError(false)
    }

    const handleCanPlay = () => {
      setIsLoaded(true)
      setHasError(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleDurationChange = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setAutoplayBlocked(false)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      if (!audio.loop) {
        setIsPlaying(false)
      }
    }

    const handleError = () => {
      console.warn('Audio playback error or file not found:', audio.src)
      setHasError(true)
      setIsPlaying(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    audioRef.current = audio

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)

      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, []) // Singleton across entire app lifecycle

  /**
   * Play audio with autoplay-block handling
   */
  const play = useCallback(async (): Promise<void> => {
    const audio = audioRef.current
    if (!audio) return

    try {
      setAutoplayBlocked(false)
      setHasError(false)
      await audio.play()
      setIsPlaying(true)
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
        setAutoplayBlocked(true)
      } else {
        console.warn('Playback failure:', err)
      }
      setIsPlaying(false)
    }
  }, [])

  /**
   * Pause audio
   */
  const pause = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setIsPlaying(false)
  }, [])

  /**
   * Toggle playback state
   */
  const togglePlay = useCallback(async (): Promise<void> => {
    if (isPlaying) {
      pause()
    } else {
      await play()
    }
  }, [isPlaying, pause, play])

  /**
   * Adjust volume (clamped 0 to 1) and persist to localStorage
   */
  const setVolume = useCallback((v: number): void => {
    const clamped = Math.max(0, Math.min(1, v))
    setVolumeState(clamped)

    if (audioRef.current) {
      audioRef.current.volume = clamped
      // If user sets volume > 0 while muted, unmute
      if (clamped > 0 && audioRef.current.muted) {
        audioRef.current.muted = false
        setIsMutedState(false)
        try {
          localStorage.setItem(STORAGE_KEYS.MUTED, 'false')
        } catch {
          // ignore
        }
      }
    }

    try {
      localStorage.setItem(STORAGE_KEYS.VOLUME, String(clamped))
    } catch {
      // ignore
    }
  }, [])

  /**
   * Toggle mute and persist to localStorage
   */
  const toggleMute = useCallback((): void => {
    setIsMutedState((prevMuted) => {
      const nextMuted = !prevMuted
      if (audioRef.current) {
        audioRef.current.muted = nextMuted
      }
      try {
        localStorage.setItem(STORAGE_KEYS.MUTED, String(nextMuted))
      } catch {
        // ignore
      }
      return nextMuted
    })
  }, [])

  /**
   * Set looping preference and persist to localStorage
   */
  const setLoop = useCallback((loop: boolean): void => {
    setIsLoopingState(loop)
    if (audioRef.current) {
      audioRef.current.loop = loop
    }
    try {
      localStorage.setItem(STORAGE_KEYS.LOOP, String(loop))
    } catch {
      // ignore
    }
  }, [])

  /**
   * Seek to timestamp in seconds
   */
  const seek = useCallback(
    (seconds: number): void => {
      const audio = audioRef.current
      if (audio && isFinite(seconds)) {
        const target = Math.max(0, Math.min(duration || 0, seconds))
        audio.currentTime = target
        setCurrentTime(target)
      }
    },
    [duration]
  )

  const contextValue = useMemo<AudioContextType>(
    () => ({
      isPlaying,
      isMuted,
      volume,
      isLooping,
      isLoaded,
      hasError,
      duration,
      currentTime,
      autoplayBlocked,
      play,
      pause,
      togglePlay,
      setVolume,
      toggleMute,
      setLoop,
      seek,
    }),
    [
      isPlaying,
      isMuted,
      volume,
      isLooping,
      isLoaded,
      hasError,
      duration,
      currentTime,
      autoplayBlocked,
      play,
      pause,
      togglePlay,
      setVolume,
      toggleMute,
      setLoop,
      seek,
    ]
  )

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  )
}

/**
 * Hook to consume the AudioContext.
 * Throws an error if used outside an AudioProvider.
 */
export function useAudio(): AudioContextType {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
