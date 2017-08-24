# ts-perf-logger

## ATTENTION: Some breaking changes were introduced with version 0.2.0:

. @LogClassPerformance() and @LogFunctionPerformance() were merged into @LogPerformance() 
. @DisableLogFunctionPerformance() was renamed to @DisableLogPerformance()
. Observable operator logPerf() was renamed to logPerformance() 


## Installation

To install this library, run:

```bash
$ npm install ts-perf-logger --save
```

## Consuming your library

Once you have installed your library from npm, you can import it in any Typescript application by running:

```typescript
import { PerfLogManager,
         LogPerformance,
         DisableLogPerformance } from 'ts-perf-logger';

```

Once your library is imported, you can use its @Decorators in your application.

Use it with a class decorator:

```typescript
@LogPerformance()
export class AppModule { 
  
  foo() {
    // ... do some work ...
  }

  @DisableLogPerformance()
  bar() {
    // ... do some work ...
  }
  
}
```

or with a method decorator:

```typescript
export class AppModule { 

  @LogPerformance()
  foo() {
    // ... do some work ...
  }

}
```

or using the static logPerfInit() and logPerfEnd() methods:

```typescript
export class AppModule { 

  foo() { 
    PerfLogManager.logPerfInit('foo');
    try {
      // ... do some work ...
      PerfLogManager.logPerfEnd('foo', true);
    } catch (error) {
      PerfLogManager.logPerfEnd('foo', false);
    }
  }

}
```

If you want / need to specify a unique ActionId for a group of method calls you can do so like the following.
If setActionId is set, all subsequent function calls will reference this Id until it is cleared or changed:

```typescript
@LogPerformance()
export class AppModule { 
  
  foo() {
    PerfLogManager.setActionId('action_unique_id');
    // ... do some work, call other functions ...
  }

  @DisableLogPerformance()
  bar() {
    // ... do some work ...
  }
  
}
```

or

```typescript
export class AppModule { 

  constructor() {
    PerfLogManager.setActionId(0);
  }

  @LogPerformance()
  foo() {
    PerfLogManager.setActionId(PerfLogManager.getActionId() + 1);
    // ... do some work, call other functions ...
  }

}
```

or 

```typescript
export class AppModule { 

  foo() { 
    PerfLogManager.logPerfInit('foo', 'my_action_id');
    try {
      // ... do some work, call other functions ...
      PerfLogManager.logPerfEnd('foo', true);
    } catch (error) {
      PerfLogManager.logPerfEnd('foo', false);
    }
  }

}
```

To Log the performance of Observables (from the moment it's subscribed to to the moment it completes - useful for Observables that emit only once and complete like HTTP requests):

```typescript
  usingOperatorOnObservable() {
    this.observable()
    .logPerformance('key')
    .subscribe(() => { /* do something else */ });
  }
```





To get the statistics for all executed methods call: 

```typescript
PerfLogManager.getStatistics()
```

## Development

To generate all `*.js`, `*.d.ts` and `*.metadata.json` files:

```bash
$ npm run build
```

To lint all `*.ts` files:

```bash
$ npm run lint
```

## License

MIT © [Nuno Freire](mailto:nunofcf@gmail.com)
