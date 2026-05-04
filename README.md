## Integrantes

- Karen Sirley Mosquera Cruz  
- Maria Juliana Henao Rua  

---

## Descripción

Aplicación web que permite analizar expresiones utilizando gramáticas libres de contexto (CFG).

Dada una expresión ingresada por el usuario, el sistema genera:

1. **Derivación paso a paso**  
   - Puede ser por la izquierda o por la derecha.  
   - Muestra cada sustitución de no terminales hasta obtener la expresión final.

2. **Árbol de derivación**  
   - Representación completa del proceso de expansión de la gramática.

3. **Árbol Sintáctico Abstracto (AST)**  
   - Versión simplificada del árbol.
   - Se eliminan nodos redundantes.

La aplicación cuenta con una interfaz gráfica interactiva que permite visualizar estos resultados de manera clara.

---

## Tecnologías

| Componente | Tecnología | 
|---|---|---|
| Backend | Python |
| Framework API | FastAPI | 
| Servidor | Uvicorn |
| Parsing / CFG | NLTK (EarleyChartParser) |
| Frontend | HTML5 + CSS3 + JavaScript |
| IDE | VS Code / PyCharm |

---

## Estructura del proyecto

```
ProyectoFinal/
├── Frontend/
│   └── index.html                       # Interfaz gráfica (HTML, CSS, JS)
│   ├── index.css
|   ├── index.js
|
├── Backend/
│   ├── main.py                          # Servidor FastAPI (punto de entrada)
│   ├── models/
│   │   └── input_model.py               # Modelo de datos de entrada (Pydantic)
│   ├── services/
│   │   ├── grammar_service.py           # Definición de gramáticas y parser
│   │   ├── input_processing_service.py  # Preprocesamiento de la expresión
│   │   ├── derivation_service.py        # Generación de derivaciones
│   │   └── tree_service.py              # Construcción del árbol y AST
│   └── __init__.py                      # (opcional) Para manejo de módulos
│
└── README.md
```

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/Honne15/FinalPractice
cd FinalPractice
```

### 2. Instalar dependencias

En la consola:
```bash
pip install fastapi uvicorn nltk
```

### 3. Ejecutar el backend

En la consola:
```bash
cd Backend
python -m uvicorn main:app --reload
```

El servidor queda disponible en `http://localhost:8000`.

### 4. Abrir la interfaz

1. Abre el archivo `index.html` que se encuentra en la carpeta Frontend.
2. Instala la extension "Live Server".
3. En la esquina inferior derecha, dale clic en Go live para abrir directamente en tu navegador.  

No requiere servidor adicional.

---

## Uso

1. Selecciona el **tipo de expresión**: Infija o Prefija.
2. Escribe la expresión en el campo de texto (o usa un ejemplo).
3. Selecciona el **tipo de derivación**: Por la izquierda o por la derecha.
4. Presiona **Analizar** (o Enter).
5. Explora los resultados en las tres pestañas:
   - **Derivación** — pasos de expansión numerados.
   - **Árbol de derivación** — árbol completo con colores por tipo de nodo.
   - **AST** — árbol abstracto simplificado.

### Ejemplos de expresiones válidas

**Infijas:**
- `a + b`
- `4 + ( a - b ) * x`
- `( a + b ) * ( c - d )`

**Prefijas:**
- `+ a b`
- `* + a b - c d`
- `+ * x 3 y`

---

## Gramáticas implementadas

**Infija (con precedencia de operadores):**
```
E → E + T | E - T | T
T → T * F | T / F | F
F → ( E ) | id | num
```

**Prefija:**
```
E → + E E | - E E | * E E | / E E | id | num
```

---

## Notas

Para el correcto funcionamiento:

- El backend debe estar corriendo antes de usar la interfaz.
- CORS debe estar habilitado en FastAPI.
- La URL del servidor en el frontend debe coincidir con la del backend.