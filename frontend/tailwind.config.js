/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ========================================
        // MODO CLARO — base IVORY + EMERALD
        // ========================================
        claro: {
          primario: '#1C3B34',   
          hover: '#152D27',     
          tinte: '#E4D9C4',    
          acento: '#261211',     
          fondo: '#F6EADA',     
          tarjeta: '#FBF3E8',   
          borde: '#E0D2BC',     
          texto: '#101010',      
          texto2: '#5A5350',  
        },

        // ========================================
        // MODO OSCURO — base CHARCOAL + EMERALD claro
        // ========================================
        oscuro: {
          primario: '#5FA695',   
          hover: '#4A8C7C',      
          tinte: '#1C3B34',      
          acento: '#8A5A57',    
          fondo: '#101010',      
          tarjeta: '#1A1A1A',   
          borde: '#2A2A2A',      
          texto: '#F6EADA',      
          texto2: '#A09A8E',     
        }
      }
    },
  },
  plugins: [],
}