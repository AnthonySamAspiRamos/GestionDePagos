# 🎨 Diseño e Interfaz

Tu trabajo será mejorar el diseño visual del frontend. Los archivos que te importan son:

### 📄 Archivos principales a modificar

| Archivo                                      | Qué hace                                            |
| -------------------------------------------- | --------------------------------------------------- |
| `frontend/src/index.css`                     | Variables de color, tipografía global, estilos base |
| `frontend/src/styles/`                       | Estilos específicos por sección                     |
| `frontend/src/components/landing/Hero.tsx`   | Sección principal de la página de inicio            |
| `frontend/src/components/landing/Navbar.tsx` | Barra de navegación                                 |
| `frontend/src/components/landing/Footer.tsx` | Pie de página                                       |
| `frontend/src/pages/Home.tsx`                | Página de inicio completa                           |
| `frontend/src/pages/Dashboard.tsx`           | Panel de administración                             |

### 🎨 Paleta de colores actual (en `index.css`)

```css
:root {
  --color-primary: #1c3b34;
  --color-bg: #101010;
  --color-surface: #1a1a1a;
  --color-accent: #f6eada;
  --color-text: #e8e0d5;
}
```

### ⚠️ Reglas de diseño a respetar

1. **No cambiar** nombres de componentes ni rutas de importación (rompe otras cosas).
2. **No borrar** los props ni funciones que ya tienen los componentes.
3. Solo agregar/modificar **estilos CSS** y **estructura HTML/JSX visual**.
4. Si agregas nuevas imágenes, guardarlas en `frontend/src/assets/`.
