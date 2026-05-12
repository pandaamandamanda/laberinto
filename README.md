# Laberinto de Programación

Juego web estático para guiar a Amanda hasta su casa usando comandos de programación.

## Ejecutar

Abre `index.html` directamente en el navegador o levanta un servidor estático:

```bash
python -m http.server 8000
```

Luego visita `http://localhost:8000`.

## Mecánica

- El tablero es de **17 columnas por 7 filas**.
- Cada letra desbloquea el siguiente comando necesario para avanzar.
- Para ganar hay que recoger todas las letras del nivel y llegar a la casa.

## Estructura

```text
laberinto-programacion-web/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── styles.css
    └── js/
        └── game.js
```