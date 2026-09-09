# Carpeta /video

Aquí va el archivo del tráiler que se embebe en la sección "Tráiler" de
`index.html`.

## Cómo activarlo

Coloca el archivo con este nombre exacto:

| Archivo           | Uso                                   | Formato recomendado        |
|--------------------|----------------------------------------|-----------------------------|
| `trailer.mp4`      | Vídeo del tráiler (sección Tráiler)    | MP4 (H.264 + AAC), 16:9     |

El `<video>` ya está enlazado a `video/trailer.mp4` en `index.html`
(dentro de `.trailer__marco`). En cuanto el archivo exista en esta
carpeta, el botón de reproducir del tráiler lo cargará y reproducirá
sin necesidad de tocar el HTML.

Si quieres añadir un formato alternativo (por ejemplo `.webm` para
navegadores que no soportan MP4), agrega un segundo `<source>` dentro
del `<video>` en `index.html`:

```html
<video class="trailer__video" data-video-elemento poster="img/hero.jpg" preload="none" controls hidden>
  <source src="video/trailer.webm" type="video/webm" />
  <source src="video/trailer.mp4" type="video/mp4" />
  Tu navegador no admite la reproducción de vídeo.
</video>
```
