import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="landing-page">
      <nav class="landing-nav">
        <a class="brand landing-brand" routerLink="/"><span class="brand-mark">C</span><span>Coaching<span class="brand-muted">CMS</span></span></a>
        <div class="landing-nav-links"><a href="#features">Features</a><a href="#workflow">How it works</a><a class="nav-login" routerLink="/login">Sign in <span>→</span></a></div>
      </nav>
      <section class="landing-hero">
        <div class="hero-content">
          <div class="eyebrow landing-eyebrow"><span class="pulse-dot"></span> BUILT FOR MODERN COACHING CENTERS</div>
          <h1>Run your center.<br><em>Inspire their future.</em></h1>
          <p class="landing-lead">A beautifully simple workspace for managing students, teachers, classes, attendance, results, and fees across every branch.</p>
          <div class="hero-actions"><a class="landing-button primary" routerLink="/login">Open your workspace <span>↗</span></a><a class="text-link" href="#features">Explore features <span>↓</span></a></div>
          <div class="hero-trust"><span class="trust-avatars"><i>R</i><i>S</i><i>A</i></span><span>Designed for focused teams<br><b>One place. Every possibility.</b></span></div>
        </div>
        <div class="hero-art" aria-label="Illustration of the coaching management dashboard">
          <div class="art-orb orb-a"></div><div class="art-orb orb-b"></div>
          <div class="dashboard-preview"><div class="preview-top"><span class="mini-logo">C</span><span></span><i></i><i></i><b>SA</b></div><div class="preview-body"><div class="preview-side"><strong>CoachingCMS</strong><small>▦ Overview</small><small>♙ Students</small><small>▤ Courses</small><small>◷ Attendance</small></div><div class="preview-main"><small>GOOD MORNING, SYSTEM</small><h3>Here’s your overview.</h3><div class="preview-stats"><i></i><i></i><i></i></div><div class="preview-lines"><i></i><i></i><i></i><i></i></div></div></div></div>
          <div class="floating-card float-students"><span class="float-icon">♙</span><div><b>Active students</b><strong>2,480</strong></div><span class="up">↗ 12%</span></div>
          <div class="floating-card float-branch"><span class="check">✓</span><div><b>All branches</b><small>Connected and secure</small></div></div>
          <div class="spark landing-spark-one">✦</div><div class="spark landing-spark-two">✦</div>
        </div>
      </section>
      <section class="landing-proof"><span>EVERYTHING YOUR TEAM NEEDS TO MOVE FORWARD</span><div><b>Students</b><b>Academics</b><b>Attendance</b><b>Finance</b><b>Growth</b></div></section>
      <section class="feature-section" id="features"><div class="section-intro"><p class="eyebrow">ONE CALM WORKSPACE</p><h2>Less admin.<br><em>More impact.</em></h2><p>Bring the important pieces of your coaching operation together without adding complexity.</p></div><div class="feature-grid"><article><span class="feature-icon blue-icon">♙</span><h3>People, at a glance</h3><p>Keep student and teacher profiles organized, searchable, and scoped to the right branch.</p></article><article><span class="feature-icon green-icon">▦</span><h3>Classes that flow</h3><p>Connect courses, batches, timetables, and enrollments in one clear academic workflow.</p></article><article><span class="feature-icon violet-icon">↗</span><h3>Progress you can see</h3><p>Track attendance, marks, fees, and outcomes with information your team can trust.</p></article></div></section>
      <section class="workflow-section" id="workflow"><div><p class="eyebrow">A BETTER DAILY RHYTHM</p><h2>From first class<br>to <em>final result.</em></h2></div><div class="workflow-steps"><div><span>01</span><b>Set up your branches</b><p>Keep each center focused while giving authorized leaders the full picture.</p></div><div><span>02</span><b>Manage the day</b><p>Register students, schedule classes, record attendance, and keep everyone moving.</p></div><div><span>03</span><b>Make better decisions</b><p>Use clean academic and financial information to plan what comes next.</p></div></div></section>
      <footer class="landing-footer"><a class="brand" routerLink="/"><span class="brand-mark">C</span><span>Coaching<span class="brand-muted">CMS</span></span></a><span>Built for better learning outcomes.</span><a routerLink="/login">Sign in to workspace →</a></footer>
    </main>
  `,
})
export class LandingComponent {}
