"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

export function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    if (reducedMotion.matches || !finePointer.matches) return;

    let targetY = window.scrollY;
    let tickerActive = false;

    const clamp = (value: number) => Math.max(0, Math.min(value, document.documentElement.scrollHeight - window.innerHeight));
    const stopTicker = () => {
      if (!tickerActive) return;
      tickerActive = false;
      gsap.ticker.remove(render);
    };
    const render = () => {
      const currentY = window.scrollY;
      const distance = targetY - currentY;
      if (Math.abs(distance) < 0.5) {
        window.scrollTo(0, targetY);
        stopTicker();
        return;
      }
      window.scrollTo(0, currentY + distance * 0.14);
    };
    const startTicker = () => {
      if (tickerActive) return;
      tickerActive = true;
      gsap.ticker.add(render);
    };
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const delta = event.deltaY * multiplier;
      if (!delta) return;
      event.preventDefault();
      targetY = clamp(targetY + delta * 0.9);
      startTicker();
    };
    const handleScroll = () => {
      if (!tickerActive) targetY = window.scrollY;
    };
    const handleResize = () => { targetY = clamp(targetY); };
    const handleAnchorClick = (event: MouseEvent) => {
      const origin = event.target instanceof Element ? event.target : null;
      const link = origin?.closest<HTMLAnchorElement>("a[href*='#']");
      if (!link) return;

      const destinationUrl = new URL(link.href, window.location.href);
      if (destinationUrl.origin !== window.location.origin || destinationUrl.pathname !== window.location.pathname) return;
      const targetId = destinationUrl.hash;
      if (!targetId) return;
      const target = document.querySelector<HTMLElement>(targetId);
      if (!target) return;

      event.preventDefault();
      stopTicker();
      window.history.pushState(null, "", targetId);
      const destination = clamp(target.getBoundingClientRect().top + window.scrollY - 82);
      targetY = destination;
      gsap.to(window, {
        duration: 0.85,
        ease: "power2.out",
        overwrite: true,
        scrollTo: { y: destination, autoKill: true },
        onComplete: () => target.focus({ preventScroll: true }),
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("click", handleAnchorClick);
    return () => {
      stopTicker();
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return null;
}
