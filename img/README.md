# Carpeta /img

Contiene los recursos gráficos del prototipo. Ahora mismo son **marcadores de
posición en SVG** (ligeros y sin dependencias) para que la página se vea completa
sin descargar nada.

## Para usar imágenes reales

Sustituye cada archivo **manteniendo el mismo nombre** (puedes cambiar la
extensión a `.jpg` / `.webp` y actualizar la referencia en `index.html` /
`estilos/estilos.css`):

| Archivo            | Uso                        | Tamaño recomendado |
|-------------------|----------------------------|--------------------|
| `logo.svg`         | Emblema de la cabecera     | ~240 × 72          |
| `hero.svg`         | Fondo de la sección héroe  | 1600 × 900 (16:9)  |
| `og-image.svg`     | Previsualización Open Graph | 1200 × 630         |
| `galeria-01..09`   | Rejilla de la galería      | 800 × 600 (4:3)    |

## Categorías de la galería (atributo `data-categoria` en `index.html`)

`entrenamiento` · `normandia` · `holanda` · `bastogne` · `alemania`

> Nota: para Open Graph, en producción conviene exportar `og-image` a PNG/JPG y
> usar una URL absoluta en la etiqueta `<meta property="og:image">`.
