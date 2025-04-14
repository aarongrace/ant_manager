import { v4 } from "uuid";

// Define the TaskEnum type
export enum TaskEnum {
  Idle = "idle",
  Foraging = "foraging", // Renamed from "gathering food" to "foraging"
  Attacking = "attacking",
}

export enum AntTypeEnum {
    Queen = "queen",
    Worker = "worker",
    Soldier = "soldier",
}

// Define the Ant type
export type Ant = {
  id: string; // Unique identifier for the ant
  name: string; // Name of the ant
  age: number; // Age of the ant
  type: AntTypeEnum; // Type of the ant (e.g., worker, soldier, queen)
  frame: number; // Current frame for animation
  task: TaskEnum; // Current task of the ant (enum type)
  position: { x: number; y: number }; // Current position of the ant
  destination: string; // id of the object the ant is heading to
};

const getRandomAntType = (): AntTypeEnum => {
  const antTypes = Object.values(AntTypeEnum).filter((antType) =>antType !== AntTypeEnum.Queen) as AntTypeEnum[];
  return antTypes[Math.floor(Math.random() * antTypes.length)];
};


export const makeNewAnt = (): Ant => {
  return {
    id: v4(),
    name: ant_names[Math.floor(Math.random() * ant_names.length)],
    age: 0,
    type: getRandomAntType(),
    frame: 0,
    task: TaskEnum.Idle,
    position: { x: Math.random(), y: Math.random() },
    destination: "",
  };
}

