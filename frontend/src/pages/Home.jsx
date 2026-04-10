import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import './Home.css';

const stats = [
  { val: '150+', label: 'Courses' },
  { val: '12K+', label: 'Students' },
  { val: '50+', label: 'Tutors' },
  { val: '98%', label: 'Satisfaction' },
];

const features = [
  { icon: '◈', title: 'Project-Based Learning', desc: 'Build real-world apps from scratch with hands-on projects that go straight to your portfolio.' },
  { icon: '◎', title: 'Expert Instructors', desc: 'Learn from industry professionals with years of real-world experience in top tech companies.' },
  { icon: '◷', title: 'Learn at Your Pace', desc: 'Access all content anytime, anywhere, on any device. No deadlines, no pressure.' },
  { icon: '◉', title: 'Certificates', desc: 'Earn shareable certificates upon course completion to boost your resume.' },
  { icon: '◬', title: 'Community Support', desc: 'Join thousands of learners in our active community forums and live sessions.' },
  { icon: '◌', title: 'Always Updated', desc: 'Content stays current with the latest tech trends, frameworks and best practices.' },
];

const topics = [
  { icon: '▲', name: 'JavaScript', count: '24 courses', color: '#f7df1e' },
  { icon: '◈', name: 'React.js', count: '18 courses', color: '#61dafb' },
  { icon: '●', name: 'Node.js', count: '15 courses', color: '#68a063' },
  { icon: '◆', name: 'MongoDB', count: '10 courses', color: '#4db33d' },
  { icon: '◐', name: 'CSS & Design', count: '12 courses', color: '#a78bfa' },
  { icon: '◑', name: 'Python', count: '20 courses', color: '#3b82f6' },
];

