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
