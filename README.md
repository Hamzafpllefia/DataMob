# Proyecto RACC: Jóvenes y Movilidad 

¡Hola! Este es el repositorio principal de nuestro proyecto para el concurso del RACC sobre "Jóvenes y Movilidad". Aquí hemos montado una página web completa e interactiva utilizando las bases del desarrollo Front-End: **HTML**, **CSS** y **JavaScript**, más un toque de **Python** fuera de cámara para preparar y masticar el volumen de los datos.

Como estudiantes que hemos estado este año a tope aprendiendo estructuración en HTML, hojas de estilo y JS, decidimos ponerlo todo a prueba montando gráficos, minijuegos y carruseles nosotros mismos (sin hacer trampa con bibliotecas externas que lo hagan todo por detrás). Te explico paso a paso cómo lo hemos codificado y pensado:

---

## 🛠️ Tecnologías Empleadas

- **HTML5:** Base estructural y semántica del sitio.
- **CSS3 (Puro):** Todo el diseño y animaciones. Nos hemos basado totalmente en *Flexbox* para estructurar, sin dependencias pesadas de Bootstrap o Tailwind. 
- **JavaScript (Vanilla JS):** Hemos escrito a puro pulmón la interactividad del DOM: menús, el juego de las Flash-Cards, el carrusel de imágenes y el cambio de años de los filtros.
- **D3.js + TopoJSON:** La única librería JS de apoyo que aplicamos para renderizar visualmente los datos estadísticos sobre SVGs usando las bases de datos de accidentes de la DGT.
- **Python (Pandas):** Antes de tocar el Front, hicimos *scripts* de Data Science en Google Colab para devorar Excels inmensos y escupirlos como simples JSONs, facilitándole el trabajo al navegador.

---

## 📂 Cómo funciona nuestro Código

### 1. El Esqueleto: `index.html` (Vista Principal)
Donde se pinta todo lo más vistoso de entrada.
- **Semántica:** Usamos `<header>`, `<main>`, `<section>` y `<footer>` dejando atrás el antiguo infierno de hacer mil `<div>` sin contexto. Facilita la accesibilidad y el SEO.
- **Contenedores de Gráficos:** Para que *D3.js* haga su magia, le preparamos contenedores vacíos con un ID (ejemplo: `<div id="mapa"></div>`). JS busca este identificador concreto (`getElementById`) y dibuja en su interior líneas, barras y regiones (polígonos SVG).
- **Animaciones inline:** Al final del fichero verás funciones nativas (como la animación de contador). Usamos una variable target, un par de cálculos matemáticos para el salto dinámico, y repetimos el ciclo con `setInterval()` hasta llegar a 1.181.682 actualizando `element.textContent`.

### 2. La Capa de Pintura: `style.css`
Es un único archivo gigante para todas las vistas web, unificando todo el estilo del ecosistema.
- **Puro Flexbox (Para todo):** Nuestro mejor amigo del año. Maquetamos la cabecera usando un `justify-content: space-between` en el eje X, e invertimos el sentido en los diarios usando un sencillo `flex-direction: row-reverse` en clases pares.
- **Diseño *Responsive* (Adaptabilidad):** Con `@media (max-width: 768px)` obligamos a las cajas Flexbox o los menús a pasar a una columna, asegurándonos de que si un joven entra desde su iPhone todo encaje sin romperse.
- **La magia del 3D en tarjetas:** Para la página de las 'Flashcards', logramos que las tarjetas volteen sobre su propio eje usando en CSS: `transform: rotateY(180deg)` ligado a un `transform-style: preserve-3d;` y ocultando su parte trasera con `backface-visibility: hidden`. Conceptos que visualmente quedan impecables. 

### 3. La Lógica Compleja (`/ca.js/`)
Tener 1.000 líneas de JS tiradas en el HTML es un caos, así que modularizamos todo. 
- Creamos variables, separamos las gráficas (líneas, sanciones, mapas autonómicos...) en archivos individuales.
- **Llamadas Asíncronas (Promesas):** Usamos el método `d3.json(...).then(datos => { ... })` para pedir que el código se descargue de Internet los JSON. Le estamos diciendo al código: *"Oye, JS, vete a buscar los datos de accidentes, y 'entonces' (cuando lleguen y no antes), dibujas el gráfico"*. 
- **Event Listeners de Filtro:** Enganchamos un `addEventListener('change')` a los selectores de año del HTML (el típico desplegable). Al cambiar, la función repinta dinámicamente los gráficos o mapas enviando los nuevos valores del array de datos. 

### 4. Los Datos Entendibles (Python / JSONs)
¿Crees que el navegador puede leer un Excel de la policía de 100.000 filas cada vez que entra un usuario a la web? Imposible, petaría todo.
Lo que hicimos (y que explicamos en el Diario) es cargar todo en Google Colab:
```python
# Un algoritmo corto que elimina las columnas basuras 
# de los Excel, cruza la provincia con el nombre de su Región,
# limpia las celdas vacias con .fillna(0) para que no rompa la 
# calculadora de sumas de JS, y lo inyecta limpio en formato .json.
```
Básicamente un pre-procesado para entregarle a la página web un paquete ordenado que solo tenga que mostrar directamente en gráficas listas para triunfar.

### 5. El Diario del Proyecto (`hecho/como.html`)
Diseñamos una vista estructurada de "timeline". Para evitar hacer 20 `<img>`, programamos un Carrusel en JavaScript, usando una lista o **Array (NodeList)**, de donde leíamos la longitud (`.length`). Al darle al botón `Next`, le sumamos +1 al índice (`index+1`), calculamos su desplazamiento con puro CSS `transform: translateX(-100%)` logrando que se vea cómo empuja una imagen a otra hacia un lateral.

---

## 🎯 Conclusión final

A simple vista parece mucha tela, pero el desarrollo del código no ha sido más que aplicar a rajatabla todo lo que nos han ido enseñando: separar la capa del HTML (qué hay), conectar con la capa CSS (cómo se ve) y enganchar la interactividad pura del JS (qué ocurre al clicar y transformar). El resultado es un producto compacto, moderno y educativo. ¡Esperamos que sirva para salvar vidas!
