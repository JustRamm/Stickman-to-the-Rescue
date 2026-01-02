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
    tutorial_note: {
        title: "About Clues",
        visualType: 'tutorial',
        description: "This is a clue. Clues provide context about the person's situation. Finding them unlocks special 'Key Insight' dialogue options marked with a 🔍 icon."
    },
    family_photo: {
        title: "A Crumpled Photograph",
        visualType: 'photo',
        image: '/stickman_assets/family_photo.svg',
        description: "A slightly water-damaged photo of Grace smiling with two children at a birthday party. 'We love you Mom!' is written on the back."
    },
    termination_letter: {
        title: "Official Letterhead",
        visualType: 'official_letter',
        description: "TERMINATION OF EMPLOYMENT. 'Dear David, Effective Immediately due to restructuring.' The paper has been folded and unfolded many times."
    },
    failing_grade: {
        title: "Academic Notice",
        visualType: 'grade_report',
        description: "Academic Probation Warning. 'Student: Annie'. Grade: F. Red ink circles the phrase 'Loss of Scholarship Eligibility'."
    },
    wet_envelope: {
        title: "Eviction Notice",
        visualType: 'envelope',
        description: "FINAL NOTICE TO VACATE. 'Dear Raj, Failure to pay rent will result in immediate legal action.' It's stained with mud."
    }
};

export const BACKGROUND_NPCS = [
    { id: 'bg1', pos: { x: 85, y: 70 }, emotion: 'neutral', scale: 0.8, opacity: 0.2 },
    { id: 'bg2', pos: { x: 25, y: 70 }, emotion: 'listening', scale: 0.7, opacity: 0.15 },
    { id: 'bg3', pos: { x: 92, y: 70 }, emotion: 'neutral', scale: 0.85, opacity: 0.1 }
];
