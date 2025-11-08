'use client';

import { useEffect, useRef } from 'react';

export default function Home() {
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = noiseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    let animationId: number;
    const animate = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
        data[i + 3] = 25;
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section - Cluely-style Smooth Mesh Gradient */}
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)',
      }}>
        {/* Smooth Flowing Mesh Gradient Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[1000px] h-[1000px]" style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.6) 0%, rgba(232,245,233,0.3) 40%, transparent 70%)',
            filter: 'blur(80px)',
            transform: 'translate(-30%, -30%)',
          }}></div>

          <div className="absolute top-1/4 right-0 w-[900px] h-[900px]" style={{
            background: 'radial-gradient(circle at center, rgba(102,187,106,0.5) 0%, rgba(129,199,132,0.3) 50%, transparent 70%)',
            filter: 'blur(100px)',
            transform: 'translate(20%, 0)',
          }}></div>

          <div className="absolute bottom-0 left-1/3 w-[1100px] h-[1100px]" style={{
            background: 'radial-gradient(circle at center, rgba(0,170,69,0.4) 0%, rgba(56,142,60,0.2) 50%, transparent 70%)',
            filter: 'blur(120px)',
            transform: 'translate(-10%, 30%)',
          }}></div>

          <div className="absolute top-20 right-20 w-[700px] h-[700px]" style={{
            background: 'radial-gradient(circle at center, rgba(200,230,201,0.6) 0%, rgba(165,214,167,0.3) 50%, transparent 70%)',
            filter: 'blur(90px)',
          }}></div>

          <canvas
            ref={noiseCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.15] mix-blend-overlay"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10 w-full">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-12 leading-[1.1] tracking-tight">
              <span className="text-gray-900 whitespace-nowrap">Fire Your Content Writer.</span>
              <br />
              <span className="whitespace-nowrap" style={{color: '#008837'}}>Hire RankPulse.</span>
            </h1>

            <p className="text-2xl md:text-3xl text-gray-800 mb-6 font-semibold max-w-4xl mx-auto leading-relaxed">
              3000-word SEO masterpieces in 60 seconds.
            </p>
            <p className="text-xl md:text-2xl text-gray-700 mb-12 font-medium max-w-3xl mx-auto">
              While your competitors waste $500 per article, you're publishing unlimited content and dominating Page 1.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <a
                href="/auth/signup"
                className="group px-12 py-6 bg-gray-900 text-white rounded-2xl font-bold text-xl hover:bg-black transition-all shadow-2xl hover:shadow-3xl hover:scale-105 duration-300 inline-flex items-center"
              >
                Start Ranking Free
                <span className="inline-block ml-3 text-2xl group-hover:translate-x-2 transition-transform">→</span>
              </a>
              <a
                href="#features"
                className="px-12 py-6 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-gray-900 rounded-2xl font-bold text-xl hover:bg-white transition-all shadow-xl hover:shadow-2xl"
              >
                Watch Demo
              </a>
            </div>

            {/* 3D Mockup Card with Glassmorphism */}
            <div className="max-w-4xl mx-auto">
              <div className="relative transform hover:scale-105 transition-all duration-500" style={{
                transform: 'perspective(1000px) rotateX(2deg) rotateY(-2deg)',
              }}>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                }}>
                  <div className="p-8">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-8 w-32 bg-primary/20 rounded-lg"></div>
                        <div className="h-8 w-24 bg-primary rounded-lg"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-300/50 rounded w-full"></div>
                        <div className="h-4 bg-gray-300/50 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-300/50 rounded w-4/6"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-3xl font-black text-primary mb-1">10K+</div>
                        <div className="text-sm text-gray-600">Articles</div>
                      </div>
                      <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-3xl font-black text-primary mb-1">60s</div>
                        <div className="text-sm text-gray-600">Gen Time</div>
                      </div>
                      <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-3xl font-black text-primary mb-1">150+</div>
                        <div className="text-sm text-gray-600">Languages</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Features Section - Premium Cluely Style */}
      <div id="features" className="relative py-32 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Four ways we make<br/>your content better
            </h2>
            <p className="text-xl md:text-2xl text-gray-600">
              Everything you need to dominate search rankings
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Large Feature Card - Blue/Green Style */}
            <div className="md:col-span-2 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-[32px] blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-[#00AA45] via-[#00964D] to-[#008F4A] rounded-[28px] p-12 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-[100px]"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-8">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                    Generate 3000-word articles in 60 seconds
                  </h3>
                  <p className="text-white/90 text-xl leading-relaxed max-w-2xl">
                    No more waiting days for writers. Get SEO-optimized, long-form content instantly. Start ranking faster with automated content generation that actually works.
                  </p>
                </div>
              </div>
            </div>

            {/* Small Feature Cards */}
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />,
                title: '150+ Languages',
                desc: 'Create native-quality content in any language. Expand your global reach effortlessly with multilingual SEO content.'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
                title: 'Smart Scheduling',
                desc: 'Schedule articles for automatic publishing at the perfect time. Set your content calendar and forget it.'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                title: 'SEO Optimized',
                desc: 'Every article comes with proper structure, meta tags, and keyword optimization built-in automatically.'
              },
            ].map((feature, i) => (
              <div key={i} className="group">
                <div className="relative h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-gray-200 to-transparent rounded-[24px] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative h-full bg-white rounded-[22px] p-8 border border-gray-200/50 group-hover:border-primary/20 transition-all duration-300 hover:shadow-2xl">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/5 rounded-xl mb-6 group-hover:bg-primary/10 transition-colors">
                      <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {feature.icon}
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works - Modern 3-Step */}
      <div className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(#00AA45 1px, transparent 1px), linear-gradient(90deg, #00AA45 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Content in 3 steps
            </h2>
            <p className="text-xl md:text-2xl text-gray-600">
              From keyword to published article
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                num: '01',
                title: 'Enter Keyword',
                desc: 'Type in your target keyword or topic. No complex forms or configurations needed.'
              },
              {
                num: '02',
                title: 'Generate Article',
                desc: 'Watch as RankPulse creates a comprehensive, SEO-optimized article in just 60 seconds.'
              },
              {
                num: '03',
                title: 'Publish & Rank',
                desc: 'One-click publish to WordPress, schedule for later, or download. You\'re in complete control.'
              },
            ].map((step, i) => (
              <div key={i} className="group">
                <div className="relative">
                  {/* Number Circle */}
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>
                    <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl font-black text-white">{step.num}</span>
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="relative bg-white rounded-3xl p-8 border border-gray-200/50 group-hover:border-primary/20 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Connector Line (except last) */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials - Premium Cards */}
      <div className="relative py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Loved by thousands of<br/>content creators
            </h2>
            <p className="text-xl md:text-2xl text-gray-600">
              See what marketers are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'John Davis',
                role: 'SEO Consultant',
                text: 'RankPulse cut my content production costs by 90%. I went from paying $500 per article to unlimited content for $49/month. Absolute game-changer for my agency.',
                initials: 'JD'
              },
              {
                name: 'Sarah Mitchell',
                role: 'Marketing Director',
                text: 'I publish 20 articles per week now. Before RankPulse, I could barely manage 2. My organic traffic has tripled in just 3 months. Incredible ROI.',
                initials: 'SM'
              },
              {
                name: 'Mike Rodriguez',
                role: 'Freelance Blogger',
                text: 'The quality is insane. I edit maybe 10% of the content. The rest publishes as-is. My clients think I have a team of 10 writers working for me.',
                initials: 'MR'
              },
            ].map((testimonial, i) => (
              <div key={i} className="group">
                <div className="relative h-full">
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 to-transparent rounded-[28px] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative h-full bg-gradient-to-br from-gray-50/50 to-white rounded-[26px] p-8 border border-gray-200/70 group-hover:border-primary/20 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-gray-700 text-lg leading-relaxed mb-8">
                      "{testimonial.text}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center pt-6 border-t border-gray-200/50">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-black text-lg mr-4 shadow-lg">
                        {testimonial.initials}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-lg">{testimonial.name}</div>
                        <div className="text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA - Premium Style */}
      <div className="relative overflow-hidden py-40">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 30%, #a5d6a7 60%, #81c784 100%)',
        }}></div>

        {/* Mesh Blobs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px]" style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px]" style={{
          background: 'radial-gradient(circle, rgba(0,170,69,0.3) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}></div>

        <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
            Ready to dominate<br/>your niche?
          </h2>
          <p className="text-2xl md:text-3xl text-gray-800 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands who stopped paying writers and started ranking higher.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="/auth/signup"
              className="group relative px-14 py-7 bg-gray-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 inline-flex items-center"
            >
              Start Ranking Free
              <span className="inline-block ml-3 text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
              <div className="absolute -inset-1 bg-gray-900/20 rounded-2xl blur-xl -z-10"></div>
            </a>
          </div>

          <div className="flex items-center justify-center gap-8 mt-10 text-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-black mb-4" style={{color: '#00AA45'}}>RankPulse</h3>
              <p className="text-gray-400 text-lg mb-6">
                The fastest way to create SEO content that actually ranks.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-primary">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-primary">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 RankPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
