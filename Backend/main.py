from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.input_model import InputData
from services.grammar_service import get_parser
from services.input_processing_service import preprocess_input
from services.derivation_service import generate_derivation
from services.derivation_service import generate_derivation, apply_tokens_progressively
from services.tree_service import (
    tree_to_json,
    build_ast,
    restore_tree_tokens
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
def analyze(data: InputData):
    try:
        parser = get_parser(data.expressionType)

        processed_input, original_tokens = preprocess_input(
            data.input, data.expressionType
        )

        tokens = processed_input.split()

        if not tokens:
            return {"error": "Expresión vacía"}

        trees = list(parser.parse(tokens))

        if not trees:
            return {"error": "No se pudo derivar la expresión"}

        tree = trees[0]

        derivation_raw = generate_derivation(
             tree,
             data.derivationType
             )
        
        derivation = apply_tokens_progressively(derivation_raw, original_tokens, data.derivationType)
    
        tree_json = tree_to_json(tree)
        tree_json = restore_tree_tokens(tree_json, original_tokens)

        ast = build_ast(tree)
        if ast:
            ast = restore_tree_tokens(ast, original_tokens)

        return {
            "derivation": derivation,
            "tree": tree_json,
            "ast": ast
        }

    except Exception as e:
        return {"error": str(e)}