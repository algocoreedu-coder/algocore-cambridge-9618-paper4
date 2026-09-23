import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath,URL} from 'node:url';

export default defineConfig({
  plugins:[react()],
  base:'/algocore-chapter13-lab/',
  resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},
  build:{outDir:'dist',sourcemap:false},
  server:{port:5174,strictPort:true},
  preview:{port:4174,strictPort:true},
});
