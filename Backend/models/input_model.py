from pydantic import BaseModel

class InputData(BaseModel):
    input: str
    expressionType: str  # infija / prefija
    derivationType: str  # izquierda / derecha