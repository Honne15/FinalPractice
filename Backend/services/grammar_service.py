from nltk import CFG
from nltk.parse import EarleyChartParser

def get_parser(expression_type):

    expression_type = expression_type.lower()

    if expression_type in ["prefija", "prefix"]:
        grammar_str = """
        E -> '+' E E | '-' E E | '*' E E | '/' E E | 'id' | 'num'
        """

    elif expression_type in ["infija", "infix"]:
        grammar_str = """
        E -> E '+' T | E '-' T | T
        T -> T '*' F | T '/' F | F
        F -> '(' E ')' | 'id' | 'num'
        """
    else:
        raise ValueError("Tipo de expresión inválido")

    grammar = CFG.fromstring(grammar_str)
    return EarleyChartParser(grammar)