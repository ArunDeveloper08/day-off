import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});




 // import { defineConfig } from 'vite';
// import JavaScriptObfuscator from 'javascript-obfuscator';
// export default defineConfig({
//   build: {
//     minify: false, // Turn off default minification
//     rollupOptions: {
//       plugins: [
//         JavaScriptObfuscator({
//           compact: true,
//           controlFlowFlattening: true,
//           deadCodeInjection: true,
//           debugProtection: true,
//           disableConsoleOutput: true,
//         }),
//       ],
//       resolve: {
//             alias: {
//               "@": path.resolve(__dirname, "./src"),
//             },
//            },
//     },
//   },
// });
