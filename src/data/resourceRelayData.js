export const OBSTACLES = [
    {
        id: 'cost',
        text: "I can't afford therapy. It costs way too much.",
        weaknesses: ['counselor', 'hotline', 'textline', 'clinic', 'support_group'],
        sfx: 'sigh',
        stickman_emotion: 'worried'
    },
    {
        id: 'parents',
        text: "I don't want my parents to find out.",
        weaknesses: ['textline', 'hotline', 'forum'],
        sfx: 'anxious',
        stickman_emotion: 'scared'
    },
    {
        id: 'time',
        text: "It's 2 AM. Everyone is asleep.",
        weaknesses: ['hotline', 'textline', '911'],
        sfx: 'tired',
        stickman_emotion: 'tired'
    },
    {
        id: 'stranger',
        text: "It's too awkward to talk to a stranger face-to-face.",
        weaknesses: ['textline', 'forum'],
        sfx: 'shy',
        stickman_emotion: 'neutral'
    },
    {
        id: 'severe',
        text: "I think I might actually hurt myself right now.",
        weaknesses: ['911', 'er'],
        sfx: 'panic',
        stickman_emotion: 'distressed'
    },
    {
        id: 'alone',
        text: "No one understands what I'm going through.",
        weaknesses: ['support_group', 'peer', 'forum'],
        sfx: 'sad',
        stickman_emotion: 'sad'
    }
];

export const PLAYER_CARDS = [
    {
        id: 'textline',
        title: "Crisis Text Line",
        type: "Digital",
        desc: "Text HOME to 741741. Free, 24/7, Confidential.",
        icon: "/stickman_assets/stickman_phone.svg"
    },
    {
        id: 'hotline',
        title: "988 Lifeline",
        type: "Phone",
        desc: "Call or text 988. Free, 24/7, Confidential.",
        icon: "/stickman_assets/stickman_phone.svg"
    },
    {
        id: 'counselor',
        title: "School Counselor",
        type: "In-Person",
        desc: "Free support available on campus during school hours.",
        icon: "/stickman_assets/scholar_stickman.svg"
    },
    {
        id: '911',
        title: "Emergency (911)",
        type: "Emergency",
        desc: "Immediate help for life-threatening situations.",
        icon: "/stickman_assets/stickman_medic.svg"
    },
    {
        id: 'support_group',
        title: "Support Group",
        type: "Community",
        desc: "Connect with others who share similar experiences.",
        icon: "/stickman_assets/stickman_group.svg"
    },
    {
        id: 'forum',
        title: "Online Forum",
        type: "Digital",
        desc: "Anonymous online peer support communities.",
        icon: "/stickman_assets/stickman_laptop.svg"
    }
];
