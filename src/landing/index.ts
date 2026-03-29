/**
 * Landing page static HTML — exported as a string.
 * Single-page with embedded CSS/JS. Tailwind via CDN.
 */
export const landingHtml = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Japan Seasons API — Cherry Blossoms, Autumn Foliage &amp; Festivals</title>
  <meta name="description" content="REST API for Japanese seasonal data: cherry blossom forecasts, autumn foliage tracking, and festival listings. Built for AI agents and developers.">
  <meta property="og:title" content="Japan Seasons API">
  <meta property="og:description" content="Cherry blossoms, autumn foliage &amp; festivals — one API for AI agents and developers">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://jpseasons.dokos.dev">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Japan Seasons API">
  <meta name="twitter:description" content="Cherry blossoms, autumn foliage &amp; festivals — one API for AI agents and developers">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
          colors: { sakura: '#F472B6', autumn: '#FB923C', matsuri: '#EF4444' }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Inter', sans-serif; }
    code, pre { font-family: 'JetBrains Mono', monospace; }
    .tab-btn.active { border-color: #F472B6; color: #F472B6; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .gradient-text { background: linear-gradient(135deg, #F472B6, #FB923C, #EF4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    .float { animation: float 3s ease-in-out infinite; }
  </style>
</head>
<body class="bg-gray-950 text-gray-100 antialiased">

  <!-- Nav -->
  <nav class="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur border-b border-gray-800/50">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <a href="/" class="font-semibold text-lg">🌸 Japan Seasons API</a>
      <div class="hidden md:flex items-center gap-6 text-sm text-gray-400">
        <a href="#features" class="hover:text-white transition">Features</a>
        <a href="#docs" class="hover:text-white transition">Docs</a>
        <a href="#mcp" class="hover:text-white transition">MCP</a>
        <a href="#pricing" class="hover:text-white transition">Pricing</a>
        <a href="/dashboard" class="ml-2 px-4 py-1.5 bg-sakura/10 text-sakura rounded-lg hover:bg-sakura/20 transition font-medium">Dashboard</a>
      </div>
      <button id="mobile-toggle" class="md:hidden text-gray-400 hover:text-white">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
    <div id="mobile-menu" class="hidden md:hidden border-t border-gray-800 bg-gray-950/95 px-4 pb-4 text-sm">
      <a href="#features" class="block py-2 text-gray-400 hover:text-white">Features</a>
      <a href="#docs" class="block py-2 text-gray-400 hover:text-white">Docs</a>
      <a href="#mcp" class="block py-2 text-gray-400 hover:text-white">MCP</a>
      <a href="#pricing" class="block py-2 text-gray-400 hover:text-white">Pricing</a>
      <a href="/dashboard" class="block py-2 text-sakura font-medium">Dashboard →</a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="relative pt-32 pb-20 px-4 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-sakura/5 via-transparent to-transparent pointer-events-none"></div>
    <div class="max-w-4xl mx-auto text-center relative">
      <div class="text-5xl mb-6 float">🌸 🍁 🏮</div>
      <h1 class="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
        <span class="gradient-text">Japan Seasons API</span>
      </h1>
      <p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
        Cherry blossoms, autumn foliage &amp; festivals — one API for AI agents and developers
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center mb-12">
        <a href="/dashboard" class="px-6 py-3 bg-sakura text-white font-semibold rounded-lg hover:bg-pink-500 transition shadow-lg shadow-sakura/20">
          Get Free API Key
        </a>
        <a href="#docs" class="px-6 py-3 bg-gray-800 text-gray-200 font-semibold rounded-lg hover:bg-gray-700 transition border border-gray-700">
          View Docs
        </a>
      </div>
      <div class="max-w-2xl mx-auto text-left">
        <div class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800 bg-gray-900/50">
            <span class="w-3 h-3 rounded-full bg-red-500/60"></span>
            <span class="w-3 h-3 rounded-full bg-yellow-500/60"></span>
            <span class="w-3 h-3 rounded-full bg-green-500/60"></span>
            <span class="ml-2 text-xs text-gray-500 font-mono">Terminal</span>
          </div>
          <pre class="p-4 text-sm overflow-x-auto"><code class="text-gray-300"><span class="text-green-400">$</span> curl https://jpseasons.dokos.dev/v1/sakura/status?station=tokyo

<span class="text-gray-500">{</span>
  <span class="text-sakura">"station"</span>: <span class="text-autumn">"Tokyo"</span>,
  <span class="text-sakura">"status"</span>: <span class="text-autumn">"full_bloom"</span>,
  <span class="text-sakura">"date"</span>: <span class="text-autumn">"2025-03-26"</span>,
  <span class="text-sakura">"species"</span>: <span class="text-autumn">"Somei-Yoshino"</span>
<span class="text-gray-500">}</span></code></pre>
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section id="features" class="py-20 px-4">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-4">Three APIs, One Endpoint</h2>
      <p class="text-gray-400 text-center mb-12 max-w-xl mx-auto">Comprehensive seasonal data for Japan, updated daily from official sources.</p>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-sakura/30 transition group">
          <div class="text-4xl mb-4">🌸</div>
          <h3 class="text-xl font-semibold mb-2 group-hover:text-sakura transition">Sakura</h3>
          <p class="text-gray-400 text-sm leading-relaxed">57 observation stations across Japan. 73 years of historical bloom data. Real-time status &amp; forecasts from JMA.</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-xs px-2 py-1 rounded bg-sakura/10 text-sakura">Status</span>
            <span class="text-xs px-2 py-1 rounded bg-sakura/10 text-sakura">Forecast</span>
            <span class="text-xs px-2 py-1 rounded bg-sakura/10 text-sakura">Historical</span>
            <span class="text-xs px-2 py-1 rounded bg-sakura/10 text-sakura">Recommend</span>
          </div>
        </div>
        <div class="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-autumn/30 transition group">
          <div class="text-4xl mb-4">🍁</div>
          <h3 class="text-xl font-semibold mb-2 group-hover:text-autumn transition">Kouyou</h3>
          <p class="text-gray-400 text-sm leading-relaxed">53 stations tracking autumn foliage across Japan. Color-change status, peak dates, and seasonal recommendations.</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-xs px-2 py-1 rounded bg-autumn/10 text-autumn">Status</span>
            <span class="text-xs px-2 py-1 rounded bg-autumn/10 text-autumn">Forecast</span>
            <span class="text-xs px-2 py-1 rounded bg-autumn/10 text-autumn">Historical</span>
            <span class="text-xs px-2 py-1 rounded bg-autumn/10 text-autumn">Recommend</span>
          </div>
        </div>
        <div class="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-matsuri/30 transition group">
          <div class="text-4xl mb-4">🏮</div>
          <h3 class="text-xl font-semibold mb-2 group-hover:text-matsuri transition">Matsuri</h3>
          <p class="text-gray-400 text-sm leading-relaxed">50+ curated Japanese festivals. Search by region, month, or keyword. Rich metadata including locations &amp; dates.</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-xs px-2 py-1 rounded bg-matsuri/10 text-matsuri">Search</span>
            <span class="text-xs px-2 py-1 rounded bg-matsuri/10 text-matsuri">By Region</span>
            <span class="text-xs px-2 py-1 rounded bg-matsuri/10 text-matsuri">By Month</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Code Examples -->
  <section id="docs" class="py-20 px-4 bg-gray-900/30">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-4">Quick Start</h2>
      <p class="text-gray-400 text-center mb-10">Get started in seconds. No SDK required.</p>
      <div class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div class="flex border-b border-gray-800">
          <button class="tab-btn active px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white transition" data-tab="curl">cURL</button>
          <button class="tab-btn px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white transition" data-tab="js">JavaScript</button>
          <button class="tab-btn px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white transition" data-tab="python">Python</button>
        </div>
        <div class="tab-content active" data-tab="curl">
          <pre class="p-5 text-sm overflow-x-auto"><code class="text-gray-300"><span class="text-gray-500"># Get sakura bloom status</span>
<span class="text-green-400">$</span> curl -H "Authorization: Bearer YOUR_API_KEY" \\
    "https://jpseasons.dokos.dev/v1/sakura/status?station=tokyo"

<span class="text-gray-500"># Search festivals in Kyoto</span>
<span class="text-green-400">$</span> curl -H "Authorization: Bearer YOUR_API_KEY" \\
    "https://jpseasons.dokos.dev/v1/matsuri?region=kinki"

<span class="text-gray-500"># Get kouyou forecast</span>
<span class="text-green-400">$</span> curl -H "Authorization: Bearer YOUR_API_KEY" \\
    "https://jpseasons.dokos.dev/v1/kouyou/forecast?station=nikko"</code></pre>
        </div>
        <div class="tab-content" data-tab="js">
          <pre class="p-5 text-sm overflow-x-auto"><code class="text-gray-300"><span class="text-purple-400">const</span> response = <span class="text-purple-400">await</span> <span class="text-blue-400">fetch</span>(
  <span class="text-autumn">"https://jpseasons.dokos.dev/v1/sakura/status?station=tokyo"</span>,
  {
    headers: {
      <span class="text-autumn">"Authorization"</span>: <span class="text-autumn">\`Bearer \${API_KEY}\`</span>
    }
  }
);

<span class="text-purple-400">const</span> data = <span class="text-purple-400">await</span> response.<span class="text-blue-400">json</span>();
console.<span class="text-blue-400">log</span>(data.station);  <span class="text-gray-500">// "Tokyo"</span>
console.<span class="text-blue-400">log</span>(data.status);   <span class="text-gray-500">// "full_bloom"</span></code></pre>
        </div>
        <div class="tab-content" data-tab="python">
          <pre class="p-5 text-sm overflow-x-auto"><code class="text-gray-300"><span class="text-purple-400">import</span> requests

response = requests.<span class="text-blue-400">get</span>(
    <span class="text-autumn">"https://jpseasons.dokos.dev/v1/sakura/status"</span>,
    params={<span class="text-autumn">"station"</span>: <span class="text-autumn">"tokyo"</span>},
    headers={<span class="text-autumn">"Authorization"</span>: <span class="text-autumn">f"Bearer {API_KEY}"</span>}
)

data = response.<span class="text-blue-400">json</span>()
<span class="text-blue-400">print</span>(data[<span class="text-autumn">"station"</span>])  <span class="text-gray-500"># Tokyo</span>
<span class="text-blue-400">print</span>(data[<span class="text-autumn">"status"</span>])   <span class="text-gray-500"># full_bloom</span></code></pre>
        </div>
      </div>
    </div>
  </section>

  <!-- MCP -->
  <section id="mcp" class="py-20 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-10">
        <span class="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 font-medium uppercase tracking-wider">AI-Native</span>
        <h2 class="text-3xl font-bold mt-4 mb-4">Works with AI Agents</h2>
        <p class="text-gray-400 max-w-xl mx-auto">Connect via Model Context Protocol (MCP). 10 built-in tools for sakura, kouyou, and matsuri data — ready for Claude, GPT, and any MCP-compatible agent.</p>
      </div>
      <div class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800">
          <span class="text-xs text-gray-500 font-mono">claude_desktop_config.json</span>
        </div>
        <pre class="p-5 text-sm overflow-x-auto"><code class="text-gray-300">{
  <span class="text-sakura">"mcpServers"</span>: {
    <span class="text-sakura">"japan-seasons"</span>: {
      <span class="text-sakura">"url"</span>: <span class="text-autumn">"https://jpseasons.dokos.dev/mcp"</span>,
      <span class="text-sakura">"headers"</span>: {
        <span class="text-sakura">"Authorization"</span>: <span class="text-autumn">"Bearer YOUR_API_KEY"</span>
      }
    }
  }
}</code></pre>
      </div>
      <div class="mt-6 grid sm:grid-cols-2 gap-4">
        <div class="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
          <h4 class="font-medium mb-2 text-sm">Available Tools</h4>
          <ul class="text-xs text-gray-400 space-y-1">
            <li>🌸 get_sakura_status · get_sakura_forecast</li>
            <li>🌸 get_sakura_historical · get_sakura_locations</li>
            <li>🍁 get_kouyou_status · get_kouyou_forecast</li>
            <li>🍁 get_kouyou_locations</li>
            <li>🏮 search_matsuri · get_matsuri_by_region</li>
            <li>📍 recommend_spots</li>
          </ul>
        </div>
        <div class="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
          <h4 class="font-medium mb-2 text-sm">Example Prompts</h4>
          <ul class="text-xs text-gray-400 space-y-1.5">
            <li>"When will cherry blossoms bloom in Tokyo?"</li>
            <li>"What festivals are happening in Kyoto in July?"</li>
            <li>"Show me autumn foliage spots near Nikko"</li>
            <li>"Compare sakura bloom dates over the last 10 years"</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section id="pricing" class="py-20 px-4 bg-gray-900/30">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
      <p class="text-gray-400 text-center mb-12">Start free. Scale when you need to.</p>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 class="font-semibold text-lg mb-1">Free</h3>
          <div class="text-3xl font-bold mb-4">$0<span class="text-sm font-normal text-gray-500">/mo</span></div>
          <ul class="text-sm text-gray-400 space-y-2.5 mb-6">
            <li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">✓</span> 100 requests / day</li>
            <li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">✓</span> Current year data</li>
            <li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">✓</span> All basic endpoints</li>
            <li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">✓</span> MCP access</li>
          </ul>
          <a href="/dashboard" class="block text-center py-2.5 rounded-lg border border-gray-700 text-sm font-medium hover:bg-gray-800 transition">Start Free</a>
        </div>
        <div class="bg-gray-900 rounded-xl border-2 border-sakura/50 p-6 relative">
          <span class="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 bg-sakura text-white rounded-full font-medium">Popular</span>
          <h3 class="font-semibold text-lg mb-1">Pro</h3>
          <div class="text-3xl font-bold mb-4">$29<span class="text-sm font-normal text-gray-500">/mo</span></div>
          <ul class="text-sm text-gray-400 space-y-2.5 mb-6">
            <li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">✓</span> 10,000 requests / day</li>
            <li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">✓</span> 73 years historical data</li>
            <li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">✓</span> Webhooks</li>
            <li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">✓</span> Priority MCP</li>
          </ul>
          <a href="/dashboard" class="block text-center py-2.5 rounded-lg bg-sakura text-white text-sm font-medium hover:bg-pink-500 transition shadow-lg shadow-sakura/20">Get Pro</a>
        </div>
        <div class="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 class="font-semibold text-lg mb-1">Enterprise</h3>
          <div class="text-3xl font-bold mb-4">Custom</div>
          <ul class="text-sm text-gray-400 space-y-2.5 mb-6">
            <li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">✓</span> 100,000+ requests / day</li>
            <li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">✓</span> SLA guarantee</li>
            <li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">✓</span> Priority support</li>
            <li class="flex items-start gap-2"><span class="text-green-400 mt-0.5">✓</span> Custom integrations</li>
          </ul>
          <a href="mailto:hello@dokos.dev" class="block text-center py-2.5 rounded-lg border border-gray-700 text-sm font-medium hover:bg-gray-800 transition">Contact Us</a>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-20 px-4">
    <div class="max-w-2xl mx-auto text-center">
      <h2 class="text-3xl font-bold mb-4">Ready to get started?</h2>
      <p class="text-gray-400 mb-8">Create a free API key in 30 seconds. No credit card required.</p>
      <a href="/dashboard" class="inline-block px-8 py-3 bg-sakura text-white font-semibold rounded-lg hover:bg-pink-500 transition shadow-lg shadow-sakura/20">
        Get Your API Key →
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-gray-800 py-10 px-4">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
      <div class="flex items-center gap-4">
        <span>© 2025 KoS LLC</span>
        <a href="https://github.com/ko-syun/japan-seasons-api" class="hover:text-white transition" target="_blank" rel="noopener">GitHub</a>
        <a href="/health" class="hover:text-white transition">API Status</a>
      </div>
      <div class="flex items-center gap-4">
        <a href="/dashboard" class="hover:text-white transition">Dashboard</a>
        <a href="#docs" class="hover:text-white transition">Docs</a>
        <span class="text-gray-700">•</span>
        <span>Built with Cloudflare Workers</span>
      </div>
    </div>
  </footer>

  <script>
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.querySelector('.tab-content[data-tab="' + tab + '"]').classList.add('active');
      });
    });
    // Mobile menu
    document.getElementById('mobile-toggle').addEventListener('click', () => {
      document.getElementById('mobile-menu').classList.toggle('hidden');
    });
    // Close mobile menu on link click
    document.querySelectorAll('#mobile-menu a').forEach(a => {
      a.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.add('hidden');
      });
    });
  </script>
</body>
</html>`;
