export const getLogger = (namespace) => {
  const prefix = `%c[${namespace}] - `;
  const style = 'color: cyan;';

  return {
    info(...args) {
      const arg0 = prefix + args[0];
      const arg1 = style;
      const restArgs = args.slice(1);

      console.log(...[arg0, arg1, ...restArgs]);
    },
  };
};
