import { LoginModel } from './domain/LoginModel.js';
import { ComplexModel } from './domain/ComplexModel.js';

export async function* demoLogin() {
    yield {
        type: 'show',
        level: 'info',
        message: 'Welcome to the Login Sandbox!'
    };

    const response = yield {
        type: 'ask',
        field: 'credentials',
        schema: LoginModel,
        model: true,
        message: 'Please enter your credentials'
    };

    yield {
        type: 'show',
        level: 'success',
        message: `Successfully logged in as ${response.value.username}`
    };

    return { data: response.value };
}

export async function* demoError() {
    yield {
        type: 'show',
        level: 'error',
        message: 'Critical failure detected in the database connection. Please contact support.'
    };
}

export async function* demoProgress() {
    yield {
        type: 'progress',
        message: 'Initializing system...',
        value: 10,
        total: 100
    };

    // Імітація роботи (у браузері використовуємо setTimeout)
    await new Promise(r => globalThis.setTimeout ? globalThis.setTimeout(r, 500) : r());

    yield {
        type: 'progress',
        message: 'Loading sandbox components...',
        value: 42,
        total: 100
    };

    await new Promise(r => globalThis.setTimeout ? globalThis.setTimeout(r, 500) : r());

    yield {
        type: 'progress',
        message: 'Finishing up...',
        value: 100,
        total: 100
    };

    yield {
        type: 'show',
        level: 'success',
        message: 'System loaded successfully'
    };
}

export async function* demoComplex() {
    const response = yield {
        type: 'ask',
        field: 'profile',
        schema: ComplexModel,
        model: true,
        message: 'Please complete your complex profile'
    };

    yield {
        type: 'show',
        level: 'success',
        message: `Profile saved for ${response.value.fullName} (Role: ${response.value.role})`
    };
}

export async function* demoComponents() {
    yield {
        type: 'render',
        component: 'all_elements',
        data: {}
    };
}

export const DEMO_MAP = {
    login: demoLogin,
    error: demoError,
    progress: demoProgress,
    complex: demoComplex,
    components: demoComponents
};
