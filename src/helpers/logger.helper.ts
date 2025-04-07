/**
 * Override console methods in production
 */
export const setupLogger = (): void => {
    if (process.env.NODE_ENV === 'production') {
        // Save original console methods
        const originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
        };

        console.log = () => {};
        console.info = () => {};
        
        console.warn = (...args) => originalConsole.warn.apply(console, args);
        console.error = (...args) => originalConsole.error.apply(console, args);
    }
}; 