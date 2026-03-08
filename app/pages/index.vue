<template>
  <div class="landing-page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar__container">
        <div class="navbar__logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">AutoDM</span>
        </div>
        <div class="navbar__actions">
          <NuxtLink to="/login" class="nav-link">Log in</NuxtLink>
          <NuxtLink to="/dashboard" class="btn btn-primary">Go to Dashboard</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="hero">
      <div class="hero__content animate-fade-in-up">
        <div class="hero__badge">
          <span class="pulse-dot"></span>
          Now supporting Instagram & Facebook Pages
        </div>
        <h1 class="hero__title">
          Automate your DMs.<br />
          <span class="text-gradient">Scale your growth.</span>
        </h1>
        <p class="hero__desc">
          Turn your Instagram comments, story replies, and DMs into an automated sales machine. Never miss a lead again.
        </p>
        <div class="hero__cta">
          <NuxtLink to="/dashboard" class="btn btn-primary btn-lg">
            Start Automating — It's Free
          </NuxtLink>
          <NuxtLink to="/login" class="btn btn-outline btn-lg">
            View Live Demo
          </NuxtLink>
        </div>
        <p class="hero__micro">No credit card required. Setup in 2 minutes.</p>
      </div>

      <!-- Hero visual representation -->
      <div class="hero__visual animate-fade-in-up delay-1">
        <div class="visual-card">
          <div class="visual-chat">
            <div class="visual-msg them">How much is the course? 💰</div>
            <div class="visual-msg me">
              <span class="typing-dots">
                <span></span><span></span><span></span>
              </span>
            </div>
            <div class="visual-msg me sent">
              Hey! The course is $49. You can get it right here: linkin.bio/course ✨
            </div>
          </div>
          <div class="visual-badge trigger-badge">
            <span class="icon">⚡</span> Keyword Triggered: "price"
          </div>
        </div>
      </div>
    </header>

    <!-- Features Section -->
    <section class="features">
      <div class="features__header text-center">
        <h2>Everything you need to run on autopilot</h2>
        <p>Powerful automation rules that handle repetitive tasks so you can focus on creating.</p>
      </div>
      
      <div class="features__grid">
        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <h3>Keyword Triggers</h3>
          <p>Send links, guides, and resources instantly when someone DMs you a specific keyword.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📝</div>
          <h3>Comment to DM</h3>
          <p>Ask followers to comment a word on your Reels or Posts to receive a DM automatically.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">✨</div>
          <h3>Story Replies</h3>
          <p>Acknowledge every story reply or mention with a personalized automated message.</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer__content">
        <div class="footer__brand">
          <div class="logo-text">⚡ AutoDM</div>
          <p>Automated magic for forward-thinking creators.</p>
        </div>
        <div class="footer__links">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'AutoDM — Automate Your Instagram DMs' })
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 80px;
  background: rgba(10, 10, 15, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 100;
  display: flex;
  align-items: center;
}
.navbar__container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.navbar__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.logo-icon { font-size: 1.5rem; }
.logo-text {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  background: var(--grad-brand);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.navbar__actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.nav-link {
  color: var(--color-text-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color var(--transition);
}
.nav-link:hover { color: var(--color-text); }

/* Hero */
.hero {
  padding: 180px 2rem 80px;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  flex: 1;
}
@media (max-width: 968px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    padding-top: 140px;
    gap: 3rem;
  }
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-accent);
  margin-bottom: 2rem;
}
.pulse-dot {
  width: 8px; height: 8px;
  background: var(--color-success);
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.hero__title {
  font-size: 4.5rem;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
}
@media (max-width: 1024px) { .hero__title { font-size: 3.5rem; } }
@media (max-width: 640px) { .hero__title { font-size: 2.5rem; } }

.text-gradient {
  background: linear-gradient(135deg, #a855f7, #ec4899, #f43f5e);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero__desc {
  font-size: 1.25rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 2.5rem;
  max-width: 500px;
}
@media (max-width: 968px) { .hero__desc { margin: 0 auto 2.5rem; } }

.hero__cta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
@media (max-width: 968px) { .hero__cta { justify-content: center; } }
@media (max-width: 640px) { .hero__cta { flex-direction: column; } }

.btn-lg {
  padding: 0.9rem 1.8rem;
  font-size: 1.1rem;
}
.hero__micro {
  font-size: 0.85rem;
  color: var(--color-text-faint);
}

/* Visual Representation */
.hero__visual {
  position: relative;
  perspective: 1000px;
}
.visual-card {
  background: var(--color-surface);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset;
  transform: rotateY(-5deg) rotateX(5deg);
  transition: transform 0.5s ease;
}
.visual-card:hover {
  transform: rotateY(0deg) rotateX(0deg) translateY(-5px);
}

.visual-chat {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.visual-msg {
  padding: 0.8rem 1.2rem;
  border-radius: 16px;
  font-size: 0.95rem;
  max-width: 85%;
  line-height: 1.5;
}
.visual-msg.them {
  background: var(--color-surface-2);
  align-self: flex-start;
  border-bottom-left-radius: 4px;
  color: var(--color-text-muted);
}
.visual-msg.me {
  background: var(--grad-brand);
  align-self: flex-end;
  border-bottom-right-radius: 4px;
  color: white;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

.typing-dots span {
  display: inline-block;
  width: 6px; height: 6px;
  background: rgba(255,255,255,0.6);
  border-radius: 50%;
  margin-right: 4px;
  animation: typing 1.4s infinite ease-in-out both;
}
.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); background: white; }
}

.visual-badge {
  position: absolute;
  top: -15px;
  right: -20px;
  background: rgba(20, 20, 25, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(139, 92, 246, 0.4);
  padding: 0.6rem 1rem;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent);
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  animation: float 4s ease-in-out infinite;
}
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

/* Features */
.features {
  padding: 100px 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.text-center { text-align: center; }
.features__header h2 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; }
.features__header p { font-size: 1.15rem; color: var(--color-text-muted); max-width: 600px; margin: 0 auto 4rem; line-height: 1.6; }

.features__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
@media (max-width: 768px) {
  .features__grid { grid-template-columns: 1fr; }
}
.feature-card {
  background: linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2.5rem;
  border-radius: var(--radius-xl);
  transition: all var(--transition);
}
.feature-card:hover {
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-5px);
  background: linear-gradient(to bottom, rgba(139, 92, 246, 0.05), transparent);
}
.feature-icon {
  width: 50px; height: 50px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255,255,255,0.1);
}
.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}
.feature-card p {
  color: var(--color-text-muted);
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Footer */
.footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 3rem 2rem;
  margin-top: auto;
}
.footer__content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
@media (max-width: 640px) {
  .footer__content { flex-direction: column; gap: 2rem; text-align: center; }
}
.footer__brand p { font-size: 0.9rem; color: var(--color-text-faint); margin-top: 0.5rem; }
.footer__links { display: flex; gap: 2rem; }
.footer__links a { color: var(--color-text-muted); text-decoration: none; font-size: 0.9rem; transition: color var(--transition); }
.footer__links a:hover { color: var(--color-text); }

/* Animations */
.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}
.delay-1 { animation-delay: 0.2s; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
