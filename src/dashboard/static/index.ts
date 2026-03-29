/**
 * Dashboard static HTML — exported as a string.
 * Single-page app with embedded CSS/JS. Tailwind via CDN.
 */
export const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Japan Seasons API — Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .page { display: none; }
    .page.active { display: block; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
      <a href="/dashboard" class="text-xl font-bold text-pink-600">🌸 Japan Seasons API</a>
      <div id="nav-links" class="space-x-4 hidden">
        <button onclick="showPage('dashboard')" class="text-gray-600 hover:text-pink-600">Dashboard</button>
        <button onclick="showPage('pricing')" class="text-gray-600 hover:text-pink-600">Pricing</button>
        <button onclick="logout()" class="text-red-500 hover:text-red-700">Logout</button>
      </div>
    </div>
  </nav>

  <main class="max-w-4xl mx-auto px-4 py-8">
    <!-- Auth Page -->
    <div id="page-auth" class="page active">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 id="auth-title" class="text-2xl font-bold mb-6 text-center">Sign In</h2>
          <div id="auth-error" class="bg-red-50 text-red-600 p-3 rounded mb-4 hidden"></div>
          <form id="auth-form" onsubmit="handleAuth(event)">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="auth-email" required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none">
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" id="auth-password" required minlength="8"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none">
            </div>
            <button type="submit" id="auth-submit"
              class="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 font-medium">
              Sign In
            </button>
          </form>
          <p class="mt-4 text-center text-sm text-gray-500">
            <span id="auth-toggle-text">Don't have an account?</span>
            <button onclick="toggleAuthMode()" class="text-pink-600 hover:underline ml-1" id="auth-toggle-btn">Sign Up</button>
          </p>
        </div>
      </div>
    </div>

    <!-- Dashboard Page -->
    <div id="page-dashboard" class="page">
      <div class="fade-in">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">API Keys</h2>
          <div class="flex items-center gap-3">
            <span id="user-tier" class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"></span>
            <button onclick="createKey()" class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 text-sm">
              + New Key
            </button>
          </div>
        </div>

        <!-- New key display -->
        <div id="new-key-alert" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 hidden">
          <p class="text-sm text-green-800 font-medium mb-1">🔑 New API Key Created — Copy it now! It won't be shown again.</p>
          <code id="new-key-value" class="block bg-white border rounded p-2 text-sm font-mono break-all"></code>
          <button onclick="copyKey()" class="mt-2 text-sm text-green-700 hover:underline">📋 Copy to clipboard</button>
        </div>

        <div id="keys-list" class="space-y-3 mb-8"></div>

        <!-- Usage -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">Usage</h3>
          <div id="usage-info" class="text-gray-600"></div>
        </div>
      </div>
    </div>

    <!-- Pricing Page -->
    <div id="page-pricing" class="page">
      <div class="fade-in">
        <h2 class="text-2xl font-bold mb-6 text-center">Pricing</h2>
        <div class="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div class="bg-white rounded-lg shadow p-6 border-2 border-gray-100">
            <h3 class="text-lg font-bold">Free</h3>
            <p class="text-3xl font-bold my-3">$0<span class="text-sm text-gray-400">/mo</span></p>
            <ul class="text-sm text-gray-600 space-y-2 mb-6">
              <li>✓ 100 requests/day</li>
              <li>✓ Current year data</li>
              <li>✓ 2 API keys</li>
              <li>✓ All basic endpoints</li>
            </ul>
            <span class="block text-center text-gray-400 text-sm">Current plan</span>
          </div>
          <div class="bg-white rounded-lg shadow p-6 border-2 border-pink-400 relative">
            <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-600 text-white text-xs px-3 py-1 rounded-full">Popular</span>
            <h3 class="text-lg font-bold">Pro</h3>
            <p class="text-3xl font-bold my-3">$29<span class="text-sm text-gray-400">/mo</span></p>
            <ul class="text-sm text-gray-600 space-y-2 mb-6">
              <li>✓ 10,000 requests/day</li>
              <li>✓ Historical data</li>
              <li>✓ 10 API keys</li>
              <li>✓ Recommend endpoint</li>
              <li>✓ Priority support</li>
            </ul>
            <button onclick="upgradeToPro()" id="upgrade-btn"
              class="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 font-medium text-sm">
              Upgrade to Pro
            </button>
          </div>
          <div class="bg-white rounded-lg shadow p-6 border-2 border-gray-100">
            <h3 class="text-lg font-bold">Enterprise</h3>
            <p class="text-3xl font-bold my-3">Custom</p>
            <ul class="text-sm text-gray-600 space-y-2 mb-6">
              <li>✓ 100,000 requests/day</li>
              <li>✓ SLA guarantee</li>
              <li>✓ Unlimited API keys</li>
              <li>✓ Dedicated support</li>
              <li>✓ Custom integrations</li>
            </ul>
            <a href="mailto:contact@japanseasons.com"
              class="block text-center w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm">
              Contact Us
            </a>
          </div>
        </div>
        <div id="portal-link" class="text-center mt-6 hidden">
          <button onclick="openPortal()" class="text-pink-600 hover:underline text-sm">
            Manage subscription →
          </button>
        </div>
      </div>
    </div>
  </main>

  <script>
    // ── State ──
    let authMode = 'login';
    let token = localStorage.getItem('jsapi_token');
    let currentUser = null;

    // ── Init ──
    if (token) {
      showPage('dashboard');
      loadDashboard();
    }

    // Handle checkout redirect
    const params = new URLSearchParams(location.search);
    if (params.get('checkout') === 'success') {
      history.replaceState({}, '', '/dashboard');
      if (token) {
        showPage('dashboard');
        loadDashboard();
      }
    }

    // ── Navigation ──
    function showPage(name) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const page = document.getElementById('page-' + name);
      if (page) page.classList.add('active');
      document.getElementById('nav-links').classList.toggle('hidden', name === 'auth');
    }

    // ── Auth ──
    function toggleAuthMode() {
      authMode = authMode === 'login' ? 'signup' : 'login';
      document.getElementById('auth-title').textContent = authMode === 'login' ? 'Sign In' : 'Sign Up';
      document.getElementById('auth-submit').textContent = authMode === 'login' ? 'Sign In' : 'Sign Up';
      document.getElementById('auth-toggle-text').textContent =
        authMode === 'login' ? "Don't have an account?" : 'Already have an account?';
      document.getElementById('auth-toggle-btn').textContent =
        authMode === 'login' ? 'Sign Up' : 'Sign In';
      document.getElementById('auth-error').classList.add('hidden');
    }

    async function handleAuth(e) {
      e.preventDefault();
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;
      const errorEl = document.getElementById('auth-error');
      errorEl.classList.add('hidden');

      try {
        const res = await fetch('/dashboard/api/' + authMode, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          errorEl.textContent = data.error?.message || 'Something went wrong';
          errorEl.classList.remove('hidden');
          return;
        }
        token = data.data.token;
        currentUser = data.data.user;
        localStorage.setItem('jsapi_token', token);
        showPage('dashboard');
        loadDashboard();
      } catch (err) {
        errorEl.textContent = 'Network error. Please try again.';
        errorEl.classList.remove('hidden');
      }
    }

    function logout() {
      token = null;
      currentUser = null;
      localStorage.removeItem('jsapi_token');
      showPage('auth');
    }

    // ── Dashboard ──
    async function apiFetch(path, options = {}) {
      const res = await fetch('/dashboard' + path, {
        ...options,
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      if (res.status === 401) {
        logout();
        return null;
      }
      return res.json();
    }

    async function loadDashboard() {
      // Load keys
      const keysData = await apiFetch('/api/keys');
      if (!keysData) return;
      renderKeys(keysData.data.keys);

      // Load usage
      const usageData = await apiFetch('/api/usage');
      if (usageData) {
        const u = usageData.data;
        document.getElementById('user-tier').textContent = u.tier.toUpperCase();
        document.getElementById('user-tier').className =
          'px-3 py-1 rounded-full text-sm font-medium ' +
          (u.tier === 'pro' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700');
        document.getElementById('usage-info').innerHTML =
          '<p><strong>Tier:</strong> ' + u.tier +
          '</p><p><strong>Active keys:</strong> ' + u.keys_active +
          '</p><p><strong>Rate limit:</strong> ' + u.rate_limit.toLocaleString() + ' ' + u.unit + '</p>';

        // Show portal link if pro
        if (u.tier === 'pro') {
          document.getElementById('portal-link').classList.remove('hidden');
          document.getElementById('upgrade-btn').textContent = 'Current Plan';
          document.getElementById('upgrade-btn').disabled = true;
          document.getElementById('upgrade-btn').classList.add('opacity-50');
        }
      }
    }

    function renderKeys(keys) {
      const list = document.getElementById('keys-list');
      if (keys.length === 0) {
        list.innerHTML = '<div class="bg-white rounded-lg shadow p-6 text-center text-gray-500">No API keys yet. Create one to get started!</div>';
        return;
      }
      list.innerHTML = keys.map(k =>
        '<div class="bg-white rounded-lg shadow p-4 flex justify-between items-center">' +
        '  <div>' +
        '    <span class="font-medium">' + escapeHtml(k.name) + '</span>' +
        '    <span class="ml-2 text-xs px-2 py-0.5 rounded-full ' +
             (k.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') + '">' +
             (k.is_active ? 'Active' : 'Revoked') + '</span>' +
        '    <span class="ml-2 text-xs text-gray-400">' + k.tier + '</span>' +
        '    <p class="text-xs text-gray-400 mt-1">Created: ' + new Date(k.created_at).toLocaleDateString() +
             (k.last_used_at ? ' · Last used: ' + new Date(k.last_used_at).toLocaleDateString() : '') + '</p>' +
        '  </div>' +
        (k.is_active ?
          '  <button onclick="revokeKey(\\'' + k.id + '\\')" class="text-red-500 hover:text-red-700 text-sm">Revoke</button>' :
          '') +
        '</div>'
      ).join('');
    }

    async function createKey() {
      const name = prompt('Key name (optional):', 'default');
      if (name === null) return;
      const data = await apiFetch('/api/keys', {
        method: 'POST',
        body: JSON.stringify({ name: name || 'default' }),
      });
      if (!data) return;
      if (data.error) {
        alert(data.error.message);
        return;
      }
      // Show the key
      document.getElementById('new-key-value').textContent = data.data.key;
      document.getElementById('new-key-alert').classList.remove('hidden');
      loadDashboard();
    }

    function copyKey() {
      const key = document.getElementById('new-key-value').textContent;
      navigator.clipboard.writeText(key);
    }

    async function revokeKey(id) {
      if (!confirm('Revoke this API key? This cannot be undone.')) return;
      await apiFetch('/api/keys/' + id, { method: 'DELETE' });
      document.getElementById('new-key-alert').classList.add('hidden');
      loadDashboard();
    }

    // ── Billing ──
    async function upgradeToPro() {
      const data = await apiFetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (!data) return;
      if (data.error) {
        alert(data.error.message);
        return;
      }
      window.location.href = data.data.url;
    }

    async function openPortal() {
      const data = await apiFetch('/api/portal', { method: 'POST' });
      if (!data) return;
      if (data.error) {
        alert(data.error.message);
        return;
      }
      window.location.href = data.data.url;
    }

    // ── Util ──
    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
