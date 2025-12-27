/**
 * Premium Design Templates
 * Hand-crafted, production-ready templates inspired by Dribbble/Behance
 */

const premiumTemplates = {
  saas: {
    name: "Modern SaaS Landing Page",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Premium SaaS Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', sans-serif; }
        
        /* Gradient Mesh Background */
        .gradient-mesh {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: relative;
            overflow: hidden;
        }
        
        .gradient-mesh::before {
            content: '';
            position: absolute;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255, 135, 135, 0.3), transparent 50%),
                        radial-gradient(circle at 40% 20%, rgba(99, 102, 241, 0.3), transparent 50%);
            animation: mesh-move 20s ease-in-out infinite;
        }
        
        @keyframes mesh-move {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-50px, -50px) rotate(180deg); }
        }
        
        /* Glass Card */
        .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .glass-card:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-10px);
            box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
        }
        
        /* Premium Button */
        .btn-premium {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: all 0.3s ease;
        }
        
        .btn-premium::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
        }
        
        .btn-premium:hover::before {
            left: 100%;
        }
        
        .btn-premium:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.5);
        }
        
        /* Floating Animation */
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        .float {
            animation: float 6s ease-in-out infinite;
        }
        
        /* Bento Grid */
        .bento-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 1.5rem;
        }
        
        .bento-item-1 { grid-column: span 3; grid-row: span 2; }
        .bento-item-2 { grid-column: span 3; grid-row: span 1; }
        .bento-item-3 { grid-column: span 2; grid-row: span 1; }
        .bento-item-4 { grid-column: span 2; grid-row: span 1; }
        .bento-item-5 { grid-column: span 2; grid-row: span 1; }
        
        @media (max-width: 768px) {
            .bento-grid { grid-template-columns: 1fr; }
            .bento-item-1, .bento-item-2, .bento-item-3, .bento-item-4, .bento-item-5 {
                grid-column: span 1;
                grid-row: span 1;
            }
        }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <!-- Hero Section -->
    <section class="gradient-mesh min-h-screen flex items-center justify-center relative">
        <div class="max-w-7xl mx-auto px-4 py-20 relative z-10">
            <div class="text-center">
                <h1 class="text-7xl md:text-9xl font-black mb-6 leading-tight">
                    Build Better<br>
                    <span class="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                        Products Faster
                    </span>
                </h1>
                <p class="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto">
                    The all-in-one platform for modern teams to collaborate, build, and ship amazing products.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button class="btn-premium px-8 py-4 rounded-2xl text-lg font-semibold text-white">
                        Start Free Trial
                    </button>
                    <button class="px-8 py-4 rounded-2xl text-lg font-semibold border-2 border-white/30 hover:bg-white/10 transition-all">
                        Watch Demo
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Bento Grid -->
    <section class="py-32 bg-gray-900">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="text-5xl font-black mb-16 text-center">
                Everything you need to <span class="text-purple-500">succeed</span>
            </h2>
            
            <div class="bento-grid">
                <div class="bento-item-1 glass-card rounded-3xl p-8 transition-all duration-500">
                    <div class="text-6xl mb-4">⚡</div>
                    <h3 class="text-3xl font-bold mb-4">Lightning Fast</h3>
                    <p class="text-gray-300 text-lg">Built for speed with cutting-edge technology that delivers results in milliseconds.</p>
                </div>
                
                <div class="bento-item-2 glass-card rounded-3xl p-8 transition-all duration-500">
                    <div class="text-5xl mb-4">🔒</div>
                    <h3 class="text-2xl font-bold mb-3">Enterprise Security</h3>
                    <p class="text-gray-300">Bank-level encryption and compliance.</p>
                </div>
                
                <div class="bento-item-3 glass-card rounded-3xl p-8 transition-all duration-500">
                    <div class="text-5xl mb-4">🎨</div>
                    <h3 class="text-2xl font-bold mb-3">Beautiful Design</h3>
                    <p class="text-gray-300">Pixel-perfect interfaces.</p>
                </div>
                
                <div class="bento-item-4 glass-card rounded-3xl p-8 transition-all duration-500">
                    <div class="text-5xl mb-4">📊</div>
                    <h3 class="text-2xl font-bold mb-3">Real-time Analytics</h3>
                    <p class="text-gray-300">Track everything that matters.</p>
                </div>
                
                <div class="bento-item-5 glass-card rounded-3xl p-8 transition-all duration-500">
                    <div class="text-5xl mb-4">🚀</div>
                    <h3 class="text-2xl font-bold mb-3">Deploy Instantly</h3>
                    <p class="text-gray-300">One-click deployments.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing -->
    <section class="py-32 bg-black">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="text-5xl font-black mb-16 text-center">
                Simple, <span class="text-purple-500">transparent</span> pricing
            </h2>
            
            <div class="grid md:grid-cols-3 gap-8">
                <!-- Starter -->
                <div class="glass-card rounded-3xl p-8 transition-all duration-500">
                    <h3 class="text-2xl font-bold mb-4">Starter</h3>
                    <div class="mb-6">
                        <span class="text-5xl font-black">$29</span>
                        <span class="text-gray-400">/month</span>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center"><span class="mr-2">✓</span> Up to 10 projects</li>
                        <li class="flex items-center"><span class="mr-2">✓</span> 5GB storage</li>
                        <li class="flex items-center"><span class="mr-2">✓</span> Basic support</li>
                    </ul>
                    <button class="w-full py-3 rounded-xl border-2 border-purple-500 hover:bg-purple-500 transition-all">
                        Get Started
                    </button>
                </div>
                
                <!-- Pro (Featured) -->
                <div class="glass-card rounded-3xl p-8 transition-all duration-500 scale-105 border-2 border-purple-500">
                    <div class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm inline-block mb-4">Most Popular</div>
                    <h3 class="text-2xl font-bold mb-4">Pro</h3>
                    <div class="mb-6">
                        <span class="text-5xl font-black">$99</span>
                        <span class="text-gray-400">/month</span>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center"><span class="mr-2">✓</span> Unlimited projects</li>
                        <li class="flex items-center"><span class="mr-2">✓</span> 100GB storage</li>
                        <li class="flex items-center"><span class="mr-2">✓</span> Priority support</li>
                        <li class="flex items-center"><span class="mr-2">✓</span> Advanced analytics</li>
                    </ul>
                    <button class="btn-premium w-full py-3 rounded-xl">
                        Get Started
                    </button>
                </div>
                
                <!-- Enterprise -->
                <div class="glass-card rounded-3xl p-8 transition-all duration-500">
                    <h3 class="text-2xl font-bold mb-4">Enterprise</h3>
                    <div class="mb-6">
                        <span class="text-5xl font-black">Custom</span>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center"><span class="mr-2">✓</span> Everything in Pro</li>
                        <li class="flex items-center"><span class="mr-2">✓</span> Unlimited storage</li>
                        <li class="flex items-center"><span class="mr-2">✓</span> 24/7 support</li>
                        <li class="flex items-center"><span class="mr-2">✓</span> Custom integrations</li>
                    </ul>
                    <button class="w-full py-3 rounded-xl border-2 border-purple-500 hover:bg-purple-500 transition-all">
                        Contact Sales
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-16 bg-gray-950">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="text-gray-400">© 2024 Premium SaaS. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`
  }
};

module.exports = { premiumTemplates };
