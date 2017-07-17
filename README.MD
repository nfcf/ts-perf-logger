# ts-perf-logger

## Installation

To install this library, run:

```bash
$ npm install ts-perf-logger --save
```

## Consuming your library

Once you have installed your library from npm, you can import it in any Typescript application by running:

```typescript
import { LogClassPerformance,
         LogFunctionPerformance,
         PerfLogManager,
         DisableLogFunctionPerformance } from 'ts-perf-logger';

```

Once your library is imported, you can use its @Decorators in your application:

```typescript
@LogClassPerformance()
export class AppModule { 
  
  foo() { }

  @DisableLogFunctionPerformance()
  bar() { }
  
}
```

or

```typescript
export class AppModule { 

  @LogFunctionPerformance()
  foo() { }

}
```

or 

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
@LogClassPerformance()
export class AppModule { 
  
  foo() {
    PerfLogManager.setActionId('action_unique_id');
  }

  @DisableLogFunctionPerformance()
  bar() { }
  
}
```

or

```typescript
export class AppModule { 

  @LogFunctionPerformance()
  foo() {
    PerfLogManager.setActionId(123);
  }

}
```

or 

```typescript
export class AppModule { 

  foo() { 
    PerfLogManager.logPerfInit('foo', 'my_action_id');
    try {
      // ... do some work ...
      PerfLogManager.logPerfEnd('foo', true);
    } catch (error) {
      PerfLogManager.logPerfEnd('foo', false);
    }
  }

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
