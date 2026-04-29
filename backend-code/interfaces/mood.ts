export interface Mood {
    id: string;
    name: string;
    description: string;
    emoji: string;
    color: string; 
}

export const moods: Mood[] = [
    { id: "chill", name: "Chill", description: "Ontspannen & rustig", emoji: "😊", color: "#1E1B3A" },
    { id: "focus", name: "Focus", description: "Diepe concentratie", emoji: "🎯", color: "#1A3A2A" },
    { id: "feest", name: "Feest", description: "Hoge energie brengen", emoji: "🎉", color: "#3A1A2A" },
    { id: "verdrietig", name: "Verdrietig", description: "Melancholisch & reflectief", emoji: "🌧️", color: "#1E1B3A" },
    { id: "workout", name: "Workout", description: "Opzwepende nummers", emoji: "💪", color: "#1E1B3A" },
    { id: "aangepast", name: "Aangepast", description: "Maak je eigen stemming", emoji: "✨", color: "#1E1B3A" },
];