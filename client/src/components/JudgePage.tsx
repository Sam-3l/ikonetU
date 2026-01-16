"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/apiClient";

export default function JudgePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    linkedin: "",
    role: "",
    industry: "",
    experience: "",
    motivation: "",
    perspective: "",
    invested: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      await api.post("/api/notifications/judge-application/", formData);
      alert("Application submitted successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to submit application");
    }
  };  

  const judges = [
    {
      name: "Anthony Rose",
      title: "Founder & CEO, SeedLegals",
      description: "Pioneer in LegalTech who served the BBC and now helps 50,000+ startups complete funding rounds.",
      photo: "/judges/anthony-rose.jpg"
    },
    {
      name: "Venkatesh Bharti",
      title: "Founder, Virtu-invest & Solutions",
      description: "Award-winning scientist with 80+ granted IPs across IoT, health-tech, and education technology.",
      photo: "/judges/judge.jpg"
    },
    {
      name: "Okoswo Temiloluwa",
      title: "Founder, Funnel Growth Labs",
      description: "Funnel strategist who has designed 150+ conversion-optimized funnels across 15+ industries.",
      photo: "/judges/judge.jpg"
    },
    {
      name: "Favour Ben",
      title: "Founder & CEO, Roots and Radiance",
      description: "Business lecturer at Arden University supporting hair, beauty, and creative entrepreneurs.",
      photo: "/judges/favour-ben.jpg"
    },
    {
      name: "Busola Dakolo",
      title: "Founder, SistahKitchen",
      description: "Professional photographer and Head of Communications at C-HUB, empowering African innovation.",
      photo: "/judges/judge.jpg"
    },
    {
      name: "Dimmykiss",
      title: "Spoken Word Artist & Lawyer",
      description: "Motivational speaker combining legal expertise with creative expression to inspire young Nigerians.",
      photo: "/judges/judge.jpg"
    },
    {
      name: "Elizabeth Adediji",
      title: "Founder, The Abeke Brand",
      description: "MA in Fashion and Creative Pattern Cutting, blending technical precision with aesthetic excellence.",
      photo: "/judges/judge.jpg"
    }
  ]

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Section with Background Image - TALLER */}
      <section className="relative w-full min-h-[700px] bg-cover bg-center flex items-center" style={{ backgroundImage: "url('/judge-hero.png')" }}>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
        
        {/* Header - NO HAMBURGER */}
        <header className="absolute top-0 left-0 right-0 z-20 w-full px-6 lg:px-16 py-5 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-lg">
            <span className="text-white font-bold text-lg">ikonetU</span>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight max-w-3xl">
              Shape the Future of African Entrepreneurship
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl">
              Join our panel of industry leaders evaluating Africa's next generation of founders in 60-second pitches.
            </p>
            <Button 
              onClick={() => window.open('https://forms.gle/sHve5VZvWejeHr989', '_blank')}
              className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full text-base font-semibold shadow-lg"
            >
              Become a Judge
            </Button>
          </div>
        </div>
      </section>

      {/* Why Become a Judge Section */}
      <section className="relative w-full px-6 lg:px-16 py-20 bg-white overflow-hidden">
        {/* Beautiful gradient orbs in background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
          <div className="absolute top-40 -right-20 w-[450px] h-[450px] bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900">
            Why Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Judge</span>?
          </h2>
          <p className="text-center text-gray-600 text-base mb-12 max-w-3xl mx-auto">
            Get first access to 10,000+ promising African student entrepreneurs. Identify potential investments or partnerships.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "/icons/discover-talent.png",
                title: "Discover Talent Early",
                description: "Get first access to 10,000+ promising African student entrepreneurs. Identify potential investments or partnerships."
              },
              {
                icon: "/icons/build-brand.png",
                title: "Build Your Brand",
                description: "Position yourself as a thought leader supporting African innovation. Gain visibility across student networks and media coverage."
              },
              {
                icon: "/icons/network.png",
                title: "Network with Leaders",
                description: "Connect with fellow judges from SeedLegals, Tide, and other leading companies shaping the future of African tech."
              },
              {
                icon: "/icons/give-back.png",
                title: "Give Back",
                description: "Mentor the next generation, share your expertise, and create lasting impact on African entrepreneurship ecosystems."
              },
              {
                icon: "/icons/spot-trends.png",
                title: "Spot Trends",
                description: "See emerging ideas and market opportunities across diverse sectors before they become mainstream."
              },
              {
                icon: "/icons/efficient.png",
                title: "Efficient Format",
                description: "Review pitches in 60 seconds each. No lengthy decks or meetings required. Judge on your schedule."
              }
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all border border-gray-100"
              >
                <img
                  src={benefit.icon}
                  alt={benefit.title}
                  className="w-16 h-16 mb-4 object-contain transition-transform hover:scale-110"
                />

                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {benefit.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Do Section */}
      <section className="relative w-full px-6 lg:px-16 py-20 bg-gradient-to-b from-purple-50/50 to-pink-50/30 overflow-hidden">
        {/* Floating circles decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-purple-300 rounded-full" />
          <div className="absolute top-40 right-20 w-24 h-24 border-4 border-pink-300 rounded-full" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 border-4 border-blue-300 rounded-full" />
          <div className="absolute bottom-10 right-1/3 w-28 h-28 border-4 border-rose-300 rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900">
            What <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">You'll</span> Do as a Judge
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-5xl mx-auto">
            {[
              {
                number: "1",
                title: "Browse Pitches",
                description: "Access our platform and watch 60-second video pitches from student entrepreneurs across Africa. Filter by industry, country, or stage."
              },
              {
                number: "2",
                title: "Evaluate & Score",
                description: "Rate pitches based on clarity, innovation, market potential, and execution capability. Provide optional feedback to help founders improve."
              },
              {
                number: "3",
                title: "Connect Directly",
                description: "Message founders you're interested in. No gatekeepers. Start conversations that could lead to investments, partnerships, or mentorship."
              },
              {
                number: "4",
                title: "Select Winners",
                description: "Join final judging panel to select top 3 winners. Participate in awards ceremony and celebrate winners with the community."
              }
            ].map((step, idx) => (
              <div
                key={idx}
                className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white rounded-3xl p-12 min-h-[260px] overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Large number in background */}
                <div className="absolute bottom-0 right-0 text-[180px] font-black text-white/5 leading-none select-none">
                  {step.number}
                </div>
                
                <div className="relative z-10">
                  <h3 className="font-bold text-2xl mb-3">{step.title}</h3>
                  <p className="text-purple-100 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Time Commitment Section */}
      <section className="relative w-full px-6 lg:px-16 py-20 bg-white overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-100/40 via-pink-100/40 to-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-rose-100/40 via-purple-100/40 to-pink-100/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left - Title */}
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                Time<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Commitment</span>
              </h2>
            </div>

            {/* Right - Details Card */}
            <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-4xl font-bold mb-2">2-5 Hours</h3>
              <p className="text-purple-200 text-sm mb-6">Total time commitment over 4 weeks</p>

              <div className="space-y-4 bg-purple-800/40 rounded-xl p-6">
                {[
                  "Initial setup & platform training (30 mins)",
                  "Browse & evaluate pitches on your schedule (1-3 hours)",
                  "Optional: Connect with founders you like (30 mins - 1 hour)",
                  "Final judging session (1 hour, virtual)",
                  "Optional: Awards ceremony attendance (1 hour, virtual)"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-purple-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Judges Panel Section */}
      <section className="relative w-full px-6 lg:px-16 py-20 bg-gradient-to-b from-purple-50/50 via-pink-50/30 to-purple-50/50 overflow-hidden">
        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Prestigious</span> Panel
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {judges.map((judge, idx) => (
              <div key={idx} className="group">
                <div className="relative mb-3 rounded-xl overflow-hidden aspect-square shadow-md group-hover:shadow-xl transition-shadow">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />
                  <img 
                    src={judge.photo} 
                    alt={judge.name}
                    className="relative z-10 w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-bold text-sm text-gray-900 mb-0.5">{judge.name}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{judge.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We're Looking For Section */}
      <section className="relative w-full px-6 lg:px-16 py-20 bg-white overflow-hidden">
        {/* Diagonal gradient stripes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={i}
              className="absolute h-[200px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent transform -rotate-12"
              style={{ 
                top: `${i * 8}%`,
                left: '-50%',
                right: '-50%'
              }}
            />
          ))}
        </div>

        {/* Floating gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-[450px] h-[450px] bg-gradient-to-br from-pink-200/30 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Who <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">We're</span> Looking For
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "/icons/industry-experience.png",
                title: "Industry Experience",
                description: "Investors, founders, executives, or industry experts with 5+ years experience in entrepreneurship, investing, or business development."
              },
              {
                icon: "/icons/mentorship.png",
                title: "Commitment to Mentorship",
                description: "Genuine interest in supporting student entrepreneurs and contributing to African innovation ecosystems."
              },
              {
                icon: "/icons/diverse.png",
                title: "Diverse Perspectives",
                description: "We welcome judges from all industries, backgrounds, and geographies. Diversity strengthens our evaluation process."
              },
              {
                icon: "/icons/time.png",
                title: "Time Availability",
                description: "Ability to commit 2-5 hours over 4 weeks, with flexibility to evaluate pitches on your own schedule."
              }
            ].map((criteria, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all"
              >
                <img
                  src={criteria.icon}
                  alt={criteria.title}
                  className="w-20 h-20 mb-4 transition-transform hover:scale-110"
                />

                <h3 className="font-bold text-base text-gray-900 mb-2">
                  {criteria.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {criteria.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="relative w-full px-6 lg:px-16 py-20 bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-3">
            Apply To Be A Judge
          </h2>
          <p className="text-center text-purple-200 mb-10 text-sm">
            Complete the form below and our team will review your application
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Full Name*</label>
              <Input
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Email Address*</label>
              <Input
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">LinkedIn Profile*</label>
              <Input
                name="linkedin"
                type="url"
                placeholder="Your LinkedIn profile link"
                value={formData.linkedin}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Current Role & Company*</label>
              <Input
                name="role"
                type="text"
                placeholder="e.g CEO at Tech Startup"
                value={formData.role}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Industry/Expertise*</label>
              <Select onValueChange={(value) => handleSelectChange('industry', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-lg">
                  <SelectValue placeholder="Select your primary expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fintech">Fintech</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="ai-ml">AI/ML</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="climate">Climate Tech</SelectItem>
                  <SelectItem value="edtech">EdTech</SelectItem>
                  <SelectItem value="web3">Web3</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Years of Experience*</label>
              <Select onValueChange={(value) => handleSelectChange('experience', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-lg">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10-15">10-15 years</SelectItem>
                  <SelectItem value="15-20">15-20 years</SelectItem>
                  <SelectItem value="20+">20+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Why do you want to be a judge?*</label>
              <Textarea
                name="motivation"
                placeholder="Tell us what motivates you to support African student entrepreneurs..."
                value={formData.motivation}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg min-h-[100px]"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">What unique perspective do you bring?*</label>
              <Textarea
                name="perspective"
                placeholder="Describe your expertise and what makes you a great fit for judging..."
                value={formData.perspective}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg min-h-[100px]"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Have you invested in or mentored startups before?</label>
              <Select onValueChange={(value) => handleSelectChange('invested', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-lg">
                  <SelectValue placeholder="Select one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes-investor">Yes, as an investor</SelectItem>
                  <SelectItem value="yes-mentor">Yes, as a mentor</SelectItem>
                  <SelectItem value="yes-both">Yes, both</SelectItem>
                  <SelectItem value="no">No, but interested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 hover:from-purple-700 hover:via-pink-600 hover:to-rose-600 text-white py-4 rounded-lg font-semibold text-base mt-6 shadow-lg"
            >
              Submit Application
            </Button>
          </form>

          <p className="text-center text-purple-300 text-sm mt-6">
            We'll review your application and get back to you within 48 hours
          </p>
        </div>
      </section>
    </div>
  )
}