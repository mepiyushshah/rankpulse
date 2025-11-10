'use client';

import { useEffect, useRef } from 'react';

export default function Home() {
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = noiseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set a much smaller canvas size for better performance
    const scale = 0.25; // Use 25% of the actual size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    let animationId: number;
    let frameCount = 0;
    const animate = () => {
      // Only update every 3 frames for better performance
      frameCount++;
      if (frameCount % 3 !== 0) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
        data[i + 3] = 4;
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
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center">
              <span className="text-xl font-semibold bg-gradient-to-r from-[#00D154] to-[#00AA45] bg-clip-text text-transparent" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              }}>
                RankPulse
              </span>
            </a>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-700 hover:text-gray-900 transition-colors" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontWeight: 500,
              }}>
                Features
              </a>
              <a href="#pricing" className="text-sm text-gray-700 hover:text-gray-900 transition-colors" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontWeight: 500,
              }}>
                Pricing
              </a>
              <a href="/auth/login" className="text-sm text-gray-700 hover:text-gray-900 transition-colors" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontWeight: 500,
              }}>
                Log in
              </a>
              <a
                href="/auth/signup"
                className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-black transition-all"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontWeight: 500,
                }}
              >
                Get Started
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Fits in First Fold */}
      <div className="relative overflow-hidden h-screen flex items-center justify-center pt-16" style={{
        background: 'linear-gradient(to bottom, #d4edda 0%, #e8f5e9 30%, #f1f8f4 60%, #ffffff 100%)',
      }}>
        {/* Noise Texture */}
        <canvas
          ref={noiseCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.02] mix-blend-overlay"
        />

        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 w-full">
          <div className="text-center">
            {/* Main Heading - Clean & Bold */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1] tracking-[-0.04em] mb-6 font-semibold">
              <span className="block text-gray-900 mb-2 whitespace-nowrap" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                fontWeight: 600,
              }}>
                Fire Your Content Writer.
              </span>
              <span className="block bg-gradient-to-r from-[#00D154] via-[#00AA45] to-[#008837] bg-clip-text text-transparent whitespace-nowrap" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                fontWeight: 600,
              }}>
                Hire RankPulse.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 mb-10 font-normal tracking-tight leading-snug max-w-3xl mx-auto" style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontWeight: 400,
            }}>
              3000-word SEO masterpieces in 60 seconds.<br/>
              <span className="text-gray-500 text-lg sm:text-xl md:text-2xl">While your competitors waste $500 per article.</span>
            </p>

            {/* CTA Buttons - Minimal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <a
                href="/auth/signup"
                className="group px-8 py-4 bg-gray-900 text-white rounded-full font-medium text-base transition-all duration-200 inline-flex items-center hover:bg-black"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontWeight: 500,
                }}
              >
                Start Ranking Free
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#features"
                className="px-8 py-4 text-gray-700 font-medium text-base hover:text-gray-900 transition-colors"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontWeight: 500,
                }}
              >
                Watch Demo
              </a>
            </div>

            {/* Simple Stats - No Boxes */}
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-semibold bg-gradient-to-br from-[#00D154] to-[#00AA45] bg-clip-text text-transparent mb-1" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                }}>
                  10K+
                </div>
                <div className="text-gray-500 text-xs tracking-wide" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}>
                  Articles Generated
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-semibold bg-gradient-to-br from-[#00D154] to-[#00AA45] bg-clip-text text-transparent mb-1" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                }}>
                  60s
                </div>
                <div className="text-gray-500 text-xs tracking-wide" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}>
                  Generation Time
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-semibold bg-gradient-to-br from-[#00D154] to-[#00AA45] bg-clip-text text-transparent mb-1" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                }}>
                  150+
                </div>
                <div className="text-gray-500 text-xs tracking-wide" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}>
                  Languages
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Modern Grid */}
      <div id="features" className="relative pt-20 pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl md:text-7xl text-gray-900 mb-5 leading-tight tracking-[-0.02em] font-semibold" style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontWeight: 600,
            }}>
              Everything you need.<br/>Nothing you don't.
            </h2>
          </div>

          {/* Modern Feature Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 - Large Card */}
            <div className="md:col-span-2 group relative">
              <div className="relative h-full bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-12 md:p-16 overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                    fontWeight: 600,
                  }}>
                    Lightning Fast Generation
                  </h3>
                  <p className="text-white/90 text-xl md:text-2xl leading-relaxed max-w-3xl" style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  }}>
                    Generate 3000-word SEO-optimized articles in 60 seconds. No more waiting days for writers.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="relative h-full bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-gray-200">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-6">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  fontWeight: 600,
                }}>
                  150+ Languages
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}>
                  Create native-quality content in any language. Expand your global reach effortlessly.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="relative h-full bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-gray-200">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-6">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  fontWeight: 600,
                }}>
                  Smart Scheduling
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}>
                  Schedule articles for automatic publishing. Set your content calendar and forget it.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group">
              <div className="relative h-full bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-gray-200">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-6">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  fontWeight: 600,
                }}>
                  SEO Optimized
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}>
                  Every article comes with proper structure, meta tags, and keyword optimization built-in.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group">
              <div className="relative h-full bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-gray-200">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-6">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  fontWeight: 600,
                }}>
                  Full Customization
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}>
                  Edit, refine, and customize every article with our powerful built-in editor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Minimal */}
      <div className="relative py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl md:text-7xl text-gray-900 mb-5 leading-tight tracking-[-0.02em] font-semibold" style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontWeight: 600,
            }}>
              Three simple steps
            </h2>
          </div>

          <div className="space-y-12">
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
              <div key={i} className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
                    <span className="text-xl font-semibold text-white" style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                    }}>
                      {step.num}
                    </span>
                  </div>
                </div>
                <div className="flex-grow pt-2">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2" style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                    fontWeight: 600,
                  }}>
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed" style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials - Clean */}
      <div className="relative py-32 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl md:text-7xl text-gray-900 mb-5 leading-tight tracking-[-0.02em] font-semibold" style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontWeight: 600,
            }}>
              Loved by thousands
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                name: 'John Davis',
                role: 'SEO Consultant',
                text: 'RankPulse cut my content production costs by 90%. I went from paying $500 per article to unlimited content.',
              },
              {
                name: 'Sarah Mitchell',
                role: 'Marketing Director',
                text: 'I publish 20 articles per week now. Before RankPulse, I could barely manage 2. My organic traffic has tripled.',
              },
              {
                name: 'Mike Rodriguez',
                role: 'Freelance Blogger',
                text: 'The quality is insane. I edit maybe 10% of the content. The rest publishes as-is.',
              },
            ].map((testimonial, i) => (
              <div key={i}>
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#00AA45] fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 text-base leading-relaxed mb-6" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}>
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="font-semibold text-gray-900 text-sm" style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  }}>
                    {testimonial.name}
                  </div>
                  <div className="text-gray-500 text-sm" style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  }}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA - Minimal */}
      <div className="relative overflow-hidden py-40 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-5xl sm:text-6xl md:text-7xl text-gray-900 mb-6 leading-tight tracking-[-0.02em] font-semibold" style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            fontWeight: 600,
          }}>
            Ready to dominate your niche?
          </h2>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed" style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
          }}>
            Join thousands who stopped paying writers and started ranking higher.
          </p>

          <a
            href="/auth/signup"
            className="group inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-full font-medium text-base transition-all duration-200 hover:bg-black"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontWeight: 500,
            }}
          >
            Start Ranking Free
            <svg className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-500 text-sm mt-8" style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
          }}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Minimal */}
      <footer className="bg-white border-t border-gray-100 text-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-[#00D154] to-[#00AA45] bg-clip-text text-transparent" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              }}>
                RankPulse
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}>
                SEO content that ranks.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-gray-900 text-sm" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}>
                Product
              </h4>
              <ul className="space-y-2 text-gray-600 text-sm" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-gray-900 text-sm" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}>
                Company
              </h4>
              <ul className="space-y-2 text-gray-600 text-sm" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}>
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-gray-900 text-sm" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}>
                Legal
              </h4>
              <ul className="space-y-2 text-gray-600 text-sm" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 text-center text-gray-400 text-xs" style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
          }}>
            <p>&copy; 2025 RankPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
