import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { X, CheckCircle2, Loader2, ChevronDown, ArrowRight } from "lucide-react";
import { useState } from "react";
import { db } from "./lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

const SERVICES = [
  { name: "Standard Haircut", price: "$45", duration: "45 MIN", description: "Precision cut tailored to your specific style and profile." },
  { name: "Straight Razor Shave", price: "$35", duration: "30 MIN", description: "Traditional hot towel ritual with artisanal razor finish." },
  { name: "Beard Sculpting", price: "$30", duration: "30 MIN", description: "Architectural grooming for a defined and sharp facial profile." },
  { name: "The Buzzcuts Special", price: "$75", duration: "75 MIN", description: "The complete grooming ritual: Cut, shave, and facial sculpture." },
];

const TESTIMONIALS = [
  {
    text: "THE BEST GROOMING EXPERIENCE I'VE HAD IN NEW YORK. THE ATTENTION TO DETAIL IS UNPARALLELED.",
    author: "MARCUS REED",
    role: "CREATIVE DIRECTOR"
  },
  {
    text: "A TRUE MASTERPIECE EVERY TIME. THE VIBE OF THE STUDIO IS AS SHARP AS THE RAZORS THEY USE.",
    author: "JULIAN VANCE",
    role: "ARCHITECT"
  },
  {
    text: "THE BUZZCUTS ISN'T JUST A BARBER SHOP, IT'S A RITUAL. I LEAVE FEELING LIKE A NEW MAN.",
    author: "DOMINIC CHASE",
    role: "ENTREPRENEUR"
  }
];

