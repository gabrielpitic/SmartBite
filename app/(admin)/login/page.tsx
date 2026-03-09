import LoginForm from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/25 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-3 border border-white/30 shadow-inner">
            🍽️
          </div>
          <h1 className="text-2xl font-extrabold text-white">SmartBite</h1>
          <p className="text-white/70 text-sm mt-1">Restaurant Admin</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to manage your menu</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
