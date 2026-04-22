"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Function to scroll to section
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 },
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <main className="main">
      {/* Header Section */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <Link href="/" className="header-logo-link">
              <h1 className="header-logo">VENTURA</h1>
            </Link>
          </div>
          <div className="header-center">
            <Link href="/" className="header-options-link">
              <h1 className="header-options">Home</h1>
            </Link>
            <button
              onClick={() => scrollToSection("for-innovators")}
              className="header-options-btn"
            >
              <h1 className="header-options">Platform</h1>
            </button>
            <button
              onClick={() => scrollToSection("meet-creators")}
              className="header-options-btn"
            >
              <h1 className="header-options">Contact</h1>
            </button>
          </div>
          <div className="header-right">
            <Link href="/login" className="btn-login">
              Log In
            </Link>
            <Link href="/signup" className="btn-signup">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="video-background">
          <video autoPlay loop muted playsInline className="background-video">
            <source src="/land-vid.mp4" type="video/mp4" />
          </video>
          <div className="video-overlay"></div>
        </div>
        <div className="hero-foreground-image">
          <img src="/hero-background.png" alt="Ventura Hero Visual" />
        </div>
        <div className="hero-content">
          <img
            src="/VENTURA.png"
            alt="VENTURA Logo"
            className="hero-center-logo"
          />
          <h1 className="hero-title-text">VISION meets CAPITAL</h1>
          <p className="hero-subtitle">
            The private bridge between world-class founders and the capital that
            moves markets.
          </p>
          <div className="hero-cta-group">
            <Link href="/signup" className="btn-cta-primary">
              Get Started
            </Link>
            <button
              onClick={() => scrollToSection("for-innovators")}
              className="btn-cta-ghost"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* FOR INNOVATORS */}
      <section id="for-innovators" className="how-it-works">
        <div className="section-inner">
          <p className="section-eyebrow reveal">For Innovators</p>
          <h2 className="section-heading reveal">
            Three steps to your next raise
          </h2>
          <div className="steps-grid">
            <div className="step-card reveal">
              <div className="step-number">01</div>
              <h3 className="step-title">Share Your Vision</h3>
              <p className="step-desc">
                Create your project profile in minutes. Share your pitch deck,
                traction, and funding needs.
              </p>
            </div>
            <div className="step-card reveal">
              <div className="step-number">02</div>
              <h3 className="step-title">Get Matched</h3>
              <p className="step-desc">
                Our intelligent matching algorithm connects you with relevant
                investors. No more cold emails.
              </p>
            </div>
            <div className="step-card reveal">
              <div className="step-number">03</div>
              <h3 className="step-title">Close the Deal</h3>
              <p className="step-desc">
                Move from introduction to term sheet with full support and bring
                your vision to life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOR INVESTORS */}
      <section className="portfolio">
        <div className="section-inner">
          <p className="section-eyebrow reveal">For Investors</p>
          <h2 className="section-heading reveal">
            Discover the next unicorn before anyone else
          </h2>
          <div className="steps-grid">
            <div className="step-card reveal">
              <div className="step-number">01</div>
              <h3 className="step-title">Discover Opportunities</h3>
              <p className="step-desc">
                Browse vetted, investment-ready projects across AI, CleanTech,
                FinTech, HealthTech, and more.
              </p>
            </div>
            <div className="step-card reveal">
              <div className="step-number">02</div>
              <h3 className="step-title">Connect Directly</h3>
              <p className="step-desc">
                Talk directly with founders, review due diligence materials, and
                negotiate terms.
              </p>
            </div>
            <div className="step-card reveal">
              <div className="step-number">03</div>
              <h3 className="step-title">Build Your Portfolio</h3>
              <p className="step-desc">
                Co-invest with trusted partners and build a diverse portfolio of
                high-potential startups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MEET THE CREATORS */}
      <section id="meet-creators" className="creators">
        <div className="creators-inner">
          <p className="section-eyebrow reveal">The Team</p>
          <h2 className="section-heading reveal">Meet the Creators</h2>
          <p className="section-subheading reveal">
            The visionary team building the future of private capital markets
          </p>

          <div className="creators-grid">
            {/* Christian Angoy - Leader & Backend */}
            <div className="creator-card reveal">
              <div className="creator-image">
                <img
                  src="/angoy.jpg"
                  alt="Christian Angoy"
                  className="creator-img"
                />
              </div>
              <div className="creator-name">Christian Angoy</div>
              <div className="creator-role">Leader & Backend Developer</div>
              <div className="creator-bio">
                Team leader. Makes sure data flows correctly and the server
                stays fast.
              </div>
              <div className="creator-social">
                <a
                  href="https://www.facebook.com/christian.angoy.2024"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Facebook"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Rommel Carmona - Frontend */}
            <div className="creator-card reveal">
              <div className="creator-image">
                <img
                  src="/carmona.jpg"
                  alt="Rommel Carmona"
                  className="creator-img"
                />
              </div>
              <div className="creator-name">Rommel Carmona</div>
              <div className="creator-role">Frontend Developer</div>
              <div className="creator-bio">
                Builds the logic that makes the platform work behind the scenes.
              </div>
              <div className="creator-social">
                <a
                  href="https://www.facebook.com/rommel.carmona.1116"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Facebook"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Sarah Mae Hinayon - Frontend */}
            <div className="creator-card reveal">
              <div className="creator-image">
                <img
                  src="/sara.png"
                  alt="Sarah Mae Hinayon"
                  className="creator-img"
                />
              </div>
              <div className="creator-name">Sarah Mae Hinayon</div>
              <div className="creator-role">Frontend Developer</div>
              <div className="creator-bio">
                Loves building clean interfaces that people actually enjoy
                using.
              </div>
              <div className="creator-social">
                <a
                  href="https://www.facebook.com/sara.hinayon/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Facebook"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Jenny Monica Lood - Backend */}
            <div className="creator-card reveal">
              <div className="creator-image">
                <img
                  src="/jenny.jpg"
                  alt="Jenny Monica Lood"
                  className="creator-img"
                />
              </div>
              <div className="creator-name">Jenny Monica Lood</div>
              <div className="creator-role">Backend Developer</div>
              <div className="creator-bio">
                Makes sure everything looks good and works smoothly on any
                device.
              </div>
              <div className="creator-social">
                <a
                  href="https://www.facebook.com/lood.jenny.monica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Facebook"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="trust">
        <div className="section-inner">
          <p className="section-eyebrow reveal">
            Backed by the world's top investors
          </p>
          <div className="trust-logos reveal">
            {[
              "Sequoia",
              "a16z",
              "Founders Fund",
              "Accel",
              "Benchmark",
              "Tiger Global",
            ].map((name) => (
              <div className="trust-logo-item" key={name}>
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="final-cta-inner reveal">
          <h2 className="final-cta-heading">Ready to build the future?</h2>
          <p className="final-cta-sub">
            Join thousands of innovators and investors already on VENTURA.
            Applications are reviewed on a rolling basis.
          </p>
          <Link href="/signup" className="btn-cta-primary btn-cta-large">
            Apply Now
          </Link>
        </div>
      </section>
    </main>
  );
}
