import React from 'react';

const ResourceWallet = ({ isOpen, resources, onSelectResource, selectedResource }) => {
    return (
        <div className={`resource-wallet ${isOpen ? 'open' : ''} shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col bg-slate-50`}>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur border-b border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm uppercase flex items-center gap-2 tracking-[0.2em] font-black text-slate-800">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Resource Toolkit
                    </h3>
                    <div className="px-2 py-1 bg-teal-100 text-teal-800 text-[10px] font-bold rounded uppercase tracking-wide">
                        {resources?.length || 0} Available
                    </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Select a resource to refer the person in crisis.</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                    {(resources || []).map((resource) => {
                        let icon = '📋';
                        let badge = null;
                        if (resource.name.includes('Crisis') || resource.name.includes('988') || resource.name.includes('911')) {
                            icon = '🆘';
                            badge = 'Emergency';
                        }
                        else if (resource.name.includes('Therapist') || resource.name.includes('Counselor')) icon = '🛡️';
                        else if (resource.name.includes('Support')) icon = '🤝';

                        const isSelected = selectedResource === resource.name;

                        return (
                            <div
                                key={resource.id}
                                onClick={() => onSelectResource(resource.name)}
                                className={`group relative p-4 rounded-xl transition-all duration-200 border-2 cursor-pointer flex items-start gap-4
                                    ${isSelected
                                        ? 'bg-white border-teal-500 shadow-lg translate-x-1'
                                        : 'bg-white border-slate-100 hover:border-teal-300 hover:shadow-md'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-colors
                                    ${isSelected ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-50'}`}>
                                    {icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-sm font-black uppercase tracking-wide truncate pr-2 ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                                            {resource.name}
                                        </h4>
                                        {badge && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded uppercase tracking-wider">{badge}</span>}
                                    </div>
                                    <p className={`text-[11px] leading-snug font-medium mt-1 ${isSelected ? 'text-teal-700' : 'text-slate-400'}`}>
                                        {resource.description}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="absolute inset-y-0 right-0 w-1.5 bg-teal-500 rounded-r-xl"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-slate-400 font-bold italic">"Connecting causes action."</p>
                </div>
            </div>
        </div>
    );
};

export default ResourceWallet;
