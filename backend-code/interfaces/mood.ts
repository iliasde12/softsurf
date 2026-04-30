export interface Mood {
    id: number;
    name: string;
    description: string;
    emoji: string;
    color: string; 
}

export const moods: Mood[] = [
    { id: 1, name: "Chill", description: "Ontspannen & rustig", emoji: "😊", color: "#1E1B3A" },
    { id: 2, name: "Focus", description: "Diepe concentratie", emoji: "🎯", color: "#1A3A2A" },
    { id: 3, name: "Feest", description: "Hoge energie brengen", emoji: "🎉", color: "#3A1A2A" },
    { id: 4, name: "Verdrietig", description: "Melancholisch & reflectief", emoji: "🌧️", color: "#1E1B3A" },
    { id: 5, name: "Workout", description: "Opzwepende nummers", emoji: "💪", color: "#1E1B3A" },
    { id: 6, name: "Aangepast", description: "Maak je eigen stemming", emoji: "✨", color: "#1E1B3A" },
];