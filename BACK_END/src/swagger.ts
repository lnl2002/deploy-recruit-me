import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'RecruitMe API Documentation',
            version: '1.0.0',
            description: 'Swagger documentation for RecruitMe API',
        },
    },
    apis: ['./src/routes/docs/*.ts'], // Đường dẫn tới các file route
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
