export const INNER_THOUGHTS = [
    "Don't say the wrong thing...",
    "Stay calm...",
    "They are listening...",
    "Just breathe.",
    "Validate their feelings.",
    "Don't judge.",
    "It's about connection.",
    "Be present."
];

export const CLUE_POSITIONS = {
    tutorial: { x: 30, label: 'Tutorial Note', id: 'tutorial_note' },
    park: { x: 40, label: 'Dropped Photo', id: 'family_photo' },
    office: { x: 30, label: 'Termination Letter', id: 'termination_letter' },
    campus: { x: 50, label: 'Failing Grade Paper', id: 'failing_grade' },
    rainy_street: { x: 45, label: 'Discarded Envelope', id: 'wet_envelope' }
};

export const CLUE_DETAILS = {
    tutorial_note: { title: "Training Manual", description: "A guide on how to help others. Focus on Listen, Ask, and Refer." },
    family_photo: { title: "A Crumpled Photograph", description: "A slightly water-damaged photo of Sam smiling with two children at a birthday party. 'Happy 40th Dad!' is written on the back." },
    termination_letter: { title: "Official Letterhead", description: "TERMINATION OF EMPLOYMENT. 'Effective Immediately due to restructuring.' The paper has been folded and unfolded many times." },
    failing_grade: { title: "Academic Notice", description: "Academic Probation Warning. 'Grade: F'. Red ink circles the phrase 'Loss of Scholarship Eligibility'." },
    wet_envelope: { title: "Eviction Notice", description: "FINAL NOTICE TO VACATE. 'Failure to pay rent will result in immediate legal action.' It's stained with mud." }
};

export const BACKGROUND_NPCS = [
    { id: 'bg1', pos: { x: 85, y: 70 }, emotion: 'neutral', scale: 0.8, opacity: 0.2 },
    { id: 'bg2', pos: { x: 25, y: 70 }, emotion: 'listening', scale: 0.7, opacity: 0.15 },
    { id: 'bg3', pos: { x: 92, y: 70 }, emotion: 'neutral', scale: 0.85, opacity: 0.1 }
];
