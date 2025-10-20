import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Environment variables for different modes
    __APP_MODE__: JSON.stringify(mode),
    __IS_DEV__: mode === 'development',
    __IS_STAGING__: mode === 'staging',
    __IS_PROD__: mode === 'production',
  },
  build: {
    // Production optimizations
    minify: mode === 'production' ? 'terser' : 'esbuild',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Remove console.log statements in production
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast', '@radix-ui/react-accordion'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          utils: ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          icons: ['lucide-react'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    sourcemap: mode !== 'production',
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
