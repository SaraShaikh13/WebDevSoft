import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const LogoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="9" fill="url(#flg)"/>
    <path d="M8 12l5 4-5 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 20h9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
    <defs>
      <linearGradient id="flg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6c63ff"/><stop offset="1" stopColor="#00d4a0"/>
      </linearGradient>
    </defs>
  </svg>
);

const socials = [
  { label: 'Gh', title: 'GitHub' },
  { label: 'Tw', title: 'Twitter' },
  { label: 'Li', title: 'LinkedIn' },
  { label: 'Yt', title: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand-logo">
              <LogoIcon />
              <span>WebDevSoft</span>
            </div>
            <p>Your gateway to modern web development. Learn by building real-world projects with expert-crafted courses and tutorials.</p>
            <div className="social-links">
              {socials.map(s => (
                <a key={s.label} href="#!" className="social-link" title={s.title}>{s.label}</a>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Learn</h4>
            <ul>
              <li><Link to="/courses">All Courses</Link></li>
              <li><Link to="/tutorials">Tutorials</Link></li>
              <li><Link to="/blogs">Blog</Link></li>
              <li><Link to="/courses?level=Beginner">Beginner Path</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Topics</h4>
            <ul>
              {['JavaScript', 'React.js', 'Node.js', 'MongoDB', 'CSS & Design'].map(t => (
                <li key={t}><a href={`/courses?search=${t}`}>{t}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#!">About Us</a></li>
              <li><a href="#!">Contact</a></li>
              <li><a href="#!">Privacy Policy</a></li>
              <li><a href="#!">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} WebDevSoft. Built with care for developers.</p>
          <p className="footer-stack">React · Node.js · MongoDB · Express</p>
        </div>
      </div>
    </footer>
  );
}
