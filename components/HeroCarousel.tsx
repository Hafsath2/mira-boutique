"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type Slide =
  | { type?: "image"; src: string; alt: string }
  | { type: "video"; src: string; alt: string; poster?: string };

export default function HeroCarousel({
  slides,
  interval = 5000,
}: {
  slides: Slide[];
  interval?: number;
}) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const go = (i: number) => setIndex(((i % count) + count) % count);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const shouldPlay = !hovered && !userPaused && !reducedMotion;
  const current = slides[index];
  const isVideo = current?.type === "video";

  // Les photos avancent avec un minuteur. Les vidéos avancent quand elles se terminent.
  useEffect(() => {
    if (!shouldPlay || count < 2 || isVideo) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(id);
  }, [shouldPlay, count, interval, isVideo]);

  // Lecture de la vidéo affichée, pause des autres.
  useEffect(() => {
    slides.forEach((_, i) => {
      const v = videoRefs.current[i];
      if (!v) return;
      if (i === index && shouldPlay) {
        v.muted = true;
        v.play().catch(() => {});
      } else {
        v.pause();
        if (i !== index) v.currentTime = 0;
      }
    });
  }, [index, shouldPlay, slides]);

  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carrousel"
      aria-label="Nos photos et vidéos"
      className="relative mx-auto aspect-[589/1280] w-full max-w-[260px] md:max-w-[340px] overflow-hidden rounded-2xl bg-[#FFE3F1]"
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) setHovered(true);
      }}
      onBlur={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchStartX.current = null;
      }}
    >
      {slides.map((s, i) => (
        <div
          key={s.src}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          {s.type === "video" ? (
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={s.src}
              poster={s.poster}
              aria-label={s.alt}
              muted
              playsInline
              preload={i === 0 ? "auto" : "metadata"}
              loop={count === 1}
              onEnded={() => count > 1 && go(index + 1)}
              onError={() => count > 1 && i === index && go(index + 1)}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <Image
              src={s.src}
              alt={s.alt}
              fill
              sizes="340px"
              priority={i === 0}
              className="object-cover object-top"
            />
          )}
        </div>
      ))}

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Précédent"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl font-bold text-[#111111] hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Suivant"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl font-bold text-[#111111] hover:bg-white"
          >
            ›
          </button>

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-4">
            <div className="flex gap-2 rounded-full bg-white/85 px-3 py-2">
              {slides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  aria-label={`Voir l’élément ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className={`size-3 rounded-full ${i === index ? "bg-[#D6006F]" : "bg-[#111111]/30"}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              className="min-h-9 rounded-full bg-white/85 px-3 text-sm font-semibold text-[#111111] hover:bg-white"
            >
              {userPaused ? "Lecture" : "Pause"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
