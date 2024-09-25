import globals from "globals";
import tseslint from "typescript-eslint";


export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.browser } },
    ...tseslint.configs.recommended,
    { ignores: ["dist/**/*", "node_modules/**/*"] },
    {
        settings: {
            'import/resolver': {
                typescript: {} // Cấu hình để sử dụng TypeScript resolver
            }
        },
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": "error", // Bật quy tắc này cho các hàm
            "@typescript-eslint/explicit-function-return-type": "error", // Bật quy tắc cho các hàm
            "@typescript-eslint/no-inferrable-types": "error", // Yêu cầu khai báo kiểu cho các biến
            "@typescript-eslint/no-explicit-any": "error", // Cấm sử dụng kiểu any
        },
    },
];