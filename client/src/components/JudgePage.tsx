"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/apiClient";
import { Description } from "@radix-ui/react-toast"
import { title } from "process"

export default function JudgePage() {
  const [selectedJudge, setSelectedJudge] = useState(null)

  const [formData, setFormData] = useState({
    fullname: "",
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
      name: "Prince Adenola Adegbesan",
      title: "Host, Ikonetu",
      description: "Prince Adenola Adegbesan is a UK-based legal innovator and venture strategist serving as Project Lead of IkonetU, a global fundraising platform enabling African entrepreneurs to raise capital through 60-second video pitches. He is also Founder & CEO of InspireCraft Global Limited, advising organisations on AI governance and cross-border business transformation. A qualified barrister with venture capital experience, he is recognised for architecting systemic change most notably contributing to Nigeria’s historic police reform, while building scalable, impact-driven ventures across Africa, the UK, and the United States.",
      photo: "/judges/adenola.jpg"
    },
    {
      name: "Anthony Rose",
      title: "Founder & CEO, SeedLegals",
      description: "Anthony is founder and CEO at SeedLegals, a legaltech platform that lets startup founders get investment ready, do a funding round, and complete the legals needed to build their business at a fraction of the cost of using a law firm. Over 50,000 startups use SeedLegals. Anthony's career has included 3D graphics, P2P music, internet video, social TV and heading up BBC iPlayer. Back in 2009 Wired Magazine's cover story billed him as The Man Who Saved The BBC.",
      photo: "/judges/anthony-rose.png"
    },
    {
      name: "Venkatesh Bharti",
      title: "Founder, Vastav Intellect IP Solutions",
      description: "Venkatesh Bharti is a scientist, inventor, entrepreneur, and consultant known for his work in innovation, intellectual property, and technology commercialization. He has been recognized with the Young & Innovative Scientist Award by India's Defence Research and Development Organisation (DRDO) and has 80+ granted intellectual properties (IPs) across domains such as IoT, health-tech, legal-tech, and education technology. He is the founder and director of ventures like Vastav Intellect IP Solutions LLP and Vastav Incubatex & Entrepreneurship Foundation (VIEF), through which he provides strategic consulting on innovation and startups and mentors founders on IP strategy and commercialisation.",
      photo: "/judges/bharti.png"
    },
    {
      name: "Okeowo Temiloluwa",
      title: "Founder, Funnel Upscale LLC",
      description: "Okeowo Temiloluwa Emmanuel is a funnel strategist, automation expert, and founder of Funnel Upscale LLC, a digital growth agency focused on helping businesses turn traffic into leads and customers through high-performing sales funnels and automation systems. He has designed 150+ conversion-optimized funnels across more than 15 industries, leveraging tools like GoHighLevel and ClickFunnels to support sustainable business growth.",
      photo: "/judges/okeowo.png"
    },
    {
      name: "Favour Ben",
      title: "Founder & CEO, Roots and Radiance Network",
      description: "Favour Ben is a business lecturer at Arden University and the Founder and CEO of Roots and Radiance Network CIC, a UK-based organisation dedicated to supporting hair, beauty, and creative entrepreneurs. Through this work, she promotes inclusive entrepreneurship by providing access to information, skills development, and opportunities that enable individuals to build and sustain thriving businesses in the UK.",
      photo: "/judges/favour-ben.png"
    },
    {
      name: "Busola Dakolo",
      title: "Founder, SkillsKitchen",
      description: "Busola Dakolo is a professional photographer, entrepreneur, and advocate based in the UK. She holds a degree in Geology and Mineral Resources from the University of Ilorin and a Diploma in Photography from the New York Film Academy. Busola is the founder of SkillsKitchen, a training initiative that empowers women and young people with practical, income-generating skills. She serves as Head of Communications at Co-creation Hub (CcHUB), an innovation centre dedicated to accelerating the application of social capital and technology for economic prosperity across Africa. A brand and personal brand photographer, Busola is passionate about visual storytelling and helping individuals and brands communicate their authentic narratives through compelling imagery.",
      photo: "/judges/busola.png"
    },
    {
      name: "Osayi Ebohon",
      title: "Transformational Speaker",
      description: "Osayi Ebohon is an award-winning transformational speaker, author of BecomingHer: A Mindset and Legacy Transformational Journal, and Convener of the BecomingHer community. With 27 years in social work specializing in adoption and 19 years in real estate, she empowers women globally to achieve financial independence, build wealth, and create lasting legacies through faith-driven mentorship and advocacy.",
      photo: "/judges/osayi.jpg"
    },
    {
      name: "Elizabeth Adediji",
      title: "Founder, The Abeke Brand",
      description: "Elizabeth Adediji is the founder and director of The Abeke Brand Limited, a UK-based fashion company specializing in accessories and clothing. She holds an MA in Fashion and Creative Pattern Cutting from Nottingham Trent University, where she developed expertise in sewing, tailoring, and innovative design. Through her freelance work and academic training, Elizabeth has demonstrated a strong commitment to the craft of fashion design, with particular emphasis on technical precision and aesthetic excellence. As a creative entrepreneur, she applies her specialized skills in pattern cutting and garment construction to deliver quality fashion pieces that reflect both her technical proficiency and creative vision.",
      photo: "/judges/elizabeth.jpg"
    },
    {
      name: "Dimmykiss",
      title: "Spoken Word Artist & Lawyer",
      description: "Dimmykiss is a Nigerian spoken word artist, poet, motivational speaker, and lawyer. He holds an LLB degree and is known for his engaging motivational content shared across social media platforms including Instagram, Facebook, Twitter, and YouTube. Dimmykiss combines his legal background with his passion for creative expression to deliver thought-provoking messages that inspire and educate his audience. His unique approach blends humor with valuable life lessons, making him a popular voice among young Nigerians seeking motivation and personal development.",
      photo: "/judges/dimmykiss.jpg"
    },
    {
      name: "Celine Ofori-Amanfo",
      title: "Founder & CEO, GroupGiftz",
      description: "Celine Ofori-Amanfo is the Founder and CEO of GroupGiftz and a seasoned startup advisor with 15 years of experience in innovation management. An alumna of HEC Paris, Harvard Business School Online, and Cornell, she specializes in executing business strategies from ideation to MVP. Celine is passionate about mentorship, business expansion, and empowering women in entrepreneurship.",
      photo: "/judges/celine.jpg"
    },
    {
      name: "Dr Stephen Akintayo",
      title: "Chairman, SACI Holdings",
      description: "Dr Stephen Akintayo is the Chairman of SACI Holdings, a private equity and venture investment firm dedicated to backing high-growth companies including AI-enabled businesses and scalable ventures across Africa, the UK, and the US with a strategic focus on value creation and long-term impact. He is a serial entrepreneur, seasoned investor, and author of 45+ books on wealth creation and business strategy, known for building and exiting multiple successful enterprises across real estate, technology, digital marketing, and investment services. Previously the Founder and CEO of Gtext Holdings, a multinational conglomerate with diversified interests in real estate and technology, Dr Akintayo transitioned to a strategic leadership role to scale his investment vision and mentorship ecosystem.",
      photo: "/judges/stephen-akintayo.jpg"
    },
    {
      name: "Mr Bola Ray",
      title : "CEO, EIB Network Group",
      description: "Mr Bola Ray (Nathan Kwabena Anokye Adisi) is a Ghanaian media entrepreneur, business leader, and visionary executive with over two decades of experience shaping Africa’s media and entertainment landscape. As Chief Executive Officer of EIB Network Group and CEO of Empire Entertainment, he has led the growth of one of West Africa’s most dynamic media conglomerates, spanning radio, television, digital platforms, and live events. Under his leadership, the EIB Network home to brands such as Starr FM, GHOne TV, and Live FM has become a pioneering force in broadcasting and content creation. Recognised for his leadership and influence, he has been appointed Country Board Chair for Ghana at the Global Entrepreneurship Festival 2025 and was the first inductee into The Creatives’ Space of Fame, celebrating his lasting impact on the creative industries.",
      photo: "/judges/bola-ray.jpg"
    },
    {
      name: "Femi (S.O.A) Olukoya",
      title: "Global Managing Partner at GrapeVine360 Solutions Group",
      description: "Femi (S.O.A) is a purpose-driven, visionary leader with over 25 years’ international experience in technology-enabled transformation, organizational strategy, and stakeholder engagement. He has a proven track record of guiding complex organizations through digital and operational change initiatives that deliver measurable improvements in performance, productivity, governance, and resilience. This includes over a decade at global magic circle law firm Linklaters- focused on bringing legal certainty to a changing world. He is a highly valued and trusted advisor on several boards, including an award-winning member of the renowned GEF (Global Entrepreneurship Festival) Board. He holds an MBA in International Business and a Bachelor of Engineering (Hons) in Electronic Engineering and is currently completing a Doctor of Business Administration (DBA) in Strategy and Innovation. His research focuses on comparative artificial intelligence strategies across governments, multinational organizations, and non-profit institutions, providing practical insight into emerging technology governance, risk, and ethical leadership.",
      photo: "/judges/femi-olukoya.jpg"
    },
    {
      name: "Dr. Kelly Daniels",
      title: "Relationship Consultant & Family Advocate",
      description: "Dr. Kelly Daniels is a relationship consultant and family advocate. Author of 85 books on love, marital, and family affairs. He is also a presenter on Ghana's prominent media corporation, the EIB NETWORK that  manages a number of radio and tv stations in active service to humanity. As an on air personality, Dr. Kelly Daniels is one of the most prolific  counselors on Ghana's media and has been serving for over a decade in service to the community and beyond. He is a serial conference host on love affairs within and outside Ghana, armed with a degree in counseling, a masters degree in counseling, and an honorary doctorate degree in Divinity. Dr. Kelly Daniels is a faith based person and as such is an itinerant preacher to multiple faith platforms, promoting the message of love and Christian living as a blessing to family life. As a passionate filmmaker and actor, Dr. Kelly Daniels has a structure in place to convert all his published books into movies, for better conveyance of the love message. Dr. Kelly Daniels believes that the world will gradually become a better place if we all selflessly love each other, at least one soul at a time. He is the founding head of LOVE NATION, the umbrella covering all initiatives birthed by him by God's grace.",
      photo: "/judges/kelly-daniels.jpg"
    },
    {
      name: "Shelley Cowan",
      title: "Founder & CEO, Access Avenue International Limited",
      description: "Shelley Cowan is a disabled female entrepreneur, tech founder, international speaker, and advocate for inclusion and accessibility, with over 30 years of lived experience navigating disability, health and engaging with communities, organisations, and industries to create meaningful change. She founded JustUs (group for adults with disabilities) and Access Avenue International Limited, developing platforms that empower underrepresented communities and create inclusive solutions for accessible travel. Shelley is Northern Ireland’s first Purple Tuesday Ambassador, promoting enhanced customer experiences for people with disabilities, and serves as an advisor for the Accessible Hospitality Alliance. She has shared her expertise on accessibility and inclusion as a TEDx speaker at Black Mountain, and her work has been recognised with the Diversity in Tech Award and as a finalist for the National Diversity Awards Entrepreneur of Excellence. Shelley empowers diverse entrepreneurs and leaders to overcome barriers, scale their ventures and create real, global impact.",
      photo: "/judges/shelley-cowan.jpg"
    },
    {
      name: "Prof. Godwin Oyedokun",
      title: "Professor of Accounting and Financial Development, Lead City University, Ibadan",
      description: "Prof. Godwin Oyedokun is a distinguished scholar-practitioner with over 25 years of multidisciplinary experience in law, forensic accounting, taxation, financial development and public policy analysis. Currently a Professor of Accounting and Financial Development at Lead City University, Ibadan, he is widely respected for his contributions to academia and industry. Prof. Oyedokun was the Chief Executive Officer at OGE Professional Services Ltd, the company which is recognized for its expertise in accounting, tax advisory, and forensic auditors. Throughout his career, he has held several key roles, including Partner, Audit & Forensic Services at Ibrahim Jimoh & Co. Chartered Accountants, and Director of Tax, Forensic & Regulatory Services at Saffron Professional Services. He has also held leadership positions such as Audit Manager at Gbolahan Oyegoke & Co. (Chartered Accountants) and Accounts Manager (Head of Accounts) at Bond Chemical Industries Ltd, where he also served as Financial Accountant and Cost & Management Accountant. In addition, he was a Senior Analyst (Resident Control & Risk Officer) at XL Management Services Ltd. Earlier in his career, Prof. Oyedokun worked (for his industrial attachment) at the Bursary Department of the University of Ibadan, where he gained experience in the Correspondence, Assets & Insurance, and Payroll sections. In academia, Prof. Oyedokun has held adjunct positions at various prestigious universities, both in Nigeria and internationally. His extensive academic experience complements his practical knowledge, making him a highly sought-after educator and consultant in the fields of forensic accounting, financial development, and taxation. He has also played significant roles at the Chartered Institute of Taxation of Nigeria (CITN), where he led the Education, Research & Technical Directorate as well as the Finance & ICT Directorate. As an author, public policy analyst, and international speaker, Prof. Oyedokun continues to share his expertise across various platforms, influencing both policy and practice in the financial world. He is currently a Governing Council member of the Business Recovery and Insolvency Practitioners of Nigeria (BRIPAN), President of the Association of Forensic Accounting Researchers (AFAR), President of the Association of Tax Practitioners, Lagos, Nigeria and Council member/Director, Research & Development of Institute of Personality Development and Customer Relationship Management, Board Chairman of the Association of Certified Fraud Examiners (ACFE, Southwest, Nigeria Chapter), Chairman, Board of Diplomates of Forensic Accounting & Audit of the Chartered Institute of Forensic and Certified Fraud Investigators of Nigerian (CIFCFIN), Chairman, Board of Trustees of Institute of Hospitality Accountants & Revenue Managers and Member of Board of Trustees of the Association of Management and Social Sciences Researchers of Nigeria. He is the Financial Secretary of the Association of Professional Bodies in Nigeria (APBN) and the Past Chairman, Ilupeju/Gbagada & District Society of the Institute of Chartered Accountants of Nigeria (ICAN) among others.",
      photo: "/judges/godwin-oyedokun.jpg"
    },
    {
      name: "Dr Mayowa Gbenga",
      title: "Senior Lecturer in Business Management, Convenant University, Ogun",
      description: "Dr Mayowa Gbenga Agboola is a Senior Lecturer in Business Management with over eighteen years of experience in teaching, research, and academic leadership within the higher education sector. His expertise spans organisational behaviour, organisational culture, ethics, digital transformation, entrepreneurship, and technology-enabled learning, with a growing focus on artificial intelligence in education. He holds a PhD, MSc, and BSc in Business Administration and has undertaken extensive professional training in management, administration, consulting, and research. Dr Agboola has published in reputable peer-reviewed journals and international conference proceedings, contributing to scholarly discourse on organisational performance, innovation, and education systems. Dr Agboola has served in several senior academic and administrative leadership roles, including directorate and centre-level appointments in open and distance learning, research and innovation, lifelong learning, and entrepreneurship development. He is an experienced postgraduate supervisor and an advocate of student-centred, technology-driven pedagogy. He is an active member and fellow of recognised professional bodies, regularly serves as a journal reviewer and conference speaker, and contributes to academic initiatives aligned with global development priorities, particularly quality education, innovation, and decent work.",
      photo: "/judges/mayowa-gbenga.jpg"
    },
    {
      name: "Professor Wasiu Adeyemo",
      title: "Professor of Hotel Management and Tourism, Atiba University, Oyo, Nigeria",
      description: "Professor Wasiu Adeyemo Babalola is a distinguished academic, industry practitioner, and policy expert in hospitality and tourism development. He is a Professor of Hotel Management and Tourism at Atiba University, Oyo, Nigeria where he contributes to teaching, research, and capacity building in tourism, hospitality management, law, accoubtung, and related disciplines. Beyond academia, Prof. Babalola os the Senior Vice President for Africa at Continent Worldwide Hotels Turkiye and also serves as Chairman of the National Technical/Mirror Committee on Tourism and Related Services in Nigeria, where he plays a strategic role in aligning Nigeria’s tourism standards and practices with international best practices. His work focuses on tourism regulation, quality assurance, sectoral reforms, and the integration of the private sector in national tourism development. With extensive experience spanning academia, professional practice, and policy engagement, Prof. Babalola is a respected voice on cultural tourism, hospitality entrepreneurship, and sustainable tourism development in Nigeria and beyond. He is a frequent speaker at conferences and media platforms, contributing thought leadership on the role of tourism in economic diversification and national development. He is a Rotarian and a Past Assistant Governor of District 9111 and Rotary Internation",
      photo: "/judges/wasiu-adeyemo.jpg"
    },
    {
      name: "Dr Gbenga Eyiolawi",
      title: "Co-Founder & CEO, VISAROCRAFT Technology LLC",
      description: "Dr. Gbenga Eyiolawi is Co-Founder and Chief Executive Officer of VISAROCRAFT Technology LLC and Chairman of Tafiki a global food logistics brand where he has revolutionized Nigeria's agricultural technology and logistics sectors through innovative distribution models and supply chain optimization frameworks. With extensive expertise spanning agritech innovation and logistics management, his leadership has earned him recognition as one of Nigeria's Top 50 CEOs by The Guardian Newspaper (2023) and Lead City University's Most Outstanding CEO of the Year (2021 and 2022). With over two decades of transformative impact across agricultural value chains, Eyiolawi has pioneered consignment-based food distribution systems that bridge the gap between farmers and markets, introducing unprecedented operational efficiencies while expanding market access for agricultural products. His unique integration of technology-driven logistics solutions with traditional agricultural commerce has distinguished him as one of Nigeria's most exceptional innovators in the agritech and food distribution ecosystem, creating significant employment opportunities and driving youth empowerment initiatives nationwide.",
      photo: "/judges/gbenga-eyiolawi.jpg"
    },
    {
      name: "Stephen Camilleri",
      title: "Entrepreneur, Advisor & Capital Connector",
      description: "A globally experienced entrepreneur, advisor, and capital connector, I have spent my career supporting founders in building, scaling, and funding businesses across five continents. My work is driven by a clear mission: to back bold entrepreneurs, foster cross-border collaboration, and help transform strong ideas into sustainable, high-impact ventures. I specialize in opening doors for visionary founders—strengthening their brands, refining their strategies, and connecting them with capital through an established international network of investors. Over the past three years, my focus has been on expanding my global network and deepening my understanding of how businesses operate across diverse markets, including the UK, Europe, Africa, and the United States. This has given me first-hand insight into the challenges, opportunities, and cultural nuances that shape entrepreneurial success in different regions. I am actively engaged in sectors including AI, film, fashion, events, energy, and entrepreneurship ecosystems, with a particular passion for innovation hubs and founder-led communities. Alongside my commercial work, mentoring and supporting entrepreneurs has been a consistent thread throughout my career. As a collaborative and people-driven leader, I am committed to sharing real-world experience to help others flourish. Through Flux Global Network and Global Entrepreneur Magazine, I continue to develop legacy projects designed to connect founders, investors, and ideas on a global scale. As a judge, I bring a practical, global, and founder-first perspective—assessing ideas not only on creativity, but on scalability, execution, and long-term impact.",
      photo: "/judges/stephen-camilleri.jpg"
    },
    {
      name: "Yaw Kyeremateng",
      title: "Head of Sales, Kuber Realty | Creative Director, The Yaw Brand | Cross-Border Real Estate Investment Specialist (UAE & Ghana)",
      description: "Yaw Kyeremateng is a Dubai-based real estate professional with over 10 years of experience in the UAE.He serves as Head of Sales at Kuber Realty, leading sales and marketing for Bella Vista, a gated community of 40 homes in Katamanso, Accra. Previously, he built a strong commercial foundation in retail home fashion and flooring, generating AED 30M+ in sales across 20 countries. Since transitioning into real estate, Yaw has closed AED 40M+ in property transactions, assisting 250+ clients in securing homes and investment properties in Dubai. He is also Creative Director of The Yaw Brand, a premium lifestyle label spanning fashion and fragrance. Focus areas: real estate sales and investment advisory, cross-border property (UAE–Ghana), sales strategy, and residential developments.",
      photo: "/judges/yaw-kyeremateng.jpg"
    },
    {
      name: "Jim Keyes",
      title: "Former CEO of 7-Eleven and Blockbuster",
      description: "He is a seasoned business leader, author, and turnaround expert best known for serving as CEO of two iconic global brands: 7-Eleven and Blockbuster. At 7-Eleven, he led a remarkable transformation, driving record profitability, operational discipline, and sustained growth by empowering frontline employees and sharpening customer focus. He later took the helm at Blockbuster during one of the most disruptive periods in retail history, navigating the company through intense technological and market change while gaining deep insight into innovation, disruption, and leadership under pressure. Drawing from decades of executive experience, Keyes is the author of Education Is Freedom, a widely respected book that argues learning not background or circumstance is the ultimate driver of personal and professional success. Today, he is a sought-after speaker and advisor, helping leaders and organizations build resilient cultures, develop talent, and lead with clarity in rapidly changing environments.",
      photo: "/judges/jim-keyes.jpg"
    },
    {
      name: "Ousseini Oumarou",
      title: "Cloud & AI Consultant",
      description: "My name is OUSSEINI OUMAROU. I am a highly motivated Cloud and AI Consultant, uniquely positioned with a strong foundation in both Cloud computing and Artificial Intelligence. My expertise is validated by industry leading certifications. This robust skill set, combined with my background in Cryptocurrency, Web3, and Blockchain, allows me to architect and deploy innovative, scalable, and secure cloud-native solutions, with a particular focus on leveraging advanced AI capabilities to drive transformative business outcomes. I am dedicated to pushing the boundaries of technology to create intelligent systems that redefine possibilities.",
      photo: "/judges/ousseini-oumarou.jpg"
    },
    {
      name: "Signaturepuffs",
      title: "Founder, Signaturepuffs",
      description: "Signaturespuffs is a UK-based pastry brand celebrating culture, flavour and community through freshly prepared West African comfort food. Proudly food hygiene registered and rated 5-star also best known for its soft, fluffy puff-puff, the brand is built on a passion for quality, consistency and creating pastries that feel welcoming to all. Each item is carefully made using quality ingredients and traditional flavours adapted for a multicultural audience. Signaturespuffs brings people from different backgrounds together through what we offer. Beyond puff-puff, the brand continues to expand its menu with well-loved favourites suitable for events, takeaway and delivery.",
      photo: "/judges/signaturepuffs.jpg"
    },
    {
      name: "Deji Onadeko",
      title: "Founder & CEO, RedLantan Media",
      description: "Deji Onadeko is the visionary Founder & CEO of RedLantan Media, where creativity meets purpose. He believes in the power of storytelling to heal, inspire, and transform. As a filmmaker, coach, and speaker, Adedeji dedicates himself to inspiring others to live authentically while raising the standard of creativity and impact in every space he enters. Fueled by his love for life, Deji brings joyful, transformative energy to every project whether he’s producing impactful media or mentoring individuals to become their most authentic selves.",
      photo: "/judges/deji-onadeko.png"
    }
  ]

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Section with Background Image - TALLER */}
      <section className="relative w-full min-h-[700px] bg-cover bg-center flex items-center" style={{ backgroundImage: "url('/judge-hero.png')" }}>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
        
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 w-full px-6 lg:px-3 py-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 shadow-lg border border-white/20">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent font-semibold text-sm tracking-wide">
              ikonetU
            </span>
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
              asChild
              className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full text-base font-semibold shadow-lg"
            >
              <a href="#apply">Become a Judge</a>
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
                description: "Get first access to 10,000+ promising African student entrepreneurs before anyone else. Identify potential Investments and Partnerships."
              },
              {
                icon: "/icons/build-brand.png",
                title: "Build Your Brand",
                description: "Position yourself as a thought leader supporting African innovation and Creativity. Gain visibility across 2000+ Universities across Africa"
              },
              {
                icon: "/icons/network.png",
                title: "Network with Leaders",
                description: "Connect with fellow judges from SeedLegal, InspireCraft Global,  Tide Banking and other leading companies shaping the future of African Entrepreneurship Ecosystem."
              },
              {
                icon: "/icons/give-back.png",
                title: "Give Back",
                description: "Mentor the next generation, share your expertise, and create lasting impact on African entrepreneurship ecosystems."
              },
              {
                icon: "/icons/spot-trends.png",
                title: "Spot Trends",
                description: "Discover emerging ideas and market opportunities across diverse sectors before they become mainstream."
              },
              {
                icon: "/icons/efficient.png",
                title: "Efficient Format",
                description: "Review Video pitches in 60 seconds. No lengthy decks or meetings required. Evaluate at your pace."
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
                description: "Access the platform and watch 60-second video pitches from student Entrepreneurs across Africa. Filter by Industry, Country, or Stage."
              },
              {
                number: "2",
                title: "Evaluate & Score",
                description: "Rate pitches based on clarity, innovation, market potential, and execution capability. Provide optional feedback to help founders improve."
              },
              {
                number: "3",
                title: "Connect Directly",
                description: "Contact Founders you're interested in directly via our platform Chat box. Start conversations that could lead to Investments, Partnerships, or Mentorship."
              },
              {
                number: "4",
                title: "Select Winners",
                description: "Join final Judging Panel to select the Top 3 Winners. Participate in the Awards ceremony and celebrate winners with the community."
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
      <section className="w-full px-6 lg:px-16 py-12 bg-gradient-to-b from-white via-purple-50/20 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 relative">
            <div className="absolute top-0 right-1/3 w-7 h-7 text-yellow-400 opacity-60">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 9.5L16 14.5L18.5 22L12 17L5.5 22L8 14.5L2 9.5L9.5 9.5L12 2Z" />
              </svg>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Join Other Industry <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Leaders</span> On The Panel
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
        </div>
      </section>

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
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-3" id="apply">
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
