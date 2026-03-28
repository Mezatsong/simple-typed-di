import { describe, it, expect, vi } from 'vitest';
import { SimpleTypedDI, Disposable } from './index';

// Mock Classes for testing
class Database {
    connect() {
        return 'connected';
    }
}

class Logger implements Disposable {
    disposed = false;
    async dispose() {
        this.disposed = true;
    }
}

describe('SimpleTypedDI', () => {
    it('should resolve a basic instance', () => {
        const container = new SimpleTypedDI();
        const instance = new Database();
        container.addInstance(Database, instance);

        expect(container.get(Database)).toBe(instance);
    });

    it('should throw an error if dependency is not registered', () => {
        const container = new SimpleTypedDI();
        expect(() => container.get(Database)).toThrow(/not registered/);
    });

    describe('Registration Types', () => {
        it('should handle eager singletons (instantiated immediately)', () => {
            const container = new SimpleTypedDI();
            const factory = vi.fn(() => new Database());

            container.addSingleton(Database, factory);
            expect(factory).toHaveBeenCalledTimes(1); // Called on registration

            const instance1 = container.get(Database);
            const instance2 = container.get(Database);
            expect(instance1).toBe(instance2);
        });

        it('should handle lazy singletons (instantiated on demand)', () => {
            const container = new SimpleTypedDI();
            const factory = vi.fn(() => new Database());

            container.addLazySingleton(Database, factory);
            expect(factory).not.toHaveBeenCalled(); // Not called yet

            const instance1 = container.get(Database);
            const instance2 = container.get(Database);
            expect(factory).toHaveBeenCalledTimes(1);
            expect(instance2).toBe(instance1);
        });

        it('should handle factories (new instance every time)', () => {
            const container = new SimpleTypedDI();
            container.addFactory(Database, () => new Database());

            const instance1 = container.get(Database);
            const instance2 = container.get(Database);
            expect(instance1).not.toBe(instance2);
        });
    });

    describe('Hierarchical Scoping', () => {
        it('should resolve from parent if not in child', () => {
            const parent = new SimpleTypedDI();
            const child = new SimpleTypedDI(parent);
            const instance = new Database();

            parent.addInstance(Database, instance);
            expect(child.get(Database)).toBe(instance);
        });

        it('should allow shadowing (child override)', () => {
            const parent = new SimpleTypedDI();
            const child = new SimpleTypedDI(parent);

            const parentDb = new Database();
            const childDb = new Database();

            parent.addInstance(Database, parentDb);
            child.addInstance(Database, childDb);

            expect(child.get(Database)).toBe(childDb);
            expect(parent.get(Database)).toBe(parentDb);
        });
    });

    describe('Lifecycle Management', () => {
        it('should call dispose() on classes implementing Disposable', async () => {
            const container = new SimpleTypedDI();
            const logger = new Logger();
            container.addInstance(Logger, logger);

            await container.dispose();
            expect(logger.disposed).toBe(true);
        });

        it('should use custom dispose callback if provided', async () => {
            const container = new SimpleTypedDI();
            const db = new Database();
            const disposeSpy = vi.fn();

            container.addInstance(Database, db, { dispose: disposeSpy });

            await container.dispose();
            expect(disposeSpy).toHaveBeenCalledWith(db);
        });

        it('should clear the registry after disposal', async () => {
            const container = new SimpleTypedDI();
            container.addInstance(Database, new Database());

            await container.dispose();
            expect(() => container.get(Database)).toThrow();
        });
    });

    it('should handle and log errors during disposal without crashing', async () => {
        const container = new SimpleTypedDI();

        // 1. Create a "Broken" service that throws on dispose
        const brokenService = {
            dispose: () => {
                throw new Error('Cleanup failed!');
            },
        };

        // 2. Create a "Healthy" service to ensure disposal continues
        const healthyService = new Logger();

        container.addInstance(Object, brokenService);
        container.addInstance(Logger, healthyService);

        // 3. Spy on console.error to verify
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        // 4. Run disposal
        await container.dispose();

        // 5. Assertions
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('DI Error: Failed to dispose an instance.'),
            expect.any(Error)
        );
        expect(healthyService.disposed).toBe(true); // Ensures the loop didn't stop

        consoleSpy.mockRestore(); // Clean up the spy
    });

    it('should skip disposal if a lazy singleton was never instantiated', async () => {
        const container = new SimpleTypedDI();
        const disposeSpy = vi.fn();

        // Register but NEVER call .get()
        container.addLazySingleton(Database, () => new Database(), {
            dispose: disposeSpy,
        });

        await container.dispose();
        expect(disposeSpy).not.toHaveBeenCalled(); // This hits the 'continue' branch
    });

    it('should correctly identify non-disposable objects', () => {
        const container = new SimpleTypedDI();
        // This helper test ensures the internal 'isDisposable' check
        // handles null/undefined/objects without dispose methods
        expect((container as any).isDisposable(null)).toBeFalsy();
        expect((container as any).isDisposable({})).toBeFalsy();
    });
});
