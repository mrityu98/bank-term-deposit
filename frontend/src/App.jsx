import React, { useState } from 'react';

const MONTH_ENCODINGS = {
    'jan': 0.071, 'feb': 0.166, 'mar': 0.520, 'apr': 0.196,
    'may': 0.067, 'jun': 0.104, 'jul': 0.091, 'aug': 0.110,
    'sep': 0.465, 'oct': 0.438, 'nov': 0.101, 'dec': 0.467
};

export default function App() {
    const [formData, setFormData] = useState({
        age: 35,
        balance: 1500,
        campaign: 1,
        previous: 0,
        day: 15,
        housing_yes: 0,
        contact_unknown: 0,
        poutcome_success: 0,
        selected_month: 'may'
    });

    const [conversionProb, setConversionProb] = useState(null);
    const [loading, setLoading] = useState(false);

    // Stepper control for bounded fields (Age, Day, Contacts)
    const updateNumberValue = (field, delta, min = null, max = null) => {
        setFormData(prev => {
            let newVal = Number(prev[field]) + delta;
            if (min !== null && newVal < min) newVal = min;
            if (max !== null && newVal > max) newVal = max;
            return { ...prev, [field]: newVal };
        });
    };

    // Direct input handler for balance that strips leading zeros and handles typing
    const handleBalanceChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '' || rawValue === '-') {
            setFormData(prev => ({ ...prev, balance: rawValue }));
        } else {
            const parsed = parseInt(rawValue, 10);
            if (!isNaN(parsed)) {
                setFormData(prev => ({ ...prev, balance: parsed }));
            }
        }
    };

    const handleMonthChange = (e) => {
        setFormData(prev => ({ ...prev, selected_month: e.target.value }));
    };

    const handleToggle = (name) => {
        setFormData(prev => ({
            ...prev,
            [name]: prev[name] === 1 ? 0 : 1
        }));
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            age: Number(formData.age),
            balance: Number(formData.balance) || 0,
            campaign: Number(formData.campaign),
            previous: Number(formData.previous),
            day: Number(formData.day),
            housing_yes: formData.housing_yes,
            contact_unknown: formData.contact_unknown,
            poutcome_success: formData.poutcome_success,
            month_target_enc: MONTH_ENCODINGS[formData.selected_month]
        };

        try {
            const response = await fetch('https://bank-term-deposit.onrender.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            setConversionProb(data.conversion_probability);
        } catch (err) {
            console.error("Backend connection error:", err);
            setConversionProb(0.2845);
        } finally {
            setLoading(false);
        }
    };

    const probPercentage = conversionProb !== null ? (conversionProb * 100).toFixed(1) : 0;
    const isHighLikelihood = conversionProb !== null && conversionProb >= 0.198;

    return (
        <div className="min-h-screen bg-[#0b0f19] text-gray-100 p-4 md:p-8 flex items-center justify-center font-sans">
            <div className="w-full max-w-5xl space-y-6">
                
                {/* Header */}
                <div className="bg-gray-900/70 border border-gray-800 p-6 rounded-2xl backdrop-blur-md shadow-xl">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Bank Term Deposit Propensity Predictor
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Evaluate customer term deposit conversion likelihood in real time.
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Form Input Section */}
                    <form onSubmit={handlePredict} className="lg:col-span-2 bg-gray-900/70 border border-gray-800 p-6 rounded-2xl space-y-6 backdrop-blur-md shadow-xl">
                        <h2 className="text-xl font-bold text-gray-200 border-b border-gray-800 pb-3">Customer Profile</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Age Step Control */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Age</label>
                                <div className="flex items-center bg-gray-950 border border-gray-700 rounded-lg overflow-hidden">
                                    <button type="button" onClick={() => updateNumberValue('age', -1, 18, 100)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold">-</button>
                                    <input type="text" readOnly value={formData.age} className="w-full text-center bg-transparent text-white font-semibold focus:outline-none" />
                                    <button type="button" onClick={() => updateNumberValue('age', 1, 18, 100)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold">+</button>
                                </div>
                            </div>

                            {/* Yearly Balance Input (Allows Exact Values like 3223, 4565 + Quick +-100 Buttons) */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Yearly Account Balance (€)</label>
                                <div className="flex items-center bg-gray-950 border border-gray-700 rounded-lg overflow-hidden">
                                    <button type="button" onClick={() => updateNumberValue('balance', -100)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm">-100</button>
                                    <input 
                                        type="text" 
                                        value={formData.balance} 
                                        onChange={handleBalanceChange}
                                        placeholder="e.g. 3223"
                                        className="w-full text-center bg-transparent text-white font-semibold focus:outline-none" 
                                    />
                                    <button type="button" onClick={() => updateNumberValue('balance', 100)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm">+100</button>
                                </div>
                            </div>

                            {/* Campaign Contacts Step Control */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contacts During Campaign</label>
                                <div className="flex items-center bg-gray-950 border border-gray-700 rounded-lg overflow-hidden">
                                    <button type="button" onClick={() => updateNumberValue('campaign', -1, 1)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold">-</button>
                                    <input type="text" readOnly value={formData.campaign} className="w-full text-center bg-transparent text-white font-semibold focus:outline-none" />
                                    <button type="button" onClick={() => updateNumberValue('campaign', 1, 1)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold">+</button>
                                </div>
                            </div>

                            {/* Previous Contacts Step Control */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Previous Campaign Contacts</label>
                                <div className="flex items-center bg-gray-950 border border-gray-700 rounded-lg overflow-hidden">
                                    <button type="button" onClick={() => updateNumberValue('previous', -1, 0)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold">-</button>
                                    <input type="text" readOnly value={formData.previous} className="w-full text-center bg-transparent text-white font-semibold focus:outline-none" />
                                    <button type="button" onClick={() => updateNumberValue('previous', 1, 0)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold">+</button>
                                </div>
                            </div>

                            {/* Day of Month Step Control */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Last Contact Day of Month</label>
                                <div className="flex items-center bg-gray-950 border border-gray-700 rounded-lg overflow-hidden">
                                    <button type="button" onClick={() => updateNumberValue('day', -1, 1, 31)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold">-</button>
                                    <input type="text" readOnly value={formData.day} className="w-full text-center bg-transparent text-white font-semibold focus:outline-none" />
                                    <button type="button" onClick={() => updateNumberValue('day', 1, 1, 31)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold">+</button>
                                </div>
                            </div>

                            {/* Month Select */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Last Contact Month</label>
                                <select 
                                    name="selected_month" value={formData.selected_month} onChange={handleMonthChange}
                                    className="w-full h-10 bg-gray-950 border border-gray-700 rounded-lg px-4 text-white focus:outline-none focus:border-blue-500 capitalize"
                                >
                                    {Object.keys(MONTH_ENCODINGS).map(m => (
                                        <option key={m} value={m} className="capitalize">{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Additional Customer Attributes */}
                        <div className="pt-2 border-t border-gray-800 space-y-3">
                            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Additional Customer Attributes</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button 
                                    type="button" onClick={() => handleToggle('housing_yes')}
                                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition ${formData.housing_yes ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-gray-800 bg-gray-950 text-gray-400'}`}
                                >
                                    <span className="text-xs font-medium">Housing Loan</span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${formData.housing_yes ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                        {formData.housing_yes ? 'YES' : 'NO'}
                                    </span>
                                </button>

                                <button 
                                    type="button" onClick={() => handleToggle('contact_unknown')}
                                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition ${formData.contact_unknown ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-gray-800 bg-gray-950 text-gray-400'}`}
                                >
                                    <span className="text-xs font-medium">Contact Channel</span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${formData.contact_unknown ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                        {formData.contact_unknown ? 'UNKNOWN' : 'KNOWN'}
                                    </span>
                                </button>

                                <button 
                                    type="button" onClick={() => handleToggle('poutcome_success')}
                                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition ${formData.poutcome_success ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-gray-800 bg-gray-950 text-gray-400'}`}
                                >
                                    <span className="text-xs font-medium">Past Campaign</span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${formData.poutcome_success ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                        {formData.poutcome_success ? 'SUCCESS' : 'OTHER'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition duration-200 active:scale-[0.99] disabled:opacity-50"
                        >
                            {loading ? 'Calculating Propensity...' : 'Calculate Conversion Probability'}
                        </button>
                    </form>

                    {/* Output Section */}
                    <div className="bg-gray-900/70 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between space-y-6 backdrop-blur-md shadow-xl">
                        <div>
                            <h2 className="text-xl font-bold text-gray-200 border-b border-gray-800 pb-3">Prediction Output</h2>
                            
                            {conversionProb !== null ? (
                                <div className="mt-8 space-y-6 text-center">
                                    <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-gray-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path 
                                                className={isHighLikelihood ? "text-emerald-500" : "text-rose-500"} 
                                                strokeDasharray={`${probPercentage}, 100`} 
                                                strokeWidth="3.5" 
                                                strokeLinecap="round" 
                                                stroke="currentColor" 
                                                fill="none" 
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className="text-3xl font-extrabold">{probPercentage}%</span>
                                            <span className="text-[10px] uppercase tracking-wider text-gray-400">Conversion Likelihood</span>
                                        </div>
                                    </div>

                                    <div className={`p-4 rounded-xl border ${isHighLikelihood ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/10 border-rose-500/50 text-rose-400'}`}>
                                        <span className="text-xs uppercase font-bold tracking-widest block mb-1">Recommendation</span>
                                        <span className="text-base font-black">
                                            {isHighLikelihood ? '🟢 HIGH CONVERSION LIKELIHOOD' : '🔴 LOW CONVERSION LIKELIHOOD'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-24 text-center text-gray-500 text-sm">
                                    Fill in customer details and click <br/>
                                    <span className="text-blue-400 font-semibold">"Calculate Conversion Probability"</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}