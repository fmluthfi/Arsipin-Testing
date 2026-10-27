"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LandingAnimations() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.from(".app-nav .brand, .app-nav .nav-links a, .app-nav .nav-actions > *", {
        autoAlpha: 0,
        y: -10,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
      });

      const hero = gsap.timeline({ delay: 0.08, defaults: { ease: "power3.out" } });
      hero
        .from("#hero-title", { autoAlpha: 0, y: 34, duration: 0.85 })
        .from(".hero-copy", { autoAlpha: 0, y: 22, duration: 0.7 }, "-=0.5")
        .from(".hero-actions > *", { autoAlpha: 0, y: 16, duration: 0.55, stagger: 0.1 }, "-=0.4")
        .from(".document-preview", { autoAlpha: 0, y: 28, duration: 0.85 }, "-=0.7");

      gsap.from(".workflow-section .section-heading > *", {
        autoAlpha: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".workflow-section", start: "top 82%", once: true },
      });

      gsap.from(".workflow-item", {
        autoAlpha: 0,
        y: 24,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".workflow-list", start: "top 86%", once: true },
      });

      gsap.from(".principle-intro > *", {
        autoAlpha: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: ".principle-intro", start: "top 84%", once: true },
      });

      gsap.from(".principle-list p", {
        autoAlpha: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".principle-list", start: "top 86%", once: true },
      });

      gsap.from(".closing-section > *", {
        autoAlpha: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".closing-section", start: "top 86%", once: true },
      });
    }, document.body);

    return () => context.revert();
  }, []);

  return null;
}
