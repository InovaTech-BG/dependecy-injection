# Dependency Injection

![GitHub Repo stars](https://img.shields.io/github/stars/InovaTech-BG/dependecy-injection)
![NPM Downloads](https://img.shields.io/npm/d18m/%40inovatechbg%dependecy-injection)

## What is Dependency Injection?

Dependency Injection is a design pattern that allows us to remove the hard-coded dependencies and make our application loosely coupled, extendable and maintainable. We can implement dependency injection to move the dependency resolution from compile-time to runtime.

## Why Dependency Injection?

Dependency Injection is a way to achieve Inversion of Control (IoC). It is a way to remove the hard-coded dependencies and make our application loosely coupled, extendable and maintainable. It is a way to achieve loose coupling between objects and their dependencies.

# Installation

```bash
npm install @inovatechbg/dependency-injection
```

```bash
yarn add @inovatechbg/dependency-injection
```

```bash
pnpm add @inovatechbg/dependency-injection
```

# Usage

The `@inovatechbg/dependency-injection` package provides a `Container` class that can be used to register and resolve dependencies.

## Registering Dependencies

### Abstract Classes

To use the library, first, you need to create abstract classes for your dependencies. These abstract classes will be used to assign concrete implementations to them.

```typescript
// repositories/user.repository.ts
export abstract class UserRepository {
  abstract getUser(id: number): Promise<User>;
}
```
### Concrete Implementations

You also need to create concrete implementations of these abstract classes.

```typescript
// repositories/user.in-memory.repository.ts
import { UserRepository } from './user.repository';

export class UserInMemoryRepository implements UserRepository {
  async getUser(id: number): Promise<User> {
    return { id, name: 'John Doe' };
  }
}
```

### Registering Dependencies

After creating the abstract classes and lest one concrete implementation, you can register the dependencies in the container.

To register a dependency, by default, you can create a file with extension `.injects.ts`. You can create how many file you want, but the name must be with `.injects.ts` extension (you can change this in [configuration](#configuration)).

In this file, you must export as default an call for `dependecy.registerFactory` method.

```typescript
// repositories.injects.ts
import { dependency } from '@inovatechbg/dependency-injection';
import { UserRepository } from './repositories/user.repository';
import { UserInMemoryRepository } from './repositories/user.in-memory.repository';

export default dependency.registerFactory((container) => {
  container.register(UserRepository, UserInMemoryRepository).transient();
});
```

## Scopes

The library supports three types of scopes:
- `transient`: A new instance of the dependency is created every time it is resolved.
- `singleton`: A single instance of the dependency is created and shared across the application.
- `scoped`: A single instance of the dependency is created per scope.

To specify the scope of a dependency, you can use the `transient`, `singleton`, or `scoped` method after registering the dependency.

```typescript
container.register(UserRepository, UserInMemoryRepository).transient();

container.register(UserRepository, UserInMemoryRepository).singleton();

container.register(UserRepository, UserInMemoryRepository).scoped();
```

## Configuration

The library provides a way to configure the injection loader.
In the core of your application, you must call the `loadInjects` method.
As unique param, you must pass an object with the following properties:
- baseDirs: string[] - The base directories where the library will search for the `.injects.ts` files.
- excludeDirs: string[] - The directories that will be excluded from the search. (`node_modules` and `.git` are excluded by default)
- includeExtensions: string[] - The extensions that will be included in the search.
- IncludePatterns: string[] - The patterns that will be included in the search.
- excludeFiles: string[] - The files that will be excluded from the search.

```typescript
import { loadInjects } from '@inovatechbg/dependency-injection';

loadInjects({
  baseDirs: ["."], // dot means the project root
  excludeDirs: ['node_modules'],
  includeExtensions: ['.ts'],
  includePatterns: [new RegExp('*\.injects\.ts')],
  excludeFiles: ['index.ts'],
});
```

## Using Dependencies

After registering the dependencies, you can use the decorators `@Inject` and `@WithDeps` to inject the dependencies into your classes.

```typescript
// services/user.service.ts
import { Inject, WithDeps } from '@inovatechbg/dependency-injection';
import { UserRepository } from '../repositories/user.repository';

@WithDeps()
export class UserService {
  @Inject(UserRepository)
  private userRepository!: UserRepository;

  async getUser(id: number): Promise<User> {
    return this.userRepository.getUser(id);
  }
}
```

### @Inject

The `@Inject` decorator is used to mark a property as a dependency. This decorator does not have effect alone, you must use it with `@WithDeps`.
When you mark a property with `@Inject`, this property will be marked with a reflection metadata key, and the library will resolve the dependency and assign it to the property.

### @WithDeps

The `@WithDeps` decorator is used to mark a class as a class that has dependencies. This decorator does not have effect alone, you must use it with `@Inject`.
When you mark a class with `@WithDeps`, when the class is instantiated, the library will resolve the dependencies and assign them to the properties marked with `@Inject`.

#### Get Scope

You can pass a function as a parameter to `@WithDeps` to get the scope of the class.

This function must have the following signature: `() => string | undefined`.

When the class is instantiated, the library will call this function to get the scope of the class.

```typescript
@WithDeps(() => 'scope-1')
export class UserService {
  @Inject(UserRepository)
  private userRepository!: UserRepository;

  async getUser(id: number): Promise<User> {
    return this.userRepository.getUser(id);
  }
}
```

By default, the library exports a function called `getScopeId`, that returns the scope based on AsyncLocalStorage. (this will be explained in [Scope](#scope)) But you can create your own function, or use an external library created by the community.

## Scope

The library supports scopes. A scope is a way to create a new context for the dependencies. The library provides a way to create a scope and get the scope of a class.

To create a scope, you can use the `runWithScope` method.

This method receives a string to identify the scope and a function that will be executed in the scope.

```typescript
import { runWithScope } from '@inovatechbg/dependency-injection';

runWithScope('scope-1', async () => {
  // Your code here
});
```

To get the scope of a class, you can use the `getScopeId` function.

```typescript
import { getScopeId } from '@inovatechbg/dependency-injection';

console.log(getScopeId());
```

By default, the library uses AsyncLocalStorage to store the scope. But you can create your own scope manager, or use an external library created by the community.

## Clear Container

The library provides a way to clear the container. This method will remove all the dependencies from the container.

```typescript
import { clearContainer } from '@inovatechbg/dependency-injection';

clearContainer();
```

## Example

```typescript
// repositories/user.repository.ts
export abstract class UserRepository {
  abstract getUser(id: number): Promise<User>;
}

// repositories/user.in-memory.repository.ts
import { UserRepository } from './user.repository';

export class UserInMemoryRepository implements UserRepository {
  async getUser(id: number): Promise<User> {
    return { id, name: 'John Doe' };
  }
}

// repositories.injects.ts
import { dependency } from '@inovatechbg/dependency-injection';
import { UserRepository } from './repositories/user.repository';
import { UserInMemoryRepository } from './repositories/user.in-memory.repository';

export default dependency.registerFactory((container) => {
  container.register(UserRepository, UserInMemoryRepository).transient();
});

// services/user.service.ts
import { Inject, WithDeps } from '@inovatechbg/dependency-injection';
import { UserRepository } from '../repositories/user.repository';

@WithDeps()
export class UserService {
  @Inject(UserRepository)
  private userRepository!: UserRepository;

  async getUser(id: number): Promise<User> {
    return this.userRepository.getUser(id);
  }
}

// app.ts
import { loadInjects } from '@inovatechbg/dependency-injection';
import { runWithScope } from '@inovatechbg/dependency-injection';
import { clearContainer } from '@inovatechbg/dependency-injection';
import { UserService } from './services/user.service';

loadInjects({
  baseDirs: ["."],
});

runWithScope('scope-1', async () => {
  const userService = new UserService();
  const user = await userService.getUser(1);
  console.log(user);
});

clearContainer();
```

# Conclusion

This is a simple library that allows you to implement dependency injection in your application. It is a way to remove the hard-coded dependencies and make your application loosely coupled, extendable and maintainable. It is a way to achieve loose coupling between objects and their dependencies.

# Contributing
If you want to contribute to this project, you can fork this repository and create a pull request.

![GitHub contributors](https://img.shields.io/github/contributors/InovaTech-BG/dependecy-injection)

# License

This project is licensed under the MPL-2.0 License - see the [LICENSE](LICENSE) file for details.



