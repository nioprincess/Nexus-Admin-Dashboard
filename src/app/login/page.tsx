'use client'
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';
export default function LoginPage() {
    // const router = useRouter();
    const SigIn = () => {
        redirect('/dashboard');
    }
    return (
        <div>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                  <div className="text-center mb-8">
    <h1 className="text-3xl font-bold text-blueColor">NEXUS APP</h1>
  </div>
                <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-xl shadow-gray-400">
                    
                    <div className="center">
                       
                        <div className="text-center">
  <span className="text-gray-600 font-semibold">
    Welcome Back!!{' '}
    <span className="font-semibold text-blueColor">to Nexus App</span>
  </span>
  <p className="text-gray-600 mt-1">Sign in now!!</p>
</div>
                        <p className="text-gray-600"></p>
                    </div>

                    <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email or username</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 bg-gray-200 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email or username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 bg-gray-200 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blueColor hover:text-blue-500">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              onClick={SigIn}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-blueColor hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-greenColor hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <img className="h-5 w-5 mr-2" src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" alt="Google logo" />
              Sign in with Google
            </button>
          </div>
        </div>


                </div>
            </div>
        </div>
    )
}