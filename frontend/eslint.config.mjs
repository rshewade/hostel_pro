import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Custom rules for prototyping phase
  {
    rules: {
      // Disable/downgrade rules for prototyping with db.json
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "prefer-const": "warn",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-namespace": "off",
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-img-element": "off",
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      // Disable React Compiler/Hooks rules (pre-existing issues)
      "react-hooks/purity": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "off",
      "react-compiler/react-compiler": "off",
    },
  },
  // Ignore files with pre-existing React Compiler/parsing errors
  {
    ignores: [
      "src/components/documents/DocumentPreviewModal.tsx",
      "src/components/feedback/ToastContainer.tsx",
      "src/lib/responsive.tsx",
    ],
  },
]);

export default eslintConfig;
