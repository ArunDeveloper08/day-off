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
  // server: {
  //   host: true, // Enables access via local IP
  //   open: false, // Prevents automatic opening of the browser
  // },
  // server: {
  //   host: '0.0.0.0',
  //   port: 3000, // Change the port to 3000
  //   open: false,
  // },
  

  
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
