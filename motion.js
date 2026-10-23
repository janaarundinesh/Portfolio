/* ==========================================================================
   Arun Dinesh Jana — cinematic motion layer

   GSAP + ScrollTrigger, loaded after script.js. This file is purely
   progressive enhancement: if either library is missing, the visitor prefers
   reduced motion, or anything here throws, the page keeps its original CSS
   entrance and every piece of content stays readable.

   Structure
     1. guard rails + helpers
     2. hero entrance
     3. section header cues
     4. project showcases (pinned on tall desktops, scroll-linked elsewhere)
     5. pointer tilt for project cards
     6. contact headline
     7. ambient texture
   ========================================================================== */

(() => {
  "use strict";

  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Breathing room a pinned card needs above and below to be staged centred.
  const PIN_MARGIN = 24;

  // Anything that hid the intro for GSAP must be undone if we cannot animate.
  const release = () => root.classList.remove("motion-pending");

  if (!window.gsap || !window.ScrollTrigger || reduce.matches) {
    release();
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const EASE = "expo.out";

  const clear = (targets, props) => {
    const list = gsap.utils.toArray(targets).filter(Boolean);
    if (list.length) gsap.set(list, { clearProps: props });
  };

  /* ----------------------------------------------------------------------
     1. Hero entrance
     Staggered name lines inside their masks, eyebrow, the spotlight photo
     opening up, and the portrait frame wiping in from the bottom.
     ---------------------------------------------------------------------- */

  const playIntro = () => {
    const intro = document.querySelector(".intro");
    if (!intro) {
      release();
      return;
    }

    // CSS entrance off for good — GSAP owns this one now.
    intro.style.animation = "none";
    intro.querySelectorAll("[data-intro]").forEach((el) => {
      el.style.animation = "none";
    });

    const nav = document.querySelector("[data-nav]");
    const portrait = intro.querySelector(".hero__portrait");
    if (portrait) portrait.style.animation = "none";

    // Returning to a scrolled position: never replay the opening on top of it.
    if (window.scrollY > 60) {
      release();
      return;
    }

    const eyebrow = intro.querySelector(".eyebrow");
    const lines = intro.querySelectorAll(".hero__title .line > span");
    const lede = intro.querySelector(".hero__lede");
    const actions = intro.querySelector(".hero__actions");
    const footItems = intro.querySelectorAll(".hero__foot-item");
    const welcomePhoto = intro.querySelector(".welcome__frame img");
    const portraitPhoto = intro.querySelector(".hero__portrait-frame img");
    const live = intro.classList.contains("is-live");
    const animated = [];

    const tl = gsap.timeline({
      defaults: { ease: EASE },
      onComplete: () =>
        clear(animated, "transform,opacity,visibility,clipPath")
    });

    if (nav) {
      tl.fromTo(
        nav,
        { y: -18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8 },
        0
      );
      animated.push(nav);
    }

    if (eyebrow) {
      tl.fromTo(
        eyebrow,
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.85 },
        0.06
      );
      animated.push(eyebrow);
    }

    if (lines.length) {
      tl.fromTo(
        lines,
        { yPercent: 112, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.085 },
        0.16
      );
      animated.push(...lines);
    }

    if (welcomePhoto) {
      tl.fromTo(
        welcomePhoto,
        { scale: 1.16, clipPath: "inset(0% 0% 100% 0%)" },
        { scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "power2.out" },
        0.1
      );
      animated.push(welcomePhoto);
    }

    if (portraitPhoto) {
      tl.fromTo(
        portraitPhoto,
        { scale: 1.08, clipPath: "inset(100% 0% 0% 0%)" },
        { scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.out" },
        0.5
      );
      animated.push(portraitPhoto);
    }

    // The narrow layout has one column and no welcome morph, so the copy is
    // part of the entrance. On the wide stage it is revealed by scrolling.
    if (!live && portrait) {
      tl.fromTo(
        portrait,
        { y: 26, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.1 },
        0.45
      );
      animated.push(portrait);

      if (lede) {
        tl.fromTo(
          lede,
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.9 },
          0.62
        );
        animated.push(lede);
      }

      if (actions) {
        tl.fromTo(
          actions,
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.9 },
          0.7
        );
        animated.push(actions);
      }

      if (footItems.length) {
        tl.fromTo(
          footItems,
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08 },
          0.8
        );
        animated.push(...footItems);
      }
    }

    // Hand the stage over: the timeline's first frame is already rendered, so
    // lifting the "hidden" class cannot flash the finished layout.
    release();
  };

  /* ----------------------------------------------------------------------
     2. Section header cues
     The number, the title and the rule arrive as one beat: a rule draws out
     from the left with a short acid glow that burns off as it lands.
     ---------------------------------------------------------------------- */

  const buildHeadCues = () => {
    const cues = new Map();
    const touched = [];

    // IntersectionObserver rather than a scroll trigger: pinned project cards
    // change the document height while ScrollTrigger is measuring, and a cue
    // created before the pins can keep the wrong start position. The observer
    // always reads the live box, so headings still arrive at 88% of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const tl = cues.get(entry.target);
          if (tl) tl.play(0);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 }
    );

    document.querySelectorAll(".section__head").forEach((head) => {
      const num = head.querySelector(".section__num");
      const title = head.querySelector(".section__title");
      const rule = head.querySelector(".section__rule");

      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });

      if (num) {
        tl.from(num, { autoAlpha: 0, x: -12, duration: 0.7 }, 0);
        touched.push(num);
      }
      if (title) {
        tl.from(title, { yPercent: 60, autoAlpha: 0, duration: 1.05 }, 0.04);
        touched.push(title);
      }
      if (rule) {
        tl.fromTo(
          rule,
          {
            scaleX: 0,
            transformOrigin: "0% 50%",
            boxShadow: "0 0 18px rgba(204,255,0,0.45)"
          },
          {
            scaleX: 1,
            boxShadow: "0 0 0 rgba(204,255,0,0)",
            duration: 1.25
          },
          0.1
        );
        touched.push(rule);
      }

      cues.set(head, tl);
      observer.observe(head);
    });

    return () => {
      observer.disconnect();
      cues.forEach((tl) => tl.kill());
      clear(touched, "opacity,visibility,transform,boxShadow");
    };
  };

  /* ----------------------------------------------------------------------
     3. Project showcases
     On tall desktops the whole card pins while the figure settles, glows and
     changes scene at the midpoint. On smaller screens the same idea plays
     out without pinning: the figure zooms in and switches as it crosses the
     viewport. The figure tabs stay in charge of what the two scenes are.
     ---------------------------------------------------------------------- */

  const buildShowcase = (feature, pinned) => {
    const body = feature.querySelector(".feature__body");
    const media = feature.querySelector("[data-media]");
    const stage = feature.querySelector(".media");
    const figure = feature.querySelector(".feature__figure");
    if (!body || !media || !stage || !figure) return () => {};

    let scene = 0;
    let held = false;

    // Only the pinned desktop card hands the figure over to the scroll
    // position. On a phone the trigger is the whole card, and its midpoint
    // falls while the figure is still on its way up the screen — the panel
    // would flip before anyone had looked at it. There the tabs keep charge of
    // which figure is showing, and the scroll only carries the zoom.
    const driveScene = pinned;

    // Tells the base layer that scroll position owns the scene, so its
    // visibility observer does not reset the figure on the way in or out.
    if (driveScene) media.dataset.scrollScene = "on";

    const setScene = (index, force) => {
      if (index === scene && !force) return;
      scene = index;
      media.dispatchEvent(
        new CustomEvent("portfolio:scene", { detail: { index } })
      );
    };

    const hold = (progress = 0) => {
      if (!held) {
        held = true;
        media.dispatchEvent(new Event("portfolio:hold"));
      }
      // Re-assert the scene whenever the card is entered. The base layer may
      // have reset the figure while the card was out of view.
      setScene(progress > 0.5 ? 1 : 0, true);
    };

    const releaseScene = () => {
      if (!held) return;
      held = false;
      media.dispatchEvent(new Event("portfolio:release"));
    };

    const trigger = {
      trigger: feature,
      start: pinned ? "center center" : "top 78%",
      end: pinned ? "+=72%" : "bottom 35%",
      pin: pinned,
      pinSpacing: pinned,
      anticipatePin: pinned ? 1 : 0,
      scrub: pinned ? 0.7 : 0.4,
      invalidateOnRefresh: true
    };

    if (driveScene) {
      trigger.onEnter = (self) => hold(self.progress);
      trigger.onEnterBack = (self) => hold(self.progress);
      trigger.onLeave = releaseScene;
      trigger.onLeaveBack = () => {
        setScene(0);
        releaseScene();
      };
      trigger.onUpdate = (self) => setScene(self.progress > 0.5 ? 1 : 0);
    }

    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: trigger });

    tl.fromTo(figure, { y: 0 }, { y: pinned ? -12 : -5, duration: 1 }, 0)
      .fromTo(
        stage,
        { scale: 0.985, boxShadow: "0 0 0 rgba(0,0,0,0)" },
        {
          scale: pinned ? 1.015 : 1.005,
          boxShadow:
            "0 28px 80px rgba(0,0,0,0.45), 0 0 44px rgba(204,255,0,0.08)",
          duration: 1
        },
        0
      )
      .fromTo(body, { y: 0 }, { y: pinned ? -18 : -6, duration: 1 }, 0);

    // A dip while the panel is swapped — only where a swap actually happens.
    if (driveScene) {
      tl.to(stage, { opacity: 0.35, duration: 0.1 }, 0.42)
        .to(stage, { opacity: 1, duration: 0.16 }, 0.5);
    }

    return () => {
      if (driveScene) {
        setScene(0);
        releaseScene();
      }
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
      delete media.dataset.scrollScene;
      clear([stage, figure, body], "transform,opacity,boxShadow");
    };
  };

  /* ----------------------------------------------------------------------
     4. Pointer tilt
     Small rotations driven by the cursor position, released on exit. Only
     for real pointers; touch devices keep the flat, readable cards.
     ---------------------------------------------------------------------- */

  const attachTilt = (elements, { max = 4, lift = 0 } = {}) => {
    const list = gsap.utils.toArray(elements).filter(Boolean);
    if (!finePointer || !list.length) return () => {};

    const bound = [];
    const config = { duration: 0.55, ease: "power3" };

    list.forEach((el) => {
      if (el.dataset.tilt === "gsap") return;
      el.dataset.tilt = "gsap";

      const rx = gsap.quickTo(el, "rotationX", config);
      const ry = gsap.quickTo(el, "rotationY", config);
      const ty = lift ? gsap.quickTo(el, "y", config) : null;

      gsap.set(el, { transformPerspective: 1000, transformOrigin: "50% 50%" });

      const move = (event) => {
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = gsap.utils.clamp(
          -0.5,
          0.5,
          (event.clientX - rect.left) / rect.width - 0.5
        );
        const py = gsap.utils.clamp(
          -0.5,
          0.5,
          (event.clientY - rect.top) / rect.height - 0.5
        );
        rx(-py * max);
        ry(px * max);
        if (ty) ty(-lift);
      };

      const leave = () => {
        rx(0);
        ry(0);
        if (ty) ty(0);
      };

      el.addEventListener("pointermove", move, { passive: true });
      el.addEventListener("pointerleave", leave);
      bound.push({ el, move, leave });
    });

    root.classList.add("motion-tilt");

    return () => {
      bound.forEach(({ el, move, leave }) => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
        delete el.dataset.tilt;
        gsap.set(el, {
          clearProps: "transform,transformPerspective,transformOrigin"
        });
      });
      if (!document.querySelector('[data-tilt="gsap"]')) {
        root.classList.remove("motion-tilt");
      }
    };
  };

  /* ----------------------------------------------------------------------
     5. Closing headline
     ---------------------------------------------------------------------- */

  const buildContact = () => {
    const contact = document.querySelector(".contact");
    if (!contact) return () => {};

    const lines = contact.querySelectorAll(".contact__title .line > span");
    const email = contact.querySelector(".contact__email");
    const touched = [...lines, email].filter(Boolean);
    if (!touched.length) return () => {};

    // GSAP owns the headline now: the mask-and-rise is the reveal. Let the
    // block itself be visible so the lines are not animating behind a fade.
    const heading = contact.querySelector(".contact__title");
    if (heading && lines.length) heading.classList.add("is-in");

    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });

    if (lines.length) {
      tl.from(
        lines,
        { yPercent: 112, opacity: 0, duration: 1.15, stagger: 0.1 },
        0
      );
    }
    if (email) {
      tl.from(email, { y: 18, autoAlpha: 0, duration: 0.9 }, 0.35);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          tl.play(0);
        });
      },
      { rootMargin: "0px 0px -28% 0px", threshold: 0 }
    );
    observer.observe(contact);

    return () => {
      observer.disconnect();
      tl.kill();
      clear(touched, "transform,opacity,visibility");
    };
  };

  /* ----------------------------------------------------------------------
     5b. Experience cards
     The stack arrives as one short stagger. It fires once, so opening a card
     later never re-triggers the entrance.
     ---------------------------------------------------------------------- */

  const buildExperienceCues = () => {
    const stack = document.querySelector("[data-xp-stack]");
    if (!stack) return () => {};

    const cards = gsap.utils.toArray(".xp-card", stack);
    if (!cards.length) return () => {};

    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });
    tl.from(cards, {
      y: 26,
      autoAlpha: 0,
      duration: 0.85,
      stagger: 0.08,
      clearProps: "transform,opacity,visibility"
    });

    const trigger = ScrollTrigger.create({
      trigger: stack,
      start: "top 88%",
      once: true,
      onEnter: () => tl.play(0)
    });

    // A reload that restores a scroll position inside (or past) the stack
    // starts with the trigger already crossed, so play it here as well.
    if (stack.getBoundingClientRect().top < window.innerHeight * 0.88) {
      tl.play(0);
    }

    return () => {
      trigger.kill();
      tl.kill();
      clear(cards, "transform,opacity,visibility");
    };
  };

  /* ----------------------------------------------------------------------
     6. Ambient film grain
     A barely-there change in texture across the whole page; the grain layer
     is already fixed, so this only touches its opacity.
     ---------------------------------------------------------------------- */

  const buildAmbient = () => {
    const grain = document.querySelector(".grain");
    if (!grain) return () => {};

    const tween = gsap.fromTo(
      grain,
      { opacity: 0.035 },
      {
        opacity: 0.052,
        ease: "none",
        scrollTrigger: {
          start: 0,
          end: "max",
          scrub: true,
          invalidateOnRefresh: true
        }
      }
    );

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
      clear(grain, "opacity");
    };
  };

  /* ----------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */

  try {
    playIntro();

    const mm = gsap.matchMedia();

    // Head cues, tilt, contact and grain — anywhere, motion allowed.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cleanups = [
        buildHeadCues(),
        buildExperienceCues(),
        buildContact(),
        attachTilt(document.querySelectorAll(".mini:not(.mini--static)"), {
          max: 5,
          lift: 5
        }),
        attachTilt(document.querySelectorAll(".feature__figure"), { max: 2.2 }),
        buildAmbient()
      ];
      return () => cleanups.forEach((fn) => fn && fn());
    });

    // Tall desktops: pin the card. Cards that cannot fit stay unpinned here.
    mm.add(
      "(prefers-reduced-motion: no-preference) and (min-width: 981px) and (min-height: 780px)",
      () => {
        const cleanups = [];
        document.querySelectorAll(".feature").forEach((feature) => {
          const fits =
            feature.offsetHeight + PIN_MARGIN * 2 <= window.innerHeight;
          cleanups.push(buildShowcase(feature, fits));
        });
        return () => cleanups.forEach((fn) => fn && fn());
      }
    );

    // Phones, tablets and short laptops: no pin, same visual changes.
    mm.add(
      "(prefers-reduced-motion: no-preference) and (max-width: 980px), (prefers-reduced-motion: no-preference) and (max-height: 779px)",
      () => {
        const cleanups = [];
        document.querySelectorAll(".feature").forEach((feature) => {
          cleanups.push(buildShowcase(feature, false));
        });
        return () => cleanups.forEach((fn) => fn && fn());
      }
    );

    window.addEventListener("load", () => ScrollTrigger.refresh());

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        window.setTimeout(() => ScrollTrigger.refresh(), 80);
      });
    }
  } catch (error) {
    // Any failure returns the page to its original CSS behaviour.
    release();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.set(
      document.querySelectorAll(
        "[data-intro], .section__num, .section__title, .section__rule, " +
          ".contact__email, .contact__title .line > span, .welcome, .media, " +
          ".feature__figure, .feature__body, .mini, .grain"
      ),
      { clearProps: "all" }
    );
    if (window.console && console.warn) {
      console.warn("Motion layer disabled:", error);
    }
  }
})();
