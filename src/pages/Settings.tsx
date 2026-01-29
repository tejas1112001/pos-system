import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Store, Users, Save, CheckCircle2 } from 'lucide-react';
import { MOCK_USERS } from '../services/mockData';
import { cn } from '../utils/cn';
import { useSettingsStore, type Settings } from '../store/useSettingsStore';
import { useForm, type SubmitHandler } from 'react-hook-form';

const StoreSettings = () => {
    const { settings, updateSettings } = useSettingsStore();
    const [saved, setSaved] = useState(false);

    const { register, handleSubmit, reset } = useForm({
        defaultValues: settings
    });

    useEffect(() => {
        reset(settings);
    }, [settings, reset]);

    const onSave: SubmitHandler<Settings> = (data) => {
        updateSettings(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <form onSubmit={handleSubmit(onSave)} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Store Name" {...register('storeName')} placeholder="My Awesome Shop" />
                <Input label="Currency Symbol" {...register('currency')} placeholder="$" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Store Address" {...register('storeAddress')} placeholder="123 Street, City" />
                <Input label="Contact Phone" {...register('storePhone')} placeholder="+1 234..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Tax Rate (%)" type="number" step="0.1" {...register('taxRate', { valueAsNumber: true })} />
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400">Receipt Branding</h4>
                <Input label="Receipt Header Notice" {...register('receiptHeader')} />
                <Input label="Receipt Footer Notice" {...register('receiptFooter')} />
            </div>

            <div className="pt-4 flex items-center gap-4">
                <Button type="submit" size="lg" className="px-8 flex items-center gap-2">
                    {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? 'Settings Saved' : 'Save Configurations'}
                </Button>
                {saved && (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium animate-in fade-in duration-300">
                        Changes applied globally across POS
                    </span>
                )}
            </div>
        </form>
    );
};

const UserSettings = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium dark:text-gray-200">Team Members</h3>
            <Button size="sm" variant="outline">+ Add Member</Button>
        </div>

        <div className="grid gap-4">
            {MOCK_USERS.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-white dark:bg-gray-600" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="capitalize px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                            {user.role}
                        </span>
                        <Button size="sm" variant="ghost">Edit</Button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'store' | 'users'>('store');

    const tabs = [
        { id: 'store', label: 'Store Configuration', icon: Store },
        { id: 'users', label: 'Team Management', icon: Users },
    ];

    return (
        <div className="max-w-6xl mx-auto py-4">
            <h1 className="text-3xl font-bold mb-6 dark:text-gray-100">System Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Sidebar Navigation */}
                <Card className="col-span-12 md:col-span-3 h-fit border-none bg-transparent shadow-none">
                    <div className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'store' | 'users')}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all",
                                    activeTab === tab.id
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Content Area */}
                <div className="col-span-12 md:col-span-9">
                    <Card className="shadow-lg border-gray-100 dark:border-gray-700/50">
                        <CardHeader className="border-b dark:border-gray-700/50 py-4">
                            <CardTitle className="text-xl">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {activeTab === 'store' ? <StoreSettings /> : <UserSettings />}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
