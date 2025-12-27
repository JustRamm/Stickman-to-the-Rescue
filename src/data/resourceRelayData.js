export const OBSTACLES = [
    {
        id: 'exams',
        text: "I cannot face my parents if I fail NEET. The pressure is too much.",
        weaknesses: ['hotline', 'counselor', 'textline'],
        sfx: 'anxious',
        stickman_emotion: 'distressed'
    },
    {
        id: 'reputation',
        text: "If people in our colony find out I'm seeing a doctor for 'nerves', our family's name is ruined.",
        weaknesses: ['textline', 'forum', 'hotline'],
        sfx: 'shy',
        stickman_emotion: 'scared'
    },
    {
        id: 'kerala_disha',
        text: "I need help but I only feel comfortable speaking in Malayalam. Who will understand me?",
        weaknesses: ['disha_kerala', 'hotline'],
        sfx: 'sad',
        stickman_emotion: 'vulnerable'
    },
    {
        id: 'harassment',
        text: "Someone is sharing my private photos online. I don't know who to trust.",
        weaknesses: ['cyber_cell', 'hotline'],
        sfx: 'panic',
        stickman_emotion: 'distressed'
    },
    {
        id: 'elderly_kerala',
        text: "My children are in Dubai. I am all alone in this big house with just my thoughts.",
        weaknesses: ['kudumbashree', 'hotline', 'disha_kerala'],
        sfx: 'tired',
        stickman_emotion: 'sad'
    }
];

export const PLAYER_CARDS = [
    {
        id: 'hotline',
        title: "KIRAN Helpline",
        type: "National",
        desc: "1800-599-0019. Free, 24/7 mental health support in 13 languages.",
        icon: "/stickman_assets/stickman_phone.svg"
    },
    {
        id: 'disha_kerala',
        title: "DISHA Kerala",
        type: "Local",
        desc: "Call 1056. Kerala's dedicated health helpline. Trusted and local.",
        icon: "/stickman_assets/stickman_phone.svg"
    },
    {
        id: 'counselor',
        title: "Trustworthy Teacher",
        type: "In-Person",
        desc: "A teacher or professor who can provide guidance and academic support.",
        icon: "/stickman_assets/scholar_stickman.svg"
    },
    {
        id: 'textline',
        title: "AASRA Support",
        type: "Confidential",
        desc: "Expert crisis support for those feeling alone or suicidal.",
        icon: "/stickman_assets/stickman_phone.svg"
    },
    {
        id: 'cyber_cell',
        title: "Cyber Cell India",
        type: "Security",
        desc: "Report online harassment and protect your digital privacy.",
        icon: "/stickman_assets/stickman_phone.svg"
    },
    {
        id: 'kudumbashree',
        title: "Kudumbashree Network",
        type: "Community",
        desc: "Local community support system in Kerala for social and mental well-being.",
        icon: "/stickman_assets/stickman_hands.svg"
    }
];
