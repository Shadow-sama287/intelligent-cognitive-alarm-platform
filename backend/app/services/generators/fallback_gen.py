import random

class FallbackChallengeGenerator:
    @staticmethod
    def generate_math(difficulty: str = "medium") -> dict:
        diff = difficulty.lower()

        if diff in ["easy", "beginner"]:
            a, b = random.randint(10, 50), random.randint(5, 30)
            op = random.choice(["+", "-"])
            answer = a + b if op == "+" else a - b

        elif diff in ["hard", "expert"]:
            a = random.randint(12, 35)
            b = random.randint(4, 15)
            c = random.randint(10, 50)

            answer = (a * b) + c

            return {
                "prompt": f"Solve: ({a} × {b}) + {c} = ?",
                "correct_answer": str(answer),
                "time_limit_seconds": 45,
                "category": "math",
                "difficulty": difficulty,
            }

        else:
            a, b = random.randint(15, 60), random.randint(12, 40)
            op = random.choice(["+", "-", "*"])

            if op == "+":
                answer = a + b
            elif op == "-":
                answer = a - b
            else:
                answer = a * b

        return {
            "prompt": f"Solve: {a} {op} {b} = ?",
            "correct_answer": str(answer),
            "time_limit_seconds": 60,
            "category": "math",
            "difficulty": difficulty,
        }
    
    @staticmethod
    def generate_logic(difficulty: str = "medium") -> dict:
        puzzles = [
            {
                "prompt": "If all roses are flowers and all flowers need water, do roses need water?",
                "correct_answer": "yes"
            },
            {
                "prompt": "If A > B and B > C, is A > C?",
                "correct_answer": "yes"
            }
        ]

        puzzle = random.choice(puzzles)

        return {
            **puzzle,
            "time_limit_seconds": 60,
            "category": "logic",
            "difficulty": difficulty,
        }
    
    @staticmethod
    def generate_memory(difficulty: str = "medium") -> dict:
        sequences = [
            "4 8 1 9",
            "7 2 5 3",
            "1 6 8 4"
        ]

        sequence = random.choice(sequences)

        return {
            "prompt": f"Memorize this sequence: {sequence}",
            "correct_answer": sequence,
            "time_limit_seconds": 30,
            "category": "memory",
            "difficulty": difficulty,
        }
    @staticmethod
    def generate_stroop(difficulty: str = "medium") -> dict:
        colors = ["RED", "BLUE", "GREEN", "YELLOW"]

        word = random.choice(colors)
        ink = random.choice([c for c in colors if c != word])

        return {
            "prompt": f"What is the INK color of the word '{word}'?",
            "correct_answer": ink,
            "time_limit_seconds": 30,
            "category": "stroop",
            "difficulty": difficulty,
        }

    @staticmethod
    def generate_pattern(difficulty: str = "medium") -> dict:
        return {
            "prompt": "What comes next? 2, 4, 6, 8, ?",
            "correct_answer": "10",
            "time_limit_seconds": 45,
            "category": "pattern",
            "difficulty": difficulty,
        }

    @staticmethod
    def generate_riddles(difficulty: str = "medium") -> dict:
        riddles = [
            {
                "prompt": "What has keys but can't open locks?",
                "correct_answer": "piano"
            },
            {
                "prompt": "What has hands but cannot clap?",
                "correct_answer": "clock"
            }
        ]

        riddle = random.choice(riddles)

        return {
            **riddle,
            "time_limit_seconds": 60,
            "category": "riddles",
            "difficulty": difficulty,
        }

    @staticmethod
    def generate_trivia(difficulty: str = "medium") -> dict:
        questions = [
            {
                "prompt": "How many continents are there on Earth?",
                "correct_answer": "7"
            },
            {
                "prompt": "What planet is known as the Red Planet?",
                "correct_answer": "mars"
            }
        ]

        question = random.choice(questions)

        return {
            **question,
            "time_limit_seconds": 45,
            "category": "trivia",
            "difficulty": difficulty,
        }

fallback_gen = FallbackChallengeGenerator()