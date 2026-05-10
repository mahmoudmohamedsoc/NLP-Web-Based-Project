import React, { useState, useEffect } from 'react';

// ================= Custom SVG Icons (Modern & Sleek) =================
const Icons = {
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899 15.101 4M10 20l10.101-10.899"/></svg>
  ),
  Layout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
  ),
  Activity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  )
};

const SummarizerApp = () => {
  // ================= State Management =================
  const [inputText, setInputText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [summaryLength, setSummaryLength] = useState(3);
  const [selectedModel, setSelectedModel] = useState('Compare Both');
  const [activeTab, setActiveTab] = useState('Visual Comparison');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Results State
  const [tfidfOutput, setTfidfOutput] = useState('');
  const [transformerOutput, setTransformerOutput] = useState('');
  const [metrics, setMetrics] = useState({
    gen_time: '-',
    original_len: 0,
    summary_len: 0,
    compression_ratio: '-'
  });

  // ================= Handlers =================
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setWordCount(text.trim().split(/\s+/).filter((word) => word.length > 0).length);
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    
    // Smooth transition simulation for feelings
    setTfidfOutput('');
    setTransformerOutput('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    
    try {
        const response = await fetch(`${apiUrl}/summarize`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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
        alert("Error: " + data.detail);
        }
    } catch (error) {
        console.error("Connection failed:", error);
        alert(`Could not connect to API at ${apiUrl}`);
    } finally {
        setIsGenerating(false);
    }
  };

  // ================= Components =================
  const Card = ({ children, className = '', glow = false }) => (
    <div className={`
      relative bg-[#161a23]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 transition-all duration-300
      hover:border-white/10 group ${glow ? 'shadow-[0_0_80px_-20px_rgba(124,58,237,0.15)]' : ''}
      ${className}
    `}>
      {children}
    </div>
  );

  const AnalyticsCard = ({ title, value, icon: IconComponent, color = "text-purple-400" }) => (
    <Card className="flex-1 flex flex-col items-center justify-center text-center p-5 group hover:scale-[1.02] active:scale-[0.98] cursor-default">
      <div className={`${color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
        <IconComponent />
      </div>
      <div className="text-[#8e94a5] text-[10px] font-bold uppercase tracking-widest mb-1">{title}</div>
      <div className="text-white font-semibold text-lg">{value}</div>
    </Card>
  );

  return (
    <div className="flex h-screen bg-[#07090d] text-[#e2e8f0] font-[Inter] overflow-hidden selection:bg-purple-500/30">
      
      {/* ================= SIDEBAR ================= */}
      <div className="w-[280px] bg-[#0b0e14] border-r border-white/5 flex flex-col p-8 z-10">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Icons.Sparkles />
          </div>
          <div className="font-[Outfit] font-bold text-xl tracking-tight text-white">NLP_studio.</div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium border border-white/5 shadow-sm transition-all hover:bg-white/10">
            <Icons.Layout />
            Workspace
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71717a] hover:text-white hover:bg-white/5 transition-all">
            <Icons.Activity />
            Analytics
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71717a] hover:text-white hover:bg-white/5 transition-all">
            <Icons.Clock />
            Recent
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all active:scale-[0.97]">
            <span className="text-lg">+</span>
            New Session
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col overflow-y-auto md:overflow-hidden relative">
        {/* Background Gradients for Depth */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <header className="flex justify-between items-center px-10 py-8 z-10 shrink-0">
          <div>
            <h1 className="text-3xl font-[Outfit] font-bold text-white mb-1">AI Summarizer Pro</h1>
            <p className="text-[#71717a] text-sm">Professional NLP extraction and synthesis</p>
          </div>
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#71717a] hover:text-white hover:bg-white/10 transition-all"><Icons.Settings /></button>
            <div className="w-10 h-10 rounded-xl bg-[#1f2937] border border-white/10 flex items-center justify-center text-white font-bold ring-2 ring-purple-500/20">M</div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex flex-1 gap-8 px-10 pb-10 overflow-hidden z-10">
          
          {/* ========== LEFT PANEL (INPUT) ========== */}
          <div className="w-[38%] flex flex-col gap-6 shrink-0">
            
            {/* Input Card */}
            <Card className="flex-1 flex flex-col overflow-hidden" glow>
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <h2 className="text-white font-bold text-xs uppercase tracking-widest">Source Document</h2>
                </div>
                <div className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  {wordCount} Words
                </div>
              </div>
              <textarea
                className="flex-1 bg-transparent border-none resize-none outline-none text-[15px] leading-relaxed text-blue-50/90 placeholder-slate-600 scrollbar-hide"
                placeholder="Paste your professional transcript, research paper, or legal document here..."
                value={inputText}
                onChange={handleInputChange}
              />
            </Card>

            {/* Settings Card */}
            <Card className="p-6">
              <h2 className="text-white font-bold text-xs uppercase tracking-widest mb-5">Model Tuning</h2>
              <div className="flex gap-5">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-[#71717a] mb-2.5 uppercase tracking-widest">Sentences</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={summaryLength}
                    onChange={(e) => setSummaryLength(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all"
                  />
                </div>
                <div className="flex-[2.5]">
                  <label className="block text-[10px] font-bold text-[#71717a] mb-2.5 uppercase tracking-widest">Intelligence Layer</label>
                  <div className="relative">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="TF-IDF">TF-IDF Extraction</option>
                      <option value="Transformer">Transformer Abstractive</option>
                      <option value="Compare Both">Multi-Model Compare</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717a]">
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
              className={`
                group relative w-full py-4.5 rounded-2xl font-bold text-sm tracking-wide overflow-hidden transition-all duration-300
                ${isGenerating || !inputText.trim()
                  ? 'bg-white/5 text-slate-600 cursor-not-allowed grayscale'
                  : 'bg-white text-black hover:scale-[1.01] active:scale-[0.98] shadow-2xl shadow-white/5'}
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 transition-transform duration-500 ${isGenerating || !inputText.trim() ? 'translate-y-full' : 'translate-y-full group-hover:translate-y-0 opacity-10'}`} />
              <div className="flex items-center justify-center gap-3 relative z-10">
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                    Synthesizing Intelligence...
                  </>
                ) : (
                  <>
                    <Icons.Zap />
                    Execute Synthesis
                  </>
                )}
              </div>
            </button>
          </div>

          {/* ========== RIGHT PANEL (OUTPUT & METRICES) ========== */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            
            {/* Nav Tabs */}
            <div className="flex gap-8 border-b border-white/5 shrink-0">
              {['Visual Comparison', 'Performance Metrics'].map((tab) => (
                <button
                  key={tab}
                  className={`
                    flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-widest transition-all relative
                    ${activeTab === tab ? 'text-white' : 'text-[#71717a] hover:text-blue-200'}
                  `}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'Visual Comparison' ? <Icons.Layout /> : <Icons.Activity />}
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Output Display */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'Visual Comparison' ? (
                <div className="grid grid-cols-2 gap-6 h-full">
                  
                  {/* Extractive Card */}
                  {(selectedModel === 'Compare Both' || selectedModel === 'TF-IDF') && (
                    <Card key={tab} className={`flex flex-col ${selectedModel === 'TF-IDF' ? 'col-span-2' : 'col-span-2 lg:col-span-1'} border-white/5`}>
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Icons.Layout /></div>
                           <h3 className="text-white font-[Outfit] font-semibold text-lg">Extractive Summary</h3>
                        </div>
                        <button onClick={() => handleCopy(tfidfOutput)} className="p-2 hover:bg-white/5 rounded-lg text-[#71717a] hover:text-white transition-all"><Icons.Activity /></button>
                      </div>
                      <div className={`flex-1 text-[15px] leading-relaxed text-blue-50/70 overflow-y-auto pr-2 custom-scrollbar transition-opacity duration-700 ${!isGenerating && tfidfOutput ? 'opacity-100' : 'opacity-40'}`}>
                        {tfidfOutput || 'System idle. Waiting for document input...'}
                      </div>
                    </Card>
                  )}

                  {/* Abstractive Card */}
                  {(selectedModel === 'Compare Both' || selectedModel === 'Transformer') && (
                    <Card key="transformer" className={`flex flex-col ${selectedModel === 'Transformer' ? 'col-span-2' : 'col-span-2 lg:col-span-1'} border-purple-500/20`}>
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Icons.Sparkles /></div>
                           <h3 className="text-white font-[Outfit] font-semibold text-lg">Neural Synthesis</h3>
                        </div>
                        <button onClick={() => handleCopy(transformerOutput)} className="p-2 hover:bg-white/5 rounded-lg text-[#71717a] hover:text-white transition-all"><Icons.Activity /></button>
                      </div>
                      <div className={`flex-1 text-[15px] leading-relaxed text-purple-50/80 overflow-y-auto pr-2 custom-scrollbar transition-opacity duration-700 ${!isGenerating && transformerOutput ? 'opacity-100' : 'opacity-40'}`}>
                        {transformerOutput || 'BART architecture optimized. Awaiting document...'}
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                /* Metrics Visualization */
                <div className="h-full space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="hover:border-blue-500/20">
                      <div className="text-[10px] font-bold text-[#71717a] uppercase tracking-[0.2em] mb-2">Execution Pipeline</div>
                      <div className="text-2xl font-[Outfit] font-bold text-white mb-4">{metrics.gen_time}</div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[60%] shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                      </div>
                    </Card>
                    <Card className="hover:border-purple-500/20">
                      <div className="text-[10px] font-bold text-[#71717a] uppercase tracking-[0.2em] mb-2">Compression Density</div>
                      <div className="text-2xl font-[Outfit] font-bold text-white mb-4">{metrics.compression_ratio}</div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[85%] shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                      </div>
                    </Card>
                  </div>
                  
                  <Card className="flex-1">
                    <div className="flex items-center gap-2 mb-6">
                      <Icons.Activity />
                      <h3 className="text-white font-bold text-sm uppercase tracking-widest">Diagnostic Detail</h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'Original Payload', value: `${metrics.original_len} chars` },
                        { label: 'Synthesized Length', value: `${metrics.summary_len} chars` },
                        { label: 'Inference Confidence', value: 'High' },
                        { label: 'Architecture', value: 'BART + LoRA' }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-[#71717a] text-sm">{item.label}</span>
                          <span className="text-white font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Bottom Real-time Analytics Cards */}
            <div className="flex gap-4 h-[120px] shrink-0">
              <AnalyticsCard icon={Icons.Activity} title="Gen Time" value={metrics.gen_time} color="text-blue-400" />
              <AnalyticsCard icon={Icons.Zap} title="Efficiency" value={metrics.compression_ratio} color="text-amber-400" />
              <AnalyticsCard icon={Icons.Check} title="State" value={isGenerating ? "Synthesizing..." : (transformerOutput ? "Verified" : "Standby")} color="text-emerald-400" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarizerApp;