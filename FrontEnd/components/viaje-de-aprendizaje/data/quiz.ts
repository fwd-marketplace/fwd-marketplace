import type { StarQuiz, Resource } from "./types";

export const QUIZ_DATA: Record<string, StarQuiz> = {
  terminal: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Cuál de estos comandos lista los archivos del directorio actual?",
          options: [
            { label: "ls", correct: true },
            { label: "cd", correct: false },
            { label: "pwd", correct: false },
            { label: "touch", correct: false },
          ],
          explanation: "Descartá las otras: `cd` cambia de directorio, `pwd` muestra la ruta actual y `touch` crea archivos. Buscás el comando corto (dos letras) cuyo nombre viene de 'list'.",
        },
        {
          prompt: "¿Qué hace el comando `cd ..`?",
          options: [
            { label: "Sube al directorio padre", correct: true },
            { label: "Elimina el directorio actual", correct: false },
            { label: "Crea una nueva carpeta", correct: false },
            { label: "Lista archivos ocultos", correct: false },
          ],
          explanation: "`..` no borra ni crea nada: siempre representa 'el directorio de arriba'. Pensá qué pasa si a 'cambiar de directorio' le pedís ir hacia ese `..`.",
        },
        {
          prompt: "¿Cómo creás una carpeta llamada `proyecto`?",
          options: [
            { label: "mkdir proyecto", correct: true },
            { label: "touch proyecto", correct: false },
            { label: "create proyecto", correct: false },
            { label: "cd proyecto", correct: false },
          ],
          explanation: "Descartá las que no crean carpetas: `touch` hace archivos vacíos, `cd` solo te mueve entre directorios y `create` no es un comando real. La que buscás sirve para 'hacer un directorio' — su nombre abrevia esas dos palabras en inglés (make + directory).",
        },
      ],
      [
        {
          prompt: "¿Qué hace `echo \"texto\" > archivo.txt`?",
          options: [
            { label: "Escribe 'texto' en archivo.txt, reemplazando su contenido", correct: true },
            { label: "Agrega 'texto' al final de archivo.txt", correct: false },
            { label: "Lee el contenido de archivo.txt", correct: false },
            { label: "Ejecuta archivo.txt como script", correct: false },
          ],
          explanation: "Fijate en el `>`: redirige la salida hacia el archivo. Un solo `>` pisa lo que había; recordá que para 'agregar al final' se usa el doble `>>`. Eso descarta esa opción.",
        },
        {
          prompt: "¿Qué hace el pipe `|` en `ls | grep '.js'`?",
          options: [
            { label: "Pasa la salida de ls como entrada de grep", correct: true },
            { label: "Ejecuta ambos comandos en paralelo", correct: false },
            { label: "Guarda la salida de ls en un archivo temporal", correct: false },
            { label: "Los ejecuta en orden sin conectar sus salidas", correct: false },
          ],
          explanation: "El pipe no corre comandos en paralelo ni crea archivos temporales — descartá esas. Su trabajo es encadenar: lo que produce el comando de la izquierda alimenta al de la derecha.",
        },
        {
          prompt: "¿Cuál de estos comandos mueve (o renombra) un archivo?",
          options: [
            { label: "mv archivo.txt nuevo.txt", correct: true },
            { label: "cp archivo.txt nuevo.txt", correct: false },
            { label: "rm archivo.txt", correct: false },
            { label: "ln archivo.txt nuevo.txt", correct: false },
          ],
          explanation: "`cp` copia (deja el original), `rm` borra y `ln` crea un enlace. Ninguno mueve. Buscás el comando de dos letras que abrevia 'move'.",
        },
      ],
      [
        {
          prompt: "¿Qué hace `grep -r 'error' ./logs/`?",
          options: [
            { label: "Busca la palabra 'error' en todos los archivos dentro de logs/", correct: true },
            { label: "Reemplaza 'error' por otro texto en los archivos", correct: false },
            { label: "Lista todos los archivos en la carpeta logs/", correct: false },
            { label: "Elimina las líneas que contienen 'error'", correct: false },
          ],
          explanation: "`grep` no modifica ni borra archivos, solo busca. La `-r` es de 'recursive': pensá qué implica sobre cuántos archivos revisa dentro de la carpeta.",
        },
        {
          prompt: "¿Qué hace `&&` al encadenar comandos, como en `npm install && npm start`?",
          options: [
            { label: "Ejecuta el segundo solo si el primero terminó con éxito", correct: true },
            { label: "Ejecuta ambos comandos en paralelo", correct: false },
            { label: "Ejecuta el segundo sin importar el resultado del primero", correct: false },
            { label: "Combina la salida de ambos en un solo stream", correct: false },
          ],
          explanation: "`&&` es un 'AND lógico'. Pensá en la lógica: para que un AND se cumpla, el primero no puede fallar. Eso te dice bajo qué condición corre el segundo. (Para correrlo siempre existiría `;`.)",
        },
        {
          prompt: "¿Qué hace `chmod +x script.sh`?",
          options: [
            { label: "Le da permiso de ejecución al archivo", correct: true },
            { label: "Lo convierte en archivo oculto", correct: false },
            { label: "Lo copia a /usr/local/bin", correct: false },
            { label: "Lo comprime en formato .gz", correct: false },
          ],
          explanation: "`chmod` cambia permisos (change mode), no oculta, copia ni comprime. La `+x` agrega algo: pensá qué necesita un `.sh` para poder correr.",
        },
      ],
    ],
  },

  git: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Cuál es el orden correcto para guardar cambios en un repositorio?",
          options: [
            { label: "git add → git commit → git push", correct: true },
            { label: "git commit → git add → git push", correct: false },
            { label: "git push → git commit → git add", correct: false },
            { label: "git add → git push → git commit", correct: false },
          ],
          explanation: "Seguí el flujo lógico: primero preparás los cambios, luego los sellás en tu máquina y al final los mandás al remoto. Descartá cualquier orden que suba (`push`) antes de tener un commit.",
        },
        {
          prompt: "¿Qué es una rama (branch) en Git?",
          options: [
            { label: "Una línea de desarrollo paralela e independiente", correct: true },
            { label: "Una copia de seguridad automática del repositorio", correct: false },
            { label: "Un servidor remoto donde se guarda el código", correct: false },
            { label: "Un archivo de configuración del proyecto", correct: false },
          ],
          explanation: "Una rama no es un backup, ni un servidor, ni un archivo. Pensá en un camino que se separa del principal para trabajar sin afectar al resto: esa imagen te lleva a la correcta.",
        },
        {
          prompt: "¿Qué hace `git clone <url>`?",
          options: [
            { label: "Descarga una copia completa de un repositorio remoto", correct: true },
            { label: "Crea un repositorio vacío en la carpeta actual", correct: false },
            { label: "Fusiona dos ramas en una", correct: false },
            { label: "Elimina el historial de commits", correct: false },
          ],
          explanation: "`clone` no fusiona ni borra nada, y tampoco parte de vacío (eso sería `init`). El nombre lo sugiere: hace un 'clon' de algo que ya existe en el remoto, con todo su historial.",
        },
      ],
      [
        {
          prompt: "¿Qué hace `git stash`?",
          options: [
            { label: "Guarda temporalmente cambios sin commitear para limpiar el área de trabajo", correct: true },
            { label: "Borra todos los cambios no commiteados permanentemente", correct: false },
            { label: "Crea un commit automático con los cambios actuales", correct: false },
            { label: "Sube los cambios al repositorio remoto", correct: false },
          ],
          explanation: "`stash` no borra ni sube nada, y no crea un commit. Pensá en 'guardar en un cajón' tus cambios para dejar el área limpia y recuperarlos después con `stash pop`.",
        },
        {
          prompt: "¿Cuál es la diferencia entre `git merge` y `git rebase`?",
          options: [
            { label: "merge crea un commit de fusión; rebase reescribe el historial linealmente", correct: true },
            { label: "Son idénticos, solo cambia el nombre", correct: false },
            { label: "rebase es siempre más seguro que merge", correct: false },
            { label: "merge solo funciona en la rama main", correct: false },
          ],
          explanation: "No son idénticos ni hay uno 'siempre más seguro'. La diferencia clave está en el historial: uno lo preserva agregando un commit de unión, el otro lo reordena para dejarlo lineal.",
        },
        {
          prompt: "¿Qué hace `git diff`?",
          options: [
            { label: "Muestra los cambios entre el estado actual y el último commit", correct: true },
            { label: "Elimina las diferencias entre dos archivos", correct: false },
            { label: "Crea una rama con los cambios pendientes", correct: false },
            { label: "Revierte todos los cambios del directorio", correct: false },
          ],
          explanation: "`diff` no borra, ni crea ramas, ni revierte: solo muestra. Pensá qué 'diferencia' te enseñaría entre lo que editaste y lo último que guardaste.",
        },
      ],
      [
        {
          prompt: "¿Cuál es la diferencia entre `git reset --soft HEAD~1` y `git reset --hard HEAD~1`?",
          options: [
            { label: "--soft deshace el commit pero conserva los cambios; --hard los elimina también", correct: true },
            { label: "Son equivalentes en resultado", correct: false },
            { label: "--hard solo funciona en branches secundarias", correct: false },
            { label: "--soft elimina el historial completo del repo", correct: false },
          ],
          explanation: "No son equivalentes. Pensá en la intensidad de las palabras: 'soft' (suave) es más conservador con tus cambios que 'hard' (duro). Eso te dice cuál conserva y cuál descarta.",
        },
        {
          prompt: "¿Qué es un conflicto de merge y cómo se resuelve?",
          options: [
            { label: "Dos ramas modificaron la misma parte de un archivo; se resuelve editando el archivo manualmente", correct: true },
            { label: "Error de red al hacer push; se resuelve reconectando", correct: false },
            { label: "El repo está lleno; se resuelve borrando commits", correct: false },
            { label: "Una rama corrupta; se resuelve borrándola", correct: false },
          ],
          explanation: "No tiene que ver con la red, el espacio en disco ni ramas corruptas. Ocurre cuando dos cambios tocan exactamente la misma línea: pensá quién debe decidir con cuál quedarse.",
        },
        {
          prompt: "¿Qué hace `git cherry-pick <hash>`?",
          options: [
            { label: "Aplica un commit específico de otra rama en la rama actual", correct: true },
            { label: "Selecciona el mejor commit del historial automáticamente", correct: false },
            { label: "Borra commits seleccionados del historial", correct: false },
            { label: "Mueve todos los commits de una rama a otra", correct: false },
          ],
          explanation: "No elige 'el mejor' solo, ni borra, ni mueve todos los commits. Como 'elegir una cereza', toma UN commit puntual (por su hash) y lo trae a tu rama actual.",
        },
      ],
    ],
  },

  htmlcss: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Qué etiqueta HTML define el encabezado más importante de una página?",
          options: [
            { label: "<h1>", correct: true },
            { label: "<header>", correct: false },
            { label: "<title>", correct: false },
            { label: "<strong>", correct: false },
          ],
          explanation: "`<header>` es una zona de la página, `<title>` va en la pestaña del navegador y `<strong>` solo resalta texto. Buscás el encabezado de nivel 1: su nombre lleva la letra 'h' y el número más chico.",
        },
        {
          prompt: "¿Qué propiedad CSS controla el espacio ENTRE el borde y el contenido de un elemento?",
          options: [
            { label: "padding", correct: true },
            { label: "margin", correct: false },
            { label: "border", correct: false },
            { label: "gap", correct: false },
          ],
          explanation: "`margin` es el espacio hacia afuera (entre vecinos), `border` es la línea del borde y `gap` separa hijos en flex/grid. Buscás el espacio interior, entre el borde y el contenido.",
        },
        {
          prompt: "¿Cuál es la diferencia entre `display: block` y `display: inline`?",
          options: [
            { label: "Block ocupa todo el ancho disponible; inline solo el que necesita", correct: true },
            { label: "Block es para texto; inline para imágenes", correct: false },
            { label: "Inline ocupa toda la fila; block solo el ancho del contenido", correct: false },
            { label: "No hay diferencia visual entre ambos", correct: false },
          ],
          explanation: "Sí hay diferencia visual. Pensá en un `<div>` (uno) vs un `<span>` (el otro): uno se apodera de toda la fila y el otro fluye con el texto ocupando lo justo. Cuidado con la opción que lo dice al revés.",
        },
      ],
      [
        {
          prompt: "¿Cuál es la diferencia entre `position: relative` y `position: absolute`?",
          options: [
            { label: "relative desplaza sin sacar del flujo; absolute se posiciona respecto al ancestro posicionado", correct: true },
            { label: "Son intercambiables en la mayoría de los casos", correct: false },
            { label: "absolute siempre se posiciona respecto al body", correct: false },
            { label: "relative fija el elemento al hacer scroll", correct: false },
          ],
          explanation: "No son intercambiables y no siempre se ancla al `body`. Uno mueve el elemento pero le guarda su lugar en el flujo; el otro lo saca y lo ubica respecto a un ancestro posicionado.",
        },
        {
          prompt: "¿Qué es la 'especificidad' en CSS?",
          options: [
            { label: "Un sistema de pesos que determina qué regla CSS se aplica cuando hay conflictos", correct: true },
            { label: "La velocidad con la que carga el CSS", correct: false },
            { label: "El orden en que se importan los archivos de estilos", correct: false },
            { label: "La cantidad de selectores en un archivo CSS", correct: false },
          ],
          explanation: "No tiene que ver con velocidad, ni con el orden de importación, ni con cuántos selectores hay en total. Cuando dos reglas chocan sobre el mismo elemento, algo decide cuál gana: pensá en 'pesos'.",
        },
        {
          prompt: "¿Para qué sirve `z-index`?",
          options: [
            { label: "Controla el orden de apilamiento visual de elementos posicionados", correct: true },
            { label: "Define el zoom inicial del elemento", correct: false },
            { label: "Controla el tamaño máximo de un elemento", correct: false },
            { label: "Define el nivel de opacidad del elemento", correct: false },
          ],
          explanation: "No controla zoom, tamaño ni opacidad. La 'z' es el eje que sale de la pantalla hacia vos: pensá qué elemento queda delante y cuál detrás.",
        },
      ],
      [
        {
          prompt: "¿Qué hace `display: grid` y en qué se diferencia de `display: flex`?",
          options: [
            { label: "grid es bidimensional (filas y columnas); flex es unidimensional (un eje a la vez)", correct: true },
            { label: "grid solo funciona en Chrome; flex es universal", correct: false },
            { label: "Son idénticos en resultado", correct: false },
            { label: "flex permite más columnas que grid", correct: false },
          ],
          explanation: "Ambos tienen amplio soporte y no son idénticos. La diferencia está en las dimensiones: uno maneja un solo eje a la vez, el otro filas y columnas juntas.",
        },
        {
          prompt: "¿Qué es el 'box model' en CSS?",
          options: [
            { label: "El modelo que describe cómo se calcula el tamaño: content + padding + border + margin", correct: true },
            { label: "Un modelo de color para CSS", correct: false },
            { label: "La forma en que CSS carga desde el servidor", correct: false },
            { label: "El sistema de grillas predeterminado del navegador", correct: false },
          ],
          explanation: "No es un modelo de color ni un sistema de grillas. Pensá en las 'capas' que rodean el contenido de una caja (relleno, borde, margen): de eso trata.",
        },
        {
          prompt: "¿Qué son las CSS Custom Properties (variables CSS)?",
          options: [
            { label: "Variables nativas de CSS definidas con `--nombre` y usadas con `var(--nombre)`", correct: true },
            { label: "Variables de JavaScript accesibles desde CSS", correct: false },
            { label: "Clases CSS que se generan automáticamente", correct: false },
            { label: "Propiedades exclusivas de Sass/SCSS", correct: false },
          ],
          explanation: "No vienen de JavaScript ni son exclusivas de Sass: son nativas de CSS. Fijate en la sintaxis que empieza con `--` y se lee con `var(...)`.",
        },
      ],
    ],
  },

  javascript: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Cuál es la diferencia clave entre `let` y `const`?",
          options: [
            { label: "`const` no puede reasignarse después de su declaración", correct: true },
            { label: "`let` solo existe dentro de funciones", correct: false },
            { label: "`const` es más lento que `let`", correct: false },
            { label: "No hay diferencia, son sinónimos", correct: false },
          ],
          explanation: "No son sinónimos ni hay uno más lento. Pensá en qué significa 'constante': una vez que le asignás un valor, no podés apuntarla a otro.",
        },
        {
          prompt: "¿Qué devuelve `typeof null`?",
          options: [
            { label: '"object"', correct: true },
            { label: '"null"', correct: false },
            { label: '"undefined"', correct: false },
            { label: '"boolean"', correct: false },
          ],
          explanation: "Cuidado: la respuesta 'lógica' (`'null'`) es justamente la trampa. Es un bug histórico de JavaScript que nunca se corrigió; `typeof` de `null` devuelve algo inesperado relacionado con objetos.",
        },
        {
          prompt: "¿Qué hace `Array.prototype.map()`?",
          options: [
            { label: "Crea un nuevo array transformando cada elemento con una función", correct: true },
            { label: "Filtra los elementos que cumplan una condición", correct: false },
            { label: "Reduce el array a un único valor", correct: false },
            { label: "Ordena el array alfabéticamente", correct: false },
          ],
          explanation: "Filtrar es `filter`, reducir a un valor es `reduce` y ordenar es `sort`. La que buscás recorre y transforma cada elemento, devolviendo un array nuevo del mismo tamaño.",
        },
      ],
      [
        {
          prompt: "¿Qué es una Promesa (Promise) en JavaScript?",
          options: [
            { label: "Un objeto que representa el resultado eventual de una operación asíncrona", correct: true },
            { label: "Una función que se ejecuta inmediatamente al ser declarada", correct: false },
            { label: "Un tipo especial de array para operaciones matemáticas", correct: false },
            { label: "Una clase que reemplaza a los callbacks en todos los casos", correct: false },
          ],
          explanation: "No es una función que corre ya, ni un array, ni reemplaza a todos los callbacks. Pensá en una 'promesa' real: algo que todavía no está, pero que llegará (o fallará) más adelante.",
        },
        {
          prompt: "¿Qué hace `Object.keys(obj)`?",
          options: [
            { label: "Retorna un array con los nombres de las propiedades propias enumerables del objeto", correct: true },
            { label: "Bloquea el objeto para que no pueda modificarse", correct: false },
            { label: "Elimina todas las claves del objeto", correct: false },
            { label: "Convierte el objeto a formato JSON", correct: false },
          ],
          explanation: "No bloquea, no borra ni convierte a JSON. La pista está en el nombre: `keys` = 'llaves'. Pensá qué parte de un par clave-valor te devolvería.",
        },
        {
          prompt: "¿Cuál es la diferencia entre `==` y `===` en JavaScript?",
          options: [
            { label: "`==` compara valor con coerción de tipos; `===` compara valor Y tipo sin coerción", correct: true },
            { label: "Son completamente equivalentes", correct: false },
            { label: "`===` es más lento pero más preciso", correct: false },
            { label: "`==` solo funciona con números", correct: false },
          ],
          explanation: "No son equivalentes y el de dos signos no es solo para números. El de tres signos es más estricto: compara además el tipo, sin convertir. Pensá qué pasa con `'5'` y `5`.",
        },
      ],
      [
        {
          prompt: "¿Qué es un 'closure' en JavaScript?",
          options: [
            { label: "Una función que recuerda el entorno léxico donde fue creada, incluso después de que ese entorno dejó de existir", correct: true },
            { label: "Una forma de cerrar o terminar una función antes de que finalice", correct: false },
            { label: "Un error que ocurre al llamar una función sin paréntesis", correct: false },
            { label: "Una técnica para importar funciones entre archivos", correct: false },
          ],
          explanation: "No es cerrar una función ni un error de sintaxis. Pensá en una función que 'se lleva puesto' el scope donde nació y sigue recordando esas variables aunque ya no existan afuera.",
        },
        {
          prompt: "¿Qué hace `Promise.all([p1, p2, p3])`?",
          options: [
            { label: "Ejecuta las promesas en paralelo y resuelve cuando TODAS terminan; rechaza si alguna falla", correct: true },
            { label: "Ejecuta las promesas en secuencia, una tras otra", correct: false },
            { label: "Retorna la primera promesa que resuelva", correct: false },
            { label: "Cancela todas las promesas si alguna falla antes de empezar", correct: false },
          ],
          explanation: "No corre en secuencia ni devuelve la primera (eso es `race`). El nombre `all` es la pista: espera a todas... y si una sola falla, el conjunto falla.",
        },
        {
          prompt: "¿Qué es el 'event bubbling' en el DOM?",
          options: [
            { label: "Cuando un evento se propaga hacia arriba desde el elemento clickeado hasta sus ancestros", correct: true },
            { label: "Cuando el navegador anticipa eventos del usuario", correct: false },
            { label: "La velocidad de procesamiento de eventos del browser", correct: false },
            { label: "Un tipo especial de evento de animación CSS", correct: false },
          ],
          explanation: "No es anticipación, ni velocidad, ni animación. Como una burbuja que sube, pensá en qué dirección viaja el evento: del elemento clickeado hacia sus contenedores.",
        },
      ],
    ],
  },

  react: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Qué es un componente en React?",
          options: [
            { label: "Una función que recibe props y devuelve JSX", correct: true },
            { label: "Un archivo de estilos CSS que se importa en la página", correct: false },
            { label: "Una clase de JavaScript que extiende HTMLElement", correct: false },
            { label: "Un script que modifica el DOM directamente", correct: false },
          ],
          explanation: "En React moderno no es un CSS, ni un Web Component (`HTMLElement`), ni manipulación directa del DOM. Pensá en lo más simple: algo que recibe `props` y devuelve JSX.",
        },
        {
          prompt: "¿Para qué sirve `useState`?",
          options: [
            { label: "Para declarar y actualizar estado local en un componente", correct: true },
            { label: "Para hacer fetch de datos a una API", correct: false },
            { label: "Para definir las rutas de la aplicación", correct: false },
            { label: "Para compartir estilos entre componentes", correct: false },
          ],
          explanation: "No es para hacer fetch, ni para rutas, ni para estilos. La palabra 'state' te lo dice: sirve para guardar y actualizar un valor que cambia dentro del componente.",
        },
        {
          prompt: "¿Cuándo usarías `useEffect`?",
          options: [
            { label: "Para sincronizar el componente con un sistema externo (API, timer, subscripción)", correct: true },
            { label: "Para calcular valores derivados del estado", correct: false },
            { label: "Para definir el HTML inicial de la página", correct: false },
            { label: "Siempre que necesitás actualizar el estado", correct: false },
          ],
          explanation: "No es para valores derivados (eso es `useMemo`) ni para cada cambio de estado. Su nombre habla de 'efectos': sincronizar con algo de afuera, como una API, un timer o una suscripción.",
        },
      ],
      [
        {
          prompt: "¿Qué es 'prop drilling' y por qué es un problema?",
          options: [
            { label: "Pasar props a través de múltiples niveles de componentes que no las necesitan", correct: true },
            { label: "Una técnica para optimizar la carga de imágenes en React", correct: false },
            { label: "El proceso de compilar JSX a JavaScript", correct: false },
            { label: "Una forma de inyectar estilos CSS en componentes", correct: false },
          ],
          explanation: "No tiene que ver con imágenes, compilación ni estilos. Imaginá una prop que 'perfora' varios niveles de componentes que ni la usan, solo para llegar a uno más profundo.",
        },
        {
          prompt: "¿Para qué sirve `useCallback`?",
          options: [
            { label: "Para memorizar una función entre renderizados y evitar que se recree innecesariamente", correct: true },
            { label: "Para ejecutar código después de que el componente se monta", correct: false },
            { label: "Para suscribirse a cambios de contexto", correct: false },
            { label: "Para manejar errores en componentes hijo", correct: false },
          ],
          explanation: "No es para el montaje, el contexto ni los errores. Pensá en 'callback' = función: sirve para conservar la MISMA función entre renders y que no se recree. (Su primo `useMemo` hace lo mismo con valores.)",
        },
        {
          prompt: "¿Qué es un 'controlled component' en React?",
          options: [
            { label: "Un input cuyo valor está controlado por el estado de React, no por el DOM", correct: true },
            { label: "Un componente que controla el acceso a rutas protegidas", correct: false },
            { label: "Un componente con estilos en línea controlados", correct: false },
            { label: "Un componente que solo puede ser renderizado una vez", correct: false },
          ],
          explanation: "No tiene que ver con rutas, estilos ni renders únicos. La palabra clave es 'controlado': ¿quién manda sobre el valor del input, el estado de React o el DOM?",
        },
      ],
      [
        {
          prompt: "¿Cuál es la diferencia entre `useMemo` y `useCallback`?",
          options: [
            { label: "useMemo memoriza un VALOR calculado; useCallback memoriza una FUNCIÓN", correct: true },
            { label: "Son equivalentes, solo cambia el nombre por convención", correct: false },
            { label: "useMemo es para efectos secundarios; useCallback para cálculos puros", correct: false },
            { label: "useCallback solo funciona en componentes de clase", correct: false },
          ],
          explanation: "No son equivalentes ni sirven para efectos o clases. Ambos memorizan, pero cosas distintas: uno un valor ya calculado, el otro una función. Sus nombres ('memo' y 'callback') te orientan.",
        },
        {
          prompt: "¿Qué problema resuelve el Context API de React?",
          options: [
            { label: "Permite compartir estado entre componentes sin pasar props manualmente a través de cada nivel", correct: true },
            { label: "Maneja las peticiones HTTP de la aplicación", correct: false },
            { label: "Gestiona el enrutamiento entre páginas", correct: false },
            { label: "Optimiza el rendimiento de re-renderizados automáticamente", correct: false },
          ],
          explanation: "No maneja HTTP ni rutas, y no optimiza renders por arte de magia. Es la respuesta directa al problema del prop drilling: compartir datos sin ir prop por prop en cada nivel.",
        },
        {
          prompt: "¿Qué hace `React.memo()`?",
          options: [
            { label: "Envuelve un componente para que solo se re-renderice si sus props cambian", correct: true },
            { label: "Memoriza el último valor retornado por una función", correct: false },
            { label: "Previene que el componente sea desmontado del DOM", correct: false },
            { label: "Agrega lazy loading automático al componente", correct: false },
          ],
          explanation: "No memoriza el valor de una función (eso es `useMemo`) ni agrega lazy loading. Envuelve un componente entero y evita que se vuelva a renderizar cuando sus props no cambiaron.",
        },
      ],
    ],
  },

  typescript: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Qué ventaja principal ofrece TypeScript sobre JavaScript?",
          options: [
            { label: "Detecta errores de tipo en tiempo de compilación, antes de ejecutar el código", correct: true },
            { label: "Ejecuta código más rápido en el navegador", correct: false },
            { label: "Elimina la necesidad de escribir funciones", correct: false },
            { label: "Reemplaza a CSS para los estilos", correct: false },
          ],
          explanation: "No corre más rápido (transpila a JS), no elimina funciones ni toca los estilos. Su valor aparece ANTES de ejecutar: pensá en qué momento te avisa de un error de tipo.",
        },
        {
          prompt: "¿Cómo tipás el parámetro de esta función? `function saludar(nombre) { ... }`",
          options: [
            { label: "function saludar(nombre: string) { ... }", correct: true },
            { label: "function saludar(string nombre) { ... }", correct: false },
            { label: "function saludar<string>(nombre) { ... }", correct: false },
            { label: "string function saludar(nombre) { ... }", correct: false },
          ],
          explanation: "TypeScript no pone el tipo antes del nombre (eso es Java/C) ni usa `<>` para un parámetro simple. La forma es `nombre: Tipo`, con dos puntos después del identificador.",
        },
        {
          prompt: "¿Qué es una `interface` en TypeScript?",
          options: [
            { label: "Una descripción de la estructura (forma) que debe tener un objeto", correct: true },
            { label: "Una clase abstracta que no se puede instanciar", correct: false },
            { label: "Una función que valida datos en tiempo de ejecución", correct: false },
            { label: "Un archivo de configuración del compilador", correct: false },
          ],
          explanation: "No es una clase, no valida en runtime (desaparece al compilar) ni configura nada. Pensá en un 'contrato de forma': qué propiedades y tipos debe cumplir un objeto.",
        },
      ],
      [
        {
          prompt: "¿Cuál es la diferencia entre `type` e `interface` en TypeScript?",
          options: [
            { label: "Ambos describen formas de objetos, pero `type` también puede representar uniones, primitivos y tuplas", correct: true },
            { label: "`type` es para primitivos; `interface` solo para objetos", correct: false },
            { label: "`interface` es más rápida en compilación", correct: false },
            { label: "No hay diferencia, son completamente intercambiables", correct: false },
          ],
          explanation: "No son totalmente intercambiables ni hay uno 'más rápido'. Los dos describen objetos, pero uno llega más lejos: uniones, primitivos, tuplas. ¿Cuál de los dos?",
        },
        {
          prompt: "¿Qué es un 'union type' en TypeScript?",
          options: [
            { label: "Un tipo que puede ser uno de varios tipos posibles, escrito con `|`", correct: true },
            { label: "La unión de dos interfaces en una sola", correct: false },
            { label: "Un tipo que hereda de múltiples clases", correct: false },
            { label: "Un error de compilación al mezclar tipos", correct: false },
          ],
          explanation: "No es fusionar interfaces ni herencia, y no es un error. Fijate en el símbolo `|` (el 'o' lógico): describe un valor que puede ser de uno entre varios tipos.",
        },
        {
          prompt: "¿Qué hace el operador `as` en TypeScript?",
          options: [
            { label: "Fuerza un tipo sobre un valor (type assertion), sobreescribiendo la inferencia del compilador", correct: true },
            { label: "Importa un módulo con un alias", correct: false },
            { label: "Convierte un tipo en su equivalente JavaScript en runtime", correct: false },
            { label: "Compara dos tipos y retorna el más específico", correct: false },
          ],
          explanation: "No importa con alias ni convierte nada en runtime. Es una 'aserción': le decís al compilador 'confiá, este valor es de este tipo', pasando por encima de su inferencia.",
        },
      ],
      [
        {
          prompt: "¿Qué son los 'generics' en TypeScript?",
          options: [
            { label: "Parámetros de tipo que permiten escribir código reutilizable que funciona con múltiples tipos", correct: true },
            { label: "Tipos globales disponibles en todo el proyecto", correct: false },
            { label: "Valores por defecto para parámetros de funciones", correct: false },
            { label: "Una forma de ignorar errores de tipo temporalmente", correct: false },
          ],
          explanation: "No son tipos globales, ni valores por defecto, ni una forma de silenciar errores. Pensá en un 'parámetro' pero de tipo (la clásica `<T>`), para que una función sirva con muchos tipos.",
        },
        {
          prompt: "¿Qué hace `Partial<T>` en TypeScript?",
          options: [
            { label: "Crea un tipo igual a T pero con todas sus propiedades opcionales", correct: true },
            { label: "Crea un tipo con solo algunas propiedades de T", correct: false },
            { label: "Elimina propiedades undefined de T", correct: false },
            { label: "Hace todas las propiedades de T de solo lectura", correct: false },
          ],
          explanation: "No selecciona 'algunas' propiedades ni las hace de solo lectura. La palabra 'partial' sugiere algo incompleto: pensá qué le pasa a CADA propiedad de `T`.",
        },
        {
          prompt: "¿Qué hace el operador `keyof` en TypeScript?",
          options: [
            { label: "Retorna un union type con los nombres de las propiedades de un tipo", correct: true },
            { label: "Cuenta las propiedades de un objeto en runtime", correct: false },
            { label: "Filtra propiedades undefined de un tipo", correct: false },
            { label: "Ordena las propiedades de un objeto alfabéticamente", correct: false },
          ],
          explanation: "No cuenta en runtime, no filtra ni ordena. 'key' = clave: pensá qué obtenés si juntás los NOMBRES de las propiedades de un tipo en una sola unión.",
        },
      ],
    ],
  },

  nextjs: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Qué es el App Router de Next.js 15?",
          options: [
            { label: "Un sistema de rutas basado en la estructura de carpetas dentro de `app/`", correct: true },
            { label: "Un router que se configura manualmente en un archivo JSON", correct: false },
            { label: "Una librería de animaciones para transiciones entre páginas", correct: false },
            { label: "Un servidor de base de datos incluido con Next.js", correct: false },
          ],
          explanation: "No se configura en un JSON, no es de animaciones ni una base de datos. La clave está en la carpeta `app/`: la estructura de carpetas define las URLs.",
        },
        {
          prompt: "¿Qué es un Server Component en React/Next.js?",
          options: [
            { label: "Un componente que se renderiza en el servidor y no incluye JS en el cliente", correct: true },
            { label: "Un componente que solo corre en el servidor de producción, no en desarrollo", correct: false },
            { label: "Un componente con acceso a la base de datos del servidor de diseño", correct: false },
            { label: "Cualquier componente que use `useEffect`", correct: false },
          ],
          explanation: "No es 'solo en producción' ni 'cualquiera que use `useEffect`' (justamente ese necesitaría cliente). Pensá dónde se renderiza y qué JS termina, o no, en el navegador.",
        },
        {
          prompt: "¿Para qué sirve el archivo `layout.tsx`?",
          options: [
            { label: "Define la UI compartida que envuelve a todas las páginas de esa ruta", correct: true },
            { label: "Configura los colores y tipografías globales de Tailwind", correct: false },
            { label: "Lista las dependencias del proyecto", correct: false },
            { label: "Define las variables de entorno del servidor", correct: false },
          ],
          explanation: "No configura Tailwind, ni lista dependencias, ni define variables de entorno. Pensá en la UI que se mantiene alrededor de las páginas (header, sidebar) mientras navegás.",
        },
      ],
      [
        {
          prompt: "¿Qué es `generateStaticParams` en Next.js?",
          options: [
            { label: "Una función que especifica los parámetros dinámicos a pre-renderizar en build time", correct: true },
            { label: "Un hook para generar IDs únicos en el servidor", correct: false },
            { label: "Una función que configura los parámetros de la API REST", correct: false },
            { label: "Un método para validar los params de una ruta dinámica", correct: false },
          ],
          explanation: "No genera IDs, ni configura una API, ni valida. Para una ruta como `/proyectos/[id]`, pensá qué valores le dirías a Next para armarlos de antemano en el build.",
        },
        {
          prompt: "¿Cuándo usarías `'use client'` en un componente de Next.js?",
          options: [
            { label: "Cuando el componente necesita estado, efectos o event handlers del navegador", correct: true },
            { label: "Siempre que el componente haga fetch de datos", correct: false },
            { label: "Cuando el componente tiene más de 50 líneas", correct: false },
            { label: "Cuando el componente usa estilos con Tailwind", correct: false },
          ],
          explanation: "No depende del largo, ni de Tailwind, y hacer fetch no lo obliga (los Server Components ya pueden). Lo pedís cuando necesitás interactividad del navegador: `useState`, `onClick`, efectos.",
        },
        {
          prompt: "¿Qué es el archivo `loading.tsx` en Next.js App Router?",
          options: [
            { label: "Define la UI de carga que se muestra mientras el contenido de la página carga", correct: true },
            { label: "Configura el tiempo máximo de carga antes de dar error", correct: false },
            { label: "Define los datos de carga inicial de la aplicación", correct: false },
            { label: "Importa las fuentes y estilos al inicio", correct: false },
          ],
          explanation: "No es un timeout, ni datos iniciales, ni fuentes. El nombre lo dice: es lo que ve el usuario MIENTRAS la página termina de traer sus datos.",
        },
      ],
      [
        {
          prompt: "¿Qué diferencia hay entre `fetch` con `cache: 'no-store'` vs `cache: 'force-cache'`?",
          options: [
            { label: "no-store siempre va al servidor (datos frescos); force-cache reutiliza la respuesta en cache", correct: true },
            { label: "no-store es más rápido porque no consulta la red", correct: false },
            { label: "force-cache es obligatorio en producción", correct: false },
            { label: "Son equivalentes, Next.js decide automáticamente", correct: false },
          ],
          explanation: "No son equivalentes y `no-store` no evita la red (al contrario). Leé los nombres: uno dice 'no guardes' (siempre fresco) y el otro 'forzá el cache' (reutiliza la respuesta).",
        },
        {
          prompt: "¿Qué hace `revalidatePath()` o `revalidateTag()` en Next.js?",
          options: [
            { label: "Invalida el cache de una ruta o tag, forzando una nueva búsqueda de datos en el próximo request", correct: true },
            { label: "Redirige al usuario a otra página", correct: false },
            { label: "Recarga el módulo CSS de esa ruta", correct: false },
            { label: "Reinicia el servidor de Next.js", correct: false },
          ],
          explanation: "No redirige, no recarga CSS ni reinicia nada. 'Revalidate' = volver a validar: pensá qué le pasa al cache de esa ruta para que la próxima vez traiga datos frescos.",
        },
        {
          prompt: "¿Cuál es la diferencia entre un Route Handler (`route.ts`) y una Server Action?",
          options: [
            { label: "Route Handler expone un endpoint HTTP; Server Action es una función del servidor llamada desde el cliente sin HTTP explícito", correct: true },
            { label: "Son idénticos en funcionalidad", correct: false },
            { label: "Server Actions son más rápidas pero menos seguras", correct: false },
            { label: "Route Handlers solo funcionan con GET; Server Actions con POST", correct: false },
          ],
          explanation: "No son idénticos y no se dividen por GET/POST. Uno expone una URL/endpoint HTTP clásico; el otro te deja llamar código del servidor desde un form sin definir una ruta.",
        },
      ],
    ],
  },

  tailwind: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Cómo centrás un elemento horizontal y verticalmente con Tailwind + flex?",
          options: [
            { label: "flex items-center justify-center", correct: true },
            { label: "flex align-center content-center", correct: false },
            { label: "flex center-x center-y", correct: false },
            { label: "flex place-center", correct: false },
          ],
          explanation: "Tailwind no tiene clases como `center-x` ni `place-center` para esto. Con flex, una clase alinea el eje principal y otra el cruzado: buscá el par `items-*` + `justify-*`.",
        },
        {
          prompt: "¿Cómo aplicás un estilo solo desde pantallas medianas en adelante?",
          options: [
            { label: "Con el prefijo `md:`, por ejemplo `md:text-xl`", correct: true },
            { label: "Con el sufijo `-md`, por ejemplo `text-xl-md`", correct: false },
            { label: "Usando `@media (min-width: 768px)` en el className", correct: false },
            { label: "Con la clase `responsive-md text-xl`", correct: false },
          ],
          explanation: "No se usa un sufijo, ni `@media` dentro del className, ni una clase 'responsive'. Tailwind es mobile-first con PREFIJOS de breakpoint: pensá en `md:` delante de la utilidad.",
        },
        {
          prompt: "¿Qué hace la clase `truncate` en Tailwind?",
          options: [
            { label: "Corta el texto con `...` si no entra en el contenedor", correct: true },
            { label: "Elimina el elemento del DOM si el texto es muy largo", correct: false },
            { label: "Reduce el tamaño de la fuente automáticamente", correct: false },
            { label: "Oculta el elemento con `display: none`", correct: false },
          ],
          explanation: "No borra el elemento ni cambia el tamaño de la fuente. 'Truncate' = recortar: pensá qué pasa con un texto largo que no entra, y esos tres puntitos `...`.",
        },
      ],
      [
        {
          prompt: "¿Cómo aplicás un color personalizado en Tailwind v4?",
          options: [
            { label: "Definiendo CSS custom properties en el bloque `@theme` del CSS", correct: true },
            { label: "Editando el archivo tailwind.config.js", correct: false },
            { label: "Usando `style={{ color: '#hex' }}` en el elemento", correct: false },
            { label: "Creando un archivo de variables separado e importándolo", correct: false },
          ],
          explanation: "En v4 la config se mudó del `tailwind.config.js` al CSS. Pensá en un bloque especial del CSS (`@theme`) donde definís variables y Tailwind genera las clases solo.",
        },
        {
          prompt: "¿Qué significa la clase `group` y `group-hover:` en Tailwind?",
          options: [
            { label: "`group` marca el padre; `group-hover:` aplica estilos a un hijo cuando el padre tiene hover", correct: true },
            { label: "Define un grupo de animaciones coordinadas", correct: false },
            { label: "Agrupa estilos para reutilizarlos con un nombre", correct: false },
            { label: "Es una variante para aplicar estilos a múltiples elementos a la vez", correct: false },
          ],
          explanation: "No es para animaciones ni para nombrar estilos reutilizables. Pensá en una relación padre-hijo: uno marca al contenedor y el otro reacciona en el hijo cuando el contenedor tiene hover.",
        },
        {
          prompt: "¿Qué hace `@apply` en Tailwind?",
          options: [
            { label: "Extrae un conjunto de clases de utilidad en un selector CSS personalizado", correct: true },
            { label: "Aplica los estilos de Tailwind a un elemento específico via JavaScript", correct: false },
            { label: "Importa la configuración de Tailwind de otro archivo", correct: false },
            { label: "Genera variantes personalizadas de clases existentes", correct: false },
          ],
          explanation: "No usa JavaScript, no importa config ni genera variantes. Pensá en 'aplicar' varias utilidades de Tailwind dentro de un selector CSS propio para no repetirlas.",
        },
      ],
      [
        {
          prompt: "¿Cuál es la diferencia entre `gap`, `space-x` y `margin` en Tailwind para separar elementos?",
          options: [
            { label: "gap funciona en flex/grid y es bidireccional; space-x agrega margin-left a hijos; margin es manual por elemento", correct: true },
            { label: "Son equivalentes, solo varía la sintaxis", correct: false },
            { label: "gap solo funciona con CSS Grid, no con Flexbox", correct: false },
            { label: "space-x es más moderno y reemplaza a gap y margin", correct: false },
          ],
          explanation: "No son equivalentes y `gap` sí funciona en Flexbox (no solo Grid). Pensá cómo separa cada uno: uno como propiedad del contenedor, otro metiendo margen a los hijos, otro a mano.",
        },
        {
          prompt: "¿Cómo crearías un valor arbitrario en Tailwind, como un padding de exactamente 17px?",
          options: [
            { label: "Con la sintaxis de corchetes: `p-[17px]`", correct: true },
            { label: "Agregándolo al config: `padding: { 17: '17px' }`", correct: false },
            { label: "Solo es posible con estilos en línea: `style={{ padding: '17px' }}`", correct: false },
            { label: "Con la clase `p-custom-17`", correct: false },
          ],
          explanation: "No hace falta tocar el config ni caer en estilos inline. Tailwind permite meter un valor exacto con una sintaxis de corchetes `[...]` pegada a la utilidad.",
        },
        {
          prompt: "¿Qué hace la variante `dark:` en Tailwind?",
          options: [
            { label: "Aplica la clase cuando el sistema operativo o la página tiene modo oscuro activo", correct: true },
            { label: "Aplica la clase solo en fondos oscuros detectados automáticamente", correct: false },
            { label: "Es un alias de `hover:` para elementos con fondo negro", correct: false },
            { label: "Requiere JavaScript para funcionar", correct: false },
          ],
          explanation: "No detecta fondos oscuros solo, no es un alias de `hover:` y no necesita JS para lo básico. Pensá cuándo se activa: cuando el modo oscuro está puesto (por el sistema o por una clase en la raíz).",
        },
      ],
    ],
  },

  nodejs: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Qué es Node.js?",
          options: [
            { label: "Un entorno de ejecución de JavaScript fuera del navegador", correct: true },
            { label: "Un framework de frontend como React o Vue", correct: false },
            { label: "Una base de datos NoSQL basada en JavaScript", correct: false },
            { label: "Un lenguaje de programación distinto a JavaScript", correct: false },
          ],
          explanation: "No es un framework de frontend, ni una base de datos, ni un lenguaje nuevo (sigue siendo JavaScript). Pensá dónde te deja correr ese JS: fuera del navegador.",
        },
        {
          prompt: "¿Qué es `npm`?",
          options: [
            { label: "El gestor de paquetes de Node.js para instalar dependencias", correct: true },
            { label: "Un servidor web incluido con Node.js", correct: false },
            { label: "El lenguaje de templates de Node.js", correct: false },
            { label: "Una herramienta para compilar TypeScript a JavaScript", correct: false },
          ],
          explanation: "No es un servidor, ni un lenguaje de plantillas, ni un compilador. Pensá qué usás para instalar librerías y anotarlas en `package.json`.",
        },
        {
          prompt: "¿Qué es el Event Loop en Node.js?",
          options: [
            { label: "El mecanismo que permite a Node manejar operaciones asíncronas sin bloquear", correct: true },
            { label: "Un bucle `for` que recorre todos los eventos del sistema", correct: false },
            { label: "Una función que se ejecuta cada segundo para chequear el estado", correct: false },
            { label: "El proceso que compila el código TypeScript", correct: false },
          ],
          explanation: "No es un `for` literal, ni un timer que corre cada segundo, ni un compilador. Es lo que hace que Node, siendo un solo hilo, atienda otras cosas mientras espera I/O.",
        },
      ],
      [
        {
          prompt: "¿Qué es un 'middleware' en Express?",
          options: [
            { label: "Una función que se ejecuta entre la petición y la respuesta, pudiendo transformar datos o cortar el flujo", correct: true },
            { label: "Una capa de base de datos entre Node y Postgres", correct: false },
            { label: "Un archivo de configuración de Express", correct: false },
            { label: "Un tipo de ruta que solo acepta peticiones autenticadas", correct: false },
          ],
          explanation: "No es una capa de base de datos, ni un archivo de config, ni un tipo de ruta. 'Middle' = en el medio: pensá en una función entre el request y el response que recibe `(req, res, next)`.",
        },
        {
          prompt: "¿Cuál es la diferencia entre `require()` y `import` en Node.js?",
          options: [
            { label: "require es CommonJS (síncrono); import es ES Modules (estático, permite tree shaking)", correct: true },
            { label: "Son equivalentes, solo cambia la sintaxis", correct: false },
            { label: "import solo funciona con paquetes de npm", correct: false },
            { label: "require es más moderno y reemplaza a import", correct: false },
          ],
          explanation: "No son equivalentes y `require` no es 'lo más moderno' (es al revés). Uno es CommonJS, el otro ES Modules: pensá cuál es el estándar nuevo que permite tree shaking.",
        },
        {
          prompt: "¿Qué es `process.env` en Node.js?",
          options: [
            { label: "Un objeto que expone las variables de entorno del sistema donde corre el proceso", correct: true },
            { label: "El proceso actual de la CPU que ejecuta Node", correct: false },
            { label: "Un objeto para leer archivos del sistema de archivos", correct: false },
            { label: "La configuración del gestor de paquetes npm", correct: false },
          ],
          explanation: "No es la CPU, ni para leer archivos, ni la config de npm. 'env' = environment: pensá dónde leés variables como `PORT` o claves sin hardcodearlas.",
        },
      ],
      [
        {
          prompt: "¿Qué es un 'stream' en Node.js y cuándo lo usarías?",
          options: [
            { label: "Una secuencia de datos procesados en trozos; ideal para archivos grandes o respuestas HTTP largas", correct: true },
            { label: "Un tipo de loop especial para operaciones asíncronas", correct: false },
            { label: "Una conexión persistente con WebSockets", correct: false },
            { label: "Un módulo para gestionar múltiples procesos de Node", correct: false },
          ],
          explanation: "No es un loop, ni WebSockets, ni multiproceso. Pensá en un 'chorro' de datos que procesás por partes, sin cargar todo el archivo en memoria de golpe.",
        },
        {
          prompt: "¿Cuál es la diferencia entre `setImmediate()` y `process.nextTick()` en Node.js?",
          options: [
            { label: "nextTick se ejecuta antes de cualquier I/O en la misma fase; setImmediate se ejecuta en la siguiente iteración del Event Loop", correct: true },
            { label: "Son equivalentes en comportamiento", correct: false },
            { label: "setImmediate es más rápido en todos los casos", correct: false },
            { label: "nextTick es un alias de setTimeout(fn, 0)", correct: false },
          ],
          explanation: "No son equivalentes ni uno es un `setTimeout(fn, 0)`. Pensá en la prioridad: uno suena a 'ya mismo, antes del I/O'; el otro se difiere a la próxima vuelta del loop.",
        },
        {
          prompt: "¿Qué son las 'mejores prácticas de seguridad' básicas para un servidor Express?",
          options: [
            { label: "Usar helmet, validar inputs, no exponer stack traces en producción y manejar errores centralmente", correct: true },
            { label: "Usar solo HTTPS y no hacer nada más", correct: false },
            { label: "Encriptar todas las respuestas JSON", correct: false },
            { label: "Ejecutar el servidor como root para tener todos los permisos", correct: false },
          ],
          explanation: "HTTPS solo no alcanza, encriptar todo el JSON no es la práctica, y correr como root es lo contrario a seguro. Buscá la opción que combina varias defensas (headers, validar inputs, no filtrar stack traces).",
        },
      ],
    ],
  },

  apis: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Qué método HTTP se usa para CREAR un nuevo recurso?",
          options: [
            { label: "POST", correct: true },
            { label: "GET", correct: false },
            { label: "PUT", correct: false },
            { label: "DELETE", correct: false },
          ],
          explanation: "`GET` lee, `PUT` actualiza y `DELETE` elimina. Para dar de alta un recurso nuevo queda el verbo que 'envía' datos al servidor para crearlo.",
        },
        {
          prompt: "¿Qué código de estado HTTP indica que se creó un recurso exitosamente?",
          options: [
            { label: "201 Created", correct: true },
            { label: "200 OK", correct: false },
            { label: "204 No Content", correct: false },
            { label: "301 Moved Permanently", correct: false },
          ],
          explanation: "`200` es un éxito genérico (lectura), `204` es éxito sin cuerpo y `301` es una redirección. Para 'algo nuevo se creó' hay un 2xx específico distinto de 200.",
        },
        {
          prompt: "¿Qué significa que una API sea 'stateless' (sin estado)?",
          options: [
            { label: "Cada petición contiene toda la info que el servidor necesita; no hay sesión guardada", correct: true },
            { label: "La API no tiene base de datos", correct: false },
            { label: "La API solo acepta peticiones GET", correct: false },
            { label: "La API no devuelve errores", correct: false },
          ],
          explanation: "No significa 'sin base de datos', ni 'solo GET', ni 'sin errores'. 'Stateless' = sin estado: pensá si el servidor recuerda algo de una petición a la siguiente.",
        },
      ],
      [
        {
          prompt: "¿Cuál es la diferencia entre PUT y PATCH?",
          options: [
            { label: "PUT reemplaza el recurso completo; PATCH actualiza solo los campos enviados", correct: true },
            { label: "Son equivalentes, solo cambia la convención del equipo", correct: false },
            { label: "PATCH borra el recurso; PUT lo actualiza", correct: false },
            { label: "PUT es más seguro porque valida todos los campos", correct: false },
          ],
          explanation: "No son equivalentes y ninguno borra. Uno reemplaza el recurso entero (lo que no mandes se pierde), el otro toca solo los campos que enviás. Pensá cuál es 'parcial'.",
        },
        {
          prompt: "¿Qué es la autenticación con JWT (JSON Web Token)?",
          options: [
            { label: "Un token firmado que el cliente envía en cada request para probar su identidad sin guardar sesión en el servidor", correct: true },
            { label: "Un sistema de cookies que el servidor gestiona por sesión", correct: false },
            { label: "Un protocolo de encriptación para bases de datos", correct: false },
            { label: "Un formato de respuesta para APIs seguras", correct: false },
          ],
          explanation: "No es una cookie de sesión del servidor, ni encriptación de base de datos, ni un formato de respuesta. Pensá en un 'token firmado' que viaja en cada request y evita guardar sesión.",
        },
        {
          prompt: "¿Qué significa CORS y cuándo aparece?",
          options: [
            { label: "Cross-Origin Resource Sharing: bloquea peticiones desde un origen diferente; se configura en el backend", correct: true },
            { label: "Un tipo de error en la base de datos", correct: false },
            { label: "Un formato de compresión para respuestas HTTP", correct: false },
            { label: "Un protocolo de autenticación entre servicios", correct: false },
          ],
          explanation: "No es un error de base de datos, ni compresión, ni autenticación. La sigla habla de 'origen cruzado': pensá qué controla cuando un sitio llama a una API de otro dominio.",
        },
      ],
      [
        {
          prompt: "¿Qué es la idempotencia y qué métodos HTTP son idempotentes?",
          options: [
            { label: "Una operación es idempotente si repetirla da el mismo resultado; GET, PUT y DELETE lo son, POST no", correct: true },
            { label: "La propiedad de una API de responder siempre en menos de 100ms", correct: false },
            { label: "La capacidad de una API de manejar múltiples idiomas", correct: false },
            { label: "Un método de compresión de respuestas HTTP", correct: false },
          ],
          explanation: "No tiene que ver con velocidad, idiomas ni compresión. 'Idempotente' = repetir sin efectos nuevos: pensá cuál método, repetido, deja el mismo estado, y por qué `POST` no.",
        },
        {
          prompt: "¿Qué es 'rate limiting' en una API?",
          options: [
            { label: "Limitar la cantidad de peticiones que un cliente puede hacer en un período de tiempo para evitar abuso", correct: true },
            { label: "La velocidad máxima de transferencia de datos del servidor", correct: false },
            { label: "Un tipo de paginación para listas largas", correct: false },
            { label: "La latencia mínima garantizada por la API", correct: false },
          ],
          explanation: "No es velocidad de transferencia, ni paginación, ni latencia. 'Rate' = tasa: pensá en poner un tope de cuántas peticiones por minuto para frenar el abuso (y el `429`).",
        },
        {
          prompt: "¿Qué diferencia hay entre autenticación y autorización?",
          options: [
            { label: "Autenticación verifica QUIÉN sos; autorización verifica QUÉ podés hacer", correct: true },
            { label: "Son sinónimos en el contexto de APIs REST", correct: false },
            { label: "Autenticación es para usuarios; autorización es para servicios entre sí", correct: false },
            { label: "Autorización ocurre antes que la autenticación", correct: false },
          ],
          explanation: "No son sinónimos y una no va necesariamente primero. Una responde '¿quién sos?' y la otra '¿qué te está permitido?'. Pensá cuál de las dos tiene que ocurrir antes.",
        },
      ],
    ],
  },

  supabase: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Qué base de datos usa Supabase internamente?",
          options: [
            { label: "PostgreSQL", correct: true },
            { label: "MongoDB", correct: false },
            { label: "MySQL", correct: false },
            { label: "SQLite", correct: false },
          ],
          explanation: "No es NoSQL (Mongo) ni SQLite, y tampoco MySQL. Supabase se construye sobre la base relacional open source con 'superpoderes' — la misma estrella `postgres` de este mapa.",
        },
        {
          prompt: "¿Qué es Row Level Security (RLS) en Supabase?",
          options: [
            { label: "Políticas que controlan quién puede leer o escribir cada fila de una tabla", correct: true },
            { label: "Un sistema de backups automáticos por fila", correct: false },
            { label: "Un índice especial para acelerar las queries", correct: false },
            { label: "Un límite de filas por tabla en el plan gratuito", correct: false },
          ],
          explanation: "No son backups, ni un índice, ni un límite del plan. 'Row Level' = a nivel de fila: pensá en reglas que deciden quién puede leer o escribir cada fila.",
        },
        {
          prompt: "¿Cómo autentica un usuario con Supabase Auth?",
          options: [
            { label: "Con `supabase.auth.signInWithPassword()` que devuelve un JWT", correct: true },
            { label: "Con una cookie de sesión que Supabase maneja automáticamente sin código", correct: false },
            { label: "Enviando el password en texto plano al servidor", correct: false },
            { label: "Solo mediante OAuth (Google, GitHub), sin email/password", correct: false },
          ],
          explanation: "No se hace 'sin código' con una cookie mágica, no manda el password en texto plano, y no es solo OAuth. Buscá el método explícito de `auth` que valida credenciales y devuelve un JWT.",
        },
      ],
      [
        {
          prompt: "¿Qué es una 'Edge Function' en Supabase?",
          options: [
            { label: "Una función serverless que corre cerca del usuario para menor latencia", correct: true },
            { label: "Una función que se ejecuta en el borde del esquema de la base de datos", correct: false },
            { label: "Un trigger que se activa cuando se modifica una fila", correct: false },
            { label: "Una función de validación automática de campos", correct: false },
          ],
          explanation: "No es un trigger de la DB ni validación de campos, y 'edge' no se refiere al esquema. Pensá en 'el borde de la red': código serverless corriendo cerca del usuario.",
        },
        {
          prompt: "¿Cómo habilitarías RLS y crearías una política para que solo el owner vea sus filas?",
          options: [
            { label: "ALTER TABLE tabla ENABLE ROW LEVEL SECURITY; + CREATE POLICY ... USING (user_id = auth.uid())", correct: true },
            { label: "Agregando `@rls` como comentario en la definición de la tabla", correct: false },
            { label: "Configurándolo desde el dashboard sin SQL", correct: false },
            { label: "Usando supabase.rls.enable() en el cliente", correct: false },
          ],
          explanation: "No se hace con un comentario `@rls` ni con `supabase.rls.enable()`, y no basta el dashboard. Es SQL de verdad: primero se habilita RLS en la tabla y luego una política que compara con `auth.uid()`.",
        },
        {
          prompt: "¿Para qué sirve `supabase.storage` en el cliente?",
          options: [
            { label: "Para subir, descargar y gestionar archivos (imágenes, videos, documentos)", correct: true },
            { label: "Para guardar el estado de la sesión del usuario", correct: false },
            { label: "Para hacer cache de las queries de base de datos", correct: false },
            { label: "Para configurar las variables de entorno del proyecto", correct: false },
          ],
          explanation: "No guarda la sesión, ni cachea queries, ni configura variables. 'Storage' = almacenamiento: pensá en archivos como avatares, imágenes o documentos.",
        },
      ],
      [
        {
          prompt: "¿Cuál es la diferencia entre el cliente `createClient` anónimo y el cliente con `service_role`?",
          options: [
            { label: "El anónimo respeta RLS; el service_role tiene acceso total sin políticas (solo se usa en backend seguro)", correct: true },
            { label: "El service_role es para producción; el anónimo solo para desarrollo", correct: false },
            { label: "Son equivalentes en permisos, solo varía el nombre", correct: false },
            { label: "El anónimo es más rápido porque no valida permisos", correct: false },
          ],
          explanation: "No es 'prod vs dev' ni una cuestión de velocidad, y no son equivalentes. Uno obedece las políticas RLS; el otro las saltea por completo (por eso vive solo en el backend).",
        },
        {
          prompt: "¿Qué es el 'realtime' de Supabase?",
          options: [
            { label: "Suscripciones en tiempo real a cambios en la DB via WebSockets usando `supabase.channel().on()`", correct: true },
            { label: "Un sistema de cache que actualiza datos cada segundo", correct: false },
            { label: "Un dashboard de monitoreo en tiempo real del servidor", correct: false },
            { label: "Una API REST que siempre devuelve datos frescos sin cache", correct: false },
          ],
          explanation: "No es un cache que refresca cada segundo, ni un dashboard, ni REST sin cache. Pensá en suscribirte y recibir inserts/updates/deletes en el momento en que ocurren.",
        },
        {
          prompt: "¿Qué función tiene `supabase.auth.getUser(token)` en el backend?",
          options: [
            { label: "Valida el JWT del cliente y devuelve los datos del usuario autenticado", correct: true },
            { label: "Crea un nuevo usuario con ese token como contraseña", correct: false },
            { label: "Elimina la sesión del usuario con ese token", correct: false },
            { label: "Genera un token nuevo si el anterior expiró", correct: false },
          ],
          explanation: "No crea usuarios, no cierra sesión ni emite un token nuevo. Pensá qué hace el backend con el token del header `Authorization`: comprobar quién es y traer sus datos.",
        },
      ],
    ],
  },

  postgres: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Qué es una clave primaria (PRIMARY KEY)?",
          options: [
            { label: "Un identificador único que no puede repetirse ni ser NULL en la tabla", correct: true },
            { label: "La primera columna de cualquier tabla", correct: false },
            { label: "La contraseña de acceso a la base de datos", correct: false },
            { label: "Un índice opcional para acelerar búsquedas", correct: false },
          ],
          explanation: "No es 'la primera columna' ni una contraseña, y no es opcional. Pensá en el identificador que hace única a cada fila: no se repite ni queda vacío (NULL).",
        },
        {
          prompt: "¿Qué hace un `JOIN` en SQL?",
          options: [
            { label: "Combina filas de dos tablas basándose en una condición relacionada", correct: true },
            { label: "Une dos bases de datos en una sola", correct: false },
            { label: "Concatena el texto de dos columnas", correct: false },
            { label: "Copia datos de una tabla a otra", correct: false },
          ],
          explanation: "No une bases de datos, no concatena texto ni copia filas. 'Join' = unir: pensá en juntar filas de dos tablas que se relacionan por una condición.",
        },
        {
          prompt: "¿Cuál es la diferencia entre FOREIGN KEY y PRIMARY KEY?",
          options: [
            { label: "La FOREIGN KEY referencia la PRIMARY KEY de otra tabla para establecer relaciones", correct: true },
            { label: "Son lo mismo, solo con nombres distintos", correct: false },
            { label: "La FOREIGN KEY es la copia de seguridad de la PRIMARY KEY", correct: false },
            { label: "La FOREIGN KEY solo existe en tablas de usuarios", correct: false },
          ],
          explanation: "No son lo mismo, no es un backup ni exclusiva de usuarios. 'Foreign' = ajena: pensá en una columna que apunta a la clave primaria de OTRA tabla para relacionarlas.",
        },
      ],
      [
        {
          prompt: "¿Qué hace `ON DELETE CASCADE` en una FOREIGN KEY?",
          options: [
            { label: "Elimina automáticamente las filas dependientes cuando se elimina la fila referenciada", correct: true },
            { label: "Previene la eliminación de filas que tienen referencias", correct: false },
            { label: "Actualiza el valor de la FK cuando cambia la PK referenciada", correct: false },
            { label: "Crea una copia de la fila antes de eliminarla", correct: false },
          ],
          explanation: "No previene el borrado, no actualiza la FK ni copia nada. 'Cascade' = cascada: si borrás la fila padre, pensá qué pasa 'en cadena' con las que dependían de ella.",
        },
        {
          prompt: "¿Qué es un índice en PostgreSQL y cuándo conviene crearlo?",
          options: [
            { label: "Una estructura que acelera búsquedas; conviene en columnas con muchos WHERE o JOIN", correct: true },
            { label: "Una copia de seguridad automática de la tabla", correct: false },
            { label: "Una restricción que evita duplicados en una columna", correct: false },
            { label: "Una vista materializada de una tabla", correct: false },
          ],
          explanation: "No es un backup, ni una restricción de unicidad, ni una vista. Como el índice de un libro, sirve para encontrar más rápido: pensá en qué columnas (las que filtrás o joineás) conviene.",
        },
        {
          prompt: "¿Qué diferencia hay entre `VARCHAR(255)` y `TEXT` en PostgreSQL?",
          options: [
            { label: "En PostgreSQL son casi equivalentes en rendimiento; TEXT no tiene límite explícito de longitud", correct: true },
            { label: "VARCHAR es mucho más rápido para búsquedas", correct: false },
            { label: "TEXT no puede tener índices", correct: false },
            { label: "VARCHAR solo acepta caracteres ASCII", correct: false },
          ],
          explanation: "Ojo, esto es específico de PostgreSQL: acá `TEXT` sí puede indexarse y `VARCHAR` no se limita a ASCII. Pensá en la diferencia REAL de rendimiento entre ambos en Postgres.",
        },
      ],
      [
        {
          prompt: "¿Qué es una 'transacción' en PostgreSQL?",
          options: [
            { label: "Un bloque de operaciones que se ejecutan todas o ninguna, delimitado por BEGIN y COMMIT", correct: true },
            { label: "Una sola query que modifica múltiples tablas", correct: false },
            { label: "Un log de auditoría de cambios en la base de datos", correct: false },
            { label: "Un tipo de constraint para asegurar consistencia", correct: false },
          ],
          explanation: "No es una sola query, ni un log, ni un constraint. Pensá en 'todo o nada': un bloque entre `BEGIN` y `COMMIT` que, si algo falla, se deshace con `ROLLBACK`.",
        },
        {
          prompt: "¿Qué hace `EXPLAIN ANALYZE` en PostgreSQL?",
          options: [
            { label: "Muestra el plan de ejecución real de una query junto con tiempos, útil para optimizar", correct: true },
            { label: "Valida la sintaxis de la query sin ejecutarla", correct: false },
            { label: "Genera estadísticas globales de la base de datos", correct: false },
            { label: "Explica en lenguaje natural qué hace la query", correct: false },
          ],
          explanation: "No solo valida sintaxis, no da stats globales ni traduce a lenguaje natural. El `ANALYZE` es la pista: la corre de verdad y te muestra el plan con tiempos reales.",
        },
        {
          prompt: "¿Qué es un 'trigger' en PostgreSQL?",
          options: [
            { label: "Una función que se ejecuta automáticamente antes o después de ciertas operaciones en una tabla", correct: true },
            { label: "Una alerta que notifica al desarrollador de errores en queries", correct: false },
            { label: "Un índice especial que se actualiza automáticamente", correct: false },
            { label: "Una restricción de validación a nivel de fila", correct: false },
          ],
          explanation: "No es una alerta para vos, ni un índice, ni un constraint. 'Trigger' = gatillo: pensá en algo que se dispara solo antes o después de un INSERT/UPDATE/DELETE.",
        },
      ],
    ],
  },

  sql: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Qué cláusula se usa para filtrar filas en un SELECT?",
          options: [
            { label: "WHERE", correct: true },
            { label: "HAVING", correct: false },
            { label: "FILTER", correct: false },
            { label: "LIMIT", correct: false },
          ],
          explanation: "`HAVING` filtra grupos (después de `GROUP BY`), `LIMIT` corta la cantidad de filas y `FILTER` no es la cláusula base. Buscás la que filtra filas ANTES de agrupar.",
        },
        {
          prompt: "¿Qué hace `GROUP BY`?",
          options: [
            { label: "Agrupa filas con el mismo valor para aplicar funciones como COUNT o SUM", correct: true },
            { label: "Ordena los resultados alfabéticamente por la columna indicada", correct: false },
            { label: "Une dos tablas en una sola", correct: false },
            { label: "Elimina filas duplicadas del resultado", correct: false },
          ],
          explanation: "No ordena (eso es `ORDER BY`), no une tablas (`JOIN`) ni quita duplicados (`DISTINCT`). Pensá en juntar filas que comparten un valor para contarlas o sumarlas.",
        },
        {
          prompt: "¿Qué diferencia hay entre `COUNT(*)` y `COUNT(columna)`?",
          options: [
            { label: "`COUNT(*)` cuenta todas las filas; `COUNT(columna)` ignora los NULL", correct: true },
            { label: "Son idénticos, solo es diferente sintaxis", correct: false },
            { label: "`COUNT(*)` es más lento que `COUNT(columna)`", correct: false },
            { label: "`COUNT(columna)` suma los valores numéricos de la columna", correct: false },
          ],
          explanation: "No son idénticos y `COUNT` no suma valores (eso es `SUM`). Pensá qué pasa con las filas donde esa columna es `NULL`: una versión las cuenta, la otra las ignora.",
        },
      ],
      [
        {
          prompt: "¿Cuál es la diferencia entre `INNER JOIN` y `LEFT JOIN`?",
          options: [
            { label: "INNER retorna solo filas con coincidencia en ambas tablas; LEFT retorna todas las de la tabla izquierda", correct: true },
            { label: "LEFT JOIN es más rápido que INNER JOIN", correct: false },
            { label: "Son equivalentes cuando todas las filas tienen coincidencia", correct: false },
            { label: "INNER JOIN incluye NULL; LEFT JOIN los excluye", correct: false },
          ],
          explanation: "No es cuestión de velocidad y no siempre son equivalentes. Pensá qué pasa cuando NO hay coincidencia: uno descarta esas filas, el otro conserva las de la tabla de la izquierda con `NULL`.",
        },
        {
          prompt: "¿Qué hace la cláusula `HAVING`?",
          options: [
            { label: "Filtra grupos después de aplicar GROUP BY (equivalente a WHERE para grupos agregados)", correct: true },
            { label: "Es un alias más legible de WHERE", correct: false },
            { label: "Filtra columnas antes de que se aplique SELECT", correct: false },
            { label: "Ordena los resultados después de GROUP BY", correct: false },
          ],
          explanation: "No es un simple alias de `WHERE` ni ordena nada. La clave: `WHERE` no puede usar `COUNT`/`SUM`. Pensá cuál filtra DESPUÉS de agrupar, sobre valores ya agregados.",
        },
        {
          prompt: "¿Qué hace `DISTINCT` en un SELECT?",
          options: [
            { label: "Elimina filas duplicadas del resultado", correct: true },
            { label: "Selecciona solo las columnas únicas de la tabla", correct: false },
            { label: "Ordena los resultados de forma aleatoria", correct: false },
            { label: "Filtra NULL de las columnas seleccionadas", correct: false },
          ],
          explanation: "No ordena al azar ni filtra `NULL`. 'Distinct' = distintos: pensá qué hace con las filas repetidas del resultado.",
        },
      ],
      [
        {
          prompt: "¿Qué es una CTE (Common Table Expression)?",
          options: [
            { label: "Una query temporal definida con WITH que mejora la legibilidad de queries complejas", correct: true },
            { label: "Una tabla temporal en disco para operaciones largas", correct: false },
            { label: "Un tipo de índice para queries frecuentes", correct: false },
            { label: "Una restricción de integridad a nivel de tabla", correct: false },
          ],
          explanation: "No es una tabla en disco, ni un índice, ni un constraint. Fijate en el `WITH`: define un resultado temporal con nombre para hacer más legibles las queries complejas.",
        },
        {
          prompt: "¿Cuál es la diferencia entre `UNION` y `UNION ALL`?",
          options: [
            { label: "UNION elimina duplicados entre los resultados; UNION ALL los mantiene (y es más rápido)", correct: true },
            { label: "UNION ALL solo funciona cuando las tablas tienen el mismo número de columnas", correct: false },
            { label: "Son equivalentes en resultado", correct: false },
            { label: "UNION es más rápido porque no valida tipos", correct: false },
          ],
          explanation: "No son equivalentes y `UNION` no es el más rápido. Pensá qué paso extra hace uno de ellos con los duplicados — ese paso es justo lo que lo vuelve más lento.",
        },
        {
          prompt: "¿Qué es una subquery (subconsulta) correlacionada?",
          options: [
            { label: "Una subquery que referencia columnas de la query externa y se re-ejecuta para cada fila", correct: true },
            { label: "Una subquery que devuelve siempre el mismo resultado independiente de la query externa", correct: false },
            { label: "Una subquery usada solo en la cláusula FROM", correct: false },
            { label: "Una subquery que se ejecuta una sola vez antes que la query principal", correct: false },
          ],
          explanation: "No da siempre el mismo resultado ni corre una sola vez. 'Correlacionada' = atada a la query externa: pensá cuántas veces se ejecuta si depende de cada fila de afuera.",
        },
      ],
    ],
  },

  python: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Cómo se define una función en Python?",
          options: [
            { label: "def nombre_funcion(params):", correct: true },
            { label: "function nombre_funcion(params) {}", correct: false },
            { label: "fn nombre_funcion(params) =>", correct: false },
            { label: "func nombre_funcion(params):", correct: false },
          ],
          explanation: "Python no usa `function`, ni `fn`, ni llaves `{}`. Su palabra clave son tres letras y el cuerpo se marca con indentación y dos puntos. Cuidado con el impostor `func`.",
        },
        {
          prompt: "¿Cuál es la diferencia entre una lista `[]` y una tupla `()` en Python?",
          options: [
            { label: "Las listas son mutables (modificables); las tuplas son inmutables", correct: true },
            { label: "Las listas guardan números; las tuplas guardan texto", correct: false },
            { label: "No hay diferencia, es solo una cuestión de estilo", correct: false },
            { label: "Las tuplas pueden tener elementos duplicados; las listas no", correct: false },
          ],
          explanation: "No se dividen por tipo de dato ni por permitir duplicados, y sí hay diferencia. Pensá en `[]` vs `()`: una se puede modificar después de creada y la otra queda fija.",
        },
        {
          prompt: "¿Qué hace `enumerate()` en un bucle for?",
          options: [
            { label: "Devuelve el índice y el valor de cada elemento en cada iteración", correct: true },
            { label: "Cuenta cuántos elementos tiene una lista", correct: false },
            { label: "Ordena la lista antes de iterar", correct: false },
            { label: "Convierte todos los elementos a números enteros", correct: false },
          ],
          explanation: "No cuenta, no ordena ni convierte a enteros. Te evita el `range(len(...))`: pensá qué PAR de cosas te entrega en cada vuelta del `for`.",
        },
      ],
      [
        {
          prompt: "¿Qué es un 'list comprehension' en Python?",
          options: [
            { label: "Una forma concisa de crear una lista: `[expr for x in iterable if condición]`", correct: true },
            { label: "Un tipo especial de lista que no acepta duplicados", correct: false },
            { label: "Una función integrada para copiar listas", correct: false },
            { label: "La documentación inline de una lista", correct: false },
          ],
          explanation: "No es una lista sin duplicados (eso es un `set`), ni una función de copia, ni documentación. Pensá en armar una lista en UNA línea con un `for` (y un `if` opcional) dentro de los corchetes.",
        },
        {
          prompt: "¿Cuál es la diferencia entre un diccionario `{}` y un conjunto (`set`) en Python?",
          options: [
            { label: "Un dict tiene pares clave-valor; un set tiene solo valores únicos sin orden garantizado", correct: true },
            { label: "Son equivalentes, solo cambia la sintaxis", correct: false },
            { label: "Un set puede tener duplicados; un dict no", correct: false },
            { label: "Los dict son más rápidos para búsquedas", correct: false },
          ],
          explanation: "No son equivalentes y un `set` NO admite duplicados. Pensá qué guarda cada uno: uno pares clave-valor (`{'a': 1}`), el otro solo valores únicos (`{1, 2, 3}`).",
        },
        {
          prompt: "¿Qué hace el decorador `@property` en Python?",
          options: [
            { label: "Convierte un método en un atributo accesible sin paréntesis, con lógica getter/setter", correct: true },
            { label: "Marca una función como privada", correct: false },
            { label: "Hace que un método sea estático (no accede a self)", correct: false },
            { label: "Cachea el resultado del método para no recalcularlo", correct: false },
          ],
          explanation: "No marca algo como privado, ni estático, ni cachea. Pensá en acceder a `objeto.nombre` (sin paréntesis) pero corriendo por detrás un getter con lógica.",
        },
      ],
      [
        {
          prompt: "¿Qué es un 'generator' en Python y qué ventaja tiene sobre una lista?",
          options: [
            { label: "Una función que usa `yield` para producir valores uno a uno bajo demanda, consumiendo mucha menos memoria", correct: true },
            { label: "Una función que genera código Python automáticamente", correct: false },
            { label: "Un tipo de lista que solo acepta números", correct: false },
            { label: "Una clase que genera instancias de otras clases", correct: false },
          ],
          explanation: "No genera código ni instancias, y no es una lista. La palabra clave es `yield`: produce valores de a uno, bajo demanda, sin cargar todo en memoria.",
        },
        {
          prompt: "¿Qué hace `*args` y `**kwargs` en una función de Python?",
          options: [
            { label: "*args captura argumentos posicionales extra como tupla; **kwargs captura argumentos nombrados extra como dict", correct: true },
            { label: "*args multiplica el primer argumento; **kwargs lo eleva al cuadrado", correct: false },
            { label: "Son exclusivos de funciones de librerías externas", correct: false },
            { label: "*args es para funciones sync; **kwargs para async", correct: false },
          ],
          explanation: "No multiplican nada, no son exclusivos de librerías ni distinguen sync/async. Uno junta los argumentos posicionales de más (como tupla), el otro los nombrados (como dict).",
        },
        {
          prompt: "¿Qué es el GIL (Global Interpreter Lock) en Python?",
          options: [
            { label: "Un mecanismo que permite que solo un thread ejecute bytecode Python a la vez, limitando el paralelismo real", correct: true },
            { label: "Un sistema de seguridad para importar librerías externas", correct: false },
            { label: "La interfaz global para llamar funciones del sistema operativo", correct: false },
            { label: "Un bloqueo de archivos que Python usa para lecturas", correct: false },
          ],
          explanation: "No es seguridad de imports, ni una interfaz al sistema operativo, ni un bloqueo de archivos. Es un 'lock' global: pensá cuántos threads pueden correr bytecode Python a la vez.",
        },
      ],
    ],
  },

  ia_fundamentos: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Qué significa 'entrenar' un modelo de Machine Learning?",
          options: [
            { label: "Ajustar los parámetros del modelo con datos para que aprenda patrones", correct: true },
            { label: "Escribir las reglas del modelo manualmente en código", correct: false },
            { label: "Descargar el modelo desde internet", correct: false },
            { label: "Probarlo con datos de prueba para ver si funciona", correct: false },
          ],
          explanation: "No es escribir reglas a mano, ni descargarlo, ni la fase de prueba (eso es evaluar). Pensá en el proceso donde el modelo, con datos, va ajustando sus parámetros para aprender.",
        },
        {
          prompt: "¿Qué es un LLM (Large Language Model)?",
          options: [
            { label: "Un modelo de IA entrenado con grandes volúmenes de texto para generar y entender lenguaje", correct: true },
            { label: "Un sistema de almacenamiento de documentos de gran tamaño", correct: false },
            { label: "Un lenguaje de programación creado para IA", correct: false },
            { label: "Un servidor especializado en procesar lenguaje de máquina", correct: false },
          ],
          explanation: "No es almacenamiento, ni un lenguaje de programación, ni un servidor. Descifrá la sigla: Large **Language** Model. Pensá qué genera y entiende.",
        },
        {
          prompt: "¿Qué es 'overfitting' (sobreajuste) en un modelo de ML?",
          options: [
            { label: "Cuando el modelo memoriza los datos de entrenamiento y falla con datos nuevos", correct: true },
            { label: "Cuando el modelo es demasiado simple y no aprende nada útil", correct: false },
            { label: "Cuando el modelo tarda demasiado en entrenarse", correct: false },
            { label: "Cuando se usan demasiados datos de entrenamiento", correct: false },
          ],
          explanation: "No es lo contrario (demasiado simple), ni tardar mucho, ni usar muchos datos. 'Over-fit' = ajustarse de más: pensá en memorizar el training y fallar con lo nuevo.",
        },
      ],
      [
        {
          prompt: "¿Cuál es la diferencia entre aprendizaje 'supervisado' y 'no supervisado'?",
          options: [
            { label: "Supervisado usa datos etiquetados con respuestas correctas; no supervisado descubre patrones sin etiquetas", correct: true },
            { label: "Supervisado requiere intervención humana constante; no supervisado es completamente automático", correct: false },
            { label: "Son enfoques equivalentes con diferente terminología", correct: false },
            { label: "No supervisado siempre da mejores resultados que supervisado", correct: false },
          ],
          explanation: "No se trata de cuánta gente interviene, no son equivalentes y ninguno es 'siempre mejor'. La clave está en las etiquetas: ¿los datos vienen con la respuesta correcta o no?",
        },
        {
          prompt: "¿Qué es 'fine-tuning' de un modelo de IA?",
          options: [
            { label: "Continuar el entrenamiento de un modelo pre-entrenado con datos específicos para una tarea particular", correct: true },
            { label: "Ajustar los hiperparámetros manualmente después del entrenamiento", correct: false },
            { label: "Optimizar el código de inferencia para mayor velocidad", correct: false },
            { label: "Reducir el tamaño del modelo sin perder precisión", correct: false },
          ],
          explanation: "No es tocar hiperparámetros, ni acelerar la inferencia, ni achicar el modelo. Pensá en tomar un modelo ya entrenado y seguir entrenándolo con TUS datos para especializarlo.",
        },
        {
          prompt: "¿Qué es el 'contexto' de un LLM?",
          options: [
            { label: "La 'memoria' inmediata: el texto de la conversación que el modelo puede 'ver' para generar su respuesta", correct: true },
            { label: "La base de datos donde el modelo guarda información nueva", correct: false },
            { label: "El servidor donde corre el modelo", correct: false },
            { label: "El idioma principal en que fue entrenado el modelo", correct: false },
          ],
          explanation: "No es una base de datos, ni el servidor, ni el idioma. Pensá en su 'memoria de trabajo': el texto que tiene a la vista en ese momento para responder (con un límite: el context window).",
        },
      ],
      [
        {
          prompt: "¿Qué es la 'temperatura' en un LLM y cómo afecta las respuestas?",
          options: [
            { label: "Controla la aleatoriedad: temperatura baja = respuestas deterministas; alta = más creativas y variadas", correct: true },
            { label: "La velocidad de procesamiento del modelo en inferencia", correct: false },
            { label: "El número de tokens que el modelo puede generar", correct: false },
            { label: "Un parámetro que controla el idioma de la respuesta", correct: false },
          ],
          explanation: "No es velocidad, ni cantidad de tokens, ni idioma. Pensá en el 'calor' como aleatoriedad: baja = repetible y estable, alta = más variada y creativa.",
        },
        {
          prompt: "¿Qué es RAG (Retrieval-Augmented Generation)?",
          options: [
            { label: "Una técnica que combina un LLM con búsqueda en una base de conocimiento para respuestas más precisas", correct: true },
            { label: "Un tipo especial de modelo de lenguaje multimodal", correct: false },
            { label: "Una técnica de compresión de modelos para dispositivos móviles", correct: false },
            { label: "Un protocolo de comunicación entre modelos de IA", correct: false },
          ],
          explanation: "No es un modelo multimodal, ni compresión, ni un protocolo entre modelos. La 'R' es de Retrieval (recuperar): buscás documentos y se los das al modelo como contexto.",
        },
        {
          prompt: "¿Qué son los 'tokens' en el contexto de los LLMs?",
          options: [
            { label: "Las unidades mínimas de texto que procesa el modelo (aprox. 3-4 caracteres o 0.75 palabras en inglés)", correct: true },
            { label: "Las claves de API para autenticar peticiones al modelo", correct: false },
            { label: "Los pesos internos del modelo", correct: false },
            { label: "Las respuestas parciales generadas en streaming", correct: false },
          ],
          explanation: "No son las claves de API, ni los pesos del modelo, ni los fragmentos del streaming. Pensá en las piezas mínimas de texto en que se corta lo que entra y sale (y por las que te facturan).",
        },
      ],
    ],
  },

  ia_prompting: {
    minToPass: 3,
    rounds: [
      [
        {
          prompt: "¿Qué componentes hacen a un buen prompt?",
          options: [
            { label: "Contexto claro, instrucción específica, formato esperado y restricciones", correct: true },
            { label: "Palabras mágicas como 'por favor' y 'necesito que'", correct: false },
            { label: "El mayor texto posible para dar más información al modelo", correct: false },
            { label: "Solo la pregunta directa, sin contexto adicional", correct: false },
          ],
          explanation: "No son 'palabras mágicas', ni escribir lo más largo posible, ni soltar la pregunta pelada. Pensá en darle al modelo contexto, una instrucción clara, el formato esperado y los límites.",
        },
        {
          prompt: "¿Qué es 'chain-of-thought prompting'?",
          options: [
            { label: "Pedirle al modelo que razone paso a paso antes de dar la respuesta final", correct: true },
            { label: "Encadenar varios modelos de IA en secuencia", correct: false },
            { label: "Usar el historial de conversación anterior en el prompt actual", correct: false },
            { label: "Dividir un prompt largo en varios más cortos", correct: false },
          ],
          explanation: "No es encadenar varios modelos, ni reusar el historial, ni partir el prompt. 'Chain of thought' = cadena de pensamiento: pensá en pedirle que razone paso a paso antes de responder.",
        },
        {
          prompt: "¿Cuál es una buena práctica al integrar IA en un producto en producción?",
          options: [
            { label: "Validar y filtrar el output del modelo antes de mostrarlo al usuario", correct: true },
            { label: "Confiar siempre en la respuesta del modelo sin revisión", correct: false },
            { label: "Mostrar el prompt completo al usuario para transparencia", correct: false },
            { label: "Usar el modelo más grande disponible siempre, sin importar el costo", correct: false },
          ],
          explanation: "No es confiar a ciegas, ni exponer el prompt, ni usar siempre el modelo más caro. Como los LLM pueden alucinar, pensá qué hacer con su salida ANTES de mostrarla al usuario.",
        },
      ],
      [
        {
          prompt: "¿Qué es 'few-shot prompting'?",
          options: [
            { label: "Incluir ejemplos del input-output esperado en el prompt para guiar al modelo", correct: true },
            { label: "Usar el menor texto posible en el prompt para reducir costos", correct: false },
            { label: "Dividir un prompt complejo en varios prompts más pequeños", correct: false },
            { label: "Una técnica que solo funciona con modelos pequeños", correct: false },
          ],
          explanation: "No es 'menos texto', ni partir el prompt, ni algo solo de modelos chicos. 'Few-shot' = unos pocos... ejemplos: pensá en mostrarle casos de entrada y salida para guiarlo.",
        },
        {
          prompt: "¿Qué es un 'system prompt' y para qué se usa?",
          options: [
            { label: "Instrucciones persistentes que definen el comportamiento, rol y restricciones del modelo en toda la conversación", correct: true },
            { label: "El primer mensaje del usuario en la conversación", correct: false },
            { label: "Un prompt automático que genera la IA para sí misma", correct: false },
            { label: "Las instrucciones de seguridad integradas por el proveedor del modelo", correct: false },
          ],
          explanation: "No es el primer mensaje del usuario, ni algo que la IA se genera sola, ni las reglas del proveedor. Pensá en instrucciones 'de sistema' que fijan rol y límites durante toda la charla.",
        },
        {
          prompt: "¿Qué es 'prompt injection' y por qué es un riesgo de seguridad?",
          options: [
            { label: "Cuando input malicioso intenta sobreescribir las instrucciones del system prompt para manipular al modelo", correct: true },
            { label: "Un error de programación al formatear el prompt como string", correct: false },
            { label: "Una técnica para hacer el prompt más eficiente", correct: false },
            { label: "La inserción automática de contexto en el prompt", correct: false },
          ],
          explanation: "No es un error de formatear strings, ni una técnica de eficiencia, ni inserción de contexto. 'Injection' como ataque: pensá en un input que intenta pisar las instrucciones del sistema.",
        },
      ],
      [
        {
          prompt: "¿Qué estrategia usarías para que un LLM produzca JSON estructurado de forma confiable?",
          options: [
            { label: "Definir el schema JSON esperado en el prompt + usar los modos de 'structured output' del API si están disponibles", correct: true },
            { label: "Pedirle al modelo que escriba código Python para generar el JSON", correct: false },
            { label: "Solo es posible con fine-tuning específico para JSON", correct: false },
            { label: "Los LLMs no pueden producir JSON confiablemente", correct: false },
          ],
          explanation: "No hace falta pedirle código Python, ni fine-tuning, y sí es posible de forma confiable. Pensá en darle el schema esperado y usar los modos de salida estructurada del API (y validar después).",
        },
        {
          prompt: "¿Qué es 'grounding' en el contexto de prompting?",
          options: [
            { label: "Anclar las respuestas del modelo a fuentes o datos concretos para reducir alucinaciones", correct: true },
            { label: "La técnica de usar el mismo prompt en múltiples modelos para comparar", correct: false },
            { label: "Un parámetro que controla la longitud de la respuesta", correct: false },
            { label: "El proceso de traducir prompts a inglés para mayor precisión", correct: false },
          ],
          explanation: "No es comparar modelos, ni controlar el largo, ni traducir a inglés. 'Ground' = anclar al suelo: pensá en atar la respuesta a fuentes concretas para reducir alucinaciones (RAG es un ejemplo).",
        },
        {
          prompt: "¿Qué pasa cuando el input del usuario supera el 'context window' del modelo?",
          options: [
            { label: "El contexto más antiguo se trunca o el API devuelve un error; hay que dividir el contenido", correct: true },
            { label: "El modelo expande su contexto automáticamente", correct: false },
            { label: "La respuesta se genera con la información disponible sin indicar el problema", correct: false },
            { label: "El modelo guarda el resto en memoria para la próxima conversación", correct: false },
          ],
          explanation: "El modelo no expande su ventana solo, ni guarda el sobrante para después. Pensá qué pasa cuando ya no entra: o se recorta lo más viejo o el API falla — por eso conviene dividir el contenido.",
        },
      ],
    ],
  },
};

