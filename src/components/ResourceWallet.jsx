import React from 'react';

const ResourceWallet = ({ isOpen, resources, onSelectResource, selectedResource }) => {
    return (
        <div className={`resource-wallet ${isOpen ? 'open' : ''} shadow-[-10px_0_30px_rgba(0,0,0,0.03)]`}>
            <h3 className="text-[10px] uppercase gap-2 flex items-center tracking-[0.3em] font-black text-slate-400 mb-8 border-b border-slate-50 pb-4">
                <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                RESOURCE TOOLKIT
            </h3>
            <div className="flex flex-col gap-4">
                {resources.map((resource) => (
                    <div
                        key={resource.id}
                        onClick={() => onSelectResource(resource.name)}
                        className={`resource-card ${selectedResource === resource.name ? 'selected' : ''}`}
                    >
                        <div className="text-[12px] font-black uppercase tracking-wider text-slate-800 mb-1.5 flex justify-between items-center">
                            {resource.name}
                            {selectedResource === resource.name && (
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                            )}
                        </div>
                        <div className="text-[11px] text-slate-500 leading-relaxed font-medium">
                            {resource.description}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-12 bg-teal-50 rounded-2xl p-6 border border-teal-100">
                <p className="text-[10px] text-teal-800 leading-relaxed font-bold italic text-center">
                    "Connect them to help. Select the resource Sam needs most right now."
                </p>
            </div>
        </div>
    );
};

export default ResourceWallet;
