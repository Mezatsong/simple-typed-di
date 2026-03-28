/**
 * Interface for services that require manual cleanup.
 */
export interface Disposable {
    dispose(): void | Promise<void>;
}

type DisposeFn<T> = (instance: T) => void | Promise<void>;
type Constructor<T> =
    | (abstract new (...args: any[]) => T)
    | (new (...args: any[]) => T);

interface Registration<T> {
    type: 'instance' | 'singleton' | 'lazy-singleton' | 'factory';
    factory?: () => T;
    instance?: T;
    disposeCb?: DisposeFn<T>;
}

interface BindOption<T> {
    key?: string;
    dispose?: DisposeFn<T>;
}

const DEFAULT_KEY = 'default';

export class SimpleTypedDI {
    private registry = new Map<any, Registration<any>>();

    // Parent support for the cascading DI pattern
    constructor(private parent?: SimpleTypedDI) {}

    // Faster key generation
    private getMapKey(constructor: Constructor<any>, key: string): any {
        return key === DEFAULT_KEY
            ? constructor
            : `${constructor.name}::${key}`;
    }

    private register<T>(
        constructor: Constructor<T>,
        key: string | null | undefined,
        reg: Registration<T>
    ) {
        this.registry.set(this.getMapKey(constructor, key ?? DEFAULT_KEY), {
            type: reg.type,
            factory: reg.factory,
            instance: reg.instance,
            disposeCb: reg.disposeCb,
        });
    }

    /**
     * Registers an existing object instance.
     */
    addInstance<T>(
        constructor: Constructor<T>,
        instance: T,
        option?: BindOption<T>
    ): void {
        this.register(constructor, option?.key, {
            type: 'instance',
            instance,
            disposeCb: option?.dispose,
        });
    }

    /**
     * Registers a singleton that is instantiated IMMEDIATELY.
     */
    addSingleton<T>(
        constructor: Constructor<T>,
        factory: () => T,
        option?: BindOption<T>
    ): void {
        const instance = factory();

        this.register(constructor, option?.key, {
            type: 'singleton',
            instance,
            disposeCb: option?.dispose,
        });
    }

    /**
     * Registers a singleton that is instantiated only when first requested.
     */
    addLazySingleton<T>(
        constructor: Constructor<T>,
        factory: () => T,
        option?: BindOption<T>
    ): void {
        this.register(constructor, option?.key, {
            type: 'lazy-singleton',
            factory,
            disposeCb: option?.dispose,
        });
    }

    /**
     * Registers a factory that creates a NEW instance on every 'get' call.
     */
    addFactory<T>(
        constructor: Constructor<T>,
        factory: () => T,
        option?: BindOption<T>
    ): void {
        this.register(constructor, option?.key, {
            type: 'factory',
            factory,
            disposeCb: option?.dispose,
        });
    }

    /**
     * Retrieves the resolved service instance.
     */
    get<T>(constructor: Constructor<T>, key: string = DEFAULT_KEY): T {
        const mapKey = this.getMapKey(constructor, key);
        const reg = this.registry.get(mapKey);

        // Recursive lookup: If not found here, check the parent
        if (!reg) {
            if (this.parent) {
                return this.parent.get(constructor, key);
            }

            const withKeyMsg = key != DEFAULT_KEY ? `with key [${key}]` : 'is';

            throw new Error(
                `DI Error: [${constructor.name}] ${withKeyMsg} not registered.`
            );
        }

        // Return existing instance for instance/eager-singleton
        if (reg.type === 'instance' || reg.type === 'singleton') {
            return reg.instance;
        }

        // Resolve and cache for lazy-singleton
        if (reg.type === 'lazy-singleton') {
            // Check for undefined to allow null as a valid instance
            if (reg.instance === undefined) {
                reg.instance = reg.factory!();
                // Memory optimization: drop the factory closure after instantiation
                delete reg.factory;
            }

            return reg.instance;
        }

        // Always create new for factory
        return reg.factory!();
    }

    /**
     * Disposes all registered instances that have a dispose callback
     * or implement the Disposable interface.
     */
    async dispose(): Promise<void> {
        const registrations = this.registry.values();

        for (const reg of registrations) {
            const instance = reg.instance;

            if (!instance) continue;

            try {
                if (reg.disposeCb) {
                    await reg.disposeCb(instance);
                } else if (this.isDisposable(instance)) {
                    await instance.dispose();
                }
            } catch (err) {
                console.error(`DI Error: Failed to dispose an instance.`, err);
            }
        }

        this.registry.clear();
    }

    private isDisposable(obj: any): obj is Disposable {
        return obj && typeof obj.dispose === 'function';
    }
}