export const RESOURCES_DATA: Record<string, Resource[]> = {
  terminal: [
    { kind: "web", title: "Fundamentos de la línea de comandos — MDN", url: "https://developer.mozilla.org/es/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Command_line", description: "Guía introductoria de MDN en español." },
    { kind: "web", title: "Command Line Crash Course — The Odin Project", url: "https://www.theodinproject.com/lessons/foundations-command-line-basics", description: "Ejercicios prácticos guiados." },
    { kind: "web", title: "The Missing Semester — MIT", url: "https://missing.csail.mit.edu/2020/shell-tools/", description: "Curso de MIT sobre herramientas que no te enseñan en la carrera." },
    { kind: "video", title: "Curso de Terminal y Línea de Comandos", url: "https://www.youtube.com/watch?v=Pi0KVD4xTbc", channel: "Fazt", description: "Desde cero: navegación, archivos, permisos y más." },
    { kind: "video", title: "Linux Command Line Full Course", url: "https://www.youtube.com/watch?v=ZtqBQ68cfJc", channel: "freeCodeCamp", description: "Curso completo en inglés, subtítulos disponibles." },
  ],
  git: [
    { kind: "web", title: "Pro Git — Libro oficial (gratis)", url: "https://git-scm.com/book/es/v2", description: "La referencia definitiva de Git, en español." },
    { kind: "web", title: "Learn Git Branching — interactivo", url: "https://learngitbranching.js.org/?locale=es_AR", description: "Visualizá las ramas y merges de forma interactiva." },
    { kind: "web", title: "Documentación de Git — GitHub Docs", url: "https://docs.github.com/es/get-started/using-git/about-git", description: "Guía de inicio rápido de GitHub." },
    { kind: "video", title: "Git y GitHub desde Cero", url: "https://www.youtube.com/watch?v=HiXLkL42tMU", channel: "Fazt", description: "Aprende Git y GitHub con ejemplos prácticos." },
    { kind: "video", title: "Git in 100 Seconds", url: "https://www.youtube.com/watch?v=hwP7WQkmECE", channel: "Fireship", description: "La esencia de Git explicada en tiempo récord." },
  ],
  htmlcss: [
    { kind: "web", title: "Aprende HTML — MDN Web Docs", url: "https://developer.mozilla.org/es/docs/Learn/HTML", description: "La referencia de HTML más completa y en español." },
    { kind: "web", title: "Aprende CSS — MDN Web Docs", url: "https://developer.mozilla.org/es/docs/Learn/CSS", description: "Desde selectores hasta Flexbox y Grid." },
    { kind: "web", title: "CSS-Tricks — Guía completa de Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", description: "El recurso más consultado sobre Flexbox en la web." },
    { kind: "video", title: "HTML y CSS desde Cero — Curso Completo", url: "https://www.youtube.com/watch?v=rr65oLn4i5k", channel: "Fazt", description: "HTML y CSS desde el principio hasta construir tu primera web." },
    { kind: "video", title: "CSS in 100 Seconds", url: "https://www.youtube.com/watch?v=OEV8gMkCHXQ", channel: "Fireship", description: "Fundamentos de CSS condensados. Ideal para repasar." },
  ],
  javascript: [
    { kind: "web", title: "JavaScript.info — El tutorial moderno de JS", url: "https://javascript.info/", description: "Desde lo básico hasta temas avanzados con ejercicios." },
    { kind: "web", title: "Aprende JavaScript — MDN", url: "https://developer.mozilla.org/es/docs/Learn/JavaScript", description: "Guía oficial en español de Mozilla." },
    { kind: "web", title: "Eloquent JavaScript — Libro gratis", url: "https://eloquentjavascript.net/", description: "Uno de los mejores libros para entender JS en profundidad." },
    { kind: "video", title: "Aprender JavaScript — Curso Completo", url: "https://www.youtube.com/watch?v=ivdTnPl1ND0", channel: "midudev", description: "Curso completo de JS en español, actualizado y práctico." },
    { kind: "video", title: "JavaScript in 100 Seconds", url: "https://www.youtube.com/watch?v=DHjqpvDnNGE", channel: "Fireship", description: "Los conceptos clave de JS en menos de 2 minutos." },
  ],
  react: [
    { kind: "web", title: "react.dev — Documentación oficial", url: "https://react.dev/learn", description: "La nueva docs oficial con ejemplos interactivos." },
    { kind: "web", title: "React — The Odin Project", url: "https://www.theodinproject.com/paths/full-stack-javascript/courses/react", description: "Curso guiado con proyectos reales." },
    { kind: "web", title: "Thinking in React", url: "https://react.dev/learn/thinking-in-react", description: "La guía conceptual más importante para entender React." },
    { kind: "video", title: "Aprende React desde Cero — Curso", url: "https://www.youtube.com/watch?v=7iobxzd_2wY", channel: "midudev", description: "Todo lo esencial de React moderno con hooks." },
    { kind: "video", title: "React in 100 Seconds", url: "https://www.youtube.com/watch?v=Tn6-PIqc4UM", channel: "Fireship", description: "Qué es React y por qué importa, en tiempo récord." },
  ],
  typescript: [
    { kind: "web", title: "TypeScript para principiantes — Docs oficiales", url: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html", description: "TypeScript en 5 minutos." },
    { kind: "web", title: "TypeScript Handbook completo", url: "https://www.typescriptlang.org/docs/handbook/intro.html", description: "La referencia oficial y completa." },
    { kind: "web", title: "Total TypeScript — Matt Pocock", url: "https://www.totaltypescript.com/tutorials", description: "Tutoriales prácticos de nivel intermedio/avanzado." },
    { kind: "video", title: "TypeScript — Curso desde Cero", url: "https://www.youtube.com/watch?v=fUgxxhI_bvc", channel: "midudev", description: "Aprende TypeScript con ejemplos reales de proyectos." },
    { kind: "video", title: "TypeScript in 100 Seconds", url: "https://www.youtube.com/watch?v=zQnBQ4tB3ZA", channel: "Fireship", description: "El concepto de tipos explicado brevemente." },
  ],
  nextjs: [
    { kind: "web", title: "Next.js Learn — Tutorial oficial", url: "https://nextjs.org/learn", description: "Construís una app completa paso a paso." },
    { kind: "web", title: "Documentación de Next.js", url: "https://nextjs.org/docs", description: "Referencia completa del App Router y todas las APIs." },
    { kind: "web", title: "Next.js por Vercel — Templates", url: "https://vercel.com/templates/next.js", description: "Templates de producción para distintos casos de uso." },
    { kind: "video", title: "Next.js 15 App Router — Curso Completo", url: "https://www.youtube.com/watch?v=jMy4pVZMyLM", channel: "midudev", description: "App Router, Server Components y todo lo nuevo de Next.js 15." },
    { kind: "video", title: "Next.js in 100 Seconds", url: "https://www.youtube.com/watch?v=Sklc_fQBmcs", channel: "Fireship", description: "Qué hace especial a Next.js, explicado al grano." },
  ],
  tailwind: [
    { kind: "web", title: "Documentación oficial de Tailwind CSS", url: "https://tailwindcss.com/docs", description: "Buscá cualquier clase con Ctrl+K. Siempre actualizada." },
    { kind: "web", title: "Tailwind UI — Componentes de ejemplo", url: "https://tailwindui.com/components", description: "Inspiración visual con componentes bien construidos." },
    { kind: "web", title: "Play CDN — Probá Tailwind en el navegador", url: "https://play.tailwindcss.com/", description: "Sandbox oficial sin necesidad de instalar nada." },
    { kind: "video", title: "Tailwind CSS desde Cero — Curso", url: "https://www.youtube.com/watch?v=tS7upsfuxmo", channel: "Fazt", description: "Aprende Tailwind construyendo componentes reales." },
    { kind: "video", title: "Tailwind in 100 Seconds", url: "https://www.youtube.com/watch?v=mr15Xzb1Ook", channel: "Fireship", description: "La lógica de utility-first explicada en un minuto." },
  ],
  nodejs: [
    { kind: "web", title: "Introducción a Node.js — Docs oficiales", url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", description: "Qué es Node, cómo funciona el Event Loop y primeros pasos." },
    { kind: "web", title: "The Odin Project — NodeJS Path", url: "https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs", description: "Curso completo con proyectos: Express, DBs, auth y más." },
    { kind: "web", title: "Node.js Best Practices — GitHub", url: "https://github.com/goldbergyoni/nodebestpractices", description: "Lista curada de mejores prácticas para proyectos reales." },
    { kind: "video", title: "Node.js y Express — Curso Completo", url: "https://www.youtube.com/watch?v=i3OdKwuBjeM", channel: "Fazt", description: "Backend con Node y Express desde cero en español." },
    { kind: "video", title: "Node.js in 100 Seconds", url: "https://www.youtube.com/watch?v=ENrzD9HAZK4", channel: "Fireship", description: "El Event Loop y la arquitectura non-blocking, al grano." },
  ],
  apis: [
    { kind: "web", title: "REST API Design Best Practices — freeCodeCamp", url: "https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/", description: "Diseño de endpoints RESTful con ejemplos reales." },
    { kind: "web", title: "HTTP — MDN Web Docs", url: "https://developer.mozilla.org/es/docs/Web/HTTP", description: "Todo sobre métodos, códigos de estado, headers y más." },
    { kind: "web", title: "Postman Learning Center", url: "https://learning.postman.com/docs/getting-started/introduction/", description: "Cómo testear y documentar APIs con Postman." },
    { kind: "video", title: "APIs REST — Curso desde Cero", url: "https://www.youtube.com/watch?v=P2iCMEpEBdk", channel: "Fazt", description: "Cómo diseñar y consumir APIs REST con ejemplos prácticos." },
    { kind: "video", title: "RESTful APIs in 100 Seconds", url: "https://www.youtube.com/watch?v=-MTSQjw5DrM", channel: "Fireship", description: "Los conceptos REST esenciales condensados." },
  ],
  supabase: [
    { kind: "web", title: "Supabase Docs — Inicio rápido", url: "https://supabase.com/docs/guides/getting-started", description: "De cero a proyecto funcionando en minutos." },
    { kind: "web", title: "Supabase Auth — Guía completa", url: "https://supabase.com/docs/guides/auth", description: "Email, OAuth, magic links y manejo de sesiones." },
    { kind: "web", title: "Row Level Security en Supabase", url: "https://supabase.com/docs/guides/database/postgres/row-level-security", description: "Aprende a escribir políticas RLS para asegurar tus datos." },
    { kind: "video", title: "Supabase in 100 Seconds", url: "https://www.youtube.com/watch?v=zBZgdTb-dns", channel: "Fireship", description: "Qué es Supabase y por qué reemplaza a Firebase." },
    { kind: "video", title: "Supabase Tutorial — Auth, DB y Storage", url: "https://www.youtube.com/watch?v=dU7GwCOgvNY", channel: "Traversy Media", description: "Proyecto completo con auth, base de datos y storage." },
  ],
  postgres: [
    { kind: "web", title: "PostgreSQL Tutorial — postgresqltutorial.com", url: "https://www.postgresqltutorial.com/", description: "Tutorial paso a paso con ejercicios prácticos." },
    { kind: "web", title: "Documentación oficial de PostgreSQL", url: "https://www.postgresql.org/docs/current/", description: "La referencia completa y oficial." },
    { kind: "web", title: "Use The Index, Luke — Optimización de queries", url: "https://use-the-index-luke.com/", description: "Aprende a usar índices y escribir queries eficientes." },
    { kind: "video", title: "PostgreSQL para Principiantes — Curso", url: "https://www.youtube.com/watch?v=qw--VYLpxG4", channel: "freeCodeCamp", description: "Curso completo de PostgreSQL en inglés con subtítulos." },
    { kind: "video", title: "PostgreSQL in 100 Seconds", url: "https://www.youtube.com/watch?v=n2Fluyr3lbc", channel: "Fireship", description: "Por qué Postgres es la base de datos favorita de los devs." },
  ],
  sql: [
    { kind: "web", title: "SQLZoo — SQL interactivo", url: "https://sqlzoo.net/wiki/SQL_Tutorial", description: "Practicá SQL directamente en el navegador con datasets reales." },
    { kind: "web", title: "SQL Tutorial — W3Schools", url: "https://www.w3schools.com/sql/", description: "Referencia rápida con ejemplos para cada cláusula." },
    { kind: "web", title: "Mode Analytics SQL Tutorial", url: "https://mode.com/sql-tutorial/", description: "SQL enfocado en análisis de datos con datasets de ejemplo." },
    { kind: "video", title: "SQL desde Cero — Curso Completo", url: "https://www.youtube.com/watch?v=OqjJjpjDRLc", channel: "Fazt", description: "Aprende SQL con ejemplos prácticos en español." },
    { kind: "video", title: "SQL in 100 Seconds", url: "https://www.youtube.com/watch?v=zsjvFFKOm3c", channel: "Fireship", description: "Los conceptos core de SQL en tiempo récord." },
  ],
  python: [
    { kind: "web", title: "Tutorial oficial de Python", url: "https://docs.python.org/es/3/tutorial/", description: "El tutorial oficial, en español." },
    { kind: "web", title: "Python.org — Guía para principiantes", url: "https://www.python.org/about/gettingstarted/", description: "Por dónde empezar según tu perfil." },
    { kind: "web", title: "Real Python — Tutoriales prácticos", url: "https://realpython.com/", description: "Artículos y proyectos para todo nivel, muy bien explicados." },
    { kind: "video", title: "Aprende Python — Curso Completo para Principiantes", url: "https://www.youtube.com/watch?v=DLikpfc64cA", channel: "freeCodeCamp Español", description: "Curso completo de Python en español desde cero." },
    { kind: "video", title: "Python in 100 Seconds", url: "https://www.youtube.com/watch?v=x7X9w_GIm1s", channel: "Fireship", description: "La filosofía de Python y sus casos de uso, rápido." },
  ],
  ia_fundamentos: [
    { kind: "web", title: "Machine Learning Crash Course — Google", url: "https://developers.google.com/machine-learning/crash-course", description: "Curso gratuito de Google con TensorFlow. Conceptos clave de ML." },
    { kind: "web", title: "Fast.ai — Practical Deep Learning", url: "https://course.fast.ai/", description: "Curso top-down: empezás con resultados y vas entendiendo la teoría." },
    { kind: "web", title: "Anthropic — Investigación sobre LLMs", url: "https://www.anthropic.com/research", description: "Papers e investigaciones sobre LLMs de los creadores de Claude." },
    { kind: "video", title: "Machine Learning in 100 Seconds", url: "https://www.youtube.com/watch?v=aircAruvnKk", channel: "Fireship", description: "Redes neuronales y aprendizaje automático explicados visualmente." },
    { kind: "video", title: "Inteligencia Artificial para Programadores", url: "https://www.youtube.com/watch?v=KxGRhd_iWuE", channel: "midudev", description: "Cómo integrar IA en tus proyectos de programación." },
  ],
  ia_prompting: [
    { kind: "web", title: "Prompt Engineering Guide — Anthropic", url: "https://docs.anthropic.com/es/docs/build-with-claude/prompt-engineering/overview", description: "La guía oficial de Anthropic para escribir prompts efectivos con Claude." },
    { kind: "web", title: "Prompt Engineering Guide — DAIR.AI", url: "https://www.promptingguide.ai/es", description: "Guía completa en español: técnicas, patrones y casos de uso." },
    { kind: "web", title: "OpenAI Prompt Engineering Guide", url: "https://platform.openai.com/docs/guides/prompt-engineering", description: "Mejores prácticas aplicables a cualquier LLM." },
    { kind: "video", title: "Prompt Engineering — Full Course", url: "https://www.youtube.com/watch?v=_ZvnD73m40o", channel: "freeCodeCamp", description: "Técnicas de prompting desde básico hasta avanzado." },
    { kind: "video", title: "Prompt Engineering Tips para Devs", url: "https://www.youtube.com/watch?v=jC4v5AS4RIM", channel: "Fireship", description: "Patrones prácticos de prompting para integrar IA en código." },
  ],
};
