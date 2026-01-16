"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.open('https://forms.gle/sHve5VZvWejeHr989', '_blank')
  }

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
      {/* Hero Section with Background Image */}
      <section className="relative w-full h-[600px] bg-cover bg-center" style={{ backgroundImage: "url('/judge-hero.jpg')" }}>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
        
        {/* Header */}
        <header className="relative z-10 w-full px-6 lg:px-16 py-5 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 bg-purple-600/80 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white font-bold text-lg">ikonetU</span>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 w-full">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight max-w-3xl">
              Shape the Future of African Entrepreneurship
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl">
              Join our panel of industry leaders evaluating Africa's next generation of founders in 60-second pitches.
            </p>
            <Button 
              onClick={() => window.open('https://forms.gle/sHve5VZvWejeHr989', '_blank')}
              className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-full text-base font-semibold"
            >
              Become a Judge
            </Button>
          </div>
        </div>
      </section>

      {/* Why Become a Judge Section */}
      <section className="w-full px-6 lg:px-16 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Why Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Judge</span>?
          </h2>
          <p className="text-center text-gray-600 text-base mb-12 max-w-3xl mx-auto">
            Get first access to 10,000+ promising African student entrepreneurs who anyone else. Identify potential investments or partnerships.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ),
                title: "Discover Talent Early",
                description: "Get first access to 10,000+ promising African student entrepreneurs who anyone else. Identify potential investments or partnerships."
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
                title: "Build Your Brand",
                description: "Position yourself as a thought leader supporting African innovation. Gain visibility across student networks and media coverage."
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Network with Leaders",
                description: "Connect with fellow judges from SeedLegals, Tide, and other leading companies shaping the future of African tech."
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: "Give Back",
                description: "Mentor the next generation, share your expertise, and create lasting impact on African entrepreneurship ecosystems."
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: "Spot Trends",
                description: "See emerging ideas and market opportunities across diverse sectors before they become mainstream."
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Efficient Format",
                description: "Review pitches in 60 seconds each. No lengthy decks or meetings required. Judge on your schedule."
              }
            ].map((benefit, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Do Section */}
      <section className="w-full px-6 lg:px-16 py-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
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
              <div key={idx} className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white rounded-2xl p-8 overflow-hidden">
                {/* Large number in background */}
                <div className="absolute bottom-0 right-0 text-[180px] font-black text-white/5 leading-none">
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
      <section className="w-full px-6 lg:px-16 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left - Title */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Time<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Commitment</span>
              </h2>
            </div>

            {/* Right - Details Card */}
            <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white rounded-2xl p-8">
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
                    <div className="w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
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
      <section className="w-full px-6 lg:px-16 py-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Prestigious</span> Panel
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {judges.map((judge, idx) => (
              <div key={idx} className="group">
                <div className="relative mb-3 rounded-xl overflow-hidden aspect-square shadow-md group-hover:shadow-lg transition-shadow">
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
      <section className="w-full px-6 lg:px-16 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Who <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">We're</span> Looking For
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "💼",
                title: "Industry Experience",
                description: "Investors, founders, executives, or industry experts with 5+ years experience in entrepreneurship, investing, or business development."
              },
              {
                icon: "🤝",
                title: "Commitment to Mentorship",
                description: "Genuine interest in supporting student entrepreneurs and contributing to African innovation ecosystems."
              },
              {
                icon: "📊",
                title: "Diverse Perspectives",
                description: "We welcome judges from all industries, backgrounds, and geographies. Diversity strengthens our evaluation process."
              },
              {
                icon: "⏰",
                title: "Time Availability",
                description: "Ability to commit 2-5 hours over 4 weeks, with flexibility to evaluate pitches on your own schedule."
              }
            ].map((criteria, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6">
                <div className="text-5xl mb-4">{criteria.icon}</div>
                <h3 className="font-bold text-base text-gray-900 mb-2">{criteria.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{criteria.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="w-full px-6 lg:px-16 py-20 bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
        <div className="max-w-2xl mx-auto">
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
              className="w-full bg-white hover:bg-gray-100 text-purple-900 py-4 rounded-lg font-semibold text-base mt-6"
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