'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'

/**
 * The guide video in the homepage hero, framed as an app window.
 *
 * It starts muted (browsers only autoplay silent video) and the captions are
 * burned in, so nothing is lost without sound. It plays only while on screen,
 * and not at all under prefers-reduced-motion until the visitor presses play.
 * The pause button is required: anything that moves for more than five
 * seconds must be stoppable (WCAG 2.2.2).
 *
 * Sources live in public/video, encoded at 1080p from the 4K master:
 * VP9/Opus WebM first, H.264/AAC MP4 as the fallback.
 */
export default function HeroVideo() {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  // Set once the visitor pauses, so scrolling back into view does not
  // override their choice.
  const userPaused = useRef(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      userPaused.current = true
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) {
          video.play().catch(() => {})
        } else if (!entry.isIntersecting) {
          video.pause()
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  function togglePlay() {
    const video = ref.current
    if (video.paused) {
      userPaused.current = false
      video.play().catch(() => {})
    } else {
      userPaused.current = true
      video.pause()
    }
  }

  function toggleMute() {
    const video = ref.current
    video.muted = !video.muted
    setMuted(video.muted)
    // Turning the sound on is a clear request to watch.
    if (!video.muted && video.paused) togglePlay()
  }

  return (
    <div className="relative mx-auto w-full max-w-[640px] pr-3 pb-3 sm:pr-4 sm:pb-4 lg:max-w-none">
      {/* Offset plate behind the window. Flat, for depth without a glow.
          Inset rather than translated, so it never widens the page. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 top-3 left-3 rounded-[22px] border border-teal/20 bg-teal/8 sm:top-4 sm:left-4"
      />

      <figure className="relative overflow-hidden rounded-[22px] border border-hairline-strong bg-surface p-2 sm:p-2.5">
        <figcaption className="flex items-center gap-3 px-2 pt-0.5 pb-2.5 sm:pb-3">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-inset" />
            <span className="size-2.5 rounded-full bg-inset" />
            <span className="size-2.5 rounded-full bg-teal/70" />
          </span>
          <span className="font-mono text-[11px] tracking-[0.04em] text-tx2">
            How Peptora works
          </span>
          <span className="ml-auto font-mono text-[11px] text-tx3">0:50</span>
        </figcaption>

        <div className="relative aspect-video overflow-hidden rounded-[14px] border border-hairline bg-[#020a10]">
          <video
            ref={ref}
            className="size-full object-cover"
            poster="/video/peptora-guide-poster.jpg"
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="A 50 second guide to Peptora: choosing a compound, entering a vial and reading the result"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            <source src="/video/peptora-guide.webm" type="video/webm" />
            <source src="/video/peptora-guide.mp4" type="video/mp4" />
          </video>

          <div className="absolute right-2.5 bottom-2.5 flex gap-1.5 sm:right-3 sm:bottom-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Pause video' : 'Play video'}
              className="flex size-9 items-center justify-center rounded-full border border-hairline-strong bg-navy/85 text-tx transition-colors hover:bg-navy"
            >
              {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
              aria-pressed={!muted}
              className="flex size-9 items-center justify-center rounded-full border border-hairline-strong bg-navy/85 text-tx transition-colors hover:bg-navy"
            >
              {muted ? <VolumeX size={15} aria-hidden="true" /> : <Volume2 size={15} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </figure>
    </div>
  )
}
