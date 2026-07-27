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

fallback_gen = FallbackChallengeGenerator()