const ant_names = [
    "Anton", "Luna", "Pierre", "Sakura", "Giovanni", "Klaus", "Cielo", "Coco", "Haruto", "Nino",
    "Fritz", "Zorro", "Lucille", "Yuki", "Vito", "Erwin", "Paloma", "Miel", "Riko", "Enzo",
    "Dietert", "Carmen", "Remy", "Hana", "Adriano", "Max", "Azul", "Chérie", "Taro", "Marco",
    "Manni", "Lila", "Sylvain", "Kenji", "Luca", "Bella", "Andreas", "Elena", "Hugo", "Saki",
    "Dora", "Roberto", "Klaus", "Rosa", "Elise", "Mitsu", "Bianca", "Axel", "Chika", "Esteban",
    "Hans", "Tsubasa", "Alina", "Julio", "Camille", "Mei", "Silvia", "Olivier", "Keita", "Fabio",
    "Celeste", "Pietro", "Jojo", "Antonia", "Sebastián", "Léo", "Katsumi", "Giovanni", "Anita",
    "Remy", "Natsu", "Omar", "Fernanda", "Élodie", "Kei", "Giada", "Elio", "Mimi", "Dorotea",
    "Umi", "Julia", "Thierry", "Rina", "Maurizio", "Eva", "Henri", "Kazu", "Luciana", "Thomas",
    "Daisuke", "Maria", "Serge", "Katsuo", "Isabella", "Vincent", "Nanami", "Nando", "Hélène",
    "Kaito", "Rosa", "Erik", "Rocco", "Marcel", "Haruka", "Diego", "Noriko", "Arianna", "Michel",
    "Fabio", "Nanako", "Elena", "Émile", "Renzo", "Momo", "Liliane", "Kazuo", "Mireille", "Ivan",
    "Salvatore", "Aya", "Ines", "Étienne", "Nobu", "Mirella", "Claude", "Yui", "Sylvio", "Ivana",
    "Henrietta", "Daichi", "Laura", "Bastian", "Akiko", "Francesca", "Bruno", "Clara", "Stéphane",
    "Sora", "Gigi", "Michel", "Takumi", "Soledad", "Marco", "Noé", "Olivia", "Julio", "Maya",
    "Yuki", "Sandrine", "Luca", "Vincent", "Chiara", "Alice", "Taichi", "Adele", "Gaël", "Jun",
    "Cesare", "Lou", "Ryo", "Antonia", "Marco", "Lucien", "Kazuki", "Nico", "Simone", "Nadine",
    "Kana", "Olga", "Yuto", "Nadia", "Henri", "Laurent", "Kimi", "Gino", "Livia", "Benjamin",
    "Rieko", "Florent", "Kaori", "Toshi", "Renée", "Giovanni", "Charlotte", "Ikuto", "Aria",
    "Amélie", "Emilio", "Sakura", "Isabeau", "Naoki", "Flavio", "Mathilde", "Yoko", "Carlo",
    "Liliana", "Rosa", "Leandro", "Sylvain", "Sho", "Elisa", "Carla", "Antoine", "Sachi", "Matías",
    "Esteban", "Hinata", "Adriana", "Arnaud", "Yumi", "Maurizio", "Emilio", "Sandra", "Jérôme",
    "Keiko", "Raffaele", "Yuka", "Guillaume", "Mio", "Sofía", "Antoine", "Tetsuya", "Luca", "Mónica",
    "Thomas", "Rika", "Yusuke", "Chiara", "Dario", "Olivier", "Mario", "Fanny", "Takeo", "Vincenzo",
    "Hiroshi", "Angelo", "Elisabeth", "Yuji", "Ana", "Pascal", "Haruto", "Elsa", "Lorenzo", "Hiroki",
    "Manuela", "Clara", "Shota", "Massimo", "Hana", "Pierre", "Tatsuki", "Micaela", "François", "Kiyoshi",
    "Olga", "Luis", "Juliet", "Yuto", "Carmine", "Marika", "José", "Yu", "Luca", "Thomas", "Sonia",
    "Ayumi", "Lidia", "Dario", "Naoto", "Martina", "Camille", "Akira", "Roberto", "Mathis", "Noa",
    "Chiyo", "Paolo", "Mei", "Alessandra", "Takashi", "Bianca", "Jacques", "Kenta", "Enrica", "Hikari",
    "Julian", "Sergio", "Lucía", "Miko", "Giuseppe", "Émilie", "Kaoru", "Silvio", "Naomi", "Luciano",
    "Yukari", "Teo", "Soji", "Vittorio", "Anna", "Natsuki", "Simone", "Li", "Vittoria", "Hugo", "Matsu",
    "Serena", "Alexis", "Naomi", "Leo", "Giulia", "Bérénice", "Rika", "Hiroshi", "Gaetano", "Naho",
    "Sylvie", "Shinji", "Amanda", "Camille", "Antonio", "Saki", "Makoto", "Fiorella", "Jules", "Yuki",
    "Benedetta", "Cécile", "Hikaru", "Carlo", "Shin", "Elisa", "Taiki", "Edouard", "Manabu", "Leda",
    "Nami", "Florin", "Gabriele", "Kaito", "Salome", "Isabela", "Takara", "Gianni", "Jiro", "Emanuele",
    "Noel", "Kazuma", "Nadja", "Louis", "Kei", "Monica", "Kiriko", "Luca", "Amira", "Claude", "Yuina",
    "Abel", "Sayaka", "Theo", "Mara", "Hideo", "Lia", "Yutaka", "Clara", "Yuuki", "Sylvia", "Kiyomi",
    "Tadao", "Sofia", "Chiaki", "Rodolfo", "Jean", "Yuriko", "Ettore", "Satsuki", "Lucia", "Leo",
    "Tatsuya", "Marissa", "Orazio", "Amélie", "Katsuya", "Francesca", "Satoru", "Carlotta", "Fumiko",
    "Tomas", "Rie", "Piero", "Hanae", "Samuele", "Camille", "Inori", "Antonio", "Yuto", "Agnese",
    "Ryoji", "Noé", "Aiko", "Enzo", "Renée", "Flavio", "Aya", "Emilio", "Yuiko", "Lucas", "Maiko",
    "Toshi", "Livia", "Juno", "Ginevra", "Jean-Pierre", "Yuka", "Yuu", "Linda", "Sachi", "Dante",
    "Sara", "Ken", "Alice", "Daisuke", "Lucia", "Tristan", "Yoko", "Giuliana", "Giovanni", "Yuna",
    "Celine", "Satoru", "Alice", "Rei", "Clara", "Luca", "Francesco", "Maru", "Jasmine", "Sophie",
    "Gino", "Miki", "Tatsuo", "Chiara", "Michiko", "Ren", "Hiroshi", "Carmela", "Yasuo", "Alessandra",
    "Tsukasa", "Carlo", "Yuji", "Araceli", "Ayako", "Timothée", "Masami", "Saki", "Gabriel", "Hideki",
    "Raúl", "Ioana", "Leila", "Giorgia", "Haruki", "Kiyo", "Viola", "Oskar", "Atsuko", "Emilio",
    "Giorgia", "Sayo", "Mirai", "Luciana", "Kaito", "Yuna", "Margherita", "Aya", "Suzu", "Francisco",
    "Lucia", "Aimi", "Gabriele", "Loris", "Samira", "Rina", "Alessandro", "Teiko", "Fiori", "Hana",
    "Massimo", "Mio", "Gregoire", "Asahi", "Ilaria", "Kimi", "Toshiro", "Kyoko", "Hiro", "Olivia",
    "Ryo", "Mirella",
        "Aarav", "Ananya", "Arjun", "Aditi", "Krishna", "Lakshmi", "Ravi", "Sita", "Vishnu", "Priya",
    "Devi", "Gopal", "Meena", "Ramesh", "Anil", "Radha", "Suresh", "Kiran", "Bhavani", "Hari",
    "Deepa", "Sanjay", "Parvati", "Raj", "Uma", "Ashok", "Pooja", "Ganesh", "Jaya", "Shiva",
    "Kumar", "Manju", "Nita", "Vivek", "Aruna", "Mohan", "Kavita", "Lalita", "Rahul", "Sunita",
    "Govind", "Sarita", "Ankit", "Padmini", "Balaji", "Santosh", "Lata", "Ram", "Kanchan", "Preeti",

    // # Romanian names
    "Ana", "Ion", "Maria", "Alexandru", "Elena", "Andrei", "Ioana", "Mihai", "Cristina", "Diana",
    "Stefan", "Gabriela", "Florin", "Raluca", "Carmen", "Dragos", "Mihaela", "Lucian", "Lavinia", "Catalin",
    "Radu", "Monica", "Emil", "Teodora", "Victor", "Simona", "George", "Liliana", "Cornel", "Roxana",
    "Adrian", "Marian", "Oana", "Eugen", "Alina", "Valentin", "Sorina", "Claudiu", "Mircea", "Doina",
    "Nicolae", "Georgiana", "Bogdan", "Felicia", "Daniel", "Aura", "Florina", "Alexandra", "Ionut", "Anca",

    // # Russian names
    "Ivan", "Olga", "Sergei", "Anna", "Dmitri", "Tatiana", "Alexei", "Maria", "Vladimir", "Ekaterina",
    "Nikolai", "Svetlana", "Boris", "Natalia", "Pavel", "Irina", "Mikhail", "Galina", "Yuri", "Elena",
    "Viktor", "Ludmila", "Andrei", "Anastasia", "Igor", "Alina", "Oleg", "Polina", "Maxim", "Vera",
    "Roman", "Taisia", "Konstantin", "Tamara", "Leonid", "Zoya", "Artyom", "Lilia", "Grigori", "Yulia",
    "Serafima", "Diana", "Yaroslav", "Nina", "Vladislav", "Ksenia", "Timur", "Anfisa", "Stanislav", "Evgenia",

    // # Croatian names
    "Ana", "Ivan", "Petar", "Katarina", "Marko", "Marija", "Luka", "Ivana", "Josip", "Mateja",
    "Ante", "Nikolina", "Toni", "Marina", "Stjepan", "Marta", "Davor", "Vesna", "Karlo", "Mirna",
    "Filip", "Tea", "Tomislav", "Lucija", "Fran", "Klara", "Mate", "Mia", "Domagoj", "Paula",
    "Bruno", "Sandra", "Kristijan", "Ivica", "Antonio", "Helena", "Damir", "Lana", "Robert", "Ana-Marija",
    "Nikola", "Lea", "Matija", "Tanja", "Ema", "Luka", "Dario", "Anamarija", "Marin", "Mislav",

    // # Namibian names
    "Nangula", "Shikongo", "Penda", "Amalia", "Tangeni", "Selma", "Tatekulu", "Ndapandula", "Kalumbu", "Johannes",
    "Haitembu", "Neema", "Katongo", "Nakale", "Elago", "Ananias", "Efraim", "Immanuel", "Kandume", "Ndaka",
    "Helvi", "Kadhila", "Linekela", "Uushona", "Selma", "Kauna", "Petrus", "Ambrosius", "Kamati", "Ngula",
    "Mwetufete", "Johanna", "Erastus", "Gabriel", "Thomas", "Paulus", "Julia", "Kavita", "Samson", "Hindjou",
    "Sylvia", "Filipus", "Pinehas", "Tulia", "Justina", "Eino", "Anna", "Elia", "Hilya", "Johannes"

]

