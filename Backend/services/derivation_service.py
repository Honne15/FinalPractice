def generate_derivation(tree, derivation_type):
    derivation_type = derivation_type.lower()
    steps = []

    current = [tree.label()]
    steps.append(" ".join(current))

    def find_position(current, symbol):
        if derivation_type in ["izquierda", "left"]:
            for i, x in enumerate(current):
                if x == symbol:
                    return i
        else:
            for i in range(len(current)-1, -1, -1):
                if current[i] == symbol:
                    return i
        return None

    def expand(node, current):
        if isinstance(node, str):
            return current

        if node.label() not in current:
            return current

        pos = find_position(current, node.label())
        if pos is None:
            return current

        replacement = []
        for child in node:
            if isinstance(child, str):
                replacement.append(child)
            else:
                replacement.append(child.label())

        current = current[:pos] + replacement + current[pos+1:]
        steps.append(" ".join(current))

        children = [c for c in node if not isinstance(c, str)]

        if derivation_type in ["derecha", "right"]:
            children = list(reversed(children))

        for child in children:
            current = expand(child, current)

        return current

    expand(tree, current)

    return steps

def get_leaves(tree):
    if isinstance(tree, str):
        return [tree]
    
    leaves = []
    for child in tree:
        leaves.extend(get_leaves(child))
    return leaves

def apply_tokens_progressively(steps, original_tokens, derivation_type):
    result = []

    for step in steps:
        tokens = step.split()
        new_tokens = []

        if derivation_type in ["derecha", "right"]:
            token_index = len(original_tokens) - 1
            iterable = reversed(tokens)
        else:
            token_index = 0
            iterable = tokens

        temp = []

        for t in iterable:
            if t in ["id", "num"] and 0 <= token_index < len(original_tokens):
                temp.append(original_tokens[token_index])
                token_index += -1 if derivation_type in ["derecha", "right"] else 1
            else:
                temp.append(t)

        if derivation_type in ["derecha", "right"]:
            temp = list(reversed(temp))

        result.append(" ".join(temp))

    return result