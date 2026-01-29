import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-gray-50">
            <div className="hidden lg:flex flex-col justify-center items-center bg-blue-600 text-white p-12">
                <div className="max-w-md text-center">
                    <h1 className="text-4xl font-bold mb-6">Modern Retail POS</h1>
                    <p className="text-blue-100 text-lg">Manage sales, inventory, and customers in one seamless platform.</p>
                </div>
            </div>

            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