// Animated SVG hero illustration
const HeroIllustration = () => (
  <div className="hero-illustration">
    <svg viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-svg">
      {/* Monitor */}
      <rect x="60" y="40" width="400" height="260" rx="16" fill="#16161f" stroke="#2a2a3a" strokeWidth="2"/>
      <rect x="60" y="40" width="400" height="36" rx="16" fill="#1c1c28"/>
      <rect x="60" y="60" width="400" height="16" fill="#1c1c28"/>
      {/* Traffic lights */}
      <circle cx="88" cy="58" r="6" fill="#ff5f57"/>
      <circle cx="108" cy="58" r="6" fill="#febc2e"/>
      <circle cx="128" cy="58" r="6" fill="#28c840"/>
      {/* Code lines */}
      <rect x="90" y="100" width="60" height="10" rx="5" fill="#6c63ff" opacity="0.9"/>
      <rect x="160" y="100" width="100" height="10" rx="5" fill="#2a2a3a"/>
      <rect x="110" y="122" width="40" height="10" rx="5" fill="#00d4a0" opacity="0.9"/>
      <rect x="160" y="122" width="80" height="10" rx="5" fill="#2a2a3a"/>
      <rect x="110" y="144" width="55" height="10" rx="5" fill="#a78bfa" opacity="0.9"/>
      <rect x="175" y="144" width="120" height="10" rx="5" fill="#2a2a3a"/>
      <rect x="90" y="166" width="70" height="10" rx="5" fill="#6c63ff" opacity="0.7"/>
      <rect x="110" y="188" width="45" height="10" rx="5" fill="#00d4a0" opacity="0.7"/>
      <rect x="165" y="188" width="90" height="10" rx="5" fill="#2a2a3a"/>
      <rect x="110" y="210" width="30" height="10" rx="5" fill="#f59e0b" opacity="0.9"/>
      <rect x="150" y="210" width="110" height="10" rx="5" fill="#2a2a3a"/>
      <rect x="90" y="232" width="60" height="10" rx="5" fill="#6c63ff" opacity="0.9"/>
      {/* Cursor blink */}
      <rect x="160" y="232" width="3" height="12" rx="1" fill="#00d4a0" className="cursor-blink"/>
      {/* Stand */}
      <rect x="210" y="300" width="100" height="14" rx="7" fill="#1c1c28" stroke="#2a2a3a" strokeWidth="2"/>
      <rect x="245" y="300" width="30" height="30" rx="4" fill="#1c1c28" stroke="#2a2a3a" strokeWidth="2"/>
      {/* Floating cards */}
      <g className="float-card-1">
        <rect x="370" y="180" width="130" height="70" rx="12" fill="#1c1c28" stroke="#6c63ff" strokeWidth="1.5"/>
        <circle cx="390" cy="205" r="12" fill="#6c63ff" opacity="0.2"/>
        <text x="390" y="210" textAnchor="middle" fill="#6c63ff" fontSize="12" fontWeight="bold">JS</text>
        <rect x="408" y="198" width="70" height="8" rx="4" fill="#2a2a3a"/>
        <rect x="408" y="212" width="50" height="8" rx="4" fill="#2a2a3a"/>
        <rect x="378" y="230" width="40" height="8" rx="4" fill="#00d4a0" opacity="0.6"/>
        <rect x="424" y="230" width="30" height="8" rx="4" fill="#2a2a3a"/>
      </g>
      <g className="float-card-2">
        <rect x="10" y="200" width="120" height="65" rx="12" fill="#1c1c28" stroke="#00d4a0" strokeWidth="1.5"/>
        <circle cx="30" cy="223" r="10" fill="#00d4a0" opacity="0.2"/>
        <text x="30" y="228" textAnchor="middle" fill="#00d4a0" fontSize="10" fontWeight="bold">✓</text>
        <rect x="46" y="217" width="65" height="8" rx="4" fill="#2a2a3a"/>
        <rect x="46" y="231" width="45" height="8" rx="4" fill="#2a2a3a"/>
        <rect x="18" y="248" width="90" height="7" rx="3" fill="#6c63ff" opacity="0.4"/>
      </g>
      <g className="float-card-3">
        <rect x="380" y="60" width="110" height="55" rx="12" fill="#1c1c28" stroke="#a78bfa" strokeWidth="1.5"/>
        <rect x="396" y="76" width="78" height="8" rx="4" fill="#a78bfa" opacity="0.6"/>
        <rect x="396" y="90" width="55" height="8" rx="4" fill="#2a2a3a"/>
        <rect x="396" y="100" width="66" height="8" rx="4" fill="#2a2a3a"/>
      </g>
      {/* Decorative dots */}
      <circle cx="470" cy="340" r="4" fill="#6c63ff" opacity="0.5"/>
      <circle cx="490" cy="320" r="6" fill="#00d4a0" opacity="0.4"/>
      <circle cx="30" cy="360" r="5" fill="#a78bfa" opacity="0.5"/>
      <circle cx="50" cy="340" r="3" fill="#6c63ff" opacity="0.4"/>
    </svg>
  </div>
);

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/featured')
      .then(r => setFeatured(r.data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <div className="hero-two-col">
            <div className="hero-left">
              <div className="hero-badge">
                <span className="badge badge-accent">◈ New Courses Every Week</span>
              </div>
              <h1 className="hero-title">
                Master Modern<br />
                <span className="hero-gradient">Web Development</span>
              </h1>
              <p className="hero-sub">
                From beginner to professional — learn HTML, CSS, JavaScript, React, Node.js, and more with structured courses, hands-on tutorials, and a thriving community.
              </p>
              <div className="hero-actions">
                <Link to="/courses" className="btn btn-primary btn-lg">Explore Courses</Link>
                <Link to="/tutorials" className="btn btn-outline btn-lg">Free Tutorials</Link>
              </div>
              <div className="hero-stats">
                {stats.map(s => (
                  <div key={s.label} className="hero-stat">
                    <div className="stat-val">{s.val}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-right">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="section section-sm">
        <div className="container">
          <h2 className="section-title">Browse by Topic</h2>
          <p className="section-sub">Find exactly what you want to learn</p>
          <div className="topics-grid">
            {topics.map(t => (
              <Link to={`/courses?search=${t.name}`} key={t.name} className="topic-card">
                <span className="topic-icon" style={{ background: t.color + '18', color: t.color }}>{t.icon}</span>
                <div>
                  <div className="topic-name">{t.name}</div>
                  <div className="topic-count">{t.count}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Courses</h2>
              <p className="section-sub">Most popular courses loved by our students</p>
            </div>
            <Link to="/courses" className="btn btn-outline">View All →</Link>
          </div>
          {loading ? (
            <div className="home-loading"><div className="spinner" /></div>
          ) : featured.length > 0 ? (
            <div className="grid-3">
              {featured.map(c => <CourseCard key={c._id} course={c} />)}
            </div>
          ) : (
            <div className="placeholder-courses">
              {[1,2,3].map(i => <div key={i} className="placeholder-card"><div className="ph-thumb"/><div className="ph-body"><div className="ph-line"/><div className="ph-line short"/><div className="ph-line"/></div></div>)}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Why Choose WebDevSoft?</h2>
          <p className="section-sub" style={{ textAlign: 'center' }}>Everything you need to become a professional developer</p>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <div className="cta-orb" />
            <h2>Ready to Start Your Journey?</h2>
            <p>Join 12,000+ students already learning on WebDevSoft. Create your free account today.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Start Learning Free</Link>
              <Link to="/courses" className="btn btn-outline btn-lg">Browse Courses</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
