/* ==========================================================================
   Arun Dinesh Jana — portfolio interactions
   Vanilla JS, no dependencies. Everything degrades to a readable page.
   ========================================================================== */

(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ----------------------------------------------------------------------
     Duplicate marquee content so the -50% loop is seamless
     ---------------------------------------------------------------------- */
  document.querySelectorAll("[data-marquee]").forEach((track) => {
    track.innerHTML += track.innerHTML;
    track.classList.add("is-ready");
  });

  /* ----------------------------------------------------------------------
     Scroll progress + sticky nav
     ---------------------------------------------------------------------- */
  const progressBar = document.querySelector("[data-progress]");
  const nav = document.querySelector("[data-nav]");
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      if (progressBar) progressBar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
      if (nav) nav.classList.toggle("is-stuck", y > 24);
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ----------------------------------------------------------------------
     Mobile menu
     ---------------------------------------------------------------------- */
  const menu = document.querySelector("[data-menu]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  let menuOpen = false;

  if (menu && menuToggle) {
    menu.setAttribute("inert", "");

    const openMenu = () => {
      menuOpen = true;
      menu.hidden = false;
      menu.removeAttribute("inert");
      menuToggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-locked");
      requestAnimationFrame(() => menu.classList.add("is-open"));
    };

    const closeMenu = () => {
      if (!menuOpen) return;
      menuOpen = false;
      menu.classList.remove("is-open");
      menu.setAttribute("inert", "");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked");
      window.setTimeout(() => {
        if (!menuOpen) menu.hidden = true;
      }, 360);
    };

    menuToggle.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  /* ----------------------------------------------------------------------
     Same-page links
     Smooth scrolling is done here rather than with CSS: ScrollTrigger has to
     measure pins on a document that is not animating its own scroll.
     ---------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#" || link.classList.contains("skip-link")) return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      const top =
        hash === "#top" ? 0 : target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
      if (window.history && history.pushState) history.pushState(null, "", hash);
    });
  });

  /* ----------------------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------------------- */
  /* ----------------------------------------------------------------------
     Welcome → hero: the opening photograph shrinks into the portrait slot
     ---------------------------------------------------------------------- */
  const intro = document.querySelector("[data-intro]");
  if (intro) {
    const stage = intro.querySelector("[data-intro-stage]");
    const welcome = intro.querySelector("[data-welcome]");
    const cue = intro.querySelector(".welcome__cue");
    const inner = stage.querySelector(".hero__inner");
    const portrait = stage.querySelector("[data-portrait-slot]");
    const frame = portrait ? portrait.querySelector(".hero__portrait-frame") : null;
    const wideEnough = window.matchMedia("(min-width: 981px)");
    let live = false;
    let introTop = 0;
    let dx = 0;
    let dy = 0;
    let startScale = 1.4;
    let stageH = 0;
    let distance = 1;
    let raf = 0;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const update = () => {
      if (!live) return;
      const p = clamp((window.scrollY - introTop) / distance, 0, 1);
      const slide = 1 - p;
      const scale = 1 + (startScale - 1) * slide;
      // The badge hangs at -2.4deg, so the photograph matches it as it lands.
      welcome.style.transform =
        "translate3d(" + (dx * slide).toFixed(2) + "px," + (dy * slide).toFixed(2) + "px,0) " +
        "scale(" + scale.toFixed(4) + ") rotate(" + (-1.4 * slide - 2.4 * p).toFixed(2) + "deg)";
      welcome.style.opacity = String(clamp(1 - (p - 0.52) / 0.26, 0, 1));
      stage.style.setProperty("--portrait-op", String(clamp((p - 0.55) / 0.25, 0, 1)));
      stage.style.setProperty("--copy-op", String(clamp((p - 0.34) / 0.32, 0, 1)));
      if (cue) cue.style.opacity = String(clamp(1 - p / 0.16, 0, 1));
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    const measure = () => {
      if (!frame || !inner || !wideEnough.matches || prefersReduced) {
        intro.classList.remove("is-live");
        live = false;
        return;
      }

      intro.classList.add("is-live");
      live = true;

      const stageRect = stage.getBoundingClientRect();
      const width = frame.offsetWidth;
      const height = frame.offsetHeight;
      if (!width || !height) {
        intro.classList.remove("is-live");
        live = false;
        return;
      }

      introTop = intro.getBoundingClientRect().top + window.scrollY;
      stageH = stage.offsetHeight;
      distance = Math.max(1, intro.offsetHeight - stageH);

      // The badge nests a rotating card inside the figure, so measure the
      // frame's centre on screen rather than chaining offsetLeft/offsetTop.
      const frameRect = frame.getBoundingClientRect();
      const x = frameRect.left + frameRect.width / 2 - stageRect.left - width / 2;
      const y = frameRect.top + frameRect.height / 2 - stageRect.top - height / 2;
      welcome.style.width = width + "px";
      welcome.style.height = height + "px";
      welcome.style.left = x + "px";
      welcome.style.top = y + "px";

      startScale = clamp((stageH * 0.78) / height, 1.22, 1.72);
      dx = stageRect.width * 0.695 - (x + width / 2);
      dy = stageH * 0.5 - (y + height / 2);

      update();
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      measure();
      onScroll();
    });
    if (wideEnough.addEventListener) wideEnough.addEventListener("change", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  }

  /* ----------------------------------------------------------------------
     Portrait badge
     A click flips the hanging ID card to its reverse; the face swap also
     switches which side assistive tech can read.
     ---------------------------------------------------------------------- */
  const badge = document.querySelector("[data-badge-card]");

  if (badge) {
    const flip = badge.querySelector(".hero__badge-flip");
    const front = badge.querySelector(".hero__badge-front");
    const back = badge.querySelector(".hero__badge-back");

    if (flip) {
      flip.addEventListener("click", () => {
        const flipped = badge.classList.toggle("is-flipped");
        flip.setAttribute("aria-pressed", String(flipped));
        if (front) front.setAttribute("aria-hidden", String(flipped));
        if (back) back.setAttribute("aria-hidden", String(!flipped));
      });
    }
  }

  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !prefersReduced) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ----------------------------------------------------------------------
     Animated numbers
     ---------------------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-count]");
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const runCounter = (el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    const duration = 1500;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(target * easeOutExpo(t)) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };

    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }
    requestAnimationFrame(step);
  };

  if (counters.length) {
    if ("IntersectionObserver" in window && !prefersReduced) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            runCounter(entry.target);
            counterObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => counterObserver.observe(el));
    } else {
      counters.forEach((el) => {
        el.textContent = Number(el.dataset.count || 0) + (el.dataset.suffix || "");
      });
    }
  }

  /* ----------------------------------------------------------------------
     Active section in nav
     ---------------------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll(".nav__links a"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const contactSection = document.getElementById("contact");
    const inBand = new Set();
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        });

        // Clear the highlight when nothing sits in the reading band, e.g. on
        // the welcome screen or while the closing contact block fills it.
        const current = sections.find((section) => inBand.has(section.id));
        navLinks.forEach((link) => {
          link.classList.toggle(
            "is-current",
            !!current && link.getAttribute("href") === `#${current.id}`
          );
        });
      },
      { rootMargin: "-46% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((section) => sectionObserver.observe(section));
    // clear the highlight when the closing contact block is in view
    if (contactSection) sectionObserver.observe(contactSection);
  }

  /* ----------------------------------------------------------------------
     Year
     ---------------------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ----------------------------------------------------------------------
     Hero flow field
     ---------------------------------------------------------------------- */
  const canvas = document.querySelector("[data-field]");

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const hero = canvas.parentElement;
    let width = 0;
    let height = 0;
    let particles = [];
    let frame = 0;
    let running = true;
    let visible = true;
    const pointer = { x: -9999, y: -9999, active: false };

    const rand = (min, max) => min + Math.random() * (max - min);

    const fieldAngle = (x, y, t) =>
      Math.sin(x * 0.0038 + t * 0.00021) * Math.PI +
      Math.cos(y * 0.0052 - t * 0.00017) * Math.PI * 0.7 +
      Math.sin((x + y) * 0.0016) * Math.PI * 0.4;

    const seed = () => {
      const count = Math.min(150, Math.max(45, Math.round((width * height) / 16000)));
      particles = Array.from({ length: count }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        prevX: 0,
        prevY: 0,
        speed: rand(0.5, 1.5),
        life: rand(0.3, 1),
        tone: Math.random() > 0.86 ? "paper" : "acid"
      }));
      particles.forEach((p) => { p.prevX = p.x; p.prevY = p.y; });
    };

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      seed();
      if (prefersReduced) drawStill();
    };

    const drawStill = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(204,255,0,0.4)";
        ctx.fill();
      });
    };

    const draw = () => {
      if (!running) return;

      // trailing fade
      ctx.fillStyle = "rgba(7,8,10,0.055)";
      ctx.fillRect(0, 0, width, height);

      const t = performance.now();

      particles.forEach((p) => {
        const angle = fieldAngle(p.x, p.y, t);
        let vx = Math.cos(angle) * p.speed;
        let vy = Math.sin(angle) * p.speed;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 170 && dist > 0.001) {
            const push = (1 - dist / 170) * 1.7;
            vx += (dx / dist) * push;
            vy += (dy / dist) * push;
          }
        }

        p.prevX = p.x;
        p.prevY = p.y;
        p.x += vx;
        p.y += vy;

        if (p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) {
          p.x = rand(0, width);
          p.y = rand(0, height);
          p.prevX = p.x;
          p.prevY = p.y;
          return;
        }

        const alpha = p.tone === "paper" ? 0.14 * p.life : 0.32 * p.life;
        const color = p.tone === "paper" ? "244,241,232" : "204,255,0";
        ctx.strokeStyle = `rgba(${color},${alpha})`;
        ctx.lineWidth = p.tone === "paper" ? 0.7 : 1;
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });

      frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (prefersReduced || frame) return;
      frame = requestAnimationFrame(draw);
    };

    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const reset = () => {
      stop();
      resize();
      start();
    };

    resize();
    if (!prefersReduced) start();

    let resizeTimer;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(reset, 180);
    });

    // Web fonts and responsive reflow can change the hero's height after paint.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (canvas.width !== Math.round(hero.clientWidth * (window.devicePixelRatio || 1))) reset();
      });
    }

    if ("ResizeObserver" in window) {
      let roTimer;
      const ro = new ResizeObserver(() => {
        window.clearTimeout(roTimer);
        roTimer = window.setTimeout(reset, 200);
      });
      ro.observe(hero);
    }

    if ("IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          visible = entries[0] ? entries[0].isIntersecting : true;
          if (visible && running) start();
          else stop();
        },
        { threshold: 0 }
      );
      heroObserver.observe(hero);
    }

    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running && visible) start();
      else stop();
    });

    hero.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    });
    hero.addEventListener("pointerleave", () => { pointer.active = false; });
  }

  /* ----------------------------------------------------------------------
     Custom cursor (pointer-fine only)
     ---------------------------------------------------------------------- */
  const dot = document.querySelector("[data-cursor-dot]");
  const ring = document.querySelector("[data-cursor-ring]");

  if (dot && ring && finePointer && !prefersReduced) {
    document.body.classList.add("custom-cursor");
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;

    window.addEventListener(
      "pointermove",
      (event) => {
        mx = event.clientX;
        my = event.clientY;
        dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      },
      { passive: true }
    );

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const hoverables = "a, button, .project, .stat, .xp-card, .cred, [data-tilt]";
    document.addEventListener("pointerover", (event) => {
      if (event.target.closest(hoverables)) document.body.classList.add("cursor-active");
    });
    document.addEventListener("pointerout", (event) => {
      if (event.target.closest(hoverables)) document.body.classList.remove("cursor-active");
    });
    document.addEventListener("pointerleave", () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });
    document.addEventListener("pointerenter", () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    });
  }

  /* ----------------------------------------------------------------------
     Magnetic buttons + portrait tilt
     ---------------------------------------------------------------------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        el.style.transform = `translate(${x * 5}px, ${y * 4}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });

    const tilt = document.querySelector("[data-tilt]");
    if (tilt) {
      tilt.addEventListener("pointermove", (event) => {
        const rect = tilt.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        tilt.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-3px)`;
      });
      tilt.addEventListener("pointerleave", () => {
        tilt.style.transform = "";
      });
    }
  }

  /* ----------------------------------------------------------------------
     Animated WebP: swap for the poster when motion is reduced
     ---------------------------------------------------------------------- */
  if (prefersReduced) {
    document.querySelectorAll(".media__anim[data-poster]").forEach((img) => {
      img.src = img.dataset.poster;
    });
  }

  /* ----------------------------------------------------------------------
     Figure tabs (live visual <-> static figure)
     ---------------------------------------------------------------------- */
  document.querySelectorAll("[data-media]").forEach((media) => {
    const tabs = Array.from(media.querySelectorAll(".media__tab"));
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
    const figcaption = media.closest("figure")
      ? media.closest("figure").querySelector("figcaption")
      : null;
    const caption = figcaption ? figcaption.querySelector("[data-caption]") : null;
    const status = media.querySelector("[data-status]");

    if (!tabs.length || panels.some((panel) => !panel)) return;

    let index = 0;
    let timer = null;
    let paused = false;
    let manual = false;
    let onScreen = true;
    let held = false;

    const show = (next, animate) => {
      index = (next + tabs.length) % tabs.length;

      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;

        const panel = panels[i];
        panel.hidden = !on;
        panel.classList.toggle("is-active", on);
        panel.classList.remove("is-entering");

        if (on && animate && !prefersReduced) {
          // restart the entrance animation
          void panel.offsetWidth;
          panel.classList.add("is-entering");
        }
      });

      const panel = panels[index];
      if (caption) caption.textContent = panel.dataset.caption || "";
      if (status) status.textContent = panel.dataset.statusText || "";
    };

    const schedule = () => {
      window.clearInterval(timer);
      if (prefersReduced || manual || held) return;
      const interval = Number(media.dataset.interval) || 9000;
      timer = window.setInterval(() => {
        if (!onScreen || paused || document.hidden) return;
        show(index + 1, true);
      }, interval);
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => {
        manual = true;
        window.clearInterval(timer);
        show(i, true);
      });

      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const next = (index + direction + tabs.length) % tabs.length;
        manual = true;
        window.clearInterval(timer);
        show(next, true);
        tabs[next].focus();
      });
    });

    /* The cinematic layer can drive the panels from scroll position. It asks
       through events so this module keeps ownership of tabs, captions and the
       autoplay timer; a visitor's own tab choice always wins. */
    media.addEventListener("portfolio:hold", () => {
      held = true;
      window.clearInterval(timer);
      timer = null;
    });

    media.addEventListener("portfolio:scene", (event) => {
      if (manual) return;
      const next = Number(event.detail && event.detail.index);
      if (Number.isNaN(next)) return;
      held = true;
      window.clearInterval(timer);
      timer = null;
      show(next, true);
    });

    media.addEventListener("portfolio:release", () => {
      if (!held) return;
      held = false;
      schedule();
    });

    // Only rotate while the figure is on screen, and start again from the live
    // animation when a visitor arrives, so nobody lands on the static chart.
    if ("IntersectionObserver" in window) {
      onScreen = false;
      const visibility = new IntersectionObserver(
        (entries) => {
          const visible = entries[0] ? entries[0].isIntersecting : false;
          if (visible && !onScreen) {
            onScreen = true;
            // When the motion layer drives the scene from scroll progress, it
            // decides which panel is shown — never reset it here.
            if (!manual && !held && !prefersReduced && media.dataset.scrollScene !== "on") show(0, true);
            schedule();
          } else if (!visible) {
            onScreen = false;
            window.clearInterval(timer);
            timer = null;
          }
        },
        { threshold: 0.3 }
      );
      visibility.observe(media);
    }

    media.addEventListener("pointerenter", () => { paused = true; });
    media.addEventListener("pointerleave", () => { paused = false; });
    media.addEventListener("focusin", () => { paused = true; });
    media.addEventListener("focusout", () => { paused = false; });

    if (prefersReduced) {
      // no autoplay: land on the static evidence
      show(Math.min(1, tabs.length - 1), false);
    } else {
      show(0, false);
      schedule();
    }
  });

  /* ----------------------------------------------------------------------
     FILTER2 sweep: the 2-D maxima animation
     ---------------------------------------------------------------------- */
  const paretoCanvas = document.querySelector("[data-pareto]");

  if (paretoCanvas && paretoCanvas.getContext) {
    const ctx = paretoCanvas.getContext("2d");
    const panel = paretoCanvas.closest(".media__panel");
    const DURATION = 9200;
    const APPEAR_END = 2200;
    const SWEEP_START = 2400;
    const SWEEP_END = 5700;
    const SKYLINE_END = 7000;
    const HOLD_END = 8600;

    let width = 0;
    let height = 0;
    let points = [];
    let maxima = [];
    let evaluation = new Map();
    let elapsed = 0;
    let last = performance.now();
    let onScreen = true;
    let raf = 0;

    const pad = { l: 34, r: 18, t: 26, b: 26 };
    const ink = "#07080a";
    const paper = "244,241,232";
    const acid = "#ccff00";
    const mono = (size) => `${size}px "JetBrains Mono", ui-monospace, monospace`;

    const build = () => {
      const count = Math.max(54, Math.min(92, Math.round(width / 7.2)));
      points = Array.from({ length: count }, () => ({
        x: 0.05 + Math.random() * 0.9,
        y: 0.06 + Math.random() * 0.88
      }));

      // right-to-left sweep: a point is a maximum if it is higher than
      // everything already seen to its right.
      const sorted = [...points].sort((a, b) => b.x - a.x);
      const kept = new Set();
      let best = -Infinity;

      sorted.forEach((point) => {
        if (point.y > best) {
          best = point.y;
          kept.add(point);
        }
      });

      maxima = points.filter((point) => kept.has(point)).sort((a, b) => a.x - b.x);

      evaluation = new Map();
      sorted.forEach((point) => {
        const at = SWEEP_START + (1 - point.x) * (SWEEP_END - SWEEP_START);
        evaluation.set(point, at);
      });
    };

    const resize = () => {
      const rect = paretoCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      paretoCanvas.width = Math.round(width * dpr);
      paretoCanvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const X = (v) => pad.l + v * (width - pad.l - pad.r);
    const Y = (v) => height - pad.b - v * (height - pad.t - pad.b);

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      const fade = time > HOLD_END ? 1 - (time - HOLD_END) / (DURATION - HOLD_END) : 1;
      ctx.globalAlpha = Math.max(0, fade);

      // plot frame + grid
      ctx.strokeStyle = `rgba(${paper},0.09)`;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i += 1) {
        const gx = X(i / 4);
        const gy = Y(i / 4);
        ctx.beginPath();
        ctx.moveTo(gx, Y(0));
        ctx.lineTo(gx, Y(1));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(X(0), gy);
        ctx.lineTo(X(1), gy);
        ctx.stroke();
      }

      ctx.font = mono(9);
      ctx.fillStyle = `rgba(${paper},0.34)`;
      ctx.textAlign = "left";
      ctx.fillText("x\u2082", X(0) - 6, Y(1) - 8);
      ctx.textAlign = "right";
      ctx.fillText("x\u2081", X(1), Y(0) + 18);
      ctx.textAlign = "left";
      ctx.fillText(`${points.length} points`, X(0), Y(1) + 2);

      // sweep progress
      const sweepT = Math.min(1, Math.max(0, (time - SWEEP_START) / (SWEEP_END - SWEEP_START)));
      const sweepX = 1 - sweepT;
      let bestY = -1;
      let found = 0;

      if (time >= SWEEP_START) {
        // running maximum so far (what the sweep has already passed)
        points.forEach((point) => {
          const at = evaluation.get(point);
          if (at !== undefined && time >= at && point.y > bestY) bestY = point.y;
        });
      }

      points.forEach((point, i) => {
        const appear = 300 + (i / points.length) * (APPEAR_END - 300);
        if (time < appear) return;

        const at = evaluation.get(point);
        const evaluated = time >= at;
        const isMax = evaluated && maxima.includes(point);
        const alpha = Math.min(1, (time - appear) / 300);

        if (isMax) found += 1;

        let fill = `rgba(${paper},${0.55 * alpha})`;
        let radius = 2.6;

        if (evaluated && !isMax) {
          fill = `rgba(${paper},${0.13 * alpha})`;
          radius = 1.9;
        }
        if (isMax) {
          fill = acid;
          radius = 4;
        }

        ctx.beginPath();
        ctx.arc(X(point.x), Y(point.y), radius, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();

        if (isMax) {
          ctx.beginPath();
          ctx.arc(X(point.x), Y(point.y), 8, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(204,255,0,${0.28 * alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // sweep line
      if (time >= SWEEP_START && time < SWEEP_END + 250) {
        const x = X(sweepX);
        ctx.strokeStyle = `rgba(${paper},0.35)`;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(x, Y(1) - 4);
        ctx.lineTo(x, Y(0));
        ctx.stroke();
        ctx.setLineDash([]);

        if (bestY >= 0) {
          ctx.strokeStyle = "rgba(204,255,0,0.3)";
          ctx.beginPath();
          ctx.moveTo(x, Y(bestY));
          ctx.lineTo(X(1), Y(bestY));
          ctx.stroke();
        }

        ctx.font = mono(8);
        ctx.fillStyle = "rgba(204,255,0,0.8)";
        ctx.textAlign = "left";
        ctx.fillText("sweep", Math.min(x + 5, X(1) - 34), Y(1) + 18);
        ctx.textAlign = "left";
      }

      // skyline
      if (time >= SWEEP_END && maxima.length > 1) {
        const progress = Math.min(1, (time - SWEEP_END) / (SKYLINE_END - SWEEP_END));
        const segments = maxima.length - 1;
        const drawn = progress * segments;

        ctx.strokeStyle = acid;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.shadowColor = "rgba(204,255,0,0.55)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(X(maxima[0].x), Y(maxima[0].y));

        for (let i = 0; i < segments; i += 1) {
          const a = maxima[i];
          const b = maxima[i + 1];
          if (drawn <= i) break;
          const part = Math.min(1, drawn - i);
          const cornerX = X(a.x + (b.x - a.x) * part);
          ctx.lineTo(cornerX, Y(a.y));
          if (part >= 1) ctx.lineTo(X(b.x), Y(b.y));
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // counters
      ctx.font = mono(9);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(204,255,0,0.9)";
      const shown = time >= SWEEP_END ? maxima.length : found;
      ctx.fillText(`maxima ${shown}`, X(1), Y(1) + 2);
      ctx.textAlign = "left";

      ctx.globalAlpha = 1;
    };

    const frame = (now) => {
      const delta = Math.min(64, now - last);
      last = now;

      if (onScreen && panel && !panel.hidden && !document.hidden) {
        elapsed = (elapsed + delta) % DURATION;
        if (elapsed < 40) build();
        draw(elapsed);
      }

      raf = requestAnimationFrame(frame);
    };

    resize();

    if (prefersReduced) {
      draw(HOLD_END - 400);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => draw(HOLD_END - 400));
      }
    } else {
      raf = requestAnimationFrame(frame);
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => { onScreen = entries[0] ? entries[0].isIntersecting : true; },
        { threshold: 0.05 }
      );
      observer.observe(paretoCanvas);
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (prefersReduced) draw(HOLD_END - 400);
      }, 200);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (!prefersReduced) draw(elapsed); });
    }

    window.addEventListener("pagehide", () => cancelAnimationFrame(raf));
  }

  /* ----------------------------------------------------------------------
     ThermoSolve: replay the interface demo while it is on screen
     ---------------------------------------------------------------------- */
  const thermo = document.querySelector("[data-thermo]");

  if (thermo && !prefersReduced && "IntersectionObserver" in window) {
    let timer = null;

    const replay = () => {
      thermo.classList.remove("is-live");
      void thermo.offsetWidth;
      thermo.classList.add("is-live");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0] ? entries[0].isIntersecting : false;
        if (visible && !timer) {
          replay();
          timer = window.setInterval(replay, 9000);
        } else if (!visible && timer) {
          window.clearInterval(timer);
          timer = null;
          thermo.classList.remove("is-live");
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(thermo);
  }

  /* ----------------------------------------------------------------------
     Contact form — Web3Forms when a key is set, mail app otherwise
     ---------------------------------------------------------------------- */
  const mailForm = document.querySelector("[data-mail]");
  if (mailForm) {
    const keyInput = mailForm.querySelector("[data-mail-key]");
    const statusEl = mailForm.querySelector("[data-mail-status]");
    const submitBtn = mailForm.querySelector('button[type="submit"]');
    const submitLabel = mailForm.querySelector("[data-mail-label]");
    const address = "janaarundinesh@gmail.com";
    const defaultNote = statusEl ? statusEl.textContent : "";

    const setStatus = (text, state) => {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.dataset.state = state || "";
    };

    mailForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (mailForm.querySelector('[name="botcheck"]').checked) return;

      const data = new FormData(mailForm);
      const name = String(data.get("name") || "").trim();
      const from = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();
      const key = keyInput ? String(keyInput.value || "").trim() : "";

      if (!key) {
        const subject = encodeURIComponent("Portfolio enquiry from " + name);
        const body = encodeURIComponent(message + "\n\n— " + name + " (" + from + ")");
        window.location.href = "mailto:" + address + "?subject=" + subject + "&body=" + body;
        setStatus("Opening your mail app — or write to " + address + ".", "note");
        return;
      }

      submitBtn.disabled = true;
      mailForm.setAttribute("aria-busy", "true");
      if (submitLabel) submitLabel.textContent = "Sending…";
      setStatus("Sending…", "pending");

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: key,
            name: name,
            email: from,
            message: message,
            subject: "Portfolio enquiry from " + name,
            from_name: "arun dinesh jana — portfolio",
            replyto: from
          })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message || "Send failed");

        mailForm.reset();
        if (keyInput) keyInput.value = key;
        setStatus("Sent — it's in my inbox. I'll reply to " + from + ".", "ok");
        if (submitLabel) submitLabel.textContent = "Sent";
        window.setTimeout(() => {
          if (submitLabel) submitLabel.textContent = "Send message";
        }, 3200);
      } catch (error) {
        setStatus("That didn't send. Email me directly at " + address + ".", "error");
        if (submitLabel) submitLabel.textContent = "Try again";
      } finally {
        submitBtn.disabled = false;
        mailForm.removeAttribute("aria-busy");
      }
    });

    mailForm.addEventListener("input", () => {
      if (statusEl && statusEl.dataset.state && statusEl.dataset.state !== "ok") {
        setStatus(defaultNote, "");
      }
    });
  }

  /* ----------------------------------------------------------------------
     Project cards — a glow that follows the pointer
     ---------------------------------------------------------------------- */
  document.querySelectorAll(".mini:not(.mini--static)").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (!finePointer) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((event.clientX - rect.left) / rect.width) * 100 + "%");
      card.style.setProperty("--my", ((event.clientY - rect.top) / rect.height) * 100 + "%");
    });
  });

  /* ----------------------------------------------------------------------
     Toolkit deck — a fanned hand of tool cards that keeps shuffling, and
     deals in the cards for whichever category you hover or click
     ---------------------------------------------------------------------- */
  const stack = document.querySelector("[data-stack]");
  if (stack) {
    const NS = "http://www.w3.org/2000/svg";
    const deck = stack.querySelector("[data-stack-deck]");
    const stage = stack.querySelector(".stack__stage");
    const items = Array.from(stack.querySelectorAll(".stack__item"));
    const elIndex = stack.querySelector("[data-stack-index]");
    const elName = stack.querySelector("[data-stack-name]");
    const elCount = stack.querySelector("[data-stack-count]");
    const elGhost = stack.querySelector("[data-stack-ghost]");
    const totalLabel = elIndex.parentElement.querySelector("i");

    // A card needs a name as well as a logo slug: the slugs live in data-logos
    // and the names sit beside them in .stack__tools, in the same order.
    const cats = items.map((item) => ({
      name: item.querySelector(".stack__name").textContent.trim(),
      slugs: (item.dataset.logos || "").trim().split(/\s+/).filter(Boolean),
      tools: item
        .querySelector(".stack__tools")
        .textContent.split("·")
        .map((part) => part.trim())
        .filter(Boolean)
    }));

    let active = 0;
    let cards = [];
    let rot = 0; // how far the hand has been shuffled
    let dealTimer = 0;
    let autoPaused = false;
    let deckHovered = false;
    let inView = false;

    if (totalLabel) {
      totalLabel.textContent = "/ " + String(items.length).padStart(2, "0");
    }

    // Each transform is written here rather than in CSS so the fan can be
    // measured against the stage: it fits a 400px column as well as a 540px one.
    const layout = () => {
      const n = cards.length;
      if (!n || !deck) return;
      const w = (stage && stage.clientWidth) || 420;
      const cardW = Math.max(84, Math.min(152, w * 0.3));
      const mid = (n - 1) / 2;
      // fan as wide as looks right, but never wider than the stage, so a card's
      // name is not buried under its neighbour and nothing spills on a phone
      const gap = mid > 0 ? Math.min(cardW * 0.8, (w / 2 - cardW / 2 - 6) / mid) : cardW * 0.8;
      deck.style.setProperty("--card-w", cardW + "px");

      cards.forEach((card, k) => {
        const slot = ((((rot + k) % n) + n) % n);
        const off = slot - mid;
        const x = off * gap;
        const y = Math.abs(off) * (cardW * 0.1) - cardW * 0.04;
        card.style.zIndex = String(Math.round(n - Math.abs(off)));
        card.style.transform =
          "translate(-50%, -50%) translate(" +
          x.toFixed(1) +
          "px," +
          y.toFixed(1) +
          "px) rotate(" +
          (off * 7).toFixed(2) +
          "deg)";
      });
    };

    const makeCard = (cat, k) => {
      const card = document.createElement("div");
      card.className = "stack__card";
      card.style.setProperty("--i", String(k));

      const face = document.createElement("div");
      face.className = "stack__card-face";

      const top = document.createElement("span");
      top.className = "stack__card-top";
      const num = document.createElement("b");
      num.textContent = String(k + 1).padStart(2, "0");
      const tick = document.createElement("i");
      tick.setAttribute("aria-hidden", "true");
      top.append(num, tick);

      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("class", "stack__card-logo");
      svg.setAttribute("aria-hidden", "true");
      const use = document.createElementNS(NS, "use");
      use.setAttribute("href", "#lg-" + cat.slugs[k]);
      svg.appendChild(use);

      const name = document.createElement("span");
      name.className = "stack__card-name";
      name.textContent = cat.tools[k] || cat.slugs[k];

      face.append(top, svg, name);
      card.appendChild(face);
      return card;
    };

    const dealInto = (i) => {
      const cat = cats[i];
      cards = cat.slugs.map((slug, k) => makeCard(cat, k));
      deck.replaceChildren(...cards);
      layout();
    };

    // Every tool as a small tile, running on a belt under the hand. The track
    // holds two identical passes, so the marquee loops without a seam.
    const belt = stack.querySelector("[data-stack-belt]");
    let chips = [];

    if (belt) {
      const makeChip = (cat, ci, k) => {
        const chip = document.createElement("div");
        chip.className = "stack__chip-card";
        chip.dataset.cat = String(ci);

        const num = document.createElement("b");
        num.textContent = String(k + 1).padStart(2, "0");

        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("class", "stack__chip-logo");
        const use = document.createElementNS(NS, "use");
        use.setAttribute("href", "#lg-" + cat.slugs[k]);
        svg.appendChild(use);

        const label = document.createElement("span");
        label.textContent = cat.tools[k] || cat.slugs[k];

        chip.append(num, svg, label);
        return chip;
      };

      const pass = [];
      cats.forEach((cat, ci) => {
        cat.slugs.forEach((slug, k) => pass.push(makeChip(cat, ci, k)));
      });

      chips = [...pass, ...pass.map((chip) => chip.cloneNode(true))];
      chips.forEach((chip) => belt.appendChild(chip));
      belt.classList.add("is-ready");
    }

    const paintBelt = (i) => {
      chips.forEach((chip) => chip.classList.toggle("is-on", Number(chip.dataset.cat) === i));
    };

    // The old hand steps down and out before the new one is dealt in.
    const deal = (i) => {
      window.clearTimeout(dealTimer);
      const leaving = cards.filter((card) => !card.dataset.leaving);
      if (leaving.length && !prefersReduced) {
        leaving.forEach((card) => {
          card.dataset.leaving = "1";
          card.style.opacity = "0";
          card.style.transform += " translateY(30px) scale(0.94)";
        });
        dealTimer = window.setTimeout(() => {
          dealInto(i);
          dealTimer = 0;
        }, 320);
      } else {
        dealInto(i);
      }
    };

    const setActive = (i, firstRun) => {
      active = i;
      items.forEach((item, k) => item.classList.toggle("is-active", k === i));
      elIndex.textContent = String(i + 1).padStart(2, "0");
      if (elGhost) elGhost.textContent = String(i + 1).padStart(2, "0");
      elName.textContent = cats[i].name;
      elCount.textContent = String(cats[i].slugs.length).padStart(2, "0");
      paintBelt(i);
      if (firstRun) dealInto(i);
      else deal(i);
    };

    // The hand cuts itself: a slot rotates forward, occasionally one runs back.
    const shuffle = () => {
      if (prefersReduced || deckHovered || cards.length < 2) return;
      rot += Math.random() > 0.75 ? -1 : 1;
      deck.classList.add("is-shuffling");
      layout();
      window.setTimeout(() => deck.classList.remove("is-shuffling"), 520);
    };

    setActive(0, true);

    if (!prefersReduced) {
      window.setInterval(() => {
        if (!autoPaused && inView) setActive((active + 1) % items.length);
      }, 5600);
      window.setInterval(() => {
        if (inView) shuffle();
      }, 2600);
    }

    items.forEach((item, i) => {
      const btn = item.querySelector("button");
      item.addEventListener("pointerenter", () => {
        if (finePointer) setActive(i);
      });
      btn.addEventListener("focus", () => setActive(i));
      btn.addEventListener("click", () => setActive(i));
    });

    stack.addEventListener("pointerenter", () => { autoPaused = true; });
    stack.addEventListener("pointerleave", () => { autoPaused = false; });
    stack.addEventListener("focusin", () => { autoPaused = true; });
    stack.addEventListener("focusout", () => { autoPaused = false; });

    // Resting on a card holds the shuffle so it can be read.
    if (stage) {
      stage.addEventListener("pointerenter", () => { deckHovered = true; });
      stage.addEventListener("pointerleave", () => { deckHovered = false; });
    }

    if (stage && "ResizeObserver" in window) {
      new ResizeObserver(() => layout()).observe(stage);
    } else {
      window.addEventListener("resize", layout);
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          inView = entries[0] ? entries[0].isIntersecting : false;
        },
        { threshold: 0.2 }
      );
      observer.observe(stack);
    } else {
      inView = true;
    }
  }

  /* ----------------------------------------------------------------------
     Experience cards
     Hover previews a role, the button pins it open so it survives the
     pointer leaving. One card is open at a time, and Escape closes it.
     ---------------------------------------------------------------------- */
  const xpCards = Array.from(document.querySelectorAll("[data-xp]"));

  if (xpCards.length) {
    const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    let pinned = null;
    // Set after an explicit close so the pointer still resting on the card
    // does not immediately preview it again. Cleared when the pointer leaves.
    let suppressed = null;

    // "Close" only when the card is pinned. A hover preview still reads
    // "Details" — clicking then pins it, which is what the button promises.
    const setOpen = (card, open) => {
      card.classList.toggle("is-open", open);
      const toggle = card.querySelector(".xp-card__toggle");
      const label = card.querySelector("[data-xp-label]");
      if (toggle) toggle.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = card === pinned ? "Close" : "Details";
    };

    xpCards.forEach((card) => {
      const toggle = card.querySelector(".xp-card__toggle");
      if (!toggle) return;

      // pointermove rather than pointerenter: browsers re-run hover hit-testing
      // when the page scrolls, and a card that expands under a resting cursor
      // would shift the content mid-scroll. A real movement is the signal.
      card.addEventListener("pointermove", (event) => {
        if (!hoverMedia.matches) return;
        if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        if (pinned && pinned !== card) return;
        if (suppressed === card) return;
        if (card.classList.contains("is-open")) return;
        setOpen(card, true);
      });

      card.addEventListener("pointerleave", () => {
        if (suppressed === card) suppressed = null;
        if (!hoverMedia.matches) return;
        if (card === pinned) return;
        setOpen(card, false);
      });

      toggle.addEventListener("click", () => {
        if (pinned === card) {
          pinned = null;
          suppressed = card;
          setOpen(card, false);
          return;
        }
        if (pinned) setOpen(pinned, false);
        pinned = card;
        suppressed = null;
        setOpen(card, true);
      });

      card.addEventListener("focusin", () => {
        if (pinned && pinned !== card) return;
        setOpen(card, true);
      });

      card.addEventListener("focusout", (event) => {
        if (card === pinned) return;
        if (card.contains(event.relatedTarget)) return;
        setOpen(card, false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !pinned) return;
      const card = pinned;
      pinned = null;
      // Move focus first: the focusin handler would otherwise reopen the card.
      const toggle = card.querySelector(".xp-card__toggle");
      if (toggle && document.activeElement !== toggle) toggle.focus();
      suppressed = card;
      setOpen(card, false);
    });
  }

  /* ----------------------------------------------------------------------
     Pause the small looping visuals when they are off screen
     ---------------------------------------------------------------------- */
  document.querySelectorAll(".mini__visual--filters, .mini__visual--radar").forEach((visual) => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        visual.classList.toggle("is-paused", !(entries[0] && entries[0].isIntersecting));
      },
      { threshold: 0 }
    );
    observer.observe(visual);
  });
})();
