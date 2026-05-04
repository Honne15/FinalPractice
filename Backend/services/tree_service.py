def tree_to_json(tree):
    if isinstance(tree, str):
        return {"value": tree}

    return {
        "value": tree.label(),
        "children": [tree_to_json(child) for child in tree]
    }


def build_ast(tree):
    if isinstance(tree, str):
        if tree in ["id", "num"]:
            return {"value": tree}
        return None

    if len(tree) == 3 and tree[0] == '(':
        return build_ast(tree[1])

    if len(tree) == 3:
        left = build_ast(tree[0])
        op = tree[1]
        right = build_ast(tree[2])

        if isinstance(op, str) and left and right:
            return {
                "value": op,
                "children": [left, right]
            }

    for child in tree:
        result = build_ast(child)
        if result:
            return result

    return None


def restore_tree_tokens(node, original_tokens):
    index = [0]

    def helper(n):
        if "children" not in n:
            if n["value"] in ["id", "num"]:
                if index[0] < len(original_tokens):
                    val = original_tokens[index[0]]
                    index[0] += 1
                    return {"value": val}
                else:
                    return {"value": n["value"]}
            else:
                return {"value": n["value"]}

        return {
            "value": n["value"],
            "children": [helper(child) for child in n["children"]]
        }

    return helper(node)