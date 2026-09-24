const words = [
    "apple",
    "banana",
    "elephant",
    "rocket",
    "car",
    "house",
    "tree",
    "computer",
    "phone",
    "airplane",
    "pizza",
    "burger",
    "guitar",
    "football",
    "basketball",
    "sun",
    "moon",
    "star",
    "mountain",
    "river",
    "ocean",
    "camera",
    "book",
    "chair",
    "table",
    "bicycle",
    "train",
    "dog",
    "cat",
    "fish",
    "lion",
    "tiger",
    "robot",
    "alien",
    "dragon",
    "castle",
    "superhero",
    "wizard",
    "pirate",
    "crown"
];

function getRandomWords(count = 3) {
    const shuffled = [...words].sort(
        () => Math.random() - 0.5
    );

    return shuffled.slice(0, count);
}

module.exports = {
    words,
    getRandomWords
};