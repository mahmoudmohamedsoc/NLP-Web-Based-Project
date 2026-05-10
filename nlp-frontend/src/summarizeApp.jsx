import React, { useState, useEffect } from 'react';

// ================= ICONS (CUSTOM SVGs) =================
const Icons = {
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="m5 3 1 1" /><path d="m19 21 1 1" /><path d="m5 21 1-1" /><path d="m19 3 1-1" /></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.5a3.5 3.5 0 1 1 5.34-2.852" /><path d="M15.5 20a3.5 3.5 0 1 1-2.852-5.34" /><path d="M20 9.5a3.5 3.5 0 1 1-5.34 2.852" /><path d="M8.5 4a3.5 3.5 0 1 1 2.852 5.34" /><line x1="12" y1="12" x2="12" y2="12.01" /></svg>
  ),
  Layout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
  ),
  Activity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0L6.41 10.54a2 2 0 0 1-1.93 1.46H2" /></svg>
  ),
  Copy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
  )
};

// ================= REUSABLE COMPONENTS =================
const Button = ({ children, onClick, variant = 'primary', className = '', isLoading = false, disabled = false }) => {
  const base = "px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#f97316] text-white hover:bg-[#ea580c] shadow-lg shadow-orange-500/20",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-600 hover:text-[#f97316]"
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
    >
      {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

// ================= APPLICATION =================
export default function App() {
  const [view, setView] = useState('home'); // home, tool, about
  const [inputText, setInputText] = useState('');
  const [summaryLength, setSummaryLength] = useState(3);
  const [selectedModel, setSelectedModel] = useState('Compare Both');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tfidfOutput, setTfidfOutput] = useState('');
  const [transformerOutput, setTransformerOutput] = useState('');
  const [metrics, setMetrics] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const handleGenerate = async () => {
    if (!inputText.trim()) return alert("Please enter some text!");
    setIsGenerating(true);
    setTfidfOutput('');
    setTransformerOutput('');

    try {
      const response = await fetch(`${apiUrl}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          num_sentences: summaryLength,
          summary_mode: selectedModel === 'Compare Both' ? 'both' : (selectedModel === 'TF-IDF Extraction' ? 'tfidf' : 'transformer')
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setTfidfOutput(data.tfidf_summary);
        setTransformerOutput(data.transformer_summary);
        setMetrics(data.metrics);
      } else {
        alert("API Error: " + data.detail);
      }
    } catch (error) {
      alert("Connection failed. Ensure the backend is running!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // ================= RENDER SECTIONS =================

  const Header = () => (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
        <div className="w-10 h-10 bg-[#f97316] rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <Icons.Sparkles />
        </div>
        <span className="text-xl font-[Outfit] font-bold text-gray-900 tracking-tight">Summarize<span className="text-[#f97316]">Studio</span></span>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <button onClick={() => setView('home')} className={`font-semibold transition-colors ${view === 'home' ? 'text-[#f97316]' : 'text-gray-600 hover:text-gray-900'}`}>Home</button>
        <button onClick={() => setView('tool')} className={`font-semibold transition-colors ${view === 'tool' ? 'text-[#f97316]' : 'text-gray-600 hover:text-gray-900'}`}>The Tool</button>
        <button onClick={() => setView('about')} className={`font-semibold transition-colors ${view === 'about' ? 'text-[#f97316]' : 'text-gray-600 hover:text-gray-900'}`}>Technologies</button>
      </nav>

      <Button variant="primary" onClick={() => setView('tool')} className="scale-90 md:scale-100">Get Started</Button>
    </header>
  );

  const HomeSection = () => (
    <section className="pt-40 pb-20 px-6 md:px-10 w-full flex flex-col items-center text-center bg-[#f9fafb]">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-[#f97316] text-sm font-bold mb-8 animate-bounce">
        <Icons.Zap /> Next-Gen AI Summarization
      </div>
      <h1 className="text-5xl md:text-7xl font-[Outfit] font-extrabold text-gray-900 mb-6 leading-tight max-w-4xl">
        Turn long documents into <br /> <span className="text-[#f97316]">concise insights.</span>
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-3xl font-medium text-center my-2">
        Professional NLP extraction and synthesis using state-of-the-art <br /> weights and TF-IDF logic. Built for speed and precision.
      </p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <Button onClick={() => setView('tool')} className="w-full md:w-auto text-lg px-10">Start Summarizing</Button>
        <Button onClick={() => setView('about')} variant="secondary" className="w-full md:w-auto text-lg px-10">Learn How it Works</Button>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <Card className="hover:border-orange-200 transition-colors">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-[#f97316] mb-4">
            <Icons.Activity />
          </div>
          <h3 className="text-xl font-bold mb-2">Real-time Metrics</h3>
          <p className="text-gray-600">Track generation speed and compression ratios instantly as you work.</p>
        </Card>
        <Card className="hover:border-blue-200 transition-colors">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
            <Icons.Layout />
          </div>
          <h3 className="text-xl font-bold mb-2">Dual Algorithms</h3>
          <p className="text-gray-600">Switch between Extractive extraction and Abstractive synthesis with one click.</p>
        </Card>
        <Card className="hover:border-purple-200 transition-colors">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
            <Icons.Sparkles />
          </div>
          <h3 className="text-xl font-bold mb-2">BART Optimized</h3>
          <p className="text-gray-600">Powered by fine-tuned neural weights for human-like summary quality.</p>
        </Card>
      </div>
    </section>
  );

  const ToolSection = () => (
    <section className="pt-32 pb-20 px-6 md:px-10 w-full bg-[#f9fafb]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-[Outfit] font-bold">Source Document</h2>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{inputText.split(/\s+/).filter(Boolean).length} Words</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your research, transcript, or article here..."
              className="w-full h-80 bg-gray-50 border-none rounded-xl p-5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none font-medium mb-6"
            />

            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-gray-500 mb-3 block">Target Sentences: {summaryLength}</label>
                <input
                  type="range" min="1" max="10"
                  value={summaryLength}
                  onChange={(e) => setSummaryLength(parseInt(e.target.value))}
                  className="w-full accent-[#f97316] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-500 mb-3 block">Intelligence Layer</label>
                <div className="grid grid-cols-3 gap-2">
                  {['TF-IDF Extraction', 'Transformer', 'Compare Both'].map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedModel(m)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${selectedModel === m ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                isLoading={isGenerating}
                className="w-full py-4 text-lg"
              >
                Execute Synthesis
              </Button>

              <Button
                variant="ghost"
                onClick={() => { setInputText(''); setTfidfOutput(''); setTransformerOutput(''); setMetrics(null); }}
                className="w-full text-sm py-2"
              >
                Clear Workspace
              </Button>
            </div>
          </Card>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 space-y-6">

          {/* Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Gen Time', value: metrics?.gen_time || '-', icon: <Icons.Activity /> },
              { label: 'Words', value: metrics?.summary_len || '0', icon: <Icons.Layout /> },
              { label: 'Ratio', value: metrics?.compression_ratio || '0%', icon: <Icons.Zap /> },
              { label: 'Status', value: isGenerating ? 'Active' : 'Standby', icon: <Icons.Check /> }
            ].map((m, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="text-[#f97316]">{m.icon}</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{m.label}</p>
                  <p className="text-sm font-bold text-gray-900">{m.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
            {/* Result Card: TF-IDF */}
            {(selectedModel === 'Compare Both' || selectedModel === 'TF-IDF Extraction') && (
              <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col ${selectedModel === 'TF-IDF Extraction' ? 'md:col-span-2' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Icons.Layout /></span>
                    Extractive Summary
                  </h3>
                  {tfidfOutput && <button onClick={() => handleCopy(tfidfOutput)} className="text-gray-400 hover:text-[#f97316] transition-colors"><Icons.Copy /></button>}
                </div>
                <div className="flex-1 overflow-y-auto text-gray-600 leading-relaxed text-sm scrollbar-hide">
                  {isGenerating ? 'Computing sentences...' : (tfidfOutput || 'Awaiting input synthesis...')}
                </div>
              </div>
            )}

            {/* Result Card: Transformer */}
            {(selectedModel === 'Compare Both' || selectedModel === 'Transformer') && (
              <div className={`bg-white rounded-2xl border border-orange-100 shadow-sm p-6 flex flex-col ${selectedModel === 'Transformer' ? 'md:col-span-2' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="p-2 bg-orange-50 text-[#f97316] rounded-lg"><Icons.Sparkles /></span>
                    Neural Synthesis
                  </h3>
                  {transformerOutput && <button onClick={() => handleCopy(transformerOutput)} className="text-gray-400 hover:text-[#f97316] transition-colors"><Icons.Copy /></button>}
                </div>
                <div className="flex-1 overflow-y-auto text-gray-600 leading-relaxed text-sm scrollbar-hide">
                  {isGenerating ? 'Generating tokens...' : (transformerOutput || 'Neural network ready.')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const AboutSection = () => (
    <section className="pt-32 pb-20 px-6 md:px-20 w-full bg-[#f9fafb]">
      <h2 className="text-4xl font-[Outfit] font-bold mb-8">Our Core Technologies</h2>
      <div className="space-y-8">
        <div className="flex gap-6">
          <div className="flex-shrink-0 w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl">01</div>
          <div>
            <h3 className="text-xl font-bold mb-2">TF-IDF Vectorization</h3>
            <p className="text-gray-600 leading-relaxed">
              Term Frequency-Inverse Document Frequency is a statistical measure used to evaluate how important a word is to a document. Our engine identifies high-value sentences by calculating their relative importance within the text structure.
            </p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex-shrink-0 w-16 h-16 bg-orange-50 text-[#f97316] rounded-2xl flex items-center justify-center font-bold text-2xl">02</div>
          <div>
            <h3 className="text-xl font-bold mb-2">BART (Bidirectional Auto-Regressive Transformers)</h3>
            <p className="text-gray-600 leading-relaxed">
              Our neural summarization uses a fine-tuned BART model optimized with LoRA adapters. Unlike extraction, this model "reads" the whole text and regenerates it from scratch, providing human-like summaries that are grammatically coherent.
            </p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex-shrink-0 w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold text-2xl">03</div>
          <div>
            <h3 className="text-xl font-bold mb-2">Railway Optimized Infrastructure</h3>
            <p className="text-gray-600 leading-relaxed">
              The backend is served via FastAPI on Railway's containerized infrastructure, ensuring minimal latency and high availability for AI inference.
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const Footer = () => (
    <footer className="bg-gray-50 border-t border-gray-100 py-12 px-6 md:px-10">
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center text-white text-xs">
            <Icons.Sparkles />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">SummarizeStudio.</span>
        </div>
        <p className="text-sm text-gray-500 font-medium tracking-wide">© 2026 NLP Web-Based Project. All rights reserved.</p>
        <div className="flex gap-6">
          <button onClick={() => setView('home')} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Home</button>
          <button onClick={() => setView('tool')} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Workspace</button>
          <button onClick={() => setView('about')} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Privacy</button>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-[#f9fafb] font-[Inter]">
      <Header />
      <main className="transition-all duration-500">
        {view === 'home' && <HomeSection />}
        {view === 'tool' && <ToolSection />}
        {view === 'about' && <AboutSection />}
      </main>
      <Footer />
    </div>
  );
}