enum BookingStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export default function App() {
  const { scrollYProgress } = useScroll();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>(BookingStatus.IDLE);
  const [formData, setFormData] = useState({
    service: SERVICES[0].name,
    date: "",
    time: "",
    name: "",
    email: "",
    phone: ""
  });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  const prevTestimonial = () => setCurrentTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  useState(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatus(BookingStatus.SUBMITTING);

    try {
      const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      await setDoc(doc(collection(db, "bookings"), bookingId), {
        service: formData.service,
        date: formData.date,
        time: formData.time,
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setBookingStatus(BookingStatus.SUCCESS);
      setTimeout(() => {
        setIsBookingOpen(false);
        setBookingStatus(BookingStatus.IDLE);
        setFormData({ service: SERVICES[0].name, date: "", time: "", name: "", email: "", phone: "" });
      }, 3000);
    } catch (error) {
      console.error("Booking error:", error);
      setBookingStatus(BookingStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-buzz-bg text-buzz-dark font-sans selection:bg-buzz-orange selection:text-white">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-buzz-orange z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-buzz-dark/80 backdrop-blur-sm" onClick={() => setIsBookingOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative bg-buzz-dark text-white p-10 md:p-14 max-w-2xl w-full rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-buzz-orange/10 rounded-full blur-3xl pointer-events-none" />
              
              <button onClick={() => setIsBookingOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>

              {bookingStatus === BookingStatus.SUCCESS ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="w-20 h-20 bg-buzz-orange/20 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-10 h-10 text-buzz-orange" />
                  </div>
                  <h2 className="buzz-heading text-5xl mb-4 italic">TRANSMISSION RECEIVED.</h2>
                  <p className="text-white/40 text-xs tracking-widest uppercase">Your session is secured. Await confirmation.</p>
                </div>
              ) : (
                <div className="relative z-10">
                  <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-buzz-orange mb-4">RESERVATION —</p>
                  <h2 className="buzz-heading text-6xl md:text-7xl mb-12 leading-none">SECURE <br /> YOUR SLOT</h2>
                  
                  <form onSubmit={handleBookingSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="flex flex-col gap-3">
                        <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/30">Service</label>
                        <select 
                          className="bg-transparent border-b border-white/10 pb-2 text-sm outline-none focus:border-buzz-orange transition-colors cursor-pointer appearance-none"
                          value={formData.service}
                          onChange={(e) => setFormData({...formData, service: e.target.value})}
                        >
                          {SERVICES.map(s => <option key={s.name} value={s.name} className="bg-buzz-dark">{s.name}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/30">Date</label>
                        <input 
                          type="date"
                          required
                          className="bg-transparent border-b border-white/10 pb-2 text-sm outline-none focus:border-buzz-orange transition-colors [color-scheme:dark]"
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="flex flex-col gap-3">
                        <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/30">Full Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="ALEXANDER HAMILTON"
                          className="bg-transparent border-b border-white/10 pb-2 text-sm outline-none focus:border-buzz-orange transition-colors placeholder:text-white/10 uppercase"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/30">Phone Number</label>
                        <input 
                          type="tel"
                          required
                          placeholder="+1 (555) 000-0000"
                          className="bg-transparent border-b border-white/10 pb-2 text-sm outline-none focus:border-buzz-orange transition-colors placeholder:text-white/10"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={bookingStatus === BookingStatus.SUBMITTING} className="w-full h-16 bg-white text-buzz-dark hover:bg-buzz-orange hover:text-white transition-all text-[11px] uppercase font-bold tracking-[0.3em] rounded-full mt-4">
                      {bookingStatus === BookingStatus.SUBMITTING ? "TRANSMITTING..." : "CONFIRM RESERVATION | →"}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-buzz-bg border-b border-buzz-dark/20">
        <div className="max-w-[1440px] mx-auto h-20 md:h-24 flex items-center">
          <div className="w-[200px] md:w-[300px] flex items-center justify-center border-r border-buzz-dark/20 h-full">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-buzz-dark rotate-45" />
              <span className="buzz-heading text-3xl tracking-widest">BUZZCUTS</span>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center gap-10 md:gap-14 h-full border-r border-buzz-dark/20">
            <button 
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="buzz-nav-link"
            >
              SERVICES
            </button>
            <div className="hidden lg:flex items-center gap-1 cursor-pointer">
              <span className="buzz-nav-link">LOCATIONS</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <a href="#" className="buzz-nav-link">GALLERY</a>
            <a href="#" className="buzz-nav-link">SHOP</a>
            <a href="#" className="buzz-nav-link">ABOUT</a>
          </div>

          <div className="w-[180px] md:w-[250px] flex items-center justify-center h-full px-4 md:px-0">
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="buzz-button text-[10px] md:text-[12px]"
            >
              CONTACT US
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.header 
        initial="initial"
        animate="animate"
        className="relative pt-24 min-h-screen flex flex-col lg:flex-row max-w-[1700px] mx-auto px-6 md:px-12 py-12 gap-12 lg:gap-0 overflow-hidden"
      >
        
        {/* Left Section */}
        <motion.div 
          variants={{
            initial: { opacity: 0, x: -50 },
            animate: { opacity: 1, x: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } }
          }}
          className="flex-[1.2] flex flex-col justify-center gap-16 relative z-10 lg:pl-10"
        >
          <div className="absolute -left-12 top-1/4 w-3 h-64 bg-buzz-orange hidden xl:block" />
          <motion.h1 
            variants={{
              initial: { opacity: 0, y: 100 },
              animate: { opacity: 1, y: 0, transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="buzz-heading text-[120px] md:text-[180px] xl:text-[220px] leading-[0.75] tracking-tighter"
          >
            MAKE <br /> UNIQUE <br /> STYLE
          </motion.h1>

          <motion.div 
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0, transition: { duration: 1 } }
            }}
            className="flex flex-col gap-2"
          >
            <p className="text-[10px] uppercase font-bold tracking-widest text-buzz-dark/40">BLOG -</p>
            <p className="text-xl font-bold uppercase tracking-tight leading-[1.1]">
              LATEST GROOMING TIPS <br /> & SOLUTIONS
            </p>
          </motion.div>

          <motion.div 
            variants={{
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1, transition: { duration: 1.2 } }
            }}
            className="mt-10 max-w-[150px]"
          >
            <img 
              src="/grooming_product.png" 
              alt="Elite grooming product"
              className="w-full grayscale border border-buzz-dark/10 p-2 mix-blend-multiply"
            />
          </motion.div>
        </motion.div>

        {/* Center Section */}
        <motion.div 
          variants={{
            initial: { opacity: 0, y: 100, scale: 0.9 },
            animate: { opacity: 1, y: 0, scale: 1.1, transition: { duration: 1.8, ease: [0.16, 1, 0.3, 1] } }
          }}
          className="flex-[1.5] relative flex items-end justify-center min-h-[600px] lg:min-h-0"
        >
          <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] aspect-[3/4] bg-buzz-yellow -z-10" />
          <img 
            src="/input_file_0.png"
            alt="Master Barber Lucas Benjamin"
            className="w-full h-auto max-h-[110%] object-contain relative z-10 origin-bottom mix-blend-multiply"
            referrerPolicy="no-referrer"
          />
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute top-[35%] right-0 md:-right-14 z-20 hidden md:flex flex-col items-end"
          >
            <p className="text-[10px] uppercase font-bold tracking-widest text-buzz-dark/40">HAIR STYLIST</p>
            <p className="buzz-heading text-4xl lg:text-5xl">LUCAS BENJAMIN</p>
          </motion.div>
        </motion.div>

        {/* Right Section */}
        <motion.div 
          variants={{
            initial: { opacity: 0, x: 50 },
            animate: { opacity: 1, x: 0, transition: { duration: 1.2, delay: 0.4 } }
          }}
          className="flex-1 flex flex-col justify-between items-end py-12 lg:pr-10 z-10"
        >
          <div className="flex flex-col gap-6 items-end">
            <div className="w-16 h-16 grayscale">
              <img src="/barber_icon.png" alt="Barber Icon" className="w-full h-full object-contain filter invert opacity-80 mix-blend-screen" />
            </div>
            <div className="text-right flex flex-col gap-1">
              <p className="text-[11px] uppercase font-bold tracking-[0.2em]">SALOON SERVICE</p>
              <p className="text-[11px] uppercase font-bold tracking-[0.2em] text-buzz-dark/40">— BARBERING</p>
              <p className="text-[11px] uppercase font-bold tracking-[0.2em] text-buzz-dark/40">GROOMING</p>
            </div>
          </div>

          <div className="flex flex-col gap-10 items-end w-full max-w-[300px]">
            <div className="relative group cursor-pointer w-full">
              <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-all z-10" />
              <img 
                src="/input_file_0.png"
                alt="Our Special Haircuts"
                className="w-full h-40 object-cover grayscale"
              />
              <div className="absolute top-4 left-4 z-20 bg-white/90 p-1 px-4 text-[10px] font-bold uppercase tracking-widest">OUR SPECIAL</div>
              <div className="absolute -bottom-4 right-0 border-b border-buzz-dark py-1 px-4 z-20 bg-buzz-bg">
                <span className="text-[10px] uppercase font-bold tracking-widest underline decoration-buzz-dark underline-offset-4">HAIRCUTS</span>
              </div>
            </div>

            <button 
              onClick={() => setIsBookingOpen(true)}
              className="buzz-button w-full h-14 flex items-center justify-center gap-4 group"
            >
              <span className="text-[11px] font-bold tracking-[0.2em]">BOOK AN APPOINTMENT |</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>

        {/* Floating Text Effect */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none z-0">
          <h2 className="buzz-heading text-[200px] md:text-[320px] lg:text-[400px] opacity-[0.03] whitespace-nowrap">
            UNLEASH YOUR STYLE WITH THE BUZZCUTS
          </h2>
        </div>
      </motion.header>

      {/* Services Section */}
      <section id="services" className="max-w-[1700px] mx-auto px-6 md:px-12 py-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-buzz-orange mb-4">OUR CRAFT —</p>
            <h2 className="buzz-heading text-6xl md:text-8xl leading-none uppercase">PREMIUM <br /> SERVICES</h2>
          </div>
          <p className="text-buzz-dark/40 text-xs leading-relaxed max-w-sm uppercase tracking-widest">
            From precision fades to traditional straight razor shaves, we provide a complete grooming ritual tailored to your identity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => (
            <motion.div 
              key={service.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="group relative bg-buzz-dark/5 p-8 border border-buzz-dark/5 hover:bg-buzz-dark hover:text-white transition-all duration-500 rounded-2xl"
            >
              <div className="flex justify-between items-start mb-12">
                <span className="text-3xl font-heading text-buzz-orange italic">0{index + 1}</span>
                <span className="text-xl font-bold font-heading tracking-widest">{service.price}</span>
              </div>
              
              <h3 className="buzz-heading text-3xl mb-4 group-hover:text-buzz-orange transition-colors">{service.name}</h3>
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-6">{service.duration}</p>
              
              <p className="text-xs leading-relaxed opacity-60 group-hover:opacity-80 transition-opacity mb-8">
                {service.description}
              </p>

              <button 
                onClick={() => setIsBookingOpen(true)}
                className="text-[10px] font-bold uppercase tracking-widest border-b border-current pb-1 hover:text-buzz-orange transition-colors"
              >
                RESERVE NOW
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Transition Gradient */}
      <div className="h-[400px] bg-linear-to-b from-buzz-bg to-buzz-dark" />

      {/* Testimonials Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="bg-buzz-dark text-white py-32 md:py-48 overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none select-none overflow-hidden">
          <p className="buzz-heading text-[300px] leading-none whitespace-nowrap -rotate-12 translate-y-1/2">TESTIMONIALS TESTIMONIALS</p>
        </div>
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-buzz-orange mb-4">CLIENT VOICES —</p>
              <h2 className="buzz-heading text-6xl md:text-8xl leading-none">THE STUDIO <br /> REPUTATION</h2>
            </div>
            <div className="flex gap-4">
              <button onClick={prevTestimonial} className="w-12 h-12 border border-white/20 flex items-center justify-center hover:bg-white hover:text-buzz-dark transition-all">
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <button onClick={nextTestimonial} className="w-12 h-12 border border-white/20 flex items-center justify-center hover:bg-white hover:text-buzz-dark transition-all">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative min-h-[300px] md:min-h-[400px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl"
              >
                <p className="buzz-heading text-4xl md:text-7xl leading-[1.1] italic mb-12">
                  "{TESTIMONIALS[currentTestimonial].text}"
                </p>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-[1px] bg-buzz-orange" />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest">{TESTIMONIALS[currentTestimonial].author}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{TESTIMONIALS[currentTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-24 flex gap-2">
            {TESTIMONIALS.map((_, idx) => (
              <div 
                key={idx}
                className={`h-[2px] transition-all duration-500 ${idx === currentTestimonial ? 'w-12 bg-buzz-orange' : 'w-4 bg-white/10'}`}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Transition Gradient Reverse */}
      <div className="h-[400px] bg-linear-to-b from-buzz-dark to-buzz-bg" />

      {/* Contact Section */}
      <motion.section 
        id="contact" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="max-w-[1700px] mx-auto px-6 md:px-12 py-32"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="flex flex-col justify-center">
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-buzz-orange mb-6">REACH OUT —</p>
            <h2 className="buzz-heading text-8xl md:text-[120px] mb-12 leading-none">VISIT <br /> THE STUDIO</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
              <div className="space-y-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-buzz-dark/40">LOCATION</p>
                <p className="text-lg font-bold uppercase leading-tight">
                  123 ARTISAN WAY<br />
                  NEW YORK, NY 10001
                </p>
                <p className="text-xs text-buzz-dark/60 underline cursor-pointer hover:text-buzz-orange transition-colors">VIEW ON MAP</p>
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-buzz-dark/40">OPERATING HOURS</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-buzz-dark/10 pb-1">
                    <span className="text-[10px] font-bold uppercase">MON - FRI</span>
                    <span className="text-[10px]">09:00 — 20:00</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-buzz-dark/10 pb-1">
                    <span className="text-[10px] font-bold uppercase">SATURDAY</span>
                    <span className="text-[10px]">10:00 — 18:00</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-buzz-dark/10 pb-1">
                    <span className="text-[10px] font-bold uppercase">SUNDAY</span>
                    <span className="text-[10px] text-buzz-orange">CLOSED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 border border-buzz-dark/5 -z-10 group-hover:border-buzz-orange/20 transition-colors rounded-[2.5rem]" />
            <div className="bg-buzz-dark text-white p-12 md:p-16 flex flex-col justify-between h-full min-h-[500px] rounded-3xl overflow-hidden">
              <div>
                <h3 className="buzz-heading text-4xl mb-6 italic">SEND A MESSAGE</h3>
                <p className="text-white/40 text-xs leading-relaxed max-w-sm mb-12">
                  For private events, mobile services, or general inquiries, please reach out via the form below.
                </p>
                
                <form className="space-y-8">
                  <input type="text" placeholder="NAME" className="w-full bg-transparent border-b border-white/20 py-3 text-xs outline-none focus:border-buzz-orange transition-colors" />
                  <input type="email" placeholder="EMAIL" className="w-full bg-transparent border-b border-white/20 py-3 text-xs outline-none focus:border-buzz-orange transition-colors" />
                  <textarea placeholder="MESSAGE" rows={3} className="w-full bg-transparent border-b border-white/20 py-3 text-xs outline-none focus:border-buzz-orange transition-colors resize-none" />
                  
                  <button type="button" className="w-full h-14 border border-white/20 hover:border-buzz-orange hover:text-buzz-orange transition-all text-[10px] uppercase font-bold tracking-[0.3em]">
                    TRANSMIT MESSAGE
                  </button>
                </form>
              </div>

              <div className="mt-12 flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[8px] uppercase tracking-widest text-white/30">CONTACT DIRECTLY</p>
                  <p className="text-sm font-bold tracking-widest">+1 (212) 555-0198</p>
                  <p className="text-[10px] text-buzz-orange">HELLO@BUZZCUTS.STUDIO</p>
                </div>
                <div className="flex gap-4">
                  {['IG', 'TW', 'FB'].map(social => (
                    <span key={social} className="text-[10px] font-bold cursor-pointer hover:text-buzz-orange transition-colors">{social}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer / Extra Content Peeking */}
      <div className="border-t border-buzz-dark/10 py-10 px-12 opacity-40">
        <p className="text-center buzz-heading text-lg tracking-[1em]">Established Excellence Since 1994</p>
      </div>

    </div>
  );
}
