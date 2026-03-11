"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Description } from "@radix-ui/react-toast"
import judgesData from './judges-data.json';

export default function FounderPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 17, hours: 22, minutes: 45, seconds: 13 })
  const [email, setEmail] = useState("")
  const [selectedJudge, setSelectedJudge] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const judges = judgesData.judges;
  
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header - Full Width */}
      <header className="w-full px-6 lg:px-16 py-5 flex items-center justify-between border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">ikonetU</h1>
        <button className="p-2" aria-label="Menu">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Hero Section - Full Width */}
      <section className="w-full px-6 lg:px-16 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="relative">
              {/* Africa Map SVG */}
              <div className="absolute -left-[200px] -top-[150px] w-[600px] h-[600px] pointer-events-none z-0">
                <img 
                  src="/map.svg" 
                  alt="" 
                  className="w-full h-full object-contain opacity-50"
                  style={{ filter: 'invert(36%) sepia(85%) saturate(4636%) hue-rotate(259deg) brightness(96%) contrast(91%)' }}
                  aria-hidden="true"
                />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-3 py-1.5 mb-5 relative z-10">
                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-purple-700">Founder Slots Are Limited</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight text-gray-900 relative z-10">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">60-Second Pitch</span> Could Change Your Life
              </h1>
              
              <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed relative z-10">
                Join <span className="font-semibold text-gray-900">10,000+</span> African student entrepreneurs competing for{" "}
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-white font-bold text-xs shadow-md">£2K</span>{" "}
                in prizes + Free company incorporation.
              </p>

              <div className="flex gap-2 mb-3 max-w-md relative z-10">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-gray-50 border-gray-200 rounded-md px-3 py-2 text-sm"
                />
                <Button 
                  type="button"
                  onClick={() => window.open('https://forms.gle/sHve5VZvWejeHr989', '_blank')}
                  className="bg-[#1a1a2e] hover:bg-[#0f0f1e] text-white px-5 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  Join the Waitlist
                </Button>
              </div>
            </div>

            {/* Right Column - Hero Image (PHOTO ONLY, NO VIDEO OVERLAY) */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/hero-img.png" 
                  alt="African entrepreneurs" 
                  className="w-full h-auto object-cover"
                />
              </div>
              
              {/* Decorative purple flower/star on the right */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 opacity-80 pointer-events-none">
                <svg viewBox="0 0 100 100" className="text-purple-500">
                  <path fill="currentColor" d="M50,10 L55,35 L75,25 L60,45 L85,50 L60,55 L75,75 L55,65 L50,90 L45,65 L25,75 L40,55 L15,50 L40,45 L25,25 L45,35 Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Beautiful Gradient Cards - Full Width */}
      <section className="w-full px-6 lg:px-16 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Headline with decorative elements */}
          <div className="text-center mb-10 relative">
            <div className="absolute top-0 right-1/4 w-7 h-7 text-yellow-400 opacity-60">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 9.5L16 14.5L18.5 22L12 17L5.5 22L8 14.5L2 9.5L9.5 9.5L12 2Z" />
              </svg>
            </div>
            
            <p className="text-lg sm:text-xl font-semibold text-gray-800 max-w-2xl mx-auto leading-tight">
              Investors ignore <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 font-bold">99%</span> of pitch decks.<br />
              We're changing that.
            </p>
          </div>

          {/* Beautiful Gradient Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-4">
            {/* Card 1 - 6 weeks with REAL gradient */}
            <div className="relative rounded-xl overflow-hidden shadow-lg h-48">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-700 to-purple-600" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-6">
                <div className="text-3xl font-bold mb-2">6 weeks</div>
                <p className="text-purple-200 text-sm text-center">Average Investor Response Time</p>
              </div>
            </div>

            {/* Card 2 - 60 sec with REAL gradient */}
            <div className="relative rounded-xl overflow-hidden shadow-lg h-48">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-purple-600 to-purple-500" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-6">
                <div className="text-3xl font-bold mb-2">60 sec</div>
                <p className="text-purple-200 text-sm text-center">Connect with Investors Instantly</p>
              </div>
            </div>
          </div>

          {/* Card 3 - Full Width with REAL gradient */}
          <div className="relative rounded-xl overflow-hidden shadow-lg h-32 max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-700 to-purple-600" />
            <div className="relative z-10 h-full flex items-center justify-center text-white p-6">
              <div className="text-xl font-bold">We're changing the game</div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section - Full Width */}
      <section className="w-full px-6 lg:px-16 py-12 bg-gradient-to-b from-white via-purple-50/20 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-2">
            <div className="w-7 h-7 text-yellow-400 opacity-70">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 9.5L16 14.5L18.5 22L12 17L5.5 22L8 14.5L2 9.5L9.5 9.5L12 2Z" />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-900">
            See How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Works</span>
          </h2>

          {/* Video Container with Gradient */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6" style={{ aspectRatio: "16/9" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-200 to-purple-300 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-sm shadow-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => window.open('https://forms.gle/sHve5VZvWejeHr989', '_blank')}
              className="bg-[#1a1a2e] hover:bg-[#0f0f1e] text-white px-6 py-2.5 rounded-full text-sm font-medium"
            >
              Join the Waitlist
            </Button>
          </div>
        </div>
      </section>

      {/* Prizes Section - Full Width */}
      <section className="w-full px-6 lg:px-16 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-1">
              <span className="text-gray-900">Win Big,</span>
              <br />
              <span className="text-gray-900">Build </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">Bigger!</span>
            </h2>
          </div>

          {/* All 9 Prizes - Uniform Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {/* Prize 1 */}
            <div className="text-center group">
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src="/price-award.png" alt="Grand Prize" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Grand Prize Cash Award</h3>
            </div>

            {/* Prize 2 */}
            <div className="text-center group">
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src="/building-illustration.png" alt="US Company" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">US Company Incorporation</h3>
            </div>

            {/* Prize 3 */}
            <div className="text-center group">
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src="/plane.png" alt="MVP Support" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">MVP Development Support</h3>
            </div>

            {/* Prize 4 */}
            <div className="text-center group">
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src="/prizes/africa-map.webp" alt="African Company" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">African Country Incorporation</h3>
            </div>

            {/* Prize 5 */}
            <div className="text-center group">
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src="/prizes/ip-support.png" alt="IP Support" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">IP & Commercialization Support</h3>
            </div>

            {/* Prize 6 */}
            <div className="text-center group">
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src="/prizes/tech-devices.png" alt="Tech Devices" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Tech Devices & Data</h3>
            </div>

            {/* Prize 7 */}
            <div className="text-center group">
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src="/prizes/investors.png" alt="Investors Access" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Access to Investors</h3>
            </div>

            {/* Prize 8 */}
            <div className="text-center group">
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src="/prizes/mentorship.png" alt="Mentorship" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Industry Mentorship</h3>
            </div>

            {/* Prize 9 */}
            <div className="text-center group">
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src="/prizes/training.jpg" alt="Training" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Training & Internship</h3>
            </div>
          </div>
        </div>
      </section>

**File structure needed:**
```
/public/prizes/
  - africa-map.png
  - ip-support.png
  - tech-devices.png
  - investors.png
  - mentorship.png
  - training.png

      {/* Countdown Section - Full Width */}
      <section className="w-full px-6 lg:px-16 py-14 bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">Competition Begins In:</h2>
          
          <div className="grid grid-cols-4 gap-3 sm:gap-5 mb-6">
            {[
              { label: "DAYS", value: timeLeft.days },
              { label: "HOURS", value: timeLeft.hours },
              { label: "MINUTES", value: timeLeft.minutes },
              { label: "SECONDS", value: timeLeft.seconds },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="bg-white rounded-lg w-full aspect-square flex items-center justify-center mb-2 shadow-xl">
                  <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-purple-900">
                    {String(item.value).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-purple-300 text-[10px] sm:text-xs font-medium uppercase tracking-wide">{item.label}</p>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => window.open('https://forms.gle/sHve5VZvWejeHr989', '_blank')}
            className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2.5 rounded-full text-sm font-medium"
          >
            Join the Waitlist
          </Button>
        </div>
      </section>

      {/* Partners Section - Full Width */}
      <section className="w-full px-6 lg:px-16 py-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-gray-900">
            Backed by <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Industry Leaders</span>
          </h2>
          <p className="text-center text-gray-600 text-sm mb-10">
            Partnering with Leading UK and African Tech Companies.
          </p>

          {/* First Row - 4 Partners with Images */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/seedlegals.png" 
                alt="SeedLegals" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/tide.png" 
                alt="Tide" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/grapevine.png" 
                alt="Grapevine" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-32 bg-black rounded-lg px-4">
              <img 
                src="/partners/stones.png" 
                alt="Stones" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Second Row - 4 Partners */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center justify-center h-32">
              <span className="text-gray-900 font-semibold text-base text-center">The Abeke Brand</span>
            </div>
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/funnel.png" 
                alt="Funnel Upscale" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/vastav.png" 
                alt="Vastav Intellect" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/russell-bedford.png" 
                alt="Russell Bedford" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/brothers-clique.png" 
                alt="Brothers Clique"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/rlm.png" 
                alt="Red Lantan Media"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/signaturepuffs.png" 
                alt="Signaturepuffs"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/transform-x.png" 
                alt="Transform-X"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Fourth Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/spc.png" 
                alt="Six Pillars Consulting"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/vef.png" 
                alt="Victorian Empowerment Foundation"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/eia.png" 
                alt="Executives In Africa"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/divasity.png" 
                alt="Divasity"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Fifth Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center justify-center h-32">
              <img 
                src="/partners/whizqueen.png" 
                alt="Whiz Queen"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
        </div>
      </section>

      {/* Judges Section - Full Width */}
      <section className="w-full px-6 lg:px-16 py-12 bg-gradient-to-b from-white via-purple-50/20 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 relative">
            <div className="absolute top-0 right-1/3 w-7 h-7 text-yellow-400 opacity-60">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 9.5L16 14.5L18.5 22L12 17L5.5 22L8 14.5L2 9.5L9.5 9.5L12 2Z" />
              </svg>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Meet Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Judges</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {judges.map((judge, idx) => (
              <div key={idx} className="group flex flex-col">
                <div className="relative mb-3 rounded-xl overflow-hidden aspect-square shadow-md group-hover:shadow-lg transition-shadow">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />
                  <img 
                    src={judge.photo} 
                    alt={judge.name}
                    className="relative z-10 w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-bold text-sm text-gray-900 mb-0.5">{judge.name}</h3>
                <p className="text-xs text-purple-600 font-medium mb-1">{judge.title}</p>
                <div className="relative">
                  <p 
                    ref={(el) => {
                      if (el) {
                        const isTruncated = el.scrollHeight > el.clientHeight;
                        const button = el.nextElementSibling;
                        if (button && button.tagName === 'BUTTON') {
                          button.style.display = isTruncated ? 'block' : 'none';
                        }
                      }
                    }}
                    className="text-xs text-gray-600 leading-snug line-clamp-3 mb-2"
                  >
                    {judge.description}
                  </p>
                  <button 
                    onClick={() => setSelectedJudge(judge)}
                    className="text-xs text-purple-600 font-medium hover:text-purple-700 text-left hidden"
                  >
                    Read more →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal for full description */}
          {selectedJudge && (
            <div 
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedJudge(null)}
            >
              <div 
                className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-bold text-xl text-gray-900 mb-1">{selectedJudge.name}</h3>
                <p className="text-sm text-purple-600 font-medium mb-4">{selectedJudge.title}</p>
                <div className="overflow-y-auto pr-1 mb-4 flex-1">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedJudge.description}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedJudge(null)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA - Full Width */}
      <section className="w-full px-6 lg:px-16 py-16 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-400 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Your Spot</span> Today!
          </h2>
          
          <p className="text-lg text-purple-100 mb-6">
            Join <span className="font-bold text-white">8,648</span> students on the waitlist
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/95 border-0 rounded-full px-5 py-3 text-sm text-gray-900 placeholder:text-gray-500 w-full sm:w-auto"
            />
            <Button 
              type="button"
              onClick={() => window.open('https://forms.gle/sHve5VZvWejeHr989', '_blank')}
              className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-full text-sm font-medium w-full sm:w-auto"
            >
              Join the Waitlist
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
