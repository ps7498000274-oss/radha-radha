/**
 * Radha Radha — Naam Jap Tracker
 * AudioContext — Global persistent audio player with seamless YouTube IFrame API integration
 * Plays the sacred 11,000 Radha Naam Jap track reliably without needing local MP3 files
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

// The 11,000 Radha Naam Jaap video ID (from https://youtu.be/0LhTJgJyfM4)
const DEFAULT_YT_VIDEO_ID = '0LhTJgJyfM4'

const AudioContext = createContext<AudioContextType | undefined>(undefined)

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

export interface AudioProviderProps {
  children: React.ReactNode
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
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
      // Ignore
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

  const playerRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const containerId = 'yt-bg-devotional-player'

  // Load YouTube IFrame API script
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadAPI = () => {
      if (window.YT && window.YT.Player) {
        initPlayer()
        return
      }

      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script')
        tag.id = 'youtube-iframe-api'
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)
      }

      window.onYouTubeIframeAPIReady = () => {
        initPlayer()
      }
    }

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || playerRef.current) return

      try {
        playerRef.current = new window.YT.Player(containerId, {
          height: '1',
          width: '1',
          videoId: DEFAULT_YT_VIDEO_ID,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: isLooping ? 1 : 0,
            playlist: DEFAULT_YT_VIDEO_ID,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              setIsLoaded(true)
              setHasError(false)
              try {
                event.target.setVolume(Math.round(volume * 100))
                if (isMuted) {
                  event.target.mute()
                } else {
                  event.target.unMute()
                }
                const dur = event.target.getDuration()
                if (dur && isFinite(dur)) {
                  setDuration(dur)
                }
              } catch (e) {
                console.warn('YT ready handler warn:', e)
              }
            },
            onStateChange: (event: any) => {
              // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0, BUFFERING = 3
              if (event.data === 1) {
                setIsPlaying(true)
                setAutoplayBlocked(false)
                startProgressTimer()
              } else if (event.data === 2) {
                setIsPlaying(false)
                stopProgressTimer()
              } else if (event.data === 0) {
                stopProgressTimer()
                if (isLooping && playerRef.current) {
                  playerRef.current.seekTo(0, true)
                  playerRef.current.playVideo()
                } else {
                  setIsPlaying(false)
                }
              }
            },
            onError: (err: any) => {
              console.warn('YouTube Player error:', err)
              setHasError(true)
              setIsPlaying(false)
              stopProgressTimer()
            },
          },
        })
      } catch (err) {
        console.warn('Failed to init YT player:', err)
        setHasError(true)
      }
    }

    loadAPI()

    return () => {
      stopProgressTimer()
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy()
        } catch {
          // ignore
        }
        playerRef.current = null
      }
    }
  }, [])

  const startProgressTimer = () => {
    stopProgressTimer()
    timerRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const curr = playerRef.current.getCurrentTime()
          const dur = playerRef.current.getDuration()
          if (curr !== undefined) setCurrentTime(curr)
          if (dur && isFinite(dur)) setDuration(dur)
        } catch {
          // ignore
        }
      }
    }, 500)
  }

  const stopProgressTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  /**
   * Play audio
   */
  const play = useCallback(async (): Promise<void> => {
    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') return
    try {
      setAutoplayBlocked(false)
      playerRef.current.playVideo()
    } catch (err: any) {
      console.warn('YT play failed:', err)
      setAutoplayBlocked(true)
    }
  }, [])

  /**
   * Pause audio
   */
  const pause = useCallback((): void => {
    if (!playerRef.current || typeof playerRef.current.pauseVideo !== 'function') return
    try {
      playerRef.current.pauseVideo()
      setIsPlaying(false)
    } catch (err) {
      console.warn('YT pause error:', err)
    }
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

    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(Math.round(clamped * 100))
        if (clamped > 0 && playerRef.current.isMuted && playerRef.current.isMuted()) {
          playerRef.current.unMute()
          setIsMutedState(false)
          localStorage.setItem(STORAGE_KEYS.MUTED, 'false')
        }
      } catch {
        // ignore
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
      if (playerRef.current) {
        try {
          if (nextMuted) {
            playerRef.current.mute()
          } else {
            playerRef.current.unMute()
          }
        } catch {
          // ignore
        }
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
    try {
      localStorage.setItem(STORAGE_KEYS.LOOP, String(loop))
    } catch {
      // ignore
    }
  }, [])

  /**
   * Seek to timestamp in seconds
   */
  const seek = useCallback((seconds: number): void => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function' && isFinite(seconds)) {
      try {
        playerRef.current.seekTo(seconds, true)
        setCurrentTime(seconds)
      } catch {
        // ignore
      }
    }
  }, [])

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
      {/* Hidden YouTube Iframe Container */}
      <div
        id={containerId}
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
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
