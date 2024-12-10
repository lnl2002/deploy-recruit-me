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
        '!src/services/roomService.ts', // Loại trừ file roomService.ts
        '!src/services/s3Service.ts',   // Loại trừ file s3Service.ts
    ],
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
};
