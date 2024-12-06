module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true, // Bật tính năng đo coverage
    coverageDirectory: 'coverage', // Thư mục lưu báo cáo
    coverageReporters: ['text', 'lcov'], // Các loại báo cáo
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/services/*.{js,ts}', // Bao gồm các file cần đo coverage
        '!src/**/*.d.ts',  // Loại trừ file không cần thiết
    ],
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
};
