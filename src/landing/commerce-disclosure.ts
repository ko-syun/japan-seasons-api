/**
 * Commerce Disclosure page (特定商取引法に基づく表記)
 * Required for Stripe compliance in Japan
 */
export const commerceDisclosureHtml = `<!DOCTYPE html>
<html lang="ja" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>特定商取引法に基づく表記 | Japan Seasons API</title>
  <meta name="description" content="Japan Seasons APIの特定商取引法に基づく表記">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'sans-serif'] },
          colors: { sakura: '#F472B6' }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-gray-950 text-gray-100 antialiased min-h-screen">

  <!-- Nav -->
  <nav class="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur border-b border-gray-800/50">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <a href="/" class="font-semibold text-lg">🌸 Japan Seasons API</a>
      <div class="hidden md:flex items-center gap-6 text-sm text-gray-400">
        <a href="/" class="hover:text-white transition">Home</a>
        <a href="/dashboard" class="ml-2 px-4 py-1.5 bg-sakura/10 text-sakura rounded-lg hover:bg-sakura/20 transition font-medium">Dashboard</a>
      </div>
    </div>
  </nav>

  <!-- Content -->
  <main class="pt-24 pb-20 px-4">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold mb-8 text-center">特定商取引法に基づく表記</h1>
      
      <div class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table class="w-full text-left">
          <tbody class="divide-y divide-gray-800">
            <tr class="border-b border-gray-800">
              <th class="px-6 py-4 text-gray-400 font-medium w-1/3 bg-gray-900/50">販売業者</th>
              <td class="px-6 py-4">合同会社KoS（KoS LLC）</td>
            </tr>
            <tr class="border-b border-gray-800">
              <th class="px-6 py-4 text-gray-400 font-medium bg-gray-900/50">代表者</th>
              <td class="px-6 py-4">顧 俊（Gu Jun）</td>
            </tr>
            <tr class="border-b border-gray-800">
              <th class="px-6 py-4 text-gray-400 font-medium bg-gray-900/50">所在地</th>
              <td class="px-6 py-4">埼玉県川口市</td>
            </tr>
            <tr class="border-b border-gray-800">
              <th class="px-6 py-4 text-gray-400 font-medium bg-gray-900/50">連絡先</th>
              <td class="px-6 py-4">
                <a href="mailto:jun@dokos.dev" class="text-sakura hover:underline">jun@dokos.dev</a>
              </td>
            </tr>
            <tr class="border-b border-gray-800">
              <th class="px-6 py-4 text-gray-400 font-medium bg-gray-900/50">販売価格</th>
              <td class="px-6 py-4">
                <ul class="list-disc list-inside space-y-1">
                  <li>Free Tier: 無料（100リクエスト/日）</li>
                  <li>Pro Tier: 各プランの表示価格に準ずる</li>
                  <li>Pay-as-you-go: 従量課金（$0.001/リクエスト）</li>
                </ul>
              </td>
            </tr>
            <tr class="border-b border-gray-800">
              <th class="px-6 py-4 text-gray-400 font-medium bg-gray-900/50">支払い方法</th>
              <td class="px-6 py-4">クレジットカード（Stripe）</td>
            </tr>
            <tr class="border-b border-gray-800">
              <th class="px-6 py-4 text-gray-400 font-medium bg-gray-900/50">支払い時期</th>
              <td class="px-6 py-4">サブスクリプションの場合、毎月自動決済</td>
            </tr>
            <tr class="border-b border-gray-800">
              <th class="px-6 py-4 text-gray-400 font-medium bg-gray-900/50">サービスの提供時期</th>
              <td class="px-6 py-4">APIキー発行後、即時利用可能</td>
            </tr>
            <tr class="border-b border-gray-800">
              <th class="px-6 py-4 text-gray-400 font-medium bg-gray-900/50">キャンセル・返品</th>
              <td class="px-6 py-4">
                デジタルサービスの性質上、購入後の返金は原則としてお受けできません。<br>
                ただし、技術的な問題でサービスが利用できない場合は個別に対応いたします。<br>
                キャンセルはダッシュボードからいつでも可能です。
              </td>
            </tr>
            <tr>
              <th class="px-6 py-4 text-gray-400 font-medium bg-gray-900/50">特別な取引条件</th>
              <td class="px-6 py-4">
                無料トライアル期間終了後、自動的に有料プランに移行する場合があります。<br>
                料金変更の際は事前に通知いたします。
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-8 text-center">
        <a href="/" class="inline-block px-6 py-3 bg-gray-800 text-gray-200 font-semibold rounded-lg hover:bg-gray-700 transition border border-gray-700">
          ← Back to Home
        </a>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-gray-800 py-10 px-4">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
      <div class="flex items-center gap-4">
        <span>© 2025 KoS LLC</span>
        <a href="https://github.com/ko-syun/japan-seasons-api" class="hover:text-white transition" target="_blank" rel="noopener">GitHub</a>
      </div>
      <div class="flex items-center gap-4">
        <a href="/" class="hover:text-white transition">Home</a>
        <a href="/dashboard" class="hover:text-white transition">Dashboard</a>
      </div>
    </div>
  </footer>

</body>
</html>`;
