import re

def preprocess_input(expression, expression_type):

    expression = expression.strip()

    original_tokens = re.findall(r'[a-zA-Z]+|\d+|[()+\-*/]', expression)

    processed_tokens = []

    for token in original_tokens:
        if re.match(r'\d+', token):
            processed_tokens.append("num")
        elif re.match(r'[a-zA-Z]+', token):
            processed_tokens.append("id")
        else:
            processed_tokens.append(token)

    return " ".join(processed_tokens), [
    t for t in original_tokens if t not in ['+', '-', '*', '/', '(', ')']
]