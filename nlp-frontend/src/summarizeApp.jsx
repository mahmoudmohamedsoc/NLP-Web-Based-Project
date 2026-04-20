import React, { useState, useEffect } from 'react';

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

  // ================= Handlers =================
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setWordCount(text.trim().split(/\s+/).filter((word) => word.length > 0).length);
  };

    const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    
    try {
        const response = await fetch('http://127.0.0.1:8000/summarize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: inputText,
            num_sentences: summaryLength
        }),
        });

        const data = await response.json();

        if (response.ok) {
        setTfidfOutput(data.tfidf_summary);
        setTransformerOutput(data.transformer_summary);
        // يمكنك هنا تحديث حالة الـ metrics بناءً على data.metrics
        } else {
        alert("Error: " + data.detail);
        }
    } catch (error) {
        console.error("Connection failed:", error);
        alert("Could not connect to Python API.");
    } finally {
        setIsGenerating(false);
    }
    };
  // ================= Components =================
  const Card = ({ children, className = '' }) => (
    <div className={`bg-[#161922] border border-[#222630] rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );

  const AnalyticsCard = ({ title, value, icon }) => (
    <Card className="flex-1 flex flex-col items-center justify-center text-center p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-[#6C7281] text-xs mb-1">{title}</div>
      <div className="text-white font-bold text-sm">{value}</div>
    </Card>
  );

  return (
    <div className="flex h-screen bg-[#0B0E14] text-[#EAEAEA] font-sans overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <div className="w-[240px] bg-[#0B0E14] border-r border-[#222630] flex flex-col p-6">
        <div className="text-white text-lg font-bold mb-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">🔮</div>
          NLP_home
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <button className="text-left px-4 py-2.5 rounded-lg bg-[#1F232C] text-white font-medium">
            🖥️ Workspace
          </button>
          <button className="text-left px-4 py-2.5 rounded-lg text-[#6C7281] hover:bg-[#1F232C] hover:text-white transition-colors">
            📊 Analytics
          </button>
          <button className="text-left px-4 py-2.5 rounded-lg text-[#6C7281] hover:bg-[#1F232C] hover:text-white transition-colors">
            🕒 History
          </button>
          <button className="text-left px-4 py-2.5 rounded-lg text-[#6C7281] hover:bg-[#1F232C] hover:text-white transition-colors">
            ⚙️ Settings
          </button>
        </nav>

        <button className="mt-auto bg-[#2F3647] text-white py-3 rounded-xl font-bold hover:bg-[#3f475c] transition-colors">
          + New Summary
        </button>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center p-8 pb-4">
          <h1 className="text-2xl font-bold text-white">NLP Summarizer Tool</h1>
          <div className="flex gap-4 text-xl">
            <button className="text-[#6C7281] hover:text-white">⚙️</button>
            <button className="text-[#6C7281] hover:text-white">❓</button>
            <button className="text-[#6C7281] hover:text-white">👤</button>
          </div>
        </header>

        {/* Content Splitter */}
        <div className="flex flex-1 gap-6 p-8 pt-0">
          
          {/* ========== LEFT PANEL (INPUT) ========== */}
          <div className="w-1/3 flex flex-col gap-5 border-r border-[#222630] pr-6">
            
            {/* Original Text Card */}
            <Card className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white font-bold text-sm">Original Text</h2>
                <span className="text-[#6C7281] text-xs bg-[#1F232C] px-2 py-1 rounded-md">{wordCount} Words</span>
              </div>
              <textarea
                className="flex-1 bg-transparent border-none resize-none outline-none text-sm leading-relaxed text-[#EAEAEA] placeholder-[#6C7281]"
                placeholder="Paste your professional transcript, research paper, or legal document here..."
                value={inputText}
                onChange={handleInputChange}
              />
            </Card>

            {/* Settings Card */}
            <Card>
              <h2 className="text-white font-bold text-sm mb-4">Summary Settings</h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-[#6C7281] mb-2 uppercase">Length (Sentences)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={summaryLength}
                    onChange={(e) => setSummaryLength(e.target.value)}
                    className="w-full bg-[#1F232C] border border-[#2A2F3D] rounded-lg p-2.5 text-white outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="flex-[2]">
                  <label className="block text-[10px] font-bold text-[#6C7281] mb-2 uppercase">Model Selection</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#1F232C] border border-[#2A2F3D] rounded-lg p-2.5 text-white outline-none focus:border-purple-500 transition-colors appearance-none"
                  >
                    <option value="TF-IDF">TF-IDF Extraction</option>
                    <option value="Transformer">Transformer Abstractive</option>
                    <option value="Compare Both">Compare Both</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
                isGenerating || !inputText.trim()
                  ? 'bg-[#3f2a5e] text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
              }`}
            >
              {isGenerating ? '⏳ Processing & Evaluating...' : 'Generate & Evaluate ⚡'}
            </button>
          </div>

          {/* ========== RIGHT PANEL (OUTPUT & METRICS) ========== */}
          <div className="flex-1 flex flex-col gap-5">
            
            {/* Tabs */}
            <div className="flex gap-6 border-b border-[#222630] pb-2">
              <button
                className={`font-bold pb-2 border-b-2 transition-colors ${
                  activeTab === 'Visual Comparison' ? 'border-purple-500 text-white' : 'border-transparent text-[#6C7281] hover:text-white'
                }`}
                onClick={() => setActiveTab('Visual Comparison')}
              >
                👁️ Visual Comparison
              </button>
              <button
                className={`font-bold pb-2 border-b-2 transition-colors ${
                  activeTab === 'Performance Metrics' ? 'border-purple-500 text-white' : 'border-transparent text-[#6C7281] hover:text-white'
                }`}
                onClick={() => setActiveTab('Performance Metrics')}
              >
                📊 Performance Metrics
              </button>
            </div>

            {/* Output Area */}
            {activeTab === 'Visual Comparison' ? (
              <div className="flex-1 flex gap-4">
                
                {/* TF-IDF Output */}
                {(selectedModel === 'Compare Both' || selectedModel === 'TF-IDF') && (
                  <Card className={`flex-1 flex flex-col transition-all duration-500 ${tfidfOutput ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'} ${selectedModel === 'TF-IDF' ? 'border-purple-500 border-2' : ''}`}>
                    <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      TF-IDF Extraction
                    </h3>
                    <div className="flex-1 text-sm leading-relaxed text-gray-300 overflow-y-auto italic">
                      {tfidfOutput || 'Awaiting generation...'}
                    </div>
                  </Card>
                )}

                {/* Transformer Output */}
                {(selectedModel === 'Compare Both' || selectedModel === 'Transformer') && (
                  <Card className={`flex-1 flex flex-col transition-all duration-500 ${transformerOutput ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'} ${selectedModel === 'Transformer' ? 'border-purple-500 border-2' : ''}`}>
                    <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]"></span>
                      Neural Transformer (BERT)
                    </h3>
                    <div className="flex-1 text-sm leading-relaxed text-gray-300 overflow-y-auto">
                      {transformerOutput || 'Awaiting generation...'}
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              // Metrics Table (Placeholder)
              <Card className="flex-1">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="border-b border-[#2A2F3D] text-[#6C7281] text-xs uppercase">
                    <tr>
                      <th className="py-3">Metric</th>
                      <th className="py-3">TF-IDF Model</th>
                      <th className="py-3">Transformer Model</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#2A2F3D]/50">
                      <td className="py-3">Generation Time</td>
                      <td className="py-3">0.045 sec</td>
                      <td className="py-3">1.204 sec</td>
                    </tr>
                    <tr className="border-b border-[#2A2F3D]/50">
                      <td className="py-3">Compression Ratio</td>
                      <td className="py-3">65.2%</td>
                      <td className="py-3">68.1%</td>
                    </tr>
                    <tr>
                      <td className="py-3">ROUGE-1 Score</td>
                      <td className="py-3 text-green-400">0.45</td>
                      <td className="py-3 text-green-400">0.58</td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            )}

            {/* Bottom Analytics Cards */}
            <div className="flex gap-4 mt-auto">
              <AnalyticsCard icon="✨" title="AI INSIGHT" value={transformerOutput ? "Intent preserved 94%" : "-"} />
              <AnalyticsCard icon="⏱️" title="THROUGHPUT" value={transformerOutput ? "420 tokens / sec" : "-"} />
              <AnalyticsCard icon="✅" title="EXPORT STATUS" value={transformerOutput ? "Ready for Export" : "Waiting"} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarizerApp;