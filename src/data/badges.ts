import { 
  Flame, Award, Target, Zap, ShieldCheck, BookOpen, Sparkles, Trophy, Medal 
} from 'lucide-react';

export const BADGES = [
  { 
    id: 'premiers_pas', 
    label: 'Premiers Pas', 
    description: 'Eerste quiz voltooid', 
    icon: Medal,
    color: 'text-brand-500',
    bg: 'bg-brand-50'
  },
  { 
    id: 'serie_7', 
    label: 'Série de 7', 
    description: 'Streak van 7 dagen bereikt', 
    icon: Flame,
    color: 'text-accent-500',
    bg: 'bg-accent-50'
  },
  { 
    id: 'fidele', 
    label: 'Fidèle', 
    description: 'Streak van 30 dagen bereikt', 
    icon: Award,
    color: 'text-purple-500',
    bg: 'bg-purple-50'
  },
  { 
    id: 'perfectionniste', 
    label: 'Perfectionniste', 
    description: 'Perfecte score (min. 15 vragen)', 
    icon: Target,
    color: 'text-accent-500',
    bg: 'bg-accent-50'
  },
  { 
    id: 'leclair', 
    label: "L'Éclair", 
    description: '10 vragen in < 60 seconden', 
    icon: Zap,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50'
  },
  { 
    id: 'invincible', 
    label: 'Invincible', 
    description: '50 vragen op rij goed beantwoord', 
    icon: ShieldCheck,
    color: 'text-green-500',
    bg: 'bg-green-50'
  },
  { 
    id: 'verbe_ivore', 
    label: 'Verbe-ivore', 
    description: '100 werkwoorden correct vervoegd', 
    icon: BookOpen,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50'
  },
  { 
    id: 'maitre_er', 
    label: 'Maître d\'ER', 
    description: '50 -er werkwoorden correct', 
    icon: Sparkles,
    color: 'text-amber-500',
    bg: 'bg-amber-50'
  },
  { 
    id: 'dompteur_dragons', 
    label: 'Dompteur de Dragons', 
    description: '50 onregelmatige werkwoorden correct', 
    icon: Trophy,
    color: 'text-rose-500',
    bg: 'bg-rose-50'
  },
];
