import React, { useState } from 'react'
import './App.css'
import { 
  ChevronRight, 
  Lock, 
  Bell, 
  CloudRain, 
  Volume2, 
  Video, 
  Lightbulb, 
  Mic2, 
  ArrowLeft, 
  MoreVertical,
  Home,
  LayoutGrid,
  Calendar,
  Settings,
  Power
} from 'lucide-react'

// --- Components ---

const GlassCard = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`glass card-rounded ${className}`} 
    style={{ padding: '20px' }}
  >
    {children}
  </div>
)

const PillButton = ({ children, primary, className = "", onClick }) => (
  <button 
    onClick={onClick}
    className={`pill-rounded ${primary ? 'btn-primary' : 'btn-secondary'} ${className}`}
  >
    {children}
  </button>
)

const VerticalSlider = ({ value, onChange, label }) => (
  <div className="vertical-slider-container glass card-rounded">
    <div className="slider-track">
      <div 
        className="slider-fill" 
        style={{ height: `${value}%` }}
      >
        <div className="slider-handle">
          <Lightbulb size={20} color={value > 50 ? "#000" : "#CCFF00"} />
        </div>
      </div>
    </div>
    <div className="slider-info">
      <span className="percentage">{value}%</span>
      <span className="label text-secondary">{label}</span>
    </div>
  </div>
)

// --- Screens ---

const Onboarding = ({ onStart }) => (
  <div className="screen onboarding-screen">
    <div className="bg-image-container">
      <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" alt="Smart Home" />
    </div>
    <div className="onboarding-content glass card-rounded animate-fade-in">
      <div className="pagination-dots">
        <span className="dot active"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <h2>Full Control For Your Smart Home</h2>
      <p>Connect, manage, and automate all your devices from one secure place.</p>
      <PillButton primary onClick={onStart}>
        <div className="pill-icon"><Lock size={16} /></div>
        Get Started
        <div className="pill-arrows">
          <ChevronRight size={14} />
          <ChevronRight size={14} />
          <ChevronRight size={14} />
        </div>
      </PillButton>
    </div>
  </div>
)

const Dashboard = ({ onSelectRoom }) => (
  <div className="screen dashboard-screen animate-fade-in">
    <header className="header">
      <div className="user-profile">
        <div className="avatar">
          <img src="https://i.pravatar.cc/100" alt="Avatar" />
        </div>
        <div className="greeting">
          <span className="text-secondary">Hello,</span>
          <h3>AMBATUKAM</h3>
        </div>
      </div>
      <button className="icon-btn glass pill-rounded">
        <Bell size={20} />
        <span className="notif-dot"></span>
      </button>
    </header>

    <section className="weather-section">
      <GlassCard className="weather-card">
        <div className="weather-main">
          <div className="temp-group">
            <span className="temp">28°C</span>
            <span className="condition">Partly Cloudy</span>
          </div>
          <div className="weather-icon">
             <CloudRain size={48} color="#CCFF00" />
          </div>
        </div>
        <div className="weather-footer">
          <p>Rembang, Indonesia</p>
        </div>
      </GlassCard>
    </section>

    <section className="quick-access">
      <div className="section-header">
        <h4>Quick Access</h4>
        <button className="text-link">Change</button>
      </div>
      <div className="quick-grid">
        {[
          { icon: Volume2, label: 'Speaker' },
          { icon: Video, label: 'CCTV' },
          { icon: Lightbulb, label: 'Light' },
          { icon: Mic2, label: 'Assistant' }
        ].map((item, i) => (
          <div key={i} className="quick-item">
            <div className="quick-icon-wrap glass pill-rounded">
              <item.icon size={24} color="#CCFF00" />
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>

    <section className="rooms-section">
      <GlassCard className="room-card" onClick={() => onSelectRoom('Living Room')}>
        <div className="room-bg">
          <img src="https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?q=80&w=1974&auto=format&fit=crop" alt="Living Room" />
        </div>
        <div className="room-info">
          <h4>Living Room</h4>
          <p>8 Devices active</p>
        </div>
        <div className="room-arrow btn-primary pill-rounded">
          <ChevronRight size={24} />
        </div>
      </GlassCard>
    </section>

    <nav className="bottom-nav-container">
       <div className="bottom-nav glass pill-rounded">
          <button className="nav-item active">
            <Home size={24} />
            <span>Home</span>
          </button>
          <button className="nav-item">
            <LayoutGrid size={24} />
          </button>
          <button className="nav-item">
            <Calendar size={24} />
          </button>
          <button className="nav-item">
            <Settings size={24} />
          </button>
       </div>
    </nav>
  </div>
)

const RoomControl = ({ roomName, onBack }) => {
  const [brightness, setBrightness] = useState(94);
  
  return (
    <div className="screen room-screen animate-fade-in">
      <div className="room-hero">
        <img src="https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?q=80&w=1974&auto=format&fit=crop" alt="Living Room" />
        <div className="hero-overlay"></div>
      </div>

      <header className="room-header">
        <button onClick={onBack} className="icon-btn glass pill-rounded">
          <ArrowLeft size={20} />
        </button>
        <h3>{roomName}</h3>
        <button className="icon-btn glass pill-rounded">
          <MoreVertical size={20} />
        </button>
      </header>

      <div className="room-content">
        <div className="slider-wrapper">
          <VerticalSlider 
            value={brightness} 
            label="Master Light" 
            onChange={(v) => setBrightness(v)} 
          />
        </div>

        <div className="device-sheet glass">
          <div className="sheet-handle"></div>
          <div className="sheet-header">
            <h4>Device</h4>
            <button className="text-link">Change</button>
          </div>
          <div className="device-grid">
            <GlassCard className="device-card active">
               <div className="device-main">
                  <div className="device-status">
                    <span className="percentage">94%</span>
                    <span className="device-name">Smart Light 1</span>
                    <p>Active until 06:00 am</p>
                  </div>
                  <div className="device-toggle btn-primary pill-rounded">
                    <Lightbulb size={24} />
                  </div>
                  <button className="pwr-btn glass pill-rounded">
                    <Power size={14} />
                  </button>
               </div>
            </GlassCard>

            <GlassCard className="device-card">
               <div className="device-main">
                  <div className="device-status">
                    <span className="percentage">28%</span>
                    <span className="device-name">Smart Light 2</span>
                    <p>Active until 06:00 am</p>
                  </div>
                  <div className="device-toggle btn-secondary pill-rounded">
                    <Lightbulb size={24} />
                  </div>
                  <button className="pwr-btn glass pill-rounded">
                    <Power size={14} />
                  </button>
               </div>
            </GlassCard>

            <GlassCard className="device-card info">
               <div className="info-icon">
                  <Volume2 size={24} color="#CCFF00" />
               </div>
               <div className="info-text">
                  <span className="info-val">16°C</span>
                  <p>Temperature</p>
               </div>
            </GlassCard>

            <GlassCard className="device-card info">
               <div className="info-icon">
                  <Calendar size={24} color="#CCFF00" />
               </div>
               <div className="info-text">
                  <span className="info-val">05:40</span>
                  <p>Timer</p>
               </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('onboarding');

  return (
    <div className="xnuver-app">
      {screen === 'onboarding' && <Onboarding onStart={() => setScreen('dashboard')} />}
      {screen === 'dashboard' && <Dashboard onSelectRoom={() => setScreen('room')} />}
      {screen === 'room' && <RoomControl roomName="Living Room" onBack={() => setScreen('dashboard')} />}
    </div>
  )
}

export default App
